# React 18 自动批处理（Automatic Batching）  
---

## 0. 一句话开胃  
React 18 把「多个 setState 合并成一次渲染」的能力从**React 事件内**扩展到**Promise、setTimeout、原生事件**等所有异步场景，**默认开启、无需改写业务代码**，就叫**自动批处理**（Automatic Batching）。

---

## 1. 基础概念

| 名词 | 一句话解释 |
|---|---|
| **批处理（Batching）** | 将一次事件循环中的多个状态更新合并为单次渲染，减少 DOM 操作。 |
| **自动批处理** | React 18 默认对所有场景（同步+异步）启用批处理，开发者无感知。 |
| **flushSync** | 强制同步刷新，跳出批处理，用于极端场景。 |

---

## 2. 历史对比：React 17 vs 18

| 场景 | React 17 | React 18（自动批处理） | 渲染次数 |
|---|---|---|---|
| 点击按钮里 setState 两次 | ✅ 批处理 | ✅ 继续批处理 | 1 |
| setTimeout 里 setState 两次 | ❌ 两次渲染 | ✅ 批处理成 1 次 | 1 |
| Promise.then 里 setState 两次 | ❌ 两次渲染 | ✅ 批处理成 1 次 | 1 |
| 原生事件回调里 setState 两次 | ❌ 两次渲染 | ✅ 批处理成 1 次 | 1 |

---

## 3. 原理解密：一次事件循环的“魔法”

1. **调用 setState** → React 把更新放入**微任务队列（Queue）**。  
2. **JavaScript 栈空** → 事件循环进入**微任务阶段**。  
3. **React 统一合并** → 将队列里所有更新计算成最终状态。  
4. **一次性提交（commit）** → 只产生一次 DOM 变更。

伪代码：
```js
function setState(newState) {
  updateQueue.push(newState);
  if (!isBatching) {
    isBatching = true;
    scheduleMicrotask(() => {
      processBatch(updateQueue);   // 合并后一次性渲染
      isBatching = false;
    });
  }
}
```

---

## 4. 快速体验：10 行代码看效果

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [flag, setFlag]   = useState(false);

  function handleClick() {
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);      // React 18 会合并
    }, 100);
  }

  console.log('render', count, flag);
  return (
    <button onClick={handleClick}>
      {count} {flag ? 'true' : 'false'}
    </button>
  );
}
```
- **React 17**：控制台打印 2 次  
- **React 18**：控制台打印 1 次（自动批处理生效）

---

## 5. 实战 1：异步表单校验

```jsx
function Form() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = async (e) => {
    const v = e.target.value;
    setValue(v);               // 紧急：输入框必须立即响应
    setLoading(true);          // 进入批处理队列
    const msg = await validate(v); // 异步校验
    setError(msg);             // 仍在同一队列
    setLoading(false);         // 同一队列
    // React 18 会把以上 4 次 setState 合并成 1 次渲染
  };

  return (
    <>
      <input value={value} onChange={onChange} />
      {loading && <Spinner />}
      {error && <ErrorTip>{error}</ErrorTip>}
    </>
  );
}
```
**收益**：输入连续打字不再闪烁，校验弹窗与 loading 图标同时出现，减少 50% 重排。

---

## 6. 实战 2：全局状态批量合并

```jsx
// store.ts
const [user, setUser] = useState(null);
const [theme, setTheme] = useState('light');
const [msgs, setMsgs] = useState([]);

// 登录后一次性赋值
async function bootstrap() {
  const [u, t, m] = await Promise.all([
    fetchUser(),
    fetchTheme(),
    fetchMsgs()
  ]);
  // 以下 3 次 setState 会被自动批处理成 1 次渲染
  setUser(u);
  setTheme(t);
  setMsgs(m);
}
```
**React 17**：3 次渲染 → **React 18**：1 次渲染，界面“三栏齐跳”变“一次到位”。

---

## 7. 跳出批处理：flushSync

> 99% 场景不需要，但调试或第三方库集成时可能用到。

```jsx
import { flushSync } from 'react-dom';

function handleExpensive() {
  flushSync(() => {
    setA(1);   // 立即渲染
  });
  console.log('DOM 已更新'); // 这里能拿到真实 DOM
  flushSync(() => {
    setB(2);   // 再立即渲染
  });
}
```
**注意**：  
- 会强制同步，**可能卡帧**；  
- 无法在 `render` 阶段调用；  
- 仅限客户端，SSR 无此 API。

---

## 8. 常见疑问 Q&A

| 问题 | 回答 |
|---|---|
| **需要写 `React.batch` 吗？** | 不需要，18 默认全局开启。 |
| **会降低 setState 实时性？** | 不会，批处理发生在同一事件循环，用户无感知。 |
| **老项目升级会 break 吗？** | 基本零破坏；唯一注意：若依赖「中间渲染」做 DOM 测量，需改用 `flushSync`。 |
| **测试用例要改吗？** | `@testing-library/react` ≥13 已自动兼容；唯一变化：`act()` 包裹的断言里渲染次数变少。 |

---

## 9. 升级命令 & 校验步骤

```bash
npm i react@^18.3 react-dom@^18.3
```
1. 全局搜索 `ReactDOM.render` → 替换为 `createRoot`。  
2. 跑自动化测试，观察「渲染次数」断言是否减少。  
3. 在 DevTools Profiler 录制一次表单操作，确认 **commit 次数下降**。  
4. 若出现「中间态测量」失败，局部加 `flushSync` 并注释原因。

--------------------------------------------
## 10. 总结
```
自动批处理
├─ 范围：同步 + 异步（Promise/setTimeout/原生事件）
├─ 原理：同一事件循环合并队列
├─ API：默认开启，无需手写
├─ 跳出：flushSync（慎用）
└─ 收益：渲染次数 ↓ 40%，CPU ↓ 30%
```