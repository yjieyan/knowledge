# 虚拟 DOM 跨平台能力

## 跨平台架构设计

### 核心架构分层

```javascript
// 跨平台架构分层示意图
/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   业务逻辑层 (Business Logic)                 │
 * │   Vue Components / React Components / 其他前端框架组件         │
 * └─────────────────────────────────────────────────────────────┘
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   虚拟 DOM 层 (Virtual DOM)                   │
 * │   统一的节点描述、Diff算法、更新调度                           │
 * └─────────────────────────────────────────────────────────────┘
 * ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
 * │   DOM 渲染器     │ │   小程序渲染器   │ │   Native 渲染器      │
 * │  (Web Platform) │ │ (Wechat/Alipay) │ │ (React Native/Weex) │
 * └─────────────────┘ └─────────────────┘ └─────────────────────┘
 */
```

### 平台抽象接口设计

```typescript
// 平台抽象接口定义
interface PlatformRenderer {
  // 节点操作
  createElement(tag: string, data?: VNodeData): PlatformNode;
  createTextNode(text: string): PlatformNode;
  createComment(text: string): PlatformNode;
  
  // 节点属性操作
  setAttribute(node: PlatformNode, key: string, value: any): void;
  removeAttribute(node: PlatformNode, key: string): void;
  setStyle(node: PlatformNode, styles: Record<string, any>): void;
  
  // 节点树操作
  appendChild(parent: PlatformNode, child: PlatformNode): void;
  insertBefore(parent: PlatformNode, child: PlatformNode, ref: PlatformNode): void;
  removeChild(parent: PlatformNode, child: PlatformNode): void;
  replaceChild(parent: PlatformNode, newChild: PlatformNode, oldChild: PlatformNode): void;
  
  // 事件系统
  addEventListener(node: PlatformNode, event: string, handler: Function): void;
  removeEventListener(node: PlatformNode, event: string, handler: Function): void;
  
  // 生命周期
  nextTick(callback: Function): void;
  destroy(): void;
}

// 虚拟节点数据接口
interface VNodeData {
  attrs?: Record<string, any>;
  props?: Record<string, any>;
  on?: Record<string, Function | Function[]>;
  style?: Record<string, any>;
  class?: any;
  key?: string | number;
  ref?: string;
  // 平台特定扩展
  [key: string]: any;
}
```

## 多平台渲染器实现

### Web 平台渲染器

```javascript
// web/platform.js
class WebPlatformRenderer {
  constructor(options = {}) {
    this.document = options.document || window.document;
    this.createElement = this.createElement.bind(this);
    this.createTextNode = this.createTextNode.bind(this);
  }
  
  createElement(tag, data = {}) {
    const element = this.document.createElement(tag);
    
    // 处理属性
    if (data.attrs) {
      for (const [key, value] of Object.entries(data.attrs)) {
        element.setAttribute(key, value);
      }
    }
    
    // 处理样式
    if (data.style) {
      for (const [key, value] of Object.entries(data.style)) {
        element.style[key] = value;
      }
    }
    
    // 处理类名
    if (data.class) {
      if (typeof data.class === 'string') {
        element.className = data.class;
      } else if (Array.isArray(data.class)) {
        element.className = data.class.join(' ');
      } else if (typeof data.class === 'object') {
        element.className = Object.keys(data.class)
          .filter(key => data.class[key])
          .join(' ');
      }
    }
    
    // 处理事件
    if (data.on) {
      for (const [event, handler] of Object.entries(data.on)) {
        const eventName = event.startsWith('on') ? event.slice(2) : event;
        element.addEventListener(eventName, handler);
      }
    }
    
    return element;
  }
  
  createTextNode(text) {
    return this.document.createTextNode(text);
  }
  
  createComment(text) {
    return this.document.createComment(text);
  }
  
  appendChild(parent, child) {
    parent.appendChild(child);
  }
  
  insertBefore(parent, child, ref) {
    parent.insertBefore(child, ref);
  }
  
  removeChild(parent, child) {
    parent.removeChild(child);
  }
  
  setAttribute(node, key, value) {
    node.setAttribute(key, value);
  }
  
  addEventListener(node, event, handler) {
    node.addEventListener(event, handler);
  }
  
  nextTick(callback) {
    // 使用微任务或 requestAnimationFrame
    if (typeof Promise !== 'undefined') {
      Promise.resolve().then(callback);
    } else {
      setTimeout(callback, 0);
    }
  }
}

// 使用示例
const webRenderer = new WebPlatformRenderer();
const virtualDOM = createVNode('div', { class: 'container' }, [
  createVNode('h1', { style: { color: 'red' } }, ['Hello Web']),
  createVNode('button', { 
    on: { click: () => console.log('clicked') } 
  }, ['Click Me'])
]);

const realDOM = webRenderer.patch(null, virtualDOM);
document.body.appendChild(realDOM);
```

### 小程序平台渲染器

```javascript
// miniprogram/platform.js
class MiniProgramPlatformRenderer {
  constructor(options = {}) {
    this.Page = options.Page || global.Page;
    this.Component = options.Component || global.Component;
    this.currentPage = null;
    this.components = new Map();
  }
  
  createElement(tag, data = {}) {
    // 小程序中的元素表示为数据对象
    const element = {
      tag,
      attributes: {},
      style: {},
      class: '',
      children: [],
      events: {}
    };
    
    // 处理属性
    if (data.attrs) {
      element.attributes = { ...data.attrs };
    }
    
    // 处理样式
    if (data.style) {
      element.style = { ...data.style };
    }
    
    // 处理类名
    if (data.class) {
      element.class = this.normalizeClass(data.class);
    }
    
    // 处理事件
    if (data.on) {
      for (const [event, handler] of Object.entries(data.on)) {
        const eventName = this.normalizeEventName(event);
        element.events[eventName] = handler;
      }
    }
    
    return element;
  }
  
  createTextNode(text) {
    return {
      type: 'text',
      text: String(text)
    };
  }
  
  normalizeClass(classValue) {
    if (typeof classValue === 'string') return classValue;
    if (Array.isArray(classValue)) return classValue.join(' ');
    if (typeof classValue === 'object') {
      return Object.keys(classValue)
        .filter(key => classValue[key])
        .join(' ');
    }
    return '';
  }
  
  normalizeEventName(event) {
    // 转换事件名：click -> tap, input -> input
    const eventMap = {
      'click': 'tap',
      'touchstart': 'touchstart',
      'touchend': 'touchend',
      'input': 'input',
      'change': 'change'
    };
    return eventMap[event] || event;
  }
  
  // 小程序特有的页面创建方法
  createPage(virtualDOM, options = {}) {
    const pageData = this.compileVirtualDOM(virtualDOM);
    
    this.Page({
      data: {
        virtualDOM: pageData
      },
      ...options,
      
      // 事件处理
      handleEvent: function(event) {
        const { type, currentTarget } = event;
        const handler = currentTarget.dataset.handler;
        if (handler && this[handler]) {
          this[handler](event);
        }
      }
    });
  }
  
  compileVirtualDOM(vnode) {
    if (!vnode) return null;
    
    const result = {
      tag: vnode.tag,
      attributes: vnode.data?.attrs || {},
      style: vnode.data?.style || {},
      class: this.normalizeClass(vnode.data?.class),
      children: []
    };
    
    // 处理事件
    if (vnode.data?.on) {
      result.events = {};
      for (const [event, handler] of Object.entries(vnode.data.on)) {
        result.events[this.normalizeEventName(event)] = {
          handler: `_event_${event}`
        };
      }
    }
    
    // 递归处理子节点
    if (vnode.children) {
      result.children = vnode.children.map(child => {
        if (typeof child === 'string') {
          return this.createTextNode(child);
        }
        return this.compileVirtualDOM(child);
      });
    }
    
    return result;
  }
  
  nextTick(callback) {
    // 小程序中使用 nextTick
    if (typeof wx !== 'undefined' && wx.nextTick) {
      wx.nextTick(callback);
    } else {
      setTimeout(callback, 0);
    }
  }
}

// 使用示例
const miniProgramRenderer = new MiniProgramPlatformRenderer();
const virtualDOM = createVNode('view', { class: 'container' }, [
  createVNode('text', { style: { color: 'red' } }, ['Hello MiniProgram']),
  createVNode('button', { 
    on: { tap: () => console.log('tapped') } 
  }, ['Tap Me'])
]);

miniProgramRenderer.createPage(virtualDOM, {
  onLoad() {
    console.log('页面加载');
  }
});
```

### React Native 渲染器

```javascript
// react-native/platform.js
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

class ReactNativePlatformRenderer {
  constructor() {
    this.components = new Map();
    this.styleSheet = StyleSheet.create({});
  }
  
  createElement(tag, data = {}) {
    // React Native 元素映射
    const tagMap = {
      'div': View,
      'span': Text,
      'button': TouchableOpacity,
      'text': Text,
      'view': View,
      'img': Image
    };
    
    const Component = tagMap[tag] || View;
    
    // 转换属性
    const props = this.transformProps(data);
    
    return {
      type: Component,
      props,
      children: []
    };
  }
  
  createTextNode(text) {
    return {
      type: Text,
      props: {},
      children: [text]
    };
  }
  
  transformProps(data) {
    const props = {};
    
    if (data.attrs) {
      Object.assign(props, data.attrs);
    }
    
    // 转换样式
    if (data.style) {
      props.style = this.transformStyles(data.style);
    }
    
    // 转换类名（React Native 中通常直接使用样式对象）
    if (data.class) {
      const additionalStyles = this.classNameToStyle(data.class);
      props.style = [props.style, additionalStyles].filter(Boolean);
    }
    
    // 转换事件
    if (data.on) {
      for (const [event, handler] of Object.entries(data.on)) {
        const nativeEvent = this.mapEventToNative(event);
        if (nativeEvent) {
          props[nativeEvent] = handler;
        }
      }
    }
    
    return props;
  }
  
  transformStyles(styles) {
    // 转换 CSS 样式为 React Native 样式
    const transformed = {};
    
    for (const [key, value] of Object.entries(styles)) {
      const nativeKey = this.mapStyleKey(key);
      transformed[nativeKey] = value;
    }
    
    return transformed;
  }
  
  mapStyleKey(cssKey) {
    const styleMap = {
      'background-color': 'backgroundColor',
      'font-size': 'fontSize',
      'text-align': 'textAlign',
      'border-radius': 'borderRadius',
      'line-height': 'lineHeight'
    };
    
    return styleMap[cssKey] || cssKey;
  }
  
  mapEventToNative(domEvent) {
    const eventMap = {
      'click': 'onPress',
      'touchstart': 'onTouchStart',
      'touchend': 'onTouchEnd',
      'input': 'onChangeText',
      'change': 'onValueChange'
    };
    
    return eventMap[domEvent];
  }
  
  classNameToStyle(className) {
    // 简单的类名到样式的映射
    const styleMap = {
      'container': { flex: 1, padding: 10 },
      'button': { backgroundColor: '#007AFF', padding: 10 },
      'text': { fontSize: 16, color: '#333' }
    };
    
    if (typeof className === 'string') {
      return styleMap[className];
    }
    
    return null;
  }
  
  // 渲染为 React Native 组件
  renderToComponent(virtualDOM) {
    const renderNode = (vnode) => {
      if (typeof vnode === 'string') {
        return vnode;
      }
      
      const { type, props, children } = vnode;
      const childElements = children ? children.map(renderNode) : null;
      
      return React.createElement(type, props, ...(childElements || []));
    };
    
    return renderNode(virtualDOM);
  }
  
  nextTick(callback) {
    // React Native 中使用 requestAnimationFrame
    requestAnimationFrame(callback);
  }
}

// 使用示例
const rnRenderer = new ReactNativePlatformRenderer();
const virtualDOM = createVNode('view', { 
  style: { flex: 1, justifyContent: 'center' } 
}, [
  createVNode('text', { 
    style: { fontSize: 18, color: '#333' } 
  }, ['Hello React Native']),
  createVNode('button', { 
    on: { click: () => console.log('pressed') },
    style: { backgroundColor: 'blue', padding: 10 }
  }, ['Press Me'])
]);

const RNComponent = rnRenderer.renderToComponent(virtualDOM);
export default RNComponent;
```

### 服务端渲染器 (SSR)

```javascript
// server/platform.js
class ServerPlatformRenderer {
  constructor(options = {}) {
    this.doctype = options.doctype || '<!DOCTYPE html>';
    this.shouldSerialize = options.shouldSerialize !== false;
  }
  
  createElement(tag, data = {}) {
    // 服务端只生成字符串，不创建实际节点
    return {
      tag,
      data,
      children: [],
      isServerRendered: true
    };
  }
  
  createTextNode(text) {
    return String(text);
  }
  
  createComment(text) {
    return `<!-- ${text} -->`;
  }
  
  // 服务端渲染核心方法
  renderToString(virtualDOM) {
    const html = this.renderNode(virtualDOM);
    return this.doctype + html;
  }
  
  renderNode(vnode) {
    if (typeof vnode === 'string') {
      return this.escapeHtml(vnode);
    }
    
    if (vnode.isComment) {
      return this.createComment(vnode.text);
    }
    
    const { tag, data, children } = vnode;
    
    // 处理属性
    const attrs = this.serializeAttrs(data);
    
    // 自闭合标签处理
    const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
    if (selfClosingTags.includes(tag)) {
      return `<${tag}${attrs}>`;
    }
    
    // 处理子节点
    const childrenHtml = children ? children.map(child => 
      this.renderNode(child)
    ).join('') : '';
    
    return `<${tag}${attrs}>${childrenHtml}</${tag}>`;
  }
  
  serializeAttrs(data) {
    if (!data) return '';
    
    const attrs = [];
    
    // 处理普通属性
    if (data.attrs) {
      for (const [key, value] of Object.entries(data.attrs)) {
        if (value != null) {
          attrs.push(`${key}="${this.escapeAttr(value)}"`);
        }
      }
    }
    
    // 处理样式
    if (data.style && typeof data.style === 'object') {
      const styleStr = Object.entries(data.style)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
      if (styleStr) {
        attrs.push(`style="${this.escapeAttr(styleStr)}"`);
      }
    }
    
    // 处理类名
    if (data.class) {
      const classStr = this.normalizeClass(data.class);
      if (classStr) {
        attrs.push(`class="${this.escapeAttr(classStr)}"`);
      }
    }
    
    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }
  
  normalizeClass(classValue) {
    if (typeof classValue === 'string') return classValue;
    if (Array.isArray(classValue)) return classValue.join(' ');
    if (typeof classValue === 'object') {
      return Object.keys(classValue)
        .filter(key => classValue[key])
        .join(' ');
    }
    return '';
  }
  
  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  escapeAttr(value) {
    return this.escapeHtml(value).replace(/"/g, '&quot;');
  }
  
  nextTick(callback) {
    // 服务端立即执行
    setImmediate(callback);
  }
}

// 使用示例
const ssrRenderer = new ServerPlatformRenderer();
const virtualDOM = createVNode('div', { 
  class: 'container',
  attrs: { id: 'app' }
}, [
  createVNode('h1', { style: { color: 'red' } }, ['Hello SSR']),
  createVNode('p', {}, ['Server Rendered Content'])
]);

const html = ssrRenderer.renderToString(virtualDOM);
console.log(html);
// 输出: <!DOCTYPE html><div id="app" class="container"><h1 style="color: red;">Hello SSR</h1><p>Server Rendered Content</p></div>
```

## 统一的虚拟 DOM 核心

### 跨平台虚拟 DOM 工厂

```javascript
// core/vnode.js
class UniversalVNode {
  constructor(tag, data, children, text, elm, context, componentOptions) {
    this.tag = tag
    this.data = data || {}
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.isPlatformNode = false // 标记是否为平台特定节点
  }
  
  // 克隆节点（用于跨平台序列化）
  clone() {
    return new UniversalVNode(
      this.tag,
      { ...this.data },
      this.children ? this.children.map(child => 
        typeof child === 'string' ? child : child.clone()
      ) : undefined,
      this.text,
      this.elm,
      this.context,
      this.componentOptions ? { ...this.componentOptions } : undefined
    )
  }
  
  // 序列化为平台无关的 JSON
  toJSON() {
    return {
      tag: this.tag,
      data: this.data,
      children: this.children ? this.children.map(child => 
        typeof child === 'string' ? child : child.toJSON()
      ) : undefined,
      text: this.text,
      key: this.key
    }
  }
}

// 虚拟 DOM 创建函数
function createUniversalVNode(tag, data, children) {
  let text
  let normalizedChildren
  
  // 处理 children 参数
  if (Array.isArray(children)) {
    normalizedChildren = children
  } else if (typeof children === 'string' || typeof children === 'number') {
    text = String(children)
    normalizedChildren = undefined
  } else if (children) {
    normalizedChildren = [children]
  }
  
  // 处理 key
  if (data && data.key) {
    data.key = String(data.key)
  }
  
  return new UniversalVNode(
    tag,
    data,
    normalizedChildren,
    text
  )
}

// 平台特定的节点包装器
function createPlatformNode(platformNode, platformType) {
  const vnode = new UniversalVNode(
    'platform-node',
    { platformType },
    undefined,
    undefined,
    platformNode
  )
  vnode.isPlatformNode = true
  return vnode
}
```

### 跨平台 Diff 和 Patch

```javascript
// core/diff.js
class UniversalDiff {
  constructor(platformRenderer) {
    this.platform = platformRenderer
  }
  
  patch(oldVnode, vnode, container) {
    if (!oldVnode && !vnode) return null
    
    if (!oldVnode) {
      // 只有新节点，创建
      return this.createElm(vnode, container)
    }
    
    if (!vnode) {
      // 只有旧节点，删除
      this.removeElm(oldVnode)
      return null
    }
    
    if (this.sameVnode(oldVnode, vnode)) {
      // 相同节点，更新
      this.patchVnode(oldVnode, vnode)
      return vnode.elm
    } else {
      // 不同节点，替换
      const parent = this.platform.parentNode(oldVnode.elm)
      const newElm = this.createElm(vnode, parent)
      this.platform.replaceChild(parent, newElm, oldVnode.elm)
      return newElm
    }
  }
  
  createElm(vnode, container) {
    if (vnode.isPlatformNode) {
      // 平台特定节点
      return vnode.elm
    }
    
    if (vnode.tag) {
      // 元素节点
      const elm = this.platform.createElement(vnode.tag, vnode.data)
      vnode.elm = elm
      
      // 创建子节点
      if (vnode.children) {
        vnode.children.forEach(child => {
          const childElm = this.createElm(child, elm)
          if (childElm) {
            this.platform.appendChild(elm, childElm)
          }
        })
      }
      
      return elm
    } else if (vnode.text !== undefined) {
      // 文本节点
      const elm = this.platform.createTextNode(vnode.text)
      vnode.elm = elm
      return elm
    }
    
    return null
  }
  
  patchVnode(oldVnode, vnode) {
    const elm = vnode.elm = oldVnode.elm
    const oldCh = oldVnode.children
    const ch = vnode.children
    
    // 更新数据（属性、样式、事件等）
    this.updateAttrs(oldVnode, vnode)
    this.updateStyles(oldVnode, vnode)
    this.updateEvents(oldVnode, vnode)
    
    // 更新子节点
    if (vnode.text !== undefined) {
      if (oldVnode.text !== vnode.text) {
        this.platform.setTextContent(elm, vnode.text)
      }
    } else if (oldCh && ch) {
      this.updateChildren(elm, oldCh, ch)
    } else if (ch) {
      // 只有新节点有 children，添加
      ch.forEach(child => {
        const childElm = this.createElm(child, elm)
        if (childElm) this.platform.appendChild(elm, childElm)
      })
    } else if (oldCh) {
      // 只有旧节点有 children，删除
      oldCh.forEach(child => this.removeElm(child))
    }
  }
  
  updateChildren(parentElm, oldCh, newCh) {
    // 简化的 children 更新算法
    // 实际实现应该使用更高效的 Diff 算法
    const commonLength = Math.min(oldCh.length, newCh.length)
    
    // 更新共同的部分
    for (let i = 0; i < commonLength; i++) {
      this.patch(oldCh[i], newCh[i], parentElm)
    }
    
    // 删除多余的旧节点
    if (oldCh.length > newCh.length) {
      for (let i = commonLength; i < oldCh.length; i++) {
        this.removeElm(oldCh[i])
      }
    }
    
    // 添加新增的节点
    if (newCh.length > oldCh.length) {
      for (let i = commonLength; i < newCh.length; i++) {
        const childElm = this.createElm(newCh[i], parentElm)
        if (childElm) this.platform.appendChild(parentElm, childElm)
      }
    }
  }
  
  sameVnode(a, b) {
    return (
      a.tag === b.tag &&
      a.key === b.key &&
      a.isPlatformNode === b.isPlatformNode
    )
  }
  
  updateAttrs(oldVnode, vnode) {
    const oldData = oldVnode.data || {}
    const newData = vnode.data || {}
    const elm = vnode.elm
    
    // 更新属性
    const oldAttrs = oldData.attrs || {}
    const newAttrs = newData.attrs || {}
    
    // 移除不再存在的属性
    for (const key in oldAttrs) {
      if (!(key in newAttrs)) {
        this.platform.removeAttribute(elm, key)
      }
    }
    
    // 设置新的或修改的属性
    for (const key in newAttrs) {
      if (oldAttrs[key] !== newAttrs[key]) {
        this.platform.setAttribute(elm, key, newAttrs[key])
      }
    }
  }
  
  // 类似的 updateStyles 和 updateEvents 方法...
}
```

## 实际应用案例

### 跨平台组件库设计

```javascript
// components/Button.js - 跨平台按钮组件
class UniversalButton {
  constructor(platformRenderer) {
    this.platform = platformRenderer
  }
  
  render(props) {
    const { 
      text, 
      onPress, 
      type = 'primary',
      disabled = false,
      loading = false 
    } = props
    
    const baseStyle = this.getBaseStyle()
    const typeStyle = this.getTypeStyle(type)
    const stateStyle = disabled ? this.getDisabledStyle() : {}
    
    return createUniversalVNode('button', {
      class: ['btn', `btn-${type}`, disabled && 'btn-disabled'],
      style: { ...baseStyle, ...typeStyle, ...stateStyle },
      attrs: {
        disabled: disabled || loading,
        'aria-label': props.ariaLabel || text
      },
      on: {
        click: disabled ? null : onPress
      }
    }, [
      loading ? this.renderLoading() : null,
      text && createUniversalVNode('text', {
        style: this.getTextStyle()
      }, [text])
    ].filter(Boolean))
  }
  
  getBaseStyle() {
    // 返回基础样式，平台渲染器会转换为对应平台的样式
    return {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
  
  getTypeStyle(type) {
    const styles = {
      primary: {
        backgroundColor: '#007AFF',
        color: 'white'
      },
      secondary: {
        backgroundColor: '#6C757D',
        color: 'white'
      },
      danger: {
        backgroundColor: '#DC3545',
        color: 'white'
      }
    }
    return styles[type] || styles.primary
  }
  
  getDisabledStyle() {
    return {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }
  
  renderLoading() {
    return createUniversalVNode('span', {
      class: 'btn-loading',
      style: {
        width: '16px',
        height: '16px',
        border: '2px solid transparent',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '8px'
      }
    })
  }
}

// 使用示例
const webButton = new UniversalButton(webRenderer)
const miniProgramButton = new UniversalButton(miniProgramRenderer)
const rnButton = new UniversalButton(rnRenderer)

// 同一套代码，不同平台渲染
const buttonProps = {
  text: 'Click Me',
  type: 'primary',
  onPress: () => console.log('Button pressed')
}

const webVNode = webButton.render(buttonProps)
const miniProgramVNode = miniProgramButton.render(buttonProps) 
const rnVNode = rnButton.render(buttonProps)
```

### 平台特定的扩展机制

```javascript
// core/platform-extension.js
class PlatformExtension {
  constructor() {
    this.extensions = new Map()
  }
  
  // 注册平台特定扩展
  registerExtension(platform, extension) {
    if (!this.extensions.has(platform)) {
      this.extensions.set(platform, [])
    }
    this.extensions.get(platform).push(extension)
  }
  
  // 应用扩展
  applyExtensions(platform, vnode) {
    const extensions = this.extensions.get(platform) || []
    let processedVNode = vnode
    
    for (const extension of extensions) {
      processedVNode = extension.process(processedVNode)
    }
    
    return processedVNode
  }
}

// 微信小程序特定扩展
class WechatMiniProgramExtension {
  process(vnode) {
    if (vnode.tag === 'video') {
      // 转换 video 标签为小程序组件
      return {
        ...vnode,
        tag: 'wx-video',
        data: {
          ...vnode.data,
          attrs: this.transformVideoAttrs(vnode.data.attrs)
        }
      }
    }
    
    if (vnode.tag === 'img') {
      // 转换 img 标签
      return {
        ...vnode,
        tag: 'wx-image',
        data: {
          ...vnode.data,
          attrs: this.transformImageAttrs(vnode.data.attrs)
        }
      }
    }
    
    return vnode
  }
  
  transformVideoAttrs(attrs) {
    const attrMap = {
      src: 'src',
      controls: 'controls',
      autoplay: 'autoplay',
      poster: 'poster'
    }
    
    return this.mapAttrs(attrs, attrMap)
  }
  
  transformImageAttrs(attrs) {
    const attrMap = {
      src: 'src',
      alt: 'alt',
      'data-src': 'lazy-load'
    }
    
    return this.mapAttrs(attrs, attrMap)
  }
  
  mapAttrs(attrs, mapping) {
    const result = {}
    for (const [key, value] of Object.entries(attrs || {})) {
      const mappedKey = mapping[key] || key
      result[mappedKey] = value
    }
    return result
  }
}

// 使用扩展
const extension = new PlatformExtension()
extension.registerExtension('wechat-miniprogram', new WechatMiniProgramExtension())

const originalVNode = createUniversalVNode('video', {
  attrs: {
    src: 'video.mp4',
    controls: true,
    poster: 'poster.jpg'
  }
})

const wechatVNode = extension.applyExtensions('wechat-miniprogram', originalVNode)
// 结果: <wx-video src="video.mp4" controls autoplay poster="poster.jpg"></wx-video>
```

## 性能优化策略

### 平台特定的优化

```javascript
// optimization/platform-optimizer.js
class PlatformOptimizer {
  constructor(platform) {
    this.platform = platform
    this.optimizations = this.getPlatformOptimizations()
  }
  
  getPlatformOptimizations() {
    const optimizations = {
      'web': [
        new EventDelegationOptimization(),
        new StyleBatchOptimization(),
        new DOMReuseOptimization()
      ],
      'wechat-miniprogram': [
        new DataBatchOptimization(),
        new SetDataOptimization()
      ],
      'react-native': [
        new NativeViewReuseOptimization(),
        new BridgeCallOptimization()
      ]
    }
    
    return optimizations[this.platform] || []
  }
  
  optimizeVNode(vnode) {
    let optimized = vnode
    
    for (const optimization of this.optimizations) {
      optimized = optimization.optimize(optimized)
    }
    
    return optimized
  }
  
  optimizeUpdate(oldVNode, newVNode) {
    // 平台特定的更新优化
    if (this.platform === 'wechat-miniprogram') {
      return this.optimizeMiniProgramUpdate(oldVNode, newVNode)
    }
    
    return { oldVNode, newVNode }
  }
  
  optimizeMiniProgramUpdate(oldVNode, newVNode) {
    // 小程序 setData 优化：只传递变化的数据
    const diff = this.calculateDataDiff(oldVNode, newVNode)
    return {
      oldVNode,
      newVNode,
      patchData: diff
    }
  }
  
  calculateDataDiff(oldData, newData) {
    const diff = {}
    
    for (const key in newData) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        diff[key] = newData[key]
      }
    }
    
    return diff
  }
}
```

## 总结

### 虚拟 DOM 跨平台能力的核心价值

1. **统一的开发范式**：同一套代码逻辑，多平台运行
2. **平台特性抽象**：通过渲染器抽象平台差异
3. **性能优化统一**：跨平台的性能优化策略
4. **开发效率提升**：减少重复开发工作

### 关键技术点

1. **渲染器抽象接口**：定义统一的平台操作接口
2. **虚拟节点标准化**：平台无关的节点描述
3. **Diff 算法适配**：针对不同平台的优化策略
4. **扩展机制**：平台特定功能的可扩展性

### 适用场景

- **多端应用开发**：Web、小程序、Native 应用
- **组件库开发**：一次开发，多平台使用
- **渲染性能优化**：针对不同平台的专门优化
- **新技术探索**：快速适配新兴平台
