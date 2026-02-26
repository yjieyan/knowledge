# Vue 虚拟DOM和Diff算法

## 虚拟 DOM 

### 什么是虚拟 DOM

虚拟 DOM 是一个轻量级的 JavaScript 对象，它是真实 DOM 的抽象表示。

```javascript
// 真实 DOM 节点
<div id="app" class="container">
  <h1>Hello World</h1>
  <p>This is content</p>
</div>

// 对应的虚拟 DOM 对象
{
  tag: 'div',
  data: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      tag: 'h1',
      data: {},
      children: ['Hello World']
    },
    {
      tag: 'p', 
      data: {},
      children: ['This is content']
    }
  ]
}
```

### 虚拟 DOM 的数据结构

#### VNode 类定义

```javascript
class VNode {
  constructor(
    tag,           // 标签名
    data,          // 属性数据
    children,      // 子节点
    text,          // 文本内容
    elm,           // 对应的真实 DOM
    context,       // Vue 组件实例
    componentOptions // 组件选项
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.functionalContext = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false    // 静态节点标记
    this.isRootInsert = true
    this.isComment = false   // 注释节点
    this.isCloned = false    // 克隆节点
    this.isOnce = false      // v-once 节点
  }
  
  get child() {
    return this.componentInstance
  }
}
```

#### 不同类型的 VNode

```javascript
// 1. 元素节点
const elementVNode = {
  tag: 'div',
  data: { class: 'container' },
  children: [/* 子节点 */],
  elm: null
}

// 2. 文本节点
const textVNode = {
  tag: undefined,
  data: undefined,
  children: undefined,
  text: 'Hello World',
  elm: null
}

// 3. 注释节点
const commentVNode = {
  tag: undefined,
  data: undefined,
  children: undefined,
  text: 'comment',
  elm: null,
  isComment: true
}

// 4. 组件节点
const componentVNode = {
  tag: 'vue-component-1-app',
  data: {
    hook: { /* 生命周期钩子 */ }
  },
  children: undefined,
  text: undefined,
  elm: null,
  componentInstance: appInstance,
  componentOptions: { /* 组件配置 */ }
}

// 5. 空节点
const emptyVNode = {
  tag: undefined,
  data: undefined,
  children: undefined,
  text: '',
  elm: null
}
```

### 虚拟 DOM 的创建过程

#### Vue 编译过程

```javascript
// 模板 -> 渲染函数 -> 虚拟 DOM -> 真实 DOM
const template = `
  <div id="app">
    <h1>{{ title }}</h1>
    <ul>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
`

// 编译后的渲染函数
function render() {
  with(this) {
    return _c('div', { attrs: { "id": "app" } }, [
      _c('h1', [_v(_s(title))]),
      _c('ul', _l((items), function(item) {
        return _c('li', { key: item.id }, [_v(_s(item.name))])
      }), 0)
    ])
  }
}

// 渲染函数对应的创建函数
function _c(tag, data, children) {
  return createElement(this, tag, data, children)
}

function _v(text) {
  return createTextVNode(text)
}

function _s(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val)
}

function _l(val, render) {
  // 渲染列表
}
```

#### createElement 详细实现

```javascript
function createElement(
  context,  // 组件上下文
  tag,      // 标签名
  data,     // 数据对象
  children, // 子节点
  normalizationType, // 规范化类型
  alwaysNormalize    // 是否总是规范化
) {
  // 参数处理
  if (Array.isArray(data) || typeof data === 'string') {
    normalizationType = children
    children = data
    data = undefined
  }
  
  // 调用 _createElement
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement(context, tag, data, children, normalizationType) {
  // 1. 数据对象响应式处理
  if (data && data.__ob__) {
    return createEmptyVNode()
  }
  
  // 2. 动态组件处理
  if (typeof tag === 'string') {
    let Ctor
    if (config.isReservedTag(tag)) {
      // 平台原生标签
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 组件
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // 未知标签
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // 组件构造函数
    vnode = createComponent(tag, data, context, children)
  }
  
  // 3. 返回 VNode
  if (Array.isArray(vnode)) {
    return vnode
  } else if (vnode) {
    // 处理命名空间
    if (vnode.ns) applyNS(vnode, false)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```

### 虚拟 DOM 的优势

#### 1. 性能优化

```javascript
// 直接操作 DOM 的性能问题
function updateDOMDirectly() {
  // ❌ 性能低下：每次数据变化都直接操作 DOM
  for (let i = 0; i < 1000; i++) {
    const element = document.getElementById(`item-${i}`)
    element.textContent = newData[i]
    element.className = `item ${newData[i].status}`
  }
}

// 使用虚拟 DOM 的优化
function updateWithVirtualDOM() {
  // ✅ 批量更新：先在内存中计算，再批量更新到 DOM
  const newVNode = createVNodeFromData(newData)
  const patches = diff(oldVNode, newVNode)
  patch(realDOM, patches) // 一次性应用所有变更
}
```

#### 2. 跨平台能力

```javascript
// 浏览器平台
const browserDOM = {
  createElement(tag) {
    return document.createElement(tag)
  },
  
  setElementText(el, text) {
    el.textContent = text
  },
  
  insertBefore(parent, el, ref) {
    parent.insertBefore(el, ref)
  }
}

// 小程序平台  
const weappDOM = {
  createElement(tag) {
    return { tag, attributes: {}, children: [] }
  },
  
  setElementText(node, text) {
    node.textContent = text
  },
  
  insertBefore(parent, node, ref) {
    // 小程序特定的插入逻辑
  }
}

// 服务端渲染
const serverDOM = {
  createElement(tag) {
    return { tag, attributes: {} }
  },
  
  setElementText(node, text) {
    node.children = [text]
  },
  
  insertBefore() {
    // 服务端不需要实际插入操作
  }
}
```

## Diff 算法深度解析

### Diff 算法的核心思想

#### 传统 Diff 算法的问题

```javascript
// 传统树比较算法：O(n^3) 时间复杂度
function traditionalDiff(oldTree, newTree) {
  // 遍历所有节点组合，计算最小编辑距离
  // 时间复杂度太高，不适合前端场景
}
```

#### Vue 的优化策略

Vue 的 Diff 算法通过以下假设将复杂度降低到 **O(n)**：

1. **相同类型的元素具有相似的结构**
2. **通过 key 跟踪节点的身份**
3. **同一层级的节点进行比较**

### Diff 算法流程

#### patch 函数 - 入口点

```javascript
//
function patch(oldVnode, vnode, hydrating, removeOnly) {
  // 1. 如果没有新节点，只有旧节点，则销毁
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }

  let isInitialPatch = false
  const insertedVnodeQueue = []

  // 2. 如果没有旧节点，只有新节点，则创建
  if (isUndef(oldVnode)) {
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue)
  } else {
    // 3. 新旧节点都存在，进行比较
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // 相同节点，进行精细化比较
      patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
    } else {
      // 不同节点，替换操作
      if (isRealElement) {
        // 服务端渲染相关处理
        oldVnode = emptyNodeAt(oldVnode)
      }
      
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)
      
      // 创建新节点
      createElm(
        vnode,
        insertedVnodeQueue,
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )
      
      // 销毁旧节点
      if (isDef(parentElm)) {
        removeVnodes(parentElm, [oldVnode], 0, 0)
      } else if (isDef(oldVnode.tag)) {
        invokeDestroyHook(oldVnode)
      }
    }
  }
  
  // 调用插入钩子
  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```

#### sameVnode - 判断是否为相同节点

```javascript
function sameVnode(a, b) {
  return (
    // 1. key 相同
    a.key === b.key && (
      (
        // 2. 标签相同
        a.tag === b.tag &&
        // 3. 都是或都不是注释节点
        a.isComment === b.isComment &&
        // 4. 数据定义相同（都有data或都没有data）
        isDef(a.data) === isDef(b.data) &&
        // 5. 相同的输入类型（checkbox、radio等）
        sameInputType(a, b)
      ) || (
        // 6. 异步工厂函数相同
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType(a, b) {
  // 处理 input 元素的特殊类型比较
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
  return typeA === typeB
}
```

#### patchVnode - 节点更新

```javascript
function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  // 1. 如果新旧节点完全相同，直接返回
  if (oldVnode === vnode) return

  const elm = vnode.elm = oldVnode.elm

  // 2. 处理异步组件
  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
    } else {
      vnode.isAsyncPlaceholder = true
    }
    return
  }

  // 3. 复用静态节点
  if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
    vnode.componentInstance = oldVnode.componentInstance
    return
  }

  let i
  const data = vnode.data
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode)
  }

  const oldCh = oldVnode.children
  const ch = vnode.children

  // 4. 更新属性
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
  }

  // 5. 处理子节点
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      // 新旧都有子节点，进行 diff
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      // 只有新节点有子节点，添加
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      // 只有旧节点有子节点，删除
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      // 都没有子节点，但旧节点有文本，清空
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    // 6. 文本节点更新
    nodeOps.setTextContent(elm, vnode.text)
  }
  
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
  }
}
```

### updateChildren - 核心 Diff 算法

```javascript
function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm

  // 可以移除的标记
  const canMove = !removeOnly

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      // 旧开始节点为空，向右移动
      oldStartVnode = oldCh[++oldStartIdx]
    } else if (isUndef(oldEndVnode)) {
      // 旧结束节点为空，向左移动
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 情况1：旧开始 vs 新开始
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 情况2：旧结束 vs 新结束
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 情况3：旧开始 vs 新结束
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 情况4：旧结束 vs 新开始
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      // 情况5：都不匹配，使用 key 映射查找
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
      
      if (isUndef(idxInOld)) {
        // 新节点，创建
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
      } else {
        // 找到可复用的节点
        vnodeToMove = oldCh[idxInOld]
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
        } else {
          // 相同key但不同元素，创建新元素
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        }
      }
      newStartVnode = newCh[++newStartIdx]
    }
  }

  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 旧节点遍历完，添加剩余新节点
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
    // 新节点遍历完，删除剩余旧节点
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}
```

### Key 的重要性

#### 没有 key 的 Diff

```javascript
// 没有 key 的情况
const oldChildren = [
  { tag: 'div', text: 'A' },
  { tag: 'div', text: 'B' }, 
  { tag: 'div', text: 'C' }
]

const newChildren = [
  { tag: 'div', text: 'D' },  // 直接替换 A
  { tag: 'div', text: 'A' },  // 直接替换 B
  { tag: 'div', text: 'B' },  // 直接替换 C
  { tag: 'div', text: 'C' }   // 新建
]

// 操作：3次替换 + 1次创建
```

#### 有 key 的 Diff

```javascript
// 有 key 的情况
const oldChildren = [
  { tag: 'div', key: 1, text: 'A' },
  { tag: 'div', key: 2, text: 'B' },
  { tag: 'div', key: 3, text: 'C' }
]

const newChildren = [
  { tag: 'div', key: 4, text: 'D' },  // 新建
  { tag: 'div', key: 1, text: 'A' },  // 复用
  { tag: 'div', key: 2, text: 'B' },  // 复用  
  { tag: 'div', key: 3, text: 'C' }   // 复用
]

// 操作：1次创建 + 2次移动
```

### 性能优化策略

#### 1. 静态节点提升

```javascript
// 编译前
const template = `
  <div>
    <h1>Static Title</h1>
    <p>{{ dynamicContent }}</p>
  </div>
`

// 编译后
const hoistedStaticTree = _c('div', [
  _c('h1', [_v("Static Title")])  // 静态节点被提升
])

function render() {
  with(this) {
    return _m(0, true)  // 引用静态树
      .concat([_c('p', [_v(_s(dynamicContent))])])
  }
}
```

#### 2. 事件缓存

```javascript
// 编译前
<button @click="handleClick">Click</button>

// 编译后  
function render() {
  with(this) {
    return _c('button', {
      on: {
        "click": function($event) {
          handleClick($event)
        }
      }
    }, [_v("Click")])
  }
}

// 优化后 - 事件被缓存
function render() {
  with(this) {
    return _c('button', {
      on: {
        "click": cache[0] || (cache[0] = function($event) {
          handleClick($event)
        })
      }
    }, [_v("Click")])
  }
}
```

## 实际应用场景

### 列表渲染优化

```javascript
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
    }
  },
  
  methods: {
    reverseItems() {
      this.items.reverse()
      // 有 key：移动现有 DOM 元素
      // 无 key：重新创建所有元素
    },
    
    addItem() {
      this.items.unshift({ id: Date.now(), name: 'New Item' })
      // 有 key：在开头插入新元素
      // 无 key：更新所有元素内容
    }
  },
  
  render() {
    return this.$createElement('div', 
      this.items.map(item => 
        this.$createElement('div', {
          key: item.id  // ✅ 正确的 key 使用
        }, item.name)
      )
    )
  }
}
```

### 条件渲染优化

```javascript
export default {
  data() {
    return {
      showA: true,
      showB: false
    }
  },
  
  render() {
    // 使用 key 强制重新创建组件
    return this.$createElement('div', [
      this.showA ? this.$createElement(ComponentA, {
        key: 'component-a'  // ✅ 切换时完全重新创建
      }) : null,
      
      this.showB ? this.$createElement(ComponentB, {
        key: 'component-b'  // ✅ 避免状态复用
      }) : null
    ])
  }
}
```

## 调试与性能分析

### 虚拟 DOM 快照

```javascript
// 获取虚拟 DOM 结构
const vnode = this._vnode
console.log(JSON.stringify(vnode, null, 2))

// 自定义渲染函数用于调试
function createDebugElement(tag, data, children) {
  const vnode = createElement.apply(null, arguments)
  
  // 添加调试信息
  vnode.debugId = generateDebugId()
  vnode.createdAt = Date.now()
  
  console.log('创建 VNode:', {
    debugId: vnode.debugId,
    tag: vnode.tag,
    data: vnode.data,
    children: vnode.children ? vnode.children.length : 0
  })
  
  return vnode
}
```

### 性能监控

```javascript
// Diff 性能监控
function monitoredPatch(oldVnode, vnode) {
  const startTime = performance.now()
  
  const result = originalPatch.call(this, oldVnode, vnode)
  
  const duration = performance.now() - startTime
  if (duration > 16) { // 超过一帧的时间
    console.warn(`Patch 耗时: ${duration}ms`, {
      oldVnode,
      vnode
    })
  }
  
  return result
}

// 替换原始方法
Vue.prototype.__patch__ = monitoredPatch
```

## 总结

### 虚拟 DOM 的核心价值

1. **抽象层**：提供与平台无关的 UI 描述
2. **性能优化**：批量 DOM 操作，减少重排重绘
3. **开发体验**：声明式编程，关注数据而非 DOM 操作

### Diff 算法的关键优化

1. **同层比较**：将 O(n³) 复杂度降为 O(n)
2. **双端比较**：四种特殊情况的高效处理
3. **Key 优化**：基于 key 的节点复用策略
4. **批量更新**：异步更新队列避免频繁操作

### 最佳实践

1. **合理使用 key**：为列表项提供稳定唯一的 key
2. **避免深层嵌套**：减少 Diff 的递归深度
3. **合理拆分组件**：利用组件边界限制 Diff 范围
4. **使用静态提升**：充分利用编译时优化
