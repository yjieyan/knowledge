import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  //"/portfolio",
  //"/demo/",
  
  // {
  //   text: "计算机基础",
  //   // icon: "lightbulb",
  //   prefix: "/guide/computer/",
  //   // children: ["README.md", ],
  //   children: [
  //     {
  //       text: "网络",
  //       children: ['网络/从地址栏回车到页面渲染.html']
  //     },
  //     // {
  //     //   text: "操作系统",
  //     //   children: ['网络/从地址栏回车到页面渲染.html']
  //     // },
  //     // {
  //     //   text: "数据结构与算法",
  //     //   children: ['网络/从地址栏回车到页面渲染.html']
  //     // },
  //   ],
  // },
  // {
  //   text: "计算机基础",
  //   // icon: "lightbulb",
  //   prefix: "/guide/computer/",
  //   // children: ["README.md", ],
  //   children: [
  //     {
  //       text: "通信",
  //       children: ['前端JWT.html','HttpOnly-Cookie.html']
  //     },
  //   ],
  // },
  {
    text: "浏览器&服务器",
    // icon: "lightbulb",
    prefix: "/guide/浏览器&服务器/",
    children: [
      {
        text: "浏览器",
        children: [
          '浏览器/用户从输入网址到网页显示发生了什么.html',
          '/guide/computer/前端JWT.html','/guide/computer/HttpOnly-Cookie.html'

        ]
      },
      {
        text: "Node",
        children: [
          '服务器/浏览器和nodejs事件循环的区别.html',
          '服务器/package.json版本号规则.html',
          '服务器/npm模块安装机制.html',
          '服务器/V8的垃圾回收机制.html',



        ]
      },
    ]
    // children: ["浏览器/index.html","服务器/index.html",],
  },
  // "/guide/source-code/",
  {
    text: "源码分析",
    prefix: "/guide/source-code/",
    children: [
      {
        text: "Vue",
        children: [
          'Vue2源码解析.html','Vue2响应式原理.html','Vue生命周期.html','Vue3基础.html','Vue2VsVue3.html', 
          'Vue3源码分析.html','vuex原理分析.html','vueRouter原理分析.html',
           'VueCli原理分析.html','VueSSR原理分析.html','Vue3设计实现一个弹窗组件.html',
           '实现一个简单的脚手架.html',
        ]
      },
      {
        text: "React",
        children: ['React基础.html', 'React生命周期.html', 
          // 'React组件通信.html',
          // 'ReactFiber.html','React性能优化.html',
          '学React的设计模式.html','VueVsReact.html',
        ]
      },
      {
        text: "Webpack",
        children: [
          'Webpack基础.html','Webpack构建流程.html','Webpack插件&加载器机制',
          'Webpack的tapable.html','Webpack的TreeShaking.html','Webpack和Rollup如何选择.html'
        ]
      },
      {
        text: "Babel",
        children: ['BabelAst.html', 'Babel自主编写一个Babel插件.html']
      },
    ],
  },
  // {
  //   text: "源码分析",
  //   // icon: "lightbulb",
  //   prefix: "/guide/source-code/",
  //   children: [ "README.md"],
  //   // children: [ "Vue2源码解析", "Vue3源码解析", "React源码解析", "运行时框架"],
  // },
  {
    text: "前端工程化与项目实践",
    // icon: "lightbulb",
    prefix: "/guide/engineering/",
    children: [
      {
        text: "微前端",
        children: ['微前端与模块联邦/微前端基础.html']
      },
      {
        text: "模块化",
        children: ['模块化与打包/ESModule&CommonJS&UMD 差异与互转.html']
      },
      {
        text: "测试与质量",
        children: ['测试与质量/单元测试（Jest&Vitest）.html']
      },
      // {
      //   text: "CI&CD",
      //   children: ['CI&CD/index.html']
      // },
      // {
      //   text: "脚手架与Monorepo",
      //   children: ['脚手架与Monorepo/index.html']
      // },
      // {
      //   text: "性能监控与日志",
      //   children: ['性能监控与日志/index.html']
      // },
      {
        text: "项目设计",
        children: [
          '项目设计/实现扫码登录.html',
          '项目设计/单点登录.html',
          '项目设计/大文件断点续传.html',

        ]
      },
    ],
    // children: ["微前端与模块联邦/index.html","模块化与打包/index.html","测试与质量/index.html","CI&CD/index.html","脚手架与Monorepo/index.html","性能监控与日志/index.html","项目实战/index.html",],
  },
  {
    text: "语言与标准",
    prefix: "/guide/language/",
    children: [
      {
        text: "Js",
        children: [
          'Js/Js引擎如何执行js.html',
          'Js/原型与原型链.html','Js/Promise异步.html','Js/事件循环.html','Js/作用域与闭包.html',
          'Js/柯里化函数.html','Js/深拷贝与浅拷贝.html','Js/bind&call&apply.html'
        ]
      },
      {
        text: "Ts",
        children: [
          'Ts/Ts基础.html','Ts/Ts接口vs类型别名.html',
        ]
      },
      // {
      //   text: "CSS&预处理器",
      //   children: []
      // },
      // {
      //   text: "设计模式",
      //   children: []
      // },
    ],
  },
  {
    text: "跨端与移动端",
    prefix: "/guide/跨端与移动端/",
    children: [
      {
        text: "跨端",
        children: ['跨端/Taro原理.html']
      },
      {
        text: "移动端",
        children: ['移动端/开发小程序的几种方式.html', '']
      },
    ],
  },
  {
    text: "全栈与未来",
    // icon: "lightbulb",
    prefix: "/guide/全栈与未来/",
    children: ["技术决策的思考","学习方法论","团队协作","个人成长路径"],
  },
  // {
  //   text: "技术管理",
  //   prefix: "/guide/",
  //   children: ["团队规范","Code Review","晋升与成长","技术写作","复盘与总结"],
  // },
  // {
  //   text: "可视化与动画",
  //   // icon: "lightbulb",
  //   prefix: "/guide/",
  //   children: ["Canvas & SVG", "WebGL / WebGPU","CSS 动画","动效设计","数据可视化"],
  // },
  // {
  //   text: "低代码",
  //   // icon: "lightbulb",
  //   prefix: "/guide/",
  //   children: ["低代码概念", "可视化编辑器", "表单与规则引擎", "出码与沙箱", "实践案例"],
  // },
]);
