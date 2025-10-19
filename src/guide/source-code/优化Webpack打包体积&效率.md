# 优化Webpack打包体积&效率

---

## 第一部分：打包体积优化

### 1. 分析工具先行

在优化之前，必须先分析打包结果。

#### 使用 webpack-bundle-analyzer
```javascript
// 安装
npm install --save-dev webpack-bundle-analyzer

// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'server', // 启动本地服务查看分析报告
      openAnalyzer: true,     // 完成后自动打开浏览器
    })
  ]
};
```

#### 使用 speed-measure-webpack-plugin 分析构建时间
```javascript
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  // webpack配置
});
```

---

### 2. JavaScript 体积优化

#### 2.1 Tree Shaking
**原理：** 消除未被引用的代码（dead code）

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // 生产模式自动开启 Tree Shaking
  
  optimization: {
    usedExports: true, // 标记未被使用的导出
    minimize: true,    // 压缩时删除未被使用的代码
  }
};

// package.json 确保模块是 ES6 模块
{
  "sideEffects": false, // 所有文件都没有副作用
  // 或指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

#### 2.2 代码分割
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库单独打包
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20,
        },
        // 公共代码提取
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

#### 2.3 动态导入
```javascript
// 静态导入（会打包到主包）
// import { heavyFunction } from './heavy-module';

// 动态导入（按需加载）
const loadHeavyModule = async () => {
  const { heavyFunction } = await import('./heavy-module');
  heavyFunction();
};

// React 懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

---

### 3. 第三方库优化

#### 3.1 使用 CDN 引入
```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_',
  },
};

// index.html
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
```

#### 3.2 选择更小的替代库
```javascript
// 使用 date-fns 替代 moment.js（体积更小）
import { format } from 'date-fns';

// 使用 lodash-es 支持 Tree Shaking
import { debounce } from 'lodash-es';

// 使用 preact 替代 react（体积更小）
```

---

### 4. 资源文件优化

#### 4.1 图片优化
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // 8KB 以下的图片转为 base64
              fallback: 'file-loader',
              outputPath: 'images/',
              name: '[name].[hash:8].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader', // 图片压缩
            options: {
              mozjpeg: { progressive: true, quality: 65 },
              optipng: { enabled: false },
              pngquant: { quality: [0.65, 0.9], speed: 4 },
              gifsicle: { interlaced: false },
            },
          },
        ],
      },
    ],
  },
};
```

#### 4.2 CSS 优化
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 提取 CSS 为独立文件
          'css-loader',
          'postcss-loader', // 自动添加浏览器前缀
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
    }),
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(), // 压缩 CSS
    ],
  },
};
```

---

## 第二部分：构建效率优化

### 1. 开发环境优化

#### 1.1 增量编译和缓存
```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem', // 使用文件系统缓存
    buildDependencies: {
      config: [__filename], // 配置文件改变时缓存失效
    },
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true, // babel 缓存
            },
          },
        ],
      },
    ],
  },
};
```

#### 1.2 减少构建目标
```javascript
// 开发环境排除不必要的处理
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: 'url-loader', // 开发环境不使用图片压缩
      },
    ],
  },
};
```

---

### 2. 优化解析和查找

#### 2.1 缩小文件搜索范围
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // 减少扩展名尝试
    alias: {
      '@': path.resolve(__dirname, 'src'), // 路径别名
      'react': path.resolve(__dirname, './node_modules/react'), // 固定模块路径
    },
    modules: [
      path.resolve(__dirname, 'node_modules'), // 指定 node_modules 位置
      'node_modules'
    ],
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // 排除 node_modules
        include: path.resolve(__dirname, 'src'), // 只处理 src 目录
        use: 'babel-loader',
      },
    ],
  },
};
```

---

### 3. 并行处理

#### 3.1 多进程处理
```javascript
const TerserPlugin = require('terser-webpack-plugin');
const ThreadLoader = require('thread-loader');

// thread-loader 预配置
threadLoader.warmup(
  {
    workers: 2, // CPU 核心数 - 1
  },
  ['babel-loader', 'ts-loader']
);

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
            },
          },
          'babel-loader',
        ],
      },
    ],
  },
  
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 开启多进程压缩
        terserOptions: {
          compress: {
            drop_console: true, // 生产环境移除 console
          },
        },
      }),
    ],
  },
};
```

#### 3.2 使用 HappyPack（Webpack 4）
```javascript
const HappyPack = require('happypack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'happypack/loader?id=js',
      },
    ],
  },
  plugins: [
    new HappyPack({
      id: 'js',
      threads: 4,
      loaders: ['babel-loader'],
    }),
  ],
};
```

---

### 4. DLL 预编译

对于不经常变化的第三方库，使用 DLL 预编译。

#### 4.1 webpack.dll.config.js
```javascript
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    vendor: ['react', 'react-dom', 'lodash', 'moment'],
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_library',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: '[name]_library',
    }),
  ],
};
```

#### 4.2 主配置中引用 DLL
```javascript
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor-manifest.json'),
    }),
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, 'dll/vendor.dll.js'),
    }),
  ],
};
```

---

## 第三部分：综合优化配置

### 生产环境完整配置示例
```javascript
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  
  entry: {
    app: './src/index.js',
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    clean: true,
  },
  
  cache: {
    type: 'filesystem',
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8KB
          },
        },
        generator: {
          filename: 'images/[name].[contenthash:8][ext]',
        },
      },
    ],
  },
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 20,
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
    
    runtimeChunk: {
      name: 'runtime',
    },
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
    }),
    
    // 按需开启分析
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};
```

---

## 第四部分：监控和维护

### 1. 持续监控打包大小
```javascript
// 使用 webpack-bundle-size-analyzer
const { BundleStatsWebpackPlugin } = require('bundle-stats-webpack-plugin');

module.exports = {
  plugins: [
    new BundleStatsWebpackPlugin({
      compare: true, // 与上一次构建对比
      baseline: true, // 生成基线报告
    }),
  ],
};
```

### 2. 自定义监控插件
```javascript
class BundleMonitorPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BundleMonitorPlugin', (stats) => {
      const { assets } = stats.compilation;
      
      console.log('📦 打包结果:');
      assets.forEach(asset => {
        console.log(`  ${asset.name}: ${(asset.size / 1024).toFixed(2)} KB`);
      });
      
      const totalSize = Array.from(assets)
        .reduce((total, [_, asset]) => total + asset.size(), 0);
      
      console.log(`📊 总大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    });
  }
}
```

---

## 总结

### 体积优化策略：
1. **Tree Shaking** - 消除死代码
2. **代码分割** - 按需加载
3. **资源压缩** - 图片、CSS、JS 压缩
4. **第三方库优化** - CDN、替代库
5. **Gzip 压缩** - 服务端压缩

### 效率优化策略：
1. **缓存机制** - 文件系统缓存、loader 缓存
2. **并行处理** - 多进程、多线程
3. **范围缩小** - 减少文件搜索范围
4. **DLL 预编译** - 第三方库预编译
5. **增量编译** - 开发环境优化

- **开发环境**：注重构建速度，适当放弃优化
- **生产环境**：注重打包体积，开启所有优化
- **持续监控**：定期分析打包结果，及时发现体积问题
