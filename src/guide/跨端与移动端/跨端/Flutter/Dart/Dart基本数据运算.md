# Dart基本数据运算

## 1. 算术运算符

这些用于基本的数学计算：

```dart
void main() {
  int a = 10;
  int b = 3;
  double c = 5.0;
  
  print(a + b);  // 13 - 加法
  print(a - b);  // 7  - 减法
  print(a * b);  // 30 - 乘法
  print(a / b);  // 3.333... - 除法（返回 double）
  print(a ~/ b); // 3  - 整除（返回 int）
  print(a % b);  // 1  - 取余
  
  // 自增自减
  var x = 5;
  print(x++); // 5 - 先使用，后自增
  print(x);   // 6
  
  var y = 5;
  print(++y); // 6 - 先自增，后使用
  print(y);   // 6
}
```

**前端注意**：
- `~/` 是 Dart 特有的整除运算符，返回整数结果
- Dart 是强类型，`10 / 3` 返回 `double` 而不是像 JS 返回 `number`

## 2. 关系运算符

用于比较值，返回 `bool` 类型：

```dart
void main() {
  int a = 10;
  int b = 5;
  String name1 = 'Alice';
  String name2 = 'Bob';
  
  print(a == b); // false - 等于
  print(a != b); // true  - 不等于
  print(a > b);  // true  - 大于
  print(a < b);  // false - 小于
  print(a >= b); // true  - 大于等于
  print(a <= b); // false - 小于等于
  
  // 字符串比较
  print(name1 == name2); // false
  print('hello' == 'hello'); // true
}
```

## 3. 类型测试运算符

Dart 有强大的类型检查系统：

```dart
void main() {
  var value = 'Hello';
  
  print(value is String);    // true - 类型检查
  print(value is! int);     // true - 非类型检查
  print(value as String);   // Hello - 类型转换
  
  // as 运算符在不确定类型时很有用
  dynamic something = 'This is a string';
  String definitelyString = something as String; // 明确转换为 String
  
  // 如果转换失败会抛出异常
  // int notAnInt = something as int; // 运行时错误！
}
```

## 4. 赋值运算符

除了基本的 `=`，Dart 还有便捷的复合赋值运算符：

```dart
void main() {
  int a = 10;
  
  // 基本赋值
  a = 20;
  
  // 复合赋值
  a += 5;  // a = a + 5 → 25
  a -= 3;  // a = a - 3 → 22
  a *= 2;  // a = a * 2 → 44
  a ~/= 4; // a = a ~/ 4 → 11
  a %= 3;  // a = a % 3 → 2
  
  print(a); // 2
  
  // ??= 运算符（Dart 特有）
  String? name;
  name ??= 'Unknown'; // 如果 name 为 null，则赋值
  print(name); // Unknown
  
  name ??= 'Another Name'; // 因为 name 不为 null，这行不会执行
  print(name); // 仍然是 Unknown
}
```

## 5. 逻辑运算符

用于布尔逻辑运算：

```dart
void main() {
  bool isLoggedIn = true;
  bool hasPermission = false;
  int age = 25;
  
  // 与操作
  print(isLoggedIn && hasPermission); // false
  
  // 或操作  
  print(isLoggedIn || hasPermission); // true
  
  // 非操作
  print(!isLoggedIn); // false
  
  // 组合使用
  bool canAccess = isLoggedIn && (age >= 18 || hasPermission);
  print(canAccess); // true
}
```

## 6. 条件表达式

Dart 提供了简洁的条件表达式：

```dart
void main() {
  int score = 85;
  String? userName;
  
  // 三目运算符
  String result = score >= 60 ? '及格' : '不及格';
  print(result); // 及格
  
  // ?? 运算符 - 如果左侧为 null，则使用右侧的值
  String displayName = userName ?? '游客';
  print(displayName); // 游客
  
  // 级联的 ?? 运算符
  String? firstName;
  String? lastName;
  String fullName = firstName ?? lastName ?? '无名氏';
  print(fullName); // 无名氏
}
```

## 7. 位运算符

用于整数的二进制位操作：

```dart
void main() {
  int a = 5;  // 二进制: 101
  int b = 3;  // 二进制: 011
  
  print(a & b);   // 1  - 与: 101 & 011 = 001
  print(a | b);   // 7  - 或: 101 | 011 = 111
  print(a ^ b);   // 6  - 异或: 101 ^ 011 = 110
  print(~a);      // -6 - 取反（包括符号位）
  print(a << 1);  // 10 - 左移: 101 << 1 = 1010
  print(a >> 1);  // 2  - 右移: 101 >> 1 = 10
}
```

## 8. 级联运算符 (..)

这是 Dart 的一个特色功能，允许你在同一个对象上连续执行多个操作：

```dart
class Person {
  String name = '';
  int age = 0;
  
  void introduce() {
    print('我叫$name，今年$age岁');
  }
}

void main() {
  // 传统方式
  var person1 = Person();
  person1.name = 'Alice';
  person1.age = 25;
  person1.introduce();
  
  // 使用级联运算符 - 更简洁！
  var person2 = Person()
    ..name = 'Bob'
    ..age = 30
    ..introduce();
    
  // 前端对比：这类似于 jQuery 的链式调用
  // $('div').addClass('active').show().animate(...);
}
```

## 9. 安全调用运算符 (?.)

处理可能为 null 的对象时的安全方式：

```dart
void main() {
  String? name;
  
  // 传统方式 - 需要 null 检查
  if (name != null) {
    print(name.length);
  }
  
  // 安全调用 - 如果 name 为 null，返回 null
  print(name?.length); // null
  
  // 组合使用
  print(name?.toUpperCase() ?? '默认值'); // 默认值
  
  // 实际例子
  List<String>? items;
  print(items?.length); // null
  print(items?.first);  // null
}
```

## 实践建议

1. **多用 `??` 和 `??=`** 来处理可能的 null 值
2. **掌握级联运算符**，在构建复杂对象时非常有用
3. **注意类型安全**，Dart 会在编译时捕获很多类型错误
4. **善用 `is` 和 `as`** 来进行安全的类型检查和转换

