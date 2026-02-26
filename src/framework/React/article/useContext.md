# useContext

> 版本：React 18.3 + TypeScript 5  

## 1 基础概念

| API | 作用 |
|-----|------|
| `createContext<T>(defaultValue)` | 创建**一盒子数据** + **一盒子更新函数**，跨组件树免 props 钻取。 |
| `Context.Provider` | 把数据放进盒子。 |
| `useContext(Context)` | 从盒子里拿数据；数据变则自动重渲染。 |

---

## 2 最小可运行示例

```tsx
import { createContext, useContext, useState } from 'react';

// 1 创建
const CounterCtx = createContext({ count: 0, setCount: (c: number) => {} });

function App() {
  const [count, setCount] = useState(0);
  return (
    // 2 提供
    <CounterCtx.Provider value={{ count, setCount }}>
      <Child />
    </CounterCtx.Provider>
  );
}

function Child() {
  // 3 消费
  const { count, setCount } = useContext(CounterCtx);
  return (
    <button onClick={() => setCount(count + 1)}>clicked {count}</button>
  );
}
```

---

## 3 TypeScript 最佳实践

### 3.1 避免 `undefined` 默认值的两种写法

**A. 默认值法**（适合有合理缺省）

```ts
type Theme = 'light' | 'dark';
const ThemeCtx = createContext<Theme>('light');
```

**B. 无默认值法**（强制 Provider 包裹）

```ts
type Ctx = { user: User; logout: () => void };
const UserCtx = createContext<Ctx | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
};
```

### 3.2 把 Provider 做成组件

```tsx
type Props = { children: ReactNode; initialUser?: User };

export function UserProvider({ children, initialUser }: Props) {
  const [user, setUser] = useState(initialUser ?? null);

  const logout = useCallback(() => setUser(null), []);
  const login  = useCallback((u: User) => setUser(u), []);

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}
```

---

## 4 性能陷阱与优化

### 4.1 重渲染风暴原因

- **Provider 的 `value` 每次引用不同** → 所有 `useContext` 消费者全部重渲染。
- 解决：**`useMemo` / `useCallback` 固化引用**（见 3.2）。

### 4.2 拆分上下文（高阶技巧）

把「状态」与「dispatch」分离：

```ts
const DispatchCtx = createContext<Dispatch<Action>>(() => {});
const StateCtx   = createContext<State>(initialState);

export const useDispatch = () => useContext(DispatchCtx);
export const useSelector = <T,>(selector: (s: State) => T): T =>
  selector(useContext(StateCtx));
```

- 只读数据放 `StateCtx`，组件按需重渲染；
- 调用 `dispatch` 不会触发自身重渲染。

### 4.3 使用 `React.memo` 隔离

```tsx
const Expensive = React.memo(function Expensive() {
  const { user } = useUser();
  return <div>{user.name}</div>;
});
```

---

## 5 设计模式速查表

| 模式 | 场景 | 关键词 |
|------|------|--------|
| **主题/国际化** | 全局只读配置 | 小对象 + `useMemo` |
| **认证 & 权限** | 登录态 + 方法 | 状态 + 回调分离 |
| **状态管理** | 多组件共享 | 搭配 `useReducer` 或 `useState` |
| **依赖注入** | 可替换服务 | 传函数 / 类实例 |
| **多级嵌套** | 子树覆盖父级 | 同名 Provider 就近原则 |

---

## 6 实战案例

### 6.1 主题 + 局部覆盖

```tsx
const ThemeCtx = createContext({ theme: 'light', toggle: () => {} });

function Root() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), []);
  const value = useMemo(() => ({ theme, toggle }), [theme]);

  return (
    <ThemeCtx.Provider value={value}>
      <Header />
      <ThemeCtx.Provider value={{ theme: 'light', toggle: () => {} }}>
        <LegacySection />   {/* 强制定义成 light */}
      </ThemeCtx.Provider>
    </ThemeCtx.Provider>
  );
}
```

### 6.2 全局消息通知（dispatch 唯一）

```tsx
const NotifyDispatch = createContext<(msg: string) => void>(() => {});

export const NotifyProvider = ({ children }: { children: ReactNode }) => {
  const [list, setList] = useState<string[]>([]);
  const enqueue = useCallback((msg: string) => setList(prev => [...prev, msg]), []);
  return (
    <NotifyDispatch.Provider value={enqueue}>
      {children}
      <Snackbar
        messages={list}
        onClose={(idx) => setList(prev => prev.filter((_, i) => i !== idx))}
      />
    </NotifyDispatch.Provider>
  );
};

// 任意深组件
export const useNotify = () => useContext(NotifyDispatch);
```

### 6.3 与 `useLayoutEffect` 结合测量 DOM

```tsx
const RectCtx = createContext<DOMRect>({} as DOMRect);

function Measure({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect>({} as DOMRect);

  useLayoutEffect(() => {
    setRect(ref.current!.getBoundingClientRect());
    const ro = new ResizeObserver(() => setRect(ref.current!.getBoundingClientRect()));
    ro.observe(ref.current!);
    return () => ro.disconnect();
  }, []);

  return (
    <RectCtx.Provider value={rect}>
      <div ref={ref}>{children}</div>
    </RectCtx.Provider>
  );
}

function Tooltip() {
  const rect = useContext(RectCtx);
  return <div style={{ top: rect.bottom }}>I'm below measured node</div>;
}
```

---

## 7 常见错误 checklist

- ❌ 在 `Provider` 的 `value` 里直接写对象字面量 → 每次渲染引用不同。  
- ❌ 把大对象全部塞进一个 Context → 导致不相关组件重渲染。  
- ❌ 把 Context 当 Redux 用，深度嵌套更新频繁 → 考虑 `zustand` / `jotai` / `redux-toolkit`。  
- ❌ 忘记 `useMemo` / `useCallback` 固化函数 → 重渲染风暴。  
- ✅ 小步拆分，只放「真正全局」或「树状分支」数据。

---

## 8 源码级冷知识

1. `createContext(default)` 返回的对象是**不可变**的，只有 `Provider` 与 `Consumer` 两个属性。  
2. `useContext(MyCtx)` 本质：  
   `readContext(MyCtx._currentValue)` → 收集当前组件依赖 → 值变则标记更新。  
3. React DevTools 会显示 Context 名（`displayName`），方便调试：  
   `CounterCtx.displayName = 'CounterCtx';`

---

## 9 一句话总结口诀

> **“Context = 传送门；数据只读，引用固化；大了就拆，变了就 memo。”**

