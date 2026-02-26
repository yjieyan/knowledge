# Vue3 基础

---

## 1. Vue 3 的核心变化

### 1.1 性能提升
- **更小的体积**：Tree-shaking 支持，核心体积减少 41%
- **更快的渲染**：基于 Proxy 的响应式系统，编译时优化
- **更好的 TypeScript 支持**：完全使用 TypeScript 重写

### 1.2 组合式 API
从选项式 API 转向组合式 API，提供更好的逻辑复用和类型推导。

---

## 2. 创建 Vue 3 应用

### 2.1 使用 CDN
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
  <div id="app">
    <button @click="count++">Count is: {{ count }}</button>
  </div>

  <script>
    const { createApp, ref } = Vue;
    
    createApp({
      setup() {
        const count = ref(0);
        return { count };
      }
    }).mount('#app');
  </script>
</body>
</html>
```

### 2.2 使用 Vite（推荐）
```bash
npm create vue@latest
cd my-project
npm install
npm run dev
```

### 2.3 基本应用实例
```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

---

## 3. 组合式 API 基础

### 3.1 `ref` 和 `reactive`

**`ref` - 处理基本类型**
```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 使用 ref 创建响应式数据
const count = ref(0)

// 修改 ref 的值需要使用 .value
const increment = () => {
  count.value++
}
</script>
```

**`reactive` - 处理对象类型**
```vue
<template>
  <div>
    <p>{{ user.name }} - {{ user.age }}</p>
    <button @click="updateUser">Update</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// 使用 reactive 创建响应式对象
const user = reactive({
  name: 'Alice',
  age: 25
})

// 直接修改属性，不需要 .value
const updateUser = () => {
  user.name = 'Bob'
  user.age += 1
}
</script>
```

### 3.2 `computed` 计算属性
```vue
<template>
  <div>
    <input v-model="firstName" placeholder="First Name">
    <input v-model="lastName" placeholder="Last Name">
    <p>Full Name: {{ fullName }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('')
const lastName = ref('')

// 计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`.trim()
})
</script>
```

### 3.3 `watch` 和 `watchEffect`

**`watch` - 精确监听**
```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)
const double = ref(0)

// 监听单个 ref
watch(count, (newValue, oldValue) => {
  double.value = newValue * 2
})

// 监听多个源
watch([count, double], ([newCount, newDouble], [oldCount, oldDouble]) => {
  console.log(`Count: ${newCount}, Double: ${newDouble}`)
})

// 监听 reactive 对象的特定属性
const state = reactive({ user: { name: 'Alice' } })
watch(
  () => state.user.name,
  (newName, oldName) => {
    console.log(`Name changed from ${oldName} to ${newName}`)
  }
)
</script>
```

**`watchEffect` - 自动追踪依赖**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)

// 自动追踪函数内使用的响应式依赖
watchEffect(() => {
  console.log(`Count is: ${count.value}`)
  // 当 count.value 变化时，这个函数会自动重新执行
})
</script>
```

---

## 4. 生命周期

Vue 3 的生命周期函数需要从 vue 中导入：

```vue
<template>
  <div>Lifecycle Demo</div>
</template>

<script setup>
import { onMounted, onUpdated, onUnmounted, ref } from 'vue'

const message = ref('Hello Vue 3')

onMounted(() => {
  console.log('组件挂载完成')
  // 在这里可以访问 DOM 元素
})

onUpdated(() => {
  console.log('组件更新完成')
})

onUnmounted(() => {
  console.log('组件卸载完成')
  // 清理工作，如取消定时器、事件监听器等
})

// 其他生命周期函数：
// onBeforeMount, onBeforeUpdate, onBeforeUnmount, onErrorCaptured
</script>
```

---

## 5. 条件渲染和列表渲染

### 5.1 条件渲染
```vue
<template>
  <div>
    <!-- v-if -->
    <p v-if="score >= 90">优秀</p>
    <p v-else-if="score >= 60">及格</p>
    <p v-else>不及格</p>

    <!-- v-show -->
    <div v-show="isVisible">显示/隐藏</div>

    <!-- 在 template 上使用 v-if -->
    <template v-if="user.isAdmin">
      <button>编辑</button>
      <button>删除</button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const score = ref(85)
const isVisible = ref(true)
const user = ref({ isAdmin: true })
</script>
```

### 5.2 列表渲染
```vue
<template>
  <div>
    <!-- 渲染数组 -->
    <ul>
      <li v-for="(item, index) in items" :key="item.id">
        {{ index + 1 }}. {{ item.name }}
      </li>
    </ul>

    <!-- 渲染对象 -->
    <ul>
      <li v-for="(value, key) in user" :key="key">
        {{ key }}: {{ value }}
      </li>
    </ul>

    <!-- 渲染数字范围 -->
    <span v-for="n in 5" :key="n">{{ n }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Orange' }
])

const user = ref({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
})
</script>
```

---

## 6. 事件处理

```vue
<template>
  <div>
    <!-- 内联事件处理 -->
    <button @click="count++">Add 1</button>
    <p>Count: {{ count }}</p>

    <!-- 方法事件处理 -->
    <button @click="greet">Greet</button>

    <!-- 事件修饰符 -->
    <form @submit.prevent="onSubmit">
      <input type="text">
      <button type="submit">Submit</button>
    </form>

    <!-- 按键修饰符 -->
    <input @keyup.enter="onEnter" placeholder="Press Enter">

    <!-- 事件参数 -->
    <button @click="sayHello('Vue 3')">Say Hello</button>

    <!-- 访问原生事件 -->
    <button @click="warn('Form cannot be submitted yet.', $event)">
      Submit
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)

const greet = (event) => {
  console.log('Hello Vue 3!')
  console.log(event.target.tagName) // BUTTON
}

const onSubmit = () => {
  console.log('Form submitted')
}

const onEnter = () => {
  console.log('Enter key pressed')
}

const sayHello = (message) => {
  console.log(`Hello ${message}!`)
}

const warn = (message, event) => {
  if (event) {
    event.preventDefault()
  }
  console.log(message)
}
</script>
```

---

## 7. 表单输入绑定

### 7.1 基础用法
```vue
<template>
  <div>
    <!-- 文本输入 -->
    <input v-model="text" placeholder="Edit me">
    <p>Message is: {{ text }}</p>

    <!-- 多行文本 -->
    <textarea v-model="message" placeholder="Add multiple lines"></textarea>
    <p>Multiline message is: {{ message }}</p>

    <!-- 复选框 -->
    <input type="checkbox" v-model="checked">
    <label>Checked: {{ checked }}</label>

    <!-- 多个复选框 -->
    <div>
      <input type="checkbox" value="Vue" v-model="checkedNames">
      <label>Vue</label>
      <input type="checkbox" value="React" v-model="checkedNames">
      <label>React</label>
      <input type="checkbox" value="Angular" v-model="checkedNames">
      <label>Angular</label>
      <p>Checked names: {{ checkedNames }}</p>
    </div>

    <!-- 单选按钮 -->
    <div>
      <input type="radio" value="One" v-model="picked">
      <label>One</label>
      <input type="radio" value="Two" v-model="picked">
      <label>Two</label>
      <p>Picked: {{ picked }}</p>
    </div>

    <!-- 选择框 -->
    <select v-model="selected">
      <option disabled value="">Please select one</option>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
    <p>Selected: {{ selected }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
const message = ref('')
const checked = ref(false)
const checkedNames = ref([])
const picked = ref('')
const selected = ref('')
</script>
```

### 7.2 修饰符
```vue
<template>
  <div>
    <!-- .lazy - 在 change 事件后同步 -->
    <input v-model.lazy="lazyText">
    <p>Lazy text: {{ lazyText }}</p>

    <!-- .number - 自动将输入转为数字 -->
    <input v-model.number="age" type="number">
    <p>Age type: {{ typeof age }}</p>

    <!-- .trim - 自动去除首尾空格 -->
    <input v-model.trim="trimmedText">
    <p>Trimmed text: "{{ trimmedText }}"</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lazyText = ref('')
const age = ref(0)
const trimmedText = ref('')
</script>
```

---

## 8. 组件基础

### 8.1 组件定义和使用
```vue
<!-- ChildComponent.vue -->
<template>
  <div class="child">
    <h3>Child Component</h3>
    <p>Message from parent: {{ message }}</p>
    <button @click="emitEvent">Send to Parent</button>
  </div>
</template>

<script setup>
// 定义 props
defineProps({
  message: String
})

// 定义 emits
const emit = defineEmits(['custom-event'])

const emitEvent = () => {
  emit('custom-event', 'Hello from child!')
}
</script>

<style scoped>
.child {
  border: 1px solid #ccc;
  padding: 20px;
  margin: 10px;
}
</style>
```

```vue
<!-- ParentComponent.vue -->
<template>
  <div>
    <h2>Parent Component</h2>
    <ChildComponent 
      :message="parentMessage" 
      @custom-event="handleChildEvent"
    />
    <p>Child said: {{ childMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const parentMessage = ref('Hello from parent!')
const childMessage = ref('')

const handleChildEvent = (message) => {
  childMessage.value = message
}
</script>
```

### 8.2 插槽
```vue
<!-- LayoutComponent.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">Default Header</slot>
    </header>
    <main>
      <slot>Default Content</slot>
    </main>
    <footer>
      <slot name="footer">Default Footer</slot>
    </footer>
  </div>
</template>

<!-- 使用插槽 -->
<template>
  <LayoutComponent>
    <template #header>
      <h1>My Custom Header</h1>
    </template>
    
    <p>This is the main content</p>
    
    <template #footer>
      <p>Custom Footer Content</p>
    </template>
  </LayoutComponent>
</template>
```

---

## 9. 样式和 Class 绑定

```vue
<template>
  <div>
    <!-- 绑定 HTML class -->
    <div :class="{ active: isActive, 'text-danger': hasError }">
      Class Binding
    </div>

    <!-- 绑定内联样式 -->
    <div :style="{ color: activeColor, fontSize: fontSize + 'px' }">
      Style Binding
    </div>

    <!-- 数组语法 -->
    <div :class="[activeClass, errorClass]">Array Syntax</div>

    <!-- 条件样式 -->
    <div :class="isActive ? 'active' : 'inactive'">
      Conditional Class
    </div>

    <!-- 绑定样式对象 -->
    <div :style="styleObject">Style Object</div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const isActive = ref(true)
const hasError = ref(false)
const activeColor = ref('red')
const fontSize = ref(30)

const activeClass = ref('active')
const errorClass = ref('text-danger')

const styleObject = reactive({
  color: 'blue',
  fontSize: '20px',
  fontWeight: 'bold'
})
</script>

<style scoped>
.active {
  background-color: #4CAF50;
  color: white;
}

.inactive {
  background-color: #f44336;
  color: white;
}

.text-danger {
  color: #dc3545;
}
</style>
```

---

## 10. 实际应用示例

### 10.1 Todo List 应用
```vue
<template>
  <div class="todo-app">
    <h1>Todo List</h1>
    
    <!-- 添加新任务 -->
    <form @submit.prevent="addTodo" class="add-todo">
      <input 
        v-model="newTodo" 
        placeholder="Add a new todo..."
        required
      >
      <button type="submit">Add</button>
    </form>

    <!-- 过滤选项 -->
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter"
        :class="{ active: currentFilter === filter }"
        @click="currentFilter = filter"
      >
        {{ filter }}
      </button>
    </div>

    <!-- 任务列表 -->
    <ul class="todo-list">
      <li 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :class="{ completed: todo.completed }"
      >
        <input 
          type="checkbox" 
          v-model="todo.completed"
        >
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">Delete</button>
      </li>
    </ul>

    <!-- 统计信息 -->
    <div class="stats">
      <p>Total: {{ todos.length }} | Completed: {{ completedCount }} | Pending: {{ pendingCount }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const newTodo = ref('')
const todos = ref([])
const currentFilter = ref('all')

// 计算属性
const filters = ['all', 'active', 'completed']

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed)
    case 'completed':
      return todos.value.filter(todo => todo.completed)
    default:
      return todos.value
  }
})

const completedCount = computed(() => 
  todos.value.filter(todo => todo.completed).length
)

const pendingCount = computed(() => 
  todos.value.filter(todo => !todo.completed).length
)

// 方法
const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
    saveTodos()
  }
}

const removeTodo = (id) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
  saveTodos()
}

// 本地存储
const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos.value))
}

const loadTodos = () => {
  const saved = localStorage.getItem('todos')
  if (saved) {
    todos.value = JSON.parse(saved)
  }
}

// 生命周期
onMounted(() => {
  loadTodos()
})
</script>

<style scoped>
.todo-app {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.add-todo {
  display: flex;
  margin-bottom: 20px;
}

.add-todo input {
  flex: 1;
  padding: 8px;
  margin-right: 10px;
}

.filters {
  margin-bottom: 20px;
}

.filters button {
  margin-right: 10px;
  padding: 5px 10px;
}

.filters button.active {
  background-color: #007bff;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list input[type="checkbox"] {
  margin-right: 10px;
}

.todo-list span {
  flex: 1;
}

.stats {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
```

---

## 总结

1. **组合式 API**：使用 `ref`, `reactive`, `computed`, `watch` 等函数
2. **`<script setup>`**：更简洁的组件语法
3. **响应式系统**：基于 Proxy，性能更好
4. **生命周期**：需要导入使用，如 `onMounted`, `onUpdated` 等
5. **模板语法**：与 Vue 2 基本保持一致，但性能更好
6. **组件通信**：`defineProps`, `defineEmits` 等编译器宏

