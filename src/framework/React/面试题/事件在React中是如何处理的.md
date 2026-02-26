# 事件在 React 中是如何处理的?

在 React 里，“事件”看似只是 `onClick={handleClick}` 这一行 JSX，但面试把这条语句拆到底层，能挖出 **6 个层次**：合成事件 → 事件委派 → 收集机制 → 插件体系 → 批量更新 → 兼容性。下面用“一条线索 + 一张大图”带你答到源码级，面试官想不给你过都难。

--------------------------------------------------
一、从写下 JSX 开始：编译阶段
--------------------------------------------------
```jsx
<button onClick={this.handleClick} data-id="1">save</button>
```
Babel 会把 `onClick` 编译成 **ReactProps** 对象的一个属性：
```js
React.createElement("button", {
  onClick: this.handleClick,
  "data-id": "1"
}, "save");
```
注意：此时**还没有任何真实 DOM**，也没有绑定监听器，只是**描述信息**。

--------------------------------------------------
二、render + commit：绑定阶段（Fiber 节点）
--------------------------------------------------
1. `render` 阶段生成 Fiber 树，在 `completeWork` 里遇到 `button` 的 `onClick`，会把事件名、回调、优先级挂到 `fiber.memoizedProps` 上。  
2. `commit` 阶段执行 `finalizeInitialChildren` → `ensureListeningTo` → **只给 `document`（或容器节点）绑一个顶层监听器**（React 17 以后是**容器节点**，React 16 是 `document`）。  
   源码位置：`packages/react-dom/src/events/ReactDOMEventListener.js`

--------------------------------------------------
三、事件委派：为何只绑一个？
--------------------------------------------------
React 采用 **中央事件委派（Event Delegation）** 策略：  
- 所有**冒泡阶段**的事件统一代理到**根节点**，减少 99 % 的监听器数量。  
- 捕获阶段如需支持，可写 `onClickCapture`，React 会再绑一个捕获监听器。  
- 每种事件类型**只会注册一次**（如 `onclick` → `dispatchDiscreteEvent`）。

--------------------------------------------------
四、事件触发：从原生事件到合成事件
--------------------------------------------------
1. 用户点击 → 原生 `MouseEvent` 到达根节点监听器。  
2. React 把原生事件包装成 **SyntheticEvent**（跨浏览器、可池化复用）。  
3. 根据 `nativeEvent.target` 在 Fiber 树中**自底向上**收集所有注册了 `onClick` 的 Fiber 节点，构成**执行队列**（`dispatchQueue`）。  
4. 按**冒泡顺序**（或捕获顺序）依次执行队列里的事件回调。

--------------------------------------------------
五、插件体系：不同事件走不同插件
--------------------------------------------------
React 把事件分门别类，用插件形式插入：  
- `SimpleEventPlugin` 负责 click/keyDown/input 等通用事件  
- `ChangeEventPlugin` 专门处理 checkbox/radio 的 change  
- `SelectEventPlugin` 处理 select 控件的 change  
- `BeforeInputEventPlugin` 处理复合输入（IME）  

插件核心接口：  
```js
extractEvents(
  topLevelType,    // 'topClick'
  targetInst,      // Fiber
  nativeEvent,     // 原生事件
  eventSystemFlags
) → 返回 SyntheticEvent 实例
```

--------------------------------------------------
六、批量更新 & 性能优化
--------------------------------------------------
- React 18 默认**自动批处理**：在一次事件回调里多次 `setState` 会被合并成一次更新。  
- 如果需要在**事件之后**立即读 DOM，可用 `flushSync(() => setState(...))` 强制同步。  
- 事件回调执行完后，**SyntheticEvent 对象被回收**（`event.persist()` 可阻止池化，但已废弃）。

--------------------------------------------------
七、React 17 的三大变化（常考）
--------------------------------------------------
1. **委托节点下移**：从 `document` → **React 根容器**，避免多 React 实例冲突。  
2. **事件名改为小写**：`onClick` → 底层监听 `click`（以前 `onclick`）。  
3. **捕获阶段优化**：`onClickCapture` 直接绑定捕获监听器，不再模拟。

--------------------------------------------------
八、常见追问速答
--------------------------------------------------
| 追问 | 一句话答案 |
|------|------------|
| 为什么合成事件比原生快？ | 减少监听器数量 + 统一池化复用 + 批量更新 |
| 如何阻止冒泡？ | `e.stopPropagation()` 针对**合成事件**；要阻止原生再冒，用 `e.nativeEvent.stopImmediatePropagation()` |
| addEventListener 与 onClick 区别？ | 前者是**命令式**、需自己清理；后者是**声明式**，React 统一委派并自动清理 |
| 事件回调 this 为 null？ | 类组件未绑定 this，推荐**箭头函数**或**类字段语法** |

--------------------------------------------------
九、面试金句（收尾）
--------------------------------------------------
“React 事件系统 = **顶层单一监听器 + 合成事件池 + 插件化分发 + 自动批处理**，它用最小成本抹平浏览器差异，同时把多次 setState 合并成一次更新，这才是我们写 `onClick` 时真正享受到的‘免费午餐’。”