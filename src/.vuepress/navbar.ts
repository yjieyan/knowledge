import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  //"/portfolio",
  //"/demo/",
  {
    text: "计算机基础",
    icon: "lightbulb",
    prefix: "/guide/computer/",
    children: ["network", "操作系统", "编译原理", "数据结构与算法", "计算机组成原理", "数据库", "安全"],
  },
  {
    text: "浏览器&服务器",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["浏览器工作原理","",""],
  },
  {
    text: "源码分析",
    icon: "lightbulb",
    prefix: "/guide/source-code/",
    children: [ "Vue2源码解析", "Vue3源码解析", "React源码解析", "运行时框架"],
  },
  {
    text: "前端工程化",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["模块化与打包","测试与质量","CI/CD","脚手架与 Monorepo","性能优化"],
  },
  {
    text: "语言与标准",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["JavaScript","Typescript", "cSS &预处理器", "Web 标准", "编码与算法", "设计模式",],
  },
  {
    text: "可视化与动画",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["Canvas & SVG", "WebGL / WebGPU","CSS 动画","动效设计","数据可视化"],
  },
  {
    text: "低代码与搭建",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["低代码概念", "可视化编辑器", "表单与规则引擎", "出码与沙箱", "实践案例"],
  },
  {
    text: "跨端与移动端",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["跨端方案","移动端适配","PWA","小程序","桌面端与IoT"],
  },
  {
    text: "技术管理",
    icon: "lightbulb",
    prefix: "/guide/",
    children: ["团队规范","Code Review","晋升与成长","技术写作","复盘与总结"],
  },
]);
