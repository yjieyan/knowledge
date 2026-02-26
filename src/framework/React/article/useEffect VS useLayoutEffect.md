# useEffect VS useLayoutEffect

## 1 一张表看完所有差异

| 维度 | useEffect | useLayoutEffect |
|---|---|---|
| **执行时机** | 浏览器 **paint 之后** 异步回调 | 浏览器 **paint 之前** 同步执行 |
| **是否阻塞渲染** | ❌ 不阻塞 | ✅ 会阻塞（长时间任务会掉帧） |
| **执行阶段** | commit 阶段结尾 → 调度器异步刷新 | commit 阶段中间 → 立即同步调用 |
| **获取 DOM 尺寸** | 可能拿到 **旧值**（先画后读） | 拿到 **最新值**（先读后画） |
| **是否触发闪烁/跳动** | 可能（先显示旧状态→再改） | 不会（改完再画） |
| **SSR** | 不执行、无警告 | 不执行、**控制台警告** |
| **适用场景** | 数据获取、日志、订阅、大多数副作用 | 同步测量/修改 DOM、防闪烁、第三方库初始化 |
| **性能** | 高 | 低（滥用易卡顿） |
| **签名** | 同 useLayoutEffect | 同 useEffect |

---

## 2 一张图记住时间线

```
React render 结束
│
▼
React commit 阶段（DOM 已更新，浏览器尚未 paint）
├─ 1️⃣ useLayoutEffect 同步执行（可读写 DOM）
│
├─ 2️⃣ 浏览器 paint（用户看到画面）
│
└─ 3️⃣ useEffect 异步执行（不阻塞画面）
```

---

## 3 一句话记忆口诀

> **「Effect 先画后跑，LayoutEffect 先跑后画」**

---

## 4 实战对比： tooltip 定位

### 4.1 useEffect → 闪烁（能看出来）

```tsx
function Tooltip({ children, text }) {
  const [style, setStyle] = useState({});
  const ref = useRef(null);

  useEffect(() => {                       // ❌ paint 后才执行
    const rect = ref.current.getBoundingClientRect();
    setStyle({ top: rect.bottom });       // 用户先看到旧位置，再跳一下
  }, []);

  return (
    <>
      <span ref={ref}>{children}</span>
      <div style={style} className="tooltip">{text}</div>
    </>
  );
}
```

### 4.2 useLayoutEffect → 零闪烁

```tsx
function Tooltip({ children, text }) {
  const [style, setStyle] = useState({});
  const ref = useRef(null);

  useLayoutEffect(() => {                 // ✅ paint 前同步改
    const rect = ref.current.getBoundingClientRect();
    setStyle({ top: rect.bottom });       // 第一次画就在正确位置
  }, []);

  return (
    <>
      <span ref={ref}>{children}</span>
      <div style={style} className="tooltip">{text}</div>
    </>
  );
}
```

---

## 5  checklist：什么时候用哪个？

| 任务 | 选谁 |
|---|---|
| 数据获取 / 日志 / 分析 | useEffect |
| 设置订阅、计时器 | useEffect |
| 测量 DOM → 立刻改样式 | useLayoutEffect |
| 重置 scrollTop/scrollLeft | useLayoutEffect |
| 初始化 ECharts/Sortable 等需要 DOM 尺寸 | useLayoutEffect |
| 复杂计算 >16 ms | useEffect（避免阻塞） |

---

## 6 常见误区

1. **「useLayoutEffect 更快」**  
   → 它只是**早执行**，但会**阻塞首帧**，滥用反而掉帧。

2. **服务端渲染直接用它**  
   → 服务端不执行任何 effect，且 useLayoutEffect 会报警告；需在客户端 `useIsClient` 后再用。

3. **依赖数组写错**  
   → 两者都遵守同一套 eslint-plugin-react-hooks 规则，遗漏依赖一样会闭包 bug。

---

## 7 性能对比 micro-benchmark

```tsx
// 故意塞入 50 ms 耗时任务
useEffect(() => {
  const t = performance.now();
  while (performance.now() - t < 50) {}
}, []);
// 用户先看到 50 ms 旧画面 → 再刷新（不卡顿）

useLayoutEffect(() => {
  const t = performance.now();
  while (performance.now() - t < 50) {}
}, []);
// 首帧被推迟 50 ms → 明显卡顿
```

---

**默认 useEffect，出现闪烁再换 useLayoutEffect**，性能与体验双赢！