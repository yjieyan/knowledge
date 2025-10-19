# webpack的Tapable
Tapable 是 Webpack 的**核心底层库**，它提供了强大的**事件发布-订阅**机制，是整个 Webpack 插件系统的基石。可以说，不理解 Tapable，就很难真正理解 Webpack 的运行机制。

---

### 1. 核心概念：什么是 Tapable？

Tapable 是一个类似于 Node.js 的 `EventEmitter` 的库，但更加强大和专用于控制钩子的执行逻辑。

*   **核心思想：** 它定义了一系列的 **“钩子”**，插件可以向这些钩子“注册”事件。在构建流程的特定时间点，Webpack 会“触发”这些钩子，从而执行所有插件注册的逻辑。
*   **与 EventEmitter 的区别：**
    *   `EventEmitter` 是“一个事件，多个监听器”，执行顺序固定，逻辑简单。
    *   `Tapable` 的钩子可以控制监听器的**执行顺序、如何执行、何时停止**等，提供了复杂的流程控制能力。

---

### 2. Tapable 的核心：Hook 类型

Tapable 提供了多种类型的 Hook（钩子），它们决定了注册的事件函数如何被执行。这是 Tapable 最精妙的部分。

#### 按执行机制分类：

**a) 基本类型**
*   `SyncHook`：**同步串行钩子**。监听器按注册顺序**同步地、依次执行**。
*   `SyncBailHook`：**同步熔断钩子**。监听器按顺序同步执行。如果某个监听器返回了 **非 `undefined`** 的值，则剩余的监听器不再执行。
*   `SyncWaterfallHook`：**同步瀑布流钩子**。监听器按顺序同步执行，且**上一个监听器的返回值会作为下一个监听器的输入**。
*   `SyncLoopHook`：**同步循环钩子**。监听器同步执行，如果某个监听器返回了 **非 `undefined`** 的值，则这个监听器会**一直重复执行**，直到返回 `undefined` 后才继续执行下一个。

**b) 异步类型**
*   `AsyncParallelHook`：**异步并行钩子**。监听器并行执行（所有异步操作同时开始），所有监听器都执行完后再执行最终回调。
*   `AsyncParallelBailHook`：**异步并行熔断钩子**。监听器并行执行，如果任何一个监听器回调传递了 **非 `undefined`** 的值，会立即调用最终回调，并忽略其他监听器的结果。
*   `AsyncSeriesHook`：**异步串行钩子**。监听器按注册顺序**异步串行执行**（一个完成后，再开始下一个）。
*   `AsyncSeriesBailHook`：**异步串行熔断钩子**。
*   `AsyncSeriesWaterfallHook`：**异步瀑布流钩子**。

---

### 3. 如何使用 Tapable？

#### 示例 1: `SyncHook`（同步串行）

```javascript
const { SyncHook } = require('tapable');

// 1. 创建一个 SyncHook 实例。参数数组定义了调用时传入的参数列表。
const hook = new SyncHook(['arg1', 'arg2']);

// 2. 注册（订阅/监听）事件。使用 `tap` 方法。
hook.tap('Plugin1', (arg1, arg2) => {
  console.log('Plugin1', arg1, arg2); // 输出: Plugin1 Hello World
});

hook.tap('Plugin2', (arg1, arg2) => {
  console.log('Plugin2', arg1, arg2); // 输出: Plugin2 Hello World
});

// 3. 触发（发布/调用）钩子。使用 `call` 方法。
hook.call('Hello', 'World');
// 执行结果：
// Plugin1 Hello World
// Plugin2 Hello World
// (同步顺序执行)
```

#### 示例 2: `SyncBailHook`（同步熔断）

```javascript
const { SyncBailHook } = require('tapable');

const hook = new SyncBailHook(['arg1']);

hook.tap('Plugin1', (arg1) => {
  console.log('Plugin1', arg1);
  // 返回 undefined，继续执行下一个
});

hook.tap('Plugin2', (arg1) => {
  console.log('Plugin2', arg1);
  return 'Bail!'; // 返回非 undefined 值，后续 Plugin3 不再执行
});

hook.tap('Plugin3', (arg1) => {
  console.log('Plugin3', arg1); // 这行不会执行
});

hook.call('Hello');
// 执行结果：
// Plugin1 Hello
// Plugin2 Hello
// (因为 Plugin2 返回了 'Bail!'，Plugin3 被熔断)
```

#### 示例 3: `SyncWaterfallHook`（同步瀑布流）

```javascript
const { SyncWaterfallHook } = require('tapable');

const hook = new SyncWaterfallHook(['arg1']);

hook.tap('Plugin1', (arg1) => {
  console.log('Plugin1', arg1); // 输出: Plugin1 Hello
  return arg1 + ' World'; // 返回值传递给下一个插件
});

hook.tap('Plugin2', (arg1) => {
  console.log('Plugin2', arg1); // 输出: Plugin2 Hello World
  return arg1 + '!'; // 再次修改返回值
});

const result = hook.call('Hello');
console.log('Final result:', result); // 输出: Final result: Hello World!
```

#### 示例 4: `AsyncParallelHook`（异步并行）

```javascript
const { AsyncParallelHook } = require('tapable');

const hook = new AsyncParallelHook(['arg1']);

// 异步插件使用 tapAsync 注册，并接收一个 callback 参数
console.time('asyncParallel');
hook.tapAsync('Plugin1', (arg1, callback) => {
  setTimeout(() => {
    console.log('Plugin1', arg1);
    callback(); // 必须调用 callback 来通知完成
  }, 1000);
});

hook.tapAsync('Plugin2', (arg1, callback) => {
  setTimeout(() => {
    console.log('Plugin2', arg1);
    callback();
  }, 500);
});

// 使用 callAsync 触发，并提供一个最终的回调
hook.callAsync('Hello', () => {
  console.log('All async plugins done!');
  console.timeEnd('asyncParallel'); // 总时间大约是 1000ms，因为并行执行
});
// 执行结果（大约1秒后）:
// Plugin2 Hello (500ms后输出)
// Plugin1 Hello (1000ms后输出)
// All async plugins done!
// asyncParallel: 1.005s
```

---

### 4. Tapable 在 Webpack 中的核心应用

Webpack 的本质就是一个**事件驱动的系统**，其两个核心对象 `Compiler` 和 `Compilation` 都是 Tapable 的实例。

#### `Compiler` 和 `Compilation`

*   **`Compiler`**: 代表了**完整的 Webpack 环境配置**。它只在 Webpack 启动时被创建一次，贯穿整个生命周期。它包含了 `options`、`loaders`、`plugins` 等所有配置信息。
*   **`Compilation`**: 代表**一次新的构建过程**。它包含了当前的模块资源、编译生成资源、变化的文件等。在监听模式下，每次文件变化都会创建一个新的 `Compilation`。

#### 插件如何工作？

一个 Webpack 插件本质上就是一个类，这个类拥有一个 `apply` 方法。当 Webpack 启动时，会调用每个插件的 `apply` 方法，并将 `compiler` 对象作为参数传入。插件通过在 `compiler` 和 `compilation` 对象的钩子上注册事件来介入构建过程。

**一个简单的插件示例：**

```javascript
class MyExamplePlugin {
  apply(compiler) {
    // 1. 在 'emit' 阶段（即将输出资产到 output 目录之前）注册一个事件
    compiler.hooks.emit.tapAsync('MyExamplePlugin', (compilation, callback) => {
      // 2. 在这个阶段，可以操作 compilation.assets
      const assets = compilation.assets;
      
      // 3. 例如，遍历所有资产，并记录它们的大小
      let fileList = 'File List:\n\n';
      for (const filename in assets) {
        const size = assets[filename].size();
        fileList += `- ${filename} (${size} bytes)\n`;
      }

      // 4. 向输出资产中添加一个新的虚拟文件
      compilation.assets['filelist.txt'] = {
        source: function() {
          return fileList;
        },
        size: function() {
          return fileList.length;
        }
      };

      // 5. 异步钩子必须调用 callback 来继续流程
      callback();
    });

    // 也可以注册同步钩子
    compiler.hooks.compile.tap('MyExamplePlugin', (params) => {
      console.log('Webpack is starting to compile...');
    });
  }
}

module.exports = MyExamplePlugin;
```

**在 `webpack.config.js` 中使用：**
```javascript
const MyExamplePlugin = require('./my-example-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new MyExamplePlugin()
  ]
};
```

#### Webpack 核心流程中的关键钩子

| 钩子 | 所属对象 | 类型 | 触发时机 |
| :--- | :--- | :--- | :--- |
| `entryOption` | `compiler` | `SyncBailHook` | 处理完 entry 配置后 |
| `compile` | `compiler` | `SyncHook` | 开始编译前 |
| `compilation` | `compiler` | `SyncHook` | 创建出新的 `compilation` 对象后 |
| `emit` | `compiler` | `AsyncSeriesHook` | **输出 asset** 到 output 目录之前 |
| `afterEmit` | `compiler` | `AsyncSeriesHook` | 输出 asset 到 output 目录之后 |
| `done` | `compiler` | `AsyncSeriesHook` | 编译完成后 |
| `buildModule` | `compilation` | `SyncHook` | 开始构建一个模块前 |
| `succeedModule` | `compilation` | `SyncHook` | 一个模块构建成功时 |

---

### 5. 总结

Tapable 是 Webpack 插件系统的灵魂：

1.  **角色定位：** 它是 Webpack 的**事件流核心库**，提供了复杂的钩子类型和流程控制能力。
2.  **核心概念：** 理解不同类型的 **Hook**（如 `SyncHook`, `SyncBailHook`, `AsyncParallelHook`）是理解 Tapable 的关键，它们决定了插件代码的执行方式和顺序。
3.  **在 Webpack 中：** `Compiler` 和 `Compilation` 对象扩展自 Tapable，它们身上挂载了数十个生命周期钩子。
4.  **插件机制：** 插件通过在其 `apply` 方法中，在 `compiler.hooks.xxx` 上调用 `.tap`/`.tapAsync`/`.tapPromise` 来注册事件，从而在构建流程的特定时机插入自定义逻辑。

**一句话概括：Webpack 通过 Tapable 将各种插件和内置功能像“插销”一样连接到构建生命周期的不同节点上，形成了一个高度可扩展、灵活的构建系统。** 