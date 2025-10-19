# URI
URI（统一资源标识符）是一个在 Web 开发和网络编程中非常基础且核心的概念。它不仅仅是“网址”，而是一个更广义的抽象。

---

### 1. 核心定义

**URI** 代表 **统一资源标识符**。

*   **统一：** 它有统一的格式和规则，允许不同类型的资源标识符在同一个上下文中使用。
*   **资源：** 可以是任何有身份的东西，如网页、图片、文档、服务，甚至是一个抽象的概念。
*   **标识符：** 用于区分不同资源的字符串。

**通俗理解：** URI 是互联网上资源的“身份证号”或“唯一地址”。它告诉我们一个资源是什么，以及在哪里可以找到它。

---

### 2. URI 的组成结构

一个完整的 URI 由多个组件组成，以下是其标准格式：

```
  scheme:[//[user[:password]@]host[:port]][/path][?query][#fragment]
  |______|  |_____________________________||______| |____| |_______|
     |                  |                    |        |       |
   方案       权限（认证信息+服务器地址）     路径     查询字符串  片段
```


```
https://john:doe@www.example.com:8080/products/index.html?category=electronics&page=2#reviews
```

#### a) 方案 / 协议

*   **定义：** 指定访问资源所使用的协议。
*   **示例：** `https:`, `http:`, `ftp:`, `mailto:`, `file:`, `data:`
*   **作用：** 告诉客户端（如浏览器）应该使用哪种“语言”与服务器通信。

#### b) 权限

权限部分提供了关于资源所在主机的信息，它本身又包含几个子部分：

*   **用户信息：** `john:doe@`
    *   可选的认证信息（用户名和密码）。**由于安全原因，在现代 Web 中已不推荐使用。**

*   **主机：** `www.example.com`
    *   资源所在服务器的域名或 IP 地址。

*   **端口：** `:8080`
    *   服务器上用于连接的特定端口号。如果使用协议的默认端口（如 HTTP 的 80，HTTPS 的 443），则可以省略。

#### c) 路径

*   **定义：** `'/products/index.html'`
*   **作用：** 表示资源在服务器上的具体位置，类似于文件系统路径。它通常对应着服务器上的一个文件或一个可处理的端点。

#### d) 查询字符串

*   **定义：** `'?category=electronics&page=2'`
*   **格式：** 以问号 `?` 开头，包含一个或多个 `key=value` 对，不同键值对之间用 `&` 分隔。
*   **作用：** 向服务器传递额外的参数，用于过滤、搜索、分页等。例如，这里的参数告诉服务器：“我想要电子产品类别下的第 2 页数据”。

#### e) 片段

*   **定义：** `'#reviews'`
*   **作用：** 也称为“锚点”，它指向资源内部的某个次级部分。**关键点：** 片段**不会**被发送到服务器，它完全由客户端（浏览器）处理。浏览器会滚动到 ID 为 `reviews` 的 HTML 元素处。

---

### 3. URI vs URL vs URN

*   **URI：** 是统称，涵盖所有用于标识资源的字符串。
*   **URL：** **统一资源定位符**。它不仅是标识，还提供了**定位**（访问）该资源的方法和位置。**几乎所有我们在网上使用的都是 URL。**
*   **URN：** **统一资源名称**。它像一个永久的、与位置无关的“名字”，例如 `urn:isbn:0451450523` 标识了一本书，但不告诉你从哪里获取它。

**一个简单的类比：**
*   **URI** = “人的身份标识”
*   **URL** = “人的家庭住址”（告诉你他是谁，并且在哪里找到他）
*   **URN** = “人的身份证号”（告诉你他是谁，但不告诉你在哪）

**结论：** 所有的 URL 和 URN 都是 URI，但并非所有的 URI 都是 URL 或 URN。在 Web 开发中，我们打交道的基本上都是 URL。

---

### 4. URI 编码

由于 URI 只能使用有限的 ASCII 字符集（出于历史和安全原因），任何超出此范围的字符（如中文、空格、特殊符号）都必须进行编码。

#### 为什么要编码？
1.  **保留字符：** 像 `:`, `/`, `?`, `#`, `&`, `=` 等在 URI 中有特殊含义，不能直接出现在非其作用域的地方。
2.  **不安全字符：** 像空格、引号等可能会被网关或传输协议误解和修改。
3.  **非 ASCII 字符：** 如中文。

#### 如何编码？
使用 **百分号编码**。格式：`%XX`，其中 `XX` 是字符十六进制表示的 ASCII 码。

*   **`encodeURI()` vs `encodeURIComponent()`**
    这是前端开发中非常重要的区别。

| 函数 | 编码范围 | 不编码的字符 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **`encodeURI()`** | 较少 | `A-Z a-z 0-9 ; , / ? : @ & = + $ - _ . ! ~ * ' ( ) #` | **编码整个 URI**。它假定输入是一个完整的 URI，因此会保留那些对 URI 结构有意义的字符。 |
| **`encodeURIComponent()`** | 较多 | `A-Z a-z 0-9 - _ . ! ~ * ' ( )` | **编码 URI 的组成部分**（如查询参数的值）。因为它会编码更多字符，包括 `/`, `:`, `?` 等，所以可以安全地放入查询字符串中。 |

**示例：**
```javascript
const fullUri = 'https://example.com/产品目录?name=张三&age=20';
const paramValue = '张三&age=30'; // 这个值里包含一个&，会破坏查询字符串结构

console.log(encodeURI(fullUri));
// "https://example.com/%E4%BA%A7%E5%93%81%E7%9B%AE%E5%BD%95?name=%E5%BC%A0%E4%B8%89&age=20"
// 注意：它编码了中文路径，但没有编码 `?`, `=`, `&`

console.log(encodeURIComponent(paramValue));
// "%E5%BC%A0%E4%B8%89%26age%3D30"
// 注意：它编码了中文，也编码了 `&` 和 `=`，这样它就可以安全地作为参数值使用了

// 正确构建带参数的 URL
const baseUrl = 'https://example.com/search';
const query = 'vue & react';
const safeUrl = `${baseUrl}?q=${encodeURIComponent(query)}`;
// 结果: "https://example.com/search?q=vue%20%26%20react"
// 如果不用 encodeURIComponent，URL 会变成 `...?q=vue & react`，这会被解析为两个参数 `q=vue` 和 `react=`
```

对应的解码函数是 `decodeURI()` 和 `decodeURIComponent()`。

---

### 5. 在前端开发中的应用

1.  **API 调用：** 使用 `fetch` 或 `axios` 时，需要正确构建请求的 URL 和查询参数。
2.  **路由：** 在单页应用中，Vue Router 和 React Router 等库管理着 URL 路径和查询参数，与组件状态同步。
3.  **页面间传参：** 通过 URL 的查询字符串或片段在不同页面间传递简单数据。
4.  **资源引用：** 在 HTML 或 CSS 中引用图片、脚本、样式表等静态资源。
5.  **`window.location` 对象：** 用于获取和操作当前页面的 URL。
    ```javascript
    // 当前 URL: https://example.com:8080/path?name=value#section
    console.log(window.location.href);     // 完整 URL
    console.log(window.location.protocol); // "https:"
    console.log(window.location.host);     // "example.com:8080"
    console.log(window.location.hostname); // "example.com"
    console.log(window.location.port);     // "8080"
    console.log(window.location.pathname); // "/path"
    console.log(window.location.search);   // "?name=value"
    console.log(window.location.hash);     // "#section"
    ```
6.  **URL API：** 现代浏览器提供了 `URL` 构造函数，可以更方便地解析和构建 URL。
    ```javascript
    const url = new URL('https://example.com/path?name=value#section');
    console.log(url.searchParams.get('name')); // "value"
    url.searchParams.append('page', '2');
    console.log(url.href); // "https://example.com/path?name=value&page=2#section"
    ```

### 总结

URI 是 Web 的基石，它提供了一个标准化的方式来定位和识别网络上的任何资源。