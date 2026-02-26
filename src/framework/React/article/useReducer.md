# useReducer

> 「useState 的函数式兄弟，把状态更新写成 reduce」

## 0 为什么需要 useReducer

| 场景 | useState 痛点 | useReducer 优势 |
|---|---|---|
| 多个子状态联动 | setState 层层展开 | 一次 dispatch 合并 |
| 复杂校验/业务规则 | 逻辑散落在事件处理器 | 集中写在 reducer |
| 可预测、可调试 | 难以追踪 | 纯函数 + action 日志 |
| 组件外复用 | 自定义 Hook 传参多 | reducer 可导出单测 |

---

## 1 基础 API

```ts
const [state, dispatch] = useReducer(reducer, initialArg, init?);
```

| 参数 | 说明 |
|---|---|
| reducer | `(state, action) => newState` 必须纯函数 |
| initialArg | 初始值或种子值 |
| init | 可选懒初始化函数 `(initialArg) => initialState` |

---

## 2 计数器三件套（入门）

```tsx
type Action = { type: 'inc' } | { type: 'dec' } | { type: 'reset' };

function counterReducer(state: number, action: Action): number {
  switch (action.type) {
    case 'inc':
      return state + 1;
    case 'dec':
      return state - 1;
    case 'reset':
      return 0;
    default:
      return state; // 必须兜底
  }
}

export function Counter() {
  const [count, dispatch] = useReducer(counterReducer, 0);
  return (
    <>
      <button onClick={() => dispatch({ type: 'dec' })}>-</button>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
      <button onClick={() => dispatch({ type: 'reset' })}>reset</button>
    </>
  );
}
```

---

## 3 懒初始化（lazy init）

```tsx
function initCounter(seed: number): number {
  return seed * 2; // 复杂计算放这
}

function CounterWithSeed({ seed }: { seed: number }) {
  const [count, dispatch] = useReducer(counterReducer, seed, initCounter);
  // 第二次渲染不再执行 initCounter
  return /* ... */;
}
```

---

## 4 useState vs useReducer 对照表

| 维度 | useState | useReducer |
|---|---|---|
| 写法 | setState(newVal) | dispatch({type, payload}) |
| 更新逻辑 | 组件内 | 纯函数 reducer |
| 状态形状 | 单一值 | 任意对象/数组 |
| 可读性 | 简单直观 | 复杂后更清晰 |
| 调试 | 难追踪 | redux-devtools 即插即用 |
| 性能 | 每次新函数 | dispatch 引用不变 |

**官方建议**：  
「组件内有 3 个以上相关子状态，或下一个状态依赖旧状态」→ 用 useReducer。

---

## 5 实战 1：表单全链路

```tsx
type State = {
  name: string;
  age: number;
  errors: Record<string, string>;
};

type Action =
  | { type: 'change'; field: keyof State; value: string | number }
  | { type: 'validate' }
  | { type: 'reset' };

const formReducer = (s: State, a: Action): State => {
  switch (a.type) {
    case 'change': {
      const next = { ...s, [a.field]: a.value };
      if (a.field === 'age')
        next.errors.age = (a.value as number) < 18 ? '须≥18' : '';
      return next;
    }
    case 'validate':
      return { ...s, errors: { ...s.errors, name: s.name ? '' : '必填' } };
    case 'reset':
      return { name: '', age: 18, errors: {} };
    default:
      return s;
  }
};

function Form() {
  const [state, dispatch] = useReducer(formReducer, {
    name: '',
    age: 18,
    errors: {},
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        dispatch({ type: 'validate' });
        // 提交逻辑
      }}
    >
      <input
        value={state.name}
        onChange={e => dispatch({ type: 'change', field: 'name', value: e.target.value })}
        placeholder="姓名"
      />
      {state.errors.name && <span>{state.errors.name}</span>}

      <input
        type="number"
        value={state.age}
        onChange={e => dispatch({ type: 'change', field: 'age', value: +e.target.value })}
      />
      {state.errors.age && <span>{state.errors.age}</span>}

      <button type="submit">保存</button>
      <button type="button" onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </form>
  );
}
```

---

## 6 实战 2：与 useContext 组合（迷你 Redux）

```tsx
// State
type State = { user: User | null; theme: 'light' | 'dark' };
const initialState: State = { user: null, theme: 'light' };

// Action
type Action =
  | { type: 'login'; user: User }
  | { type: 'logout' }
  | { type: 'toggleTheme' };

// Reducer
function appReducer(s: State, a: Action): State {
  switch (a.type) {
    case 'login':
      return { ...s, user: a.user };
    case 'logout':
      return { ...s, user: null };
    case 'toggleTheme':
      return { ...s, theme: s.theme === 'light' ? 'dark' : 'light' };
    default:
      return s;
  }
}

// Context + Provider
const StateCtx  = createContext<State>(initialState);
const DispatchCtx = createContext<React.Dispatch<Action>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>{children}</StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

// 消费 Hooks
export const useAppState = () => useContext(StateCtx);
export const useAppDispatch = () => useContext(DispatchCtx);
```

---

## 7 性能优化技巧

1. dispatch 引用不变 → 子组件依赖 `dispatch` 不会重渲染。  
2. 状态切片：把「只读不用的字段」拆到另一个 Context。  
3. 用 `useMemo` 缓存派生值：
```tsx
const expensive = useMemo(() => derive(state), [state.x]);
```

---

## 8 调试：3 行接入 Redux DevTools

```bash
npm i redux-devtools-extension
```

```ts
import { composeWithDevTools } from 'redux-devtools-extension';

const [state, dispatch] = useReducer(reducer, initialState, composeWithDevTools());
```

浏览器插件即看时光机。

---

## 9 TypeScript 高级模式

### 9.1 模板字面量 action 类型（自动提示）
```ts
type Model = 'user' | 'post';
type Action = { type: `${Model}/add`; payload: any };
```

### 9.2 判别联合 +  exhaustiveness
```ts
function assertNever(x: never): never {
  throw new Error('Unexpected action: ' + x);
}
// reducer default: return assertNever(action);
```

---

## 10 常见坑 checklist

| 坑 | 正确 |
|---|---|
| 在 reducer 里做异步 | 保持纯函数，副作用提到 effect 或 thunk |
| 直接修改 state 对象 | 始终返回新引用 |
| 把 reducer 定义在组件内 | 提出文件，可单测、可复用 |
| 忘记兜底 default | 导致旧状态丢失 |

---

## 11 速记

> **「复杂状态用 reducer，纯函数易测试；dispatch 是单通道，异步副作用请靠边。」**

