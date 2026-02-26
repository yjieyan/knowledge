
---
1. 函数组件签名：多写形参导致 props 全是 undefined
---
错误写法  
```jsx
// 想当然地把“name”和“age”拆成两个形参
function UserCard(name, age) {   // ❌
  return <div>{name} · {age}</div>;
}
ReactDOM.render(<UserCard name="Lucy" age={20} />, root);
```
浏览器输出：  
`·` （空字符串，没有任何报错，但数据就是不出来）

正确写法  
```jsx
function UserCard({ name, age }) {  // ✅ 只保留一个 props 形参
  return <div>{name} · {age}</div>;
}
```
总结：React 只把**一个**对象塞进第一形参，多写参数全部拿到 `undefined`，且**不会触发任何警告**，最容易“数据莫名消失”。

---
2. Props 不可变：直接 push 数组，界面“死活不更新”
---
错误写法  
```jsx
function TodoList({ todos, setTodos }) {
  function handleAdd() {
    todos.push({ id: Date.now(), text: '新事项' }); // ❌ 改原数组
    setTodos(todos);          // 地址没变，React 认为没变化
  }
  return (
    <>
      <button onClick={handleAdd}>add</button>
      <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>
    </>
  );
}
```
现象：点击按钮，列表**第一次能加，之后怎么点都不动**，也不报错。

正确写法  
```jsx
function TodoList({ todos, setTodos }) {
  function handleAdd() {
    setTodos([...todos, { id: Date.now(), text: '新事项' }]); // ✅ 返回新引用
  }
  /* ... */
}
```
总结：引用类型**原地修改**再 `setState`，地址相等导致 React 跳过渲染；调试时打断点发现 `todos` 里数据其实多了，但屏幕就是不动。

---
3. children 切片：直接 Array.prototype.slice 把 key 弄丢
---
错误写法  
```jsx
function Swiper({ children }) {
  // 直接当普通数组切
  const pair = children.slice(0, 2);   // ❌
  return <div className="swiper">{pair}</div>;
}

<Swiper>
  <img src="1.jpg" key="1" />
  <img src="2.jpg" key="2" />
  <img src="3.jpg" key="3" />
</Swiper>
```
现象：控制台警告  
`Warning: Each child in a list should have a unique "key" prop.`  
（key 明明写了，却提示缺失）

正确写法  
```jsx
function Swiper({ children }) {
  const pair = React.Children.toArray(children).slice(0, 2); // ✅
  return <div className="swiper">{pair}</div>;
}
```
总结：`React.Children.toArray` 会给每个元素**自动生成保留原 key 的新数组**，直接 `children.slice` 会丢失 key，导致 React 把旧 key 当成新节点，出现重复 key 或 key 缺失警告。

---
4. prop-types 快速校验：给 TS 项目配了 prop-types 却**永远不起作用**
---
错误写法  
```tsx
// TypeScript 文件 Button.tsx
interface Props { color?: 'primary' | 'danger'; }

const Button: React.FC<Props> = ({ color = 'primary', children }) => {
  return <button className={color}>{children}</button>;
};

Button.propTypes = {        // ❌ 写在 TS 里
  color: PropTypes.oneOf(['primary', 'danger']),
};
```
现象：  
- 把 `color="wrong"` 传进去，控制台**没有任何 prop-types 警告**。  
- 以为写错了，其实是因为 **TypeScript 编译后 prop-types 被直接删掉**（babel-preset-react-app 默认行为）。

正确做法  
1. 纯 TS 项目直接靠类型，不写 prop-types；  
2. 如果组件要**发布给 JS 用户**，把 prop-types 写到**单独一份 JS 文件**里：  
```js
// Button.js （编译后的 JS）
export function Button({ color = 'primary', children }) { ... }

Button.propTypes = {
  color: PropTypes.oneOf(['primary', 'danger']),
};
```
总结：在 `.tsx` 里写 `propTypes` 会**被编译器抹除**，导致“写了也白写”；要么别写，要么写到编译后的 JS 入口。

---