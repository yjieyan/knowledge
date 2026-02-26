# Vue

Vue 是一套用于构建用户界面的**渐进式 JavaScript 框架**。

它的核心思想是**数据驱动视图**和**组件化开发**。

*   **渐进式**： 可以从简单的页面交互开始，逐步引入路由、状态管理、构建工具等，应用到复杂的单页应用。
*   **数据驱动视图**： 你只需要关心数据的变化，Vue 会自动帮你更新到 DOM，这极大地简化了 DOM 操作。
*   **组件化**： 将页面拆分成独立、可复用的组件，每个组件包含自己的逻辑、样式和结构，便于开发和维护。
*   **易学易用**： 基于标准 HTML、CSS 和 JavaScript，并提供了清晰的 API 和丰富的文档，上手速度快。

### 核心概念（基础与核心）

1.  **Vue 实例与生命周期**
    *   `new Vue()`： 每个 Vue 应用都是通过创建一个新的 Vue 实例开始的。
    *   ** vue2 生命周期钩子**： `beforeCreate`, `created`, `beforeMount`, `mounted`, `beforeUpdate`, `updated`, `beforeDestroy`, `destroyed`。理解它们在哪个阶段被调用至关重要。
    *   ** vue3 生命周期钩子**： `onBeforeMount`, `onMounted`, `onBeforeUpdate`, `onUpdated`, `onBeforeUnmount`, `onUnmounted`, `onErrorCaptured`, `onRenderTracked`(仅在开发模式下有效), `onRenderTriggered`(仅在开发模式下有效),`onActivated`(仅在 keep-alive 组件中有效), `onDeactivated`(仅在 keep-alive 组件中有效)。

2.  **模板语法**
    *   **插值**： `{{ }}` Mustache 语法。
    *   **指令**： 带有 `v-` 前缀的特殊属性。
        *   `v-bind`： 动态绑定属性（简写 `:`）。
        *   `v-on`： 监听 DOM 事件（简写 `@`）。
        *   `v-model`： 在表单元素上创建双向数据绑定。
        *   `v-if` / `v-else-if` / `v-else`： 条件渲染。
        *   `v-show`： 条件展示（通过 CSS 的 `display` 属性）。
        *   `v-for`： 列表渲染。

3.  **计算属性和侦听器**
    *   `computed`： 基于它们的响应式依赖进行缓存的派生数据。适合进行复杂逻辑计算。
    *   `watch`： 观察和响应 Vue 实例上的数据变动。适合在数据变化时执行异步或开销较大的操作。
    > [computed与watch的区别](./article/computed与watch的区别.md)

4.  **Class 与 Style 绑定**
    *   使用 `v-bind:class` 和 `v-bind:style` 实现动态的类名和样式。

5.  **条件渲染与列表渲染**
    *   `v-if` vs `v-show`： `v-if` 是真正的条件渲染，有更高的切换开销；`v-show` 只是简单地切换 CSS，有更高的初始渲染开销。
    *   `v-for` 与 `key`： 使用 `v-for` 时必须提供 `key` 属性，以便 Vue 跟踪每个节点的身份，高效地更新虚拟 DOM。

6.  **事件处理**
    *   `v-on` 或 `@` 监听事件。
    *   事件修饰符： `.stop`, `.prevent`, `.capture`, `.self`, `.once`, `.passive`。
    *   按键修饰符： `.enter`, `.tab`, `.delete` 等。

7.  **组件基础**
    *   **组件定义**： 一个 Vue 组件本质上是一个拥有预定义选项的 Vue 实例。
    > 组件和 Vue 实例使用相同的配置选项；"预定义"指的是组件在创建之前就已经定义好了它的结构、行为和样式；
    *   **组件注册**： 全局注册 `Vue.component` 和局部注册。
    *   **Props**： 父组件向子组件传递数据。
    *   **自定义事件**： 子组件向父组件传递数据（`$emit`）。

---

### 三、进阶与工程化

1.  **组件深入**
    *   **组件通信**：
        *   Props Down / Events Up： 最基本的通信方式。
        *   `$refs`： 访问子组件实例或子元素。
        *   **Provide / Inject**： 跨层级组件通信。
        *   **Event Bus**： 简单的跨组件通信（适用于小型应用）。
        *   **Vuex**： 官方状态管理库，用于复杂应用的数据流管理。
    *   **插槽**： `slot` 和 `slot-scope`（Vue 2），用于内容分发。
    *   **动态组件 & 异步组件**： `:is` 和 `import()` 实现按需加载。

2.  **Vue Router（官方路由管理器）**
    *   路由配置、动态路由、嵌套路由。
    *   编程式导航： `router.push`, `router.replace`。
    *   导航守卫： `beforeEach`, `beforeRouteEnter` 等，用于权限控制。

3.  **Vuex（官方状态管理库）**
    *   **核心概念**：
        *   `State`： 单一状态树。
        *   `Getters`： 从 state 中派生的状态。
        *   `Mutations`： 唯一更改 state 的方法，必须是同步函数。
        *   `Actions`： 提交 mutation，可以包含任意异步操作。
        *   `Modules`： 将 store 分割成模块。

4.  **Vue CLI（标准化脚手架工具）**
    *   快速创建、构建和管理 Vue 项目。
    *   理解其背后的 Webpack 配置。

5.  **单文件组件**
    *   文件扩展名为 `.vue`。
    *   将模板 (`<template>`)、逻辑 (`<script>`) 和样式 (`<style>`) 封装在单个文件中。

---

### 四、深入理解与性能优化

1.  **响应式原理**
    *   **核心**： `Object.defineProperty`（Vue 2） / `Proxy`（Vue 3）。
    *   **理解**： Vue 如何追踪依赖，在属性被访问和修改时通知变化。
    *   **注意事项**：
        *   **对象**： Vue 无法检测到对象属性的添加或删除，需要使用 `Vue.set` / `this.$set`。
        *   **数组**： 变异方法（如 `push`, `pop`, `splice` 等）能被侦测，但直接通过索引设置项或修改长度不能被检测。
    > [Vue2响应式原理](./article/Vue2响应式原理.md)
    > [Vue3响应式原理](./article/Vue3响应式原理.md)

2.  **虚拟 DOM 和 Diff 算法**
    *   **为什么需要虚拟 DOM？** 提供一种在内存中描述真实 DOM 的方式，通过高效的 Diff 算法计算出最小变更，再批量更新真实 DOM，从而提高性能。
    *   **Diff 策略**： 同层比较、深度优先、通过 `key` 复用节点。
    > [Vue虚拟DOM和Diff算法](./article/Vue虚拟DOM和Diff算法.md)

3.  **生命周期钩子的适用场景**
    *   [在 `created` 还是 `mounted` 发起 AJAX 请求？](./article/在created还是mounted发起AJAX请求.md)
    *   在 `beforeDestroy` 中清除定时器、解绑全局事件。
    *   [理解 `updated` 钩子的风险](./article/理解updated钩子的风险.md)（避免在此钩子中改变状态，可能导致无限更新循环）。

4.  **nextTick 的工作原理**
    > [nextTick 原理](./article/nextTick原理.md)
    *   Vue 是异步执行 DOM 更新的。
    *   `nextTick` 允许你在 DOM 更新循环结束之后执行延迟回调，用于获取更新后的 DOM。

5.  **高级组件模式**
    *   **Render 函数与 JSX**： 在需要完全编程能力时，使用 JavaScript 代替模板。
    *   **高阶组件**： 用于逻辑复用。
    *   **递归组件**： 实现树形结构等。

6.  **性能优化**
    *   **代码分割/懒加载**： 使用异步组件和 `import()` 语法。
    *   **计算属性缓存**： 善用 `computed`。
    *   `v-for` 和 `v-if` 不要用在同一个元素上（`v-for` 优先级更高）。
    *   **对象/数组的稳定引用**： 避免不必要的渲染。
    *   **使用 `v-show` 复用 DOM**： 在需要频繁切换时。
    *   **使用 `v-once` 和 `v-memo`**： 对静态内容或特定条件进行缓存。

### 五、更多

#### 相关资料
   Vue3 官方文档: https://cn.vuejs.org/
   Vue3 工程源码地址: https://github.com/vuejs/core
   相关生态: https://github.com/sonicoder86/awesome-vue-3

#### 源码分析
* [Vue2源码解析](./article/Vue2源码解析.html)
* [Vue2响应式原理](./article/Vue2响应式原理.html)
* [Vue生命周期](./article/Vue生命周期.html)
* [Vue3基础](./article/Vue3基础.html)
* [Vue2与Vue3对比](./article/Vue2VsVue3.html)
* [Vue3源码分析](./article/Vue3源码分析.html)
* [vuex原理分析](./article/vuex原理分析.html)
* [vueRouter原理分析](./article/vueRouter原理分析.html)
* [VueCli原理分析](./article/VueCli原理分析.html)
* [VueSSR原理分析](./article/VueSSR原理分析.html)

#### 设计
* [Vue3设计实现一个弹窗组件](./article/Vue3设计实现一个弹窗组件.html)
* [实现一个简单的脚手架](./article/实现一个简单的脚手架.html)
