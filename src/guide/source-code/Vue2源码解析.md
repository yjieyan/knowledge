# Vue2 源码解析
### 总览：一个完整的挂载流程

一个 Vue 实例从创建到最终在页面上呈现，大致经历了以下关键步骤：

1.  **初始化（Init）**：初始化实例的生命周期、事件、渲染函数等。
2.  **编译（Compilation）**：将模板编译成渲染函数（如果使用运行时+编译器的 Vue 版本）。
3.  **建立响应式（Reactivity）**：处理 `data`、`props`、`computed`、`watch` 等，建立数据的响应式连接。
4.  **挂载（Mount）**：执行渲染函数生成 Virtual DOM，然后通过 Patch 过程创建真实 DOM 并插入到页面指定位置。
5.  **更新（Update）**：进入运行期，当响应式数据变化时，触发异步更新队列，重新渲染视图。

接下来，我们深入每个阶段。

---

### 阶段一：初始化（Init）

当我们执行 `new Vue(options)` 时，Vue 内部会启动初始化过程。

```javascript
const vm = new Vue({
  el: '#app',
  data: { message: 'Hello Vue!' },
  template: '<div>{{ message }}</div>'
})
```

1.  **合并选项**：
    *   Vue 会将用户传入的 `options` 与 Vue 内置的选项（如 `components`, `directives`, `_base` 等）进行合并。
    *   对于 `data`、`props`、`methods` 等，会进行策略合并，最终挂载到实例 `vm` 上。

2.  **初始化核心属性**：
    *   `initLifecycle(vm)`：初始化实例的生命周期状态，建立父子组件关系。设置 `$parent`, `$children`, `$root` 等属性。
    *   `initEvents(vm)`：初始化父组件传递的事件监听。
    *   `initRender(vm)`：初始化与渲染相关的属性和方法，如 `$slots`, `$scopedSlots`, `$createElement`（`_c` 和 `h` 函数）。
    *   此时，实例 `vm` 已经具备了基本的通信和渲染能力。

---

### 阶段二：模板编译

这个阶段不是必须的。
如果你使用 Vue 的**仅运行时**版本，或者直接写 `render` 函数，则会跳过此步骤。

1.  **模板来源的优先级**：
    Vue 会按照以下优先级获取模板：
    *   用户提供了 `render` 函数？ -> 直接使用。
    *   用户提供了 `template` 选项？ -> 编译它。
    *   用户提供了 `el` 选项？ -> 将 `el.outerHTML` 作为模板。

2.  **编译过程**：
    将模板字符串编译成渲染函数，这个过程包含三个步骤：
    *   **解析（Parse）**：将模板字符串解析成**抽象语法树（AST）**。AST 是一个用 JavaScript 对象描述的节点树，代表了模板的语法结构。
    *   **优化（Optimize）**：遍历 AST，标记出**静态节点**和静态根节点。这些节点在后续的更新渲染中永远不会改变，Vue 会在 Diff 过程中直接跳过它们，从而提升性能。
    *   **生成代码（Generate）**：将优化后的 AST 编译成可执行的 JavaScript 代码字符串，即渲染函数的代码。这个代码字符串最终会通过 `new Function()` 被转换成真正的 `render` 函数。

    **最终结果**：无论用户提供的是模板还是 `el`，Vue 的目标都是得到一个 `render` 函数。

---

### 阶段三：建立响应式（Reactivity）

这是 Vue 的“灵魂”所在，通过 `initState(vm)` 完成。

1.  **初始化数据**：
    *   `initProps(vm)`：处理 `props`，将其变为响应式，并代理到 `vm._props` 上。
    *   `initMethods(vm)`：将 `methods` 中的方法绑定到实例 `vm` 上。
    *   `initData(vm)`：**核心步骤**。遍历 `data` 函数返回的对象，通过 `Object.defineProperty` (Vue 2) 或 `Proxy` (Vue 3) 将其属性转换为 **getter/setter**。
        *   同时，它会为每个属性创建一个 **Dep** 实例（依赖收集器）。
    *   `initComputed(vm)` 和 `initWatch(vm)`：处理计算属性和侦听器。计算属性本质是一个惰性求值的 Watcher，而侦听器则是一个用户 Watcher。

2.  **依赖收集的准备工作**：
    此时，响应式数据已经准备就绪，它们身上的 getter/setter 已经建立。同时，一个关键的“观察者”——**渲染 Watcher** 即将被创建，它将负责视图的更新。

---

### 阶段四：挂载（Mount）

这是将 Virtual DOM 变成真实 DOM 并插入页面的过程，通过 `$mount` 方法触发。

1.  **创建渲染 Watcher**：
    *   在挂载开始时，Vue 会创建一个**渲染 Watcher**。这个 Watcher 的副作用函数就是执行 `updateComponent` 方法。

    ```javascript
    updateComponent = () => {
      // _render: 调用编译得到的 render 函数，生成 VNode（Virtual DOM）
      // _update: 将 VNode 与旧 VNode 对比，并将差异应用到真实 DOM 上（patch）
      vm._update(vm._render(), hydrating)
    }
    new Watcher(vm, updateComponent, ...);
    ```

2.  **执行初始渲染**：
    *   渲染 Watcher 被创建后，会立即执行一次 `updateComponent` 函数。
    *   `vm._render()`：执行渲染函数。在这个过程中，会读取模板中用到的响应式数据（例如 `{{ message }}` 会读取 `vm.message`）。**一旦读取数据，数据的 getter 就会被触发，当前这个渲染 Watcher 就会被收集到该数据的 Dep 中**。这就完成了**依赖收集**。
    *   `vm._update()`：将 `_render()` 返回的新 VNode 树传入。由于是首次渲染，没有旧的 VNode，所以会直接根据 VNode 创建真实的 DOM 元素。
    *   **Patch 过程**：递归地遍历 VNode 树，创建对应的真实 DOM 节点。最终，这个完整的 DOM 树会被插入到 `vm.$el`（即 `el` 选项对应的 DOM 元素，如 `#app`）中，替换掉原来的占位元素。

至此，页面上就显示出了 `data` 中初始数据所对应的视图。实例也进入了“已挂载”（Mounted）状态。

---

### 阶段五：更新（Update） - 运行期

挂载完成后，应用进入运行期。

1.  **触发更新**：
    当用户交互或异步操作导致响应式数据发生变化时（例如 `vm.message = 'Hi!'`），数据的 setter 会被触发。

2.  **通知依赖**：
    setter 会通知它对应的 Dep，Dep 会通知所有订阅它的 Watcher（包括我们的渲染 Watcher）：“数据变了！”

3.  **异步更新队列**：
    Vue 不会立即执行更新。而是将需要更新的 Watcher 推入一个**异步队列**。在下一个事件循环“tick”中，Vue 会清空这个队列，执行所有 Watcher 的 `run` 方法。

4.  **重新渲染**：
    渲染 Watcher 的 `run` 方法会再次执行 `updateComponent`。
    *   `vm._render()`：用**新的数据**再次生成**新的 VNode 树**。
    *   `vm._update()`：将**新的 VNode 树**与**上一次渲染的旧 VNode 树**进行对比（Diff 算法）。
    *   **Patch 过程**：计算出最小差异，然后只更新需要改变的真实 DOM 部分。

这个过程会在应用的整个生命周期中不断重复。

### 总结

我们可以将挂载过程简化为一个流程图：

``` 
new Vue(options)
      |
      v
初始化生命周期、事件、渲染功能
      |
      v
(如果有模板) 编译模板 -> 生成 render 函数
      |
      v
建立响应式系统 (initState)
      |
      v
调用 $mount -> 创建渲染 Watcher
      |
      v
执行初始渲染 (_render -> VNode -> _update -> Patch -> DOM)
      |
      v
触发 mounted 钩子
      |
      v
进入运行期 -> 数据变化 -> 触发 setter -> 通知 Watcher -> 异步更新 -> 重新渲染
```

**它从初始化开始，经过模板编译和响应式系统的建立，最终通过渲染 Watcher 和 Virtual DOM 的 Patch 机制，将数据映射为视图，并在此后通过响应式系统持续驱动视图更新。**