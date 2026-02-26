# React 服务端渲染（SSR）原理

## 目录
1. [基础概念](#基础概念)
2. [SSR vs CSR：核心区别](#ssr-vs-csr核心区别)
3. [React SSR 工作原理](#react-ssr工作原理)
4. [从零实现 React SSR](#从零实现react-ssr)
5. [Next.js 中的 SSR 实践](#nextjs中的ssr实践)
6. [React 18 的 SSR 新特性](#react-18的ssr新特性)
7. [性能优化策略](#性能优化策略)
8. [常见问题与解决方案](#常见问题与解决方案)

## 基础概念

### 什么是服务端渲染（SSR）？

服务端渲染（Server-Side Rendering）是指在服务器端将 React 组件渲染成 HTML 字符串，然后将这些 HTML 发送到客户端，最后客户端的 JavaScript 代码"激活"这些静态 HTML，使其变成可交互的应用程序。

### 为什么需要 SSR？

- **SEO 优化**：搜索引擎爬虫可以直接抓取渲染好的 HTML 内容
- **首屏加载速度**：用户无需等待所有 JavaScript 加载完成即可看到页面内容
- **用户体验**：减少白屏时间，特别是在网络条件较差的情况下

## SSR vs CSR：核心区别

| 特性 | SSR | CSR |
|------|-----|-----|
| 首屏渲染 | 快（服务器预渲染） | 慢（需等待 JS 执行） |
| SEO | 好（HTML 有完整内容） | 差（初始 HTML 为空） |
| 服务端压力 | 较大（需实时渲染） | 小（只返回静态资源） |
| 交互体验 | 激活后同 SPA | 原生 SPA 体验 |
| 开发复杂度 | 较高 | 较低 |

## React SSR 工作原理

### 核心流程

1. **请求处理**：用户访问页面，服务器接收请求
2. **数据获取**：获取页面所需的初始数据
3. **组件渲染**：在服务器端将 React 组件渲染为 HTML
4. **HTML 响应**：将渲染好的 HTML 发送给客户端
5. **客户端激活**：浏览器接收 HTML 并显示，然后 JavaScript 代码使页面具备交互能力

### 关键概念

#### 1. 渲染方法

React 提供了两个主要的 SSR 渲染方法：

```javascript
// 1. renderToString - 同步渲染
import { renderToString } from 'react-dom/server';
const html = renderToString(<App />);

// 2. renderToPipeableStream - 流式渲染（React 18+）
import { renderToPipeableStream } from 'react-dom/server';
const stream = renderToPipeableStream(<App />, {
  onShellReady() {// 
    response.statusCode = 200;
    stream.pipe(response);
  }
});
```

#### 2. 水合（Hydration）

水合是指客户端 JavaScript 代码"接管"服务器渲染的静态 HTML，使其变成可交互的应用程序的过程。

```javascript
import { hydrateRoot } from 'react-dom/client';
hydrateRoot(document.getElementById('root'), <App />);
```

## 从零实现 React SSR

### 1. 项目结构

```
ssr-app/
├── server/
│   ├── index.js      # 服务器入口
│   └── renderer.js   # 渲染逻辑
├── src/
│   ├── App.js        # 根组件
│   ├── index.js      # 客户端入口
│   └── components/   # 其他组件
├── package.json
└── webpack.config.js
```

### 2. 服务器端代码

```javascript
// server/renderer.js
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';

export function render() {
  const html = renderToString(<App />);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>React SSR</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `;
}
```

### 3. 客户端代码

```javascript
// src/index.js
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document.getElementById('root'), <App />);
```

## Next.js 中的 SSR 实践

### 1. 数据获取方法

Next.js 提供了多种数据获取方式：

```javascript
// 服务端渲染（每次请求都执行）
export async function getServerSideProps(context) {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  
  return {
    props: { data }, // 将数据传递给页面组件
  };
}

// 静态生成（构建时执行）
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  
  return {
    props: { data },
    revalidate: 60, // 60 秒后重新生成
  };
}
```

### 2. 完整页面示例

```javascript
// pages/products/[id].js
import React from 'react';

export default function Product({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <span>${product.price}</span>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const res = await fetch(`https://api.example.com/products/${params.id}`);
  const product = await res.json();
  
  return {
    props: { product },
  };
}
```

## React 18 的 SSR 新特性

### 1. 流式渲染（Streaming）

React 18 引入了流式渲染，允许将 HTML 分块发送到客户端：

```javascript
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const stream = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      stream.pipe(res);
    },
    onError(error) {
      console.error(error);
      res.statusCode = 500;
      res.send('Internal Server Error');
    }
  });
});
```

### 2. Suspense 支持

React 18 的 SSR 支持 Suspense，可以实现选择性水合：

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Spinner />}>
        <Comments />
      </Suspense>
    </div>
  );
}
```

### 3. 选择性水合（Selective Hydration）

React 18 允许优先水合用户交互的部分，提升用户体验。

## 性能优化策略

### 1. 缓存策略

#### 页面级缓存

```javascript
// 使用 Redis 缓存渲染结果
import Redis from 'ioredis';
const redis = new Redis();

async function getCachedPage(key) {
  const cached = await redis.get(key);
  if (cached) return cached;
  
  const html = renderToString(<App />);
  await redis.setex(key, 300, html); // 5 分钟过期
  return html;
}
```

#### 组件级缓存

```javascript
import { cache } from 'react';

// 缓存组件渲染结果
const ExpensiveComponent = cache(function ExpensiveComponent({ data }) {
  // 复杂的计算逻辑
  return <div>{/* 渲染结果 */}</div>;
});
```

### 2. 流式渲染优化

```javascript
// 分块传输，优先发送重要内容
function App() {
  return (
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <header>导航栏</header>
        <main>
          <Suspense fallback={<Loading />}>
            <ImportantContent />
          </Suspense>
          <Suspense fallback={<Loading />}>
            <SecondaryContent />
          </Suspense>
        </main>
      </body>
    </html>
  );
}
```

### 3. 代码分割和懒加载

```javascript
import { lazy } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

### 4. 数据预取优化

```javascript
// 并行获取数据，避免瀑布流
export async function getServerSideProps() {
  const [posts, users] = await Promise.all([
    fetch('https://api.example.com/posts').then(r => r.json()),
    fetch('https://api.example.com/users').then(r => r.json())
  ]);
  
  return {
    props: { posts, users }
  };
}
```

## 常见问题与解决方案

### 1. 水合不匹配（Hydration Mismatch）

**问题**：服务器渲染的 HTML 与客户端渲染结果不一致。

**解决方案**：
```javascript
// 避免在组件中使用随机数或时间戳
function MyComponent() {
  // ❌ 错误：会导致水合不匹配
  const randomNum = Math.random();
  
  // ✅ 正确：只在客户端执行
  const [randomNum, setRandomNum] = useState(0);
  useEffect(() => {
    setRandomNum(Math.random());
  }, []);
  
  return <div>{randomNum}</div>;
}
```

### 2. 内存泄漏

**问题**：SSR 应用中常见的内存泄漏问题。

**解决方案**：
```javascript
// 正确清理定时器和事件监听器
useEffect(() => {
  const timer = setInterval(() => {
    // 定时器逻辑
  }, 1000);
  
  return () => clearInterval(timer); // 清理
}, []);
```

### 3. 性能瓶颈

**问题**：服务器渲染耗时过长。

**解决方案**：
- 使用缓存减少重复渲染
- 优化数据库查询
- 使用流式渲染
- 代码分割和懒加载

## 总结

### 关键点总结

1. **SSR 原理**：服务器预渲染 HTML → 客户端水合激活
2. **React 18 新特性**：流式渲染、Suspense 支持、选择性水合
3. **性能优化**：缓存策略、流式传输、代码分割
4. **最佳实践**：避免水合不匹配、合理使用数据获取方法

### 发展趋势

1. **React Server Components**：允许组件在服务器端运行，减少客户端 JavaScript 体积
2. **边缘计算**：将渲染工作分布到边缘节点，减少延迟
3. **更智能的缓存**：基于 AI 的缓存策略优化
4. **WebAssembly**：可能用于提升服务器端渲染性能
