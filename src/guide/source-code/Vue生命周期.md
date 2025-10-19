# Vue2 生命周期、Vue3 生命周期
Vue 组件的生命周期定义了组件从创建到销毁的整个过程中，在特定阶段会自动执行的“钩子函数”。

---

### 第一部分：Vue 2 生命周期

Vue 2 的生命周期可以分为四个主要阶段：**创建、挂载、更新、销毁**。

#### 各阶段详解

**1. 创建阶段**
*   **`beforeCreate`**
    *   **时机：** 在实例初始化之后，数据观测 (`data observer`) 和 event/watcher 事件配置之前被调用。
    *   **特点：** 此时无法访问到 `data`、`computed`、`methods` 等。
    *   **使用场景：** 通常用于一些初始化非响应式的变量。

*   **`created`**
    *   **时机：** 在实例创建完成后被立即调用。在这一步，实例已完成以下配置：数据观测、属性和方法的运算、watch/event 事件回调。
    *   **特点：** 可以访问到 `data`、`computed`、`methods` 等。**但 `$el` 属性尚不可用**，DOM 还未生成。
    *   **使用场景：** 这是最常用的钩子之一！常用于进行**异步数据请求**、初始化一些不依赖 DOM 的数据。

**2. 挂载阶段**
*   **`beforeMount`**
    *   **时机：** 在挂载开始之前被调用。相关的 `render` 函数首次被调用。**该钩子在服务器端渲染期间不被调用。**
    *   **特点：** 模板已在内存中编译好，但尚未挂载到页面中。

*   **`mounted`**
    *   **时机：** 实例被挂载后调用，这时 `vm.$el` 已替换为真正的 DOM 元素。
    *   **特点：** 可以操作 DOM 了。**但不保证所有子组件也都一起被挂载。** 如果需要等待整个视图都渲染完毕，可以在内部使用 `this.$nextTick`。
    *   **使用场景：** 用于执行需要操作 DOM 的代码、初始化第三方库（如图表库）、监听自定义事件等。

**3. 更新阶段** (当数据变化时触发)
*   **`beforeUpdate`**
    *   **时机：** 数据更新时调用，发生在虚拟 DOM 重新渲染和打补丁之前。
    *   **特点：** 可以在该钩子中进一步地更改状态，不会触发附加的重渲染过程。**访问到的 DOM 是更新前的状态。**
    *   **使用场景：** 用于在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。

*   **`updated`**
    *   **时机：** 由于数据更改导致的虚拟 DOM 重新渲染和打补丁完毕之后调用。
    *   **特点：** 组件的 DOM 已经更新。**同样不保证所有子组件都更新完毕。**
    *   **使用场景：** 执行依赖于新 DOM 的操作。但要避免在这个钩子里修改状态，否则可能导致无限更新循环！

**4. 销毁阶段**
*   **`beforeDestroy`**
    *   **时机：** 实例销毁之前调用。在这一步，实例仍然完全可用。
    *   **特点：** 这是销毁前的最后机会。
    *   **使用场景：** **这是最重要的清理时机！** 用于清除定时器、取消未完成的网络请求、解绑自定义事件监听器等，防止内存泄漏。

*   **`destroyed`**
    *   **时机：** 实例销毁后调用。对应 Vue 实例的所有指令都被解绑，所有事件监听器被移除，所有子实例也都被销毁。
    *   **特点：** 几乎什么事都做不了了。

---

### 第二部分：Vue 3 生命周期

Vue 3 的生命周期在概念上与 Vue 2 基本一致，但有一些重要的变化：
1.  `beforeDestroy` 更名为 `beforeUnmount`
2.  `destroyed` 更名为 `unmounted`
3.  所有生命周期钩子都需要从 Vue 中导入，并在 `setup()` 函数中使用。
4.  Composition API 提供了对应的“生命周期注册函数”，名称前加 `on`。

#### Vue 3 选项式 API vs 组合式 API 生命周期映射

| Vue 2 钩子 | Vue 3 选项式 API | Vue 3 组合式 API ( inside `setup()` ) |
| :--- | :--- | :--- |
| `beforeCreate` | ❌ **不再需要** | 使用 `setup()` 本身替代 |
| `created` | ❌ **不再需要** | 使用 `setup()` 本身替代 |
| `beforeMount` | `beforeMount` | `onBeforeMount` |
| `mounted` | `mounted` | `onMounted` |
| `beforeUpdate` | `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `updated` | `onUpdated` |
| `beforeDestroy` | `**beforeUnmount**` | `onBeforeUnmount` |
| `destroyed` | `**unmounted**` | `onUnmounted` |
| `errorCaptured` | `errorCaptured` | `onErrorCaptured` |
| - | `renderTracked` (Dev) | `onRenderTracked` (Dev) |
| - | `renderTriggered` (Dev) | `onRenderTriggered` (Dev) |

#### 组合式 API 使用示例

```html
<script>
import { onMounted, onUpdated, onUnmounted, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    // 生命周期函数可以多次调用，并按注册顺序执行
    onMounted(() => {
      console.log('组件挂载完成!')
      // 初始化操作，如获取数据
    })

    onUpdated(() => {
      console.log('组件更新了!')
      // DOM 更新后的操作
    })

    onUnmounted(() => {
      console.log('组件卸载了!')
      // 清理操作，如清除定时器、取消请求
    })

    // 可以再注册一个 onMounted，它们会按顺序执行
    onMounted(() => {
      console.log('这是第二个 mounted 钩子')
    })

    return {
      count
    }
  }
}
</script>
```

**关于 `setup()` 替代 `beforeCreate` 和 `created`：**
在 `setup()` 函数中，你可以直接编写原本需要在 `created` 中执行的代码（如发起请求、初始化数据）。因为 `setup()` 的执行时机相当于 Vue 2 的 `beforeCreate` 和 `created` 之间，此时组件实例尚未完全创建，但响应式数据、计算属性、方法等已经可用。

---

### 第三部分：对比总结与最佳实践

#### 核心变化总结

1.  **命名变化：** `beforeDestroy` -> `beforeUnmount`，`destroyed` -> `unmounted`。新名称更语义化。
2.  **API 风格：** Vue 3 组合式 API 使用 `onXxx` 的形式注册生命周期钩子，使其更函数式，并且可以在一个组件中多次使用同一个钩子。
3.  **`setup()` 替代：** `beforeCreate` 和 `created` 被 `setup()` 函数取代。

#### 常用生命周期钩子实践

| 钩子 | 常用操作 |
| :--- | :--- |
| **`created` / `setup()`** | **异步数据请求**、初始化非 DOM 相关的数据、与后端的 WebSocket 连接。 |
| **`mounted` / `onMounted`** | **操作 DOM**、初始化依赖 DOM 的第三方库（如地图、图表）、监听原生 DOM 事件。 |
| **`beforeUpdate` / `onBeforeUpdate`** | 在更新前获取 DOM 状态（如滚动位置）。 |
| **`updated` / `onUpdated`** | 在 DOM 更新后执行操作（谨慎使用，避免循环更新）。 |
| **`beforeUnmount` / `onBeforeUnmount`** | **清理定时器**、**取消网络请求**、**解绑自定义事件**、取消订阅。 |

#### 代码示例：一个完整的 Vue 3 组件

```html
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="count++">Increment</button>
    <button @click="stopTimer">Stop Timer</button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    let timer = null

    // 相当于 mounted
    onMounted(() => {
      console.log('Component is mounted!')
      timer = setInterval(() => {
        count.value++
      }, 1000)
    })

    // 相当于 beforeUnmount
    onUnmounted(() => {
      console.log('Component is about to unmount!')
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    })

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    return {
      count,
      stopTimer
    }
  }
}
</script>
```

### 总结

*   **Vue 2** 的钩子直接定义为组件选项的方法。
*   **Vue 3** 保持了选项式 API 的兼容，但在组合式 API 中，它们是以 `onXxx` 函数的形式在 `setup()` 中注册的。
