# AbortController

> 适用：浏览器 / Node 18+ / React 18+

## 1 基础概念

| 关键词 | 一句话说明 |
|--------|------------|
| `AbortController` | 浏览器内置的“取消令牌”发生器，用于取消异步任务（fetch、Stream、计时器等）。 |
| `AbortSignal` | 由 `controller.signal` 返回的只读信号，可被传递给任何支持取消的 API。 |
| `controller.abort(reason?)` | 手动触发取消，所有持有该 `signal` 的任务会收到 `AbortError`。 |

```js
const controller = new AbortController();
const signal = controller.signal;

fetch(url, { signal }).catch(err => {
  if (err.name === 'AbortError') console.log('请求被取消');
});

// 任意时刻调用
controller.abort('用户离开页面');
```

---

## 2 快速上手

### 2.1 最小可运行示例

```js
const ctl = new AbortController();

// 1. 发出请求
fetch('https://api.github.com/users/github', { signal: ctl.signal })
  .then(r => r.json())
  .then(console.log)
  .catch(err => {
    if (err.name === 'AbortError') return console.warn('已取消');
    console.error('网络错误', err);
  });

// 2. 3 秒后取消
setTimeout(() => ctl.abort('超时'), 3000);
```

### 2.2 取消非 fetch 任务

```js
// 定时器
const id = setTimeout(() => {}, 1e6);
signal.addEventListener('abort', () => clearTimeout(id));

// 迭代可读流
for await (const chunk of stream) {
  if (signal.aborted) break;
}
```

---

## 3 React 中使用范式（useEffect）

### 3.1 经典模板

```tsx
import { useEffect } from 'react';

export default function UserDetail({ id }: { id: string }) {
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { signal: controller.signal });
        if (!res.ok) throw new Error(res.statusText);
        const json = await res.json();
        // ...setState
      } catch (err: any) {
        if (err.name === 'AbortError') return;   // 正常取消，忽略
        // ...错误提示
      }
    })();

    // 清理函数：组件卸载 / id 变化时触发
    return () => controller.abort('依赖变化或卸载');
  }, [id]);

  return <div>...</div>;
}
```

### 3.2 并发竞态处理（先发出的请求晚返回导致覆盖）

```tsx
useEffect(() => {
  const controller = new AbortController();

  loadData().then(data => {
    // 只有未被取消才 setState
    if (!controller.signal.aborted) setData(data);
  });

  return () => controller.abort();
}, [query]);
```

### 3.3 结合 axios / RxJS / graphql-request

```ts
// axios 0.22+ 内置支持
await axios.get(url, { signal: controller.signal });

// RxJS
import { fromFetch } from 'rxjs/fetch';
fromFetch(url, { selector: res => res.json(), signal }).subscribe(...);

// graphql-request
await request({ url, document, signal });
```

---

## 4 进阶技巧

### 4.1 一个 controller 管多个请求

```js
const ctl = new AbortController();
Promise.all([
  fetch('/api/a', { signal: ctl.signal }),
  fetch('/api/b', { signal: ctl.signal }),
]).catch(e => {
  if (e.name === 'AbortError') console.log('批量取消');
});
ctl.abort();
```

### 4.2 超时封装

```ts
function useTimeoutSignal(ms: number) {
  const controller = useRef(new AbortController());
  useEffect(() => {
    const id = setTimeout(() => controller.current.abort('超时'), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return controller.current.signal;
}

// 使用
const signal = useTimeoutSignal(5000);
fetch(url, { signal });
```

### 4.3 链式取消（父组件取消，子组件自动取消）

```tsx
const ParentContext = createContext<AbortController | null>(null);

function Parent({ children }) {
  const controller = useMemo(() => new AbortController(), []);
  useEffect(() => () => controller.abort(), [controller]);

  return (
    <ParentContext.Provider value={controller}>
      {children}
    </ParentContext.Provider>
  );
}

function Child() {
  const parentCtl = useContext(ParentContext);
  useEffect(() => {
    if (!parentCtl) return;
    fetch('/api/child', { signal: parentCtl.signal });
  }, [parentCtl]);
}
```

### 4.4 Node 18 原生 fetch / undici

Node 18 起内置 `fetch` 即 `undici`，同样支持信号：

```js
import { AbortController } from 'node-abort-controller'; // 老版本需 polyfill
const ctl = new AbortController();
const res = await fetch('https://httpbin.org/delay/3', { signal: ctl.signal });
```

---

## 5 常见问题 Q&A

| 问题 | 解答 |
|------|------|
| `AbortController` 兼容性？ | Chrome 66+、Firefox 57+、Safari 11.1+、Edge 79+；Node 15+ 实验，Node 18+ 正式。 |
| polyfill 方案？ | `node-abort-controller`（Node）或 `abortcontroller-polyfill`（老浏览器）。 |
| 可以同时传递多个 signal？ | 不可以，但可用 `AbortSignal.any([s1, s2])`（TC39 阶段 3，Chrome 116+）。 |
| `abort()` 多次调用会怎样？ | 第一次生效，后续静默忽略。 |
| 取消后 `fetch` 会 reject 吗？ | 会，且 `err.name === 'AbortError'`。 |
| 为什么有时捕获不到 `AbortError`？ | 检查是否被上游库吞掉，或异步代码未用 `signal`。 |

---

## 6 与 React 18 StrictMode

严格模式下组件会**挂载 → 卸载 → 重新挂载**一次，因此清理函数会被额外调用：

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort(); // 会被调用两次
}, []);
```

这是**正常开发行为**，可帮助你确保清除逻辑正确；生产环境不会重复挂载。

---

## 7 性能 & 内存注意

- 每个未取消的 `fetch` 都会持有 TCP 连接，直到超时或页面卸载 → 及时 `abort` 可节省带宽。
- 在列表/无限滚动场景下，切换元素前取消旧请求，能显著降低后端压力。
- `controller.abort()` 本身极轻量，可放心高频创建（现代浏览器对短生命周期对象优化良好）。

---

## 8 速记

> **“有异步，就有信号；有依赖，就清理；有竞争，就 abort。”**

---

## 9 参考链接

- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [React 官方文档 - 取消请求](https://react.dev/reference/react/useEffect#fetching-data)
- [WHATWG Fetch Spec - AbortSignal](https://fetch.spec.whatwg.org/#abortsignal)
- [Node undici AbortController](https://undici.nodejs.org/#/?id=abortcontroller)
