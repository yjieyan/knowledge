# Promise异步
Promise 是 JavaScript 中处理异步操作的革命性解决方案，它解决了传统回调地狱（Callback Hell）的问题，让异步代码变得更加清晰、可维护。

---

### 1. 核心概念：什么是 Promise？

**Promise** 是一个对象，它代表了一个**异步操作的最终完成（或失败）及其结果值**。

**简单比喻：** 就像餐厅的点餐小票。当你下单后（发起异步操作），服务员会给你一张小票（Promise）。这张小票不是餐点本身，但它是一个承诺：
- 未来某个时刻，餐点准备好了，你可以凭小票取餐（**成功状态**）
- 或者如果厨房没有食材了，小票会告诉你原因（**失败状态**）
- 在等待期间，小票一直处于等待状态（**待定状态**）

---

### 2. Promise 的三种状态

Promise 有三种不可逆的状态，这是理解其工作原理的关键：

1.  **`pending`（待定）：** 初始状态，既没有被兑现，也没有被拒绝。
2.  **`fulfilled`（已兑现）：** 意味着操作成功完成。
3.  **`rejected`（已拒绝）：** 意味着操作失败。

**状态转换：** `pending` → `fulfilled` 或 `pending` → `rejected`。一旦状态改变，就**不能再变**。

---

### 3. 创建 Promise

使用 `new Promise()` 构造函数来创建 Promise 实例。

```javascript
const myPromise = new Promise((resolve, reject) => {
  // 这里是执行异步操作的地方
  // 比如：AJAX 请求、setTimeout、读取文件等
  
  const success = true; // 模拟操作是否成功
  
  setTimeout(() => {
    if (success) {
      resolve('Operation completed successfully!'); // 状态从 pending -> fulfilled
    } else {
      reject(new Error('Something went wrong!')); // 状态从 pending -> rejected
    }
  }, 1000);
});
```

**参数说明：**
- `resolve`: 函数，调用时将 Promise 状态变为 `fulfilled`，并传递结果值。
- `reject`: 函数，调用时将 Promise 状态变为 `rejected`，并传递错误原因。

---

### 4. 使用 Promise：`.then()`、`.catch()`、`.finally()`

#### `.then()` - 处理成功和失败
接收两个回调函数参数：
- `onFulfilled`: 当 Promise 变为 `fulfilled` 时调用
- `onRejected`: 当 Promise 变为 `rejected` 时调用（可选）

```javascript
myPromise.then(
  (result) => {
    console.log('Success:', result); // "Operation completed successfully!"
  },
  (error) => {
    console.error('Failure:', error); // 如果失败会执行这里
  }
);
```

#### `.catch()` - 专门处理失败
是 `.then(null, onRejected)` 的语法糖，更推荐使用。

```javascript
myPromise
  .then((result) => {
    console.log('Success:', result);
  })
  .catch((error) => {
    console.error('Failure:', error);
  });
```

#### `.finally()` - 无论成功失败都会执行
用于执行清理操作，不接收任何参数。

```javascript
myPromise
  .then((result) => console.log('Success:', result))
  .catch((error) => console.error('Failure:', error))
  .finally(() => {
    console.log('Operation attempt finished'); // 无论成功失败都会执行
  });
```

---

### 5. Promise 链式调用

这是 Promise 最强大的特性之一。每个 `.then()` 都返回一个**新的 Promise**，可以继续调用 `.then()`。

```javascript
function asyncOperation(value) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value * 2), 1000);
  });
}

asyncOperation(2)
  .then(result => {
    console.log(result); // 4
    return asyncOperation(result); // 返回新的 Promise
  })
  .then(result => {
    console.log(result); // 8
    return result + 10; // 返回普通值，会自动包装为 resolved Promise
  })
  .then(result => {
    console.log(result); // 18
    throw new Error('Something broke!'); // 抛出错误，返回 rejected Promise
  })
  .catch(error => {
    console.error('Caught error:', error);
    return 'recovered value'; // 从错误中恢复
  })
  .then(result => {
    console.log('After recovery:', result); // "recovered value"
  });
```

**链式调用的优势：**
- 解决了回调地狱，代码呈纵向发展而非横向嵌套
- 错误可以在链式末尾用一个 `.catch()` 统一处理
- 每个 `.then()` 只关注自己的任务，职责单一

---

### 6. Promise 的静态方法

#### `Promise.resolve()` / `Promise.reject()`
快速创建已确定状态的 Promise。

```javascript
// 创建已成功的 Promise
Promise.resolve('immediate value').then(console.log); // "immediate value"

// 创建已失败的 Promise  
Promise.reject(new Error('immediate error')).catch(console.error); // Error: immediate error
```

#### `Promise.all()` - 等待所有 Promise 完成
接收一个 Promise 数组，当**所有** Promise 都成功时，返回结果数组；如果**任何一个** Promise 失败，立即失败。

```javascript
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = new Promise(resolve => setTimeout(() => resolve(3), 1000));

Promise.all([promise1, promise2, promise3])
  .then(results => {
    console.log(results); // [1, 2, 3] (大约1秒后)
  })
  .catch(error => {
    console.error('One of them failed:', error);
  });
```

**使用场景：** 多个相互不依赖的异步操作全部完成后，再执行后续逻辑。

#### `Promise.race()` - 竞速
接收一个 Promise 数组，返回**第一个**完成（成功或失败）的 Promise 的结果。

```javascript
const timeout = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error('Timeout!')), 5000);
});

const fetchData = fetch('/api/data');

Promise.race([fetchData, timeout])
  .then(response => {
    console.log('Data fetched in time');
  })
  .catch(error => {
    console.error('Either timeout or fetch failed:', error);
  });
```

**使用场景：** 请求超时控制。

#### `Promise.allSettled()` - 等待所有 Promise 结束
等待所有 Promise 完成（无论成功或失败），返回描述每个 Promise 结果的对象数组。

```javascript
const promises = [
  Promise.resolve('success'),
  Promise.reject('error'),
  Promise.resolve('another success')
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log('Success:', result.value);
      } else {
        console.log('Failed:', result.reason);
      }
    });
  });
```

#### `Promise.any()` - 等待第一个成功的 Promise
接收一个 Promise 数组，返回**第一个成功**的 Promise 的结果。如果所有 Promise 都失败，则返回一个 AggregateError。

```javascript
const server1 = fetch('https://server1.com/data');
const server2 = fetch('https://server2.com/data');
const server3 = fetch('https://server3.com/data');

Promise.any([server1, server2, server3])
  .then(response => {
    console.log('Data from fastest available server:', response);
  })
  .catch(error => {
    console.error('All servers failed:', error);
  });
```

---

### 7. 错误处理的最佳实践

```javascript
// ❌ 不好的做法 - 在 then 中抛出错误但没有 catch
somePromise
  .then(result => {
    throw new Error('Oops');
  }); // UnhandledPromiseRejectionWarning!

// ✅ 好的做法 - 总是以 catch 结尾
somePromise
  .then(result => {
    throw new Error('Oops');
  })
  .catch(error => console.error('Handled:', error));

// ✅ 在 async/await 中使用 try-catch
async function fetchData() {
  try {
    const result = await somePromise;
    // 处理结果
  } catch (error) {
    console.error('Handled:', error);
  }
}
```

---

### 8. Promise 与 async/await

`async/await` 是建立在 Promise 之上的语法糖，让异步代码看起来像同步代码。

```javascript
// 使用 Promise
function fetchUserData() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => fetch(`/api/posts/${user.id}`))
    .then(posts => console.log(posts))
    .catch(error => console.error(error));
}

// 使用 async/await (更清晰)
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    const posts = await fetch(`/api/posts/${user.id}`);
    console.log(posts);
  } catch (error) {
    console.error(error);
  }
}
```

**关键点：**
- `async` 函数总是返回一个 Promise
- `await` 只能在 `async` 函数中使用
- `await` 会暂停代码执行，直到 Promise 完成

---

### 总结

1.  **三种状态：** `pending`、`fulfilled`、`rejected`，状态转换不可逆
2.  **链式调用：** 通过 `.then()`、`.catch()`、`.finally()` 组合异步操作
3.  **组合方法：** `Promise.all()`、`Promise.race()`、`Promise.allSettled()`、`Promise.any()` 用于处理多个 Promise
4.  **错误处理：** 使用 `.catch()` 或 `try-catch`（在 async/await 中）统一处理错误
5.  **发展趋势：** `async/await` 让 Promise 的使用更加直观

