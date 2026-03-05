import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "基础",
    prefix: "/guide/浏览器&服务器/",
    children: [
      {
        text: "浏览器",
        children: [
          '浏览器/用户从输入网址到网页显示发生了什么.html',
          '/guide/computer/前端JWT.html',
          '/guide/computer/Xss和Csrf.html',


        ]
      },
      {
        text: "Js",
        prefix: "/guide/language/",
        children: [
          'Js/Js引擎如何执行js.html',
          'Js/原型与原型链.html','Js/Promise异步.html','Js/事件循环.html','Js/作用域与闭包.html',
          'Js/柯里化函数.html','Js/深拷贝与浅拷贝.html','Js/bind&call&apply.html'

        ]
      },
         {
        text: "Ts",
        children: [
          // 'Ts/Ts基础.html',
          'Ts/Ts接口vs类型别名.html',
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
  },
  {
    text: "框架",
    prefix: "/framework/",
    children: [
      {
        text: "Vue",
        link: "/framework/Vue/README.md",
        children: [
          // 'Vue3新特性.html',
        ]
      },
      {
        text: "React",
        link: "/framework/React/README.md",
        children: [
        ]
      },
      {
        text: "Nuxt",
        children: [

        ]
      }
    ]
  },
  {
    text: "工程化",
    prefix: "/engineering/",
    children: [
      {
        text: "构建工具",
        children: [
          '/engineering/engineering-tool/Webpack/README.md',
          '/engineering/engineering-tool/Vite/README.md',
        ]
      },
      {
        text: "编译工具",
        children: [
          '/engineering/Babel/README.md'
        ]
      },
    ]
  },
  {
    text: "跨端",
    prefix: "/guide/front-end/",
    children: [ ]
  },
  {
    text: "移动端",
    prefix: "/guide/mobile/",
    children: [ 

    ]
  },
  {
    text: "服务端",
    prefix: "/guide/server/",
    children: [ ]
  },
  {
    text: "可视化",
    prefix: "/guide/visualization/",
    children: [ ]
  },
  // {
  //   text: "源码分析",
  //   prefix: "/guide/source-code/",
  //   children: [
  //     // {
  //     //   text: "Vue",
  //     //   children: [
  //     //     'Vue2源码解析.html','Vue2响应式原理.html','Vue生命周期.html','Vue3基础.html','Vue2VsVue3.html', 
  //     //     'Vue3源码分析.html','vuex原理分析.html','vueRouter原理分析.html',
  //     //      'VueCli原理分析.html','VueSSR原理分析.html','Vue3设计实现一个弹窗组件.html',
  //     //      '实现一个简单的脚手架.html',
  //     //   ]
  //     // },
  //     // {
  //     //   text: "React",
  //     //   children: ['React基础.html', 'React生命周期.html', 
  //     //     '学React的设计模式.html','VueVsReact.html',
  //     //   ]
  //     // },
  //     // {
  //     //   text: "Webpack",
  //     //   children: [
  //     //     'Webpack基础.html','Webpack构建流程.html','Webpack插件&加载器机制',
  //     //     'Webpack的tapable.html','Webpack的TreeShaking.html','Webpack和Rollup如何选择.html',
  //     //     'Webpack5新特性.html'
  //     //   ]
  //     // },
  //     // {
  //     //   text: "Vite",
  //     //   children: [
  //     //     'Vite原理.html',
  //     //   ]
  //     // },
  //     // {
  //     //   text: "Babel",
  //     //   children: ['BabelAst.html', 'Babel自主编写一个Babel插件.html']
  //     // },
  //   ],
  // },
  {
    text: "前端工程化与项目实践",
    prefix: "/guide/engineering/",
    children: [
      {
        text: "项目设计",
        children: [
          '项目设计/实现扫码登录.html',
          '项目设计/单点登录.html',
          '项目设计/大文件断点续传.html',
        ]
      },
    ],
  },
  {
    text: "面试经",
    // icon: "lightbulb",
    prefix: "/guide/面试/",
    children: [
      "基础面试题/Html综合问题.html", 
      "核心面试题/README.md",
      "综合面试题/README.md", 
      "2025面试题/面试之UniApp.html"],
  },
  {
    text: "全栈与未来",
    prefix: "/guide/全栈与未来/",
    children: ["技术决策的思考","学习方法论","团队协作","个人成长路径"],
  },

  // {
  //   text: "2026",
  //   prefix: "/guide/2026/",
  //   children: ["锻炼",],
  // },
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
