单元测试是现代前端工程化中保证代码质量、促进良好设计、实现安全重构的基石。Jest 和 Vitest 是当前最主流的两大测试框架，我将从 **核心概念、框架对比、实践模式** 三个方面进行深入解析。

---

### 一、 核心概念：什么是单元测试？

**定义**：单元测试是指对软件中的**最小可测试单元**（在前端通常是函数、类或组件）进行检查和验证。

**核心价值**：
1.  **保证正确性**：确保单个模块的行为符合预期。
2.  **促进重构**：拥有完善的测试套件，重构时更有信心，能快速发现破坏性改动。
3.  **改善设计**：编写可测试的代码会自然地导向**松耦合、高内聚**的设计，因为难以测试的代码通常是设计不佳的信号。
4.  **充当文档**：测试用例本身就是对代码功能的最佳描述。

**一个单元测试的通用结构（Arrange-Act-Assert）**：
```javascript
// 1. Arrange (准备)：设置测试数据和状态
const input = { a: 1, b: 2 };
const expected = 3;

// 2. Act (执行)：调用被测试的函数
const actual = add(input.a, input.b);

// 3. Assert (断言)：验证结果是否符合预期
expect(actual).toBe(expected);
```

---

### 二、 Jest vs Vitest：主流框架深度对比

Jest 是传统的行业标准，而 Vitest 是新兴的现代化挑战者。

#### Jest： “配置完备”的王者

*   **定位**：一个 **“零配置”** 的全功能测试框架。由 Facebook 开发维护。
*   **核心技术栈**：默认使用 **JSDOM** 模拟浏览器环境，使用 **Jasmine** 作为断言库的语法基础。
*   **优点**：
    *   **开箱即用**：无需配置，安装即跑，对新手极其友好。
    *   **功能全面**：内置了测试运行器、断言库、Mock 系统、覆盖率报告和 DOM 模拟。
    *   **快照测试**：非常强大的功能，能轻松捕获并对比数据结构和 UI 组件的渲染结果。
    *   **生态成熟**：社区庞大，资料丰富，与 Create-React-App 等工具链深度集成。
*   **缺点**：
    *   **性能**：在大型项目中，启动和运行速度相对较慢。
    *   **模块模拟**：其自带的模块模拟系统功能强大但稍显笨重，有时不够灵活。

#### Vitest： “原生 ESM” 的挑战者

*   **定位**：一个 **基于 Vite 的、极速的** 单元测试框架。旨在与 Vite 的配置、转换器、解析器保持一致。
*   **核心技术栈**：与 **Vite** 共享同一套构建管道，天然支持 **原生 ESM**。
*   **优点**：
    *   **极致性能**：利用 Esbuild 进行转换，速度极快。智能的文件监听模式只重新运行相关测试。
    *   **与 Vite 生态完美融合**：如果项目使用 Vite，配置 Vitest 几乎零成本，可以复用 `vite.config.js`。
    *   **优秀的开发体验**：内置智能 Mock（通过 `import.meta.vitest`）、内联测试等。
    *   **Jest 兼容性**：API 与 Jest 高度兼容，迁移成本低。
*   **缺点**：
    *   **相对年轻**：生态和社区虽在快速增长，但成熟度仍不及 Jest。
    *   **JSDOM 仍需配置**：默认不带 JSDOM，需要手动安装和配置，对 DOM 测试的“开箱即用”性略逊于 Jest。

#### 对比总结

| 特性 | Jest | Vitest |
| :--- | :--- | :--- |
| **性能** | 较慢 | **极快**（利用 Esbuild & Vite） |
| **配置** | **零配置** | 需少量配置，但与 Vite 项目无缝集成 |
| **模块系统** | CommonJS 优先 | **原生 ESM 优先** |
| **生态成熟度** | **非常成熟** | 快速增长，但较新 |
| **最佳搭档** | Create-React-App, Babel 项目 | **Vite** 项目，追求极致性能的项目 |

**选型建议**：
*   **新项目，尤其是 Vite 项目**：强烈推荐 **Vitest**。
*   **传统 Webpack/Babel 项目，或需要最高稳定性**：选择 **Jest**。

---

### 三、 核心实践模式与语法

#### 1. 测试组织与生命周期

```javascript
describe('Math utils', () => {
  // 生命周期钩子
  beforeAll(() => { /* 在所有测试之前运行一次 */ });
  beforeEach(() => { /* 在每个测试之前运行 */ });

  // 一个测试套件
  describe('add function', () => {
    // 一个测试用例
    it('should add two numbers correctly', () => {
      expect(add(1, 2)).toBe(3);
    });

    it('should handle negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });
  });

  afterEach(() => { /* 在每个测试之后运行 */ });
  afterAll(() => { /* 在所有测试之后运行一次 */ });
});
```

#### 2. 常用断言匹配器

```javascript
// 相等性
expect(value).toBe(3); // 严格相等 (===)
expect(value).toEqual({ name: 'foo' }); // 深度递归比较对象

// 真值
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// 数字
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(5);
expect(value).toBeCloseTo(0.3); // 用于浮点数，避免精度问题

// 数组/可迭代对象
expect(array).toContain('item');
expect(array).toHaveLength(2);

// 字符串
expect(string).toMatch(/regex/);
expect(string).toContain('substring');

// 函数调用
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(1);
```

#### 3. Mock 与依赖隔离 - 单元测试的灵魂

单元测试的核心是 **“隔离”**，必须将被测单元与其依赖隔离开。

**Mock 一个函数**：
```javascript
// 创建一个模拟函数
const mockCallback = vi.fn(); // Vitest: vi.fn() | Jest: jest.fn()

// 模拟返回值
mockCallback.mockReturnValue('mocked value');
// 模拟一次实现
mockCallback.mockImplementationOnce(() => 'once');

// 将模拟函数传入被测函数
test('calls callback with correct value', () => {
  function forEach(items, callback) {
    for (let item of items) {
      callback(item);
    }
  }

  forEach(['a', 'b'], mockCallback);

  // 断言模拟函数被如何调用
  expect(mockCallback).toHaveBeenCalledTimes(2);
  expect(mockCallback).toHaveBeenNthCalledWith(1, 'a');
});
```

**Mock 一个模块**：
```javascript
// __mocks__/axios.js (Jest 自动模拟)
// 或者使用 vi.mock (Vitest)

import { vi } from 'vitest';
import axios from 'axios';

// 模拟整个 axios 模块
vi.mock('axios');

test('fetches user data', async () => {
  // 设置模拟实现
  axios.get.mockResolvedValue({ data: { name: 'Alice' } });

  // 调用被测函数，该函数内部使用了 axios.get
  const user = await fetchUser(1);

  expect(user).toEqual({ name: 'Alice' });
  expect(axios.get).toHaveBeenCalledWith('/users/1');
});
```

#### 4. 测试异步代码

```javascript
// Promise
test('fetches data', () => {
  return fetchData().then(data => {
    expect(data).toBe('peanut butter');
  });
});

// Async/Await (最清晰)
test('fetches data', async () => {
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});

// 回调函数
test('calls callback', done => {
  function callback(error, data) {
    if (error) {
      done(error);
      return;
    }
    try {
      expect(data).toBe('expected');
      done(); // 表示测试完成
    } catch (error) {
      done(error);
    }
  }
  fetchDataWithCallback(callback);
});
```

#### 5. 测试 Vue/React 组件 (以 Vue 3 + Vitest 为例)

```vue
<!-- Counter.vue -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const count = ref(0);
const increment = () => { count.value++; };
</script>
```

```javascript
// Counter.spec.js
import { render, fireEvent } from '@testing-library/vue';
import Counter from './Counter.vue';

test('renders and increments counter', async () => {
  // Arrange: 渲染组件
  const { getByText } = render(Counter);

  // Act & Assert: 初始状态
  getByText('Count: 0');

  // Act: 模拟用户点击
  const button = getByText('Increment');
  await fireEvent.click(button);

  // Assert: 状态更新后的断言
  getByText('Count: 1');
});
```

### 总结与最佳实践

1.  **工具是手段，思想是核心**：无论用 Jest 还是 Vitest，**隔离、单一职责、3A 模式** 等测试思想是通用的。
2.  **Mock 是关键**：不会 Mock 就不会写单元测试。要善于模拟函数、模块、定时器和全局对象。
3.  **测试行为，而非实现**：测试应关注函数 **做了什么**（输出、副作用），而不是 **怎么做**（内部实现）。这样在重构内部实现时，测试无需修改。
4.  **FIRST 原则**：
    *   **F**ast（快速）：测试应该快。
    *   **I**ndependent（独立）：测试不应相互依赖。
    *   **R**epeatable（可重复）：在任何环境都能得到相同结果。
    *   **S**elf-Validating（自验证）：测试结果应为布尔值（通过/失败）。
    *   **T**imely（及时）：单元测试应在产品代码之前编写（TDD）。

**对于前端开发者，掌握单元测试不仅是写出可靠的代码，更是培养一种严谨、可维护的工程化思维方式。**