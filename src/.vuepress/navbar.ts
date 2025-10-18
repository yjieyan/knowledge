import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  //"/portfolio",
  //"/demo/",
  {
    text: "计算机基础",
    // icon: "lightbulb",
    prefix: "/guide/computer/",
    // children: ["README.md", ],
    children: ["网络/index.html", "操作系统/index.html", "数据结构与算法/index.html",],
  },
  {
    text: "浏览器&服务器",
    // icon: "lightbulb",
    prefix: "/guide/浏览器&服务器/",
    children: ["浏览器/index.html","服务器/index.html",],
  },
  "/guide/source-code/",
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
    children: ["微前端与模块联邦/index.html","模块化与打包/index.html","测试与质量/index.html","CI&CD/index.html","脚手架与Monorepo/index.html","性能监控与日志/index.html","项目实战/index.html",],
  },
  {
    text: "语言与标准",
    // icon: "lightbulb",
    prefix: "/guide/language/",
    children: ["Js/index.html","Ts/index.html", "CSS&预处理器/index.html", "设计模式/index.html",],
  },
  "guide/跨端与移动端/",
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
