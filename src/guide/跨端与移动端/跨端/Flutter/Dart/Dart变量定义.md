# Dart变量定义

### 核心概念：`var`, `final`, `const`, 和明确类型

在 Dart 中，有几种主要方式来定义变量。

---

### 1. 使用 `var` 关键字

`var` 是一个“我喜欢偷懒，但类型安全不能丢”的关键字。Dart 会自动推断出变量的类型，并且**一旦推断，类型就固定了**。

```dart
var name = 'Bob'; // Dart 推断出 name 的类型是 String
print(name); // 输出: Bob

name = 'Alice'; // 正确：可以赋值为新的 String
// name = 123; // 错误！不能将 int 赋给 String 类型的变量
```

**前端对比**：这类似于 JavaScript 的 `let` 或 `var`，但关键区别在于 **Dart 是类型安全的**。在 JS 中，`let x = 'hello'; x = 100;` 是合法的，但在 Dart 中不行。

---

### 2. 使用明确类型

你也可以直接声明变量的类型，这会让代码更清晰，尤其对于阅读你代码的人来说。

```dart
String name = 'Bob';
int age = 25;
double height = 1.75;
bool isStudent = true;
List<String> hobbies = ['reading', 'gaming']; // 数组/列表
Map<String, dynamic> person = { // 对象/字典
  'name': 'Bob',
  'age': 25
};
```

**前端对比**：这类似于 TypeScript 的类型注解。如果你熟悉 TS，这种感觉会非常亲切。

---

### 3. 使用 `final` 关键字

`final` 用于声明一个**只能被赋值一次的变量**。它在运行时被初始化。

*   **运行时常量**：值在代码运行时才能确定。
*   **实例变量**：类的成员变量经常被声明为 `final`。

```dart
final String nickname = getNickname(); // 函数返回值在运行时才能确定

// nickname = 'New Name'; // 错误！final 变量不能被再次赋值
```

**前端对比**：这类似于 JavaScript 的 `const`（在行为上）。一旦赋值，就不能改变。

---

### 4. 使用 `const` 关键字

`const` 用于声明一个**编译时常量**。它的值必须在代码编译时就已经确定，不能是运行时才能计算出来的值。

*   **编译时常量**：值在代码编译时就必须明确。
*   **性能更好**：编译器会直接将其值嵌入到使用的地方。

```dart
const String apiKey = 'ABC123'; // 编译时就知道它的值
const double pi = 3.14159;
const int maxRetries = 3;

// const String time = DateTime.now().toString(); // 错误！DateTime.now() 是运行时的值
```

**`const` 的高级用法：创建常量值**
你还可以用 `const` 来创建常量值，比如集合。

```dart
// 这是一个常量列表，其内容在编译后也完全不可变
const List<String> frozenList = ['a', 'b', 'c'];

// 普通的 final 列表，列表本身引用不能变，但内容可以修改
final List<String> normalList = ['a', 'b', 'c'];
// normalList = ['x', 'y']; // 错误！final 修饰的变量不能重新赋值
// normalList.add('d');     // 正确！列表的内容可以被修改

// frozenList.add('d');    // 错误！const 列表是完全冻结的，内容也不能修改
```

---

### 总结与对比

| 关键字 | 含义 | 是否可变 | 初始化时机 | 前端类比 |
| :--- | :--- | :--- | :--- | :--- |
| **`var`** | 类型推断 | 值可变，类型不可变 | 运行时 | `let` (但带类型推断) |
| **`Type`** | 明确类型 | 值可变，类型不可变 | 运行时 | TypeScript 类型注解 |
| **`final`** | 运行时常量 | **变量引用不可变** | 运行时 | `const` (在 JS 中) |
| **`const`** | 编译时常量 | **变量和值都完全不可变** | 编译时 | 无直接对应，是更严格的常量 |

### 给前端开发者的实践建议

1.  **优先使用 `final`**：如果一个变量你不打算重新赋值，就用 `final`。这可以使你的代码更健壮、更易于推理。这是 Dart 社区推荐的实践。
2.  **需要变量变化时用 `var` 或明确类型**：当你确实需要改变一个变量的值时使用。
3.  **在需要编译时常量时使用 `const`**：比如定义全局配置、魔法数字等。在创建集合（List, Map）时，如果它们的内容是固定的，也尽量使用 `const` 来提升性能。
4.  **对于公开的 API（如类和库）使用明确类型**：这能让你的代码使用者更清楚地了解你的意图。

### 一个有趣的例子：`const` 上下文

Dart 很智能，在某些上下文中（比如构建 Flutter UI 时），它允许你使用 `const` 来触发“常量传播”。

```dart
// 在 Flutter 的 build 方法中很常见
Widget build(BuildContext context) {
  return const Column(
    children: [
      Text('Hello'), // 这里的 Text 和 Column 都会被编译为常量
      Text('World'),
    ],
  );
}
```
