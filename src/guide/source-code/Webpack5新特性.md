# Webpack5新特性
Webpack 5 带来了一系列显著升级，核心目标是**提升构建性能、优化应用体积和缓存效率，并引入模块联邦等创新特性**。

| 核心升级方向 | 主要升级内容 |
| :--- | :--- |
| ⚡ **构建性能提升** | 持久性缓存，更优的 Tree Shaking，Node.js Polyfills 默认移除 |
| 💾 **长期缓存优化** | 确定的 Chunk/模块/导出 ID，内容哈希算法改进 |
| 🔗 **模块联邦** | 支持跨应用动态共享代码与依赖 |
| 🛠 **资源与构建优化** | 内置资源模块（Asset Modules），改进代码分割，支持更现代的 Web 特性 |

### ⚡ 构建性能提升

*   **持久性缓存**：Webpack 5 引入了**持久性缓存**来提升构建速度。通过配置 `cache: { type: 'filesystem' }`，Webpack 可以将构建过程中的模块依赖关系等缓存到磁盘。这意味着在二次构建时，会直接使用缓存，**大幅减少冷启动时间**。你不再需要像 Webpack 4 那样频繁使用 `cache-loader`。

*   **更优的 Tree Shaking**：Webpack 5 的 **Tree Shaking** 功能（用于移除未引用代码）更强大。它能：
    *   分析模块中**嵌套的导出**关系，并移除未使用的导出代码。例如，即使未使用的代码被多层嵌套引用，Webpack 5 也能更好地将其识别并移除。
    *   通过 `optimization.innerGraph` 分析模块内部的依赖关系，标记并移除未被使用的导出。
    *   增强了对 **CommonJS** 和 **ES Module** 混合使用场景的 Tree Shaking 能力。

*   **默认不再提供 Node.js Polyfills**：在 Webpack 5 中，**不再自动注入 Node.js 核心模块（如 `crypto`、`path`）的 polyfills**。这有助于**减小打包体积**。如果你的前端代码或依赖的第三方库使用了这些模块，需要**手动安装并配置相应的 polyfill（如 `buffer`、`process`）**。

### 💾 长期缓存优化

*   **确定的 Chunk、模块和导出 ID**：Webpack 5 在生产模式下，默认启用**确定的 Chunk ID、模块 ID 和导出名称**。它采用新的 ID 确定算法，确保在不同构建中，相同模块的 ID 保持一致。这对于**长期缓存**非常有利，因为只有发生实际变更的文件其文件名会改变，浏览器可以继续使用未变更文件的缓存。

*   **内容哈希算法改进**：Webpack 5 将 `hash` 重命名为 `fullhash`，并统一使用 `[contenthash]`。其改进在于，**仅当模块的内容发生实质性改变时，`[contenthash]` 才会变化**。例如，修改代码注释在 Webpack 4 中可能导致 `contenthash` 变化，而在 Webpack 5 中则不会，这进一步优化了缓存策略。

### 🔗 模块联邦

Webpack 5 引入了**模块联邦（Module Federation）**，这是一个支持**在运行时动态从不同的 Webpack 构建中加载代码**的特性。通过 `ModuleFederationPlugin` 配置，它可以：
*   实现**微前端**架构，允许多个独立构建的应用共享组件或库。
*   作为 **Host** 的应用可以消费作为 **Remote** 的应用暴露出的模块。
*   支持**共享依赖库**，避免多个应用重复加载相同库。

### 🛠 资源与构建优化

*   **内置资源模块（Asset Modules）**：Webpack 5 内置了**资源模块**（Asset Modules），用于替代 `raw-loader`、`url-loader` 和 `file-loader`。你可以通过设置 `type: 'asset/resource'` 等来处理图片、字体等静态资源，简化配置。

*   **改进代码分割**：Webpack 5 改进了代码分割功能，使得代码分割更加灵活和自动化。例如，现在可以根据代码的运行时特征来自动切割代码块。

*   **支持现代 Web 特性**：
    *   **原生 Web Worker 支持**：支持 `new Worker(new URL("./worker.js", import.meta.url))` 这种浏览器原生支持的语法。
    *   **顶层 Await (Top-Level Await)**：支持在模块的顶层使用 `await`。
    *   **增强的 JSON 模块**：支持更优化的 JSON 模块 Tree Shaking。

### ⚠️ 升级注意事项

*   **Node.js 版本要求**：Webpack 5 要求 **Node.js 版本至少为 10.13.0**（建议使用更高版本，如 Node.js 12 LTS 以上）。
*   **移除的 Polyfills**：如前所述，注意处理 Node.js 核心模块的 polyfill。
*   **废弃的 API**：Webpack 5 清除了一些在 v4 中标记为废弃的功能，例如 `require.include` 语法已被废弃。
*   **配置调整**：部分配置项默认值或名称有变化，例如 `cache` 配置，`optimization.chunkIds` 和 `optimization.moduleIds` 在生产模式下默认使用 `'deterministic'`。

### 总结

Webpack 5 通过持久性缓存和改进的算法显著提升了构建性能，通过确定的ID和内容哈希优化了长期缓存机制，并带来了模块联邦这一创新特性。升级时，请务必仔细阅读官方迁移指南，并进行充分测试。
