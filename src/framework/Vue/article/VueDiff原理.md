# Vue 的 diff 原理
Vue 的 diff 算法，准确来说是 Virtual DOM 的 diff 算法，是 Vue 实现高效视图更新的核心。

它的核心思想是：**在数据变化后，生成一个新的 VNode 树，然后与旧的 VNode 树进行比较，找出两者之间的差异，然后只将差异部分应用到真实的 DOM 上，从而避免整体重新渲染，提升性能。**

### 1. 为什么需要 Diff 算法？

直接操作 DOM（例如 `innerHTML`）的代价是昂贵的。
一个复杂的页面可能对应着成千上万的 DOM 节点，全量更新会导致渲染性能急剧下降。Virtual DOM 是一个轻量的 JavaScript 对象，它描述了真实 DOM 的结构。操作 JS 对象的成本远低于操作 DOM。

Diff 算法就是连接新旧 Virtual DOM 的桥梁，它负责找出最少的、必要的 DOM 操作，这是一种“用 JS 的计算成本换取 DOM 的操作成本”的策略，而 JS 的计算速度远快于 DOM。

### 2. Diff 的“同层比较”策略

这是一个非常重要的前提。Vue 的 diff 算法只会对**同一层级**的 VNode 进行比较，而不会跨层级比较。

**为什么？**
因为在实际应用中，跨层级的 DOM 移动操作是极少的。
将比较限制在同一层级，可以将时间复杂度从 O(n³) 大幅降低到 O(n)。这是一种在准确性和性能之间做的权衡，牺牲了极少见的跨层级移动场景，换来了大部分场景下的高性能。

**例子：**
```html
<!-- 旧 VNode -->
<div>
  <p>Old Paragraph</p>
</div>

<!-- 新 VNode -->
<div>
  <span>New Span</span>
</div>
```
算法会比较 `div` 和 `div`，然后比较 `p` 和 `span`。它不会尝试把旧的 `p` 移动到别的层级下。

### 3. Diff 的核心过程：patch 函数

整个比较过程始于 `patch` 函数。它接收 `oldVnode` 和 `newVnode`。

1.  **判断是否为相同节点**：
    首先会通过 `sameVnode` 函数判断两个 VNode 是否是“相同的”，判断条件主要是：
    *   `key` 相同
    *   `tag`（标签名）相同
    *   `isComment`（是否为注释节点）相同
    *   `data` 定义是否相同（包括事件、属性等）
    *   对于 input 元素，`type` 必须相同

2.  **如果不是相同节点**：
    直接销毁旧节点，创建新节点并插入。这是一个“暴力”替换。

3.  **如果是相同节点**：
    进入关键的 `patchVnode` 过程，这里才是精细比较的开始。

### 4. `patchVnode`：精细化比较

当确认两个 VNode 是同类节点后，`patchVnode` 会执行以下逻辑：

1.  **如果新旧 VNode 全等（`oldVnode === newVnode`）**：直接返回，无事可做。

2.  **更新真实 DOM 节点（elm）的属性**：
    比较 `newVnode.data` 和 `oldVnode.data` 的差异（如 `class`, `style`, `attrs`, `on` 事件监听器等），并更新到真实的 DOM 元素上。这是通过一系列的 `update` 钩子函数完成的。

3.  **更新子节点**：这是 diff 算法最复杂、最核心的部分。分为几种情况：
    *   **新节点有文本子节点，且与旧节点的文本不同**：
        直接使用 `setTextContent` 更新 DOM 元素的文本内容。无论旧节点原来有什么子节点，都会被文本替换。
    *   **新节点有子节点，而旧节点没有**：
        清空旧 DOM 节点的内容，然后批量将新的子节点创建为真实 DOM 并添加进去。
    *   **旧节点有子节点，而新节点没有**：
        直接移除旧 DOM 节点下的所有子节点。
    *   **新旧节点都有子节点**：！！！**重点来了**！！！这就是著名的 `updateChildren` 逻辑。

### 5. `updateChildren`：双端比较算法

这是 diff 算法的精髓所在。Vue 采用了一种高效的双端比较算法，同时从新旧子节点数组的**头尾**开始进行比对。

它定义了四个指针：
*   `oldStartIdx` / `newStartIdx`：指向旧/新子节点列表的**头**。
*   `oldEndIdx` / `newEndIdx`：指向旧/新子节点列表的**尾**。

以及它们对应的 VNode：
*   `oldStartVnode` / `newStartVnode`
*   `oldEndVnode` / `newEndVnode`

然后，算法会进入一个循环，在循环中依次进行以下**四种比较**：

1.  **`oldStartVnode` vs `newStartVnode` (头头比较)**：
    如果相同，直接 `patchVnode`，然后 `oldStartIdx` 和 `newStartIdx` 都向右移动一位。

2.  **`oldEndVnode` vs `newEndVnode` (尾尾比较)**：
    如果相同，直接 `patchVnode`，然后 `oldEndIdx` 和 `newEndIdx` 都向左移动一位。

3.  **`oldStartVnode` vs `newEndVnode` (头尾比较)**：
    如果相同，说明这个旧节点被移到了右边。在 `patchVnode` 之后，需要将 `oldStartVnode` 对应的真实 DOM 节点**移动**到 `oldEndVnode` 对应的节点的**后面**。然后 `oldStartIdx` 右移，`newEndIdx` 左移。

4.  **`oldEndVnode` vs `newStartVnode` (尾头比较)**：
    如果相同，说明这个旧节点被移到了左边。在 `patchVnode` 之后，需要将 `oldEndVnode` 对应的真实 DOM 节点**移动**到 `oldStartVnode` 对应的节点的**前面**。然后 `oldEndIdx` 左移，`newStartIdx` 右移。

5.  **如果以上四种情况都不匹配**：
    这是最不理想的情况。Vue 会尝试在**旧的子节点数组**中，寻找一个与 `newStartVnode` 拥有相同 key 的节点。
    *   **如果找到了**：则将该旧节点拿来与 `newStartVnode` 进行 `patchVnode`，并将它对应的真实 DOM 移动到 `oldStartVnode` 对应的 DOM 之前。同时，将这个旧节点在数组中的位置标记为 `undefined`（因为此节点已被复用，避免后续重复使用）。
    *   **如果没找到**：说明 `newStartVnode` 是一个全新的节点，需要创建它对应的真实 DOM 并插入到 `oldStartVnode` 对应的 DOM 之前。

**循环结束条件**：
当 `oldStartIdx > oldEndIdx` 或 `newStartIdx > newEndIdx` 时，循环停止。

**循环结束后的处理**：
*   **如果 `oldStartIdx > oldEndIdx`**：说明旧节点先遍历完了。那么剩下的新节点都是需要**新增**的。将它们批量创建并插入到 `newEndIdx` 对应的节点之后。
*   **如果 `newStartIdx > newEndIdx`**：说明新节点先遍历完了。那么 `oldStartIdx` 到 `oldEndIdx` 之间的旧节点都是需要**移除**的。将它们批量删除。

### 6. 为什么需要 `key`？

从 `updateChildren` 的第五步可以看出，`key` 的作用至关重要。它是一个节点的唯一标识。

*   **有 key**：在双端比较都不匹配时，Vue 可以凭借 key 快速地在旧节点映射表中找到可复用的节点。这样可以最大程度地避免不必要的 DOM 创建/销毁，直接移动节点即可，极大地提升了性能。**在列表渲染中，key 是必须的**。
*   **无 key**：如果节点没有 key，Vue 只能认为“相同索引位置”的节点是同一个节点。这在列表顺序发生变化时（如排序、插入），会导致大量的节点被错误地复用，从而引发状态错乱和性能低下（因为可能创建了本可复用的新节点）。

### 总结