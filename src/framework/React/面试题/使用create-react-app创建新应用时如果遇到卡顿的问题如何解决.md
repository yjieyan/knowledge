# 使用 create-react-app 创建新应用时，如果遇到卡顿的问题，如何解决?

使用 create-react-app（CRA）时若卡在 “fetchMetadata” 或 “Installing react-scripts” 等步骤，99 % 的情况都是「网络 + 本地缓存」导致。下面把「最快速见效 → 长期根治」的解决方案按优先级排好，你照着做基本都能在 1～2 min 内把项目拉起来。

--------------------------------
一、90 % 场景：两步秒开
--------------------------------
1. 换国内镜像（一次性配置）  
   npm config set registry https://registry.npmmirror.com  
   yarn config set registry https://registry.npmmirror.com   // 如果用 yarn  
   再执行 npx create-react-app my-app 即可提速 3～5 倍 。

2. 清掉脏缓存（30 s）  
   npm cache clean --force  
   yarn cache clean  
   防止旧缓存反复重下 。

--------------------------------
二、仍卡：换更快的包管理器
--------------------------------
1. 全局装 yarn 或 pnpm  
   npm i -g yarn pnpm  
   然后  
   yarn create react-app my-app      // yarn 并行下载  
   pnpm create react-app my-app      // pnpm 硬链接，最快最省盘 。

2. 顺手把 Yarn 的淘宝源也配了：  
   yarn config set registry https://registry.npmmirror.com

--------------------------------
三、极端网络：代理 / 公司内网
--------------------------------
有代理就配代理，没代理就切手机热点 30 s 验证：  
npm config set proxy http://127.0.0.1:1080  
npm config set https-proxy http://127.0.0.1:1080  
完事记得删除：npm config delete proxy 。

--------------------------------
四、老版本 / 机器卡：升级 + 加内存
--------------------------------
1. 升级 Node ≥ 18、npm ≥ 9（含并行下载优化）  
   windows 直接去 nodejs.org 下 LTS；mac/Linux 用 n 模块：  
   npm i -g n && n stable 。

2. 给 Node 多分配内存（默认 2 GB 不够时）  
   set NODE_OPTIONS=--max_old_space_size=4096  
   npx create-react-app my-app 。

3. 杀毒/安全软件实时扫描 node_modules 会拖慢 10 倍，创建前临时关闭 。

--------------------------------
五、终极方案：不用 CRA，换 Vite
--------------------------------
如果以上都救不了，30 s 即可用 Vite 起 React 项目，原生 ESM + 预构建，冷启动 < 1 s：  
npm create vite@latest my-app --template react  
cd my-app && npm i && npm run dev 。

--------------------------------
六、常见“卡”点速查表
--------------------------------
| 卡住阶段 | 直接对策 |
|----------|-----------|
| fetchMetadata | 换淘宝源 + 清缓存  |
| Installing react-scripts | 换 yarn/pnpm，或 --skip-install 后手动装  |
| idealTree: sill fetch | Node 版本过旧，升级即可  |
| 进度条 0 % 不动 | 检查代理/防火墙，或切手机热点 |

--------------------------------
七、一句话总结
--------------------------------
「先换国内镜像 → 再清缓存 → 换 yarn/pnpm → 升级 Node」这四步做完，99 % 的 create-react-app 卡顿都能解决；还不行就 30 s 切 Vite，绝对起飞 。祝你创建项目不再“龟速”！