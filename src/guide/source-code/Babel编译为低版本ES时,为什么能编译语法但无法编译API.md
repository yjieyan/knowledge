# Babel编译为低版本ES时，为什么能编译语法但无法编译API？
---
## 原理

Babel 的主要功能是将现代 JavaScript 语法转换为低版本的语法，以确保代码在旧版浏览器中能够运行。编译语法的能力主要来源于 Babel 的插件系统，而对于 API（如 Promise、Map 等），它们通常是由 JavaScript 引擎提供的原生功能，Babel 并不负责这些功能的实现。

1） 编译语法：Babel 可以解析和转换新语法（如箭头函数、类等），将其转为旧版语法（如普通函数和构造函数），以确保语法兼容性。

2） 无法编译 API：对于 JavaScript 内置的 API，Babel 只负责语法的转换，不会将缺失的 API 自动 polyfill。对于这些 API，开发者需要手动引入 polyfill（如 core-js）以支持旧浏览器。

### 1） Babel 插件

Babel 使用插件来处理不同的语法特性，例如：

* `@babel/plugin-transform-arrow-functions`：转换箭头函数。
* `@babel/plugin-transform-classes`：转换类语法。

这些插件负责将新语法转换为兼容的旧语法。

### 2） Polyfill 机制

为了支持缺失的 API，可以使用 polyfill 解决方案。例如：

* core-js：一个广泛使用的 polyfill 库，可以为新特性提供支持。
* regenerator-runtime：用于支持生成器和 async/await。

### 3） 配置 Babel

可以在 Babel 配置文件中使用 `@babel/preset-env` 结合 polyfill 的方式，确保 API 的支持：

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry",
        "corejs": 3,
        "targets": {
          "browsers": "> 0.25%, not dead"
        }
      }
    ]
  ]
}
```

### 4） 运行时处理

在使用 Babel 的同时，还需要注意目标浏览器的兼容性，合理引入 polyfill，以确保在不同环境中都能顺利运行。

总结: Babel 专注于语法转换，无法自动处理缺失的 API，因此需要通过 polyfill 手动引入以实现完整的功能兼容性。
