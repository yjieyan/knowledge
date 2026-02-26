# 性能监控与日志
## 


前端性能异常监控与埋点平台全栈架构与实践
前端项目的整体稳定性是怎么保证的?异常和性能的监控 SDK内核如何实现?
1. 稳定性，要站在 Leader 角度，做了贡献
    1. 性能采集、异常采集、用户行为埋点 SDK 开发
    2. 数据上报协议
    3. 数据统计清晰与加工
    4. 可视化
2. 重点介绍 SDK 实现细节
   1. 性能、异常指标设计
   2. 上报逻辑，图片、sendbacon、fetch
   3. 用户自定义指标

### 性能指标

1. 页面加载
   
    - FP （First Paint） 首次绘制
    - FCP （First Contentful Paint） 首次内容绘制
    - LCP （Largest Contentful Paint） 最大内容绘制
    - TTFB （Time To First Byte） 首字节时间，即从用户发起请求到收到第一个字节的时间
    - FID （First Input Delay） 首次输入延迟    
    - CLS （Cumulative Layout Shift） 累计布局偏移

2. 交互性能
    - INP （Interaction to Next Paint） 交互到下一次绘制时间，即从用户首次交互到浏览器绘制下一个帧的时间，< 200ms 是一个好的指标
    - CLS （Cumulative Layout Shift） 累计布局偏移 < 0.1 是一个好的指标

3. 补充指标
    - DNSCHAXUN （DNS 查询时间） 即从用户发起请求到浏览器收到 DNS 响应的时间
    - 资源加载时间
    - 长任务时间、数量

### 如何计算
1. Performance
   ```js
   const {timing} = window.performance
   const fp = timing.firstPaint
   const fcp = timing.firstContentfulPaint
   const lcp = timing.largestContentfulPaint
   const ttfb = timing.responseStart - timing.requestStart
   const fid = timing.interactionToNextPaint
   const loadTime = timing.loadEventEnd - timing.navigationStart 
   有时候loadTime是负数，这是因为浏览器会在页面加载完成后，再执行一些异步任务，比如执行 JS 代码、加载资源等，这些任务会导致 loadEventEnd 时间晚于 navigationStart 时间，从而导致 loadTime 为负数
   ```
2. web vitals
   - 二开
### 异常指标
1. 代码运行时异常
2. Promise reject 异常
3. 请求异常
4. 资源加载异常
   img、字体资源 onerror
### 用户行为指标
用户行为埋点
1. 无痕埋点
    事件机制：冒泡 捕获
    ```js
    window.onclick = function (e) {
        const {target} = e;
        const paths = e.path || e.composedPath()
        const xPath = paths.map(item => item.tagName)?.toLowerCase()?.join('/')
        console.log(xPath)
        console.log(e)
    }
    ```
2. 可视化埋点
3. 手动埋点
   report message


#### 代码运行时异常如何捕获&&上报
```js
window.onerror = function (msg, url, line, col, error) {
    const {name, message, stack} = error
    console.dir(msg,message,stack)
  // 上报异常
  // 阻止默认行为
  return false
}
```
#### Promise reject 异常如何捕获&&上报
```js
window.addEventListener('unhandledrejection', function (event) {
  const {reason, promise} = event
  console.dir(reason, promise)
  // 上报异常
  return false
})
``` 


### 上报途径

- 图片
- fetch
- sendbacon

## 完整监控平台从指标到可视化全链路体系？大型实时数据流日志系统？
1. 完整链路，服务侧处理
2. 服务编排细节
3. 数据传输协议、数据清洗加工、数据统计、数据可视化
### Docker 编排所有需要使用的服务
- clickhouse
- kafka
