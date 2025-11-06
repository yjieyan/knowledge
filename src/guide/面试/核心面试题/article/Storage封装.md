# Storage封装

```javascript
// utils/storage.js

class Storage {
  constructor(storageType = 'local') {
    this.storage = storageType === 'local' ? localStorage : sessionStorage
    this.prefix = 'app_' // 项目前缀，避免冲突
  }

  /**
   * 生成完整的key
   */
  getKey(key) {
    return `${this.prefix}${key}`
  }

  /**
   * 设置存储项
   */
  set(key, value, options = {}) {
    try {
      const storageKey = this.getKey(key)
      const storageValue = {
        value,
        timestamp: Date.now(),
        expire: options.expire, // 过期时间（毫秒）
        module: options.module || 'default' // 模块分类
      }
      
      this.storage.setItem(storageKey, JSON.stringify(storageValue))
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }

  /**
   * 获取存储项
   */
  get(key, defaultValue = null) {
    try {
      const storageKey = this.getKey(key)
      const item = this.storage.getItem(storageKey)
      
      if (!item) return defaultValue

      const parsedItem = JSON.parse(item)
      
      // 检查是否过期
      if (parsedItem.expire && Date.now() - parsedItem.timestamp > parsedItem.expire) {
        this.remove(key)
        return defaultValue
      }
      
      return parsedItem.value
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }

  /**
   * 删除存储项
   */
  remove(key) {
    try {
      const storageKey = this.getKey(key)
      this.storage.removeItem(storageKey)
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  }

  /**
   * 清空所有存储项
   */
  clear() {
    try {
      this.storage.clear()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  /**
   * 清空指定模块的存储项
   */
  clearModule(moduleName) {
    try {
      const keysToRemove = []
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(this.storage.getItem(key))
            if (item.module === moduleName) {
              keysToRemove.push(key)
            }
          } catch (e) {
            // 解析失败，跳过
            continue
          }
        }
      }
      
      keysToRemove.forEach(key => {
        this.storage.removeItem(key)
      })
      
      return keysToRemove.length
    } catch (error) {
      console.error('Storage clearModule error:', error)
      return 0
    }
  }

  /**
   * 获取所有键名
   */
  keys() {
    const keys = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''))
      }
    }
    return keys
  }

  /**
   * 获取指定模块的所有键名
   */
  getModuleKeys(moduleName) {
    const keys = []
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      if (key && key.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(this.storage.getItem(key))
          if (item.module === moduleName) {
            keys.push(key.replace(this.prefix, ''))
          }
        } catch (e) {
          continue
        }
      }
    }
    return keys
  }

  /**
   * 检查键是否存在
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * 获取存储大小（估算）
   */
  size() {
    let total = 0
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)
      const value = this.storage.getItem(key)
      total += (key?.length || 0) + (value?.length || 0)
    }
    return total
  }

  /**
   * 设置过期时间
   */
  setExpire(key, expire) {
    const value = this.get(key)
    if (value !== null) {
      return this.set(key, value, { expire })
    }
    return false
  }
}

// 创建实例
export const local = new Storage('local')
export const session = new Storage('session')

export default {
  local,
  session
}
```

## 模块化管理方案

```javascript
// utils/storageModules.js
import { local, session } from './storage'

// 用户模块
export const userModule = {
  // 存储用户信息
  setUser(userInfo) {
    return local.set('user_info', userInfo, { 
      module: 'user',
      expire: 24 * 60 * 60 * 1000 // 24小时过期
    })
  },

  getUser() {
    return local.get('user_info', {})
  },

  setToken(token) {
    return local.set('token', token, { 
      module: 'user',
      expire: 24 * 60 * 60 * 1000
    })
  },

  getToken() {
    return local.get('token', '')
  },

  clear() {
    return local.clearModule('user')
  }
}

// 应用配置模块
export const configModule = {
  setTheme(theme) {
    return local.set('theme', theme, { module: 'config' })
  },

  getTheme() {
    return local.get('theme', 'light')
  },

  setLanguage(lang) {
    return local.set('language', lang, { module: 'config' })
  },

  getLanguage() {
    return local.get('language', 'zh-CN')
  }
}

// 临时数据模块（使用sessionStorage）
export const tempModule = {
  setFormData(data) {
    return session.set('form_data', data, { module: 'temp' })
  },

  getFormData() {
    return session.get('form_data', {})
  },

  setPageParams(params) {
    return session.set('page_params', params, { module: 'temp' })
  },

  getPageParams() {
    return session.get('page_params', {})
  },

  clear() {
    return session.clearModule('temp')
  }
}

// 购物车模块
export const cartModule = {
  setCartItems(items) {
    return local.set('cart_items', items, { module: 'cart' })
  },

  getCartItems() {
    return local.get('cart_items', [])
  },

  addItem(item) {
    const items = this.getCartItems()
    items.push(item)
    return this.setCartItems(items)
  },

  clear() {
    return local.clearModule('cart')
  }
}
```

## 在 Vue 项目中使用

### 1. 全局挂载
```javascript
// main.js
import storage from '@/utils/storage'
import { userModule, configModule } from '@/utils/storageModules'

Vue.prototype.$storage = storage
Vue.prototype.$userStorage = userModule
Vue.prototype.$configStorage = configModule
```

### 2. 在组件中使用
```vue
<template>
  <div>
    <h1>用户信息</h1>
    <p>用户名: {{ userInfo.name }}</p>
    <p>主题: {{ theme }}</p>
    
    <button @click="saveUser">保存用户信息</button>
    <button @click="clearUser">清除用户数据</button>
    <button @click="clearTemp">清除临时数据</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {},
      theme: 'light'
    }
  },
  created() {
    // 从存储中加载数据
    this.loadStoredData()
  },
  
  methods: {
    loadStoredData() {
      // 使用模块化存储
      this.userInfo = this.$userStorage.getUser()
      this.theme = this.$configStorage.getTheme()
      
      // 使用基础存储
      const tempData = this.$storage.session.get('temp_data')
      console.log('临时数据:', tempData)
    },
    saveUser() {
      const userData = {
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com'
      }
      // 保存到用户模块
      this.$userStorage.setUser(userData)
      this.$userStorage.setToken('jwt-token-here')
      
      // 保存配置
      this.$configStorage.setTheme('dark')
      
      // 保存临时数据（页面刷新后消失）
      this.$storage.session.set('form_step', 2, { 
        module: 'temp',
        expire: 30 * 60 * 1000 // 30分钟过期
      })
    },
    clearUser() {
      // 清除整个用户模块
      this.$userStorage.clear()
      this.userInfo = {}
    },
    clearTemp() {
      // 清除所有临时数据
      this.$storage.session.clearModule('temp')
    },
    // 跨页面传参示例
    goToDetail() {
      // 设置参数
      this.$storage.session.set('detail_params', {
        productId: 123,
        fromPage: 'home'
      }, { module: 'temp' })
      
      // 跳转页面
      this.$router.push('/detail')
    }
  }
}
</script>
```

### 3. 在目标页面获取参数
```vue
<script>
export default {
  
  created() {
    // 获取跨页面传递的参数
    const params = this.$storage.session.get('detail_params')
    if (params) {
      this.productId = params.productId
      console.log('来自页面:', params.fromPage)
      
      // 使用后可以清除，避免重复使用
      this.$storage.session.remove('detail_params')
    }
  }
}
</script>
```

## 功能扩展

### Storage 变化监听
```javascript
// 添加事件监听
export class EnhancedStorage extends Storage {
  constructor(storageType = 'local') {
    super(storageType)
    this.listeners = new Map()
  }

  on(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key).push(callback)
  }

  off(key, callback) {
    if (this.listeners.has(key)) {
      const callbacks = this.listeners.get(key)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  set(key, value, options = {}) {
    const oldValue = this.get(key)
    const result = super.set(key, value, options)
    
    if (result && this.listeners.has(key)) {
      const callbacks = this.listeners.get(key)
      callbacks.forEach(cb => cb(value, oldValue))
    }
    
    return result
  }
}
```
```javascript
const enhancedStorage = new EnhancedStorage('local')

// 添加监听器
const userChangeHandler = (newValue, oldValue) => {
  console.log('用户信息变化:', {
    旧数据: oldValue,
    新数据: newValue,
    时间: new Date().toLocaleTimeString()
  })
}

// 监听user数据变化
enhancedStorage.on('user', userChangeHandler)

// 测试：修改数据会触发监听器
enhancedStorage.set('user', {name: '张三', age: 25})
// 控制台输出: 用户信息变化: {旧数据: null, 新数据: {name: '张三', age: 25}, 时间: "10:30:25"}

enhancedStorage.set('user', {name: '李四', age: 30})
// 控制台输出: 用户信息变化: {旧数据: {name: '张三', age: 25}, 新数据: {name: '李四', age: 30}, 时间: "10:30:30"}
```
## 封装优势总结

1. **JSON自动转换**：无需手动处理序列化
2. **过期时间**：支持数据自动过期
3. **模块化管理**：可以按模块清理数据
4. **错误处理**：完善的错误捕获机制
5. **类型安全**：统一的API接口
6. **扩展性强**：易于添加新功能

