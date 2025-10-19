# Vue双向绑定
---

### 1. 核心概念：什么是双向绑定？

**双向绑定** 指的是在 **数据模型（Data）** 和 **视图（View）** 之间建立的一种自动同步机制：

*   **数据 -> 视图：** 当数据发生变化时，视图会自动更新。
*   **视图 -> 数据：** 当用户操作视图（如在输入框中输入内容）时，对应的数据也会自动更新。

**在 Vue 中的体现：** 主要通过 `v-model` 指令实现。

```html
<!-- 视图（View） -->
<template>
  <input v-model="message" type="text">
  <p>{{ message }}</p>
</template>

<script>
export default {
  data() {
    return {
      // 数据模型（Data）
      message: 'Hello Vue!'
    }
  }
}
</script>
```
当你在输入框中修改文本时，`<p>` 标签中的内容会实时更新；反之，如果在代码中修改了 `message` 的值，输入框和 `<p>` 标签的内容也会同步更新。

---

### 2. `v-model` 的本质：语法糖

**`v-model` 并不是一个魔法指令，它本质上是一个语法糖。** 它背后是两部分操作的结合：

1.  **将 `value` 属性绑定到数据（Data -> View）**
2.  **监听 `input` 事件来更新数据（View -> Data）**

上面的例子实际上等价于：

```html
<template>
  <input 
    :value="message" 
    @input="message = $event.target.value"
    type="text"
  >
  <p>{{ message }}</p>
</template>
```

**解释：**
*   `:value="message"`：将输入框的 value 属性与数据 `message` 绑定。当 `message` 改变时，输入框的值会更新。
*   `@input="message = $event.target.value"`：监听输入框的 `input` 事件。当用户输入时，将输入框的最新值赋值给 `message`。

**`v-model` 的职责就是简化这个过程。**

---

### 3. 不同表单元素上的 `v-model`

Vue 很智能，它会根据不同的表单元素，自动适配不同的属性和事件：

| 元素 | 绑定的属性 | 监听的事件 | 等价形式 |
| :--- | :--- | :--- | :--- |
| `<input type="text">` | `value` | `input` | `:value + @input` |
| `<textarea>` | `value` | `input` | `:value + @input` |
| `<input type="checkbox">` | `checked` | `change` | `:checked + @change` |
| `<input type="radio">` | `checked` | `change` | `:checked + @change` |
| `<select>` | `value` | `change` | `:value + @change` |

**示例：复选框**
```html
<!-- 使用 v-model -->
<input type="checkbox" v-model="isChecked">

<!-- 等价形式 -->
<input 
  type="checkbox" 
  :checked="isChecked" 
  @change="isChecked = $event.target.checked"
>
```

---

### 4. 在自定义组件上实现 `v-model`

这是 Vue 组件化开发中非常重要的一部分。默认情况下，组件上的 `v-model` 会使用 `value` 属性和 `input` 事件。

**子组件 (`CustomInput.vue`):**
```html
<template>
  <input
    :value="value" <!-- 1. 将内部的 input 的 value 与 props 的 value 绑定 -->
    @input="$emit('input', $event.target.value)" <!-- 2. 在 input 事件时，向父组件抛出 input 事件 -->
  >
</template>

<script>
export default {
  props: ['value'] // 接收父组件通过 v-model 传递的值
}
</script>
```

**父组件：**
```html
<template>
  <!-- 3. 在父组件中使用 v-model -->
  <CustomInput v-model="message" />
  <!-- 等价于： -->
  <!-- <CustomInput :value="message" @input="message = $event" /> -->
</template>
```

#### Vue 2 与 Vue 3 的区别

在 **Vue 2** 中，默认就是使用 `value` 属性和 `input` 事件。

在 **Vue 3** 中，为了更好的兼容性，`v-model` 的默认行为发生了变化：
*   默认使用 `modelValue` 作为 prop
*   默认使用 `update:modelValue` 作为事件

**Vue 3 自定义组件 `v-model`：**

**子组件 (`CustomInput.vue`):**
```html
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>
```

**父组件：**
```html
<template>
  <CustomInput v-model="message" />
  <!-- 等价于： -->
  <!-- <CustomInput :modelValue="message" @update:modelValue="message = $event" /> -->
</template>
```

#### 多个 `v-model` 绑定 (Vue 3 特性)

Vue 3 允许在同一个组件上绑定多个 `v-model`。

**子组件 (`UserForm.vue`):**
```html
<template>
  <input :value="firstName" @input="$emit('update:firstName', $event.target.value)">
  <input :value="lastName" @input="$emit('update:lastName', $event.target.value)">
</template>

<script>
export default {
  props: ['firstName', 'lastName'],
  emits: ['update:firstName', 'update:lastName']
}
</script>
```

**父组件：**
```html
<template>
  <UserForm 
    v-model:firstName="user.firstName" 
    v-model:lastName="user.lastName" 
  />
</template>
```

---

### 5. 底层原理：响应式系统

双向绑定的实现，底层依赖于 Vue 的**响应式系统**。

**Vue 2 基于 `Object.defineProperty`：**
1.  **数据劫持：** Vue 遍历 data 对象的所有属性，使用 `Object.defineProperty` 将它们转换为 getter/setter。
2.  **依赖收集：** 在 getter 中，将依赖（Watcher）收集到 Dep 中。
3.  **派发更新：** 在 setter 中，当数据变化时，通知 Dep 中的所有 Watcher 进行更新。
4.  **视图更新：** Watcher 触发组件的重新渲染。

**Vue 3 基于 `Proxy`：**
1.  **代理拦截：** 使用 `Proxy` 代理整个对象，可以拦截包括属性添加、删除在内的多种操作。
2.  **惰性响应：** 只有在访问属性时才会递归将其转换为响应式，性能更好。
3.  **依赖跟踪与触发：** 原理类似，但实现更高效，能检测到更多类型的变化。

---

### 6. `.sync` 修饰符 (Vue 2)

在 Vue 2 中，除了 `v-model`，还有一个 `.sync` 修饰符用于实现父子组件的双向绑定，它本质上是 `v-model` 的另一种形式。

**父组件：**
```html
<ChildComponent :title.sync="pageTitle" />
<!-- 等价于 -->
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />
```

**子组件：**
```javascript
this.$emit('update:title', newTitle);
```

在 Vue 3 中，`.sync` 修饰符已被移除，其功能被合并到了 `v-model` 中（即 `v-model:title` 的形式）。

### 总结

Vue 的双向绑定是一个集**指令、事件、属性、响应式系统**于一体的高级特性：

1.  **核心指令：** `v-model` 是其语法糖，本质是 `:value + @input`（或 Vue 3 的 `:modelValue + @update:modelValue`）。
2.  **底层支撑：** 依赖于 Vue 的响应式系统（Vue 2 的 `Object.defineProperty` / Vue 3 的 `Proxy`）来实现数据的监听和视图的更新。
3.  **组件通信：** 在自定义组件上，`v-model` 是一种标准的父子组件通信方式，用于同步某个值。
4.  **演进：** 从 Vue 2 到 Vue 3，`v-model` 变得更加灵活和强大，支持多个绑定，并统一了 `.sync` 的功能。
