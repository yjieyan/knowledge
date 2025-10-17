# React 源码解析
这是一个非常宏大的话题，我将从 **核心架构、关键数据结构、工作流程** 这几个维度，为您系统地解析 React 源码的设计思想和实现原理。

---

### 一、 核心架构：Fiber 架构的革命

React 16 引入的 **Fiber 架构** 是理解现代 React 源码的基石。它彻底重写了 React 的协调（Reconciliation）算法。

#### 1. 为什么需要 Fiber？—— 解决“卡顿”问题

在 Fiber 之前（React 15 的 Stack Reconciler），协调过程是**同步递归**的。

*   **问题**：一旦开始渲染，就会递归调用整个组件树，直到完全处理完毕。这个过程无法中断。如果组件树很深，执行 JavaScript 会长时间占用主线程，导致高优先级任务（如用户输入、动画）被阻塞，造成页面卡顿。
*   **目标**：Fiber 的目标是实现 **可中断的异步渲染**，为 Concurrent Mode（并发模式）打下基础。

#### 2. Fiber 是什么？—— 三个层面的理解

1.  **一个执行单元**：Fiber 将整个渲染工作**拆分成多个小工作单元**。
2.  **一种数据结构**：**每个 Fiber 节点都是一个 JavaScript 对象**，它对应一个 React 元素（组件、DOM 节点等），保存了该节点的类型、状态、副作用、子节点、兄弟节点、父节点等信息。
3.  **一种虚拟栈帧**：Fiber 实现了自己的调用栈，允许 React 在渲染过程中**暂停、中止或复用**工作。

#### 3. Fiber 节点的关键属性（简化）

```javascript
function FiberNode(tag, pendingProps, key) {
  // 实例属性
  this.tag = tag; // 标识 Fiber 类型，如 FunctionComponent, ClassComponent, HostComponent
  this.key = key;
  this.type = null; // 对于函数组件，是函数本身；对于类组件，是类；对于DOM元素，是标签名 'div'
  this.stateNode = null; // 对应的真实实例，如 DOM 节点 或 类组件实例

  // 构成 Fiber 树的结构属性 (链表结构)
  this.return = null; // 父 Fiber
  this.child = null; // 第一个子 Fiber
  this.sibling = null; // 下一个兄弟 Fiber
  this.index = 0; // 在兄弟节点中的索引

  // 用于协调的属性 (用于Diff和状态计算)
  this.pendingProps = pendingProps; // 新的 Props
  this.memoizedProps = null; // 上一次渲染时的 Props
  this.memoizedState = null; // 上一次渲染时的 State (Hooks 链表存储在这里!)
  this.updateQueue = null; // 状态更新队列 (存放setState产生的更新)

  // 副作用相关
  this.flags = NoFlags; // (旧版本为 effectTag) 标记这个 Fiber 需要执行什么操作（如 Placement-插入，Update-更新，Deletion-删除）
  this.subtreeFlags = NoFlags; // 子树中的副作用标记 (用于性能优化)
  this.alternate = null; // **关键**：指向 current Fiber 树 或 workInProgress Fiber 树 中的对应节点

  // 用于调度
  this.lanes = NoLanes; // 车道模型，表示更新的优先级
  this.childLanes = NoLanes;
}
```

---

### 二、 双缓存 Fiber 树与工作循环

#### 1. 双缓存技术 (Double Buffering)

React 在内存中同时维护两棵 Fiber 树：

*   **`current` 树**：当前屏幕上显示内容对应的 Fiber 树。
*   **`workInProgress` 树**：正在内存中构建的、即将用于下一次渲染的 Fiber 树。

所有更新都发生在 `workInProgress` 树上。构建完成后，`workInProgress` 树会通过交换 `current` 指针，变成新的 `current` 树。这种交换非常快速，是实现无缝更新的关键。

#### 2. 可中断的协作式工作循环

React 的渲染被分为两个主要阶段，它们由 **Scheduler（调度器）** 协同工作：

**阶段一：渲染/协调阶段 (Render/Reconciliation Phase)**
*   **特点**：**可中断、可恢复、异步**。可以被打断去执行更高优先级的任务。
*   **过程**：React 采用 **深度优先遍历** 的方式构建 `workInProgress` 树。
    *   **`beginWork`**：
        *   这是处理一个 Fiber 节点的入口。根据 `Fiber.tag`，调用不同的更新方法（如 `updateFunctionComponent`, `updateHostComponent`）。
        *   在这里会执行函数组件、调和子节点（React Diff 算法发生在这里）、为子元素创建或复用 Fiber 节点，并标记副作用（`flags`）。
    *   **`completeWork`**：
        *   当一个 Fiber 节点及其所有子节点都处理完毕后，会进入此阶段。
        *   在这里，对于 `HostComponent`（DOM 节点），会创建真实的 DOM 实例（但不会挂载），并基于 `pendingProps` 设置 DOM 属性。
        *   这个阶段也会收集副作用，并冒泡到父节点的 `subtreeFlags` 中。
*   **调度**：Scheduler 会检查当前帧剩余的时间（通过 `requestIdleCallback` 的 polyfill）。如果时间不够，React 会暂停当前工作，将控制权交还给浏览器。

**阶段二：提交阶段 (Commit Phase)**
*   **特点**：**不可中断、同步执行**。此阶段会执行所有 DOM 操作，用户会看到更新。
*   **过程**：
    *   **`beforeMutation`**：执行 `getSnapshotBeforeUpdate` 生命周期。
    *   **`mutation`**：执行所有 DOM 操作（插入、更新、删除）。此时，用户能看到 DOM 的变化。这里会执行 `useLayoutEffect` 的销毁函数。
    *   **`layout`**：执行 `componentDidMount` 或 `componentDidUpdate` 生命周期，并更新 `ref`。然后执行 `useLayoutEffect` 的回调函数。
    *   **`passive effects`**：在绘制完成后，**异步** 执行 `useEffect` 的回调函数。

---

### 三、 状态与 Hooks 的实现原理

Hooks 是函数组件的灵魂，其实现与 Fiber 架构紧密相连。

#### 1. Hooks 的存储

在函数组件执行时（在 `renderWithHooks` 函数中），React 知道当前正在渲染哪个 Fiber 节点。**所有 Hooks 的状态都存储在 Fiber 节点的 `memoizedState` 属性上，并以一个单向链表的形式组织。**

```javascript
// 简化版 Hook 结构
const hook = {
  memoizedState: null, // 当前 Hook 的状态 
  baseState: null,     // useState: 基础状态; useEffect: effect对象
  baseQueue: null,     // 被跳过的更新队列
  queue: null,         // 更新队列 (对于 useState/useReducer)
  next: null,          // 指向下一个 Hook
};
```
当函数组件执行时，每调用一个 Hook（如 `useState`），React 就按顺序从这条链表中取出对应的 Hook 对象进行操作。

#### 2. `useState` / `useReducer` 原理

*   **`queue`**：每个 `useState` Hook 都有一个 `queue`（一个环形链表），里面存放了所有调度好的更新（如多次 `setState`）。
*   **更新流程**：
    1.  调用 `setState` 会创建一个更新对象，并将其放入对应 Hook 的 `queue` 中。
    2.  然后调度一次新的根更新（`scheduleUpdateOnFiber`）。
    3.  在后续的渲染阶段，React 会重新执行函数组件。
    4.  再次执行 `useState` 时，React 会遍历 `queue`，根据基础状态和所有更新，计算最新的 state，并返回。

#### 3. `useEffect` 原理

*   **存储**：`useEffect` 的依赖项和回调函数被存储在一个 `effect` 对象中，该对象被链接到 Fiber 节点的 `memoizedState` Hook 链表中，**同时也会被附加到 Fiber 节点的 `updateQueue` 上**。
*   **执行时机**：`useEffect` 的副作用在 **提交阶段后的 `passive effects` 子阶段被异步调度执行**。React 会在浏览器绘制完成后，通知 Scheduler 去执行这些副作用。而 `useLayoutEffect` 会在 **提交阶段的 `layout` 子阶段同步执行**，所以会阻塞浏览器绘制。

#### 4. Hooks 调用规则的本质

**Hooks 必须在函数组件的顶层以相同的顺序调用。** 这是因为 React 依赖于 **Hook 调用顺序的稳定性** 来正确地将 `memoizedState` 链表中的状态与每次渲染的 Hook 一一对应。如果放在条件语句中，顺序被打乱，状态就会“张冠李戴”，导致严重 bug。

---

### 四、 事件系统 (SyntheticEvent)

React 实现了自己的**合成事件 (SyntheticEvent)** 系统。

*   **事件委托**：React 并不会将事件处理器直接绑定到每个 DOM 节点上。相反，它会在 `document`（v17 后改为 `root DOM container`）上为每种支持的事件类型注册一个**原生事件监听器**。
*   **合成事件对象**：当事件触发时，React 会创建一个包装了原生事件对象的 **SyntheticEvent** 对象。它提供了与原生事件相同的接口，但消除了浏览器间的兼容性差异。
*   **事件池**：为了提高性能，SyntheticEvent 对象会被放入一个池中复用。这意味着在事件回调执行后，事件对象的属性会被清空。这就是为什么在异步函数中访问 `event` 需要调用 `event.persist()` 的原因。

---

### 五、 Diffing 算法 (协调算法)

当 React 协调子元素时，默认采用高效的 **同层比较** 策略。

1.  **遍历比较**：React 同时遍历新旧两套子元素列表。
2.  **Key 的重要性**：
    *   如果元素有 `key`，React 使用 key 来匹配新旧列表中的对应元素。这使得在列表中间插入或删除元素时，可以高效地复用 Fiber 节点，而不是进行昂贵的重新创建。
    *   如果没有 `key`，React 默认使用索引（index）进行比较，这在列表顺序变化时会导致性能下降和状态错乱。
3.  **策略**：通过一轮遍历，处理常见的操作（如节点不变、节点属性更新、节点类型改变），对于复杂的节点移动，React 会采用一种高效的算法来最小化操作次数。

### 总结

1.  **Fiber 架构是核心**：它将同步不可中断的递归渲染，改造为**基于链表结构的、可中断的异步渲染**，通过**双缓存树**和**协作式调度**解决了主线程阻塞问题。
2.  **分阶段渲染**：**可中断的协调阶段**负责计算变更，**同步的提交阶段**负责执行变更，保证了视图更新的最终一致性。
3.  **Hooks 与 Fiber 绑定**：Hooks 的状态存储在 Fiber 节点的链表中，其调用顺序的稳定性是正确工作的前提。
4.  **合成事件与高效 Diff**：通过事件委托和智能的 Diffing 策略，提供了高性能的用户交互和视图更新体验。
5.  **并发是未来**：Fiber 架构为 `useTransition`、`Suspense` 等并发特性铺平了道路，使 React 能打造更响应的用户界面。