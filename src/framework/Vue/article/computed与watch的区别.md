# computed与watch的区别

在 Vue.js 中，`computed`（计算属性）和 `watch`（侦听器）都是用于响应数据变化的机制，但它们在设计理念、使用场景和实现方式上有着本质的区别。

## 基本概念

### Computed（计算属性）

计算属性是基于它们的响应式依赖进行缓存的派生值。只有在相关响应式依赖发生改变时才会重新计算。

```javascript
// 计算属性示例
computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName
  },
  reversedMessage() {
    return this.message.split('').reverse().join('')
  }
}
```

### Watch（侦听器）

侦听器用于观察和响应 Vue 实例上的数据变化，当需要在数据变化时执行异步或开销较大的操作时使用。

```javascript
// 侦听器示例
watch: {
  firstName(newVal, oldVal) {
    console.log(`firstName 从 ${oldVal} 变为 ${newVal}`)
  },
  'user.profile.age': {
    handler(newVal, oldVal) {
      console.log(`年龄从 ${oldVal} 变为 ${newVal}`)
    },
    immediate: true,
    deep: true
  }
}
```

## 核心区别深度分析

### 1. 设计目的与使用场景

#### Computed 的设计目的
- **数据派生**：基于现有数据计算新的数据
- **模板简化**：避免在模板中编写复杂的表达式
- **响应式依赖**：自动追踪依赖，依赖变化时自动更新

**适用场景**：
- 格式化或转换显示数据
- 基于多个数据源计算单一结果
- 需要缓存的计算结果

```javascript
// 计算属性适用场景示例
computed: {
  // 格式化显示
  formattedPrice() {
    return '¥' + this.price.toFixed(2)
  },
  
  // 基于多个数据源计算
  canSubmit() {
    return this.username && this.email && this.agreeTerms
  },
  
  // 复杂计算逻辑
  paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize
    return this.data.slice(start, start + this.pageSize)
  }
}
```

#### Watch 的设计目的
- **副作用执行**：在数据变化时执行有副作用的操作
- **异步操作**：处理需要异步响应的数据变化
- **复杂响应逻辑**：需要访问新旧值的响应逻辑

**适用场景**：
- 数据变化时执行异步请求
- 数据验证
- 执行开销较大的操作
- 需要知道变化前后的值

```javascript
// 侦听器适用场景示例
watch: {
  // 异步操作
  async searchQuery(newQuery) {
    if (newQuery.length < 3) return
    
    this.loading = true
    try {
      const response = await fetch(`/api/search?q=${newQuery}`)
      this.results = await response.json()
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      this.loading = false
    }
  },
  
  // 数据验证
  email(newEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    this.emailValid = emailRegex.test(newEmail)
  },
  
  // 复杂响应逻辑
  selectedItem(newItem, oldItem) {
    if (oldItem) {
      this.saveItem(oldItem)
    }
    this.loadItemDetails(newItem)
  }
}
```

### 2. 响应机制与依赖追踪

#### Computed 的响应机制

计算属性使用 Vue 的响应式系统进行**自动依赖追踪**：

```javascript
computed: {
  computedValue() {
    // Vue 会自动追踪 this.a 和 this.b 作为依赖
    return this.a + this.b
  }
}
```

**内部实现原理**：
1. **首次计算**：执行计算函数，收集所有访问的响应式属性作为依赖
2. **依赖建立**：建立计算属性与依赖属性之间的订阅关系
3. **缓存机制**：依赖未变化时直接返回缓存值
4. **惰性更新**：只有被访问时才会检查是否需要重新计算

```javascript
// 伪代码展示计算属性内部机制
class ComputedImpl {
  constructor(getter) {
    this.getter = getter
    this.value = undefined
    this.dirty = true // 标记是否需要重新计算
    this.deps = new Set() // 依赖集合
  }
  
  get() {
    // 追踪依赖
    trackDependencies(this)
    
    if (this.dirty) {
      this.value = this.getter()
      this.dirty = false
    }
    
    return this.value
  }
  
  // 依赖变化时调用
  update() {
    this.dirty = true
    // 触发重新渲染
    triggerUpdate()
  }
}
```

#### Watch 的响应机制

侦听器需要**显式指定**要观察的数据：

```javascript
watch: {
  // 直接观察简单属性
  simpleProp(newVal, oldVal) { /* ... */ },
  
  // 观察嵌套属性
  'nested.object.property': { /* ... */ },
  
  // 观察计算属性
  computedProp(newVal) { /* ... */ }
}
```

**内部实现原理**：
1. **依赖收集**：创建 watcher 实例观察指定表达式
2. **变化检测**：依赖变化时立即执行回调函数
3. **新旧值对比**：自动提供变化前后的值
4. **清理机制**：组件销毁时自动清理观察者

### 3. 缓存行为对比

#### Computed 的缓存机制

```javascript
computed: {
  expensiveCalculation() {
    console.log('执行计算...') // 只有依赖变化时才会执行
    return heavyComputation(this.data)
  }
}

// 多次访问，只计算一次
this.expensiveCalculation
this.expensiveCalculation // 直接返回缓存值
```

**缓存触发条件**：
- ✅ 依赖的响应式数据发生变化
- ❌ 非响应式数据变化
- ❌ 在计算函数中使用 Date.now() 等非响应式值

#### Watch 的无缓存特性

```javascript
watch: {
  data(newVal) {
    console.log('数据变化，执行操作') // 每次变化都会执行
    this.performOperation(newVal)
  }
}
```

**执行时机**：
- ✅ 观察的值每次变化都会执行
- ✅ 可配置立即执行 (`immediate: true`)
- ✅ 可配置深度观察 (`deep: true`)

### 4. 返回值与参数

#### Computed 的返回值特性
- **必须有返回值**：用于模板渲染或其它计算
- **无参数**：不接受参数，基于当前实例状态计算(返回的函数可以接收)
- **同步计算**：应该是纯函数，不包含异步操作

```javascript
computed: {
  // ✅ 正确：有返回值
  validComputed() {
    return this.data.map(item => item * 2)
  },
  
  // ❌ 错误：没有返回值
  invalidComputed() {
    console.log(this.data) // 没有返回值
  },
  
  // ❌ 错误：包含异步操作
  async invalidAsyncComputed() {
    const result = await fetchData()
    return result // 不推荐在计算属性中使用异步
  }
}
```

#### Watch 的参数特性
- **无返回值**：回调函数不返回值，用于执行操作
- **接收参数**：自动接收新值和旧值
- **支持异步**：可以包含异步操作

```javascript
watch: {
  data: {
    handler(newVal, oldVal) {
      // ✅ 可以访问新旧值
      console.log('从', oldVal, '变为', newVal)
      
      // ✅ 可以执行异步操作
      this.debouncedSave(newVal)
    },
    immediate: true // 立即执行时 oldVal 为 undefined
  }
}
```

### 5. 性能特性对比

#### Computed 的性能优势

```javascript
computed: {
  // 性能优化示例
  filteredList() {
    // 昂贵的过滤操作，依赖不变时不会重复执行
    return this.hugeList.filter(item => 
      item.name.includes(this.searchTerm) &&
      item.category === this.selectedCategory
    )
  }
}
```

**性能特点**：
- ✅ **惰性计算**：只有被访问时才计算
- ✅ **依赖缓存**：依赖不变时直接返回缓存
- ✅ **智能更新**：只有真正需要时才重新计算

#### Watch 的性能考虑

```javascript
watch: {
  searchTerm: {
    handler: _.debounce(function(newVal) {
      // 使用防抖避免频繁请求
      this.performSearch(newVal)
    }, 300),
    
    // 深度观察大型对象可能有性能问题
    largeObject: {
      handler() { /* ... */ },
      deep: true // 谨慎使用，可能影响性能
    }
  }
}
```

**性能注意事项**：
- ⚠️ **立即执行**：`immediate: true` 可能增加初始负载
- ⚠️ **深度观察**：`deep: true` 对大型对象有性能影响
- ⚠️ **频繁触发**：需要防抖/节流控制执行频率

### 6. 组合式 API 中的使用差异

#### Composition API 中的 Computed

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    // 可写计算属性
    const writableComputed = computed({
      get: () => count.value * 2,
      set: (val) => {
        count.value = val / 2
      }
    })
    
    return { count, doubleCount, writableComputed }
  }
}
```

#### Composition API 中的 Watch

```javascript
import { ref, watch, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const searchQuery = ref('')
    
    // 显式侦听
    watch(count, (newVal, oldVal) => {
      console.log(`count 从 ${oldVal} 变为 ${newVal}`)
    })
    
    // 自动依赖追踪的 watchEffect
    watchEffect(() => {
      console.log(`count 现在是: ${count.value}`)
      // 自动追踪 count.value 作为依赖
    })
    
    // 侦听多个源
    watch([count, searchQuery], ([newCount, newQuery], [oldCount, oldQuery]) => {
      // 处理变化
    })
    
    return { count, searchQuery }
  }
}
```

## 高级用法与边界情况

### Computed 的 Setter

```javascript
computed: {
  fullName: {
    get() {
      return this.firstName + ' ' + this.lastName
    },
    set(newValue) {
      const names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}

// 使用
this.fullName = 'John Doe' // 自动更新 firstName 和 lastName
```

### Watch 的高级配置

```javascript
watch: {
  targetData: {
    handler(newVal, oldVal) {
      // 处理逻辑
    },
    immediate: true,    // 立即执行一次
    deep: true,         // 深度观察
    flush: 'post'       // DOM 更新后执行
  }
}
```

### 侦听器数组

```javascript
watch: {
  // 侦听多个数据源
  ['a', 'b', 'c'](newValues, oldValues) {
    const [newA, newB, newC] = newValues
    const [oldA, oldB, oldC] = oldValues
    // 处理变化
  }
}
```

## 最佳实践指南

### 何时使用 Computed

1. **模板中的数据派生**
   ```javascript
   // ✅ 推荐：在计算属性中处理复杂逻辑
   computed: {
     displayItems() {
       return this.items
         .filter(item => item.isActive)
         .sort((a, b) => a.name.localeCompare(b.name))
     }
   }
   ```

2. **基于多个状态的计算**
   ```javascript
   // ✅ 推荐：组合多个状态
   computed: {
     canUserSubmit() {
       return this.isLoggedIn && 
              this.hasPermissions && 
              !this.isSubmitting
     }
   }
   ```

3. **需要缓存的昂贵计算**
   ```javascript
   // ✅ 推荐：缓存计算结果
   computed: {
     expensiveResult() {
       return heavyComputation(this.data)
     }
   }
   ```

### 何时使用 Watch

1. **数据变化时的异步操作**
   ```javascript
   // ✅ 推荐：搜索建议
   watch: {
     searchQuery: {
       handler: _.debounce(async function(newQuery) {
         if (newQuery) {
           this.suggestions = await this.fetchSuggestions(newQuery)
         }
       }, 300)
     }
   }
   ```

2. **执行有副作用的操作**
   ```javascript
   // ✅ 推荐：路由参数变化时加载数据
   watch: {
     '$route.params.id': {
       handler(newId) {
         this.loadUserData(newId)
       },
       immediate: true
     }
   }
   ```

3. **需要知道变化前后的值**
   ```javascript
   // ✅ 推荐：变化追踪
   watch: {
     selectedItem(newItem, oldItem) {
       this.logChange('selectedItem', oldItem, newItem)
       this.analytics.track('item_selected', newItem)
     }
   }
   ```

### 常见陷阱与避免方法

#### Computed 陷阱

1. **在计算属性中产生副作用**
   ```javascript
   // ❌ 避免：计算属性中不要产生副作用
   computed: {
     badComputed() {
       this.sideEffect() // 不要这样做！
       return this.data * 2
     }
   }
   ```

2. **依赖非响应式数据**
   ```javascript
   // ❌ 避免：依赖不会触发更新的数据
   computed: {
     invalidComputed() {
       return Date.now() // 不会响应式更新
     }
   }
   ```

#### Watch 陷阱

1. **过度使用深度观察**
   ```javascript
   // ⚠️ 谨慎：深度观察可能影响性能
   watch: {
     largeObject: {
       handler() { /* ... */ },
       deep: true // 对大型对象要谨慎
     }
   }
   ```

2. **创建无限循环**
   ```javascript
   // ❌ 避免：watch 中修改观察的数据可能导致循环
   watch: {
     count(newVal) {
       this.count = newVal + 1 // 危险！可能造成无限循环
     }
   }
   ```

| 特性 | Computed | Watch |
|------|----------|-------|
| **设计目的** | 数据派生、模板简化 | 副作用执行、异步响应 |
| **返回值** | 必须有返回值 | 无返回值 |
| **缓存** | 有缓存，依赖不变不重新计算 | 无缓存，每次变化都执行 |
| **异步支持** | 不推荐使用异步 | 完全支持异步操作 |
| **参数** | 无参数 | 接收新值和旧值 |
| **性能** | 惰性计算，性能优化 | 可能需防抖，注意深度观察性能 |
| **使用场景** | 格式化、过滤、组合数据 | API调用、验证、复杂响应逻辑 |
| **组合式API** | `computed()` | `watch()`, `watchEffect()` |

- **使用 `computed`** 当你需要基于现有状态**计算派生数据**，特别是需要缓存优化时
- **使用 `watch`** 当你需要在数据变化时**执行操作**，特别是涉及异步或副作用时
