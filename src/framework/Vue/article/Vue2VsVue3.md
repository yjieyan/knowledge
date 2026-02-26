# Vue2 与 Vue3 对比

1.  **架构与响应式原理**（最根本的区别）
2.  **性能优化**
3.  **Composition API vs Options API**
4.  **逻辑复用与代码组织**
5.  **TypeScript 支持**
6.  **源码与打包**
7.  **新的组件和 API**
8.  **总结与对比表格**

---

### 1. 架构与响应式原理：`Object.defineProperty` vs `Proxy`

这是 Vue2 与 Vue3 最根本、最核心的区别，它决定了许多其他特性的实现方式。

**Vue2：`Object.defineProperty`**

*   **原理**：Vue2 通过 `Object.defineProperty` 来递归地遍历数据对象的所有属性，并对每一个属性设置 `getter` 和 `setter`，从而在数据被读取或修改时进行依赖追踪和派发更新。
*   **局限性**：
    *   **无法检测属性的添加或删除**：由于 `Object.defineProperty` 是在初始化时对*现有属性*进行劫持，所以动态给对象新增或删除属性时，Vue 无法追踪到。这就是为什么我们需要使用 `Vue.set` 和 `Vue.delete` 这些 API 来保证响应式。
    *   **数组监听需要 hack**：直接通过索引设置数组项 (`array[index] = newValue`) 或修改数组长度 (`array.length = newLength`) 也无法被检测。Vue2 通过重写数组的 7 个变异方法（如 `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`）来实现响应式。
    *   **深度递归性能开销**：对于深层嵌套的对象，递归遍历所有属性并转换为响应式的过程会有一定的性能消耗。

**Vue3：`Proxy`**

*   **原理**：Vue3 使用 ES6 的 `Proxy` 来代理整个对象。`Proxy` 不直接操作对象的属性，而是创建一个对象的“代理层”，可以拦截并重新定义该对象的基本操作。
*   **优势**：
    *   **全面拦截**：`Proxy` 可以拦截对象上多达 13 种操作，包括属性的读取、设置、删除、`in` 操作符等。这意味着它天生就能检测到属性的动态添加和删除，无需特殊 API。
    *   **更好的数组支持**：对数组的任何操作，包括通过索引修改、使用 `length` 属性，都能被完美拦截。
    *   **性能优化**：
        *   `Proxy` 代理的是整个对象，不需要像 Vue2 那样递归遍历所有属性。Vue3 在这里采用了惰性代理的策略：只有在真正访问到某个嵌套属性时，才会继续用 `Proxy` 代理它。这减少了初始化的开销。
        *   由于 `Proxy` 是语言层面的支持，性能通常比 `Object.defineProperty` 更好。

**简单示例：**
```javascript
// Vue2
data() {
  return { obj: { a: 1 } }
},
mounted() {
  this.obj.b = 2; // 非响应式！
  this.$set(this.obj, 'b', 2); // 响应式
}

// Vue3
setup() {
  const state = reactive({ a: 1 });
  state.b = 2; // 响应式！
  return { state };
}
```

---

### 2. 性能优化

Vue3 在性能方面做了大量工作，主要体现在：

*   **编译时优化**：
    *   **Block Tree & Patch Flag**：Vue3 的编译器在编译模板时，会分析动态节点（如 `{{ name }}` 或 `:id="dynamicId"`），并为它们打上不同的“补丁标志”（Patch Flag）。在运行时，虚拟 DOM 的 Diff 算法可以根据这些标志，只比对动态变化的节点，跳过静态内容，大大提升了 Diff 效率。
    *   **静态提升**：模板中的静态节点或静态属性会被提升到渲染函数之外。这意味着它们只会在首次渲染时被创建，后续更新时会直接复用，避免了不必要的创建开销。
    *   **Tree Flattening**：将模板中的静态节点“压平”，在 Diff 时直接跳过整个静态树，进一步优化更新性能。

*   **源码体积优化**：
    *   **更好的 Tree-shaking**：Vue3 的代码采用了 ES Module 的模块化写法，并且将许多 API（如 `v-model`、`transition`）设计为可树的。这意味着如果你在项目中没有使用这些功能，它们最终不会被打包到生产环境的代码中，从而减小了打包体积。

---

### 3. Composition API vs Options API

这是从开发者视角看最直观的变化。

**Vue2：Options API**

*   **组织方式**：按照选项（`data`, `methods`, `computed`, `watch`, `生命周期`）来组织代码。
*   **优点**：结构清晰，对于初学者和小型项目非常友好，每个选项的功能一目了然。
*   **缺点**：在复杂的组件中，**逻辑关注点**可能会分散在不同的选项中。例如，一个“用户管理”的功能，其数据在 `data`，方法在 `methods`，计算属性在 `computed`，导致阅读和维护时需要上下反复滚动。

**Vue3：Composition API (`setup` 函数)**

*   **组织方式**：允许开发者基于**逻辑功能**来组织代码，而不是基于选项类型。所有相关的数据、方法和生命周期都可以写在一起。
*   **核心思想**：将可复用的逻辑代码提取为一个个“组合式函数”（Composable Function）。
*   **优点**：
    *   **更好的逻辑复用与封装**：解决了 Vue2 Mixins 带来的命名冲突、数据来源不清晰等问题。
    *   **更灵活的代码组织**：可以将相关联的功能代码紧密地放在一起，提高代码的可读性和可维护性，尤其是在大型项目中。
    *   **更好的 TypeScript 集成**：因为 Composition API 主要使用普通的变量和函数，类型推断非常自然。

**代码对比示例：**

```javascript
// Vue2 - Options API
export default {
  data() {
    return {
      count: 0,
      searchQuery: ''
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    },
    filteredList() {
      // ... 基于 searchQuery 的逻辑
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  mounted() {
    console.log('Component mounted and count is:', this.count);
  }
}

// Vue3 - Composition API
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    // 计数器功能
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);
    function increment() {
      count.value++;
    }
    onMounted(() => {
      console.log('Component mounted and count is:', count.value);
    });

    // 搜索功能 (可以放在一起，也可以提取到单独的函数)
    const searchQuery = ref('');
    const filteredList = computed(() => {
      // ... 基于 searchQuery 的逻辑
    });

    return {
      count,
      doubleCount,
      increment,
      searchQuery,
      filteredList
    };
  }
}
```

---

### 4. 逻辑复用

*   **Vue2**：主要通过 **Mixins** 和 **作用域插槽** 来实现逻辑复用。
    *   **Mixins 的缺点**：
        1.  **命名冲突**：多个 Mixin 可能定义了相同的属性或方法。
        2.  **数据来源不清晰**：组件中使用的属性或方法来自哪个 Mixin 不明确，增加了理解成本。
        3.  **可重用性有限**：Mixin 不能接受参数来定制其行为。
*   **Vue3**：主要通过 **组合式函数**。
    *   **优点**：
        1.  **显式的数据来源**：通过解构赋值，可以清楚地知道返回了哪些数据和方法。
        2.  **避免命名冲突**：可以通过变量命名来避免。
        3.  **可传参**：组合式函数可以接受参数，使其更加灵活。
        4.  **可嵌套**：一个组合式函数可以调用另一个组合式函数。

---

### 5. TypeScript 支持

*   **Vue2**：TS 支持是通过 `vue-class-component` 或 `vue-property-decorator` 这类装饰器方案实现的，属于“嫁接”式的支持，与 Vue 本身的集成度不够完美，类型推断有时会遇到困难。
*   **Vue3**：源码本身就是用 TypeScript 重写的，提供了**一流的 TypeScript 支持**。无论是 Composition API 还是 Options API，都能享受到完美的类型推导和 IDE 支持。

---

### 6. 其他重要变化

*   **Fragment**：Vue3 组件支持多个根节点，无需再用一个额外的 `div` 包裹。
*   **Teleport**：新增 `<Teleport>` 组件，可以将组件的一部分内容“传送”到 DOM 中的其他位置，非常适合处理模态框、通知框等。
*   **Suspense**：实验性功能，提供了一种在组件树中协调异步依赖的机制，可以优雅地处理异步组件的加载状态。
*   **生命周期重命名**：`beforeDestroy` 和 `destroyed` 被更名为 `beforeUnmount` 和 `unmounted`，更贴切其含义。
*   **移除过滤器**：Vue3 移除了过滤器，建议使用计算属性或方法来实现相同功能。

---

### 总结

| 特性 | Vue2 | Vue3 | 优势 |
| :--- | :--- | :--- | :--- |
| **响应式原理** | `Object.defineProperty` | `Proxy` | 更强大、性能更好、支持动态属性 |
| **API 风格** | Options API 为主 | Composition API + Options API | 更好的逻辑组织和复用，更好的 TS 支持 |
| **打包体积** | 较大 | 更好的 Tree-shaking，体积更小 | 更优的打包体积 |
| **性能** | 良好 | 编译时优化（Patch Flag， 静态提升） | 更快的渲染和更新 |
| **TypeScript** | 需要装饰器等，支持不完美 | 原生支持，类型推断优秀 | 开发体验更好 |
| **逻辑复用** | Mixins | 组合式函数 | 更灵活、更清晰 |
| **新组件** | 无 | Fragment, Teleport, Suspense | 更强大的功能 |

**结论**：

Vue3 是一次重大的革新，它不仅在性能上实现了超越，更重要的是通过 Composition API 提供了更优越的代码组织和逻辑复用能力，并拥抱了现代前端开发工具链（如 TypeScript、Vite）。它代表了 Vue 框架未来的发展方向。当然，Vue3 也完全兼容 Vue2 的绝大部分特性，使得老项目可以平稳地、渐进式地迁移。

---
