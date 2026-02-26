# uniapp 如何区别或定义页面

---

### 一、 页面的定义（创建）

定义一个页面，通常需要两个核心文件（有时会加上一个样式文件）：

1.  **页面结构文件 (`.vue`)**：这是页面的主体，采用 Vue 单文件组件格式。
2.  **页面配置文件 (`pages.json`)**：在 `pages.json` 的 `pages` 数组中注册页面，以设置其初始样式和基础配置。

#### 1. 创建页面的 `.vue` 文件

在 UniApp 项目中，页面默认存放在 `pages` 目录下。每个页面通常是一个单独的文件夹，里面包含一个 `.vue` 文件。

**示例：创建一个 “首页”**

1.  在项目根目录的 `pages` 文件夹下，新建一个 `index` 文件夹。
2.  在 `index` 文件夹中，新建 `index.vue` 文件。

这个 `.vue` 文件的结构与标准的 Vue 组件完全一致：

```vue
<!-- pages/index/index.vue -->
<template>
  <!-- 视图层：描述页面的结构 -->
  <view class="container">
    <text>这里是首页</text>
    <button @click="goToDetail">跳转到详情页</button>
  </view>
</template>

<script>
  // 逻辑层：页面的数据、方法、生命周期
  export default {
    data() {
      return {
        title: 'Hello UniApp'
      }
    },
    onLoad(options) {
      // 页面加载生命周期，options 是上个页面传递的数据
      console.log('首页加载了', options)
    },
    methods: {
      goToDetail() {
        uni.navigateTo({
          url: '/pages/detail/detail?id=1' // 页面路径
        })
      }
    }
  }
</script>

<style>
  /* 样式层：页面的样式 */
  .container {
    padding: 20rpx;
    background-color: #f8f8f8;
  }
</style>
```

#### 2. 在 `pages.json` 中注册页面

仅仅创建 `.vue` 文件是不够的，你必须在 `pages.json` 中进行注册，应用才能识别这个页面。

**`pages.json` 是关键，它决定了：**
*   哪个页面是首页。
*   页面的路由。
*   页面的窗口表现（导航栏标题、背景色等）。

```json
// pages.json
{
  "pages": [
    // 数组中第一项代表应用启动页
    {
      "path": "pages/index/index", // 页面路径
      "style": {
        "navigationBarTitleText": "首页", // 页面导航栏标题
        "enablePullDownRefresh": true // 是否开启下拉刷新
        // ... 其他很多样式配置
      }
    },
    // 接着注册其他页面
    {
      "path": "pages/detail/detail",
      "style": {
        "navigationBarTitleText": "详情页"
      }
    },
    {
      "path": "pages/user/user",
      "style": {
        "navigationBarTitleText": "我的"
      }
    }
  ],
  // 全局样式，这里的配置会被每个页面继承
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  }
}
```

**重要规则：**
*   `pages` 数组的第一项，就是应用的**首页（启动页）**。
*   `path` 字段不需要写文件后缀，因为 UniApp 会自动寻找 `.vue`, `.nvue` 等文件。

---

### 二、 页面的区别（识别与路由）

主要通过**页面路径（Path）**来区别。

#### 1. 页面路径 (Path)

每个页面在 `pages.json` 中都有一个唯一的 `path`。这个 `path` 就是页面的**身份证**。

*   **路径规则**：从项目根目录开始，去掉文件后缀。例如，`pages/detail/detail.vue` 的路径就是 `"pages/detail/detail"`。
*   **跳转时使用**：在进行页面跳转时，必须使用这个路径。

```javascript
// 正确
uni.navigateTo({
  url: '/pages/detail/detail' // 以 / 开头，从根目录开始
});

// 也可以这样（在页面内跳转时）
uni.navigateTo({
  url: '../detail/detail' // 使用相对路径
});
```

#### 2. 页面 ID (Route)

在页面内部，可以通过 `this.$route` 或当前页面的生命周期函数获取当前页面的信息，其中最核心的就是 `route`，它代表了当前页面的路径标识。

```vue
<script>
export default {
  onLoad(options) {
    // 获取上个页面传递的参数
    console.log('参数：', options); // { id: 1 }

    // 获取当前页面的路径 (String)
    console.log('当前页面路径：', this.$page.route); // 'pages/detail/detail'

    // 在 Vue 实例中，也可以通过 this.$route (注意：与小程序端稍有差异，但通常用 this.$page.route 更准)
  }
}
</script>
```

**总结区别方式：**
*   **对于开发者**：通过 `pages.json` 中的 `path` 和文件在项目中的位置来定义和区别页面。
*   **对于应用运行时**：通过 `url` 中指定的路径来找到并打开对应的页面。
*   **在页面内部**：通过 `this.$page.route` 来识别自己是哪个页面。

---

### 三、 页面的跳转与传参

这是页面之间建立联系的核心。

#### 1. 跳转 API

UniApp 提供了多种跳转方式，对应不同的应用场景：

*   `uni.navigateTo({ url })`：**保留当前页面**，跳转到新页面。可通过 `uni.navigateBack` 返回。**(最常用)**
*   `uni.redirectTo({ url })`：**关闭当前页面**，跳转到新页面。
*   `uni.reLaunch({ url })`：**关闭所有页面**，打开到应用内的某个页面。
*   `uni.switchTab({ url })`：跳转到 `tabBar` 页面，**并关闭所有非 tabBar 页面**。
*   `uni.navigateBack({ delta })`：返回上一页面或多级页面。

#### 2. 传递参数

在跳转的 `url` 中，可以附带参数。

**传递参数：**
```javascript
// 在 A 页面
uni.navigateTo({
  url: '/pages/detail/detail?id=1001&name=UniApp' // 通过 ? 和 & 拼接参数
});
```

**接收参数：**
在目标页面的 `onLoad` 生命周期钩子中接收。

```vue
<script>
// 在 B 页面 (pages/detail/detail.vue)
export default {
  onLoad(options) {
    // options 是一个对象，包含了 url 上的参数
    console.log(options.id);   // '1001'
    console.log(options.name); // 'UniApp'

    // 通常在这里根据 id 去请求接口，获取详情数据
    this.getDetailData(options.id);
  },
  methods: {
    getDetailData(id) {
      // 发起网络请求...
    }
  }
}
</script>
```

---

### 四、 特殊类型的页面

#### 1. TabBar 页面

这是应用底部的标签栏页面。它们的定义方式有特殊要求：

1.  在 `pages.json` 的 `tabBar` 节点中配置。
2.  `list` 数组中的每一项，其 `pagePath` 必须是在 `pages` 节点中已经注册的页面路径。

```json
// pages.json
{
  "pages": [
    { "path": "pages/index/index", "style": { ... } },
    { "path": "pages/cart/cart", "style": { ... } },
    { "path": "pages/user/user", "style": { ... } }
  ],
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "list": [
      {
        "pagePath": "pages/index/index", // 必须是 pages 里已定义的路径
        "text": "首页",
        "iconPath": "static/tab-home.png",
        "selectedIconPath": "static/tab-home-active.png"
      },
      {
        "pagePath": "pages/user/user",
        "text": "我的",
        "iconPath": "static/tab-user.png",
        "selectedIconPath": "static/tab-user-active.png"
      }
    ]
  }
}
```

**跳转 TabBar 页面，必须使用 `uni.switchTab`。**

#### 2. 首页 (Launch Page)

`pages.json` -> `pages` 数组中的第一项就是首页，不可更改。

#### 3. 分包页面

对于大型项目，为了优化首屏加载，会使用分包。分包页面的定义在 `subPackages` 或 `subpages` 节点中，但页面本身的 `.vue` 文件写法没有任何区别。

```json
// pages.json
{
  "pages": [
    { "path": "pages/index/index", "style": { ... } } // 主包页面
  ],
  "subPackages": [
    {
      "root": "pagesA", // 分包根目录
      "pages": [
        {
          "path": "login/login", // 路径是 `pagesA/login/login.vue`
          "style": { ... }
        }
      ]
    }
  ]
}
```

---

### 总结

| 方面 | 如何定义/区别 | 关键点 |
| :--- | :--- | :--- |
| **创建** | 1. 在 `pages` 目录下创建 `.vue` 文件。<br>2. 在 `pages.json` 的 `pages` 数组中注册。 | 两个步骤缺一不可。 |
| **路径(Path)** | 在 `pages.json` 中定义的 `path` 属性。 | 页面的唯一标识符，用于跳转。 |
| **路由(Route)** | 页面内部通过 `this.$page.route` 获取。 | 用于页面内识别自身。 |
| **跳转** | 使用 `uni.navigateTo` 等 API，并传入目标页面的 `url`。 | 区分不同跳转API的用途。 |
| **传参** | 在 `url` 后通过 `?key=value` 拼接。在目标页面 `onLoad(options)` 中接收。 | 参数在 `onLoad` 中获取。 |
| **特殊页面** | **TabBar页面**：需在 `tabBar` 节点配置。<br>**首页**：`pages` 数组第一项。

**分包页面**：在 `subPackages` 节点配置。 | 遵守各自的配置规则。 |

