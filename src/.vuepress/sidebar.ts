import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/guide/面试/": [
    {
      text: "2025面试题",
      children: [
        {
          text: "面试之Hr篇",
          link: "2025面试题/面试之Hr.html"
        },
        {
          text: "面试之UniApp",
          link: "2025面试题/面试之UniApp.html"
        },
        {
          text: "核心面试题",
          link: "核心面试题/README.md"
        },
        {
          text: "综合面试题",
          link: "综合面试题/README.md"
        },
      ],
    },
    {
      text: "基础面试题",
      // prefix: "基础面试题/",
      children: [
        {
          text: "Html、Http、Web综合问题",
          link: "基础面试题/Html综合问题.html"
        },
        // {
        //   text: "Css",
        //   link: "Css.html"
        // },
        // {
        //   text: "Js",
        //   link: "基础面试题/Js.html"
        // },
        // {
        //   text: "Jquery",
        //   link: "Jquery.html"
        // },
        // {
        //   text: "Bootstrap",
        //   link: "Bootstrap.html"
        // },
        // {
        //   text: "Webpack",
        //   link: "基础面试题/Webpack.html"
        // },
        // {
        //   text: "编程题",
        //   link: "基础面试题/编程题.html"
        // },
      ],
    },
    // {
    //   text: "核心面试题",
    //   link: "核心面试题",
    // },
    // {
    //   text: "综合面试题",
    //   link: "综合面试题",
    // },
    // {
    //   text: "核心面试",
    //   prefix: "/guide/面试/",
    //   children: ["核心"],
    // },
    // {
    //   text: "综合面试",
    //   prefix: "/guide/面试/",
    //   children: ["综合"],
    // },
    // {
    //   text: "2025年面试",
    //   prefix: "/guide/面试/",
    //   children: ["2025"],
    // },
  ],
  // "/guide/computer/": [

  //   {
  //     text: "网络",
  //     // icon: "laptop-code",
  //     prefix: "/guide/computer/",
  //     // link: "网络/",
  //     collapsible: true,
  //     children: "structure",
  //     // children: ["从地址栏回车到页面渲染.md"],
  //   },
  //   // {
  //   //   text: "源码解析",
  //   //   icon: "laptop-code",
  //   //   prefix: "guide/source-code/",
  //   //   link: "source-code/",
  //   //   children: "structure",
  //   // },
  //   // {
  //   //   text: "幻灯片",
  //   //   icon: "person-chalkboard",
  //   //   link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
  //   // },
  // ],
  "/guide/source-code/": [],
});
