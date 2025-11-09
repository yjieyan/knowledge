# Vue组件之间通信⽅式有哪些

### 组件通信方式概览

这些方式可以根据通信的**方向**和**关系**分为几大类：

1.  **父子组件通信**：`props` / `$emit`， `$attrs` / `$listeners`， `$parent` / `$children`， `ref`
2.  **跨代/深层级组件通信**：`provide` / `inject`， `$attrs` / `$listeners`
3.  **全局/任意组件通信**：`Event Bus`， `Vuex` / `Pinia`
4.  **根实例访问**：`$root`

---

### 详细解析与Vue2/Vue3对比

#### 1. Props / `$emit` (最常用)

- **说明**：父组件通过 `props` 向子组件传递数据，子组件通过 `$emit` 触发事件，父组件监听事件来接收数据。
- **适用场景**：最基础、最常用的父子组件通信。
- **Vue 2 vs Vue 3**：
    - **基本用法完全一致**，是Vue的核心API，没有破坏性变化。
    - **Vue 3 细节**：
        - 在 `<script setup>` 中，需要使用 `defineProps` 和 `defineEmits` 编译器宏来声明，它们不需要导入。
        - `defineEmits` 会返回一个 `emit` 函数，而不是Vue 2中的 `this.$emit`。

**Vue 2 示例：**
```html
<!-- 子组件 -->
<script>
export default {
  props: ['message'],
  methods: {
    sendToParent() {
      this.$emit('child-event', 'Hello from child!');
    }
  }
}
</script>

<!-- 父组件 -->
<ChildComponent :message="parentMsg" @child-event="handleChildEvent" />
```

**Vue 3 示例 (使用 `<script setup>`)：**
```html
<!-- 子组件 -->
<script setup>
// 编译器宏，无需导入
const props = defineProps(['message'])
const emit = defineEmits(['child-event'])

const sendToParent = () => {
  emit('child-event', 'Hello from child!')
}
</script>

<!-- 父组件 (用法与Vue 2相同) -->
<ChildComponent :message="parentMsg" @child-event="handleChildEvent" />
```

---

#### 2. `$attrs` / `$listeners` (透传 Attribute)

- **说明**：
    - `$attrs`：包含父组件传递的、但没有在子组件的 `props` 中声明的所有 attribute（如 `class`, `style`, 自定义属性等）。
    - `$listeners` (Vue 2 only)：包含父组件在子组件上监听的所有事件监听器。
- **适用场景**：创建高阶组件或包装组件，需要将父组件的属性和事件“透传”到内部的子组件。
- **Vue 2 vs Vue 3**：
    - **重大变化**：**Vue 3 中移除了 `$listeners`**。
    - 在 Vue 3 中，`$attrs` **包含了所有传下来的 attribute，包括事件监听器**。事件监听器会以 `onXxx` 的形式存在于 `$attrs` 中。
    - 在 Vue 3 的 `<script setup>` 中，需要使用 `useAttrs()` API 来访问。

**Vue 2 示例：**
```html
<!-- 子组件 (BaseButton.vue) -->
<template>
  <button v-bind="$attrs" v-on="$listeners">
    <slot />
  </button>
</template>
<script>
export default {
  inheritAttrs: false // 防止属性落到根元素上
}
</script>
```

**Vue 3 示例：**
```html
<!-- 子组件 (BaseButton.vue) -->
<template>
  <!-- $attrs 现在包含了所有属性和事件 -->
  <button v-bind="$attrs">
    <slot />
  </button>
</template>
<script setup>
defineOptions({
  inheritAttrs: false
})
import { useAttrs } from 'vue'
const attrs = useAttrs() // 在JS中访问
</script>
```

---

#### 3. `$parent` / `$children` (直接访问)

- **说明**：通过组件实例直接访问父组件或子组件。
- **适用场景**：紧急情况或简单场景，**不推荐使用**，因为它破坏了组件的封装性，使代码难以理解和维护。
- **Vue 2 vs Vue 3**：
    - **Vue 3 中移除了 `$children`**。
    - `$parent` 在 Vue 3 中依然存在，但同样不推荐使用。

---

#### 4. `ref` (模板引用)

- **说明**：给子组件打一个“标签”，父组件可以直接拿到子组件的实例并调用其方法或访问其数据。
- **适用场景**：父组件需要直接调用子组件的方法（如表单验证、播放器控制）。
- **Vue 2 vs Vue 3**：
    - **语法变化**：
        - Vue 2：`this.$refs.childName`
        - Vue 3 (Composition API)：声明一个同名的 `ref` 变量。
    - 在 `<script setup>` 中，子组件的属性和方法默认是**关闭的**，需要使用 `defineExpose` 宏显式暴露。

**Vue 2 示例：**
```html
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
</template>
<script>
export default {
  mounted() {
    this.$refs.childRef.someMethod() // 直接调用子组件方法
  }
}
</script>

<!-- 子组件 -->
<script>
export default {
  methods: {
    someMethod() { ... }
  }
}
</script>
```

**Vue 3 示例：**
```html
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
</template>
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  childRef.value.someMethod() // 通过 .value 访问
})
</script>

<!-- 子组件 (ChildComponent.vue) -->
<script setup>
import { defineExpose } from 'vue'

const someMethod = () => { ... }

// 必须显式暴露，父组件才能访问到
defineExpose({
  someMethod
})
</script>
```

---

#### 5. `$root` (根实例)

- **说明**：访问当前组件树的根实例。
- **适用场景**：小型应用，偶尔用于存储一些全局状态或方法，但远不如 Vuex/Pinia 专业。
- **Vue 2 vs Vue 3**：
    - 依然存在，但使用场景更少。

---

#### 6. Event Bus (事件总线)

- **说明**：创建一个空的 Vue 实例作为中央事件总线，通过 `$emit` 和 `$on` 来进行任意组件间的通信。
- **适用场景**：简单的跨组件通信，或小型项目。在中大型项目中，状态管理库是更好的选择。
- **Vue 2 vs Vue 3**：
    - **重大变化**：**Vue 3 中移除了 `$on`, `$off`, `$once` 实例方法**。
    - 因此，在 Vue 3 中不能再使用 `new Vue()` 来创建 Event Bus。
    - **替代方案**：使用外部的、实现了事件发射器接口的库，例如 **`mitt`** 或 `tiny-emitter`。

**Vue 2 实现：**
```javascript
// eventBus.js
import Vue from 'vue'
export const eventBus = new Vue()

// Component A
eventBus.$emit('my-event', data)

// Component B
eventBus.$on('my-event', (data) => { ... })
```

**Vue 3 实现 (使用 mitt)：**
```javascript
// eventBus.js
import mitt from 'mitt'
export const eventBus = mitt()

// Component A
eventBus.emit('my-event', data)

// Component B
eventBus.on('my-event', (data) => { ... })
```

---

#### 7. Vuex (状态管理)

- **说明**：专为 Vue.js 应用程序开发的**状态管理模式 + 库**。它采用集中式存储管理应用的所有组件的状态。
- **适用场景**：中大型单页应用，需要共享的状态复杂，组件通信频繁。
- **Vue 2 vs Vue 3**：
    - **Vuex 4.x** 用于 Vue 3，API 与 Vuex 3.x (for Vue 2) **基本相同**。
    - 主要区别是版本匹配和更好的 TypeScript 集成。
    - **重要趋势**：虽然 Vuex 依然可用，但 Vue 官方**现在更推荐使用 [Pinia](https://pinia.vuejs.org/)** 作为默认的状态管理库。

**Pinia vs Vuex:**
- **更简单的 API**：没有 `mutations`，只有 `state`, `getters`, `actions`。
- **完美的 TypeScript 支持**。
- **组合式 API 风格**，与 Vue 3 的 Composition API 完美契合。
- **模块化设计**：默认就是模块化的，无需复杂的嵌套模块。

---

### 总结与选择建议

| 通信方式 | Vue 2 | Vue 3 | 推荐度 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **Props / `$emit`** | ✅ | ✅ (语法微调) | ⭐⭐⭐⭐⭐ | **父子通信**首选 |
| **`$attrs` / `$listeners`** | ✅ | ✅ (`$listeners` 合并入 `$attrs`) | ⭐⭐⭐⭐ | **透传**属性与事件 |
| **`ref`** | ✅ | ✅ (语法变化，需 `defineExpose`) | ⭐⭐⭐⭐ | 父调子方法 |
| **`$parent` / `$children`** | ✅ | ❌ (`$children` 已移除) | ⭐ | **不推荐**，破坏封装性 |
| **`$root`** | ✅ | ✅ | ⭐ | 小型应用，访问根实例 |
| **Event Bus** | ✅ (基于 `new Vue()`) | ❌ (需使用 `mitt` 等库) | ⭐⭐ | 简单**任意组件**通信 |
| **Vuex** | ✅ (Vuex 3) | ✅ (Vuex 4) | ⭐⭐⭐ (但更推荐Pinia) | 中大型应用**状态管理** |
| **Provide / Inject** | ✅ | ✅ (Composition API 增强) | ⭐⭐⭐⭐ | **跨代/深层**组件通信 |
| **Pinia** | ✅ (可通过组合式API) | ✅ (**官方推荐**) | ⭐⭐⭐⭐⭐ | **任何规模**的状态管理 |

**现代 Vue 3 开发选型建议：**

1.  **父子通信**：首选 **`props` / `emit`**。
2.  **深层级/爷孙通信**：使用 **`provide` / `inject`**。
3.  **父组件需要调用子组件方法**：使用 **`ref`** 和 `defineExpose`。
4.  **构建通用组件（如UI库）**：熟练掌握 **`v-bind="$attrs"`**。
5.  **需要共享状态**：直接上 **Pinia**，它已经成为 Vue 生态的新标准。