# 自主编写一个 Babel 插件

**编写一个自动为所有函数添加一个包含函数名的 `console.log` 的插件**。

例如，输入代码：
```javascript
function foo() {
  console.log('hello');
}

const bar = () => {
  console.log('world');
};
```

经过插件处理后，输出代码：
```javascript
function foo() {
  console.log('function_entered:', 'foo'); // 自动插入的
  console.log('hello');
}

const bar = () => {
  console.log('function_entered:', 'bar'); // 自动插入的
  console.log('world');
};
```

---

### 第一步：理解 Babel 的工作原理

Babel 是一个 **JavaScript 编译器**，它的工作流程主要分为三个阶段：

1.  **解析 (Parse)**：将源代码字符串转换成一个**抽象语法树 (Abstract Syntax Tree, AST)**。AST 是一种用 JavaScript 对象表示的树状结构，它能完整地描述代码的语法。
2.  **转换 (Transform)**：遍历 AST，并调用插件中定义的对应方法对节点进行**增、删、改**。这是我们编写插件的主要舞台。
3.  **生成 (Generate)**：将转换后的 AST 重新生成为代码字符串，同时生成 source map。

**因此，编写 Babel 插件的核心就是：识别出感兴趣的 AST 节点，然后修改它们。**

---

### 第二步：搭建开发环境和分析 AST

#### 1. 环境搭建
首先，我们需要安装 Babel 的核心包。
```bash
npm install --save-dev @babel/core @babel/types
```

#### 2. 分析 AST
在编写插件之前，我们必须知道源代码和对应的 AST 结构是什么样子的。这里有两个强大的在线工具：
- **[AST Explorer](https://astexplorer.net/)**
- **[Babel Parser REPL](https://babeljs.io/repl)**

我们在 AST Explorer 中输入我们的目标函数：
```javascript
function foo() {
  console.log('hello');
}
```

我们可以看到，一个 `FunctionDeclaration` 节点主要包含以下关键属性：
- `id`: 标识符，代表函数名 `foo`。
- `body`: 函数体，是一个 `BlockStatement`（块级语句）。
- `params`: 参数列表。

而 `BlockStatement` 本身有一个 `body` 属性，它是一个数组，包含了函数体内所有的语句。

**我们的目标就是：找到 `FunctionDeclaration` 和 `ArrowFunctionExpression` 节点，然后向它们 body 的开头插入一个新的语句节点。**

---

### 第三步：编写插件代码结构

一个 Babel 插件就是一个函数，它返回一个对象。这个对象有一个 `visitor` 属性。

`visitor` 是一个对象，它定义了我们要访问的 AST 节点类型以及当遇到这些节点时要执行的方法。

```javascript
// my-babel-plugin.js
module.exports = function myBabelPlugin() {
  return {
    visitor: {
      // 这里定义我们要处理的节点类型
      FunctionDeclaration(path) {
        // 处理函数声明
      },
      ArrowFunctionExpression(path) {
        // 处理箭头函数
      }
    }
  };
};
```

---

### 第四步：深入实现插件逻辑

我们需要在 `visitor` 的方法里完成两件事：
1.  构造要插入的 `console.log` 语句的 AST 节点。
2.  将这个节点插入到函数体的开头。

#### 1. 构造 AST 节点

我们想要构造的节点是：
```javascript
console.log('function_entered:', 'foo');
```

在 AST Explorer 中分析这句代码，它对应一个 `ExpressionStatement`，其 `expression` 是一个 `CallExpression`。

- `CallExpression` 的 `callee` 是一个 `MemberExpression`：`console.log`。
- `CallExpression` 的 `arguments` 是一个数组，包含两个 `StringLiteral` 节点。

我们可以使用 `@babel/types` 包来手动构建这个复杂的节点，但更简单的方法是使用 Babel 提供的 **模板方法**。

```javascript
const { template } = require('@babel/core');

module.exports = function myBabelPlugin() {
  // 使用 template 来构建一个 AST 节点
  // `console.log('function_entered:', NAME);` 的模板
  const buildConsoleLog = template(`
    console.log('function_entered:', NAME);
  `);

  return {
    visitor: {
      FunctionDeclaration(path) {
        // 获取函数名
        const functionName = path.node.id.name;
        
        // 使用模板和函数名来生成一个具体的 AST 节点
        const consoleNode = buildConsoleLog({
          NAME: functionName // 将模板中的 NAME 替换为实际的函数名字符串
        });

        // 将生成的节点插入到函数体的 body 数组的开头
        path.node.body.body.unshift(consoleNode);
      },
      ArrowFunctionExpression(path) {
        // 处理箭头函数
        // 注意：箭头函数可能没有函数名，例如 `const bar = () => {}`
        // 我们需要从它的父级节点寻找名字
        
        // 检查父节点是不是一个 VariableDeclarator，并且有 id
        if (path.parent.type === 'VariableDeclarator' && path.parent.id.type === 'Identifier') {
          const functionName = path.parent.id.name;
          const consoleNode = buildConsoleLog({
            NAME: functionName
          });

          // 确保箭头函数体是 BlockStatement（有花括号），而不是直接返回一个表达式
          if (path.node.body.type === 'BlockStatement') {
            path.node.body.body.unshift(consoleNode);
          } else {
            // 如果不是 BlockStatement，我们需要将其转换为 BlockStatement
            // 这超出了简单示例的范围，但思路是创建一个新的 BlockStatement
            // 包含插入的语句和原来的返回语句
          }
        }
      }
    }
  };
};
```

---

### 第五步：测试插件

我们可以编写一个简单的 Node.js 脚本来测试我们的插件。

```javascript
// test.js
const babel = require('@babel/core');
const myPlugin = require('./my-babel-plugin');

const sourceCode = `
function foo() {
  console.log('hello');
}

const bar = () => {
  console.log('world');
};
`;

const { code } = babel.transformSync(sourceCode, {
  plugins: [myPlugin]
});

console.log(code);
```

运行 `node test.js`，你将会看到输出结果中，每个函数的开头都插入了我们期望的 `console.log` 语句。

---

### 第六步：优化与深入思考

上面的基础版本还有很多可以完善的地方：

1.  **处理匿名函数**：如果函数是匿名的，我们应该如何处理？也许可以记录 `'(anonymous)'` 或者使用其他启发式方法获取名字。
2.  **处理非块级箭头的函数体**：如上文代码注释所示，对于 `const bar = () => console.log('world');` 这种形式的箭头函数，我们需要更复杂的逻辑来转换其函数体。
3.  **避免重复插入**：确保插件在多次遍历时不会重复插入日志。
4.  **使用 `path` 提供的工具方法**：Babel 传递给 `visitor` 方法的 `path` 参数是一个强大的对象，它提供了许多工具方法，例如 `path.insertBefore(nodes)`、`path.replaceWith(node)` 等，比直接操作 `node.body.body.unshift` 更安全、更强大。
5.  **状态管理**：插件可以访问 Babel 的 `state` 对象，用于在多次访问之间传递信息或获取插件配置选项。

**一个更健壮的 `ArrowFunctionExpression` 处理逻辑可能如下：**

```javascript
ArrowFunctionExpression(path) {
  let functionName = '(anonymous)';

  // 尝试从父级变量声明获取名字
  if (path.parent.type === 'VariableDeclarator' && path.parent.id.type === 'Identifier') {
    functionName = path.parent.id.name;
  }
  // 还可以尝试其他情况，比如作为对象的属性等

  const consoleNode = buildConsoleLog({
    NAME: functionName
  });

  // 如果函数体不是 BlockStatement，则将其转换为 BlockStatement
  if (path.node.body.type !== 'BlockStatement') {
    // 将原来的表达式体转换为一个返回语句
    const returnStatement = types.returnStatement(path.node.body);
    // 创建一个新的块级语句，包含我们插入的日志和原来的返回语句
    const newBody = types.blockStatement([consoleNode, returnStatement]);
    path.get('body').replaceWith(newBody);
  } else {
    // 如果是 BlockStatement，直接插入
    path.node.body.body.unshift(consoleNode);
  }
}
```

---

### 总结

1.  **明确目标**：确定你要对代码做什么转换。
2.  **AST 分析**：使用 AST Explorer 等工具，理解源代码和目标代码对应的 AST 结构差异。
3.  **搭建骨架**：在插件的 `visitor` 对象中声明要处理的节点类型。
4.  **节点操作**：在 `visitor` 的方法中，使用 `@babel/types` 或 `template` 构建新节点，并使用 `path` API 操作 AST（插入、替换、删除）。
5.  **测试与优化**：编写测试用例，处理边界情况，使插件更加健壮。
