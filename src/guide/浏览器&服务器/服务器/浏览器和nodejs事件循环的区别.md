# 浏览器和nodejs事件循环的区别

1.  **共同基础：什么是事件循环？**
2.  **浏览器中的事件循环**
3.  **Node.js 中的事件循环**
4.  **核心差异对比**
5.  **Node.js 新版与旧版的差异**
6.  **总结与流程图对比**

---

### 1. 共同基础：什么是事件循环？

事件循环是 JavaScript 实现**非阻塞 I/O** 和**异步编程**的基石。

它的核心机制是：

*   **单线程**：JavaScript 主线程是单线程的，意味着同一时间只能执行一个任务。
*   **任务队列**：异步操作（如 `setTimeout`、`fetch`、`fs.readFile`）在完成后，会将它们的回调函数放入相应的任务队列中等待。
*   **循环机制**：事件循环会不断地检查调用栈（Call Stack）是否为空。当调用栈为空时，它就从任务队列中取出一个任务并将其推入调用栈执行。

这个“不断检查-取出-执行”的过程，就是事件循环。

---

### 2. 浏览器中的事件循环
[浏览器事件循环](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop)
浏览器的事件循环由 **HTML5 规范**定义。它将异步任务分为两大类：**宏任务** 和 **微任务**。

#### **任务队列（Task Queues）**

*   **宏任务**：可以理解为每个“轮次”的事件循环只执行一个宏任务。
    *   **来源**：`setTimeout`、`setInterval`、`setImmediate` (非标准)、I/O、UI 渲染、`requestAnimationFrame`、主要的用户交互事件（如 `click`）。
    *   **注意**：实际上浏览器可能维护了多个宏任务队列（如交互队列、延时队列），但规范要求同源的同类型任务必须在同一队列。

*   **微任务**：在每个宏任务执行结束后、下一个宏任务开始前，必须清空当前所有的微任务。
    *   **来源**：`Promise.then()` / `Promise.catch()` / `Promise.finally()`、`queueMicrotask()`、`MutationObserver`。
    *   **特点**：微任务队列具有**最高优先级**，在当前宏任务后立即执行，且会一直执行直到微任务队列为空。

#### **浏览器事件循环流程**

1.  执行一个**宏任务**（如 `script` 整体代码）。
2.  执行过程中遇到异步代码，根据类型分发到对应的队列。
3.  当前宏任务执行完毕。
4.  检查**微任务队列**，依次执行所有微任务，直到队列清空。
5.  （可选）进行 **UI 渲染**（浏览器会根据策略决定是否渲染，通常每秒 60 次）。
6.  从**宏任务队列**中取出下一个宏任务，开始新的一轮循环。

**关键点：微任务在渲染之前执行。**

```javascript
console.log('script start'); // 宏任务 1

setTimeout(() => {
  console.log('setTimeout'); // 宏任务 2 的回调
}, 0);

Promise.resolve().then(() => {
  console.log('promise1'); // 微任务 1
}).then(() => {
  console.log('promise2'); // 微任务 2
});

console.log('script end'); // 宏任务 1 继续

// 输出顺序：
// 'script start'
// 'script end'
// 'promise1'
// 'promise2'
// 'setTimeout'
```

---

### 3. Node.js 中的事件循环

Node.js 的事件循环由 **libuv 库**实现，它更为复杂，将事件循环分成了**多个阶段**。每个阶段都有一个 **FIFO（先进先出）** 的回调队列。

#### **事件循环的六个阶段**

1.  **timers 阶段**：执行 `setTimeout()` 和 `setInterval()` 的回调。
2.  **pending callbacks 阶段**：执行延迟到下一个循环迭代的 I/O 回调（如操作系统错误）。
3.  **idle, prepare 阶段**：仅内部使用。
4.  **poll 阶段**：检索新的 I/O 事件；执行与 I/O 相关的回调（除了 close callbacks, timers, `setImmediate`）；Node 可能会在此阶段阻塞。
5.  **check 阶段**：执行 `setImmediate()` 的回调。
6.  **close callbacks 阶段**：执行一些关闭的回调（如 `socket.on('close', ...)`）。

#### **Node.js 事件循环流程（简化）**

1.  进入 timers 阶段，检查是否有到期的 timer，有则执行其回调。
2.  进入 poll 阶段：
    *   如果 poll 队列不为空，则同步执行队列里的回调，直到队列清空或达到系统限制。
    *   如果 poll 队列为空：
        *   如果代码中设置了 `setImmediate`，则结束 poll 阶段，进入 check 阶段。
        *   如果没有 `setImmediate`，则会等待新的 I/O 事件到来，并在此处阻塞。
3.  进入 check 阶段，执行所有 `setImmediate` 的回调。
4.  进入 close callbacks 阶段，执行 'close' 事件回调。
5.  开始新一轮循环。

#### **Node.js 中的微任务**

在 Node.js 中，**微任务**（主要是 Promise 和 `process.nextTick`）不属于以上任何一个阶段。它们拥有**更高的优先级**，会在**事件循环切换阶段之间**被执行。

*   `process.nextTick` 的优先级甚至**高于 Promise**，它拥有一个独立的 `nextTickQueue`。
*   在**每一个阶段结束后**，在进入下一个阶段之前，事件循环会先清空两个微任务队列：
    1.  先清空 `nextTickQueue`。
    2.  再清空 `microtask Queue`（Promise）。

---

### 4. 核心差异对比

| 特性 | 浏览器 | Node.js |
| :--- | :--- | :--- |
| **规范/实现** | 遵循 **WHATWG HTML** 规范 | 基于 **libuv** 库实现 |
| **结构** | **宏任务队列 + 微任务队列** | **多阶段（Phase）**，每个阶段对应一个宏任务队列 |
| **宏任务举例** | `setTimeout`, `setInterval`, I/O, UI 渲染, 事件 | `setTimeout`, `setInterval`, I/O, `setImmediate` |
| **微任务举例** | `Promise.then`, `queueMicrotask`, `MutationObserver` | `Promise.then`, `queueMicrotask`, **`process.nextTick`** |
| **微任务执行时机** | 在**每一个宏任务**执行完毕后 | 在**事件循环的每一个阶段切换之间** |
| **`process.nextTick`** | 不存在 | 有，且优先级**最高**，在所有 Promise 之前执行 |
| **`setImmediate`** | 非标准，只有 IE/Edge 支持 | 有，在 **check** 阶段执行 |
| **与 I/O 的协作** | I/O（如 `fetch`）由 Web API 处理，回调作为宏任务 | I/O 由 libuv 处理，回调在 **poll** 阶段执行 |

**关键差异示例：**

```javascript
// 在 Node.js 中运行
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// 输出顺序是不确定的！取决于当前循环的性能
// 因为 setTimeout 在 timers 阶段，setImmediate 在 check 阶段
// 进入事件循环时，如果 timer 已到期，则先输出 'timeout'，否则先输出 'immediate'
```

```javascript
// 在 I/O 回调中，顺序是确定的
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate')); 
  // 总是先输出 'immediate'，再输出 'timeout'
  // 因为 I/O 回调在 poll 阶段，之后直接进入 check 阶段，然后才是下一轮的 timers 阶段
});
```

---

### 5. Node.js 新版与旧版的差异

值得注意的是，新版本的 Node.js（大约 v11 之后）在行为上向浏览器靠拢。

*   **Node v11 之前**：在执行一个宏任务（如 `setTimeout`）后，不会清空微任务队列，而是会执行完当前阶段的所有宏任务后，才去清空微任务。
*   **Node v11 及之后**：**与浏览器保持一致**。在执行一个宏任务（如 `setTimeout`）后，会立即清空当前产生的所有微任务，再执行下一个宏任务。

---

### 总结

**浏览器事件循环（简化）：**
```
[执行一个宏任务] -> [清空所有微任务] -> [可能渲染] -> [取下一个宏任务]
```

**Node.js 事件循环（简化）：**
```
[Timers] -> [Pending Callbacks] -> [Idle/Prepare] -> [Poll] -> [Check] -> [Close Callbacks]
      ↓          ↓                   ↓             ↓        ↓           ↓
 [清空 nextTick 和 Microtask 队列]  [清空...]    [清空...]  [清空...]  [清空...]  [清空...]
```

**结论：**

1.  **架构不同**：浏览器是 **宏/微任务队列**，Node.js 是 **libuv 的多阶段**。
2.  **微任务执行时机**：浏览器在宏任务后；Node.js 在**阶段切换间**。
3.  **特有 API**：Node.js 有 `process.nextTick`（最高优）和 `setImmediate`（在 check 阶段）。
