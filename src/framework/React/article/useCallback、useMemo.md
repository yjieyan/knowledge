# useCallback、useMeno
下面给出一份「从入门到精通」的 Markdown 教程，系统梳理 React 两大性能钩子：  
`useCallback` 与 `useMemo`。  
你可以直接复制到 `.md` 文件中使用，也可以按需增删。  

---

# React 性能双雄：useCallback & useMemo  
> 从入门到精通 · 2025 终极版  

---

## 0. 先修知识清单
| 概念 | 一句话速通 |
|---|---|
| 组件渲染流程 | 父组件渲染 → 子组件默认跟着渲染 |
| 引用相等（`===`） | 对象、函数每次渲染都是**新引用** |
| 依赖数组（deps） | `useEffect/useMemo/useCallback` 第二参数，**浅比较**决定“是否重新计算” |
| 闭包 | 函数记住定义时的变量快照，不是最新值 |

---

## 1. 为什么需要缓存？
React 默认**父渲染 → 子渲染**。  
下面代码中，`<Child>` 每次都会重新渲染，即使 `count` 没变：

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const onClick = () => console.log('click'); // 每次渲染都生成新函数
  return <Child onClick={onClick} />;
}
```

**问题根源**：  
1. `onClick` 引用变化 → React 认为 props 变了 → 子组件重渲染。  
2. 如果 `Child` 用 `React.memo` 包过，**引用变化仍会击穿**缓存。

---

## 2. useCallback：缓存“函数”
### 2.1 基础签名
```ts
const fn = useCallback(() => {
  // 逻辑
}, [dep1, dep2]);
```

### 2.2 运行流程（伪代码）
```js
// 首次渲染
memo.set(fn, () => {...})

// 下次渲染
if (prevDeps === deps) return memo.get(fn)
else { 重新创建函数并缓存 }
```

### 2.3 最小可用示例
```jsx
const handleClick = useCallback(() => {
  alert('不会无谓重建');
}, []); // 空依赖 = 永不重建
```

### 2.4 配合 React.memo 实现“子组件跳过渲染”
```jsx
const Child = React.memo(({ onClick }) => {
  console.log('Child 渲染');
  return <button onClick={onClick}>+</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const inc = useCallback(() => setCount(c => c + 1), []);
  return (
    <>
      <Child onClick={inc} />
      <p>{count}</p>
    </>
  );
}
```

### 2.5 易错点：闭包陷阱
```jsx
const [count, setCount] = useState(0);
const log = useCallback(() => console.log(count), []); // 永远打印 0
```
**解决**：把需要读取的**最新值**放到依赖数组，或使用 `setState(fn)` 形式。

---

## 3. useMemo：缓存“值”
### 3.1 基础签名
```ts
const value = useMemo(() => expensiveCompute(a, b), [a, b]);
```

### 3.2 与 useCallback 的关系
```js
useCallback(fn, deps)   ===   useMemo(() => fn, deps)
```
前者是后者的语法糖，只是语义上区分“函数”与“值”。

### 3.3 典型场景
1. 复杂计算  
```jsx
const fib = useMemo(() => fibonacci(n), [n]);
```

2. 避免引用变化导致的子组件重渲染  
```jsx
const options = useMemo(() => [1, 2, 3], []); // 数组引用恒定
return <ReactSelect options={options} />
```

3. 防止 `useEffect` 无谓触发  
```jsx
const params = useMemo(() => ({ id, type }), [id, type]);
useEffect(() => { fetchData(params); }, [params]);
```

---

## 4. 进阶：性能测量与权衡
### 4.1 缓存也有成本
- 内存占用 + 依赖比较开销  
- **React 17 之后**，默认在**首次渲染**就会执行 deps 比较，所以 deps 很长时反而变慢。

### 4.2 快速判断“是否值得缓存”
```bash
# 安装 react-perf-devtool
npm i react-perf-devtool

# 在 chrome 面板查看“渲染耗时”
```
经验法则：  
- 计算 < 1 ms → 不缓存  
- 子组件被多个父级复用 & props 引用频繁变 → 优先缓存  
- 列表渲染 + 选中项回调 → 必缓存

### 4.3 自定义 hooks 封装
```ts
function useStableCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  useLayoutEffect(() => { ref.current = fn; }, [fn]);
  return useCallback((...args) => ref.current(...args), []) as T;
}
```
解决“既要读取最新状态，又不想变引用”的经典矛盾。

---

## 5. 实战：列表 + 分页 + 选中
```tsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set<number>());

  // 1. 缓存计算：过滤 & 分页
  const display = useMemo(() => {
    return users.slice((page - 1) * 10, page * 10);
  }, [users, page]);

  // 2. 缓存事件：行点击
  const toggle = useCallback((id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
    <>
      {display.map(u =>
        <Row key={u.id} user={u} selected={selected.has(u.id)} onToggle={toggle} />
      )}
    </>
  );
}

const Row = React.memo(({ user, selected, onToggle }) => {
  console.log('Row 渲染', user.id);
  return (
    <div onClick={() => onToggle(user.id)} className={selected ? 'active' : ''}>
      {user.name}
    </div>
  );
});
```
**要点**  
- `toggle` 引用不变 → `Row` 不会因“父组件 setPage”而重渲染。  
- `display` 缓存 → 避免全列表过滤重复执行。

---

## 6. 常见误区速查表
| 错误写法 | 问题 | 修正 |
|---|---|---|
| `useCallback(() => {}, [obj])` | 对象每次渲染都变，缓存失效 | 用 `obj.id` 等原始值 |
| `useMemo(() => <Expensive /> , [])` | 返回 ReactElement，仍会被迫卸载 | 用 `useMemo` 缓存**数据**，组件用 `memo` |
| 在 `useMemo` 里执行副作用 | 违背语义，可能多次执行 | 用 `useEffect` |
| 把 `useCallback` 当 `useRef` 用 | 闭包旧值 | 自定义 `useStableCallback` |

---

## 7. 脑图速记
```
useCallback
├─ 缓存函数引用
├─ 配合 React.memo 防止子渲染
└─ 闭包陷阱 → 正确 deps

useMemo
├─ 缓存计算值
├─ 缓存对象/数组引用
└─ 间接减少子渲染 & Effect 触发
```

---

## 8. 面试高频
**Q1**: `useCallback(fn, [])` 与 `useRef(fn).current` 区别？  
**A**: 前者在**未来渲染**中仍然是同一个函数引用，但 deps 为空会捕获**旧闭包**；后者总是访问最新函数，但无法保证引用稳定，需要自行封装。

**Q2**: 为什么 React 不自动做“全局缓存”？  
**A**: 缓存键 = 调用栈 + 依赖，全局缓存需要额外的 GC 策略与内存管理，框架层面保持“按需手动”更简单可预测。

---

## 9. 延伸阅读
- [React 官方文档 – useCallback](https://react.dev/reference/react/useCallback)  
- [React 官方文档 – useMemo](https://react.dev/reference/react/useMemo)  
- [Dan Abramov – 函数缓存与依赖](https://overreacted.io/a-complete-guide-to-useeffect/)  
- [Web.dev – 使用 DevTools 测量 React 性能](https://web.dev/react-performance)

---

## 10. 一键速查卡片（打印版）
```
useCallback(fn, deps)   → 缓存函数
useMemo(() => val, deps) → 缓存值
deps 变化 → 重新创建
无 deps   → 永远不复用（危险）
空 deps   → 只创建一次（闭包旧值）
```
把这张卡片贴在显示器，写代码时瞄一眼，少走 80% 弯路。

---

> 结束语  
> 缓存是性能优化的**最后一环**，先测后加，切莫“拍脑袋”包裹。  
> 祝你早日写出“渲染一次，到处复用”的极致 React 应用！