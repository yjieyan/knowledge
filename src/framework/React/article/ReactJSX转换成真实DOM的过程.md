# ReactJSX转换成真实DOM的过程

---
一、总览

```
JSX
  ├─ 1. 编译期：@babel/preset-react 把 JSX 转成 React.createElement
  ├─ 2. 运行时：createElement 返回虚拟 DOM 对象（ReactElement）
  ├─ 3. Reconciler：Fiber 双树 diff，生成 WIP 树 & 更新队列
  ├─ 4. Scheduler：Lane 模型 + 时间切片，可中断调度
  ├─ 5. Renderer：commit 阶段一次性把 Fiber 树→DOM 树
  ├─ 6. 副作用：Layout → Passive 生命周期 / Hook
  └─ 7. 浏览器：Reflow & Paint，用户看到像素
```

---
二、分阶段详解

1. 编译期（静态）  
   源码：无，发生在 webpack/vite 阶段。  
   输入：
   ```jsx
   const App = () => <div id="box">Hello</div>;
   ```
   输出（@babel/preset-react）：
   ```js
   const App = () => React.createElement("div", { id: "box" }, "Hello");
   ```

2. 创建虚拟 DOM  
   源码：react/packages/react/src/ReactElement.js  
   关键函数：`ReactElement(type, key, ref, props)`  
   返回值示例：
   ```js
   {
     $$typeof: Symbol(react.element),
     type: "div",
     key: null,
     ref: null,
     props: { id: "box", children: "Hello" }
   }
   ```

3. Reconciler 工作（Fiber 架构）  
   源码：react/packages/react-reconciler/src/ReactFiberWorkLoop.js  
   - 首次渲染：`performUnitOfWork` → 深度优先构造 WIP Fiber 节点  
   - 更新场景：`diffProperties` 生成 `UpdateQueue`（标记新增/删除/移动）  
   - 双树指针：current（显示中）↔ workInProgress（后台构建）

4. Scheduler 调度  
   源码：react/packages/scheduler/src/forks/Scheduler.js  
   - 每个 Fiber 工作单元执行前调用 `shouldYield()`  
   - 若帧剩余时间 < 1 ms 或更高优 Lane 插队 → `postMessage` 让出主线程  
   - 时间切片默认值 5 ms，可动态调整

5. Renderer 提交（commit 阶段 **不可中断**）  
   源码：react/packages/react-dom/src/client/ReactDOMHostConfig.js  
   三部曲：
   1. before mutation（Snapshot）  
   2. mutation（DOM 增删改）  
      - `createInstance` → `document.createElement`  
      - `appendChild` / `removeChild` / `commitTextUpdate`  
   3. layout（useLayoutEffect / ref 回调）

6. 生命周期 / Hook  
   - 同步：componentDidMount / useLayoutEffect  
   - 异步：useEffect（Passive 阶段，可延迟到浏览器 paint 后）

7. 浏览器渲染  
   - Reflow → Paint → Composite（层合成）  
   - 用户看到像素，此时 `performance.getEntriesByType('paint')[0].startTime` 即 FCP

---
三、调试技巧：把“黑盒”变“白盒”

1. React DevTools Profiler  
   - 录制一次点击，观察 `commit` 条形图数量（批处理后会变少）  
   - 橙色块表示长时间 commit，可定位大列表或重计算

2. performance 面板  
   - 勾选“CPU 4× 降速”模拟低端机  
   - 搜索 `performUnitOfWork`，可看时间切片是否生效（<=5 ms）

3. 源码映射  
   ```bash
   git clone https://github.com/facebook/react
   npm run build -- --type=NODE_DEV
   ```
   用 VSCode `launch.json` 把 `webpack://` 映射到本地 react 包，可断点看 Fiber 节点

4. 打印虚拟 DOM  
   ```js
   import { jsx } from 'react/jsx-runtime';
   console.log(jsx('div', { id: 'box' }, 'Hello'));
   ```

---
四、面试版 30 秒口诀

> “JSX 先被 Babel 拍成 createElement，拿到虚拟 DOM；  
> Reconciler 用 Fiber 双树 diff 出更新队列，Scheduler 按 Lane + 时间切片可中断地调度；  
> commit 阶段一口气把 Fiber → DOM，Layout/Passive 跑生命周期，最后浏览器 Reflow-Paint 出像素。”

---
五、常见追问

1. **为什么 commit 不能中断？**  
   防止 DOM 半拉子状态，保证一致性 & 回滚复杂度可控。

2. **Lane 与 expirationTime 区别？**  
   Lane 用位掩码，支持批量优先级查询；expirationTime 已废弃，精度低。

3. **Key 的作用？**  
   在 diff 阶段判断子节点是否可复用，减少 DOM 创建/删除。

4. **Concurrent 会创建多线程吗？**  
   不会，仍是单线程 JS；通过“让出主线程”模拟并发。
