# ES6新特性

[阮一峰ES6](https://es6.ruanyifeng.com/)

ES6（ECMAScript 2015）是 JavaScript 语言的一次重大更新，它引入了大量强大的新特性，彻底改变了 JavaScript 的开发方式。可以说，现代前端开发就是建立在 ES6 基础之上的。

---

### 一、变量声明：`let` 与 `const`

**解决了 `var` 的问题：**
- **块级作用域：** `let` 和 `const` 声明的变量只在当前代码块内有效。
- **不存在变量提升：** 必须先声明后使用。
- **暂时性死区：** 在声明之前访问会报错。
- **不允许重复声明。**

```javascript
// var 的问题
console.log(a); // undefined (变量提升)
var a = 1;

// let/const 的优势
// console.log(b); // ❌ ReferenceError
let b = 2;

if (true) {
  var c = 3;
  let d = 4;
}
console.log(c); // 3
// console.log(d); // ❌ ReferenceError

// const 用于常量
const PI = 3.14159;
// PI = 3; // ❌ TypeError: Assignment to constant variable.

// const 对于对象（注意：是地址不变）
const obj = { name: 'Alice' };
obj.name = 'Bob'; // ✅ 允许
// obj = {}; // ❌ 不允许重新赋值
```

---

### 二、箭头函数

提供了更简洁的函数语法，并改变了 `this` 的指向。

```javascript
// 传统函数
const add = function(a, b) {
  return a + b;
};

// 箭头函数
const add = (a, b) => a + b;
const square = x => x * x;        // 单个参数可省略括号
const log = () => console.log('hi'); // 无参数需要括号

// 多行函数体需要大括号和 return
const multiply = (a, b) => {
  const result = a * b;
  return result;
};
```

**`this` 绑定行为：**
箭头函数没有自己的 `this`，它继承自父级作用域。

```javascript
// 传统函数的 this 问题
const obj = {
  name: 'Alice',
  traditional: function() {
    setTimeout(function() {
      console.log(this.name); // undefined (this 指向 window/global)
    }, 100);
  },
  arrow: function() {
    setTimeout(() => {
      console.log(this.name); // 'Alice' (this 继承自 arrow 函数)
    }, 100);
  }
};
```

---

### 三、模板字符串

使用反引号（`` ` ``）创建字符串，支持多行字符串和变量插值。

```javascript
const name = 'Alice';
const age = 25;

// 传统方式
const str1 = 'Hello, ' + name + '! You are ' + age + ' years old.';

// 模板字符串
const str2 = `Hello, ${name}! You are ${age} years old.`;

// 多行字符串
const multiLine = `
  This is a
  multi-line
  string.
`;

// 表达式嵌入
const calculation = `2 + 3 = ${2 + 3}`; // "2 + 3 = 5"
```

---

### 四、解构赋值

从数组或对象中提取值，并赋值给变量。

**数组解构：**
```javascript
const numbers = [1, 2, 3, 4];

// 传统方式
const first = numbers[0];
const second = numbers[1];

// 解构赋值
const [first, second, , fourth] = numbers;
console.log(first, second, fourth); // 1, 2, 4

// 默认值
const [a = 10, b = 20] = [1];
console.log(a, b); // 1, 20

// 交换变量
let x = 1, y = 2;
[x, y] = [y, x];
```

**对象解构：**
```javascript
const person = {
  name: 'Alice',
  age: 25,
  address: {
    city: 'Beijing'
  }
};

// 传统方式
const name = person.name;
const age = person.age;

// 解构赋值
const { name, age } = person;
const { name: personName, age: personAge } = person; // 重命名
const { address: { city } } = person; // 嵌套解构
const { country = 'China' } = person; // 默认值

// 函数参数解构
function printPerson({ name, age }) {
  console.log(`${name} is ${age} years old`);
}
```

---

### 五、默认参数

为函数参数提供默认值。

```javascript
// 传统方式
function greet(name) {
  name = name || 'Guest';
  console.log(`Hello, ${name}`);
}

// ES6 默认参数
function greet(name = 'Guest', age = 18) {
  console.log(`Hello, ${name}. You are ${age} years old.`);
}

greet(); // "Hello, Guest. You are 18 years old."
greet('Alice'); // "Hello, Alice. You are 18 years old."
greet('Bob', 25); // "Hello, Bob. You are 25 years old."
```

---

### 六、展开运算符与剩余参数

**展开运算符 `...`：** 将数组或对象展开。
**剩余参数 `...`：** 将多个参数收集到一个数组中。

```javascript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]
console.log(Math.max(...arr1)); // 3

// 对象展开 (浅拷贝)
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
console.log(sum(1, 2, 3, 4)); // 10

// 结合解构
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest); // 1, [2, 3, 4]
```

---

### 七、增强的对象字面量

更简洁的对象语法。

```javascript
const name = 'Alice';
const age = 25;

// 传统方式
const person = {
  name: name,
  age: age,
  sayHello: function() {
    console.log('Hello');
  }
};

// ES6 增强字面量
const person = {
  name,        // 属性简写
  age,
  sayHello() { // 方法简写
    console.log('Hello');
  },
  // 计算属性名
  ['prop_' + (() => 'dynamic')()]: 'value'
};
```

---

### 八、模块化

ES6 引入了官方的模块系统。

**导出：**
```javascript
// math.js
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
// 或者默认导出
export default class Calculator {
  // ...
}
```

**导入：**
```javascript
// app.js
import { PI, add } from './math.js';
import Calculator from './math.js'; // 默认导入
import * as MathUtils from './math.js'; // 全部导入
```

---

### 九、Promise

用于处理异步操作，解决了回调地狱问题。

```javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve('Data received');
      } else {
        reject('Error occurred');
      }
    }, 1000);
  });
};

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---

### 十、Class 类

提供了更接近传统面向对象语言的语法。

```javascript
// 传统构造函数
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

// ES6 Class
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  // 实例方法
  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
  
  // 静态方法
  static describe() {
    return 'A person class';
  }
  
  // Getter/Setter
  get info() {
    return `${this.name} - ${this.age}`;
  }
}

// 继承
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age); // 调用父类构造函数
    this.grade = grade;
  }
  
  study() {
    console.log(`${this.name} is studying`);
  }
}
```

---

### 十一、其他重要特性

**1. Symbol：** 新的原始数据类型，表示唯一值。
```javascript
const sym1 = Symbol('key');
const sym2 = Symbol('key');
console.log(sym1 === sym2); // false
```

**2. Set 和 Map：**
```javascript
// Set - 值唯一的集合
const set = new Set([1, 2, 3, 3, 4]);
console.log([...set]); // [1, 2, 3, 4]

// Map - 键值对集合，键可以是任意类型
const map = new Map();
map.set('name', 'Alice');
map.set(1, 'number key');
```

**3. 迭代器和 for...of：**
```javascript
const arr = [1, 2, 3];
for (const item of arr) {
  console.log(item); // 1, 2, 3
}
```

---

### 总结

| 类别 | 核心特性 | 解决的问题 |
| :--- | :--- | :--- |
| **变量作用域** | `let`/`const` | 块级作用域、变量提升 |
| **函数** | 箭头函数、默认参数 | `this` 指向、参数处理 |
| **数据结构** | 解构赋值、模板字符串 | 代码简洁性、可读性 |
| **面向对象** | Class、继承 | 更清晰的面向对象语法 |
| **异步编程** | Promise | 回调地狱 |
| **模块化** | import/export | 代码组织、依赖管理 |
| **新数据类型** | Symbol、Set、Map | 更多数据结构选择 |


