# Webpack 基础

---

## 1. Webpack 是什么？

**Webpack** 是一个**静态模块打包器**。它能够将各种类型的资源（JavaScript、CSS、图片、字体等）转换为静态资源。

### 核心概念：
- **入口**：构建的起点
- **输出**：构建结果的位置
- **Loader**：处理非 JavaScript 文件
- **插件**：执行更广泛的任务
- **模式**：开发/生产环境

---

## 2. 核心概念详解

### 2.1 入口

指定 Webpack 从哪个文件开始构建依赖图。

```javascript
// webpack.config.js
module.exports = {
  // 单入口（SPA）
  entry: './src/index.js',
  
  // 多入口（MPA）
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  }
};
```

### 2.2 输出

指定打包后的文件输出位置和命名。

```javascript
const path = require('path');

module.exports = {
  output: {
    // 输出目录
    path: path.resolve(__dirname, 'dist'),
    // 输出文件名
    filename: 'bundle.js',
    
    // 多入口时使用占位符
    filename: '[name].bundle.js',
    
    // 带哈希的文件名（用于缓存）
    filename: '[name].[contenthash].js',
    
    // 清理输出目录
    clean: true
  }
};
```

### 2.3 Loader

让 Webpack 能够处理非 JavaScript 文件。

```javascript
module.exports = {
  module: {
    rules: [
      // 处理 CSS 文件
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      
      // 处理图片文件
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      
      // 处理 JavaScript（Babel）
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### 2.4 插件

执行范围更广的任务，如打包优化、资源管理等。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    // 自动生成 HTML 文件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

### 2.5 模式

指定开发或生产环境。

```javascript
module.exports = {
  // 开发模式（不压缩，包含 source map）
  mode: 'development',
  
  // 生产模式（压缩优化）
  mode: 'production'
};
```

---

## 3. 完整配置示例

### 3.1 基础配置文件

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 入口
  entry: './src/index.js',
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true
  },
  
  // 模式
  mode: 'development',
  
  // 开发工具
  devtool: 'inline-source-map',
  
  // Loader 配置
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  
  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      title: 'My App',
      template: './src/index.html'
    })
  ],
  
  // 开发服务器
  devServer: {
    static: './dist',
    hot: true,
    port: 3000
  }
};
```

---

## 4. 常用 Loader 详解

### 4.1 CSS 相关 Loader

```javascript
module.exports = {
  module: {
    rules: [
      // 方式1：内联样式
      {
        test: /\.css$/i,
        use: [
          'style-loader',  // 将 CSS 插入到 DOM
          'css-loader'     // 解析 CSS 文件
        ]
      },
      
      // 方式2：提取为独立文件
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      
      // 处理 Sass/SCSS
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  }
};
```

### 4.2 文件资源 Loader

```javascript
module.exports = {
  module: {
    rules: [
      // 处理图片
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext]'
        }
      },
      
      // 处理字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext]'
        }
      },
      
      // 小文件转为 base64
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB
          }
        }
      }
    ]
  }
};
```

---

## 5. 常用插件详解

### 5.1 HtmlWebpackPlugin

自动生成 HTML 文件并注入资源。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',      // 模板文件
      filename: 'index.html',            // 输出文件名
      title: 'My App',                   // 页面标题
      minify: {                          // 压缩 HTML
        removeComments: true,
        collapseWhitespace: true
      },
      chunks: ['app']                    // 指定引入的 chunk
    })
  ]
};
```

### 5.2 MiniCssExtractPlugin

提取 CSS 为独立文件。

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    })
  ]
};
```

### 5.3 CleanWebpackPlugin

清理输出目录。

```javascript
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    new CleanWebpackPlugin()
  ]
};

// Webpack 5 也可以使用 output.clean
output: {
  clean: true
}
```

---

## 6. 开发环境配置

### 6.1 开发服务器

```javascript
module.exports = {
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,           // 启用 gzip 压缩
    port: 3000,               // 端口号
    open: true,               // 自动打开浏览器
    hot: true,                // 热更新
    historyApiFallback: true, // SPA 路由支持
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};
```

### 6.2 热模块替换

```javascript
module.exports = {
  devServer: {
    hot: true
  }
};

// 在代码中接受热更新
if (module.hot) {
  module.hot.accept('./module.js', function() {
    // 模块更新时的回调
  });
}
```

---

## 7. 生产环境优化

### 7.1 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 20
        },
        // 公共代码
        common: {
          name: 'common',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 7.2 压缩优化

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),      // 压缩 JavaScript
      new CssMinimizerPlugin() // 压缩 CSS
    ]
  }
};
```

---

## 8. 环境特定配置

### 8.1 使用环境变量

```javascript
// webpack.config.js
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    
    plugins: [
      isProduction && new MiniCssExtractPlugin()
    ].filter(Boolean)
  };
};
```

### 8.2 多环境配置文件

```javascript
// webpack.common.js - 公共配置
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};

// webpack.dev.js - 开发环境
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true
  }
});

// webpack.prod.js - 生产环境
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
});
```

---

## 9. 实战示例

### 9.1 React 项目配置

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/'
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  
  resolve: {
    extensions: ['.js', '.jsx']
  },
  
  devServer: {
    historyApiFallback: true,
    hot: true
  }
};
```

---

## 总结

1. **四大核心**：入口、输出、Loader、插件
2. **开发环境**：热更新、source map、开发服务器
3. **生产环境**：代码分割、压缩、优化
4. **常用 Loader**：处理 CSS、图片、JavaScript 等资源
5. **常用插件**：HTML 生成、CSS 提取、目录清理等
