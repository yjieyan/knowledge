# React基础

1.  **React 是什么？它的设计哲学**
2.  **JSX：JavaScript 的语法扩展**
3.  **组件：构建现代 UI 的基石**
4.  **状态（State）与属性（Props）：数据流的核心**
5.  **事件处理**
6.  **条件渲染与列表渲染**
7.  **生命周期与副作用（Hooks）**
8.  **受控组件 vs 非受控组件**

---

### 1. React 是什么？它的设计哲学

React 是一个用于构建用户界面的 **JavaScript 库**（而非框架）。它的核心目标是通过组件化的方式，高效、灵活地创建可交互的 UI。

**三大设计哲学：**

*   **声明式**：你只需要“声明”或“描述”UI 在任意状态下的样子（What），而无需关心状态变化时 UI 是如何被更新到 DOM 的（How）。这与 jQuery 那样的**命令式**操作 DOM 形成鲜明对比。这使得代码更可预测，更易于理解和调试。
    *   **命令式**：“找到这个 div，清空它的内容，然后创建一个新的 span 元素，设置文本为 ‘Hello’，再把它加到 div 里。”
    *   **声明式**：`<div>{isHello ? <span>Hello</span> : null}</div>`

*   **组件化**：UI 可以被拆分成独立、可复用、各自管理状态的代码片段，即“组件”。组件逻辑使用 JavaScript 编写，而非模板，这样可以轻松地在组件中传递丰富的数据，并保持状态与 DOM 的分离。

*   **一次学习，随处编写**：React 并不假设你的技术栈的其他部分。你可以在现有项目中逐步引入 React，也可以用它来开发新的复杂 SPA，甚至可以用 React Native 来开发原生移动应用。

---

### 2. JSX：JavaScript 的语法扩展

JSX 是 React 的核心组成部分，它允许我们在 JavaScript 代码中编写类似 HTML 的结构。

*   **本质**：JSX 只是一个**语法糖**，它会被 Babel 等工具编译成 `React.createElement()` 函数调用，最终产生一个**React 元素**（一个轻量级的 JavaScript 对象），描述你想要在屏幕上看到的内容。

    ```jsx
    // JSX 写法
    const element = <h1 className="greeting">Hello, world!</h1>;

    // 编译后的 JavaScript
    const element = React.createElement(
      'h1',
      {className: 'greeting'},
      'Hello, world!'
    );
    ```

*   **规则**：
    1.  **必须返回一个根元素**：通常使用 `<div>`、`<>`（Fragment）或任何其他容器。
    2.  **所有标签必须闭合**：如 `<img />`、`<input />`。
    3.  **使用 `className` 代替 `class`**，`htmlFor` 代替 `for`（因为这些都是 JavaScript 的保留关键字）。
    4.  **在 JSX 中嵌入 JavaScript 表达式使用花括号 `{}`**。
    5.  **React 元素必须大写字母开头**，以区分 HTML 原生标签。

---

### 3. 组件：构建现代 UI 的基石

React 中有两种主要的组件定义方式：

#### **函数组件（推荐、现代）**

这是一个纯 JavaScript 函数，它接收 `props` 作为参数，并返回 JSX。

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 或使用箭头函数
const Welcome = (props) => {
  return <h1>Hello, {props.name}</h1>;
};
```

#### **类组件（传统）**

使用 ES6 class 定义的组件，它继承自 `React.Component`，并且必须包含一个 `render()` 方法。

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

**现代 React 开发中，函数组件结合 Hooks 是绝对的主流和推荐做法。**

---

### 4. 状态（State）与属性（Props）：数据流的核心

这是 React 中最重要的两个概念，构成了 React 的**单向数据流**。

#### **Props（属性）**

*   **是什么**：组件的外部传入参数，类似于函数的参数。**Props 是只读的**，组件绝不能修改自身的 props。
*   **作用**：用于从父组件向子组件传递数据和方法。
*   **数据流**：**自上而下（单向）**。这使应用的 state 总是可预测的。

```jsx
function App() {
  const message = "Hello from Parent";
  return <Welcome text={message} />; // 传递 text prop
}

function Welcome(props) {
  return <h1>{props.text}</h1>; // 接收并使用 text prop
}
```

#### **State（状态）**

*   **是什么**：组件内部管理的、随时间变化的数据。状态是组件的“记忆”。当状态改变时，组件会重新渲染。
*   **作用**：用于处理组件内部的交互、动态数据。
*   **在函数组件中使用 State**：使用 `useState` Hook。

```jsx
import { useState } from 'react';

function Counter() {
  // useState 返回一个数组： [当前状态, 更新状态的函数]
  const [count, setCount] = useState(0); // 初始状态为 0

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**关键区别总结：**

| 特性 | Props | State |
| :--- | :--- | :--- |
| **来源** | 父组件传递 | 组件内部创建和管理 |
| **是否可变** | **只读**，不可变 | **可变**，通过 setter 函数更新 |
| **用途** | 传递数据、配置组件 | 管理组件内部动态数据、响应交互 |

---

### 5. 事件处理

React 元素的事件处理与 DOM 元素非常相似，但有语法差异：

*   React 事件使用**驼峰命名**（`onClick`），而不是纯小写（`onclick`）。
*   在 JSX 中，你传入一个**函数**作为事件处理程序，而不是一个字符串。

```jsx
function Button() {
  const handleClick = (e) => { // e 是一个合成事件对象
    e.preventDefault();
    alert('Button clicked!');
  };

  return (
    <button onClick={handleClick}> // 传递函数引用，不要调用 handleClick()
      Click Me
    </button>
  );
}
```

---

### 6. 条件渲染与列表渲染

#### **条件渲染**

在 JSX 中，你可以使用 JavaScript 运算符如 `if`、`&&` 或三元运算符 `? :` 来有条件地渲染元素。

```jsx
function Greeting({ isLoggedIn, user }) {
  return (
    <div>
      {isLoggedIn ? (
        <h1>Welcome back, {user.name}!</h1>
      ) : (
        <h1>Please sign up.</h1>
      )}
      {/* 使用 && 运算符进行更简单的条件渲染 */}
      {isLoggedIn && <p>You are logged in.</p>}
    </div>
  );
}
```

#### **列表渲染**

使用数组的 `map()` 方法将一组数据映射为一组 React 元素。**必须给每个列表项提供一个唯一的 `key` 属性**，这帮助 React 识别哪些项改变了、被添加或删除了，是性能优化的关键。

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}> {/* Key 必须是稳定、唯一的！ */}
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

---

### 7. 生命周期与副作用（Hooks）

在函数组件中，我们使用 **Hooks** 来“钩入” React 的特性，如状态和生命周期。

*   **`useState`**：如上所述，用于在函数组件中添加状态。
*   **`useEffect`**：用于处理“副作用”。副作用是指那些数据获取、订阅、或手动修改 DOM 等发生在组件渲染之外的操作。它相当于类组件中的 `componentDidMount`， `componentDidUpdate` 和 `componentWillUnmount` 的组合。

```jsx
import { useState, useEffect } from 'react';

function Example() {
  const [data, setData] = useState(null);

  // useEffect 接收一个函数（副作用逻辑）和一个依赖数组
  useEffect(() => {
    // 这个函数在组件渲染后执行
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);

    // 返回一个清理函数（可选），在组件卸载时执行，相当于 componentWillUnmount
    return () => {
      console.log('Cleanup');
    };
  }, []); // 依赖数组为空，表示此 effect 只会在组件挂载后执行一次

  return <div>{data ? data.name : 'Loading...'}</div>;
}
```

---

### 8. 受控组件 vs 非受控组件

这是处理表单元素时的核心概念。

*   **受控组件**：表单数据由 React 组件state管理。表单输入的值由 React 控制，每次输入都会触发状态更新和重新渲染。
    ```jsx
    function ControlledInput() {
      const [value, setValue] = useState('');
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)} // 状态是唯一数据源
        />
      );
    }
    ```

*   **非受控组件**：表单数据由 DOM 自身管理。我们使用 `ref` 来从 DOM 中获取表单值。
    ```jsx
    import { useRef } from 'react';

    function UncontrolledInput() {
      const inputRef = useRef(null);
      const handleSubmit = () => {
        alert('Name: ' + inputRef.current.value); // 通过 ref 直接获取 DOM 值
      };
      return (
        <>
          <input type="text" ref={inputRef} />
          <button onClick={handleSubmit}>Submit</button>
        </>
      );
    }
    ```

**在 React 中，受控组件是更被推荐的做法**，因为它将状态变化完全纳入了 React 的数据流管理。

---

### 总结

*   **核心思想**：声明式、组件化。
*   **构建工具**：JSX，用于描述 UI。
*   **数据核心**：单向数据流，通过不可变的 **Props** 向下传递，通过可变的 **State** 管理内部状态。
*   **交互核心**：事件处理。
*   **动态 UI**：通过条件渲染和列表渲染实现。
*   **现代范式**：使用**函数组件**和 **Hooks**（如 `useState`, `useEffect`）来管理状态和副作用。
*   **表单处理**：优先使用**受控组件**。
