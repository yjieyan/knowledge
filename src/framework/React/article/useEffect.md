# React useEffect 
## 📚 目录
1. [基础概念](#基础概念)
2. [使用方法详解](#使用方法详解)
3. [核心特性与机制](#核心特性与机制)
4. [常见使用场景](#常见使用场景)
5. [进阶技巧](#进阶技巧)
6. [常见问题与解决方案](#常见问题与解决方案)
7. [性能优化](#性能优化)
8. [最佳实践总结](#最佳实践总结)
9. [实战案例](#实战案例)

---

## 基础概念

### 什么是 useEffect？

`useEffect` 是 React Hooks 中用于处理**副作用（Side Effects）**的钩子函数。

在函数组件中执行数据获取、订阅、手动 DOM 操作、定时器等都属于副作用。

```javascript
import React, { useEffect } from 'react';

function ExampleComponent() {
  useEffect(() => {
    // 副作用逻辑
    console.log('副作用执行了');
    
    // 可选：清理函数
    return () => {
      console.log('清理函数执行了');
    };
  }, [/* 依赖数组 */]);
  
  return <div>示例组件</div>;
}
```

### 为什么需要 useEffect？

React 的核心是**纯函数**和**声明式编程**，但真实应用需要处理各种副作用。

`useEffect` 提供了一个隔离区，将副作用逻辑从渲染逻辑中分离出来，确保组件的纯净性。

---

## 使用方法

### 1. 基础语法

```javascript
useEffect(effectFunction, dependencyArray);
```

| 参数 | 说明 | 是否必填 |
|------|------|----------|
| `effectFunction` | 包含副作用逻辑的函数 | 是 |
| `dependencyArray` | 依赖数组，控制 effect 的执行时机 | 否 |

### 2. 三种使用模式

#### 模式一：无依赖数组（每次渲染都执行）

```javascript
useEffect(() => {
  console.log('每次渲染都会执行');
});
```

#### 模式二：空依赖数组（只在挂载时执行一次）

```javascript
useEffect(() => {
  console.log('只在组件挂载时执行一次');
  
  return () => {
    console.log('只在组件卸载时执行');
  };
}, []);
```

#### 模式三：有依赖项（依赖变化时执行）

```javascript
useEffect(() => {
  console.log('count 变化了:', count);
}, [count]);
```

### 3. 清理函数（Cleanup）

清理函数在两种情况下执行：
1. **组件卸载时**
2. **依赖项变化，重新执行 effect 前**

```javascript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('定时器运行中');
  }, 1000);
  
  return () => {
    clearInterval(timer); // 清理定时器
    console.log('定时器已清理');
  };
}, []);
```

---

## 核心特性与机制

### 1. 执行时机

- **useEffect**：异步执行，不会阻塞浏览器渲染
- **[useLayoutEffect](./useLayoutEffect.md)**：同步执行，在 DOM 更新后、浏览器绘制前执行

```javascript
// 推荐使用 useEffect，除非需要同步操作 DOM
useEffect(() => {
  // 异步执行，不会阻塞渲染
  document.title = `计数：${count}`;
}, [count]);
```

### 2. 闭包特性

useEffect 会捕获定义时的状态值，这可能导致获取到过期的值：

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count); // 总是打印初始值 0
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 空依赖数组导致闭包问题
  
  return <button onClick={() => setCount(count + 1)}>增加</button>;
}
```

### 3. 依赖数组的工作原理

React 使用 `Object.is` 比较依赖项，对于复杂类型（对象、数组、函数）需要特别注意引用相等性：

```javascript
// ❌ 错误：每次渲染都会执行
const config = { timeout: 5000 };
useEffect(() => {
  fetchData(config);
}, [config]); // config 每次渲染都是新对象

// ✅ 正确：使用 useMemo 保持引用稳定
const config = useMemo(() => ({ timeout: 5000 }), []);
useEffect(() => {
  fetchData(config);
}, [config]);
```

---

## 常见使用场景

### 1. 数据获取

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true; // 防止内存泄漏
    
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('获取用户数据失败:', error);
          setLoading(false);
        }
      }
    };
    
    fetchUser();
    
    return () => {
      isMounted = false; // 组件卸载时标记
    };
  }, [userId]); // userId 变化时重新获取
  
  if (loading) return <div>加载中...</div>;
  return <div>{user?.name}</div>;
}
```

### 2. 事件监听

```javascript
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div>
      窗口尺寸：{size.width} × {size.height}
    </div>
  );
}
```

### 3. 定时器管理

```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1); // 使用函数式更新
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive]);
  
  return (
    <div>
      <div>计时：{seconds}秒</div>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? '暂停' : '开始'}
      </button>
      <button onClick={() => setSeconds(0)}>重置</button>
    </div>
  );
}
```

### 4. 第三方库集成

```javascript
function ChartComponent({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    // 初始化图表
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
    
    return () => {
      // 销毁图表
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []); // 只初始化一次
  
  useEffect(() => {
    // 数据更新时重新渲染图表
    if (chartInstance.current) {
      chartInstance.current.data = data;
      chartInstance.current.update();
    }
  }, [data]);
  
  return <canvas ref={chartRef} />;
}
```

---

## 进阶技巧

### 1. 竞态条件处理

```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const search = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      
      try {
        const response = await fetch(`/api/search?q=${query}`, { signal });
        const data = await response.json();
        
        setResults(data);
        setLoading(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('搜索失败:', error);
          setLoading(false);
        }
      }
    };
    
    // 防抖处理
    const timer = setTimeout(search, 300);
    
    return () => {
      clearTimeout(timer);
      controller.abort(); // 取消之前的请求
    };
  }, [query]);
  
  return (
    <div>
      {loading && <div>搜索中...</div>}
      {results.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### 2. 自定义 Hook 封装

```javascript
// 自定义数据获取 Hook
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// 使用自定义 Hook
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error}</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 3. 使用 useRef 解决闭包问题

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  // 保持 ref 与 state 同步
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('当前计数:', countRef.current); // 总是获取最新值
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 空依赖数组，但能通过 ref 获取最新值
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

---

## 常见问题与解决方案

### 1. 无限循环问题

```javascript
// ❌ 错误：导致无限循环
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1); // 每次执行都会触发重新渲染
}, [count]);

// ✅ 正确：使用函数式更新
useEffect(() => {
  setCount(prevCount => prevCount + 1); // 不会触发无限循环
}, []);
```

### 2. 依赖项是对象或数组

```javascript

// 使用 useMemo
const config = useMemo(() => ({ timeout: 5000 }), []);
useEffect(() => {
  fetchData(config);
}, [config]);


// 使用 useCallback 处理函数
const handleData = useCallback((data) => {
  processData(data, config);
}, [config]);

useEffect(() => {
  fetchData().then(handleData);
}, [handleData]);
```

### 3. 清理函数获取不到最新值

```javascript
// ❌ 问题：清理函数总是获取初始值
const [count, setCount] = useState(0);
useEffect(() => {
  return () => {
    console.log('清理时的 count:', count); // 总是 0
  };
}, []);

// ✅ 解决方案 1：添加依赖
useEffect(() => {
  return () => {
    console.log('清理时的 count:', count); // 获取最新值
  };
}, [count]);

// ✅ 解决方案 2：使用 ref
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

useEffect(() => {
  return () => {
    console.log('清理时的 count:', countRef.current); // 获取最新值
  };
}, []);
```

### 4. 异步操作内存泄漏

```javascript
// ✅ 完整的异步操作处理
function AsyncComponent({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/data/${id}`, {
          signal: controller.signal
        });
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error('加载数据失败:', error);
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);
  
  return loading ? <div>加载中...</div> : <div>{data?.title}</div>;
}
```

---

## 性能优化

### 1. 防抖和节流

```javascript
// 防抖 Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用防抖
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

### 2. 分离关注点

```javascript
// ❌ 不好的做法：一个 useEffect 处理所有事情
useEffect(() => {
  fetchUserData(userId);
  fetchUserPosts(userId);
  updateViewCount(userId);
  setupWebSocket(userId);
}, [userId]);

// ✅ 好的做法：分离多个 useEffect
useEffect(() => {
  fetchUserData(userId);
}, [userId]);

useEffect(() => {
  fetchUserPosts(userId);
}, [userId]);

useEffect(() => {
  updateViewCount(userId);
}, [userId]);

useEffect(() => {
  setupWebSocket(userId);
  
  return () => {
    closeWebSocket();
  };
}, [userId]);
```

### 3. 避免不必要的重新渲染

```javascript
// ✅ 使用 useMemo 优化复杂对象依赖
const expensiveConfig = useMemo(() => ({
  filters: activeFilters,
  sortOrder: sortOrder,
  pageSize: 50,
  includeDeleted: false
}), [activeFilters, sortOrder]);

useEffect(() => {
  fetchData(expensiveConfig);
}, [expensiveConfig]);

// ✅ 使用 useCallback 优化函数依赖
const handleUserAction = useCallback((action) => {
  logUserAction(userId, action);
  updateUserStats(userId, action);
}, [userId]);

useEffect(() => {
  setupActionHandler(handleUserAction);
  
  return () => {
    cleanupActionHandler(handleUserAction);
  };
}, [handleUserAction]);
```

---

## [最佳实践总结](../demo/useEffect-demo1.md)

### ✅ 应该使用 useEffect 的场景

1. **数据获取**
```javascript
useEffect(() => {
  fetchData().then(setData);
}, [id]);
```

2. **事件监听**
```javascript
useEffect(() => {
  const handleResize = () => setSize(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

3. **第三方库集成**
```javascript
useEffect(() => {
  const chart = new Chart(canvasRef.current, config);
  return () => chart.destroy();
}, []);
```

4. **订阅和清理**
```javascript
useEffect(() => {
  const subscription = eventBus.subscribe('update', handleUpdate);
  return () => subscription.unsubscribe();
}, []);
```

### ❌ 应该避免使用 useEffect 的场景

1. **状态间的简单同步**
```javascript
// ❌ 不好的做法
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ 更好的做法
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = `${firstName} ${lastName}`; // 直接计算
```

2. **复杂的异步状态管理**
```javascript
// ❌ 不好的做法
useEffect(() => { /* 获取用户数据 */ }, [userId]);
useEffect(() => { /* 获取权限数据 */ }, [userData]);
useEffect(() => { /* 处理加载状态 */ }, [userData, permissions]);

// ✅ 更好的做法
const { userData, permissions, isLoading } = useUserData(userId);
```

### useEffect 使用 checklist

- [ ] 只在必要时使用 useEffect
- [ ] 正确设置依赖数组（不要遗漏，也不要多余）
- [ ] 总是提供清理函数处理资源释放
- [ ] 使用函数式更新避免过期的状态值
- [ ] 处理异步操作的竞态条件
- [ ] 对复杂依赖项使用 useMemo 或 useCallback
- [ ] 分离关注点，避免一个 effect 做太多事情
- [ ] 使用 ESLint 插件检查依赖项

## 参考资料

- [React 官方文档 - useEffect](https://react.dev/reference/react/useEffect)
- [React 官方文档 - 使用 Effect 同步](https://react.dev/learn/synchronizing-with-effects)
- [Dan Abramov - A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- [React 技术揭秘](https://react.iamkasong.com/)
