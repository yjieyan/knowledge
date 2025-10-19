# bind&call&apply

`bind`、`call` 和 `apply` 是 JavaScript 中 `Function.prototype` 上的三个非常重要的方法，它们共同的核心作用是**显式地改变函数执行时的 `this` 指向**。

---

### 核心概念与共同点

**共同目标：** 改变函数体内 `this` 关键字的指向。
**为什么需要它们？** 在 JavaScript 中，函数的 `this` 指向是在**调用时**确定的，取决于调用方式。默认情况下，它可能指向全局对象（非严格模式）、`undefined`（严格模式）或调用它的对象。当我们想“借用”方法或在特定上下文中执行函数时，就需要这三个方法。

---

### 1. `call`

**作用：** 立即调用函数，同时指定函数内部的 `this` 指向和传入的参数列表。

**语法：**
```javascript
function.call(thisArg, arg1, arg2, ...)
```
*   `thisArg`: 在函数运行时指定的 `this` 值。
*   `arg1, arg2, ...`: **参数列表**，逐个传递。

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person1 = { name: 'Alice' };
const person2 = { name: 'Bob' };

// 默认调用，this 指向全局（或undefined）
// introduce('Hello', '!'); // 在浏览器中输出: "Hello, I'm !"

// 使用 call，将 this 指向 person1
introduce.call(person1, 'Hello', '!'); // 输出: "Hello, I'm Alice!"

// 使用 call，将 this 指向 person2
introduce.call(person2, 'Hi', '.'); // 输出: "Hi, I'm Bob."
```

**`call` 的经典应用场景：**
1.  **实现继承（尤其是在 ES5 时代）：**
    ```javascript
    function Parent(name) {
      this.name = name;
    }
    function Child(name, age) {
      // 在子类构造函数中调用父类构造函数，确保父类属性被正确初始化到子类实例上
      Parent.call(this, name); // 这里的 this 是正在创建的 Child 实例
      this.age = age;
    }
    ```
2.  **借用方法：**
    ```javascript
    // 类数组对象 arguments 没有数组的 slice 方法
    function example() {
      // 借用 Array.prototype.slice 方法，将 this 指向 arguments
      const argsArray = Array.prototype.slice.call(arguments);
      console.log(argsArray); // 现在是一个真正的数组
    }
    example(1, 2, 3); // [1, 2, 3]
    ```

---

### 2. `apply`

**作用：** 立即调用函数，同时指定函数内部的 `this` 指向和传入的**参数数组**。

**语法：**
```javascript
function.apply(thisArg, [argsArray])
```
*   `thisArg`: 在函数运行时指定的 `this` 值。
*   `[argsArray]`: **一个数组或类数组对象**，其中的数组元素将作为单独的参数传给函数。

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: 'Charlie' };

// 使用 apply，参数以数组形式传递
introduce.apply(person, ['Hey', '!!!']); // 输出: "Hey, I'm Charlie!!!"
```

**`apply` 的经典应用场景：**
1.  **将数组元素展开作为函数参数（在 ES6 展开运算符 `...` 出现之前，这是唯一方式）：**
    ```javascript
    const numbers = [1, 5, 3, 2, 4];
    
    // 求数组最大值
    // Math.max(1, 5, 3, 2, 4) 可以工作，但 Math.max(numbers) 不行。
    const max = Math.max.apply(null, numbers); // 第一个参数 null，因为 Math.max 不依赖 this
    console.log(max); // 5
    ```
2.  **合并数组（在 ES6 之前）：**
    ```javascript
    const array1 = [1, 2];
    const array2 = [3, 4];
    Array.prototype.push.apply(array1, array2);
    console.log(array1); // [1, 2, 3, 4]
    ```

---

### 3. `bind`

**作用：** **创建一个新的函数**（原函数的拷贝），这个新函数的 `this` 被永久地绑定到 `thisArg` 上。**它不会立即执行函数**。

**语法：**
```javascript
const newFunction = function.bind(thisArg[, arg1[, arg2[, ...]]])
```
*   `thisArg`: 新函数被调用时，其内部的 `this` 值。
*   `arg1, arg2, ...`: （可选）当新函数被调用时，这些参数会被**预置**到参数列表的前面。

**示例与深入分析：**
```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: 'David' };

// 使用 bind 创建一个新函数，其 this 永久绑定为 person
const boundIntroduce = introduce.bind(person);

// 现在，无论以何种方式调用 boundIntroduce，它的 this 始终是 person
boundIntroduce('Hello', '!'); // 输出: "Hello, I'm David!"
setTimeout(boundIntroduce, 1000, 'Hi', '.'); // 一秒后输出: "Hi, I'm David." this 依然正确！

// bind 的柯里化应用：预设参数
const sayHelloToDavid = introduce.bind(person, 'Hello');
sayHelloToDavid('!'); // 输出: "Hello, I'm David!"
sayHelloToDavid('?'); // 输出: "Hello, I'm David?"
```

**`bind` 的经典应用场景：**
1.  **解决回调函数丢失 `this` 的问题：**
    ```javascript
    class Button {
      constructor() {
        this.text = 'Click me';
        // 在构造函数中绑定，确保 handleClick 在任何情况下调用，this 都指向实例
        this.handleClick = this.handleClick.bind(this);
      }
      
      handleClick() {
        console.log(`Button text: ${this.text}`);
      }
    }
    
    const button = new Button();
    // 如果没有上面的 bind，这里的 this 在事件触发时会指向 DOM 元素，导致错误
    document.querySelector('button').addEventListener('click', button.handleClick);
    ```
    （现代开发中，也可使用类属性+箭头函数来避免 `bind`，因为箭头函数没有自己的 `this`）
2.  **[函数柯里化：](./柯里化函数.md)** 创建一个已经预设了部分参数的新函数。

---

### 三者的对比总结

| 特性 | `call` | `apply` | `bind` |
| :--- | :--- | :--- | :--- |
| **执行时机** | **立即执行** | **立即执行** | **返回一个新函数，稍后执行** |
| **参数形式** | **参数列表** (`arg1, arg2, ...`) | **参数数组** (`[arg1, arg2, ...]`) | **参数列表**（可用于柯里化） |
| **返回值** | 原函数的返回值 | 原函数的返回值 | 一个绑定了 `this` 和预设参数的新函数 |
| **核心用途** | 借用方法、实现继承 | 将数组展开为参数传递 | 固定 `this` 指向、柯里化、用于回调 |

### 手写实现原理（深入理解）

**手写 `call`：**
```javascript
Function.prototype.myCall = function(context, ...args) {
  // 如果 context 为 null 或 undefined，默认指向全局对象（浏览器中为 window）
  context = context || globalThis;
  
  // 为了避免属性名冲突，使用 Symbol 创建一个唯一的键
  const fnKey = Symbol('fn');
  
  // 将当前函数（this）作为 context 的一个方法
  context[fnKey] = this;
  
  // 以 context 为上下文调用这个方法，并传入参数
  const result = context[fnKey](...args);
  
  // 删除临时添加的方法
  delete context[fnKey];
  
  // 返回原函数的执行结果
  return result;
};
```

**手写 `apply`：**
```javascript
Function.prototype.myApply = function(context, argsArray = []) {
  context = context || globalThis;
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  
  // 主要区别在这里：使用 ... 展开 argsArray
  const result = context[fnKey](...argsArray);
  
  delete context[fnKey];
  return result;
};
```

**手写 `bind`：**
```javascript
Function.prototype.myBind = function(context, ...presetArgs) {
  const self = this; // 保存原函数
  
  // 返回一个新的函数
  return function(...args) {
    // 组合预设参数和调用时传入的参数
    const allArgs = [...presetArgs, ...args];
    // 使用 call 或 apply 执行原函数，并绑定 this
    return self.call(context, ...allArgs);
  };
};
```

### 总结

`call`、`apply` 和 `bind` 是 JavaScript 中控制函数执行上下文的利器。
*   当你需要**立即调用**函数并改变 `this`，且参数已知时，用 `call`。
*   当你需要**立即调用**函数并改变 `this`，且参数是数组时，用 `apply`。
*   当你不需要立即调用，而是想**创建一个新的函数**并永久绑定 `this`（常用于事件回调）或实现**柯里化**时，用 `bind`。
