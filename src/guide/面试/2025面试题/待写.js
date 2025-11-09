/**
 * 
Javascript基础
1.不会冒泡的事件有哪些？
2. mouseEnter 和 mouseOver 有什么区别?
3. MessageChannel 是什么，有什么使用场景？
4. async、await 实现原理
5.Proxy能够监听到对象中的对象的引用吗？
6. 如何让var[a, b] = {a: 1, b: 2} 解构赋值成功?
7.下面代码会输出什么？
8.描述下列代码的执行结果
9.什么是作用域链？
10. bind、call、apply 有什么区别?如何实现一个bind?
11. common.js和es6中模块引入的区别?
12. 说说vue3中的响应式设计原理
13.script标签放在header里和放在body底部里有什么区别？
14.下面代码中，点击"+3”按钮后，age的值是什么？
15.Vue中，created和mounted两个钩子之间调用时间差值受什么影响？
16.vue中，推荐在哪个生命周期发起请求？
17.为什么Node在使用esmodule时必须加上文件扩展名？
18. package.json文件中的 devDependencies和dependencies 对象有什么区别?
19. React Portals 有什么用?
20. react 和 react-dom 是什么关系?

React框架题（源码笔记等）
2. React Portals 有什么用?
3. react 和 react-dom是什么关系?
4. React中为什么不直接使用requestIdleCallback?
5. 为什么react需要fiber 架构，而Vue 却不需要？
6.子组件是一个Portal，发生点击事件能冒泡到父组件吗？
7. React 为什么要废弃 componentWillMount、componentWillReceiveProps、component...
8.说说React render方法的原理？在什么时候会被触发？
9.说说React事件和原生事件的执行顺序
10.说说对受控组件和非受控组件的理解，以及应用场景？
11.你在React项目中是如何使用Redux的？项目结构是如何划分的？
12.说说对Redux中间件的理解？常用的中间件有哪些？实现原理？
13.说说你对Redux的理解？其工作原理？
14.说说你对immutable的理解？如何应用在react项目中?
15.说说React Jsx转换成真实DOM过程？
16.说说你在React项目是如何捕获错误的?
17.说说React服务端渲染怎么做？原理是什么？
18.ReactFiber是如何实现更新过程可控？
19. Fiber为什么是React 性能的一个飞跃?
20. setState是同步，还是异步的?

Vue 框架题（源码笔记等）
1. Vue有了数据响应式，为何还要diff？
2.vue3为什么不需要时间分片?
3. vue3 为什么要引入 Composition API ？
4. 谈谈Vue事件机制,并手写$on、$off、$emit、$once
5.computed计算值为什么还可以依赖另外一个computed计算值？
6.说一下vm.$set原理
7. 怎么在Vue中定义全局方法?
8.Vue中父组件怎么监听到子组件的生命周期？
9.vue组件里写的原生addEventListeners监听事件，要手动去销毁吗？为什么?
10.说说vue3中的响应式设计原理
11.Vue中，created和mounted两个钩子之间调用时间差值受什么影响？
12.vue中，推荐在哪个生命周期发起请求？
13. 为什么react 需要 fiber 架构，而Vue 却不需要?
14.SPA（单页应用)首屏加载速度慢怎么解决？
15. 说下Vite的原理
16.Vue2.0为什么不能检查数组的变化，该怎么解决？
17. 说说Vue页面渲染流程
18.vue中computed和watch区别
19.vuex中的辅助函数怎么使用？
20.如果使用Vue3.0实现一个Modal，你会怎么进行设计?

Node.js
1. commonjs和es6中模块引入的区别？
2.为什么Node在使用esmodule时必须加上文件广展名？
3. 浏览器和Node中的事件循环有什么区别？
4. Node性能敏如何进行监控以及优化？
5.如果让你来设计一个分页功能，你会怎么设计？前后端如何交互？
6. 如何实现文件上传？说说你的思路
7.如何实现jwt鉴权机制？说说你的思路
8.说说对中间件概念的理解，如何封装node中间件？
9. 说说Node文件查找的优先级以及Require方法的文件查找策略?
10.说说对Nodejs中的事件循环机制理解？
11. 说说Node中的EventEmitter?如何实现一个EventEmitter?
12.说说对 Node中的 Stream的理解？应用场景？
13.说说对Node中的Buffer 的理解？应用场景？
14.说说对Node中的fs模块的理解？有哪些常用方法
15.说说对 Node中的 process的理解？有哪些常用方法？
16. Node. js 有哪些全局对象?
17.说说你对Node.js的理解？优缺点？应用场景？
18. body-parser这个中间件是做什么用的?
19.Koa中，如果一个中间件没有调用await next(，后续的中间件还会执行吗？
20.在没有async await 的时候，koa是怎么实现的洋葱模型？

Typescript
1. 说说对TypeScript 中命名空间与模块的理解？区别?
2. 说说你对 typescript 的理解?与 javascript 的区别?
3. Typescript中泛型是什么?
4. TypeScript中有哪些声明变量的方式？
5. 什么是Typescript的方法重载？
6. 请实现下面的 sleep方法
7. typescript 中的is关键字有什么用？
8. TypeScript支持的访问修饰符有哪些?
9.请实现下面的myMap方法
10. 请实现下面的 treePath 方法
11. 请实现下面的 product 方法
12. 请实现下面的 myAll 方法
13. 请实现下面的 sum方法
14. 请实现下面的 mergeArray 方法
15. 实现下面的 firstSingleChar 方法
16. 实现下面的 reverseWord 方法
17.如何定义一个数组，它的元素可能是字符串类型，也可能是数值类型？
18. 请补充 objToArray 函数
19.使用TS实现一个判断传入参数是否是数组类型的方法
20.TypeScript的内置数据类型有哪些？

前端工程化
1. package.json文件中的 devDependencies和 dependencies 对象有什么区别?
2. webpack 5的主要升级点有哪些？
3. 说下Vite的原理
4. 与webpack类似的工具还有哪些？区别?
5.说说如何借助webpack来优化前端性能？
6.说说webpack proxy工作原理？为什么能解决跨域？
7.说说webpack的热更新是如何做到的？原理是什么？
8.面试官：说说Loader和Plugin的区别？编写Loader，Plugin的思路?
9.说说webpack中常见的Plugin?解决了什么问题？
10. 说说webpack中常见的Loader?解决了什么问题?
11. 说说webpack的构建流程？
12.说说你对webpack的理解？解决了什么问题？
13. webpack loader 和 plugin 实现原理
14.如何提高webpack的构建速度？
15. 说说 webpack-dev-server 的原理
16. 你对babel了解吗，能不能说说几个stage代表什么意思？
17. webpack的module、bundle、chunk分别指的是什么?
18. 什么是 CI/CD?
19.说说你对前端工程化的理解
20.说说你对 SSG 的理解

编程手写题
1. 使用Promise实现红绿灯交替重复亮
2. bind、call、apply 有什么区别?如何实现一个bind?
3.利用字符重复出现的次数，编写一种方法，实现基本的字符串压缩功能。比如，字符...
4.说说new操作符具体干了什么？
5.如何实现上拉加载，下拉刷新？
6.大文件怎么实现断点续传？
7.什么是防抖和节流，以及如何编码实现？
8.说说ajax的原理，以及如何实现？
9.深拷贝浅拷贝有什么区别？怎么实现深拷贝？
10.用js实现二叉树的定义和基本操作
11,，如何实现一个轮播图组件？
12.写出一个函数trans，将数字转换成汉语的输出，输入为不超过10000亿的数字。
13.将下面的数组转成树状结构
14.编写一个vue组件，组件内部使用插槽接收外部内容，v-model双向绑定，实现折叠展...
15. 实现lodash的set和get方法
16.去除字符串中出现次数最少的字符，不改变原字符串的顺序。
17.实现一个批量请求函数，要求能够限制并发量
18.树转数组
19. 数组转树
20.删除链表的一个节点

前端性能优化（大厂专题）
1. script标签放在header里和放在body底部里有什么区别？
2.前端性能优化指标有哪些？怎么进行性能检测？
3.SPA（单页应用）首屏加载速度慢怎么解决？
4.如果使用CSS提高页面性能？
5.怎么进行站点内的图片性能优化？
6.虚拟DOM一定更快吗?
7.有些框架不用虚拟dom，但是他们的性能也不错是为什么？
8，如果某个页面有几百个函数需要执行，可以怎么优化页面的性能？
9.讲一下png8、png16、png32的区别，并简单讲讲png的压缩原理
10.页面加载的过程中，JS 文件是不是一定会阻塞DOM和CSSOM的构建？
11. React.memo()和useMemo(的用法是什么，有哪些区别?
12.导致页面加载白屏时间长的原因有哪些，怎么进行优化？
13.如果一个列表有100000个数据，这个该怎么进行展示？
14.DNS预解析是什么？怎么实现?
15. 在React中可以做哪些性能优化？
16.浏览器为什么要请求并发数限制？
17. 如何确定页面的可用性时间，什么是PerformanceAPI?
18.谈谈对window.requestAnimationFrame 的理解
19. css加载会造成阻塞吗？
20.什么是内存泄漏？什么原因会导致呢？
21.如何用webpack来优化前端性能
22.说说常规的前端性能优化手段
23. 什么是CSS Sprites?
24. CSS优化、提高性能的方法有哪些？
25.script标签中，async和defer两个属性有什么用途和区别？

项目场景题
1.如何判断用户设备
2.将多次提交压缩成一次提交
3.介绍下navigator.sendBeacon方法
4.混动跟随导航（电梯导航）该如何实现
5退出浏览器之前，发送积压的埋点数据请求，该如何做？
6.如何统计页面的long task（长任务）[热度：140】
7.PerfoemanceObserver如何测量页面性能
移动端如何实现下拉滚动加载（顶部加载）
9.判断页签是否为活跃状态
10.在网络带宽一定的情况下，切片上传感觉和整体上传消费的时间应该是差不多的这种说法正确吗？
11.大文件切片上传的时候，确定切片数量的时候，有那些考量因素
12.页面关闭时执行方法，该如何做
13.如何统计用户pv访问的发起请求数量
14.长文本溢出，展开/收起如何实现
15.如何实现鼠标拖拽
16统计全站每一个静态资源加载耗时，该如何做
17.防止前端页面重复请求
18.ResizeObserver作用是什么
19.要实时统计用户浏览器窗口大小，该如何做
20.当项目报错，你想定位是哪个commit引l入的错误的时，该怎么做


 * */ 