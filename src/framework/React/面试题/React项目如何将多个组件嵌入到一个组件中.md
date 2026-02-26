# React 项目如何将多个组件嵌入到一个组件中?
在 React 里，“把多个组件塞进一个组件”本质上只有两种场景：  
1. 写死——**静态组合**（类似 Vue 的 slot）；  
2. 动态——**数据驱动渲染**（map、条件、懒加载）。  
面试时把“静态 + 动态 + 最佳实践”三层都答全，才能体现你对“组合 vs 继承”原则的掌握。

--------------------------------------------------
一、静态组合：90 % 日常需求
--------------------------------------------------
1. 普通嵌套（最常用）  
```jsx
function Page() {
  return (
    <Layout>
      <Header />      {/*  组件 1  */}
      <Main />        {/*  组件 2  */}
      <Footer />      {/*  组件 3  */}
    </Layout>
  );
}
```
React 推荐“**组合优于继承**”，`Layout` 直接用 `props.children` 即可：  
```jsx
function Layout({ children }) {
  return <div className="layout">{children}</div>;
}
```

2. 具名 slot（多插槽）  
```jsx
function Layout({ header, content, footer }) {
  return (
    <>
      <header>{header}</header>
      <main>{content}</main>
      <footer>{footer}</footer>
    </>
  );
}

<Layout
  header={<Header />}
  content={<Main />}
  footer={<Footer />}
/>
```
优势：父级可以**任意排序/条件渲染**子组件。

--------------------------------------------------
二、动态组合：数据驱动渲染
--------------------------------------------------
1. 列表 map  
```jsx
const tabs = [
  { id: 1, comp: <UserTab /> },
  { id: 2, comp: <OrderTab /> },
];

function TabContainer() {
  return tabs.map(item => <div key={item.id}>{item.comp}</div>);
}
```

2. 懒加载 + 代码分割  
```jsx
import { lazy, Suspense } from 'react';
const HeavyA = lazy(() => import('./HeavyA'));
const HeavyB = lazy(() => import('./HeavyB'));

function Container() {
  return (
    <Suspense fallback={<Spin />}>
      <HeavyA />
      <HeavyB />
    </Suspense>
  );
}
```

3. 条件渲染  
```jsx
function Dashboard({ user }) {
  return (
    <>
      {user.isVip && <VipPanel />}   {/* 短路 */}
      <NormalPanel />
    </>
  );
}
```

--------------------------------------------------
三、进阶：把“组件数组”当数据流
--------------------------------------------------
有时后端直接返回“组件名”字符串，前端映射成真实组件：  
```jsx
const widgetMap = {
  Banner: Banner,
  ProductList: ProductList,
};

function Page({ schema }) {
  return schema.map(item => {
    const Comp = widgetMap[item.type];
    return <Comp key={item.id} {...item.props} />;
  });
}
```
这是低代码平台核心思路，**用 JSON 描述 UI**。

--------------------------------------------------
四、最佳实践速记（面试金句）
--------------------------------------------------
1. 永远优先 `props.children` 或“组件作为 props”——符合 React 组合哲学。  
2. 需要复用逻辑→ 抽**自定义 Hook**；需要复用 UI→ 抽**组件**；不要继承。  
3. 列表必须带 `key`，且**稳定唯一**；动态组件配合 `lazy` 做分割，减少首屏包体。  
4. 把“是否渲染”决策放在**父级**，子组件保持纯净，易测易缓存。

--------------------------------------------------
一句话收尾  
“在 React 里，**组件就是一等公民的函数/类**，你可以像数据一样到处传递、条件渲染、懒加载；只要记住‘组合优于继承’，就能把任意多个组件无缝嵌入到任何一个父组件中。”
1)使用 React.memo
对于纯展示型的组件，可以使用 React.memo 避免不必要的重渲染
2)懒加载组件:
对于不是立即需要的组件，可以使用 React.lazy 进行懒加载