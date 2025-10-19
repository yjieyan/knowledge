# Vue3响应式原理
Vue 3 的响应式原理是其最重大的革新之一，它抛弃了 Vue 2 基于 `Object.defineProperty` 的实现，转而采用了现代浏览器支持的 `Proxy` API。这不仅解决了 Vue 2 的一些固有局限，还带来了更好的性能和更强大的功能。

---

### 1. 核心变革：从 `Object.defineProperty` 到 `Proxy`

在 Vue 2 中， `Object.defineProperty` 的局限性：
*   无法检测**属性的新增和删除**。
*   对**数组**的索引操作和 `length` 修改无法拦截。
*   需要递归遍历整个对象，初始化性能较差。

Vue 3 的 `Proxy` 完美地解决了这些问题。

**什么是 Proxy？**
`Proxy` 对象用于创建一个对象的代理，从而实现基本操作的拦截和自定义（如属性查找、赋值、枚举、函数调用等）。

**`Proxy` 的优势：**
*   **拦截能力更强：** 可以拦截多达13种操作，包括 `get`, `set`, `deleteProperty`, `has` 等。
*   **直接代理整个对象：** 不需要遍历每个属性，只需要代理一层。
*   **性能更好：** 惰性处理嵌套对象，只在被访问时才将其转换为响应式。

---

### 2. 核心实现：`reactive` 和 `effect`

Vue 3 的响应式核心主要围绕两个函数：`reactive` 和 `effect`。

#### a) `reactive` - 创建响应式对象

`reactive` 函数接收一个普通对象，返回该对象的响应式代理。

**简化实现：**

```javascript
// 用于存储原始对象到代理对象的映射，防止重复代理
const reactiveMap = new WeakMap();

function reactive(target) {
  // 如果已经是代理对象，直接返回
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }

  // 创建代理
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 追踪依赖
      track(target, key);
      
      const result = Reflect.get(target, key, receiver);
      
      // 如果获取的值是对象，则递归将其也转为响应式（惰性转换）
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      // 获取旧值
      const oldValue = target[key];
      
      // 设置新值
      const result = Reflect.set(target, key, value, receiver);
      
      // 只有在新旧值不同，或是新属性时，才触发更新
      if (result && (oldValue !== value || !target.hasOwnProperty(key))) {
        // 触发更新
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = target.hasOwnProperty(key);
      const result = Reflect.deleteProperty(target, key);
      
      // 只有删除成功且对象原本有这个属性时才触发更新
      if (result && hadKey) {
        trigger(target, key);
      }
      
      return result;
    }
  });

  reactiveMap.set(target, proxy);
  return proxy;
}
```

#### b) 依赖收集与触发更新：`track` 和 `trigger`

与 Vue 2 的 `Dep` 和 `Watcher` 类似，Vue 3 也有自己的依赖管理系统。

**数据结构：**
*   `targetMap`: 一个 `WeakMap`，键是原始对象 `target`，值是另一个 `Map`（`depsMap`）。
*   `depsMap`: 键是对象的属性 `key`，值是一个 `Set`（`dep`），里面存储了所有依赖于这个属性的 `effect`。
*   `dep`: 一个 `Set`，存储了所有依赖于某个属性的 `effect`（副作用函数）。

```javascript
// 全局的依赖存储
const targetMap = new WeakMap();

// 当前正在运行的 effect
let activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    // 创建一个新的 Set 来避免无限循环
    new Set(dep).forEach(effect => {
      // 如果 effect 有调度器，使用调度器，否则直接执行
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect();
      }
    });
  }
}
```

#### c) `effect` - 副作用函数

`effect` 是 Vue 3 中响应式的核心概念，相当于 Vue 2 中的 `Watcher`。它接收一个函数，这个函数就是副作用函数。

**简化实现：**

```javascript
function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      activeEffect = effectFn;
      return fn();
    } finally {
      activeEffect = null;
    }
  };
  
  // 将配置项挂载到 effectFn 上
  if (options.scheduler) {
    effectFn.scheduler = options.scheduler;
  }
  
  // 立即执行一次，进行依赖收集
  effectFn();
  
  return effectFn;
}
```

---

### 3. 完整工作流程

通过一个例子将整个流程串联起来：

```javascript
// 1. 创建响应式对象
const state = reactive({ 
  count: 0,
  user: { name: 'Alice' } // 嵌套对象
});

// 2. 创建副作用函数 (类似于 Vue 2 的 Watcher)
effect(() => {
  // 在首次执行时，会访问 state.count，触发 get 拦截
  console.log(`Count is: ${state.count}`);
  console.log(`User name is: ${state.user.name}`);
});
// 立即输出: "Count is: 0" 和 "User name is: Alice"

// 3. 修改数据，触发更新
state.count = 1; 
// 触发 set 拦截 -> trigger -> 重新执行 effect
// 输出: "Count is: 1"

state.user.name = 'Bob';
// 触发 user 对象的 get (拿到的是 user 的代理)，然后触发 name 的 set
// 输出: "User name is: Bob"

// 4. 新增属性
state.newProperty = 'hello';
// 触发 set 拦截 -> trigger -> 重新执行 effect
// 输出: "Count is: 1" 和 "User name is: Bob" (因为 effect 依赖了所有访问过的属性)

// 5. 删除属性
delete state.count;
// 触发 deleteProperty 拦截 -> trigger -> 重新执行 effect
// 输出: "Count is: undefined" 和 "User name is: Bob"
```

---

### 4. Vue 3 响应式的进阶特性

#### a) `ref` - 处理原始值

`Proxy` 只能代理对象，无法代理原始值（如 `number`, `string`）。`ref` 通过将一个原始值包装在 `{ value: ... }` 对象中来解决这个问题。

```javascript
function ref(value) {
  return reactive({ value });
}

// 或者更高效的实现：
function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value');
      return value;
    },
    set value(newVal) {
      if (newVal !== value) {
        value = newVal;
        trigger(refObject, 'value');
      }
    }
  };
  return refObject;
}
```

#### b) 调度器 - 实现异步批量更新

Vue 3 通过 `effect` 的 `scheduler` 选项来实现更灵活的更新控制。

```javascript
const queue = new Set();
let isFlushing = false;

effect(() => {
  console.log(state.count);
}, {
  scheduler: (effect) => {
    // 将 effect 加入队列，而不是立即执行
    queue.add(effect);
    
    if (!isFlushing) {
      isFlushing = true;
      Promise.resolve().then(() => {
        try {
          queue.forEach(e => e());
        } finally {
          queue.clear();
          isFlushing = false;
        }
      });
    }
  }
});
```

#### c) `computed` - 计算属性

计算属性是基于 `effect` 和 `ref` 的高级应用。

```javascript
function computed(getter) {
  let value;
  let dirty = true; // 脏检查标志
  
  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        trigger(obj, 'value');
      }
    }
  });
  
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };
  
  return obj;
}
```

---

### 5. 总结

| 特性 | Vue 2 | Vue 3 |
| :--- | :--- | :--- |
| **核心 API** | `Object.defineProperty` | `Proxy` |
| **数组监听** | 需要重写数组方法 | 直接支持 |
| **属性增删** | 需要 `Vue.set`/`Vue.delete` | 直接支持 |
| **初始化性能** | 需要递归遍历所有属性 | **惰性代理**，访问时才转换 |
| **嵌套对象** | 初始化时深度遍历 | 访问时惰性转换 |
| **代码维护性** | 代码分散在 Observer, Dep, Watcher | **组合式 API**，逻辑更集中 |

Vue 3 的响应式原理基于 `Proxy` 和 `Reflect`，通过 `reactive` 创建响应式代理，通过 `effect` 收集和触发依赖。其核心流程是：

1.  **响应化：** 使用 `Proxy` 代理对象，拦截 `get`, `set`, `deleteProperty` 等操作。
2.  **依赖收集：** 在 `get` 拦截中，通过 `track` 函数将当前活动的 `effect` 收集到全局的 `targetMap` 中。
3.  **触发更新：** 在 `set` 或 `deleteProperty` 拦截中，通过 `trigger` 函数找到对应的 `effect` 并执行。

这种实现不仅解决了 Vue 2 的诸多限制，还为 Tree-shaking、更好的 TypeScript 集成和更灵活的 Composition API 奠定了坚实的基础。