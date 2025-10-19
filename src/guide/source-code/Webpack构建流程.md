# Webpack构建流程

---

### 1. 核心概念回顾

在深入流程之前，先快速回顾几个核心概念：

*   **Entry：** 构建的入口，Webpack 从这里开始构建其内部依赖图。
*   **Output：** 告诉 Webpack 在哪里输出它创建的 bundle 文件。
*   **Loader：** 让 Webpack 能够处理那些非 JavaScript 文件（如 `.css`, `.png`, `.ts`）。
*   **Plugin：** 用于执行范围更广的任务，从打包优化和压缩，到重新定义环境变量。

---

### 2. Webpack 构建流程总览

Webpack 的构建流程是一个串行的过程，从启动到结束，会依次执行以下**核心阶段**：

1.  **初始化参数：** 从配置文件和 Shell 语句中读取与合并参数，得出最终的配置对象。
2.  **开始编译：** 用上一步得到的参数初始化 `Compiler` 对象，加载所有配置的插件，执行 `run` 方法开始编译。
3.  **确定入口：** 根据配置中的 `entry` 找到所有的入口文件。
4.  **编译模块：** 从入口文件出发，调用所有配置的 `Loader` 对模块进行翻译，再找出该模块依赖的模块，递归地进行编译处理。
5.  **完成模块编译：** 在经过第 4 步使用 `Loader` 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的**依赖关系图**。
6.  **输出资源：** 根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 `Chunk`，再把每个 `Chunk` 转换成一个单独的文件加入到输出列表。
7.  **输出完成：** 在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

**整个流程可以简化理解为：`初始化` → `编译` → `输出`。**

---

### 3. 深度流程解析

#### 阶段一：初始化阶段

**触发时机：** 在命令行执行 `webpack` 或 `npx webpack` 时。

**具体过程：**
1.  **参数合并：** Webpack 将 `webpack.config.js` 中的配置、命令行传入的参数（如 `--mode=production`）以及默认配置进行合并，生成最终的配置对象。
2.  **创建 Compiler 对象：** 使用最终配置初始化 `Compiler` 对象。`Compiler` 是 Webpack 的**大脑**，它只有一个实例，掌控着整个构建生命周期。
3.  **加载插件：** 调用插件的 `apply` 方法，让插件可以监听后续生命周期中广播出来的所有事件。同时，`Compiler` 对象本身也内置了很多钩子。

```javascript
// 伪代码示意
const webpack = (options, callback) => {
  // 1. 参数合并
  const createOptions = require('./lib/config/createOptions');
  const finalOptions = createOptions(options); // 合并配置

  // 2. 创建 Compiler
  const compiler = createCompiler(finalOptions);

  // 3. 加载插件
  if (finalOptions.plugins && Array.isArray(finalOptions.plugins)) {
    for (const plugin of finalOptions.plugins) {
      if (typeof plugin === 'function') {
        plugin.call(compiler, compiler);
      } else {
        plugin.apply(compiler); // 调用插件的 apply 方法
      }
    }
  }
  return compiler;
};
```

#### 阶段二：编译与构建阶段

这是最复杂、最核心的阶段。

**1. 确定入口与开始编译：**
*   `Compiler` 调用 `run` 方法，触发 `compile` 钩子。
*   根据配置中的 `entry` 找到所有的入口文件。

**2. 编译模块：**
*   对于**每个入口文件**，创建一个 `Compilation` 对象。
*   `Compilation` 对象负责组织整个编译过程，每次构建（包括监听模式下的重新构建）都会创建一个新的 `Compilation`。
*   编译过程如下：
    a. **构建模块：** 调用 `buildModule` 方法。
    b. **使用 Loader：** 从入口文件开始，调用配置的 `Loader` 对模块的**原始内容进行转换**。例如，`css-loader` 将 CSS 文件转换成 JS 模块，`babel-loader` 将 ES6+ 代码转译成 ES5。
    c. **解析 AST：** 使用 `acorn` 库将转换后的 JS 代码解析成**抽象语法树**。
    d. **收集依赖：** 遍历 AST，找到代码中的 `require`, `import` 等依赖声明，递归地找到该模块依赖的模块。
    e. **递归编译：** 对每个依赖模块，重复 a ~ d 步骤，直到所有入口文件依赖的文件都经过了本步骤的处理。

```javascript
// 伪代码示意编译过程
class NormalModule {
  build(options, compilation, resolver, fs, callback) {
    // ...
    // 1. 使用 loader 运行加载器
    this.runLoaders(/* ... */, (err, result) => {
      // result 是经过 loader 处理后的源码
      
      // 2. 将源码解析为 AST
      const source = result[0];
      const ast = acorn.parse(source, { /* ... */ });

      // 3. 遍历 AST，收集依赖
      walkAST(ast, (node) => {
        if (node.type === 'CallExpression' && node.callee.name === 'require') {
          const dep = node.arguments[0].value; // './some-module'
          this.dependencies.push(dep);
        }
      });

      // 4. 异步地递归编译依赖
      asyncLib.each(this.dependencies, (dep, callback) => {
        compilation.addModule(/* ... */, callback);
      }, callback);
    });
  }
}
```

**3. 完成模块编译：**
*   经过递归编译后，得到了每个模块的最终内容、它们之间的依赖关系，以及每个模块经过 Loader 处理后的源码。
*   此时，`Compilation` 的 `seal` 钩子被触发。

#### 阶段三：输出阶段

**1. 生成 Chunk：**
*   根据入口文件和模块间的依赖关系，Webpack 将模块组合成 **Chunk**。
*   **Chunk 的生成规则：**
    *   每个入口文件会生成一个 Chunk。
    *   通过 `SplitChunksPlugin` 进行代码分割，可以生成额外的 Chunk（如 vendor chunk）。
    *   动态 `import()` 的模块也会生成单独的 Chunk。

**2. 生成 Assets：**
*   将 Chunk 转换成最终的文件（称为 Asset）。这个过程会调用 `Template` 系统。
*   `Template` 会根据 Chunk 的类型（如 `JavascriptModulesTemplate`）生成对应的 bundle 代码。
*   在这个阶段，插件有机会最后修改输出的内容（如 `HtmlWebpackPlugin` 生成 HTML 文件，`MiniCssExtractPlugin` 提取 CSS 文件）。

**3. 文件输出：**
*   确定好输出内容后，根据 `output` 的配置，计算得到每个文件的路径和文件名。
*   遍历 `Compilation.assets` 对象，调用 Node.js 的 `fs` 模块，将文件内容写入到磁盘的指定路径。

```javascript
// 伪代码示意输出过程
class Compilation {
  seal(callback) {
    // 1. 生成 Chunk
    this.createChunkAssets();

    // 2. 生成 Assets
    for (const chunk of this.chunks) {
      const template = chunk.hasRuntime() ? mainTemplate : chunkTemplate;
      const source = template.render(chunk);
      const file = chunk.files[0]; // 例如 'main.js'

      this.assets[file] = source;
    }

    // 3. 触发插件钩子，让插件有机会添加额外的 assets
    this.hooks.optimizeAssets.call(this.assets);
    callback();
  }
}

// Compiler 在最终输出时
class Compiler {
  emitAssets(compilation, callback) {
    // 遍历 assets，写入文件系统
    asyncLib.forEachLimit(
      compilation.assets,
      15,
      ({ name, source }, callback) => {
        const targetPath = this.outputFileSystem.join(this.outputPath, name);
        this.outputFileSystem.writeFile(targetPath, source, callback);
      },
      callback
    );
  }
}
```

---

### 4. 优化与进阶理解

**1. 与插件系统的协同：**
整个构建流程中，`Compiler` 和 `Compilation` 对象会广播出大量的事件（钩子）。插件通过监听这些事件，可以在特定的时机插入自己的行为，从而影响构建结果。例如：
*   `emit` 钩子：在输出 asset 到 output 目录之前执行，这是修改最终输出内容的最后机会。
*   `done` 钩子：在编译完成后执行。

**2. 热更新：**
在 `watch` 模式下，文件变化后，Webpack 会重新触发一轮新的 `Compilation`，但会复用之前的 `Compiler` 实例。通过比对哈希值，只重新编译变化的模块，然后通过 HotModuleReplacementPlugin 将更新推送到浏览器。

**3. 构建性能瓶颈：**
*   **递归依赖解析：** 项目越大，依赖越深，耗时越长。
*   **Loader 处理：** 复杂的 Loader（如 babel-loader）是主要性能开销。
*   **插件优化：** 一些复杂的插件分析也会消耗时间。

### 总结

Webpack 的构建流程是一个精密的、事件驱动的管道：

1.  **初始化：** 准备环境和参数，创建 `Compiler`，加载插件。
2.  **编译：** 从 `entry` 开始，递归地使用 `Loader` 处理模块，解析依赖，构建出完整的**依赖图**。这是 `Compilation` 的核心工作。
3.  **输出：** 将依赖图分割成 `Chunk`，使用 `Template` 生成代码，最终写入文件系统。