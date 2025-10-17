# Vue3 源码解析

---

### 一、 核心架构与 Monorepo 结构

Vue 3 的源码采用 **Monorepo** 结构进行管理，使用 **pnpm workspace** 实现。这使得代码组织非常清晰，各模块职责分明。

*   **`packages/`** 目录下包含了所有独立的包：
    *   **`reactivity`**: **响应式系统**，独立的库，可与任何框架配合使用。
    *   **`runtime-core`**: **与平台无关的运行时核心**。实现组件创建、渲染、更新、VNode Diff 等核心逻辑。
    *   **`runtime-dom`**: **针对浏览器的运行时**。包装了 `runtime-core`，添加了 DOM 特有的 API（如 `document.createElement`）。
    *   **`compiler-core`**: **与平台无关的编译器核心**。实现模板解析、转换、代码生成的核心逻辑。
    *   **`compiler-dom`**: **针对浏览器的编译器**。扩展了 `compiler-core`，增加了对 HTML 特性和浏览器特有行为的处理。
    *   **`vue`**: **面向用户的完整版本**。引用了 `runtime-dom` 和 `compiler-dom`，并将其导出。

这种架构实现了 **出色的分层和模块化**。例如，你可以单独使用 `@vue/reactivity` 库，而不需要引入整个 Vue。

---

### 二、 响应式系统 (Reactivity System) - `packages/reactivity`

这是 Vue 3 性能飞跃和功能强大的基石，从 Vue 2 的 `Object.defineProperty` 全面转向 **`Proxy`**。

#### 1. 核心 API：`ref` 和 `reactive`

*   **`reactive`**:
    *   用于创建对象的深度响应式代理。
    *   **核心原理**：内部使用 `new Proxy(target, baseHandlers)`。`baseHandlers` 包含了 `get`、`set`、`deleteProperty` 等陷阱（trap）。

    ```javascript
    // 简化版原理
    function reactive(target) {
      const proxy = new Proxy(target, {
        get(target, key, receiver) {
          const res = Reflect.get(target, key, receiver);
          track(target, key); // 依赖收集
          if (isObject(res)) {
            return reactive(res); // 深度响应化
          }
          return res;
        },
        set(target, key, value, receiver) {
          const oldValue = target[key];
          const result = Reflect.set(target, key, value, receiver);
          if (hasChanged(value, oldValue)) {
            trigger(target, key); // 触发更新
          }
          return result;
        }
      });
      return proxy;
    }
    ```

*   **`ref`**:
    *   用于包装原始值（如 `number`, `string`）或任何值，使其成为响应式。
    *   **核心原理**：创建一个具有 `value` 属性的普通对象。对 `.value` 的访问通过类的 `getter/setter` 进行拦截。
    ```javascript
    // 简化版原理
    class RefImpl {
      constructor(value) {
        this._value = value;
      }
      get value() {
        track(this, 'value'); // 依赖收集
        return this._value;
      }
      set value(newVal) {
        if (hasChanged(newVal, this._value)) {
          this._value = newVal;
          trigger(this, 'value'); // 触发更新
        }
      }
    }
    function ref(value) {
      return new RefImpl(value);
    }
    ```

#### 2. 依赖收集 (Track) 与触发更新 (Trigger)

这是响应式系统的“神经中枢”。

*   **`targetMap` (WeakMap)**:
    *   全局的依赖存储结构。
    *   结构：`WeakMap<target, Map<key, Set<ReactiveEffect>>>`
    *   `WeakMap` 的键是原始对象 `target`，值是一个 `Map`。
    *   内层 `Map` 的键是 `target` 的属性 `key`，值是一个 `Set`，里面存储了所有依赖于这个 `key` 的 **副作用函数 (ReactiveEffect)**。

*   **`track(target, key)`**:
    *   在 `get` 操作中调用。
    *   它的作用就是：找到当前正在运行的副作用函数（`activeEffect`），然后把它添加到 `targetMap[target][key]` 对应的 `Set` 中。简单说就是 **“记录下谁用了我这个属性”**。

*   **`trigger(target, key)`**:
    *   在 `set` 操作中调用。
    *   它的作用是：从 `targetMap` 中找到 `target[key]` 对应的所有副作用函数 `effects`，然后 **依次执行它们**。简单说就是 **“通知所有用到这个属性的人，我变了！”**。

*   **`ReactiveEffect` 类**:
    *   这是一个包装类，代表一个可执行的副作用函数（如组件的渲染函数、`computed`、`watch`）。
    *   它有一个 `run` 方法，执行时会将自身设置为 `activeEffect`，然后执行原始函数。这样，在函数执行期间访问到的响应式属性，就能通过 `getter` 中的 `track` 正确地收集到这个 `effect` 作为依赖。

---

### 三、 编译与渲染 (Compiler & Renderer) - `packages/compiler-*` 与 `packages/runtime-*`

#### 1. 模板编译 (`compiler-core`)

Vue 的模板编译器是一个 **编译器**，它将 HTML 字符串模板编译为 **渲染函数 (render function)**。这个过程分为三步：

1.  **解析 (Parse)**：
    *   使用一个 **有限状态机** 和大量的正则表达式，将模板字符串解析成一个 **抽象语法树 (AST)**。
    *   AST 是一个 JSON 对象，它精确地描述了模板的语法结构（如元素、属性、文本、插值表达式 `{{ }}`、指令等）。

2.  **转换 (Transform)**：
    *   遍历 AST，并对其进行修改。这是 Vue 3 性能优化的关键一步。
    *   **Patch Flags (补丁标志)**：编译器会智能地分析动态绑定，并为动态节点打上不同的“标志”。例如：
        *   `1 /* TEXT */`：只有文本内容是动态的。
        *   `8 /* PROPS */`：只有 props 是动态的。
    *   这样在运行时，Diff 算法可以跳过静态内容的对比，直接定位到动态部分，极大提升性能。
    *   **Hoist Static**：将纯静态的节点提升到渲染函数之外，只在应用初始化时创建一次，之后每次渲染复用。

3.  **生成代码 (Code Generate)**：
    *   将优化后的 AST 转换为可执行的 JavaScript 代码字符串，即渲染函数的代码。
    *   例如，一个简单的模板 `<div>{{ msg }}</div>` 会被编译成：
    ```javascript
    import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

    export function render(_ctx, _cache, $props, $setup, $data, $options) {
      return (_openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.msg), 1 /* TEXT */))
    }
    ```
    *   注意最后的 `1 /* TEXT */`，这就是 **Patch Flag**。

#### 2. 运行时渲染器 (`runtime-core`)

渲染器接收编译产生的 **虚拟 DOM (VNode)** 树，并将其转换为真实的 DOM。它的核心是 `patch` 函数。

*   **`patch(oldVNode, newVNode, container)`**:
    *   比较新旧 VNode，找出差异，并高效地更新真实 DOM。
    *   **过程**：
        1.  **判断节点类型**：如果新旧 VNode 类型不同（如从 `div` 变为 `span`），则直接卸载旧节点，挂载新节点。
        2.  **精细化比较**：如果类型相同，则进入更细致的比较（`patchElement`）。
            *   **更新属性**：比较 `props` 的差异并更新。得益于 **Patch Flags**，如果标志是 `TEXT`，这里会跳过对 `class`, `style` 等属性的比较。
            *   **更新子节点**：这是 Diff 算法的核心。Vue 3 使用了 **快速 Diff 算法**，其核心步骤是：
                a. **从头同步**：从头部开始，遇到相同节点则 patch，直到不同。
                b. **从尾同步**：从尾部开始，遇到相同节点则 patch，直到不同。
                c. **处理剩余节点**：
                   *   如果新节点有剩余，老节点没剩余，则 **新增**。
                   *   如果老节点有剩余，新节点没剩余，则 **卸载**。
                   *   最复杂的情况：顺序未知。这里会利用 **`key`** 建立一个 `keyToNewIndexMap`，然后求出最长递增子序列，以此来最小化移动 DOM 的次数。

---

### 四、 组合式 API (Composition API) 的实现

组合式 API 本质上是 **在 `setup` 函数中运行的普通 JavaScript 函数**。

*   **`setup` 函数**：
    *   在组件实例创建完成后、挂载之前执行。
    *   它接收 `props` 和 `context` 参数。
    *   它的返回值会被暴露给模板和组件的其他选项（如 `methods`）。

*   **生命周期钩子的注入**：
    *   `onMounted`, `onUpdated` 等函数，内部原理是向当前组件实例（通过 `getCurrentInstance()` 获取）内部的一个队列里注入一个回调函数。
    *   当组件运行到相应的生命周期时（如在 `mounted` 时），就会执行这个队列里所有的回调。

*   **响应式数据的连接**：
    *   在 `setup` 中定义的 `ref` 或 `reactive` 变量，其依赖收集发生在渲染函数执行期间。
    *   当组件的渲染函数（由模板编译而来）执行时，会读取这些响应式变量，从而触发 `getter`，将 **当前组件的渲染 Effect**（一个 `ReactiveEffect` 实例）收集为依赖。
    *   当这些变量变化时，会触发这个渲染 Effect 重新执行，即重新渲染。

### 总结
Vue 3 的源码是一个设计精良的系统工程：

1.  **模块化**：通过 Monorepo 将响应式、编译、运行时彻底解耦，职责清晰。
2.  **响应式**：基于 `Proxy` 的重写，性能更强、功能更完善，并独立成库。
3.  **编译优化**：通过 **Patch Flags** 和 **静态提升** 等策略，将性能优化工作从运行时提前到编译时，为快速的运行时 Diff 打下基础。
4.  **运行时**：利用编译时的提示，实现了高效的 **快速 Diff 算法**。
5.  **组合式 API**：提供了一种更灵活的代码组织方式，其本身是建立在强大的响应式系统和组件实例生命周期之上的。