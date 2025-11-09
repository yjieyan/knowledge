# commonjs和es6中模块引入的区别
CommonJS 和 ES6 模块在模块引入方面有几个关键区别：

## 1. 语法差异

### CommonJS
```javascript
// 导入
const fs = require('fs');
const { readFile } = require('fs');
const myModule = require('./myModule');

// 导出
module.exports = myFunction;
exports.myFunction = myFunction;
```

### ES6 模块
```javascript
// 导入
import fs from 'fs';
import { readFile } from 'fs';
import * as fs from 'fs';
import myModule from './myModule.js';

// 导出
export default myFunction;
export { myFunction };
export const myConst = 123;
```

## 2. 加载时机

- **CommonJS**：运行时加载，同步执行
- **ES6 模块**：编译时静态分析，异步加载

## 3. 引用特性

### CommonJS
```javascript
// 值的拷贝（对于基本类型）
let count = 1;
module.exports = { count };

// 引入方修改不会影响原模块
const { count } = require('./module');
count = 2; // 不会影响原模块的count
```

### ES6 模块
```javascript
// 值的引用（动态绑定）
export let count = 1;

// 引入方修改会影响原模块
import { count } from './module.js';
count = 2; // 会影响原模块的count
```

## 4. 实际使用示例

### CommonJS 示例
```javascript
// math.js
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

module.exports = {
  add,
  multiply
};

// app.js
const math = require('./math');
console.log(math.add(2, 3)); // 5
```

### ES6 模块示例
```javascript
// math.js
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// app.js
import { add, multiply } from './math.js';
console.log(add(2, 3)); // 5
```

## 5. 主要区别总结

| 特性 | CommonJS | ES6 模块 |
|------|----------|----------|
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 加载时机 | 运行时 | 编译时 |
| 加载方式 | 同步 | 异步 |
| 值类型 | 值的拷贝 | 值的引用 |
| 树摇优化 | 不支持 | 支持 |
| 使用环境 | Node.js | 浏览器/Node.js |

## 6. 在 Node.js 中的使用

在 Node.js 中，可以通过以下方式使用 ES6 模块：

- 文件扩展名为 `.mjs`
- 或在 `package.json` 中设置 `"type": "module"`

```json
// package.json
{
  "type": "module"
}
```

## 7. 互操作性

在 ES6 模块中可以导入 CommonJS 模块：

```javascript
// 在 ES6 模块中导入 CommonJS 模块
import commonJSModule from './commonjs-module.cjs';
```

但 CommonJS 模块不能直接导入 ES6 模块（需要使用动态 import）：

```javascript
// 在 CommonJS 中导入 ES6 模块
async function loadESModule() {
  const esModule = await import('./es-module.mjs');
}
```

这些区别使得 ES6 模块更适合现代前端开发，而 CommonJS 在 Node.js 生态中仍有广泛应用。