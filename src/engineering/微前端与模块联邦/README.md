# 微前端与模块联邦
## 微前端
### [微前端基础](./微前端基础.md)
## 方案对比
### iframe 隔离
### single-spa
### qiankun（沙箱、样式隔离）
### Module Federation
### Web Components + ESModule
## 基座搭建
### 主应用路由劫持与加载器
### 子应用打包配置（publicPath、runtime chunk）
### 共享依赖（shared）与版本冲突解决
## 沙箱与隔离
### Proxy 快照沙箱
### ShadowRealm 未来方案
### CSS 隔离（scoped、shadow DOM、runtime prefix）
### 全局变量污染排查清单
## 通信机制
### 全局事件总线
### 全局状态（Pinia、Redux、Observable）
### postMessage 跨域通信
### 模块联邦 expose / import 动态加载
## 性能优化
### 子应用懒加载与预加载策略
### 共享依赖 CDN 化
### 资源版本对齐与增量更新
### 首屏并行加载调度器
## 部署与版本治理
### 独立 CI/CD 流水线
### 灰度发布（按用户/地域）
### 回滚策略（快照 + 动态路由）
### 日志追踪（TraceId 透传）
## 实战案例
### 从零搭建 qiankun + Vue3 微前端
### Webpack Module Federation 跨项目共享组件
### 无界方案（Web Component + Import Map）落地