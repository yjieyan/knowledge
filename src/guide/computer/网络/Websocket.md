# Websocket

---

### 1. 核心定义与要解决的问题

**WebSocket** 是一种在单个TCP连接上进行**全双工通信**的网络协议。

**它要解决的核心问题是HTTP协议在实时性方面的不足：**

1.  **半双工与请求-响应模型：** HTTP是半双工的，并且遵循严格的请求-响应模式。客户端必须主动发起请求，服务器才能返回响应。服务器无法主动向客户端“推送”数据。
2.  **头部冗余与高开销：** 每个HTTP请求和响应都携带完整的头部信息（如Cookie、User-Agent等），对于频繁的实时通信，这些冗余数据会带来巨大的带宽和性能开销。
3.  **实时性差：** 为了实现“服务器推送”的假象，前端只能使用低效的**轮询** 或 **长轮询**。
    *   **轮询：** 客户端定时向服务器发送HTTP请求（例如每秒一次）。这会导致大量无效请求，延迟高，服务器压力大。
    *   **长轮询：** 客户端发送请求，服务器hold住连接，直到有数据更新或超时才返回响应。客户端收到响应后立即再次发起请求。这比短轮询稍好，但每次请求仍然包含完整的HTTP头部，并且连接频繁建立和断开。

---

### 2. WebSocket 的工作原理：握手与通信

WebSocket连接分为两个阶段：**HTTP握手** 和 **数据传输**。

#### 阶段一：HTTP握手 (Opening Handshake)

WebSocket连接始于一个特殊的HTTP请求，目的是让客户端和服务器协商升级到WebSocket协议。

**客户端请求头（关键字段）：**
```
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket          # 表示客户端希望升级协议
Connection: Upgrade         # 表示客户端希望升级连接
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ== # 一个16位的随机Base64编码值，用于安全验证
Sec-WebSocket-Version: 13   # WebSocket协议版本（13是当前标准）
Origin: http://example.com  # 用于安全校验，防止跨站攻击
```

**服务器响应头（成功情况）：**
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket          # 同意升级协议
Connection: Upgrade         # 同意升级连接
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= # 对客户端Key计算后的响应值
```

**`Sec-WebSocket-Accept` 的计算过程：**
这是为了防止误操作。服务器会取客户端发送的 `Sec-WebSocket-Key`，加上一个固定的GUID `"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"`，然后计算其SHA-1哈希值，最后进行Base64编码。

如果服务器不支持WebSocket，它会返回一个普通的HTTP响应（如200 OK），那么WebSocket连接就建立失败了。

**握手完成后，状态码为101，表示协议切换成功。此时，底层的TCP连接保持不变，但通信协议已经从HTTP完全转变为了WebSocket协议。**

#### 阶段二：数据传输

握手成功后，连接不再遵循HTTP协议，而是使用轻量级的WebSocket数据帧进行通信。

**WebSocket数据帧的特点：**
*   **二进制帧结构：** 数据被封装在二进制帧中传输，格式非常精简。
*   **极低的头部开销：** 每个帧的头部只有2-14字节，与HTTP头部相比可以忽略不计。
*   **全双工：** 客户端和服务器可以随时、独立地向对方发送消息。
*   **基于消息：** 可以传输文本数据，也可以直接传输二进制数据（如ArrayBuffer、Blob），无需像HTTP那样进行编码/解码。

---

### 3. WebSocket 的特点与优势

| 特性 | 描述 | 优势 |
| :--- | :--- | :--- |
| **全双工通信** | 客户端和服务器可以同时发送和接收数据。 | 实现真正的实时双向通信。 |
| **低延迟** | 建立连接后，数据可以立即推送，无需等待客户端请求。 | 极佳的实时体验。 |
| **低开销** | 数据传输阶段头部极小，没有HTTP那样的冗余头部。 | 节省带宽，适合高频、小数据量的场景。 |
| **持久连接** | 一个连接在整个会话期间保持打开。 | 避免了HTTP频繁建立/断开连接的开销。 |

---

### 4. 前端 API 使用示例

Web API `WebSocket` 提供了非常简洁的接口。

```javascript
// 1. 创建 WebSocket 连接，协议是 ws:// 或 wss:// (加密，相当于HTTPS)
const socket = new WebSocket('wss://echo.websocket.org');

// 2. 监听连接打开事件
socket.onopen = function(event) {
  console.log('Connection established.');
  // 连接成功后，发送一条消息
  socket.send('Hello Server!');
};

// 3. 监听消息接收事件
socket.onmessage = function(event) {
  console.log('Message from server:', event.data);
  // 数据可能是文本 (event.data) 或二进制数据 (event.data 作为 ArrayBuffer/Blob)
};

// 4. 监听错误事件
socket.onerror = function(error) {
  console.error('WebSocket error:', error);
};

// 5. 监听连接关闭事件
socket.onclose = function(event) {
  console.log('Connection closed.', event.code, event.reason);
};

// 发送不同类型的消息
// socket.send(JSON.stringify({ type: 'message', content: 'Hello' })); // 发送JSON
// socket.send(new ArrayBuffer(...)); // 发送二进制数据

// 主动关闭连接
// socket.close(1000, "Work complete"); // 1000是正常关闭的状态码
```

---

### 5. 适用场景

WebSocket并非用来取代HTTP，而是用于特定的实时性要求高的场景。

*   **即时通讯：** 聊天应用（微信、钉钉）。
*   **实时数据流：** 股票行情、实时报价、体育赛事直播。
*   **多人在线协作：** 在线文档（Google Docs）、多人在线游戏。
*   **实时通知与推送：** 社交媒体的点赞、评论通知。
*   **物联网：** 设备状态的实时监控与控制。

---

### 6. 注意事项与局限性

1.  **连接保持与心跳：** 由于是持久连接，可能会被中间节点（代理、防火墙）因超时而断开。通常需要实现**心跳机制**（定期发送小数据包/ping/pong）来保活。
2.  **代理兼容性：** 某些旧的代理服务器可能无法正确理解WebSocket的HTTP升级请求，导致连接失败。
3.  **浏览器支持：** 现代浏览器支持良好，但对于老旧浏览器需要降级方案（如回退到长轮询）。
4.  **复杂性：** 相比简单的HTTP API，你需要自己管理连接状态、重连逻辑、消息序列化/反序列化等。通常会使用成熟的库（如 `Socket.IO`），它提供了自动重连、房间、广播等高级功能，并兼容不支持WebSocket的浏览器。
5.  **可扩展性：** 服务器需要维持大量并发长连接，对服务器的架构设计（如使用集群、Pub/Sub系统）提出了更高要求。
