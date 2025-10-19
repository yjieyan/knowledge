# Ts基础
TypeScript 作为 JavaScript 的超集，其核心价值在于为 JavaScript 提供了**可选的静态类型系统**和对**未来 ES 特性**的支持。

1.  **TypeScript 是什么？为什么需要它？**
2.  **基础类型（Primitive Types）**
3.  **数组、元组（Tuple）与枚举（Enum）**
4.  **任意类型、空类型与永不类型（any, void, never）**
5.  **类型断言与类型别名**
6.  **接口（Interface）与类型别名（Type Alias）**
7.  **函数类型**
8.  **联合类型与交叉类型**
9.  **泛型（Generics）**
10. **类与修饰符**

---

### 1. TypeScript 是什么？为什么需要它？

*   **定义**：TypeScript 是由 Microsoft 开发的开源编程语言，它是 JavaScript 的一个**超集**。这意味着任何合法的 JavaScript 代码都是合法的 TypeScript 代码。
*   **核心特性**：它在 JavaScript 的基础上，添加了最重要的**静态类型定义**。
*   **工作原理**：TypeScript 代码需要通过 **TS 编译器（tsc）** 进行编译，去除类型语法并转换成指定目标版本的 JavaScript 代码后，才能在浏览器或 Node.js 环境中运行。

**核心优势（为什么需要它）：**

1.  **类型安全，在开发阶段发现错误**：这是最重要的价值。TS 能在代码**运行之前**（编译时）就检测出类型不匹配等潜在错误，大大减少了运行时 bug。
    ```typescript
    // JavaScript (运行时才报错)
    let num = 123;
    num.split(''); // TypeError: num.split is not a function (只有在浏览器运行时才会发现)

    // TypeScript (编译时即报错)
    let num: number = 123;
    num.split(''); // [TS] Property 'split' does not exist on type 'number'. (在写代码时IDE就提示错误)
    ```
2.  **代码可读性与可维护性更强**：类型注解充当了代码文档，使代码意图更加清晰，便于团队协作和后期维护。
3.  **增强的 IDE 支持（智能提示）**：TypeScript 提供了强大的语言服务，使得 IDE（如 VSCode）能够提供更精准的代码自动完成、接口提示和重构支持。
4.  **提供未来 JavaScript 特性**：允许开发者使用最新的 ES Next 特性，编译器会将其编译成兼容旧环境的代码。

---

### 2. 基础类型（Primitive Types）

TypeScript 包含了 JavaScript 中的所有基本数据类型。

```typescript
let isDone: boolean = false;
let count: number = 42;
let binary: number = 0b1010; // 二进制
let hex: number = 0xf00d;    // 十六进制

let name: string = "TypeScript";
let sentence: string = `Hello, my name is ${name}.`; // 模板字符串

// Null 和 Undefined
let u: undefined = undefined;
let n: null = null;

// Symbol
let sym: symbol = Symbol("key");
```

---

### 3. 数组、元组与枚举

*   **数组**：声明元素类型相同的集合。
    ```typescript
    let list1: number[] = [1, 2, 3];
    let list2: Array<number> = [1, 2, 3]; // 泛型语法
    ```

*   **元组（Tuple）**：表示一个**已知元素数量和类型**的数组，各元素的类型不必相同。
    ```typescript
    let tuple: [string, number];
    tuple = ['hello', 10]; // OK
    tuple = [10, 'hello']; // Error: Type 'number' is not assignable to type 'string'.
    ```

*   **枚举（Enum）**：用于定义一组命名常量。
    ```typescript
    enum Color { Red, Green, Blue } // 默认从0开始编号
    let c: Color = Color.Green; // 1

    enum Direction { Up = 'UP', Down = 'DOWN' } // 字符串枚举
    let d: Direction = Direction.Up; // 'UP'
    ```

---

### 4. 任意类型、空类型与永不类型

*   **`any`**：表示任意类型。**应尽量避免使用**，因为它绕过了类型检查，失去了使用 TS 的意义。通常用于迁移旧项目或处理动态内容。
    ```typescript
    let notSure: any = 4;
    notSure = "maybe a string"; // OK
    notSure = false; // OK
    ```

*   **`void`**：表示没有任何类型。通常用于函数没有返回值时。
    ```typescript
    function warnUser(): void {
      console.log("This is a warning message");
    }
    ```

*   **`never`**：表示那些永远不存在的值的类型。例如，总是抛出异常或根本不会有返回值的函数表达式。
    ```typescript
    function error(message: string): never {
      throw new Error(message);
    }

    function infiniteLoop(): never {
      while (true) {}
    }
    ```

---

### 5. 类型断言与类型别名

*   **类型断言**：告诉编译器“你相信我，我知道这个变量的类型是什么”。它没有运行时影响，只是在编译阶段进行类型检查。
    ```typescript
    // 两种语法（效果相同）
    let someValue: any = "this is a string";
    let strLength1: number = (<string>someValue).length; // 尖括号语法（在JSX中易混淆）
    let strLength2: number = (someValue as string).length; // as 语法（推荐）
    ```

*   **类型别名**：给一个类型起一个新名字。
    ```typescript
    type MyString = string;
    type StringOrNumber = string | number;
    type User = {
      name: string;
      age: number;
    };
    ```

---

### 6. 接口（Interface）与类型别名（Type Alias）

**接口**：主要用于定义**对象的形状（Shape）**。

```typescript
interface Person {
  readonly id: number; // 只读属性
  name: string;
  age?: number;        // 可选属性
}

function greet(person: Person) {
  return "Hello, " + person.name;
}

let john: Person = { id: 1, name: "John" }; // age 是可选的
// john.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

**接口 vs 类型别名**：

*   **相似点**：两者在很多情况下可以互换使用。
*   **区别**：
    *   `interface` 更侧重于描述一个**对象的结构**，支持**声明合并**（同名接口会自动合并）。
    *   `type` 更通用，可以为任何类型（包括基础类型、联合类型、元组等）定义别名。
    *   **最佳实践**：优先使用 `interface` 来描述对象和类的结构，直到需要 `type` 的特定功能（如联合类型、元组）时再使用 `type`。

---

### 7. 函数类型

可以为函数本身定义类型，包括参数类型和返回值类型。

```typescript
// 函数声明
function add(x: number, y: number): number {
  return x + y;
}

// 函数表达式
const myAdd: (x: number, y: number) => number = function(x, y) {
  return x + y;
};

// 使用接口定义函数类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}
const mySearch: SearchFunc = function(src, sub) {
  return src.search(sub) > -1;
};
```

---

### 8. 联合类型与交叉类型

*   **联合类型**：表示取值可以是多种类型中的一种。
    ```typescript
    let padding: string | number;
    padding = "10px"; // OK
    padding = 20;     // OK
    // padding = true; // Error
    ```

*   **交叉类型**：将多个类型合并为一个类型，拥有所有类型的特性。
    ```typescript
    interface BusinessPartner {
      name: string;
      credit: number;
    }
    interface Identity {
      id: number;
      name: string;
    }
    type Employee = Identity & BusinessPartner;
    // Employee 必须有 id, name(来自Identity) 和 credit(来自BusinessPartner)
    let emp: Employee = { id: 1, name: "Alice", credit: 1000 };
    ```

---

### 9. 泛型（Generics）

**泛型是 TypeScript 中最强大的工具之一**，它用于创建可重用的组件，一个组件可以支持多种类型，而不是单一的类型。

*   **在函数中使用**：
    ```typescript
    // 不使用泛型，函数会失去输入和输出的关联
    function identity(arg: any): any {
      return arg;
    }

    // 使用泛型，捕获参数类型并与返回值关联
    function identity<T>(arg: T): T {
      return arg;
    }
    let output1 = identity<string>("myString"); // 类型为 string
    let output2 = identity(42); // 类型推断为 number (类型参数推断)
    ```

*   **在接口中使用**：
    ```typescript
    interface GenericIdentityFn<T> {
      (arg: T): T;
    }
    function identity<T>(arg: T): T {
      return arg;
    }
    let myIdentity: GenericIdentityFn<number> = identity; // 现在 myIdentity 只处理 number 类型
    ```

*   **在类中使用**：
    ```typescript
    class GenericNumber<T> {
      zeroValue: T;
      add: (x: T, y: T) => T;
    }
    let myGenericNumber = new GenericNumber<number>();
    myGenericNumber.zeroValue = 0;
    myGenericNumber.add = (x, y) => x + y;
    ```

---

### 10. 类与修饰符

TypeScript 增强了 ES6 类的功能，主要添加了**访问修饰符**。

```typescript
class Animal {
  private name: string;        // 私有属性，只能在类内部访问
  protected age: number;       // 受保护属性，可以在类和子类中访问
  public readonly breed: string; // 公开只读属性

  constructor(name: string, age: number, breed: string) {
    this.name = name;
    this.age = age;
    this.breed = breed;
  }

  public move(distance: number = 0): void {
    console.log(`${this.name} moved ${distance}m.`);
  }
}

class Dog extends Animal {
  constructor(name: string, age: number, breed: string) {
    super(name, age, breed);
    // console.log(this.name); // Error: Property 'name' is private and only accessible within class 'Animal'.
    console.log(this.age);    // OK, 因为 age 是 protected
  }
}

let spot = new Dog("Spot", 3, "Dalmatian");
spot.move(10);
// spot.breed = "New Breed"; // Error: Cannot assign to 'breed' because it is a read-only property.
```

**参数属性**：一种便捷的写法，可以在构造函数参数中直接声明并初始化成员属性。

```typescript
class Animal {
  // 直接在构造函数参数中使用修饰符，等价于上面的写法
  constructor(private name: string, protected age: number, public readonly breed: string) {}
}
```

---

### 总结

*   **核心**：**静态类型系统**，通过在开发阶段捕获错误来提升代码质量和开发体验。
*   **关键概念**：
    *   **基础类型**、**接口/类型别名**（定义形状）。
    *   **泛型**（创建灵活可复用的组件）。
    *   **类与修饰符**（面向对象编程的增强）。
    *   **联合/交叉类型**（组合类型）。
*   **心智模型**：从“运行时发现问题”转变为“编译时保障安全”。
