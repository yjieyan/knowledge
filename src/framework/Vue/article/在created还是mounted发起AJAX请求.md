# 在 `created` 还是 `mounted` 发起 AJAX 请求？

在 Vue 中，选择在 `created` 还是 `mounted` 生命周期中发起 AJAX 请求，主要取决于你的**具体需求**，例如**数据对 DOM 的依赖性**和**用户体验的考量**。

| 对比维度 | Vue2 `created` | Vue2 `mounted` | Vue3 `created` (使用 `setup`) | Vue3 `onMounted` (使用 `setup`) |
| :--- | :--- | :--- | :--- | :--- |
| **数据响应式** | ✅ 已初始化 | ✅ 已初始化 | ✅ 使用 `ref`, `reactive` 等 | ✅ 使用 `ref`, `reactive` 等 |
| **DOM 挂载** | ❌ 未挂载 | ✅ 已挂载 | ❌ 未挂载 | ✅ 已挂载 |
| **DOM 操作** | ❌ 不可行 | ✅ 可行 | ❌ 不可行 | ✅ 可行 |
| **适用请求场景** | 🔸 **不依赖 DOM 的数据初始化**<br>🔸 尽早获取数据 | 🔸 **依赖 DOM 的第三方库初始化**<br>🔸 需要操作 DOM 的请求 | 🔸 **不依赖 DOM 的数据初始化**<br>🔸 尽早获取数据 | 🔸 **依赖 DOM 的第三方库初始化**<br>🔸 需要操作 DOM 的请求 |
| **用户体验** | 数据获取早，可能减少渲染后更新 | 可能因 DOM 已渲染再更新数据，引起轻微视觉变化 | 数据获取早，可能减少渲染后更新 | 可能因 DOM 已渲染再更新数据，引起轻微视觉变化 |

# 🛠️ Vue2 的实践与选择

在 Vue2 中，你通常在组件的选项 (options) 中定义生命周期钩子。

## Created 钩子

- **执行时机**：在 Vue 实例被创建后，模板编译和 DOM 挂载**之前**同步调用。此时，实例已完成数据观测、计算属性、方法、事件/侦听器的配置。
- **发起请求场景**：适用于那些**不依赖于 DOM** 的数据初始化请求。在此处发起请求可以**尽早获取数据**，减少页面渲染后因数据更新导致的二次渲染。

```javascript
// Vue2 在 created 中发起请求示例
export default {
  data() {
    return {
      userList: [],
    };
  },
  created() {
    // 场景：不依赖DOM的初始数据获取
    this.fetchUserList();
  },
  methods: {
    async fetchUserList() {
      try {
        const response = await axios.get('/api/users');
        this.userList = response.data;
      } catch (error) {
        console.error('获取用户列表失败:', error);
      }
    },
  },
};
```

## Mounted 钩子

- **执行时机**：在 Vue 实例的模板编译好，并首次**挂载到 DOM 成为可操作节点之后**调用。此时可以安全地操作 DOM 或使用依赖 DOM 的第三方库。
- **发起请求场景**：适用于那些**需要操作 DOM** 的请求，或者需要**依赖 DOM 存在的第三方库（如图表库）的初始化**。

```javascript
// Vue2 在 mounted 中发起请求示例
export default {
  data() {
    return {
      chartData: null,
      chartInstance: null,
    };
  },
  mounted() {
    // 场景：依赖DOM的图表库初始化并加载数据
    this.chartInstance = new Chart(this.$refs.chartCanvas, {
      // ... 图表配置
    });
    this.fetchChartData();
  },
  methods: {
    async fetchChartData() {
      try {
        const response = await axios.get('/api/chart-data');
        this.chartData = response.data;
        // 数据获取后，更新图表，这个操作依赖已挂载的DOM元素
        this.chartInstance.update();
      } catch (error) {
        console.error('获取图表数据失败:', error);
      }
    },
  },
};
```

# ⚡ Vue3 的实践与选择

在 Vue3 中，组合式 API (Composition API) 引入了 `setup` 函数，它会在 `beforeCreate` 和 `created` 生命周期之前执行。你可以在 `setup` 函数中编写响应式数据和逻辑，并通过特定的函数（如 `onMounted`）来注册生命周期钩子。

## 在 Setup 中（类比 Created）

- **执行时机**：`setup` 函数在组件实例创建之初、`beforeCreate` 钩子之前被调用。在 `setup` 内部，组件实例尚未完全创建，因此没有 `this`。然而，你定义的响应式数据（通过 `ref`、`reactive`）和方法是可用的。
- **发起请求场景**：与 Vue2 的 `created` 类似，非常适合在**组件挂载前**、**不依赖 DOM** 的数据初始化请求。这是组合式 API 中**最常见和推荐**的发起初始请求的位置。

```javascript
// Vue3 在 setup 中发起请求示例
import { ref, onMounted } from 'vue';
import { getProductList } from '@/api/product';

export default {
  setup() {
    // 定义响应式数据
    const productList = ref([]);
    const loading = ref(false);

    // 方法：获取产品列表
    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await getProductList();
        productList.value = response.data;
      } catch (error) {
        console.error('获取产品列表失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 在setup内部直接调用请求函数，类似于在created中发起请求
    fetchProducts();

    return {
      productList,
      loading,
    };
  },
};
```

## onMounted 钩子

- **执行时机**：通过 `import { onMounted } from 'vue'` 导入，并在 `setup` 函数中注册。它等价于 Vue2 的 `mounted` 钩子，在组件挂载到 DOM 后执行。
- **发起请求场景**：与 Vue2 的 `mounted` 类似，适用于**需要操作 DOM 节点**或**初始化依赖 DOM 的库**的场景。

```javascript
// Vue3 在 onMounted 中发起请求示例
import { ref, onMounted } from 'vue';
import { initMap, getMapData } from '@/api/map';

export default {
  setup() {
    const mapContainer = ref(null); // 模板引用，用于挂载地图容器
    const mapData = ref(null);

    onMounted(async () => {
      // 场景：地图初始化强烈依赖已挂载的DOM容器
      if (mapContainer.value) {
        const map = initMap(mapContainer.value);
        
        // 获取地图数据并渲染
        try {
          mapData.value = await getMapData();
          map.render(mapData.value);
        } catch (error) {
          console.error('获取或渲染地图数据失败:', error);
        }
      }
    });

    return {
      mapContainer,
      mapData,
    };
  },
};
```

# 💡 决策指南与最佳实践

## 1. 如何选择：关键考量点

- **数据与 DOM 的依赖关系**：这是最核心的判断依据。如果请求返回的数据只是用于填充模板，**与具体的 DOM 节点样式或位置无关**，那么在 `created`/`setup` 中发起请求是更优的选择，可以让数据更早地开始获取。如果请求返回后需要**操作 DOM 元素**（如获取元素宽高、调用实例方法）或**初始化一个依赖 DOM 的第三方库**（如图表、地图），则必须在 `mounted`/`onMounted` 中发起。
- **用户体验**：在 `created`/`setup` 中发起请求，数据获取时机更早，有可能在组件首次渲染时数据就已就位，避免页面先渲染骨架再更新内容带来的"闪烁感"。不过，`created` 和 `mounted` 的执行时间相差通常不大。对于复杂的组件，在 `mounted` 中请求可能会让用户更早看到组件的基本结构。
- **组件渲染逻辑**：在 `created`/`setup` 中设置数据，组件会使用这些数据直接进行首次渲染。而在 `mounted` 中设置数据，会导致组件进行**两次渲染**：一次是初始的空数据渲染，另一次是数据到达后的更新渲染。

## 2. 通用最佳实践

- **错误处理**：无论在哪里发起请求，都必须使用 `try...catch` 或 `.catch()` 进行错误处理，给用户适当的反馈。
- **加载状态**：配合请求，使用一个布尔值（如 `loading.value = true/false`）来管理加载状态，在界面中显示加载指示器（如 loading 图、骨架屏）。
- **避免重复请求**：如果组件可能会在同一个页面中被多次创建和销毁，需要考虑对请求进行防抖、缓存或者取消处理，以避免不必要的网络请求和潜在的内存泄漏。
- **使用异步/await**：使用 `async/await` 或 `Promise` 的链式调用来处理异步请求，使代码更清晰。
- **考虑状态管理**：对于跨多个组件共享的数据，建议将 AJAX 请求放在状态管理（如 Vuex 或 Pinia）的 Action 中处理。

- **Vue2**：优先考虑 `created` 来**尽早获取不依赖 DOM 的数据**。必须在 DOM 可用时（如图表初始化、地图渲染），才使用 `mounted`。
- **Vue3**：在组合式 API 的 `setup` 函数中**直接调用**请求函数，等同于 Vue2 的 `created`。需要在 DOM 挂载后操作时，将请求逻辑放入 `onMounted` 钩子。
