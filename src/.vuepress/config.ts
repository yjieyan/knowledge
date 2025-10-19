import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/knowledge/",

  lang: "zh-CN",
  title: "学习与分享",
  description: "yjieyan的知识积累与分享",

  theme,
  

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
