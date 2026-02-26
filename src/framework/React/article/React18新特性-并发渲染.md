# React 18 并发渲染（Concurrent Rendering）  

---

## 0. 一句话开胃  
React 18 的并发渲染 ≠ 多线程，**是把一次更新拆成可中断、可恢复、可跳帧的小任务**，让高优先级交互（输入、动画）插队，低优先级任务（大数据渲染）在浏览器空闲时再跑，从而「不卡主线程」。

---

## 1. 基础概念速览

| 名词 | 一句话解释 |
|---|---|
| **Fiber** | React 16 引入的双树结构，每个节点对应一个可中断的工作单元。 |
| **时间切片** | 把长任务切成 ≤5 ms 的小片，帧末有空闲就继续，没空就让步。 |
| **Lane 模型** | 用 32 位掩码给更新打优先级标签，位运算比字符串比较快 10×。 |
| **workLoop** | Scheduler 的核心 while 循环：有任务 & 没过期 → 执行；否则中断 → 让出主线程。 |

---------------------------------------------------

## 2. 并发渲染 vs 同步渲染

| 特性 | 同步渲染（React ≤17） | 并发渲染（React 18） |
|---|---|---|
| 更新一旦开始 | 一口气跑到结束 | 可中途打断、继续、丢弃 |
| 用户输入 | 等待渲染完 | 立即响应，渲染被中断 |
| 大数据列表 | 卡到渲染完 | 分片渲染，输入不卡 |
| 代码改动 | 无 | 仅需 `createRoot` 替换 `ReactDOM.render` |

---

## 3. 底层三件套

### 3.1 Fiber 双树
- **current** 树：屏幕正在显示  
- **workInProgress** 树：后台并发构建，完成一次性切换，无闪烁。

### 3.2 Lane 优先级
```js
// 越靠左优先级越高
SyncLane           = 0b00000001  // 用户事件、动画
InputContinuousLane= 0b00000010  // 连续输入
DefaultLane        = 0b00000100  // 普通 setState
TransitionLane     = 0b00001000  // startTransition
IdleLane           = 0b01000000  // 后台、日志
```
React 用位与 `&` 运算判断「当前帧要不要处理」。

### 3.3 时间切片伪代码
```js
function workLoop() {
  while (taskQueue.length > 0 && !shouldYield()) {
    performUnitOfWork(taskQueue.pop());
  }
  if (taskQueue.length > 0) {
    requestIdleCallback(workLoop); // 下帧继续
  }
}
```
`shouldYield()` 在「帧尾剩余时间 < 1 ms」或「更高优先级任务插队」时返回 true。

---

## 4. 开发者可见的 5 把「武器」

| API | 场景 | 口诀 |
|---|---|---|
| **createRoot** | 启用并发 | 一行代码开天地 |
| **startTransition** | 把非紧急更新标记为可中断 | 搜索框打字母，列表不卡 |
| **useTransition** | 同上，但带 `isPending` 加载态 | 给按钮加菊花 |
| **useDeferredValue** | 延迟昂贵渲染 | 输入 hello，只搜一次 |
| **Suspense** | 异步组件+流式 SSR | 先出壳，再填肉 |

---

## 5. 实战 1：搜索框 + 大数据列表

```jsx
function SearchPage() {
  const [query, setQuery]   = useState('');
  const [list, setList]     = useState([]);
  const [isPending, startTransition] = useTransition();

  const onInput = e => {
    const v = e.target.value;
    setQuery(v);                       // 紧急：输入框必须立即显示
    startTransition(() => {            // 非紧急：可以中断
      const filtered = hugeList.filter(item =>
        item.includes(v)
      );
      setList(filtered);
    });
  };

  return (
    <>
      <input value={query} onChange={onInput} />
      {isPending && <Spinner />}       {/* 过渡期间 */}
      <LongList data={list} />
    </>
  );
}
```
**效果**：用户连续输入时，input 始终 60 fps；列表在空闲后一次性刷新，CPU 占用降低 50% 以上。

---

## 6. 实战 2：useDeferredValue 只搜一次

```jsx
function App() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query); // 低优先级副本

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      {/* 昂贵组件用低优先级值 */}
      <ExpensiveSearch query={deferredQuery} />
    </>
  );
}
```
快速输入 **hello** 时，`deferredQuery` 会停在 **h → he → hel → hell → hello** 中的某一步，直到用户停手，再最终匹配一次，避免 5 次 RPC/渲染。

---

## 7. 实战 3：Suspense + 组件级懒加载

```jsx
import { lazy, Suspense } from 'react';
const Chart = lazy(() => import('./HeavyChart'));

<Dashboard>
  <Sidebar />
  <Suspense fallback={<Skeleton />}>
    <Chart />
  </Suspense>
</Dashboard>
```
React 18 在**服务端**也能流式输出：先发送 `<Sidebar/>` 的 HTML，`<Chart/>` 准备好后再追加——浏览器边收边解析，首屏时间缩短 30%。

---

## 8. 性能对比数据

| 场景 | React 17 | React 18 并发 | 提升 |
|---|---|---|---|
| 1000 项列表过滤 | 160 ms 长任务 | 分片后最长 8 ms | 输入延迟 ↓90% |
| 搜索建议首字显示 | 120 ms | 20 ms | ↓83% |
| SSR 首字节 | 等待全部数据 | 流式 HTML | TTFB ↓25% |

---

## 9. 常见坑 & 排查清单

| 坑 | 表现 | 解决 |
|---|---|---|
| 没用 `createRoot` | 并发 API 无效 | 检查入口文件 |
| `startTransition` 里放紧急状态 | 输入仍卡顿 | 把紧急 setState 挪出来 |
| 水合不匹配 | 报错 `Hydration failed` | 避免在 render 里用 `Math.random()` / `Date.now()` |
| 忘了 `Suspense` 边界 | 白屏 + 警告 | 给所有 `lazy` 组件包 `<Suspense>` |

---

## 10. 升级命令 & 兼容性

```bash
npm i react@^18.3 react-dom@^18.3
```
- **最低 Node**：16.8（流式 SSR 需 18+ 更稳）  
- **TypeScript**：≥4.5 已内置新类型  
- **三方库**：Redux ≥8、React Router ≥6.4、Antd ≥5 全部兼容。

---

## 11. 

```
并发渲染
├─ 底层：Fiber + Scheduler + Lane
├─ 表现：时间切片 + 可中断
├─ 开发者 API
│  ├─ createRoot / hydrateRoot
│  ├─ startTransition / useTransition
│  ├─ useDeferredValue
│  └─ Suspense（SSR 流式）
└─ 效果：高优更新插队，低优更新分片
```

掌握并发渲染后，你可以：  
- **不重构业务代码**就让大数据列表、复杂图表、搜索页「秒响应」；  
- **用 Suspense + 流式 SSR**把首屏时间再砍一刀；  
- **为 React 19 的 Offscreen、Server Components** 打好底层认知基础。
