# 手写webpack插件

---

### 1. 插件的基本骨架

一个 Webpack 插件本质上就是一个 JavaScript 类，这个类必须有一个 `apply` 方法。

```javascript
class MyWebpackPlugin {
  /**
   * 插件入口方法
   * @param {object} compiler - Webpack 的 Compiler 对象，代表了完整的 Webpack 环境配置
   */
  apply(compiler) {
    // 在这里注册到 webpack 的生命周期钩子上
  }
}

module.exports = MyWebpackPlugin;
```

---

### 2. 核心概念：Compiler 和 Compilation

在编写插件之前，必须理解两个核心对象：

- **Compiler**：代表了**完整的 Webpack 环境配置**。它只在 Webpack 启动时被创建一次，并贯穿整个生命周期。你可以把它理解为 Webpack 的**大脑**。
  
- **Compilation**：代表**一次新的构建过程**。它包含了当前的模块资源、编译生成资源、变化的文件等。在监听（watch）模式下，每次文件变化都会创建一个新的 Compilation。

### 3. 插件的执行机制

插件通过 **Tapable** 事件系统来工作。Webpack 在构建过程中的不同阶段会触发不同的**钩子（Hooks）**，插件可以监听这些钩子并在特定时机执行自定义逻辑。

**注册钩子的基本模式：**
```javascript
compiler.hooks.[钩子名称].[tap/tapAsync/tapPromise]('插件名称', (参数) => {
  // 插件逻辑
});
```

---

### 4. 实战案例一：简单的 Banner 插件

这个插件会在每个生成的 JS 文件头部添加一个注释横幅。

```javascript
class BannerPlugin {
  constructor(options = {}) {
    this.banner = options.banner || 'Default Banner';
    this.include = options.include || /\.js$/; // 默认只处理 JS 文件
  }

  apply(compiler) {
    const banner = this.banner;
    const include = this.include;

    // 在 emit 阶段（生成资源到 output 目录之前）介入
    compiler.hooks.emit.tapAsync('BannerPlugin', (compilation, callback) => {
      // 遍历所有编译生成的资源文件
      for (const filename in compilation.assets) {
        // 检查文件名是否符合条件
        if (include.test(filename)) {
          // 获取文件内容
          const asset = compilation.assets[filename];
          const originalSource = asset.source();
          
          // 在文件开头添加横幅
          const bannerContent = `/* ${banner} */\n`;
          const newSource = bannerContent + originalSource;
          
          // 更新资源内容
          compilation.assets[filename] = {
            source: () => newSource,
            size: () => newSource.length
          };
        }
      }
      
      // 异步钩子必须调用 callback
      callback();
    });
  }
}

module.exports = BannerPlugin;
```

**使用方法：**
```javascript
// webpack.config.js
const BannerPlugin = require('./banner-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new BannerPlugin({
      banner: 'This is my custom banner! Build time: ' + new Date().toISOString(),
      include: /\.(js|css)$/ // 同时处理 JS 和 CSS 文件
    })
  ]
};
```

---

### 5. 实战案例二：文件清单插件

这个插件会生成一个包含所有输出文件信息的 Markdown 文件。

```javascript
class FileListPlugin {
  constructor(options = {}) {
    this.filename = options.filename || 'filelist.md';
  }

  apply(compiler) {
    const filename = this.filename;

    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      // 创建文件内容
      let filelist = '# File List\\n\\n';
      
      // 遍历所有资源文件
      for (const filename in compilation.assets) {
        const asset = compilation.assets[filename];
        filelist += `- **${filename}** - ${asset.size()} bytes\\n`;
      }

      // 统计信息
      const fileCount = Object.keys(compilation.assets).length;
      const totalSize = Object.values(compilation.assets)
        .reduce((total, asset) => total + asset.size(), 0);
      
      filelist += `\\n**Total: ${fileCount} files, ${totalSize} bytes**`;

      // 将文件清单作为新的资源添加到编译中
      compilation.assets[filename] = {
        source: () => filelist,
        size: () => filelist.length
      };

      callback();
    });
  }
}

module.exports = FileListPlugin;
```

**生成的文件示例：**
```markdown
# File List

- **main.js** - 15234 bytes
- **styles.css** - 4231 bytes
- **vendor.js** - 89234 bytes

**Total: 3 files, 108699 bytes**
```

---

### 6. 实战案例三：构建时间分析插件

这个插件会记录构建时间并在控制台输出构建统计信息。

```javascript
class BuildTimeAnalyzerPlugin {
  constructor(options = {}) {
    this.reportFilename = options.reportFilename || 'build-time-report.json';
  }

  apply(compiler) {
    const startTime = Date.now();
    let modulesCount = 0;
    let chunksCount = 0;
    let assetsCount = 0;

    // 编译开始
    compiler.hooks.compile.tap('BuildTimeAnalyzerPlugin', () => {
      console.log('🚀 Build started...');
    });

    // 模块构建完成
    compiler.hooks.compilation.tap('BuildTimeAnalyzerPlugin', (compilation) => {
      compilation.hooks.buildModule.tap('BuildTimeAnalyzerPlugin', (module) => {
        modulesCount++;
      });

      compilation.hooks.afterOptimizeChunks.tap('BuildTimeAnalyzerPlugin', (chunks) => {
        chunksCount = chunks.length;
      });
    });

    // 构建完成
    compiler.hooks.done.tap('BuildTimeAnalyzerPlugin', (stats) => {
      const endTime = Date.now();
      const buildTime = endTime - startTime;
      assetsCount = Object.keys(stats.compilation.assets).length;

      // 控制台输出
      console.log('✅ Build completed!');
      console.log(`⏰ Build time: ${buildTime}ms`);
      console.log(`📦 Modules: ${modulesCount}`);
      console.log(`🔗 Chunks: ${chunksCount}`);
      console.log(`📁 Assets: ${assetsCount}`);

      // 生成详细报告
      const report = {
        buildTime,
        modulesCount,
        chunksCount,
        assetsCount,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        assets: Object.keys(stats.compilation.assets).map(filename => ({
          name: filename,
          size: stats.compilation.assets[filename].size()
        }))
      };

      // 将报告作为资源输出（可选）
      stats.compilation.assets[this.reportFilename] = {
        source: () => JSON.stringify(report, null, 2),
        size: () => JSON.stringify(report, null, 2).length
      };
    });
  }
}

module.exports = BuildTimeAnalyzerPlugin;
```

---

### 7. 实战案例四：自定义资源处理插件

这个插件会查找并处理代码中的特定注释，实现自定义功能。

```javascript
class CustomCommentProcessorPlugin {
  constructor(options = {}) {
    this.commentPattern = options.pattern || /@custom-processor\((.*?)\)/g;
    this.processor = options.processor || ((match) => `/* Processed: ${match[1]} */`);
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('CustomCommentProcessorPlugin', (compilation) => {
      // 处理正常模块
      compilation.hooks.optimizeModules.tap('CustomCommentProcessorPlugin', (modules) => {
        modules.forEach(module => {
          if (module.originalSource) {
            const source = module.originalSource().source();
            const processedSource = source.replace(this.commentPattern, this.processor);
            
            if (processedSource !== source) {
              // 更新模块源码
              module.originalSource = () => ({
                source: () => processedSource,
                size: () => processedSource.length
              });
            }
          }
        });
      });
    });
  }
}

module.exports = CustomCommentProcessorPlugin;
```

**使用示例：**
```javascript
// 源代码
const message = 'Hello World'; // @custom-processor(Some processing logic)

// 处理后
const message = 'Hello World'; /* Processed: Some processing logic */
```

---

### 8. 插件开发最佳实践

1. **合理的钩子选择：**
   - 使用 `emit` 修改输出资源
   - 使用 `compilation` 处理模块
   - 使用 `done` 进行构建后处理

2. **错误处理：**
   ```javascript
   compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
     try {
       // 插件逻辑
       callback();
     } catch (error) {
       compilation.errors.push(error);
       callback();
     }
   });
   ```

3. **配置验证：**
   ```javascript
   class MyPlugin {
     constructor(options) {
       if (typeof options !== 'object') {
         throw new Error('MyPlugin options must be an object');
       }
       this.options = options;
     }
     // ...
   }
   ```

4. **支持异步操作：**
   ```javascript
   compiler.hooks.emit.tapPromise('MyPlugin', async (compilation) => {
     await someAsyncOperation();
     // 处理逻辑
   });
   ```

### 总结

手写 Webpack 插件的核心要点：

1. **基本结构：** 一个包含 `apply` 方法的类
2. **核心对象：** 通过 `compiler` 和 `compilation` 访问构建过程
3. **事件系统：** 使用 Tapable 钩子在特定生命周期介入
4. **资源操作：** 通过 `compilation.assets` 读取和修改输出文件
5. **异步支持：** 正确使用 `tapAsync` 或 `tapPromise` 处理异步操作

通过自定义插件，可以：
- 添加构建统计和分析
- 优化输出资源
- 实现自定义的文件处理逻辑
- 集成外部工具到构建流程
- 实现复杂的工程化需求
