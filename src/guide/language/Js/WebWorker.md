# WebWork
Web Worker 是 js 中实现**多线程编程**的重要特性，它允许在后台线程中运行脚本，而不会阻塞主线程。
---

### 1. 为什么需要 Web Worker？

JavaScript 是单线程的，这意味着所有任务都在主线程上执行。当遇到计算密集型任务时：

```javascript
// ❌ 阻塞主线程的示例
function heavyCalculation() {
    let result = 0;
    for (let i = 0; i < 1000000000; i++) {
        result += i;
    }
    return result;
}

// 执行这个函数会导致页面卡顿、无响应
document.getElementById('calculate').addEventListener('click', () => {
    const result = heavyCalculation(); // 页面会卡住几秒钟
    console.log(result);
});
```

**Web Worker 解决了：**
- 避免长时间运行的脚本阻塞 UI
- 充分利用多核 CPU
- 提高复杂计算的响应性

---

### 2. Web Worker 的基本概念

#### 特性：
- **真正的多线程**：运行在独立的线程中
- **不能直接操作 DOM**：与主线程隔离
- **通过消息传递通信**：使用 `postMessage` 和 `onmessage`
- **同源限制**：Worker 脚本必须与主脚本同源

#### 类型：
1. **专用 Worker**：只能被创建它的脚本使用
2. **共享 Worker**：可以被多个脚本共享（不同窗口、iframe等）
3. **Service Worker**：主要用于离线缓存和网络代理
4. **Audio Worklet**：用于音频处理

---

### 3. 专用 Worker 的使用

#### 创建和使用流程：

**主线程代码 (main.js)：**
```javascript
// 1. 创建 Worker
const worker = new Worker('worker.js');

// 2. 向 Worker 发送消息
worker.postMessage({
    type: 'CALCULATE',
    data: { numbers: [1, 2, 3, 4, 5] }
});

// 3. 接收来自 Worker 的消息
worker.onmessage = function(event) {
    const { type, data } = event.data;
    
    if (type === 'RESULT') {
        console.log('计算结果:', data.result);
        document.getElementById('result').textContent = data.result;
    }
};

// 4. 错误处理
worker.onerror = function(error) {
    console.error('Worker 错误:', error);
};

// 5. 终止 Worker（不再需要时）
document.getElementById('stop').addEventListener('click', () => {
    worker.terminate();
});
```

**Worker 线程代码 (worker.js)：**
```javascript
// Worker 内部监听消息
self.onmessage = function(event) {
    const { type, data } = event.data;
    
    if (type === 'CALCULATE') {
        // 执行计算密集型任务
        const result = heavyCalculation(data.numbers);
        
        // 将结果发送回主线程
        self.postMessage({
            type: 'RESULT',
            data: { result }
        });
    }
};

function heavyCalculation(numbers) {
    // 模拟复杂计算
    return numbers.reduce((sum, num) => sum + num, 0);
}

// Worker 内部的错误处理
self.onerror = function(error) {
    console.error('Worker 内部错误:', error);
};
```

---

### 4. 完整的实战示例

#### 图像处理 Worker

**主线程 (main.js)：**
```javascript
class ImageProcessor {
    constructor() {
        this.worker = new Worker('image-worker.js');
        this.setupMessageHandling();
    }
    
    setupMessageHandling() {
        this.worker.onmessage = (event) => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'PROCESSING_COMPLETE':
                    this.displayProcessedImage(data.imageData);
                    break;
                case 'PROGRESS_UPDATE':
                    this.updateProgress(data.progress);
                    break;
            }
        };
        
        this.worker.onerror = (error) => {
            console.error('Image Worker 错误:', error);
            this.showError('处理图像时发生错误');
        };
    }
    
    processImage(imageData, filterType) {
        this.worker.postMessage({
            type: 'PROCESS_IMAGE',
            data: { imageData, filterType }
        });
    }
    
    displayProcessedImage(imageData) {
        const canvas = document.getElementById('result-canvas');
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
    }
    
    updateProgress(progress) {
        document.getElementById('progress').style.width = `${progress}%`;
    }
    
    destroy() {
        this.worker.terminate();
    }
}

// 使用示例
const processor = new ImageProcessor();

document.getElementById('upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            processor.processImage(imageData, 'GRAYSCALE');
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
});
```

**Worker 线程 (image-worker.js)：**
```javascript
self.onmessage = function(event) {
    const { type, data } = event.data;
    
    if (type === 'PROCESS_IMAGE') {
        processImageData(data.imageData, data.filterType);
    }
};

function processImageData(imageData, filterType) {
    const { data, width, height } = imageData;
    const totalPixels = width * height;
    
    for (let i = 0; i < totalPixels; i++) {
        const index = i * 4;
        
        // 更新进度（每处理1000个像素报告一次）
        if (i % 1000 === 0) {
            const progress = (i / totalPixels) * 100;
            self.postMessage({
                type: 'PROGRESS_UPDATE',
                data: { progress }
            });
        }
        
        // 应用滤镜
        switch (filterType) {
            case 'GRAYSCALE':
                applyGrayscale(data, index);
                break;
            case 'INVERT':
                applyInvert(data, index);
                break;
            case 'SEPIA':
                applySepia(data, index);
                break;
        }
    }
    
    // 处理完成
    self.postMessage({
        type: 'PROCESSING_COMPLETE',
        data: { imageData }
    });
}

function applyGrayscale(data, index) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    
    // 灰度公式
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    data[index] = gray;     // R
    data[index + 1] = gray; // G
    data[index + 2] = gray; // B
}

function applyInvert(data, index) {
    data[index] = 255 - data[index];         // R
    data[index + 1] = 255 - data[index + 1]; // G
    data[index + 2] = 255 - data[index + 2]; // B
}

function applySepia(data, index) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    
    data[index] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));     // R
    data[index + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168)); // G
    data[index + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131)); // B
}
```

---

### 5. 高级用法和最佳实践

#### 使用 Transferable Objects 提高性能
```javascript
// 主线程
const arrayBuffer = new ArrayBuffer(1000000);
const view = new Uint8Array(arrayBuffer);

// 填充数据...
for (let i = 0; i < view.length; i++) {
    view[i] = i % 256;
}

// 传输 ArrayBuffer（而不是拷贝）
worker.postMessage(
    { type: 'PROCESS_BUFFER', data: view },
    [view.buffer] // 第二个参数指定要传输的对象
);

// 注意：传输后，主线程中的 view 将不可用
```

#### Worker 内使用 importScripts
```javascript
// worker.js
importScripts('lib1.js', 'lib2.js', 'utils.js');

self.onmessage = function(event) {
    // 现在可以使用导入的库
    const result = Lib1.someFunction(event.data);
    self.postMessage({ result });
};
```

#### 错误处理和恢复
```javascript
class RobustWorker {
    constructor(workerUrl, options = {}) {
        this.workerUrl = workerUrl;
        this.options = options;
        this.restartCount = 0;
        this.maxRestarts = options.maxRestarts || 3;
        
        this.createWorker();
    }
    
    createWorker() {
        this.worker = new Worker(this.workerUrl);
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.worker.onmessage = (event) => {
            this.handleMessage(event);
        };
        
        this.worker.onerror = (error) => {
            console.error('Worker 错误:', error);
            
            if (this.restartCount < this.maxRestarts) {
                this.restartCount++;
                console.log(`重启 Worker (${this.restartCount}/${this.maxRestarts})`);
                this.restart();
            } else {
                this.handleFatalError(error);
            }
        };
    }
    
    restart() {
        this.worker.terminate();
        this.createWorker();
        // 重新初始化状态...
    }
    
    handleMessage(event) {
        // 处理正常消息
        const { type, data } = event.data;
        
        switch (type) {
            case 'READY':
                this.restartCount = 0; // 重置重启计数
                break;
            // ... 其他消息处理
        }
    }
    
    terminate() {
        this.worker.terminate();
    }
}
```

---

### 6. 共享 Worker

**创建共享 Worker：**
```javascript
// 主线程
const sharedWorker = new SharedWorker('shared-worker.js');

sharedWorker.port.onmessage = function(event) {
    console.log('来自共享 Worker:', event.data);
};

sharedWorker.port.postMessage('Hello Shared Worker!');
```

**共享 Worker 脚本：**
```javascript
// shared-worker.js
let connections = 0;

self.onconnect = function(event) {
    const port = event.ports[0];
    connections++;
    
    port.postMessage({
        type: 'CONNECTED',
        data: { connections, clientId: connections }
    });
    
    port.onmessage = function(event) {
        // 处理消息，可以广播给所有连接
        console.log('收到消息:', event.data);
    };
};
```

---

### 7. 使用限制和注意事项

#### Worker 环境的限制：
```javascript
// 以下在 Worker 中不可用：
// - window, document, DOM 操作
// - alert, confirm, prompt
// - 某些 Web APIs（如 localStorage）

// 但可以使用：
// - XMLHttpRequest, Fetch API
// - WebSockets
// - IndexedDB
// - 定时器 (setTimeout, setInterval)
// - 大部分 JavaScript 核心功能
```

#### 性能考虑：
```javascript
// ❌ 避免频繁的小消息
for (let i = 0; i < 1000; i++) {
    worker.postMessage({ index: i }); // 太频繁了！
}

// ✅ 批量处理
worker.postMessage({
    type: 'BATCH_PROCESS',
    data: { items: array }
});
```

---

### 8. 现代用法：Worker 池

对于需要大量并行任务的场景，可以使用 Worker 池：

```javascript
class WorkerPool {
    constructor(workerUrl, size = navigator.hardwareConcurrency || 4) {
        this.workerUrl = workerUrl;
        this.size = size;
        this.workers = [];
        this.taskQueue = [];
        this.workerStatus = new Array(size).fill(false);
        
        this.initializeWorkers();
    }
    
    initializeWorkers() {
        for (let i = 0; i < this.size; i++) {
            const worker = new Worker(this.workerUrl);
            worker.id = i;
            
            worker.onmessage = (event) => {
                this.workerStatus[i] = false;
                this.processNextTask(i);
                
                if (event.data.type === 'TASK_COMPLETE') {
                    const { taskId, result } = event.data.data;
                    // 通知任务完成
                }
            };
            
            this.workers.push(worker);
        }
    }
    
    addTask(taskData) {
        return new Promise((resolve) => {
            this.taskQueue.push({ taskData, resolve });
            this.processNextTask();
        });
    }
    
    processNextTask(workerId = null) {
        if (this.taskQueue.length === 0) return;
        
        const availableWorkerId = workerId !== null 
            ? workerId 
            : this.findAvailableWorker();
            
        if (availableWorkerId === -1) return;
        
        const task = this.taskQueue.shift();
        this.workerStatus[availableWorkerId] = true;
        
        this.workers[availableWorkerId].postMessage({
            type: 'EXECUTE_TASK',
            data: task.taskData
        });
        
        // 保存 resolve 函数以便后续调用
        task.workerId = availableWorkerId;
    }
    
    findAvailableWorker() {
        return this.workerStatus.findIndex(status => !status);
    }
}
```

---

### 总结

1. **解决阻塞问题**：将计算密集型任务移到后台线程
2. **提高性能**：充分利用多核 CPU
3. **改善用户体验**：保持主线程响应性

**适用场景：**
- 图像/视频处理
- 大数据计算/分析
- 复杂算法执行
- 实时数据处理
- 物理模拟/游戏计算

**关键要点：**
- Worker 通过消息传递与主线程通信
- 不能直接操作 DOM
- 合理使用 Transferable Objects 提升性能
- 注意错误处理和资源管理
