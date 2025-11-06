# 核心面试题

1. 统计前端请求耗时
   - Performance API
        ```js
        // 1. fetch + performance API
        // 发送请求前记录当前时间戳
        const startTime = performance.now();
        // 在请求的 then 或 catch 中记录结束时间戳
        fetch('/api/data')
          .then(data => {
            const endTime = performance.now();
          })
          .catch(error => console.error('请求失败:', error));
        // 2. xmlHttpRequest + performance API
        // 3. axios + performance API
        ```
   - performance.timing
        performance.timing 对象包含了网页加载过程中的各个时间点信息。
        可以计算 responseEnd - requestStart 来获取请求耗时。
        ```js
        // 获取所有资源的加载耗时
        function getResourceTiming() {
            const resources = performance.getEntriesByType('resource');
            
            const resourceStats = resources.map(resource => ({
                name: resource.name,
                duration: resource.duration,
                type: resource.initiatorType,
                size: resource.transferSize,
                dns: resource.domainLookupEnd - resource.domainLookupStart,
                tcp: resource.connectEnd - resource.connectStart,
                request: resource.responseStart - resource.requestStart,
                response: resource.responseEnd - resource.responseStart
            }));
            
            console.log('资源加载统计:', resourceStats);
            
            // 按类型分组统计
            const byType = resourceStats.reduce((acc, curr) => {
                const type = curr.type;
                if (!acc[type]) acc[type] = [];
                acc[type].push(curr);
                return acc;
            }, {});
            
            return { resourceStats, byType };
        }
        ```
    - web worker
2. 如何保证项目质量
    * 需求分析与规划
        1.明确需求:
        - 与项目相关方(如客户、产品经理、团认成员等)进行充分沟通，确保对项目的目标、功能需求、性能需求、用户体验要求等有清晰的理解。
        - 形成详细的需求文档，作为项目开发的衣据。
        2.项目规划:
        - 制定合理的项目计划，包括项目时间表里程碑、任务分配等。确保项目进度合理，各个阶段任务明确。
        - 考虑风险因素，制定风险应对计划，提前预防和应对可能出现的问题。
    * 设计与开发阶段
        1.良好的架构设计:
        - 设计合理的软件架构，确保系统的可扩展性、可维护性和性能。
        - 遵循设计模式和最佳实践，提高代码的质量和可读性。
        2.代码规范：
        - 遵循统一的代码规范，如命名规范、缩进规范、注释规范等。
        - 使⽤代码格式化工具（如Prettier、ESLint等）进⾏代码格式化，保持代码的统⼀性和可读性。
        3.测试驱动开发(TDD):
        - 采用 TDD的方法，先编写测试用例，再编写实现代码。确保代码的功能正确性，同时提高代码的可测试性。
        - 包括单元测试、集成测试、端到端测试等不同层次的测试，全面覆盖项目的各个部分。
        4.代码审查
        - 进行代码审查，让团队成员互相检查代码。可以发现潜在的问题、提高代码质量，并促进知识共享和团队协作。
        - 可以使用工具(如 GitHub PullRequests 等)来进行代码审查流程管理。
    * 质量控制与保证
        - 建立 CI/CD 流程，自动构建、测试和部署项目。确保每次代码提交都能经过严格的测试，及时发现问题并修复。使用工具(如 Jenkins、GitLab Cl/cD、GitHub Actions等)来实现 CI/CD。
        - 性能测试
        - 安全测试

    * 项目管理与团队协作
        - 有效的项目管理是保证项目质量的关键。使用项目管理工具(如JIRA、Trello 等)来跟踪项目进度、任务分配和问题解决。
        - 定期召开项目会议，及时沟通项目进展、问题和解决方案。
        - 建立良好的团队协作氛围，鼓励团队成员之间的沟通和合作。
        - 进行团队培训和知识分享，提高团队成员的技术水平和综合素质。
    * 持续改进
        在项目上线后，收集用户反馈和系统运行数据。了解用户的使用体验和系统的性能表现，发现潜在的问题和改进点。

4. [⻚⾯加载的时候发现⻚⾯空⽩](./article/页面加载的时候发现页面空白.md)
   
   1. **打开浏览器开发者工具** - 查看Console错误信息
   2. **检查Network面板** - 查看请求是否成功
   3. **检查Elements面板** - 查看DOM是否正常渲染  
   4. **检查Vue Devtools** - 查看Vue组件状态
   5. **检查路由配置** - 确保路由指向正确的组件
   6. **检查资源路径** - 图片、CSS、JS路径是否正确
   7. **检查服务器状态** - 接口是否正常响应
   8. **检查网络连接** - DNS解析和网络连通性

7. 如何防⽌重复提交
    ⼀般使⽤的是防抖和节流，节流函数通过控制每次时间执⾏的时间间隔，控制短时间多次执⾏⽅法。
    防抖函数是推迟每次事件执⾏的时间减少不必要的查询。但是⽹络慢的时候，还是会重复提交，没有
    显⽰状态，⽤⼾不知道有没有真的提交。所以就给按钮添加⼀个加载状态，查了发现el-button⾃带了
    loading属性，传参的时候传⼀个submit函数，是⼀个Promise,promise状态改变的时候把loading状
    态改成false。然后点击按钮会有加载动画，加载的时候，按钮是禁⽤的。
    **需要等待用户停止操作，还是只需要控制操作的频率？**
    - 等待停止 → 防抖
    - 控制频率 → 节流
8. 填写信息的⻚⾯，返回的时候填写信息需要留存
    ⽤vue的keep-alive实现
9.  axios⽤post请求数据会被拦截，传不到后端
    **核心原因**：Axios 默认使用 JSON 格式，而后端期望的是表单格式。

    | 特性 | jQuery Ajax | Axios |
    |------|-------------|-------|
    | **POST 默认 Content-Type** | `application/x-www-form-urlencoded` | `application/json` |
    | **数据格式** | 表单格式 | JSON 字符串 |
    | **后端接收** | 直接解析为参数 | 需要解析 JSON |

    ```javascript
    /**方案1：使用 QS 库*/
    import axios from 'axios';
    import qs from 'qs';

    axios.interceptors.request.use(config => {
    if (config.method === 'post') {
        config.data = qs.stringify(config.data);
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return config;
    });

    /**方案2：使用 URLSearchParams*/
    const params = new URLSearchParams();
    params.append('name', '张三');
    params.append('age', '25');
    params.append('email', 'zhangsan@example.com');

    axios.post('/api/user', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    /**方案3：修改后端支持 JSON*/
    ```
10. 实现从详情⻚返回列表⻚保存上次加载的数据和⾃动还原上次的浏览位置
    用 scrollBehavior 处理滚动位置恢复
    用 activated 处理数据刷新和组件状态恢复
    用 deactivated 处理资源清理和状态保存
11. 解决vuex持久化
    情景是列表⻚跳转到详情⻚，详情⻚是新窗⼝，2个窗⼝都⽤到vuex state,⽐如共享同⼀个id数组，修改state数据之后，详情⻚不能实时更新state数据，只能⽤缓存解决，⽐如localStorage，也有组件vuex-persistedstate，把vuex数据动态更新成storage。

    **每个浏览器窗口或标签页都有自己独立的 Vuex 存储实例**，即使它们加载了相同的应用代码，内存中的 `state` 也是完全隔离的。
    因此，在一个窗口中修改 `state`，另一个窗口是无法直接感知和更新的。

    要解决这个问题，核心思路是**选择一个所有窗口都能访问到的“公共区域”来存储和同步状态**。


    | 特性 | 本地存储 (localStorage/sessionStorage) | 广播通信 (Broadcast Channel) |
    | :--- | :--- | :--- |
    | **数据持久性** | 持久化（localStorage）或会话级（sessionStorage） | 仅限当前会话，页面关闭后失效 |
    | **跨窗口同步** |  通过监听 `storage` 事件实现 | 专为跨窗口通信设计，非常高效 |
    | **数据容量** | 较大（通常几MB） | 适用于消息或较小数据包 |
    | **兼容性** | 广泛支持 | 需要现代浏览器支持 |
    | **典型应用** | 持久化用户登录状态、购物车数据 | 实时同步标签页状态、通知 |

    方案一：使用本地存储 (localStorage) 与 `storage` 事件

    这个方案利用浏览器的本地存储作为状态的“中央数据库”，并通过监听存储变化事件来同步各个窗口的 Vuex 状态。`vuex-persistedstate` 插件可以自动化这个过程。

    **1. 配置 Vuex 和持久化插件**

    **2. 监听跨窗口同步事件**

    在应用的入口文件或根组件中，添加对 `window` 的 `storage` 事件的监听。
    当其他同源页面修改了localStorage，且修改的key是我们关注的时，触发此事件
    当检测到变化时，重新从localStorage加载状态到当前窗口的Vuex中

    方案二：使用广播通信 API (Broadcast Channel)

    如果应用不需要持久化数据，只需要在多个打开的标签页间保持状态同步，那么 **Broadcast Channel API** 是一个更轻量、更实时的选择。

    - **需要持久化，且兼容性要求高**：选择 **方案一（localStorage + `vuex-persistedstate`）**。这是目前最成熟、应用最广的方案。
    - **追求实时同步，且为现代浏览器环境**：可以尝试 **方案二（Broadcast Channel）**，它更为简洁和高效。
6. 使⽤history模式后访问内容⻚，刷新会404
    需要后端重定向配置服务器。
7. 控制ajax执⾏先后顺序
    ```js
    /**顺序执行 第一个请求完成后，再发第二个请求*/
    $.ajax('/api1')
    .then(function(data1) {
        // 使用第一个请求的结果发起第二个请求
        return $.ajax('/api2', { data: data1 });
    })
    .then(function(data2) {
        // 两个请求都按顺序完成了
        renderToPage(data2);
    });
    /**并行执行，顺序处理 同时发起请求，但按顺序处理结果*/
    var deferred1 = $.ajax('/api1');
    var deferred2 = $.ajax('/api2');

    // 等两个都完成后执行
    $.when(deferred1, deferred2)
    .then(function(result1, result2) {
        // 两个请求都完成了，可以按需要处理数据
        renderToPage(result1[0], result2[0]);
    });

    /**现代解决方案*/
    // 使用async/await更清晰
    async function fetchDataInOrder() {
        showLoading(); // 显示Loading
        try {
            const result1 = await $.ajax('/api1');
            const result2 = await $.ajax('/api2');
            
            renderToPage(result1, result2);
        } catch (error) {
            console.error('请求失败:', error);
        } finally {
            hideLoading(); // 隐藏Loading
        }
    }
    ```
8. vue项⽬中⽤v-for 循环本地图⽚， 图⽚不显⽰

    - 如果图片位于 `src/assets` 目录下，直接使用 `require`，`require` 会告诉 Webpack 在编译时将这个模块图片纳入依赖关系图中。

    - 将你的图片文件夹（例如 `images`）放入项目根目录下的 `public` 文件夹中，在模板中直接使用绝对路径引用这些图片。
9. 菜单权限⽤动态添加路由addRoutes解决
   1. **路由分层**：静态路由 + 动态路由
   2. **权限过滤**：根据用户角色过滤可访问路由
   3. **动态添加**：使用 `router.addRoutes()` 添加过滤后的路由
   4. **菜单生成**：基于权限路由表生成侧边栏菜单
   5. **路由守卫**：在导航守卫中处理权限验证和路由初始化
10. [Storage封装](./article/Storage封装.md)

