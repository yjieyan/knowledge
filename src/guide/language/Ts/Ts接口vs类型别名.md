# Ts接口vs类型别名

`interface` 和 `type`（类型别名）是 TypeScript 中定义复杂类型的两种核心方式，它们非常相似，但在某些场景下有微妙的区别和不同的最佳实践。

1.  **基本概念与语法**
2.  **共同点（它们能一起做什么）**
3.  **核心区别（它们在哪里分道扬镳）**
4.  **最佳实践与选用时机**
5.  **总结表格**

---

### 1. 基本概念与语法

#### **接口（Interface）**

接口的核心思想是**声明一个对象的形状（Shape）** 或一个类的契约（Contract）。它侧重于描述一个对象**应该有什么**属性和方法。

```typescript
// 使用 interface 关键字
interface Point {
  x: number;
  y: number;
}

interface User {
  id: number;
  name: string;
  greet(message: string): void;
}
```

#### **类型别名（Type Alias）**

类型别名的核心思想是**为一个类型创建一个新的名字**。它更像是一种赋值操作，可以为任何类型（包括原始类型、联合类型、元组等）创建一个别名。

```typescript
// 使用 type 关键字
type Point = {
  x: number;
  y: number;
};

type ID = number | string; // 联合类型
type Coordinates = [number, number]; // 元组类型
type Callback = (data: string) => void; // 函数类型
```

从最基本的对象形状描述上看，它们的功能几乎是等价的。

---

### 2. 共同点（它们能一起做什么）

在大多数情况下，`interface` 和 `type` 可以互换使用，编译器也不会区分它们。

*   **描述对象类型**：这是它们最重叠的功能。
    ```typescript
    interface Person { name: string; }
    type PersonType = { name: string; };

    const alice: Person = { name: 'Alice' };
    const bob: PersonType = { name: 'Bob' }; // 效果完全相同
    ```
*   **扩展（Inheritance）**：两者都可以相互扩展。
    *   **接口扩展接口**：
        ```typescript
        interface Animal {
          name: string;
        }
        interface Bear extends Animal {
          honey: boolean;
        }
        ```
    *   **类型别名扩展类型别名**（使用交叉类型 `&`）：
        ```typescript
        type Animal = {
          name: string;
        }
        type Bear = Animal & {
          honey: boolean;
        }
        ```
    *   **接口扩展类型别名**：
        ```typescript
        type Animal = {
          name: string;
        }
        interface Bear extends Animal {
          honey: boolean;
        }
        ```
    *   **类型别名扩展接口**：
        ```typescript
        interface Animal {
          name: string;
        }
        type Bear = Animal & {
          honey: boolean;
        }
        ```

---

### 3. 核心区别（它们在哪里分道扬镳）

#### **区别一：声明合并（Declaration Merging）**

这是 `interface` 最独特的行为。

*   **接口**：支持声明合并。**同一个接口名的多个声明会被自动合并**。
    ```typescript
    interface Window {
      title: string;
    }
    interface Window {
      ts: TypeScriptAPI;
    }
    // 最终 Window 接口同时拥有 title 和 ts 属性
    const src = 'const a = "Hello World"';
    window.ts.transpileModule(src, {}); // 假设 ts 是存在的
    ```
    *   **应用场景**：这在为全局对象（如 `Window`）、内置接口或第三方库的类型定义进行扩展时非常有用。

*   **类型别名**：**不支持声明合并**。一个类型别名在同一作用域内只能被声明一次。
    ```typescript
    type Window = { // Error: Duplicate identifier 'Window'.
      title: string;
    }
    type Window = { // Error: Duplicate identifier 'Window'.
      ts: TypeScriptAPI;
    }
    ```

#### **区别二：扩展方式与错误提示**

虽然两者都能扩展，但在处理冲突时，错误提示的时机和方式不同。

*   **接口（`extends`）**：在**声明时**就会检查冲突。如果扩展的接口有属性冲突，会直接报错。
    ```typescript
    interface A {
      foo: number;
    }
    interface B extends A {
      foo: string; // Error: Interface 'B' incorrectly extends interface 'A'. Types of property 'foo' are incompatible.
    }
    ```

*   **类型别名（`&`）**：使用交叉类型，冲突不会在声明时被立即发现，而是在**使用时**才报错。这有时会产生更难以理解的错误信息。
    ```typescript
    type A = { foo: number };
    type B = A & { foo: string }; // 声明时不会报错！

    const obj: B = { foo: 42 }; // Error: Type 'number' is not assignable to type 'never'.
    // 因为 `foo` 变成了 `number & string`，也就是 `never` 类型。
    ```

#### **区别三：描述能力的范围**

*   **类型别名**的能力更广。它可以描述**任何类型**，而不仅仅是对象形状。
    *   **原始类型**：`type Name = string;`
    *   **联合类型**：`type Result = Success | Failure;` (这是 `type` 最常用的场景之一)
    *   **元组类型**：`type Data = [number, string];`
    *   **映射类型**：`type Readonly<T> = { readonly [P in keyof T]: T[P] };`
    *   **条件类型**：`type IsString<T> = T extends string ? true : false;`

*   **接口**：基本上只能用于描述**对象/函数/类的结构**。你不能用 `interface` 去定义一个联合类型或元组。

```typescript
// 这些是 type 的专属领域，interface 无法实现
type ID = string | number;
type Pair = [string, number];
type Tree<T> = {
  value: T;
  left?: Tree<T>;
  right?: Tree<T>;
};
```

#### **区别四：性能与显示**

*   **错误信息**：在早期版本中，使用 `interface` 在错误信息中会显示更清晰的原始名称（如 `InterfaceName`），而 `type` 可能会被展开显示。现在这个区别已经很小。
*   **性能**：对于大型代码库，有观点认为 `interface` 的声明合并特性可能让编译器更容易进行缓存和增量检查，但这通常不是决定性的因素。

---

### 4. 最佳实践与选用时机

在 TypeScript 官方文档和社区中，逐渐形成了一些共识：

1.  **优先使用 `interface`**，直到你需要 `type` 的特定功能。
    *   **理由**：`interface` 的声明合并行为更符合面向对象的设计思想，并且其扩展错误更早、更清晰。它的语义更偏向于“定义一个契约”。

2.  **在需要定义联合类型、元组或映射类型时，使用 `type`**。
    *   **理由**：这是 `interface` 无法做到的。

3.  **当你想要使用交叉类型来组合类型时，可以考虑 `type`**。虽然 `interface extends` 也能实现类似功能，但交叉类型在处理非对象类型时是唯一选择。

4.  **如果你正在为一个库编写类型定义（`d.ts` 文件），请使用 `interface`**，以便库的使用者能够通过声明合并来扩展它们。

5.  **对于对象类型的扩展，如果两者都能实现，团队内部应保持风格一致**。

---

### 总结表格

| 特性 | 接口（`interface`） | 类型别名（`type`） |
| :--- | :--- | :--- |
| **语法** | `interface Foo { ... }` | `type Foo = ...` |
| **核心思想** | 声明对象的形状、契约 | 为任意类型创建别名 |
| **声明合并** | **支持** | 不支持 |
| **扩展方式** | `extends` (声明时检查错误) | `&` (交叉类型，使用时可能报错) |
| **描述范围** | 对象、函数、类 | **任何类型**（对象、联合、元组、原始值等） |
| **联合类型** | 无法直接定义 | `type = A | B` (**核心优势**) |
| **元组类型** | 无法直接定义 | `type = [A, B]` (**核心优势**) |
| **映射/条件类型**| 不适用 | 支持 |
| **官方推荐** | 在定义对象结构时**优先使用** | 在需要联合类型等高级特性时使用 |

**结论**：

`interface` 和 `type` 在描述对象时是“孪生兄弟”，但在更广阔的类型世界里，`type` 是“瑞士军刀”，功能更多样。选择哪一个，取决于具体场景和团队的约定。