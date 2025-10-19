# Babel 配置文件

---

### 1. Babel 配置文件的四种形式

Babel 支持多种配置文件格式，按优先级从高到低排列：

#### 1.1 `babel.config.json` (推荐)
- **项目范围**的配置
- 适用于 monorepo 和复杂项目结构
- 可以覆盖 `node_modules` 中的配置

```json
// babel.config.json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": ["> 1%", "last 2 versions"]
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ]
  ],
  "plugins": [
    "@babel/plugin-transform-runtime"
  ],
  "env": {
    "development": {
      "plugins": ["react-refresh/babel"]
    },
    "test": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": { "node": "current" }
          }
        ]
      ]
    }
  }
}
```

#### 1.2 `.babelrc.json`
- **文件相对**的配置
- 适用于简单的单仓库项目
- 不会影响 `node_modules`

```json
// .babelrc.json
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-proposal-class-properties"]
}
```

#### 1.3 `package.json` 中的 babel 字段
- 将配置嵌入 `package.json`
- 适用于简单的库项目

```json
// package.json
{
  "name": "my-package",
  "version": "1.0.0",
  "babel": {
    "presets": ["@babel/preset-env"],
    "plugins": ["@babel/plugin-transform-runtime"]
  }
}
```

#### 1.4 JavaScript 配置文件
- 最灵活的配置方式
- 支持条件逻辑和动态配置

```javascript
// babel.config.js
module.exports = function(api) {
  // 缓存配置，提升性能
  api.cache.using(() => process.env.NODE_ENV);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    presets: [
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
      ],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: isDevelopment
        }
      ]
    ],
    plugins: [
      isDevelopment && 'react-refresh/babel',
      isProduction && ['transform-remove-console', { exclude: ['error', 'warn'] }]
    ].filter(Boolean)
  };
};
```

---

### 2. 配置文件的选择策略

#### 2.1 根据项目结构选择

**简单项目结构：**
```
project/
  ├── src/
  ├── .babelrc.json  # 或 babel.config.json
  └── package.json
```
使用 `.babelrc.json` 或 `babel.config.json`

**Monorepo 结构：**
```
monorepo/
  ├── packages/
  │   ├── package-a/
  │   │   └── .babelrc.json
  │   └── package-b/
  │       └── .babelrc.json
  ├── babel.config.json  # 根配置
  └── package.json
```
使用 `babel.config.json` + 各包的 `.babelrc.json`

#### 2.2 配置文件的优先级和合并

Babel 会按照以下顺序查找配置：
1. `babel.config.json` (项目范围)
2. `.babelrc.json` (文件相对)  
3. `package.json` 中的 `babel` 字段

```javascript
// 示例：配置合并
// babel.config.json (根配置)
{
  "presets": ["@babel/preset-env"],
  "plugins": ["plugin-a"]
}

// packages/component/.babelrc.json (子包配置)
{
  "plugins": ["plugin-b"]
}

// 最终生效配置：
{
  "presets": ["@babel/preset-env"],
  "plugins": ["plugin-a", "plugin-b"]
}
```

---

### 3. JavaScript 配置文件的完整指南

#### 3.1 基本结构

```javascript
// babel.config.js
module.exports = function(api) {
  // api 对象包含 Babel 的各种工具方法
  
  // 缓存配置（重要！）
  api.cache(true);
  
  const presets = [ ... ];
  const plugins = [ ... ];
  
  return {
    presets,
    plugins,
    // 其他配置...
  };
};
```

#### 3.2 API 方法详解

```javascript
module.exports = function(api) {
  // 1. 缓存配置
  api.cache.forever(); // 永久缓存
  api.cache.never();   // 不缓存
  api.cache.using(() => process.env.NODE_ENV); // 根据环境变量缓存
  api.cache.invalidate(() => process.env.NODE_ENV); // 环境变化时失效
  
  // 2. 环境信息
  api.env(); // 返回当前环境
  api.caller((caller) => caller?.name); // 获取调用者信息
  
  // 3. 版本信息
  api.version; // Babel 版本
  api.assertVersion(7); // 断言版本
  
  return {
    // 配置内容
  };
};
```

#### 3.3 高级配置示例

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache.using(() => process.env.NODE_ENV);
  
  const isDevelopment = api.env('development');
  const isProduction = api.env('production');
  const isTest = api.env('test');
  
  // 根据调用者定制配置
  const isWebpack = api.caller(caller => caller?.name === 'babel-loader');
  const isJest = api.caller(caller => caller?.name === '@babel/node');
  
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: isTest 
            ? { node: 'current' }
            : isWebpack 
              ? { browsers: ['> 1%', 'last 2 versions'] }
              : { node: '14' },
          modules: isWebpack ? false : 'commonjs',
          useBuiltIns: isProduction && isWebpack ? 'usage' : false,
          corejs: isProduction && isWebpack ? 3 : false,
          loose: true,
          bugfixes: true
        }
      ],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: isDevelopment
        }
      ],
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
          isTSX: false
        }
      ]
    ],
    
    plugins: [
      // 开发环境插件
      isDevelopment && [
        'babel-plugin-console-source',
        { segments: 2 }
      ],
      
      // React 热更新
      isDevelopment && isWebpack && 'react-refresh/babel',
      
      // 生产环境优化
      isProduction && [
        'transform-remove-console',
        { exclude: ['error', 'warn'] }
      ],
      
      // 测试环境插件
      isTest && 'babel-plugin-dynamic-import-node',
      
      // 通用插件
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: false,
          helpers: true,
          regenerator: true,
          useESModules: isWebpack && !isTest
        }
      ],
      
      // 条件编译
      process.env.ENABLE_OPTIMIZE && 'babel-plugin-lodash'
    ].filter(Boolean),
    
    // 环境特定配置
    env: {
      development: {
        compact: false,
        sourceMaps: 'inline'
      },
      production: {
        compact: true,
        comments: false
      },
      test: {
        sourceMaps: 'both'
      }
    },
    
    // 其他选项
    ignore: [
      'node_modules/**',
      '**/*.d.ts'
    ],
    
    only: [
      'src/**',
      'packages/**'
    ],
    
    // 源代码目录
    sourceRoot: '/src',
    
    // 源代码映射
    sourceMaps: true
  };
};
```

---

### 4. 环境特定配置

#### 4.1 使用 `env` 字段

```json
// babel.config.json
{
  "presets": ["@babel/preset-env"],
  "env": {
    "development": {
      "plugins": ["react-refresh/babel"],
      "sourceMaps": "inline"
    },
    "production": {
      "plugins": [
        ["transform-remove-console", { "exclude": ["error", "warn"] }]
      ]
    },
    "test": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": { "node": "current" }
          }
        ]
      ]
    }
  }
}
```

#### 4.2 环境检测逻辑

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache.using(() => process.env.NODE_ENV);
  
  // 环境检测的多种方式
  const env = process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  const isProduction = env === 'production';
  const isTest = env === 'test';
  
  // 或者使用 api.env()
  const isDev = api.env('development');
  const isProd = api.env('production');
  
  return {
    // 配置...
  };
};
```

---

### 5. 实际项目配置示例

#### 5.1 现代 React 项目配置

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache.using(() => process.env.NODE_ENV);
  
  const isDevelopment = api.env('development');
  const isProduction = api.env('production');
  const isTest = api.env('test');
  
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: [
              '> 1%',
              'last 2 versions',
              'not ie < 11',
              'not dead'
            ]
          },
          useBuiltIns: 'usage',
          corejs: { version: 3, proposals: true },
          modules: false,
          bugfixes: true,
          loose: true
        }
      ],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: isDevelopment
        }
      ],
      [
        '@babel/preset-typescript',
        {
          allExtensions: true,
          isTSX: false,
          onlyRemoveTypeImports: true
        }
      ]
    ],
    
    plugins: [
      // 开发环境
      isDevelopment && 'react-refresh/babel',
      
      // 生产环境优化
      isProduction && [
        'babel-plugin-transform-react-remove-prop-types',
        { removeImport: true }
      ],
      
      // 测试环境
      isTest && 'babel-plugin-dynamic-import-node',
      
      // 通用插件
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: true,
          regenerator: true,
          useESModules: !isTest
        }
      ],
      
      // 装饰器提案
      [
        '@babel/plugin-proposal-decorators',
        { legacy: true }
      ],
      
      // 类属性
      [
        '@babel/plugin-proposal-class-properties',
        { loose: true }
      ]
    ].filter(Boolean),
    
    env: {
      development: {
        compact: false,
        sourceMaps: 'inline'
      },
      production: {
        compact: true,
        comments: false
      }
    },
    
    ignore: [
      'node_modules/**',
      'dist/**',
      '**/*.test.*',
      '**/*.spec.*'
    ],
    
    only: [
      'src/**'
    ]
  };
};
```

#### 5.2 库/组件库配置

```javascript
// 组件库的 Babel 配置
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions']
        },
        modules: false,        // 不转换模块
        useBuiltIns: false,    // 不包含 polyfill
        loose: true
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
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: true     // 输出 ES 模块
      }
    ]
  ],
  
  // 库项目需要明确的排除规则
  ignore: [
    '**/*.test.*',
    '**/*.stories.*',
    '**/__tests__/**',
    '**/__mocks__/**'
  ],
  
  // 源代码映射
  sourceMaps: true
};
```

---

### 6. 配置优化和最佳实践

#### 6.1 性能优化

```javascript
// babel.config.js
module.exports = function(api) {
  // 必须：启用缓存
  api.cache.using(() => process.env.NODE_ENV);
  
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          // 启用松散模式提升性能
          loose: true,
          // 排除不需要的转换
          exclude: [
            'transform-typeof-symbol',
            'transform-regenerator',
            'transform-async-to-generator'
          ],
          // 启用 bugfixes 模式
          bugfixes: true
        }
      ]
    ],
    
    plugins: [
      // 使用 transform-runtime 减少重复代码
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: true,
          regenerator: true
        }
      ]
    ],
    
    // 忽略 node_modules
    ignore: ['node_modules/**'],
    
    // 只处理源代码
    only: ['src/**']
  };
};
```

#### 6.2 调试配置

```javascript
// babel.config.js
module.exports = function(api) {
  if (process.env.DEBUG_BABEL) {
    console.log('Babel 配置加载...');
    console.log('环境:', process.env.NODE_ENV);
    console.log('Babel 版本:', api.version);
  }
  
  api.cache.using(() => process.env.NODE_ENV);
  
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          debug: process.env.DEBUG_BABEL, // 启用调试输出
          targets: {
            browsers: ['> 1%', 'last 2 versions']
          }
        }
      ]
    ]
  };
};
```

---

### 7. 配置文件检查工具

#### 7.1 验证配置

```bash
# 检查 Babel 配置
npx babel --config-file babel.config.js --print-config src/index.js

# 查看实际转换结果
npx babel src/index.js --out-file compiled.js
```

#### 7.2 配置验证脚本

```javascript
// scripts/validate-babel-config.js
const babel = require('@babel/core');
const config = require('../babel.config.js');

try {
  // 测试配置是否有效
  const result = babel.transformSync('const example = () => {};', config);
  console.log('✅ Babel 配置有效');
} catch (error) {
  console.error('❌ Babel 配置错误:', error.message);
  process.exit(1);
}
```

---

### 总结

1. **配置文件类型**：
   - `babel.config.json`：项目范围配置（推荐）
   - `.babelrc.json`：文件相对配置
   - `package.json`：简单项目配置
   - `babel.config.js`：动态配置（最灵活）

2. **配置优先级**：从具体到通用

3. **最佳实践**：
   - 使用 `babel.config.js` 获得最大灵活性
   - 始终启用缓存 `api.cache()`
   - 根据环境区分配置
   - 合理使用 `ignore` 和 `only` 提升性能

4. **环境配置**：
   - 使用 `env` 字段或条件逻辑
   - 区分开发、生产、测试环境
   - 根据调用者定制配置
