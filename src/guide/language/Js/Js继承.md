# Js继承
JavaScript 主要基于**原型**而非类，其继承实现方式与基于类的语言有很大不同。

---

### 1. 原型链继承

这是最基本的继承方式，通过让子类的原型对象指向父类的实例来实现。

```javascript
function Parent(name) {
  this.name = name || 'Parent';
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.sayName = function() {
  console.log('My name is ' + this.name);
};

function Child(age) {
  this.age = age;
}

// 核心：让子类的原型指向父类的实例
Child.prototype = new Parent(); // 没有传递name，使用默认值
Child.prototype.constructor = Child; // 修复constructor指向

Child.prototype.sayAge = function() {
  console.log('I am ' + this.age + ' years old');
};

// 测试
const child1 = new Child(5);
child1.sayName(); // "My name is Parent"
child1.sayAge();  // "I am 5 years old"

// 问题1：引用类型属性被所有实例共享
child1.colors.push('black');
console.log(child1.colors); // ['red', 'blue', 'green', 'black']

const child2 = new Child(10);
console.log(child2.colors); // ['red', 'blue', 'green', 'black'] (!)

// 问题2：无法向父类构造函数传参
```

**缺点：**
1. 引用类型的属性被所有实例共享
2. 创建子类实例时，无法向父类构造函数传参

---

### 2. 构造函数继承（经典继承）

在子类构造函数内部调用父类构造函数，使用 `call` 或 `apply` 方法。

```javascript
function Parent(name) {
  this.name = name || 'Parent';
  this.colors = ['red', 'blue', 'green'];
  this.sayName = function() {
    console.log('My name is ' + this.name);
  };
}

function Child(name, age) {
  // 核心：在子类构造函数中调用父类构造函数
  Parent.call(this, name); // 相当于把Parent中的代码在Child中执行一遍
  this.age = age;
}

// 测试
const child1 = new Child('Alice', 5);
const child2 = new Child('Bob', 10);

child1.colors.push('black');
console.log(child1.colors); // ['red', 'blue', 'green', 'black']
console.log(child2.colors); // ['red', 'blue', 'green'] (!) 问题解决

child1.sayName(); // "My name is Alice"
child2.sayName(); // "My name is Bob"

// 问题：方法都在构造函数中定义，无法复用
console.log(child1.sayName === child2.sayName); // false (!)
```

**缺点：**
1. 方法都在构造函数中定义，每次创建实例都会创建一遍方法，无法实现函数复用
2. 只能继承父类的实例属性和方法，不能继承原型属性和方法

---

### 3. 组合继承（最常用）

结合原型链继承和构造函数继承，是 JavaScript 中最常用的继承模式。

```javascript
function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

// 方法定义在原型上，实现复用
Parent.prototype.sayName = function() {
  console.log('My name is ' + this.name);
};

function Child(name, age) {
  // 1. 构造函数继承：继承实例属性
  Parent.call(this, name); // 第二次调用Parent
  this.age = age;
}

// 2. 原型链继承：继承原型方法
Child.prototype = new Parent(); // 第一次调用Parent
Child.prototype.constructor = Child;

// 子类自己的方法
Child.prototype.sayAge = function() {
  console.log('I am ' + this.age + ' years old');
};

// 测试
const child1 = new Child('Alice', 5);
const child2 = new Child('Bob', 10);

child1.colors.push('black');
console.log(child1.colors); // ['red', 'blue', 'green', 'black']
console.log(child2.colors); // ['red', 'blue', 'green']

child1.sayName(); // "My name is Alice"
child2.sayName(); // "My name is Bob"

console.log(child1.sayName === child2.sayName); // true (!) 方法复用
```

**优点：**
1. 融合了两种继承方式的优点
2. 实例属性私有，原型方法共享
3. 既是子类的实例，也是父类的实例

**缺点：**
1. 调用了两次父类构造函数（性能开销）

---

### 4. 原型式继承

基于已有对象创建新对象，ES5 的 `Object.create()` 方法规范化了原型式继承。

```javascript
// 原型式继承的实现（类似于Object.create的简化版）
function createObject(o) {
  function F() {} // 临时构造函数
  F.prototype = o; // 将传入的对象作为原型
  return new F(); // 返回这个临时构造函数的实例
}

const parent = {
  name: 'Parent',
  colors: ['red', 'blue', 'green'],
  sayName: function() {
    console.log('My name is ' + this.name);
  }
};

const child1 = createObject(parent);
child1.name = 'Alice';
child1.colors.push('black');

const child2 = createObject(parent);
child2.name = 'Bob';

console.log(child1.colors); // ['red', 'blue', 'green', 'black']
console.log(child2.colors); // ['red', 'blue', 'green', 'black'] (!) 问题依旧

// ES5的Object.create方法
const child3 = Object.create(parent, {
  name: {
    value: 'Charlie',
    writable: true,
    enumerable: true,
    configurable: true
  }
});
```

**适用场景：** 不需要单独创建构造函数，但仍然需要在对象间共享信息的场景。

---

### 5. 寄生式继承

在原型式继承的基础上，增强对象，然后返回这个对象。

```javascript
function createAnother(original) {
  const clone = Object.create(original); // 通过调用函数创建一个新对象
  
  // 增强这个对象
  clone.sayHello = function() {
    console.log('Hello, I am ' + this.name);
  };
  
  return clone;
}

const parent = {
  name: 'Parent',
  colors: ['red', 'blue', 'green']
};

const child1 = createAnother(parent);
child1.name = 'Alice';
child1.sayHello(); // "Hello, I am Alice"
```

**缺点：** 跟构造函数模式类似，方法无法复用。

---

### 6. 寄生组合式继承（最理想）

这是最理想的继承方式，解决了组合继承的两次调用构造函数问题。

```javascript
function inheritPrototype(child, parent) {
  // 1. 创建父类原型的副本
  const prototype = Object.create(parent.prototype);
  
  // 2. 修复constructor指向
  prototype.constructor = child;
  
  // 3. 将副本设置为子类的原型
  child.prototype = prototype;
}

function Parent(name) {
  this.name = name;
  this.colors = ['red', 'blue', 'green'];
}

Parent.prototype.sayName = function() {
  console.log('My name is ' + this.name);
};

function Child(name, age) {
  // 构造函数继承：只调用一次父类构造函数
  Parent.call(this, name);
  this.age = age;
}

// 使用寄生组合式继承
inheritPrototype(Child, Parent);

// 子类自己的方法
Child.prototype.sayAge = function() {
  console.log('I am ' + this.age + ' years old');
};

// 测试
const child = new Child('Alice', 5);
child.sayName(); // "My name is Alice"
child.sayAge();  // "I am 5 years old"

console.log(child instanceof Child);  // true
console.log(child instanceof Parent); // true
```

**优点：**
1. 只调用一次父类构造函数
2. 避免了在子类原型上创建不必要的属性
3. 原型链保持不变

---

### 7. ES6 Class 继承

ES6 引入了 `class` 语法，让继承变得更加简洁易懂。

```javascript
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
  }
  
  sayName() {
    console.log('My name is ' + this.name);
  }
  
  // 静态方法
  static staticMethod() {
    console.log('This is a static method');
  }
}

class Child extends Parent {
  constructor(name, age) {
    // 调用父类的constructor，相当于Parent.call(this, name)
    super(name); 
    this.age = age;
  }
  
  sayAge() {
    console.log('I am ' + this.age + ' years old');
  }
  
  // 重写父类方法
  sayName() {
    super.sayName(); // 调用父类的方法
    console.log('And I am a child');
  }
}

// 测试
const child1 = new Child('Alice', 5);
const child2 = new Child('Bob', 10);

child1.colors.push('black');
console.log(child1.colors); // ['red', 'blue', 'green', 'black']
console.log(child2.colors); // ['red', 'blue', 'green']

child1.sayName(); 
// "My name is Alice"
// "And I am a child"

Child.staticMethod(); // "This is a static method"

console.log(child1 instanceof Child);  // true
console.log(child1 instanceof Parent); // true
```

**ES6 Class 继承的特点：**
1. 使用 `extends` 关键字实现继承
2. 子类构造函数中必须调用 `super()` 来调用父类的构造函数
3. `super` 关键字既可以作为函数调用，也可以作为对象调用
4. 支持静态方法的继承
5. **本质：** ES6 的 Class 是语法糖，底层仍然是基于原型的继承

---

### 8. 各种继承方式对比总结

| 继承方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|----------|
| **原型链继承** | 简单 | 引用属性共享、无法传参 | 基本不用 |
| **构造函数继承** | 可传参、属性独立 | 方法无法复用 | 需要属性独立的场景 |
| **组合继承** | 属性独立、方法复用 | 调用两次父类构造函数 | 传统项目、ES5环境 |
| **原型式继承** | 简单、不需要构造函数 | 引用属性共享 | 对象字面量继承 |
| **寄生式继承** | 可增强对象 | 方法无法复用 | 简单对象增强 |
| **寄生组合式继承** | **最完美、高效** | 实现稍复杂 | 对性能要求高的场景 |
| **ES6 Class继承** | **语法简洁、现代** | 需要转译、浏览器兼容 | **现代项目首选** |

1. **现代项目：** 直接使用 **ES6 Class 继承**
2. **传统项目：** 使用 **组合继承** 或 **寄生组合式继承**
3. **理解原理：** 虽然 ES6 Class 很友好，但理解底层原型继承机制至关重要

** JavaScript 的继承本质上是**原型的继承**，而不是类的继承。**