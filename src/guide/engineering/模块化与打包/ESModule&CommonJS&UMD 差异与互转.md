# ES Module (ESM) 与 CommonJS 与 UMD 差异与互转

---

### 一、 核心差异总览

| 特性 | CommonJS | ES Module (ESM) | UMD |
| :--- | :--- | :--- | :--- |
| **出现时间/背景** | 2009年，**服务器端** (Node.js) | 2015年，**语言标准** (ES6) | 一个**兼容性模式** |
| **加载/运行时机** | **运行时加载** / **同步** | **编译时静态解析** / **异步** | 根据环境判断 |
| **语法 (导出)** | `module.exports = ...` <br> `exports.foo = ...` | `export default ...` <br> `export const foo = ...` | 封装了 CJS 和 AMD 的语法 |
| **语法 (导入)** | `const lib = require('...')` | `import lib from '...'` <br> `import { foo } from '...'` | 同上 |
| **关键价值** | 服务端文件I/O是同步的，简单直接 | 语言层面支持，静态分析，tree-shaking | 兼容浏览器和 Node.js |

---

### 二、 深入解析

#### 1. CommonJS

*   **设计哲学**：为 **Node.js 环境** 设计。在服务器端，模块文件都在本地磁盘，同步加载是合理且高效的。
*   **本质**：`require()` 是一个**函数调用**，模块是在**代码运行时**被加载的。
*   **拷贝导出**：`require()` 得到的是被导出值的 **一份拷贝**。对于基本类型，是值拷贝；对于对象，是对象引用的拷贝。这意味着，导入后模块内部值的变化，通常不会影响已导入的拷贝（除非直接修改导出对象的属性）。

**示例：**
```javascript
// math.js
let count = 0;
function inc() { count++; }
module.exports = { count, inc };

// main.js
const { count, inc } = require('./math.js');
console.log(count); // 0
inc();
console.log(count); // 0 (count 是原始值的拷贝，不会变)
```

#### 2. ES Module (ESM)

*   **设计哲学**：作为 **JavaScript 语言标准** 的一部分，为浏览器和未来而设计。浏览器需要异步下载文件，因此设计为异步。
*   **本质**：`import`/`export` 是 **关键字**，不是函数。它们在代码**静态解析（编译）阶段**就确定模块的依赖关系，与运行时无关。
*   **动态只读引用**：`import` 得到的是被导出值的 **只读的、动态的引用**。这意味着，当导出的模块内部修改了某个变量时，所有导入该变量的地方都会拿到最新的值。

**示例：**
```javascript
// counter.js
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from './counter.js';
console.log(count); // 0
inc();
console.log(count); // 1 (count 是对原始变量的引用，值更新了)
```

#### 3. UMD

*   **设计哲学**：一个 **“通用”** 的模块定义。它不是一种独立的模块系统，而是一段**包装代码**，用于让同一个文件既能运行在 CommonJS 环境（如 Node.js），也能运行在 AMD 环境（如老版本 Require.js），还能作为全局变量被浏览器直接引用。
*   **本质**：一个 **IIFE**，通过判断环境中是否存在 `define` (AMD)、`module` (CJS) 等对象，来决定采用哪种方式导出模块。

**示例 (简化版)：**
```javascript
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else {
    // 浏览器全局变量
    root.myLib = factory();
  }
}(this, function () {
  // 模块的实际逻辑
  return { hello: 'world' };
}));
```

---

### 三、 关键差异：运行时机与 Tree Shaking

**“运行时加载” vs “编译时静态分析”** 是 CJS 和 ESM 最根本的区别，它直接导致了现代前端工具 **Tree Shaking** 的可能性。

*   **CommonJS (动态)**
    ```javascript
    // 条件 require，只有在运行时才能知道是否要加载 lodash
    if (someCondition) {
      const _ = require('lodash');
      // ...
    }
    ```
    由于依赖关系在运行时才能确定，构建工具（如 Webpack）无法在打包时安全地判断哪些模块代码没有被使用，因此**难以进行有效的 Tree Shaking**。

*   **ES Module (静态)**
    ```javascript
    // 静态导入，必须在模块顶层
    import _ from 'lodash';

    // 条件导入，使用动态 import()，返回 Promise
    if (someCondition) {
      const _ = await import('lodash');
    }
    ```
    所有顶层 `import` 语句在编译时就能确定依赖关系。构建工具可以清晰地分析出哪些 `export` 没有被任何 `import`，从而在最终打包产物中**安全地删除这些“死代码”**，这就是 Tree Shaking。

---

### 四、 互转原理与实践

在现代前端开发中，我们经常需要让这两种模块系统互相协作。这主要依靠 **构建工具** 来完成。

#### 1. 转译工具 (Babel)

*   **作用**：在**开发阶段**，将新的语法（如 ESM）转换为旧的语法（如 CJS），以保证在旧版本 Node.js 或浏览器中的兼容性。
*   **原理**：Babel 的 `@babel/preset-env` 或 `@babel/plugin-transform-modules-commonjs` 插件，会将 `import`/`export` 语法转换为等价的 `require()` 和 `module.exports`。

**转换示例：**
```javascript
// 转换前 (ESM)
import React from 'react';
export const Component = () => {};

// 转换后 (CJS)
"use strict";
Object.defineProperty(exports, "__esModule", { value: true }); // 标记为 ESModule
exports.Component = void 0;
var _react = _interopRequireDefault(require("react")); // 处理默认导入
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const Component = () => {};
exports.Component = Component;
```

#### 2. 打包工具 (Webpack, Rollup, Vite)

*   **作用**：在**生产构建阶段**，将各种模块格式（ESM, CJS, UMD, AMD）的代码**统一处理**，最终生成指定格式（通常是 ESM 或 CJS）的 bundle。
*   **原理**：打包工具内部实现了一套模块系统。它首先会将所有模块（无论什么格式）解析成一个抽象的 **模块依赖图**，然后再根据配置，将这张图打包成一个或多个遵循特定规范的 bundle 文件。

**Webpack 的模块包装：**
Webpack 将每个模块用一个函数包装起来，并自己实现了 `require` 和 `module` 对象，从而在浏览器环境中模拟出 Node.js 的模块环境。

```javascript
// Webpack 生成的 bundle (简化版)
(function(modules) { // webpackBootstrap
  // 模块缓存
  var installedModules = {};
  // 自己实现的 require 函数
  function __webpack_require__(moduleId) {
    // ... 检查缓存、加载模块等逻辑
  }
  // 入口起点
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})({
  "./src/index.js": (function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    eval(`...被转换后的代码...`);
  }),
  "react": (function(module, exports) {
    eval(`...React 的 CJS 代码...`);
  })
});
```

### 总结与最佳实践

1.  **历史演进**：**CJS (服务端) -> ESM (语言标准) -> 构建工具实现互转**。
2.  **根本区别**：**CJS 是动态运行时加载，ESM 是静态编译时分析**。这决定了 ESM 支持 Tree Shaking，而 CJS 支持条件加载。
3.  **现代开发流**：
    *   **编写代码**：使用 **ESM** 语法，以获得最佳的静态分析和 Tree Shaking 能力。
    *   **开发调试**：使用 Babel 将 ESM 转译为 CJS，以兼容旧环境。
    *   **生产构建**：使用 Webpack/Rollup/Vite 打包，它们能处理所有模块格式，并最终输出优化的 ESM 或 CJS bundle。

**对于新项目，应毫无保留地使用 ES Modules。** 它是未来的标准，能带来最好的性能和优化潜力。CommonJS 主要用于 Node.js 生态的库，而 UMD 正在逐渐退出历史舞台。