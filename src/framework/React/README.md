### React 

#### 一、React 是什么
- **定义**：Facebook 开源的用于构建用户界面的 JavaScript 库（只关注 View 层）。
- **定位**：组件化、声明式、一次学习多端使用（Web / Native / VR / 静态站点）。

#### 二、核心思想
1. 组件化：把 UI 拆成独立、可复用、可组合的小块。
2. 声明式：数据 → 虚拟 DOM → 最小化真实 DOM 操作。
3. 单向数据流：数据只能从父组件通过 props 向下传递，易于预测与调试。

#### 三、基础概念速览
| 概念 | 一句话记忆 | 备注 |
|---|---|---|
| 元素（Element） | `React.createElement` 返回的普通对象 | 不可变 |
| 组件（Component） | 函数或类，返回 React 元素 | 首字母必须大写 |
| JSX | 语法糖 → `React.createElement` | 需 Babel 编译 |
| Props | 父 → 子的只读数据 | 纯函数思想 |
| State | 组件内部可变数据 | `useState` / `this.setState` |
| 生命周期 / Hooks | 类：`componentDidMount`… 函数：`useEffect`… | 16.8+ 推荐 Hooks |
| 事件系统 | 合成事件池、自动委托 | 小写驼峰命名 |
| Ref & DOM | 获取真实 DOM 或组件实例 | `useRef` / `createRef` |
| 列表 & Key | 帮助 React 识别同级元素变化 | 不能用 index 做 key |
| 条件渲染 | 三目、&&、短路、早期 return | 注意 `0` 被渲染问题 |
| 表单 | 受控（value+onChange） vs 非受控（ref） | 推荐受控 |

#### 四、进阶核心
1. **虚拟 DOM & Diff**
   - 双缓存 + 二叉树对比（同级比较、key 优化）
2. **Fiber 架构（16+）**
   - 可中断、可恢复、优先级调度 → 时间切片避免掉帧
3. **Hook 全景**
   > [useState](./article/useState.md)
    [useReducer](./article/useReducer.md)
    [useEffect](./article/useEffect.md)
    [useContext](./article/useContext.md)
    [useMemo](./article/useMemo.md)
    [useCallback](./article/useCallback.md)
    [React.memo](./article/React.memo.md)
    [useLayoutEffect](./article/useLayoutEffect.md)
    [useInsertionEffect](./article/useInsertionEffect.md)


   - 基础：`useState` `useEffect` `useContext`
   - 性能：`useMemo` `useCallback` `React.memo`
   - 副作用：`useLayoutEffect` `useInsertionEffect`(18)
   - 自定义：以 `use` 开头，内部可调用其他 Hook
4. **Context API**
   - `createContext` → `Provider/Consumer` → 解决“钻prop”
5. **高阶组件 HOC / Render Props**
   - 逻辑复用旧方案，现在优先 Hook
6. **错误边界**
   - `componentDidCatch` / `static getDerivedStateFromError`
7. **Concurrent 特性（18+）**
   - `startTransition` `useDeferredValue` `Suspense` 服务端流式渲染
8. **服务端渲染 SSR & 静态生成 SSG**
   - Next.js、Remix、Gatsby、React 18 Streaming SSR
9. **性能调优**
   - 生产环境打包、代码分割（`React.lazy` + `Suspense`）、Tree-Shaking、
   - 虚拟列表（react-window）、防抖节流、Immutable 数据
10. **测试**
    - 单元：Jest + React Testing Library
    - 集成：Cypress / Playwright

#### 五、重点
1. **Hook 规则与闭包陷阱**
   - 依赖数组、过期闭包、异步读取最新 state 的正确姿势
2. **Fiber & 调度原理**
   - `render` vs `commit` 阶段、Lane 模型、时间切片
3. **Diff 算法细节**
   - 单节点、多节点（key）、文本节点、Fragment 处理
4. **性能瓶颈定位**
   - React DevTools Profiler、Why-did-you-render、Chrome Performance
5. **大型项目状态管理选型**
   - 组合 Context + useReducer、Redux Toolkit、Zustand、Recoil、Jotai、MobX
6. **TypeScript 结合**
   - `React.FC`、泛型组件、Hooks 类型、事件类型、`as` 与严格模式
7. **服务端渲染水合（Hydration）**
   - 客户端与服务器输出不一致导致的水合失败
8. **并发模式下的竞态**
   - 请求取消、过渡加载、Suspense 边界嵌套
9. **安全**
   - XSS（ dangerouslySetInnerHTML ）、CSRF、CSP
10. **升级迁移**
    - 15→16（Fiber）、16→17（事件委托变更）、17→18（并发、严格模式双倍调用）

#### 六、阶段
1. 会写：JSX → 组件 → Props/State → 列表表单 → 事件
2. 能调：生命周期/Hook → 网络请求 → 路由（React-Router）
3. 会做项目：状态管理 → 构建(Vite/Webpack) → UI 组件库(Ant Design / MUI)
4. 性能 & 原理：虚拟 DOM → Diff → Fiber → 调度 → 源码阅读
5. 工程化：TypeScript → 单元测试 → CI/CD → 部署(SSR/SSG/Edge)
6. 源码级：调试 React 源码 → 写 Babel Plugin → 自定义 Renderer（如 React-Canvas）

#### 七、常见面试追问
- [React18 新特性](./article/React18新特性.md)
- [如何把每个任务执⾏的时间控制在 5ms 内？](./article/如何把每个任务执⾏的时间控制在5ms内.md)
- [如何把每⼀帧 5ms 内未执⾏的任务分配到后⾯的帧中？](./article/如何把每⼀帧5ms内未执⾏的任务分配到后⾯的帧中.md)
- [如何给任务划分优先级？](./article/如何给任务划分优先级.md)
- [对 React Hook 的闭包陷阱的理解？](./article/对ReactHook的闭包陷阱的理解.md)

- [为什么 useState 返回的是数组⽽不是对象？](./article/为什么useState返回的是数组⽽不是对象.md)
- [React 懒加载的实现原理？](./article/React懒加载的实现原理.md)
- [React VS Vue](./article/ReactVSVue.md)
- [React 组件通信](./article/React组件通信.md)
- [React 中，Element、Component、Node、Instance 是四个重要的概念](./article/React中，Element、Component、Node、Instance是四个重要的概念.md)
- [React Hooks 实现⽣命周期？](./article/ReactHooks实现⽣命周期.md)
- [React.memo() 和 useMemo()](./article/React.memo()和useMemo().md)
- [React.memo() VS JS 的 memorize 函数](./article/React.memo()VSJS的memorize函数.md)
- [React-Router 的 <Link /> 组件和 <a> 有什么区别？](./article/React-Router的Link组件和a标签有什么区别.md)
- [PureComponent 和 Component的区别是？](./article/PureComponent和Component的区别是.md)
- [React 事件和原⽣事件的执⾏顺序？](./article/React事件和原⽣事件的执⾏顺序.md)
- [Redux VS Vuex](./article/ReduxVSVuex.md)
- [Mobx VS Redux](./article/MobxVSRedux.md)
- [setState 是同步还是异步？](./article/setState是同步还是异步.md)
- [为什么说 Hook 不能写在条件语句里？](./article/为什么说Hook不能写在条件语句里.md)
- [Fiber 节点结构有哪些字段？](./article/Fiber节点结构有哪些字段.md)
- [如何实现一个 usePrevious？](./article/如何实现一个usePrevious.md)
- [React 18 的 automatic batching 是什么？](./article/React18的automaticbatching是什么.md)
- [Suspense 和 Error Boundary 的捕获范围区别？](./article/Suspense和ErrorBoundary的捕获范围区别.md)
- [请求在 useEffect 里如何清理？](./article/请求在useEffect里如何清理.md)
- [如何避免子组件不必要的渲染？](./article/如何避免子组件不必要的渲染.md)
- [服务器组件（RSC）和客户端组件边界怎么划分？](./article/服务器组件（RSC）和客户端组件边界怎么划分.md)
- [React 中，⽗⼦组件的⽣命周期执⾏顺序？](./article/React中，⽗⼦组件的⽣命周期执⾏顺序.md)
- [React JSX 转换成真实 DOM 的过程？](./article/ReactJSX转换成真实DOM的过程.md)
- [React render ⽅法原理？在什么时候触发？](./article/Reactrender⽅法原理.md)
- [React-router ⼏种模式，以及实现原理？](./article/React-router⼏种模式，以及实现原理.md)
- [React 服务端渲染（SSR）原理？](./article/React服务端渲染（SSR）原理.md)


#### 八、速记
“React = 组件(积木) + 虚拟DOM( diff ) + 单向数据( props down ) + Fiber(调度) + Hook(复用) + 并发(18) + 生态(Next/Remix)。”