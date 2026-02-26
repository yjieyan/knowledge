# useState

## 目录

- [useState 基础概念](#useState-基础概念)
- [基本语法与使用](#基本语法与使用)
- [状态更新机制深度解析](#状态更新机制深度解析)
- [常见问题与陷阱](#常见问题与陷阱)
- [高级使用模式](#高级使用模式)
- [性能优化技巧](#性能优化技巧)
- [实战场景大全](#实战场景大全)
- [最佳实践总结](#最佳实践总结)

## useState 基础概念

### 什么是状态？

状态是组件中会随时间变化的数据，当状态改变时，组件会重新渲染。

```jsx
// 没有状态 - 静态组件
const StaticComponent = () => {
  return <div>Hello World</div>;
};

// 有状态 - 动态组件
const DynamicComponent = () => {
  const [count, setCount] = useState(0); // 状态！

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>点击增加</button>
    </div>
  );
};
```

### 为什么需要 useState？

在函数组件中，普通变量在重新渲染时会重置，而状态会被 React 保留。

```jsx
const ProblemComponent = () => {
  let count = 0; // ❌ 每次渲染都会重置为 0

  const handleClick = () => {
    count = count + 1;
    console.log(count); // 数字会增加
    // 但是组件不会重新渲染！
  };

  return (
    <div>
      <p>Count: {count}</p> {/* 永远显示 0 */}
      <button onClick={handleClick}>增加</button>
    </div>
  );
};

const SolutionComponent = () => {
  const [count, setCount] = useState(0); // ✅ 状态会被保留

  const handleClick = () => {
    setCount(count + 1); // 触发重新渲染
  };

  return (
    <div>
      <p>Count: {count}</p> {/* 显示最新值 */}
      <button onClick={handleClick}>增加</button>
    </div>
  );
};
```

## 基本语法与使用

### 基本语法

```jsx
import { useState } from "react";

// 语法：const [state, setState] = useState(initialValue);
const SimpleCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
};
```

### 初始化状态的多种方式

```jsx
// 1. 直接值
const [name, setName] = useState("");

// 2. 数字
const [age, setAge] = useState(0);

// 3. 布尔值
const [isVisible, setIsVisible] = useState(false);

// 4. 数组
const [items, setItems] = useState([]);

// 5. 对象
const [user, setUser] = useState({
  name: "",
  email: "",
  age: 0,
});

// 6. 函数初始化（惰性初始化）
const [complexValue, setComplexValue] = useState(() => {
  // 这个函数只在初始渲染时执行一次
  const initialValue = calculateExpensiveValue();
  return initialValue;
});
```

### 惰性初始化的优势

```jsx
// ❌ 不好：每次渲染都会执行 expensiveCalculation
const Component = () => {
  const [value, setValue] = useState(expensiveCalculation());

  // ...
};

// ✅ 好：只在初始渲染时执行一次
const Component = () => {
  const [value, setValue] = useState(() => expensiveCalculation());

  // ...
};

// 实际例子：从 localStorage 读取初始值
const useLocalStorageState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // ... 其他逻辑
};
```

## 状态更新机制深度解析

### 状态更新的异步性

```jsx
const AsyncUpdate = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log("更新前:", count); // 0

    setCount(count + 1);
    console.log("更新后:", count); // 还是 0！😱

    // 状态更新是异步的！
    // 不会立即反映在同一个函数调用中
  };

  // 要获取更新后的值，使用 useEffect
  useEffect(() => {
    console.log("count 更新为:", count);
  }, [count]);

  return <button onClick={handleClick}>点击我: {count}</button>;
};
```

### 函数式更新

```jsx
const FunctionalUpdate = () => {
  const [count, setCount] = useState(0);

  // ❌ 问题：批量更新时会有问题
  const badIncrement = () => {
    setCount(count + 1);
    setCount(count + 1); // 还是基于旧的 count！
  };

  // ✅ 解决方案：使用函数式更新
  const goodIncrement = () => {
    setCount((prevCount) => prevCount + 1);
    setCount((prevCount) => prevCount + 1); // 基于最新值！
  };

  // 实际场景：在闭包中使用
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1); // ✅ 总是能拿到最新值
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={badIncrement}>错误增加 (+2？)</button>
      <button onClick={goodIncrement}>正确增加 (+2)</button>
    </div>
  );
};
```

### 对象和数组的状态更新

```jsx
const ObjectState = () => {
  const [user, setUser] = useState({
    name: "John",
    age: 25,
    profile: {
      bio: "Hello!",
      website: "example.com",
    },
  });

  // ❌ 错误：直接修改
  const badUpdate = () => {
    user.age = 26; // 不会触发重新渲染！
    setUser(user); // 引用相同，React 可能跳过更新
  };

  // ✅ 正确：创建新对象
  const goodUpdate = () => {
    setUser({
      ...user, // 复制所有属性
      age: 26, // 覆盖要更新的属性
    });
  };

  // ✅ 嵌套对象更新
  const updateProfile = () => {
    setUser({
      ...user,
      profile: {
        ...user.profile, // 复制嵌套对象
        bio: "Updated bio!", // 更新嵌套属性
      },
    });
  };

  // ✅ 函数式更新对象
  const incrementAge = () => {
    setUser((prevUser) => ({
      ...prevUser,
      age: prevUser.age + 1,
    }));
  };

  return (
    <div>
      <p>姓名: {user.name}</p>
      <p>年龄: {user.age}</p>
      <p>简介: {user.profile.bio}</p>
      <button onClick={goodUpdate}>更新年龄</button>
      <button onClick={updateProfile}>更新简介</button>
    </div>
  );
};
```

### 数组状态更新

```jsx
const ArrayState = () => {
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // 添加项目
  const addItem = () => {
    if (inputValue.trim()) {
      setItems((prevItems) => [
        ...prevItems,
        {
          id: Date.now(),
          text: inputValue,
          completed: false,
        },
      ]);
      setInputValue("");
    }
  };

  // 删除项目
  const removeItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // 更新项目
  const toggleItem = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // 清空所有
  const clearItems = () => {
    setItems([]);
  };

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="输入新项目"
      />
      <button onClick={addItem}>添加</button>
      <button onClick={clearItems}>清空</button>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span
              style={{
                textDecoration: item.completed ? "line-through" : "none",
              }}
              onClick={() => toggleItem(item.id)}
            >
              {item.text}
            </span>
            <button onClick={() => removeItem(item.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## 常见问题与陷阱

### 问题 1：状态更新合并

```jsx
const MergeProblem = () => {
  const [user, setUser] = useState({
    name: "John",
    age: 25,
  });

  // ❌ 问题：会丢失 age 属性！
  const updateName = (newName) => {
    setUser({ name: newName });
  };

  // ✅ 解决方案：总是展开旧状态
  const updateNameSafely = (newName) => {
    setUser((prevUser) => ({
      ...prevUser,
      name: newName,
    }));
  };

  // ✅ 或者使用多个状态
  const [name, setName] = useState("John");
  const [age, setAge] = useState(25);

  return (
    <div>
      <p>姓名: {user.name}</p>
      <p>年龄: {user.age}</p>
      <button onClick={() => updateNameSafely("Jane")}>更新姓名</button>
    </div>
  );
};
```

### 问题 2：过时闭包

```jsx
export default function StaleClosure() {
  const [count, setCount] = useState(0);

  // ❌ 问题：3秒后打印的还是旧的 count
  const problematicAlert = () => {
    setTimeout(() => {
      alert(`当前计数: ${count}`); // 总是 alert 点击时的值
    }, 3000);
  };

  // ✅ 解决方案1：使用 useRef 保存最新值
  const countRef = useRef(count);
  countRef.current = count;

  const betterAlert = () => {
    setTimeout(() => {
      alert(`当前计数: ${countRef.current}`); // 总是最新值
    }, 3000);
  };
  // ✅ 解决方案2：使用 useLatest 自定义 Hook
  const useLatest = (value) => {
    const ref = useRef(value);

    useEffect(() => {
      ref.current = value;
    }, [value]);

    return ref;
  };
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={problematicAlert}>3秒后显示计数</button>
      <button onClick={betterAlert}>3秒后显示计数</button>
    </div>
  );
}
```

### 问题 3：无限重新渲染

```jsx
const InfiniteRender = () => {
  // ❌ 危险：对象字面量每次都是新的
  const [config, setConfig] = useState({ theme: "dark" });

  useEffect(() => {
    // 因为 config 每次都是新对象，effect 会无限执行
    console.log("Config changed:", config);
  }, [config]); // 🚨 无限循环！

  // ✅ 解决方案1：使用 useMemo
  const [config, setConfig] = useState({ theme: "dark" });
  const stableConfig = useMemo(() => config, [config]);

  // ✅ 解决方案2：拆分为原始值
  const [theme, setTheme] = useState("dark");

  return <div>主题: {theme}</div>;
};
```

## 高级使用模式

### 自定义 Hook 封装状态逻辑

```jsx
// 自定义 Hook：切换布尔值
const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prevValue) => !prevValue);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, { toggle, setTrue, setFalse }];
};

// 使用
const Component = () => {
  const [isVisible, { toggle, setTrue, setFalse }] = useToggle(false);

  return (
    <div>
      {isVisible && <div>显示的内容</div>}
      <button onClick={toggle}>切换</button>
      <button onClick={setTrue}>显示</button>
      <button onClick={setFalse}>隐藏</button>
    </div>
  );
};
```

### 表单状态管理

```jsx
const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;

      setValues((prevValues) => ({
        ...prevValues,
        [name]: type === "checkbox" ? checked : value,
      }));

      // 清除该字段的错误
      if (errors[name]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback((event) => {
    const { name } = event.target;

    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    setErrors,
    reset,
  };
};

// 使用
const ContactForm = () => {
  const { values, errors, touched, handleChange, handleBlur, reset } = useForm({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("提交的数据:", values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="姓名"
      />
      {touched.name && errors.name && <div>{errors.name}</div>}

      <input
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="邮箱"
      />

      <textarea
        name="message"
        value={values.message}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="消息"
      />

      <button type="submit">提交</button>
      <button type="button" onClick={reset}>
        重置
      </button>
    </form>
  );
};
```

### 状态持久化

```jsx
const usePersistentState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`读取 ${key} 失败:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`保存 ${key} 失败:`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

// 使用
const Settings = () => {
  const [theme, setTheme] = usePersistentState("theme", "light");
  const [language, setLanguage] = usePersistentState("language", "zh-CN");

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>

      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh-CN">中文</option>
        <option value="en">英文</option>
      </select>
    </div>
  );
};
```

## 性能优化技巧

### 状态拆分

```jsx
// ❌ 不好：不必要的重新渲染
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState({
    basicInfo: { name: "", email: "" },
    preferences: { theme: "light", notifications: true },
    statistics: { loginCount: 0, lastLogin: null },
  });

  // 更新统计信息会导致整个用户对象重新渲染
  const updateStatistics = () => {
    setUser((prev) => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        loginCount: prev.statistics.loginCount + 1,
      },
    }));
  };

  return <div>{user.basicInfo.name}</div>;
};

// ✅ 好：按关注点拆分状态
const UserProfile = ({ userId }) => {
  const [basicInfo, setBasicInfo] = useState({ name: "", email: "" });
  const [preferences, setPreferences] = useState({
    theme: "light",
    notifications: true,
  });
  const [statistics, setStatistics] = useState({
    loginCount: 0,
    lastLogin: null,
  });

  // 现在更新统计信息不会影响其他状态
  const updateStatistics = () => {
    setStatistics((prev) => ({
      ...prev,
      loginCount: prev.loginCount + 1,
    }));
  };

  return <div>{basicInfo.name}</div>;
};
```

### 使用 useMemo 避免不必要计算

```jsx
const ExpensiveComponent = ({ items, filter }) => {
  const [sortOrder, setSortOrder] = useState("asc");

  // ❌ 不好：每次渲染都会重新计算
  const processedItems = items
    .filter((item) => item.name.includes(filter))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );

  // ✅ 好：使用 useMemo 缓存结果
  const processedItems = useMemo(() => {
    return items
      .filter((item) => item.name.includes(filter))
      .sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
  }, [items, filter, sortOrder]);

  return (
    <div>
      <button onClick={() => setSortOrder("asc")}>升序</button>
      <button onClick={() => setSortOrder("desc")}>降序</button>
      {processedItems.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## [实战场景大全](../demo/useState-demo.md)

## 最佳实践总结

### 状态设计原则

1. **最小化状态**：只把会变化的数据放在状态中
2. **避免冗余**：可以从现有状态计算出的值不要放在状态中
3. **合理拆分**：相关的状态放在一起，不相关的状态分开
4. **位置合适**：状态应该放在使用它的组件的最小共同祖先中

### 更新模式最佳实践

```jsx
// ✅ 推荐的模式
const GoodPractices = () => {
  // 1. 使用描述性的状态名
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 2. 使用函数式更新避免竞态条件
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);

  // 3. 复杂对象使用展开语法
  const [user, setUser] = useState({ name: "", age: 0 });
  const updateName = (name) => setUser((prev) => ({ ...prev, name }));

  // 4. 数组操作使用不可变方法
  const [items, setItems] = useState([]);
  const addItem = (item) => setItems((prev) => [...prev, item]);
  const removeItem = (id) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  // 5. 使用自定义 Hook 封装复杂逻辑
  const [data, loading, error] = useApi("/api/data");

  return <div>/* JSX */</div>;
};
```

### 常见陷阱总结

| 陷阱          | 问题             | 解决方案             |
| ------------- | ---------------- | -------------------- |
| 直接修改状态  | 不会触发重新渲染 | 总是创建新对象/数组  |
| 过时闭包      | 使用旧的状态值   | 使用函数式更新       |
| 状态提升不足  | 组件间状态不同步 | 将状态提升到共同祖先 |
| 状态过于庞大  | 性能问题         | 拆分为多个小状态     |
| 缺少 key 属性 | 列表渲染问题     | 为列表项提供唯一 key |

状态应该是不可变的，更新应该是可预测的！
