# React中Component和PureComponent 有什么区别?
在 React 中，`Component` 与 `PureComponent` 的差异只有一句话：  
**后者默认帮你做了一层“浅比较”的 `shouldComponentUpdate`**。  
但面试时只抛这句话等于“送命”，下面从“源码 → 场景 → 陷阱 → 实战”四个维度拆给你看，答完直接锁 offer。

--------------------------------------------------
1. 源码级差异（一句话背住）
--------------------------------------------------
```js
// React 16.8.6 源码
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater;
}
PureComponent.prototype = Object.create(Component.prototype);
PureComponent.prototype.constructor = PureComponent;
PureComponent.prototype.shouldComponentUpdate = shallowEqual; // ←核心
```
`shallowEqual` 会对 `props` 和 `state` 做**浅比较**，返回 `false` 才触发更新；  
`Component` 默认返回 `true`，即“永远更新”。

--------------------------------------------------
2. 何时用谁？一张表搞定
--------------------------------------------------
| 场景 | Component | PureComponent |
|------|-----------|---------------|
| 根组件/必然更新 | ✅ | ❌（浅比较反而浪费） |
| 叶子组件 & props/state 扁平 | ❌ | ✅（跳过无效渲染） |
| props 含函数/对象字面量 | ❌ | ❌（每次引用不同，浅比较失效） |
| 需要手动控制 sCU | ✅ | ❌（内置 sCU 不可覆盖） |

--------------------------------------------------
3. 面试最爱挖坑：3 个“浅比较”必挂场景
--------------------------------------------------
1. 父级 render 里写箭头函数  
   ```jsx
   <Foo onClick={() => {}} />   // 每次引用不同 → 永远失效
   ```
2. 对象/数组字面量  
   ```jsx
   <Bar style={{ color: 'red' }} />  // 同上
   ```
3. 子组件内部修改深层 state  
   ```jsx
   this.state.list.push(1); this.setState({ list }); // 引用没变 → 不更新
   ```

--------------------------------------------------
4. 实战口诀（背下来就能收尾）
--------------------------------------------------
“**函数传引用，对象先常量；深拷贝用 immutable，或 memo 做补丁。**”  
真遇到复杂结构，直接：  
- ① 提状态到公共父级  
- ② 用 `useMemo`/`React.memo` 在函数组件里做精确缓存  
- ③ 或重写 `shouldComponentUpdate` 做深比较（性能换正确性）

--------------------------------------------------
5. 一句话总结（面试金句）
--------------------------------------------------
“`PureComponent` 就是自带**浅比较**的 `Component`，能省掉 30 %～70 % 的无用渲染，但前提是保证**引用稳定**；一旦 props 出现**内联函数或字面量**，它反而比 `Component` 更慢。”


Component在默认情况下，当组件的props或state发生变化时，组件都会重新染，需要手动实现shouldComponentUpdate方法来优化性能，而PureComponent内置了一个shouldComponentUpdate方法，会对props和state进行浅比较，只有在数据发生变化时才会重新染，可以减少不必要的渲染，提升性能