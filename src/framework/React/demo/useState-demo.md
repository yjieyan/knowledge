
### 场景 1：计数器增强版

```jsx
const AdvancedCounter = () => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(1);

  const increment = () => {
    setCount((prevCount) => {
      const newCount = prevCount + step;
      setHistory((prevHistory) => [...prevHistory, newCount]);
      return newCount;
    });
  };

  const decrement = () => {
    setCount((prevCount) => {
      const newCount = prevCount - step;
      setHistory((prevHistory) => [...prevHistory, newCount]);
      return newCount;
    });
  };

  const reset = () => {
    setCount(0);
    setHistory([]);
  };

  const undo = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length > 0) {
        const newHistory = prevHistory.slice(0, -1);
        setCount(newHistory[newHistory.length - 1] || 0);
        return newHistory;
      }
      return prevHistory;
    });
  };

  return (
    <div>
      <div>
        <label>
          步长:
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
          />
        </label>
      </div>

      <div>当前计数: {count}</div>

      <button onClick={decrement}>-{step}</button>
      <button onClick={increment}>+{step}</button>
      <button onClick={reset}>重置</button>
      <button onClick={undo} disabled={history.length === 0}>
        撤销
      </button>

      <div>
        <h4>历史记录:</h4>
        <ul>
          {history.map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

### 场景 2：购物车

```jsx
const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: "商品A", price: 100 },
    { id: 2, name: "商品B", price: 200 },
    { id: 3, name: "商品C", price: 300 },
  ]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h2>商品列表</h2>
      <div>
        {products.map((product) => (
          <div key={product.id}>
            {product.name} - ¥{product.price}
            <button onClick={() => addToCart(product)}>加入购物车</button>
          </div>
        ))}
      </div>

      <h2>购物车</h2>
      {cart.length === 0 ? (
        <p>购物车为空</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id}>
              {item.name} - ¥{item.price} ×
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              {item.quantity}
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
              <button onClick={() => removeFromCart(item.id)}>删除</button>
            </div>
          ))}
          <h3>总计: ¥{total}</h3>
        </div>
      )}
    </div>
  );
};
```

### 场景 3：任务管理器

```jsx
const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, completed

  const addTask = () => {
    if (newTask.trim()) {
      setTasks((prevTasks) => [
        ...prevTasks,
        {
          id: Date.now(),
          text: newTask.trim(),
          completed: false,
          createdAt: new Date(),
        },
      ]);
      setNewTask("");
    }
  };

  const toggleTask = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const clearCompleted = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.completed));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  };

  return (
    <div>
      <h1>任务管理器</h1>

      <div>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTask()}
          placeholder="添加新任务..."
        />
        <button onClick={addTask}>添加</button>
      </div>

      <div>
        <button onClick={() => setFilter("all")}>全部 ({stats.total})</button>
        <button onClick={() => setFilter("active")}>
          进行中 ({stats.active})
        </button>
        <button onClick={() => setFilter("completed")}>
          已完成 ({stats.completed})
        </button>
        <button onClick={clearCompleted}>清除已完成</button>
      </div>

      <ul>
        {filteredTasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                marginLeft: "10px",
              }}
            >
              {task.text}
            </span>
            <button onClick={() => deleteTask(task.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```
