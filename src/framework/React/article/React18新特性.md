# React18 新特性

## 1. [并发渲染（Concurrent Rendering）](./React18新特性-并发渲染.md)
- **核心**：React 可以在后台“暂停-恢复”渲染工作，不阻塞主线程。  
- **启用方式**：使用 `createRoot` 代替 `ReactDOM.render` 即自动具备并发能力。  
- **收益**：大型列表、 tabs 切换等场景下 UI 不再卡顿 。

---

## 2. 自动批处理（Automatic Batching）（[React18新特性-自动批处理](./React18新特性-自动批处理.md)）
- **旧版**：只在 React 事件内批处理；**18** 以后，`setTimeout` / `fetch` / `Promise.then` 等异步回调里的多次 `setState` 也会被自动合并为一次渲染。  
- **数据**：实测可减少 30–40% 的渲染次数 。  
- **关闭**：必要时用 `flushSync` 强制同步。

---

## 3. 新 API：startTransition / useTransition
- **作用**：把“非紧急”更新标记为可中断的 transition，例如搜索框输入（紧急）与搜索结果列表（非紧急）。  
- **代码**：
  ```jsx
  import { startTransition } from 'react';
  function onInput(e) {
    const v = e.target.value;
    startTransition(() => setSearchQuery(v)); // 可中断
  }
  ```
- **配套 Hook**：`useTransition` 返回 `[isPending, startTransition]`，可显示 loading 状态 。

---

## 4. useDeferredValue
- **场景**：延迟渲染昂贵子树，如实时搜索联想、图表。  
- **用法**：
  ```jsx
  const deferredQuery = useDeferredValue(query);
  // 用 deferredQuery 渲染大数据列表，原始 query 控制输入框
  ```
- **效果**：用户输入保持 60 fps，列表在空闲时更新 。

---

## 5. Suspense 重大升级
| 能力 | React 17 | React 18 |
|---|---|---|
| 仅代码分割 | ✅ | ✅ |
| 服务端流式渲染 | ❌ | ✅ |
| 选择性水合 | ❌ | ✅ |
| 与 data-fetching 库官方集成 | ❌ | ✅（Relay、Next.js 13+、TanStack Query 4+） |

- **流式 SSR**：允许“边渲染边传输”，首屏 HTML 分块到达，浏览器可渐进解析，FCP 提前 20–40% 。  
- **选择性水合**：优先水合用户正在交互的区域，其余部分按需水合，页面可交互时间再缩短 30% 以上 。

---

## 6. 全新 SSR 架构
| API | 旧 | 新 |
|---|---|---|
| 渲染函数 | `renderToString` | `renderToPipeableStream`（Node）<br>`renderToReadableStream`（Edge） |
| 输出 | 完整 HTML 字符串 | 可分块写入的 Stream |
| 水合 | 全部完成才能交互 | 可部分水合，可中断与恢复 |
| 错误边界 | 无 | 服务端 ErrorBoundary 捕获渲染错误，降级展示  |

- **实战**（Next.js 13+ / 自搭建 Node 服务）：
  ```jsx
  import { renderToPipeableStream } from 'react-dom/server';
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.statusCode = 200;
      pipe(res);
    },
    onError(x) { res.statusCode = 500; res.end('Error'); }
  });
  ```

---

## 7. 新 Root API
- `createRoot`：替换 `ReactDOM.render`，启用并发特性。  
- `hydrateRoot`：替换 `ReactDOM.hydrate`，支持选择性水合与错误恢复。  
- **升级命令**：
  ```bash
  npm i react@latest react-dom@latest
  ```
  ```jsx
  // 客户端入口
  import { createRoot } from 'react-dom/client';
  createRoot(document.getElementById('root')).render(<App />);
  ```

---

## 8. 面向未来的实验特性
- **Server Components**（React 18 已提供试验版，Next.js 13 App Router 默认集成）：组件在服务器运行，零打包体积，可直接读数据库。  
- **use() Hook**（18.3 预览）：可在组件顶层 `use(promise)`，官方数据取回方案，告别“瀑布”请求。  
- **Offscreen**（19 预览）：后台预渲染路由，切换无白屏。

---

## 9. 升级 checklist（2025 年生产经验）
1. 先跑 `npx react-codemod update-react-import` 自动重写 import。  
2. 把 `ReactDOM.render` → `createRoot`；`hydrate` → `hydrateRoot`。  
3. 检查三方库：Redux ≥8、React Router ≥6.4、Ant Design ≥5 已官方兼容。  
4. 流式 SSR 需 Node ≥16；部署到 Vercel/Netlify 函数组需确认 Edge Runtime 支持 `ReadableStream`。  
5. 自动化测试：`@testing-library/react` ≥13 才识别 `createRoot`；CI 里加 `--ci` 防止并发调度导致用例 flaky。

---

## 10. 总结
React 18 通过“并发 + 流式 + 选择性水合”三把斧，把**首屏可交互时间**和**大型应用响应性**同时推向前所未有的高度；
**无需重写业务代码**，按模块渐进升级即可立即享受性能红利 。