# uniapp传参
在 UniApp 中，页面间传递参数有多种方式，你可以根据数据量大小、传递场景（如普通页面、TabBar页面）和数据类型来选择。

| 传参方式 | 核心方法/概念 | 适用场景 |
| :--- | :--- | :--- |
| **URL 拼接参数** | 跳转时在`url`后拼接，目标页在`onLoad`的`options`中取 | 传递简单数据（字符串、数字），最常用 |
| **事件通道** | 跳转时用`getOpenerEventChannel`和`emit`，目标页用`on`监听 | 传递复杂数据（对象、数组），可双向通信 |
| **全局变量/状态** | `Vuex`/`globalData` | 跨多页面共享数据，复杂数据 |
| **本地存储** | `uni.setStorageSync`/`uni.getStorageSync` | **TabBar 页面**传参、需持久化数据 |
| **事件总线** | `uni.$emit`/`uni.$on` | 全局事件监听，任意组件或页面间通信 |
| **页面实例** | `getCurrentPages()`获取页面实例修改数据 | **页面返回时**传递数据 |

### 💡 各种传参方式的详细说明

#### 📍 URL拼接参数
这是最简单直接的方式，适合传递字符串、数字等简单数据。
- **发送参数**：在跳转的`url`后以`?`开头，使用`key=value`形式拼接，多个参数用`&`连接。
  ```javascript
  uni.navigateTo({
    url: '/pages/detail/detail?id=1&name=UniApp'
  });
  ```
- **接收参数**：在目标页面的`onLoad`生命周期函数的`options`参数中获取。
  ```javascript
  export default {
    onLoad(options) {
      console.log(options.id); // 1
      console.log(options.name); // 'UniApp'
    }
  }
  ```
- **传递对象/数组**：如果需要传递对象或数组，可以先将其转换为JSON字符串，并使用`encodeURIComponent`进行编码，在接收端再解码和解析。
  ```javascript
  // 发送页面
  const item = { id: 1, name: 'UniApp' };
  uni.navigateTo({
    url: '/pages/detail/detail?item=' + encodeURIComponent(JSON.stringify(item))
  });
  
  // 接收页面
  onLoad(options) {
    if (options.item) {
      const item = JSON.parse(decodeURIComponent(options.item));
      console.log(item.name); // 'UniApp'
    }
  }
  ```

#### 📨 事件通道 (EventChannel)
事件通道允许传递复杂数据，并且支持在页面间进行双向通信。
- **发送参数**：在跳转时通过`events`定义事件，在`success`回调中通过`eventChannel.emit`发送数据。
  ```javascript
  uni.navigateTo({
    url: '/pages/detail/detail',
    events: {
      // 注册一个事件，用于接收从详情页传回的数据
      acceptDataFromDetail: (data) => {
        console.log('来自详情页的数据:', data);
      }
    },
    success: (res) => {
      // 通过事件通道向详情页发送数据
      res.eventChannel.emit('sendDataToDetail', { 
        message: '这是来自首页的数据' 
      });
    }
  });
  ```
- **接收参数**：在目标页面，通过`getOpenerEventChannel`方法获取事件通道，并使用`on`方法监听发送方页面定义的事件。
  ```javascript
  export default {
    onLoad(options) {
      const eventChannel = this.getOpenerEventChannel();
      
      // 监听首页的 'sendDataToDetail' 事件，接收数据
      eventChannel.on('sendDataToDetail', (data) => {
        console.log(data.message); // '这是来自首页的数据'
      });
      
      // 触发事件，向首页发送数据
      eventChannel.emit('acceptDataFromDetail', {
        message: '这是详情页的回信'
      });
    }
  }
  ```

#### 🌐 全局变量与状态管理
对于需要在多个页面共享的数据，或者复杂对象，可以使用全局变量或状态管理。
- **使用 Vuex**：Vuex适合管理集中的、复杂的应用状态。
  ```javascript
  // store/index.js
  export default new Vuex.Store({
    state: {
      userInfo: null
    },
    mutations: {
      setUserInfo(state, info) {
        state.userInfo = info;
      }
    }
  });
  
  // 页面A：存储数据
  this.$store.commit('setUserInfo', { name: '张三', age: 18 });
  
  // 页面B：读取数据
  const user = this.$store.state.userInfo;
  ```
- **使用 `globalData`**：`globalData`是UniApp提供的一种简单的全局变量实现，在`App.vue`中定义。
  ```javascript
  // App.vue
  export default {
    globalData: {
      userInfo: null
    },
    // ...
  }
  
  // 任意页面读取/设置
  const app = getApp();
  // 设置
  app.globalData.userInfo = { name: '李四' };
  // 读取
  console.log(app.globalData.userInfo);
  ```

#### 💾 本地存储
通过UniApp的存储API (`uni.setStorageSync`等) 将数据存储在本地，适用于TabBar页面传参等场景。
```javascript
// 页面A：存储数据
uni.setStorageSync('token', 'user123456');

// 页面B（例如TabBar页面）：在onShow生命周期中获取数据
onShow() {
  const token = uni.getStorageSync('token');
  console.log(token); // 'user123456'
}
```
**注意**：存储在本地的数据除非手动清除或覆盖，否则会一直存在。敏感或临时数据需注意及时清理。

#### 📢 事件总线 (EventBus)
事件总线允许进行全局的事件监听和触发，适用于非父子组件、任意页面间的通信。
- **监听事件**：在一个页面使用`uni.$on`监听某个事件。
  ```javascript
  // 页面A：监听登录事件
  uni.$on('login', (userInfo) => {
    this.userInfo = userInfo;
  });
  ```
- **触发事件**：在另一个页面使用`uni.$emit`触发该事件。
  ```javascript
  // 页面B：登录成功后，触发全局登录事件
  uni.$emit('login', {
    avatarUrl: 'https://...',
    token: 'user123456',
    userName: 'unier'
  });
  ```
- **移除事件监听**：为避免重复监听，在页面卸载时（`onUnload`）使用`uni.$off`移除事件监听。
  ```javascript
  onUnload() {
    uni.$off('login');
  }
  ```

#### ↩️ 页面返回时传参
通过获取页面栈实例，可以直接操作上一级页面的数据或方法，从而实现返回传参。
```javascript
// 详情页返回时，向首页传递数据
goBack() {
  const pages = getCurrentPages();
  const prevPage = pages[pages.length - 2]; // 上一个页面实例
  // 调用上一个页面的方法，并传递数据
  prevPage.$vm.receiveDataFromDetail({ message: '更新数据' });
  uni.navigateBack();
}
```
在首页（上一个页面）需要定义`receiveDataFromDetail`方法来接收数据。

### 💎 如何选择传参方式

- **简单数据传递（如ID、名称）**：优先选择 **URL拼接参数**。
- **复杂数据传递（如对象、数组）或需要双向通信**：使用**事件通道 (EventChannel)**。
- **TabBar页面间传参**：必须使用**本地存储**或**全局变量/状态管理**，因为`uni.navigateTo`不能用于跳转TabBar页面。
- **返回上一页时传参**：使用**页面实例**方式。
- **数据需要在非常多页面共享**：考虑使用 **Vuex** 或 **事件总线**。
