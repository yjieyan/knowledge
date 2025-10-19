# vuex 原理分析

Vuex 是 Vue 的官方状态管理库，它的原理涉及到响应式系统、组件通信、设计模式等多个重要概念。

---

## 1. Vuex 的核心概念回顾

Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式**。

### 1.1 基本结构
```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
})
```

---

## 2. Vuex 的核心原理

### 2.1 整体架构

1. **响应式状态**：使用 Vue 的响应式系统使 state 变成响应式
2. **提交机制**：通过 commit 方法触发 mutations
3. **分发机制**：通过 dispatch 方法触发 actions
4. **Getter 计算**：基于 state 的计算属性
5. **组件绑定**：通过 mixin 将 store 注入到所有组件

---

## 3. 源码原理深度解析

### 3.1 Store 类的核心实现

```javascript
class Store {
  constructor(options = {}) {
    const {
      state = {},
      mutations = {},
      actions = {},
      getters = {},
      plugins = []
    } = options

    // 初始化内部状态
    this._committing = false
    this._actions = Object.create(null)
    this._mutations = Object.create(null)
    this._wrappedGetters = Object.create(null)
    this._modules = new ModuleCollection(options)
    
    // 绑定 dispatch 和 commit 的上下文
    const store = this
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit(type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // 初始化根 state
    initState(this, state)
    
    // 初始化 mutations, actions, getters
    initMutations(this, mutations)
    initActions(this, actions)
    initGetters(this, getters)
    
    // 应用插件
    plugins.forEach(plugin => plugin(this))
  }

  get state() {
    return this._vm._data.$$state
  }

  set state(v) {
    console.error('不能直接修改 state，请使用 mutation')
  }

  commit(_type, _payload, _options) {
    // 统一参数处理
    const { type, payload } = unifyObjectStyle(_type, _payload, _options)
    
    const entry = this._mutations[type]
    if (!entry) {
      console.error(`[vuex] unknown mutation type: ${type}`)
      return
    }
    
    // 执行 mutation
    this._withCommit(() => {
      entry.forEach(function mutationIterator(handler) {
        handler(payload)
      })
    })
    
    // 通知订阅者
    this._subscribers.forEach(sub => sub({ type, payload }, this.state))
  }

  dispatch(_type, _payload) {
    const { type, payload } = unifyObjectStyle(_type, _payload)
    
    const entry = this._actions[type]
    if (!entry) {
      console.error(`[vuex] unknown action type: ${type}`)
      return
    }
    
    // 执行 action
    return entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)
  }

  _withCommit(fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}
```

### 3.2 响应式 State 的实现

这是 Vuex 最核心的部分——如何让 state 变成响应式的：

```javascript
function initState(store, state) {
  // 使用 Vue 实例来建立响应式
  store._vm = new Vue({
    data: {
      $$state: state
    }
  })
  
  // 启用严格模式
  if (store.strict) {
    enableStrictMode(store)
  }
}

function enableStrictMode(store) {
  // 在严格模式下，监听 state 的变化
  store._vm.$watch(function() {
    return this._data.$$state
  }, () => {
    // 如果 state 变化时不在 mutation 中，报错
    console.assert(store._committing, 
      `Do not mutate vuex store state outside mutation handlers.`)
  }, { deep: true, sync: true })
}
```

**关键点：**
- 使用 Vue 实例的 data 来实现响应式
- `$$state` 中的 `$$` 表示这是 Vue 内部属性，不会代理到 vm 上
- 通过 getter 访问 `this._vm._data.$$state`

### 3.3 Mutation 的实现

```javascript
function initMutations(store, mutations) {
  Object.keys(mutations).forEach(key => {
    store._mutations[key] = store._mutations[key] || []
    store._mutations[key].push(function wrappedMutationHandler(payload) {
      // 执行用户定义的 mutation
      mutations[key].call(store, store.state, payload)
    })
  })
}
```

### 3.4 Action 的实现

```javascript
function initActions(store, actions) {
  Object.keys(actions).forEach(key => {
    store._actions[key] = store._actions[key] || []
    store._actions[key].push(function wrappedActionHandler(payload) {
      // 给 action 提供上下文
      const context = {
        dispatch: store.dispatch,
        commit: store.commit,
        getters: store.getters,
        state: store.state,
        rootGetters: store.getters,
        rootState: store.state
      }
      
      let res = actions[key].call(store, context, payload)
      
      // 确保 action 返回 Promise
      if (!isPromise(res)) {
        res = Promise.resolve(res)
      }
      
      return res
    })
  })
}
```

### 3.5 Getter 的实现

```javascript
function initGetters(store, getters) {
  Object.keys(getters).forEach(key => {
    // 避免重复定义
    if (store._wrappedGetters[key]) {
      console.error(`[vuex] duplicate getter key: ${key}`)
      return
    }
    
    store._wrappedGetters[key] = function wrappedGetter(store) {
      return getters[key](
        store.state,
        store.getters,
        store.rootState,
        store.rootGetters
      )
    }
  })
  
  // 使用 computed 计算属性实现 getters
  const computed = {}
  Object.keys(store._wrappedGetters).forEach(key => {
    computed[key] = function() {
      return store._wrappedGetters[key](store)
    }
    
    // 定义 getter 的 get 方法
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true
    })
  })
  
  // 使用 Vue 的 computed 属性
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
```

---

## 4. 组件绑定的原理

### 4.1 Vue.use(Vuex) 的实现

```javascript
let Vue // 保存 Vue 的引用

export function install(_Vue) {
  // 避免重复安装
  if (Vue && _Vue === Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  Vue = _Vue
  
  // 应用 mixin
  applyMixin(Vue)
}

function applyMixin(Vue) {
  const version = Number(Vue.version.split('.')[0])
  
  if (version >= 2) {
    // Vue 2.x 使用 mixin
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // Vue 1.x 重写 _init 方法
    const _init = Vue.prototype._init
    Vue.prototype._init = function(options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }
  
  function vuexInit() {
    const options = this.$options
    
    // 注入 store
    if (options.store) {
      // 根组件
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      // 子组件
      this.$store = options.parent.$store
    }
  }
}
```

### 4.2 mapState, mapGetters, mapActions, mapMutations 原理

```javascript
// mapState 的简化实现
export function mapState(states) {
  const res = {}
  
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState() {
      const state = this.$store.state
      const getters = this.$store.getters
      
      // 支持函数形式
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
  })
  
  return res
}

// mapGetters 的简化实现
export function mapGetters(getters) {
  const res = {}
  
  normalizeMap(getters).forEach(({ key, val }) => {
    res[key] = function mappedGetter() {
      return this.$store.getters[val]
    }
  })
  
  return res
}

// 工具函数：统一处理数组和对象形式
function normalizeMap(map) {
  if (!isValidMap(map)) {
    return []
  }
  
  return Array.isArray(map)
    ? map.map(key => ({ key, val: key }))
    : Object.keys(map).map(key => ({ key, val: map[key] }))
}
```

---

## 5. 模块系统的原理

### 5.1 ModuleCollection 类

```javascript
class ModuleCollection {
  constructor(rawRootModule) {
    // 注册根模块
    this.register([], rawRootModule, false)
  }

  register(path, rawModule, runtime = true) {
    const newModule = new Module(rawModule, runtime)
    
    if (path.length === 0) {
      // 根模块
      this.root = newModule
    } else {
      // 子模块
      const parent = this.get(path.slice(0, -1))
      parent.addChild(path[path.length - 1], newModule)
    }

    // 注册嵌套模块
    if (rawModule.modules) {
      Object.keys(rawModule.modules).forEach(key => {
        this.register(path.concat(key), rawModule.modules[key], runtime)
      })
    }
  }
}
```

### 5.2 Module 类

```javascript
class Module {
  constructor(rawModule, runtime) {
    this.runtime = runtime
    this._children = Object.create(null)
    this._rawModule = rawModule
    this.state = rawModule.state || {}
  }

  addChild(key, module) {
    this._children[key] = module
  }

  removeChild(key) {
    delete this._children[key]
  }

  getChild(key) {
    return this._children[key]
  }

  // 获取命名空间的 mutations
  get mutations() {
    return this._rawModule.mutations || {}
  }

  // 获取命名空间的 actions
  get actions() {
    return this._rawModule.actions || {}
  }

  // 获取命名空间的 getters
  get getters() {
    return this._rawModule.getters || {}
  }
}
```

---

## 6. 插件系统的原理

### 6.1 插件机制

```javascript
class Store {
  constructor(options = {}) {
    // ... 其他初始化
    
    // 应用插件
    const plugins = options.plugins || []
    plugins.forEach(plugin => plugin(this))
  }

  subscribe(fn) {
    return genericSubscribe(fn, this._subscribers)
  }

  watch(getter, cb, options) {
    return this._vm.$watch(
      () => getter(this.state, this.getters),
      cb,
      options
    )
  }
}

// 订阅函数
function genericSubscribe(fn, subs) {
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
```

### 6.2 内置 logger 插件原理

```javascript
// 简化版的 logger 插件
function createLogger({
  collapsed = true,
  filter = (mutation, stateBefore, stateAfter) => true,
  transformer = state => state,
  mutationTransformer = mut => mut,
  logger = console
} = {}) {
  return store => {
    store.subscribe((mutation, state) => {
      // 过滤 mutation
      if (!filter(mutation, state, state)) return
      
      // 格式化和输出
      const time = new Date()
      const formattedTime = ` @ ${formatTime(time)}`
      const formattedMutation = mutationTransformer(mutation)
      const message = `mutation ${mutation.type}${formattedTime}`
      const startMessage = collapsed ? logger.groupCollapsed : logger.group
      
      try {
        startMessage.call(logger, message)
      } catch (e) {
        console.log(message)
      }
      
      logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', 
        transformer(store._vm._data.$$state))
      logger.log('%c mutation', 'color: #03A9F4; font-weight: bold', 
        formattedMutation)
      logger.log('%c next state', 'color: #4CAF50; font-weight: bold', 
        transformer(state))
      
      try {
        logger.groupEnd()
      } catch (e) {
        logger.log('—— log end ——')
      }
    })
  }
}
```

---

## 7. 严格模式的原理

### 7.1 严格模式实现

```javascript
function enableStrictMode(store) {
  // 使用 Vue 的 $watch 来监听 state 变化
  store._vm.$watch(function() {
    return this._data.$$state
  }, () => {
    // 如果 state 变化时不在 mutation 中，说明是非法修改
    console.assert(store._committing, 
      `Do not mutate vuex store state outside mutation handlers.`)
  }, { 
    deep: true, 
    sync: true  // 同步执行，立即检测
  })
}
```

**工作原理：**
1. 监听整个 state 对象的变化
2. 当 state 变化时，检查 `_committing` 标志
3. 如果 `_committing` 为 false，说明是在 mutation 外修改的 state
4. 在开发环境下报错

---

## 8. 数据流原理总结

### 8.1 完整的数据流

```
Component 
    → dispatch(Action) 
    → Action 
    → commit(Mutation) 
    → Mutation 
    → mutate State 
    → reactive update 
    → Component re-render
```

### 8.2 核心原理总结

1. **响应式 State**：利用 Vue 的响应式系统
2. **Mutation 同步**：确保状态变化的可追踪性
3. **Action 异步**：处理异步操作，最终提交 mutation
4. **Getter 计算**：基于 state 的派生数据
5. **模块化**：支持大型应用的状态分治
6. **插件化**：可扩展的插件机制

---

## 9. 现代替代方案

### 9.1 Pinia 的改进

Vuex 的下一代版本 Pinia 在原理上做了很多改进：

```javascript
// Pinia 的简化原理
function createPinia() {
  const state = ref({})
  const _p = []
  
  const pinia = {
    install(app) {
      // 更简单的注入机制
      app.provide(piniaSymbol, pinia)
    },
    
    use(plugin) {
      _p.push(plugin)
      return this
    },
    
    state,
    _p
  }
  
  return pinia
}
```

**主要改进：**
- 更简单的 API 设计
- 更好的 TypeScript 支持
- 组合式 API 优先
- 去除 mutation 概念

---

## 总结

1. **响应式核心**：使用 Vue 实例建立 state 的响应式
2. **状态变更**：通过 mutation 同步修改 state
3. **异步处理**：通过 action 处理异步操作
4. **计算属性**：通过 Vue 的 computed 实现 getters
5. **组件集成**：通过 mixin 将 store 注入所有组件
6. **模块系统**：支持大型应用的状态分治
7. **插件机制**：提供可扩展的插件系统
