# JavaScript 的事件循环

## 1. 什么是事件循环？

事件循环（Event Loop）是 JavaScript 实现**非阻塞 I/O** 和**异步编程**的核心机制。

它允许 JavaScript 在执行耗时操作（如网络请求、文件读写等）时不会阻塞主线程，从而保持应用的响应性。

## 2. JavaScript 运行时的基本架构

### 2.1 核心组件

```
┌───────────────────────────┐
│        Call Stack         │  ← 执行上下文栈
└───────────────────────────┘
             │
┌───────────────────────────┐
│   Web APIs / Node.js APIs │  ← 浏览器或Node.js提供的API
└───────────────────────────┘
             │
┌───────────────────────────┐
│   Task Queue (MacroTask)  │  ← 宏任务队列
│  - setTimeout/setInterval │
│  - I/O 操作              │
│  - UI 渲染               │
└───────────────────────────┘
             │
┌───────────────────────────┐
│  MicroTask Queue          │  ← 微任务队列
│  - Promise.then/catch/    │
│  - process.nextTick       │
│  - MutationObserver      │
└───────────────────────────┘
             │
┌───────────────────────────┐
│     Event Loop           │  ← 事件循环协调器
└───────────────────────────┘
```

## 3. 事件循环的工作流程

### 3.1 详细执行步骤

```javascript
// 示例代码分析执行流程
console.log('Script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
    console.log('Promise 1');
}).then(function() {
    console.log('Promise 2');
});

console.log('Script end');
```

**执行顺序：**
1. `Script start`
2. `Script end`
3. `Promise 1`
4. `Promise 2`
5. `setTimeout`

### 3.2 事件循环的完整周期

```
循环开始
    ↓
执行一个宏任务（从宏任务队列）
    ↓
执行所有微任务（直到微任务队列为空）
    ↓
是否需要渲染？（浏览器环境）
    ↓
进入下一轮循环
```

## 4. 任务队列的类型

### 4.1 宏任务（MacroTask/Task）

- **setTimeout / setInterval**
- **I/O 操作**（文件读写、网络请求）
- **UI 渲染**（浏览器）
- **setImmediate**（Node.js）
- **requestAnimationFrame**（浏览器）
- **事件回调**（click、load等）

### 4.2 微任务（MicroTask）

- **Promise.then / .catch / .finally**
- **process.nextTick**（Node.js，优先级最高）
- **MutationObserver**（浏览器）
- **queueMicrotask**（现代浏览器/Node.js）

## 5. 执行优先级详解

### 5.1 完整的优先级链

```javascript
console.log('1. 同步代码开始');

// process.nextTick (Node.js 特有，最高优先级)
process.nextTick(() => {
    console.log('2. nextTick 1');
});

// Promise (微任务)
Promise.resolve().then(() => {
    console.log('3. Promise 1');
});

// setTimeout (宏任务)
setTimeout(() => {
    console.log('4. setTimeout 1');
    
    process.nextTick(() => {
        console.log('5. nextTick in setTimeout');
    });
    
    Promise.resolve().then(() => {
        console.log('6. Promise in setTimeout');
    });
}, 0);

// setImmediate (Node.js 宏任务)
setImmediate(() => {
    console.log('7. setImmediate');
});

console.log('8. 同步代码结束');
```

**输出顺序：**
```
1. 同步代码开始
8. 同步代码结束
2. nextTick 1
3. Promise 1
4. setTimeout 1
5. nextTick in setTimeout
6. Promise in setTimeout
7. setImmediate
```

## 6. Node.js 与浏览器事件循环的差异

### 6.1 Node.js 事件循环阶段

```
   ┌───────────────────────────┐
┌─>│           timers          │ ← setTimeout/setInterval
│  └───────────────────────────┘
│  ┌───────────────────────────┐
│  │     pending callbacks     │ ← I/O 回调
│  └───────────────────────────┘
│  ┌───────────────────────────┐
│  │       idle, prepare       │ ← 内部使用
│  └───────────────────────────┘
│  ┌───────────────────────────┐
│  │           poll            │ ← 检索新的I/O事件
│  └───────────────────────────┘
│  ┌───────────────────────────┐
│  │           check           │ ← setImmediate
│  └───────────────────────────┘
│  ┌───────────────────────────┐
└──┤      close callbacks      │ ← 关闭事件回调
   └───────────────────────────┘
```

### 6.2 浏览器事件循环

```javascript
// 浏览器中的渲染时机
function updateDOM() {
    console.log('开始更新DOM');
    
    // 宏任务
    setTimeout(() => {
        console.log('setTimeout - 宏任务');
    }, 0);
    
    // 微任务
    Promise.resolve().then(() => {
        console.log('Promise - 微任务');
        // 此时DOM尚未渲染
    });
    
    // 同步DOM操作
    document.body.innerHTML += '<p>新的内容</p>';
    console.log('DOM已更新，但尚未渲染到屏幕');
}

updateDOM();
```

## 7. 实际应用场景分析

### 7.1 避免阻塞事件循环

```javascript
// ❌ 错误的做法 - 阻塞事件循环
function blockingOperation() {
    const start = Date.now();
    // 同步阻塞操作
    while (Date.now() - start < 5000) {
        // 阻塞5秒
    }
    console.log('阻塞操作完成');
}

// ✅ 正确的做法 - 使用异步
function nonBlockingOperation() {
    console.log('开始非阻塞操作');
    
    // 使用 setTimeout 分解任务
    function doChunk(start) {
        const chunkSize = 1000;
        let i = 0;
        
        function processChunk() {
            while (i < chunkSize && Date.now() - start < 50) {
                // 处理小块任务
                i++;
            }
            
            if (i < chunkSize) {
                // 继续处理下一块
                setTimeout(() => processChunk(), 0);
            } else {
                console.log('非阻塞操作完成');
            }
        }
        
        processChunk();
    }
    
    doChunk(Date.now());
}
```

### 7.2 批量处理高频率事件

```javascript
class EventBatcher {
    constructor() {
        this.batch = [];
        this.isProcessing = false;
    }
    
    addEvent(event) {
        this.batch.push(event);
        
        if (!this.isProcessing) {
            this.isProcessing = true;
            
            // 使用微任务批量处理
            Promise.resolve().then(() => {
                this.processBatch();
            });
        }
    }
    
    processBatch() {
        if (this.batch.length > 0) {
            const eventsToProcess = [...this.batch];
            this.batch = [];
            
            console.log(`批量处理 ${eventsToProcess.length} 个事件`);
            // 处理事件...
            
            // 继续处理可能新加入的事件
            Promise.resolve().then(() => {
                this.processBatch();
            });
        } else {
            this.isProcessing = false;
        }
    }
}
```

## 8. 性能优化技巧

### 8.1 合理使用任务队列

```javascript
// 优化长任务执行
function optimizedHeavyTask() {
    const data = Array(10000).fill().map((_, i) => i);
    
    function processInChunks() {
        const CHUNK_SIZE = 100;
        let processed = 0;
        
        function processChunk() {
            const start = processed;
            const end = Math.min(processed + CHUNK_SIZE, data.length);
            
            // 处理数据块
            for (let i = start; i < end; i++) {
                // 处理逻辑
                data[i] = data[i] * 2;
            }
            
            processed = end;
            
            if (processed < data.length) {
                // 使用不同的异步方法控制执行时机
                if (processed % 1000 === 0) {
                    // 每处理1000个元素让出控制权
                    setTimeout(processChunk, 0);
                } else {
                    // 使用微任务继续处理
                    Promise.resolve().then(processChunk);
                }
            } else {
                console.log('任务完成');
            }
        }
        
        processChunk();
    }
    
    processInChunks();
}
```

### 8.2 避免微任务饥饿

```javascript
class FairScheduler {
    constructor() {
        this.microTaskQueue = [];
        this.macroTaskQueue = [];
        this.isProcessing = false;
    }
    
    addMicroTask(task) {
        this.microTaskQueue.push(task);
        this.scheduleProcessing();
    }
    
    addMacroTask(task) {
        this.macroTaskQueue.push(task);
        this.scheduleProcessing();
    }
    
    scheduleProcessing() {
        if (!this.isProcessing) {
            this.isProcessing = true;
            
            // 使用宏任务开始处理，避免微任务阻塞
            setTimeout(() => {
                this.processQueues();
            }, 0);
        }
    }
    
    processQueues() {
        const MAX_MICRO_TASKS = 100;
        let microTasksProcessed = 0;
        
        // 处理微任务，但有数量限制
        while (this.microTaskQueue.length > 0 && microTasksProcessed < MAX_MICRO_TASKS) {
            const task = this.microTaskQueue.shift();
            task();
            microTasksProcessed++;
        }
        
        // 处理一个宏任务
        if (this.macroTaskQueue.length > 0) {
            const macroTask = this.macroTaskQueue.shift();
            macroTask();
        }
        
        // 如果还有任务，继续调度
        if (this.microTaskQueue.length > 0 || this.macroTaskQueue.length > 0) {
            this.scheduleProcessing();
        } else {
            this.isProcessing = false;
        }
    }
}
```

## 9. 调试和监控

### 9.1 使用 Performance API 监控

```javascript
// 监控任务执行时间
function monitorEventLoop() {
    const taskStartTime = performance.now();
    
    // 执行任务
    performTask();
    
    const taskDuration = performance.now() - taskStartTime;
    
    if (taskDuration > 50) { // 50ms 阈值
        console.warn(`长任务警告: ${taskDuration}ms`);
    }
}

// 检测事件循环延迟
function measureEventLoopLag() {
    const start = Date.now();
    
    setTimeout(() => {
        const lag = Date.now() - start - 100; // 减去预期的100ms
        if (lag > 10) {
            console.warn(`事件循环延迟: ${lag}ms`);
        }
    }, 100);
}
```

## 10. 总结

1. **宏任务和微任务**有不同的优先级和执行时机
2. **Node.js 和浏览器**的事件循环实现有差异
3. **避免阻塞**主线程，合理使用异步操作
4. **监控性能**，及时发现和解决长任务问题
5. **合理调度**任务，平衡响应性和吞吐量
