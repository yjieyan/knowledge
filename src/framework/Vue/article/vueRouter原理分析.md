# vueRouter原理分析

1.  **前端路由的核心是什么？**
2.  **Vue Router 的安装与初始化过程**
3.  **路由模式（Hash vs History）的原理与实现**
4.  **路由匹配的核心：Matcher 与 Route 对象**
5.  **视图渲染的核心：RouterView 与 RouterLink 组件**
6.  **导航守卫的工作流程**
7.  **总结与流程图**

---

### 1. 前端路由的核心是什么？

在传统的多页面应用中，路由是由服务器控制的。每次 URL 变化都会向服务器发起请求，服务器返回一个新的 HTML 页面。

而在 **SPA（单页面应用）** 中，我们的应用只有一个 HTML 页面。**前端路由的核心就是在不刷新页面的情况下，通过监听 URL 的变化，动态地切换渲染不同的视图（组件），从而模拟出多页面应用的效果。**

Vue Router 就是 Vue.js 官方的路由管理器，它实现了这一核心功能。

---

### 2. Vue Router 的安装与初始化过程

当我们调用 `Vue.use(VueRouter)` 时，会发生两件关键事情：

1.  **全局混入（Mixin）**：Vue Router 会通过 Vue 的 `mixin` 功能，在**每一个 Vue 组件的 `beforeCreate` 生命周期钩子**中注入路由相关的逻辑。
    *   在根实例（`this.$options.router` 存在）上，它定义了响应式的 `_route` 属性（`this._routerRoot._route`），并将 `$route` 和 `$router` 挂载到组件实例上，使其成为可访问的。
    *   这个 `_route` 属性就是当前路由对象的响应式引用。它的变化会触发依赖它的组件（主要是 `RouterView`）重新渲染。

2.  **注册全局组件**：全局注册 `RouterView` 和 `RouterLink` 两个组件，这样我们就可以在模板中直接使用 `<router-view>` 和 `<router-link>`。

**初始化流程**：
```javascript
const router = new VueRouter({ ... });
const app = new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
```
在 `new VueRouter()` 时，内部会创建一个 **Matcher**（匹配器）和 **History**（历史记录管理）对象。在根 Vue 实例创建时，通过 `beforeCreate` 钩子调用 `router.init(app)` 方法，启动路由。

---

### 3. 路由模式（Hash vs History）的原理与实现

这是 Vue Router 最核心的差异点。它通过一个抽象的 `History` 类，派生出不同的具体模式实现。

#### **Hash 模式**

*   **原理**：利用 URL 中 `#` 后面的部分（hash）来实现路由。**改变 hash 不会导致浏览器向服务器发送请求**。
*   **实现**：
    1.  **监听变化**：通过监听 `window` 的 `hashchange` 事件来感知 URL 的变化。
    2.  **改变 URL**：通过 `window.location.hash` 直接赋值来改变 URL，或者使用 `history.pushState`/`history.replaceState`（为了保持 API 统一，即使是在 Hash 模式下也优先使用这些方法）。
*   **特点**：
    *   兼容性好（支持到 IE8）。
    *   服务器无需任何特殊配置。
    *   URL 中带有 `#`，不够美观。

#### **History 模式**

*   **原理**：利用 HTML5 History API (`pushState`, `replaceState`, `popstate`) 来操作浏览器的会话历史栈，从而改变 URL 而不刷新页面。
*   **实现**：
    1.  **改变 URL**：使用 `history.pushState(state, title, url)` 或 `history.replaceState(...)` 来向历史栈添加记录或修改当前记录。**这个方法不会触发 `popstate` 事件**。
    2.  **监听变化**：
        *   **用户点击浏览器前进/后退按钮**：会触发 `window` 的 `popstate` 事件。
        *   **在代码中调用 `router.push`**：Vue Router 会先进行路由匹配和导航守卫的解析，最后才调用 `history.pushState`。
*   **特点**：
    *   URL 更美观，与普通 URL 无异（例如 `https://example.com/user/1`）。
    *   **需要服务器端支持**！因为如果你直接访问一个 History 模式下的路由（如 `/user/1`），服务器上没有这个真实资源，会返回 404。解决方法是在服务器端配置一个“回退路由”，将所有不存在的路径都重定向到 `index.html`。

**抽象 History 类**：它定义了统一的接口（如 `transitionTo`， `push`， `go`），具体的 HashHistory 和 HTML5History 类去实现监听 URL 变化和改变 URL 的具体方法。

---

### 4. 路由匹配的核心：Matcher 与 Route 对象

当我们定义路由配置 `routes: [...]` 时，Vue Router 在内部会创建一个 **Matcher**。

*   **Matcher**：它的核心作用是，给定一个 URL 路径，快速地找到与之匹配的**路由记录（RouteRecord）**，并生成一个**标准化后的 Route 对象**。
*   **Route 对象 (`$route`)**：这是一个普通的对象，它包含了当前路由的信息，如 `path`, `params`, `query`, `hash`, `fullPath`, `matched` 等。其中 `matched` 是一个数组，它包含了当前路由匹配的所有**嵌套路由记录**，这对于 `RouterView` 的层级渲染至关重要。
*   **路径匹配算法**：Vue Router 使用 **路径到正则表达式的转换库**（如 `path-to-regexp`）来将我们定义的路径字符串（如 `/user/:id`）编译成正则表达式，然后用它来匹配当前路径，并提取出动态片段（如 `:id`）作为 `params`。

---

### 5. 视图渲染的核心：RouterView 与 RouterLink 组件

#### **`<router-view>`**

这是一个**函数式组件**，它是路由渲染的出口。它的渲染逻辑非常巧妙：

1.  **标记深度**：在渲染过程中，`<router-view>` 会通过父链向上查找，确定自己在嵌套路由中的**深度**（第几层）。
2.  **获取匹配的路由记录**：它从当前响应式的 `$route` 对象中，根据自身的深度，从 `$route.matched` 数组中取出对应层级的**路由记录（RouteRecord）**。
3.  **渲染对应组件**：从找到的路由记录中获取 `component` 配置，然后使用该组件进行渲染。它本质上就是一个**动态组件**，根据当前路由状态决定渲染什么。

```javascript
// RouterView 渲染逻辑简化版
render (_, { props, children, parent, data }) {
  // 标记深度
  let depth = 0;
  while (parent && parent._routerRoot !== parent) {
    if (parent.$vnode && parent.$vnode.data.routerView) {
      depth++;
    }
    parent = parent.$parent;
  }
  data.routerView = true; // 标记自己是一个 router-view

  // 从 matched 数组中获取对应层级的记录
  const matched = this.$route.matched[depth];
  const component = matched ? matched.components[this.name] : null;

  // 渲染该组件
  return h(component, data, children);
}
```

#### **`<router-link>`**

这是一个用于用户点击导航的组件。

1.  **渲染为 `<a>` 标签**：它最终会渲染成一个 `<a>` 标签，并通过 `to` prop 生成正确的 `href` 属性。
2.  **点击拦截**：它会监听点击事件，调用 `router.push()` 或 `router.replace()` 来进行编程式导航，而不是真的跳转页面。
3.  **活动状态**：它会根据当前路由和 `to` 指向的路由，自动为元素添加 `router-link-active` 或 `router-link-exact-active` 类名，方便样式定制。

---

### 6. 导航守卫的工作流程

导航守卫是 Vue Router 最强大的特性之一，它允许我们在路由导航发生前、发生后进行拦截或执行一些操作。

当调用 `router.push(location)` 时，会触发一次**导航解析流程**：

1.  **在当前组件中调用离开守卫**（`beforeRouteLeave`）。
2.  **全局前置守卫**（`router.beforeEach`）。
3.  **在重用的组件里调用更新守卫**（`beforeRouteUpdate`， 例如 `/user/1` -> `/user/2`）。
4.  **在路由配置里调用独享守卫**（`beforeEnter`）。
5.  **在被激活的组件里调用进入守卫**（`beforeRouteEnter`）。
6.  **全局解析守卫**（`router.beforeResolve`）。
7.  **导航被确认**。
8.  **调用全局后置钩子**（`router.afterEach`）。
9.  **触发 DOM 更新**：更新响应式的 `$route` 对象，导致 `RouterView` 组件重新渲染。
10. **调用 `beforeRouteEnter` 守卫中传给 `next` 的回调函数**，并将组件实例作为参数传入。

这个流程是一个**异步解析管道**，任何一个守卫中调用 `next(false)` 可以中止导航，调用 `next('/new-path')` 可以重定向。

---

### 7. 总结与核心流程图

**Vue Router 的核心原理可以概括为：**

1.  **作为插件安装**，通过全局混入和组件注册，为 Vue 实例注入路由能力。
2.  **基于模式（Hash/History）** 来监听 URL 变化（`hashchange` / `popstate`）和改变 URL。
3.  **内部 Matcher** 根据 URL 路径匹配路由配置，生成标准化的 Route 对象。
4.  **响应式系统** 将当前 Route 对象变为响应式数据，其变化会驱动视图更新。
5.  **RouterView 组件** 作为渲染出口，根据当前 Route 和自身深度，从 `matched` 数组中取出对应组件进行渲染。
6.  **导航守卫** 提供了一个可扩展的、异步的导航控制流程。

**核心数据流图**：

```
URL Change (用户操作或代码) 
    -> History 模块监听并触发回调 
    -> 调用 `router.transitionTo()` 
    -> Matcher 匹配出目标 Route 
    -> 执行导航守卫队列 
    -> 确认导航 
    -> 更新响应式的 `$route` 对象 
    -> `RouterView` 重新渲染（因为依赖了 `$route`）
```
