# Babel 预设
Babel预设是一组预先配置好的 Babel 插件的集合，让我们可以轻松地配置 Babel 来转换特定的 js 特性。

---

### 1. 预设的核心概念

**预设是什么？**
- 预设是一组**相关的 Babel 插件**的集合
- 提供开箱即用的语法转换能力
- 简化 Babel 配置，避免手动管理大量插件

**为什么需要预设？**
```javascript
// ❌ 没有预设：需要手动配置大量插件
{
  "plugins": [
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-classes",
    "@babel/plugin-transform-template-literals",
    "@babel/plugin-transform-destructuring",
    // ... 几十个插件
  ]
}

// ✅ 使用预设：一行配置搞定
{
  "presets": ["@babel/preset-env"]
}
```

---

### 2. 官方预设详解

#### 2.1 `@babel/preset-env` - **最核心的预设**

这是最智能、最常用的预设，它根据目标环境自动确定需要转换的 ES6+ 特性和需要添加的 polyfill。

**基本配置：**
```javascript
// babel.config.js 或 .babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        // 指定目标环境
        "targets": {
          "browsers": ["last 2 versions", "ie >= 11"],
          // 或指定 Node.js 版本
          "node": "14"
        },
        
        //  polyfill 使用方式
        "useBuiltIns": "usage", // 按需引入
        "corejs": 3,           // 指定 core-js 版本
        
        // 模块转换
        "modules": false,      // 保留 ES6 模块，便于 tree shaking
      }
    ]
  ]
}
```

**useBuiltIns 选项详解：**
```javascript
{
  "presets": [
    [
      "@babel/preset-env",
      {
        // false: 不自动添加 polyfill，需要手动引入
        // entry: 根据目标环境引入全部需要的 polyfill
        // usage: 根据代码中使用的新 API 按需引入（推荐）
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ]
}
```

**targets 配置示例：**
```javascript
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          // 浏览器配置
          "browsers": [
            "last 2 versions",
            "not ie < 11",
            "not dead"
          ],
          
          // 市场份额配置
          "browsers": "> 0.5%, not dead",
          
          // 特定版本配置
          "chrome": "58",
          "ie": "11",
          "firefox": "60",
          "safari": "12"
        }
      }
    ]
  ]
}
```

#### 2.2 `@babel/preset-react` - React 项目必备

专门用于转换 JSX 和 React 相关特性。

**配置示例：**
```javascript
{
  "presets": [
    [
      "@babel/preset-react",
      {
        // JSX 编译方式
        "runtime": "automatic", // 自动导入 jsx 函数（React 17+）
        // 或 "runtime": "classic" // 传统方式，需要手动导入 React
        
        // 开发模式配置
        "development": process.env.NODE_ENV === "development",
        
        // 其他选项
        "pragma": "h",           // 指定 JSX 函数名（Preact）
        "pragmaFrag": "Fragment" // 指定 Fragment 组件名
      }
    ]
  ]
}
```

**新旧 JSX 转换对比：**
```javascript
// ❌ 传统方式（runtime: "classic"）
import React from 'react';
function App() {
  return <div>Hello</div>;
}

// ✅ 新方式（runtime: "automatic"）
// 不需要手动导入 React
function App() {
  return <div>Hello</div>;
}
// Babel 会自动添加：import { jsx as _jsx } from 'react/jsx-runtime'
```

#### 2.3 `@babel/preset-typescript` - TypeScript 支持

将 TypeScript 转换为 JavaScript。

**配置示例：**
```javascript
{
  "presets": [
    [
      "@babel/preset-typescript",
      {
        // 所有文件都认为是 TypeScript
        "allExtensions": true,
        
        // 将 JSX 保留给其他预设处理
        "isTSX": false,
        
        // 允许命名空间
        "allowNamespaces": true,
        
        // 允许声明常量枚举
        "onlyRemoveTypeImports": true
      }
    ]
  ]
}
```

**与 ts-loader 的区别：**
- **Babel**：只移除类型注解，不进行类型检查
- **tsc/ts-loader**：进行完整的类型检查和编译

**推荐工作流：**
```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "build": "babel src --out-dir dist"
  }
}
```

#### 2.4 `@babel/preset-flow` - Flow 类型支持

用于 Flow 静态类型检查器的支持。

```javascript
{
  "presets": [
    ["@babel/preset-flow", {
      "all": true
    }]
  ]
}
```

---

### 3. 社区预设

#### 3.1 特定框架预设

**Vue.js：**
```javascript
// 使用 vue-cli 或手动配置
{
  "presets": [
    ["@babel/preset-env", { "modules": false }]
  ],
  "plugins": [
    "@babel/plugin-transform-runtime",
    // Vue 特定的 JSX 转换
    "@vue/babel-plugin-jsx"
  ]
}
```

**Next.js：**
```javascript
// Next.js 内置了 Babel 配置
{
  "presets": ["next/babel"],
  "plugins": []
}
```

---

### 4. 预设的执行顺序

**重要规则：预设的执行顺序是"从后往前"（逆序）。**

```javascript
{
  "presets": [
    "preset-a", // 第三执行
    "preset-b", // 第二执行  
    "preset-c"  // 第一执行
  ]
}
```

**实际配置示例：**
```javascript
{
  "presets": [
    // 第3步：处理 TypeScript
    [
      "@babel/preset-typescript",
      {
        "allExtensions": true,
        "isTSX": false
      }
    ],
    
    // 第2步：处理 React JSX
    [
      "@babel/preset-react",
      {
        "runtime": "automatic"
      }
    ],
    
    // 第1步：处理 ES6+ 语法
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": ["> 1%", "last 2 versions"]
        },
        "useBuiltIns": "usage",
        "corejs": 3,
        "modules": false
      }
    ]
  ]
}
```

---

### 5. 自定义预设

当项目有特定需求时，可以创建自定义预设。

#### 5.1 创建自定义预设

```javascript
// babel-preset-my-custom/index.js
module.exports = function(api, options = {}, dirname) {
  // api.cache.forever(); // 缓存配置
  
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  
  return {
    // 继承其他预设
    presets: [
      [
        require('@babel/preset-env'),
        {
          targets: options.targets || { browsers: ['> 1%'] },
          modules: options.modules || false,
          ...options.envOptions
        }
      ]
    ],
    
    // 添加插件
    plugins: [
      // 开发环境插件
      env === 'development' && [
        require('babel-plugin-console-source'),
        { segments: 2 }
      ],
      
      // 生产环境插件
      env === 'production' && [
        require('babel-plugin-transform-remove-console'),
        { exclude: ['error', 'warn'] }
      ],
      
      // 条件编译
      options.optimize && require('babel-plugin-lodash'),
      
      // 自定义插件
      require('./custom-plugin')
    ].filter(Boolean)
  };
};
```

#### 5.2 使用自定义预设

```javascript
// babel.config.js
module.exports = {
  "presets": [
    [
      "./babel-preset-my-custom",
      {
        "targets": {
          "browsers": ["> 1%", "last 2 versions"]
        },
        "modules": false,
        "optimize": true
      }
    ]
  ]
};
```

---

### 6. 实际项目配置示例

#### 6.1 现代 Web 应用配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    // ES6+ 语法转换
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            '> 1%',           // 全球使用率 > 1%
            'last 2 versions', // 最近两个版本
            'not ie < 11',     // 排除 IE 10 及以下
            'not dead'         // 排除已"死亡"的浏览器
          ]
        },
        useBuiltIns: 'usage',  // 按需引入 polyfill
        corejs: 3,             // 使用 core-js 3
        modules: false         // 保留 ES6 模块
      }
    ],
    
    // React JSX 转换
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',  // 自动导入 JSX 运行时
        development: process.env.NODE_ENV === 'development'
      }
    ]
  ],
  
  plugins: [
    // 优化代码
    '@babel/plugin-transform-runtime',
    
    // 开发环境插件
    process.env.NODE_ENV === 'development' && 'react-refresh/babel'
  ].filter(Boolean),
  
  env: {
    development: {
      plugins: ['react-refresh/babel']
    },
    production: {
      plugins: [
        ['transform-remove-console', { exclude: ['error', 'warn'] }]
      ]
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'  // 测试环境针对当前 Node.js 版本
            }
          }
        ]
      ]
    }
  }
};
```

#### 6.2 库/组件库配置

```javascript
// 组件库的 Babel 配置
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 库项目通常不转换模块，由使用者处理
        modules: false,
        // 库项目通常不包含 polyfill
        useBuiltIns: false,
        targets: {
          browsers: ['> 1%', 'last 2 versions']
        }
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic'
      }
    ],
    '@babel/preset-typescript'
  ],
  
  plugins: [
    // 优化辅助函数
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: true
      }
    ]
  ]
};
```

---

### 7. 最佳实践和注意事项

#### 7.1 环境区分

```javascript
module.exports = function(api) {
  // 缓存配置
  api.cache.using(() => process.env.NODE_ENV);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';
  
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: isTest 
          ? { node: 'current' }
          : { browsers: ['> 1%', 'last 2 versions'] },
        modules: isTest ? 'commonjs' : false,
        useBuiltIns: isProduction ? 'usage' : false,
        corejs: isProduction ? 3 : false
      }
    ]
  ];
  
  const plugins = [
    isDevelopment && 'react-refresh/babel',
    isProduction && 'babel-plugin-transform-remove-console'
  ].filter(Boolean);
  
  return { presets, plugins };
};
```

#### 7.2 性能优化

```javascript
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // 启用更快的转换
        loose: true,
        // 排除不需要的转换
        exclude: [
          'transform-typeof-symbol',
          'transform-regenerator'
        ]
      }
    ]
  ],
  
  // 忽略 node_modules
  ignore: ['node_modules/**'],
  
  // 只处理源代码
  only: ['src/**']
};
```

---

### 总结

1. **简化配置**：一组预设替代数十个插件配置
2. **智能转换**：根据目标环境自动确定需要的转换
3. **生态整合**：为不同框架和场景提供专门支持

**常用预设组合：**
- **Web 应用**：`@babel/preset-env` + `@babel/preset-react`
- **TypeScript 项目**：`@babel/preset-env` + `@babel/preset-typescript`
- **库开发**：`@babel/preset-env` + `@babel/plugin-transform-runtime`

**关键配置要点：**
- 预设执行顺序是**逆序**
- 合理配置 `targets` 避免过度转换
- 根据项目类型选择 `useBuiltIns` 策略
- 区分开发和生产环境配置
