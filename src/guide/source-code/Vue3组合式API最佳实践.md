# Vue 3 组合式API最佳实践

> 告别 Options API 的束缚，拥抱真正的逻辑复用和类型安全

## 🎯 组合式 API 设计哲学

### 1. 关注点分离，而不是选项分离

```javascript
// ❌ 传统的 Options API - 逻辑分散
export default {
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: ''
    }
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => 
        user.name.includes(this.searchQuery)
      )
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        this.users = await api.getUsers()
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.fetchUsers()
  }
}

// ✅ 组合式 API - 逻辑聚合
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 用户管理相关逻辑
    const users = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    
    const filteredUsers = computed(() => 
      users.value.filter(user => 
        user.name.includes(searchQuery.value)
      )
    )
    
    const fetchUsers = async () => {
      loading.value = true
      try {
        users.value = await api.getUsers()
      } finally {
        loading.value = false
      }
    }
    
    onMounted(fetchUsers)
    
    return {
      users,
      loading,
      searchQuery,
      filteredUsers,
      fetchUsers
    }
  }
}
```

## 🔥 组合式函数最佳实践

### 1. 单一职责的组合式函数

```typescript
// useUserManagement.ts
import { ref, computed, onMounted } from 'vue'
import type { User } from '@/types'

interface UseUserManagementReturn {
  users: Ref<User[]>
  loading: Ref<boolean>
  searchQuery: Ref<string>
  filteredUsers: ComputedRef<User[]>
  fetchUsers: () => Promise<void>
  addUser: (user: User) => void
  removeUser: (id: string) => void
}

export function useUserManagement(): UseUserManagementReturn {
  const users = ref<User[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  
  const filteredUsers = computed(() => 
    users.value.filter(user => 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  )
  
  const fetchUsers = async (): Promise<void> => {
    loading.value = true
    try {
      users.value = await userApi.getAll()
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const addUser = (user: User): void => {
    users.value.push(user)
  }
  
  const removeUser = (id: string): void => {
    const index = users.value.findIndex(user => user.id === id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }
  
  onMounted(fetchUsers)
  
  return {
    users: readonly(users),
    loading: readonly(loading),
    searchQuery,
    filteredUsers,
    fetchUsers,
    addUser,
    removeUser
  }
}
```

### 2. 带配置的组合式函数

```typescript
// usePagination.ts
import { ref, computed, watch } from 'vue'

interface PaginationOptions {
  initialPage?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
}

interface UsePaginationReturn {
  currentPage: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  totalPages: ComputedRef<number>
  offset: ComputedRef<number>
  next: () => void
  prev: () => void
  goTo: (page: number) => void
  canNext: ComputedRef<boolean>
  canPrev: ComputedRef<boolean>
}

export function usePagination(options: PaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    pageSize = 10,
    total = 0,
    onPageChange
  } = options
  
  const currentPage = ref(initialPage)
  const pageSizeRef = ref(pageSize)
  const totalRef = ref(total)
  
  const totalPages = computed(() => 
    Math.ceil(totalRef.value / pageSizeRef.value)
  )
  
  const offset = computed(() => 
    (currentPage.value - 1) * pageSizeRef.value
  )
  
  const canNext = computed(() => 
    currentPage.value < totalPages.value
  )
  
  const canPrev = computed(() => 
    currentPage.value > 1
  )
  
  const next = (): void => {
    if (canNext.value) {
      currentPage.value++
    }
  }
  
  const prev = (): void => {
    if (canPrev.value) {
      currentPage.value--
    }
  }
  
  const goTo = (page: number): void => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  watch(currentPage, (newPage) => {
    onPageChange?.(newPage)
  })
  
  return {
    currentPage: readonly(currentPage),
    pageSize: readonly(pageSizeRef),
    total: readonly(totalRef),
    totalPages,
    offset,
    next,
    prev,
    goTo,
    canNext,
    canPrev
  }
}
```

## 🛠 组件中的组合式函数使用

### 1. 组件逻辑组织

```vue
<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <div class="search-section">
      <input 
        v-model="searchQuery" 
        placeholder="搜索用户..."
        class="search-input"
      />
      <button @click="refreshUsers" :disabled="loading">
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-list">
      <UserCard
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        @delete="removeUser(user.id)"
      />
    </div>
    
    <!-- 分页 -->
    <Pagination
      :current-page="pagination.currentPage"
      :total-pages="pagination.totalPages"
      @page-change="pagination.goTo"
    />
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'
import { usePagination } from '@/composables/usePagination'
import UserCard from './UserCard.vue'
import Pagination from './Pagination.vue'

// 用户管理逻辑
const {
  users,
  loading,
  searchQuery,
  filteredUsers,
  fetchUsers,
  removeUser
} = useUserManagement()

// 分页逻辑
const pagination = usePagination({
  initialPage: 1,
  pageSize: 10,
  onPageChange: fetchUsers
})

// 响应式更新分页总数
watch(users, (newUsers) => {
  pagination.total = newUsers.length
})

// 刷新用户列表
const refreshUsers = async (): Promise<void> => {
  await fetchUsers()
}
</script>
```

### 2. 类型安全的组合式函数

```typescript
// useApi.ts - 带完整类型安全的 API 组合式函数
import { ref, computed } from 'vue'

type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseApiOptions<T, P extends any[]> {
  immediate?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
}

interface UseApiReturn<T, P extends any[]> {
  data: Ref<T | null>
  error: Ref<unknown>
  status: Ref<ApiStatus>
  isLoading: ComputedRef<boolean>
  isSuccess: ComputedRef<boolean>
  isError: ComputedRef<boolean>
  execute: (...params: P) => Promise<T>
  reset: () => void
}

export function useApi<T, P extends any[] = []>(
  fn: (...params: P) => Promise<T>,
  options: UseApiOptions<T, P> = {}
): UseApiReturn<T, P> {
  const {
    immediate = false,
    initialData = null,
    onSuccess,
    onError
  } = options
  
  const data = ref<T | null>(initialData) as Ref<T | null>
  const error = ref<unknown>(null)
  const status = ref<ApiStatus>('idle')
  
  const isLoading = computed(() => status.value === 'loading')
  const isSuccess = computed(() => status.value === 'success')
  const isError = computed(() => status.value === 'error')
  
  const execute = async (...params: P): Promise<T> => {
    status.value = 'loading'
    error.value = null
    
    try {
      const result = await fn(...params)
      data.value = result
      status.value = 'success'
      onSuccess?.(result)
      return result
    } catch (err) {
      error.value = err
      status.value = 'error'
      onError?.(err)
      throw err
    }
  }
  
  const reset = (): void => {
    data.value = initialData
    error.value = null
    status.value = 'idle'
  }
  
  // 立即执行
  if (immediate) {
    execute(...[] as unknown as P)
  }
  
  return {
    data: readonly(data),
    error: readonly(error),
    status: readonly(status),
    isLoading,
    isSuccess,
    isError,
    execute,
    reset
  }
}
```

## 🔧 高级模式和技巧

### 1. 依赖注入的模式

```typescript
// useTheme.ts - 全局状态管理
import { inject, provide, ref, watch } from 'vue'

type Theme = 'light' | 'dark'

interface ThemeContext {
  theme: Ref<Theme>
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const ThemeSymbol = Symbol('theme')

export function provideTheme() {
  const theme = ref<Theme>('light')
  
  const toggle = (): void => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  const setTheme = (newTheme: Theme): void => {
    theme.value = newTheme
  }
  
  // 监听主题变化，保存到 localStorage
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })
  
  const context: ThemeContext = {
    theme: readonly(theme),
    toggle,
    setTheme
  }
  
  provide(ThemeSymbol, context)
  
  return context
}

export function useTheme(): ThemeContext {
  const context = inject<ThemeContext>(ThemeSymbol)
  
  if (!context) {
    throw new Error('useTheme must be used within a component that provides theme')
  }
  
  return context
}
```

### 2. 生命周期的最佳实践

```typescript
// useEventListener.ts - 自动清理的副作用
import { onUnmounted, onMounted, ref } from 'vue'

export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListener
) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })
  
  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}

// useInterval.ts - 定时器管理
import { onUnmounted, ref } from 'vue'

export function useInterval(callback: () => void, delay: number) {
  const intervalId = ref<number | null>(null)
  
  const start = (): void => {
    if (intervalId.value === null) {
      intervalId.value = setInterval(callback, delay)
    }
  }
  
  const stop = (): void => {
    if (intervalId.value !== null) {
      clearInterval(intervalId.value)
      intervalId.value = null
    }
  }
  
  onUnmounted(stop)
  
  return {
    start,
    stop
  }
}
```

## 🚀 性能优化实践

### 1. 响应式优化

```typescript
// 使用 shallowRef 和 shallowReactive 优化性能
import { shallowRef, shallowReactive, readonly } from 'vue'

export function useLargeData() {
  // 对于大型对象数组，使用 shallowRef
  const largeList = shallowRef<LargeItem[]>([])
  
  // 对于配置对象，使用 shallowReactive
  const config = shallowReactive({
    pageSize: 10,
    sortBy: 'name',
    filter: {}
  })
  
  // 返回只读版本，防止意外修改
  return {
    largeList: readonly(largeList),
    config: readonly(config)
  }
}

// 使用 computed 缓存计算结果
import { computed } from 'vue'

export function useExpensiveComputation(data: Ref<number[]>) {
  // 昂贵的计算使用 computed 缓存
  const expensiveResult = computed(() => {
    return data.value
      .filter(x => x > 0)
      .map(x => Math.sqrt(x))
      .reduce((sum, val) => sum + val, 0)
  })
  
  return {
    expensiveResult
  }
}
```

### 2. 内存泄漏防护

```typescript
// useAbortController.ts - 自动取消请求
import { onUnmounted, ref } from 'vue'

export function useAbortController() {
  const abortController = ref<AbortController | null>(null)
  
  const createAbortSignal = (): AbortSignal => {
    // 取消之前的请求
    if (abortController.value) {
      abortController.value.abort()
    }
    
    abortController.value = new AbortController()
    return abortController.value.signal
  }
  
  const abort = (): void => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
    }
  }
  
  onUnmounted(abort)
  
  return {
    createAbortSignal,
    abort
  }
}
```

## 📝 测试策略

### 1. 可测试的组合式函数

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/vue'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter())
    
    expect(result.current.count.value).toBe(0)
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count.value).toBe(1)
  })
  
  it('should reset counter', () => {
    const { result } = renderHook(() => useCounter(5))
    
    act(() => {
      result.current.reset()
    })
    
    expect(result.current.count.value).toBe(0)
  })
})
```

## 💡 最佳实践总结

1. **单一职责**：每个组合式函数只关注一个特定功能
2. **类型安全**：充分利用 TypeScript 提供完整的类型定义
3. **明确依赖**：在函数签名中明确声明所有依赖
4. **返回稳定引用**：使用 `readonly` 包装返回的 ref
5. **自动清理**：在组合式函数中处理副作用的清理
6. **错误处理**：提供完整的错误处理机制
7. **可配置性**：通过选项对象提供灵活的配置
8. **可测试性**：设计易于测试的函数结构

**记住：好的组合式函数就像乐高积木，可以灵活组合，构建出强大的应用架构。**