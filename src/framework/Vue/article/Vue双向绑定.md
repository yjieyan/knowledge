# Vue 数据双向绑定深度解析

## 本质与核心概念

Vue 的数据双向绑定本质上是一个**响应式系统**，通过数据变化自动更新视图，同时通过用户交互更新数据。

### 响应式系统基本原理
- **数据劫持**：监听数据对象的所有属性变化
- **依赖收集**：建立数据与视图的依赖关系
- **派发更新**：数据变化时通知所有依赖进行更新

## Vue 2.x 与 Vue 3.x 

### Vue 2.x - Object.defineProperty
```javascript
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        // 触发更新
      }
    }
  })
}
```

**局限性**：
- 无法检测对象属性的添加/删除
- 数组变异方法需要重写
- 性能开销随数据量增长

### Vue 3.x - Proxy 实现响应式

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key) // 依赖收集
      return Reflect.get(obj, key)
    },
    set(obj, key, value) {
      const result = Reflect.set(obj, key, value)
      trigger(obj, key) // 触发更新
      return result
    }
  })
}
```

**Proxy 优势**：
- 支持整个对象的监听，包括新增/删除属性
- 更好的性能表现
- 原生支持数组变化检测

## 依赖收集与触发更新

### 依赖收集系统
```javascript
let activeEffect = null

class Dep {
  constructor() {
    this.subscribers = new Set()
  }
  
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }
  
  notify() {
    this.subscribers.forEach(effect => effect())
  }
}

function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}
```

### 完整的响应式系统
```javascript
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  
  dep.depend()
}

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  if (dep) {
    dep.notify()
  }
}
```

## ref 的实现

```javascript
function ref(value) {
  return {
    get value() {
      track(this, 'value')
      return value
    },
    set value(newValue) {
      value = newValue
      trigger(this, 'value')
    }
  }
}
```

## v-model 的改进与实现

### Vue 2.x 的 v-model
```html
<!-- 语法糖 -->
<input v-model="message">

<!-- 等价于 -->
<input 
  :value="message" 
  @input="message = $event.target.value">
```

### Vue 3.x 的 v-model 改进

#### 1. 支持多个 v-model
```html
<CustomComponent v-model:title="pageTitle" v-model:content="pageContent" />

<!-- 等价于 -->
<CustomComponent 
  :title="pageTitle"
  @update:title="pageTitle = $event"
  :content="pageContent" 
  @update:content="pageContent = $event" />
```

#### 2. 自定义修饰符
```html
<CustomComponent v-model.capitalize="text" />
```

### v-model 在组件中的实现

```vue
<!-- CustomInput.vue -->
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

#### 带参数和修饰符的 v-model
```vue
<template>
  <input
    :value="props.modelValue"
    @input="emitValue($event.target.value)"
  >
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

function emitValue(value) {
  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  emit('update:modelValue', value)
}
</script>
```

## 源码层面的关键实现

### 1. 响应式核心 - reactive.ts
```typescript
export function reactive(target: object) {
  const proxy = new Proxy(target, baseHandlers)
  return proxy
}

const baseHandlers: ProxyHandler<object> = {
  get: createGetter(),
  set: createSetter()
}

function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    track(target, key) // 依赖收集
    return res
  }
}

function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const oldValue = (target as any)[key]
    const result = Reflect.set(target, key, value, receiver)
    if (hasChanged(value, oldValue)) {
      trigger(target, key) // 触发更新
    }
    return result
  }
}
```

### 2. 编译时优化

Vue 3 在编译阶段对 v-model 进行优化：
- 静态提升
- 补丁标志 (Patch Flags)
- 树结构摇动 (Tree Shaking)

## 性能优化策略

1. **懒响应式**：只有被访问的属性才会被代理
2. **缓存访问**：避免重复的依赖收集
3. **批量更新**：异步更新队列避免重复渲染
4. **编译器优化**：编译时标记静态内容

Vue 的数据双向绑定经历了从 `Object.defineProperty` 到 `Proxy` 的重大改进：

- **更强大的监听能力**：支持整个对象和数组的全面监听
- **更好的性能**：减少初始化开销，优化更新机制
- **更灵活的 API**：改进的 v-model 支持多绑定和自定义修饰符
- **更好的 TypeScript 支持**：完整的类型推断
