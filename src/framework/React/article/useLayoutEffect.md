# useLayoutEffect

## 📚 目录

1. [基础概念](#基础概念)
2. [与 useEffect 的区别](#与-useeffect-的区别)
3. [执行流程图解](#执行流程图解)
4. [使用场景](#使用场景)
5. [进阶技巧](#进阶技巧)
6. [常见问题与陷阱](#常见问题与陷阱)
7. [性能优化建议](#性能优化建议)
8. [实战案例](#实战案例)
9. [最佳实践总结](#最佳实践总结)

## 基础概念

### 什么是 `useLayoutEffect`？

`useLayoutEffect` 是 React 提供的一个 Hook，用于在**浏览器执行绘制之前**同步执行副作用操作。

它的签名与 `useEffect` 完全相同，但执行时机不同。

```javascript
import { useLayoutEffect, useRef } from 'react';

function Example() {
  const divRef = useRef(null);

  useLayoutEffect(() => {
    // 在浏览器绘制前同步执行
    console.log('布局副作用执行了');
    console.log('div 宽度:', divRef.current?.offsetWidth);
  });

  return <div ref={divRef}>Hello</div>;
}
```

### 为什么需要 `useLayoutEffect`？

在以下场景中，我们需要在浏览器绘制前同步获取 DOM 信息或修改 DOM，以避免视觉闪烁：

- 测量 DOM 元素的位置或尺寸
- 根据 DOM 状态同步更新页面布局
- 在浏览器绘制前插入样式或元素
- 防止用户看到中间状态（如闪烁、跳动）

---

## 与 useEffect 的区别

| 特性 | `useEffect` | `useLayoutEffect` |
|------|-------------|-------------------|
| 执行时机 | 异步，在浏览器绘制**之后** | 同步，在浏览器绘制**之前** |
| 是否阻塞渲染 | ❌ 不阻塞 | ✅ 会阻塞 |
| 适用场景 | 大多数副作用 | 需要同步读取/写入 DOM |
| 性能影响 | 较小 | 较大（可能阻塞渲染） |
| 服务端渲染（SSR） | 不会执行 | 不会执行（但会警告） |

---

## 执行流程图解

```text
React 渲染阶段
       ↓
React 提交阶段（commit phase）
       ↓
1. 更新 DOM（浏览器尚未绘制）
       ↓
2. useLayoutEffect 同步执行
       ↓
3. 浏览器执行绘制（paint）
       ↓
4. useEffect 异步执行
```

---

## 使用场景

### ✅ 正确使用场景

#### 1. 测量 DOM 元素

```javascript
function Tooltip({ children, content }) {
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    const rect = triggerRef.current.getBoundingClientRect();
    setStyle({
      position: 'absolute',
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  }, []);

  return (
    <>
      <span ref={triggerRef}>{children}</span>
      <div style={style} className="tooltip">{content}</div>
    </>
  );
}
```

#### 2. 防止布局闪烁（FOUC）

```javascript
function Collapse({ isOpen, children }) {
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (isOpen) {
      const contentEl = contentRef.current;
      setHeight(contentEl.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        overflow: 'hidden',
        height: `${height}px`,
        transition: 'height 300ms ease',
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
```

#### 3. 同步滚动位置

```javascript
function ScrollRestoration({ children }) {
  const location = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return children;
}
```

---

## 进阶技巧

### 1. 与 `useRef` 结合实现“读取-写入”闭环

```javascript
function AutoResizeTextarea() {
  const textareaRef = useRef(null);
  const [value, setValue] = useState('');

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';           // 重置高度
      el.style.height = `${el.scrollHeight}px`; // 设置为实际内容高度
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ resize: 'none', overflow: 'hidden' }}
    />
  );
}
```

### 2. 与 `useEffect` 配合使用

```javascript
function MeasureAndLog() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  // 1. 同步测量，防止闪烁
  useLayoutEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, []);

  // 2. 异步记录，不阻塞渲染
  useEffect(() => {
    console.log('组件尺寸:', size);
    analytics.track('component_size', size);
  }, [size]);

  return <div ref={ref}>Content</div>;
}
```

---

## 常见问题与陷阱

### 1. 服务端渲染（SSR）警告

```javascript
// ❌ 会在 SSR 时报错
function MyComponent() {
  useLayoutEffect(() => {
    document.title = 'Hello';
  }, []);
  return <h1>Hello</h1>;
}

// ✅ 正确做法：延迟到客户端执行
function MyComponent() {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <h1>Hello</h1>;
}
```

### 2. 阻塞渲染导致卡顿

```javascript
// ❌ 大量计算会阻塞渲染
useLayoutEffect(() => {
  const expensiveValue = heavyComputation(data); // 耗时 100ms
  setValue(expensiveValue);
}, [data]);

// ✅ 使用 useEffect 或 Web Worker
useEffect(() => {
  const expensiveValue = heavyComputation(data);
  setValue(expensiveValue);
}, [data]);
```

### 3. 依赖项缺失导致过期闭包

```javascript
// ❌ 闭包问题
useLayoutEffect(() => {
  const handleResize = () => setSize(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []); // 如果 setSize 变化，会导致 bug

// ✅ 正确添加依赖
useLayoutEffect(() => {
  const handleResize = () => setSize(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [setSize]); // 或者使用函数式更新
```

---

## 性能优化建议

### 1. 优先使用 `useEffect`

```javascript
// ✅ 默认使用 useEffect
useEffect(() => {
  document.title = 'New Title';
}, []);

// ✅ 只有当出现闪烁/跳动时才使用 useLayoutEffect
useLayoutEffect(() => {
  const node = ref.current;
  node.scrollTop = node.scrollHeight;
}, []);
```

### 2. 使用 `useMemo` 缓存测量结果

```javascript
function Table({ data }) {
  const [rowHeight, setRowHeight] = useState(0);
  const rowRef = useRef(null);

  useLayoutEffect(() => {
    if (rowRef.current) {
      setRowHeight(rowRef.current.clientHeight);
    }
  }, []); // 只测量一次

  const virtualizedData = useMemo(() => {
    return computeVirtualized(data, rowHeight);
  }, [data, rowHeight]);

  return (
    <div>
      <div ref={rowRef} style={{ visibility: 'hidden' }}>
        {renderRow(data[0])}
      </div>
      {virtualizedData.map(renderRow)}
    </div>
  );
}
```

### 3. 避免频繁触发

```javascript
function ResizableBox() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef(null);

  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      const rect = ref.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
}
```

## [场景](../demo/useLayoutEffect-demo.md)
## 总结

`useLayoutEffect` 是 React 提供的一个强大但需谨慎使用的 Hook。

它的同步执行特性使其在处理 DOM 测量和布局时非常有用，但也可能因阻塞渲染而影响性能。

### 关键要点：

1. **默认使用 `useEffect`**，除非出现视觉问题
2. **只在需要同步读取/写入 DOM 时使用** `useLayoutEffect`
3. **注意 SSR 环境**，避免直接访问浏览器 API
4. **保持副作用简单**，避免长时间阻塞渲染
5. **与 `useEffect` 配合使用**，分离测量和记录逻辑

### 决策流程：

```text
需要副作用？
   ↓ 是
是否涉及 DOM 测量或布局？
   ↓ 是
是否出现视觉闪烁/跳动？
   ↓ 是
→ 使用 useLayoutEffect
   ↓ 否
→ 使用 useEffect
```
