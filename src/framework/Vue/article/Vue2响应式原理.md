# Vue2 响应式原理

---

### 1. 核心思想与要解决的问题

**目标：** 当数据发生变化时，视图能够自动更新。

**核心思想：** 通过 **数据劫持** 结合 **发布-订阅模式** 来实现。

*   **数据劫持：**  Vue 会遍历 data 选项中的所有属性，并使用 `Object.defineProperty` 将它们转换为 **getter/setter**。
*   **发布-订阅模式：** 每个组件实例都对应一个 **Watcher** 实例（订阅者）。在组件渲染过程中，会触发属性的 getter，Watcher 会被添加到该属性的依赖收集器（Dep）中。当属性值变化触发 setter 时，setter 会通知 Dep，Dep 再通知所有关联的 Watcher 进行更新，从而触发组件的重新渲染。

---

### 2. 核心三要素：Observer, Dep, Watcher

#### a) Observer (观察者/数据劫持)

**职责：** 遍历 data 对象的所有属性，将其转换为响应式的。

**实现机制：**
*   使用 `Object.defineProperty` 为每个属性定义 getter 和 setter。
*   如果属性的值也是一个对象，则会递归地调用 `observe` 函数，使其子属性也变为响应式的。

```javascript
class Observer {
  constructor(value) {
    this.value = value;
    this.walk(value);
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

function defineReactive(obj, key, val = obj[key]) {
  // 递归处理子属性
  const childOb = observe(val);

  // 每个属性都拥有一个属于自己的 Dep 实例，用于管理依赖
  const dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      // 依赖收集
      if (Dep.target) { // Dep.target 就是当前的 Watcher
        dep.depend();   // 将 Watcher 添加到 dep 的订阅列表中
        if (childOb) {
          childOb.dep.depend(); // 处理子对象的依赖收集
        }
      }
      return val;
    },
    set: function reactiveSetter(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 新设置的值也可能是对象，需要将其变为响应式
      observe(newVal);
      // 通知更新
      dep.notify();
    }
  });
}

function observe(value) {
  if (typeof value !== 'object' || value === null) {
    return;
  }
  return new Observer(value);
}
```

#### b) Dep (依赖收集器)

**职责：** 管理一个属性所有的 Watcher（依赖）。它是发布-订阅模式中的“调度中心”。

**实现机制：**
*   每个响应式属性都有一个唯一的 Dep 实例。
*   在 getter 中收集依赖（`dep.depend()`）。
*   在 setter 中通知依赖更新（`dep.notify()`）。

```javascript
class Dep {
  constructor() {
    this.subs = []; // 存储所有订阅者 (Watcher)
  }

  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 收集依赖：在 getter 中调用
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this); // 让 Watcher 自己决定如何添加 Dep
    }
  }

  // 通知更新：在 setter 中调用
  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update(); // 调用每个 Watcher 的 update 方法
    }
  }
}

// 全局唯一的 Watcher 指向
Dep.target = null;
```

#### c) Watcher (观察者/订阅者)

**职责：** 当依赖的属性发生变化时，执行回调函数（通常是更新视图）。

**实现机制：**
*   在组件初始化时，会为每个组件创建一个 **渲染 Watcher**。
*   Watcher 在求值（如执行渲染函数）前，会将自身（`Dep.target`）设置为全局唯一的目标。
*   然后执行渲染函数，期间会触发属性的 getter，从而完成依赖收集。
*   当依赖的属性变化时，Dep 会通知 Watcher，Watcher 会将自己放入一个异步更新队列，在下一个事件循环中批量执行更新。

```javascript
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.getter = expOrFn; // 通常是组件的更新函数
    this.cb = cb;
    this.deps = []; // 这个 Watcher 依赖的所有 Dep
    this.value = this.get();
  }

  get() {
    // 将 Dep.target 指向自己
    Dep.target = this;
    // 执行 getter，触发属性的 getter，从而完成依赖收集
    const value = this.getter.call(this.vm, this.vm);
    // 依赖收集完毕，重置 Dep.target
    Dep.target = null;
    return value;
  }

  addDep(dep) {
    // 如果这个 Dep 还没有被收集过，则收集它
    if (!this.deps.includes(dep)) {
      this.deps.push(dep);
      dep.addSub(this); // 同时让 Dep 也收集这个 Watcher
    }
  }

  update() {
    // 将 Watcher 推入异步更新队列，由 Scheduler 调度执行
    queueWatcher(this);
  }

  run() {
    // 真正的更新操作
    const value = this.get();
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
}
```

---

### 3. 完整工作流程（串联三要素）

通过一个 Vue 组件的生命周期，将整个流程串联起来：

1.  **初始化阶段：**
    *   `new Vue()` 时，对 `data` 选项进行遍历，通过 `Object.defineProperty` 将其所有属性转换为 getter/setter。
    *   每个属性都会创建一个对应的 `Dep` 实例。

2.  **首次渲染/依赖收集阶段：**
    *   Vue 组件会创建一个 **渲染 Watcher**，并将其赋值给 `Dep.target`。
    *   然后执行组件的 `render` 函数。在生成 Virtual DOM 的过程中，会访问 `data` 中的属性，触发它们的 **getter**。
    *   在 getter 中，会调用 `dep.depend()`，将当前的 `Dep.target`（即渲染 Watcher）添加到该属性的 `Dep` 的订阅列表 (`subs`) 中。
    *   渲染完成后，`Dep.target` 被重置为 `null`。

3.  **数据更新阶段：**
    *   当开发者修改 `data` 中的某个属性时（例如 `this.message = 'new value'`），会触发该属性的 **setter**。
    *   在 setter 中，会调用 `dep.notify()`。
    *   `dep.notify()` 会遍历该属性 `Dep` 中所有的 `Watcher`，调用它们的 `update()` 方法。
    *   `Watcher` 的 `update()` 方法不会立即执行，而是将自己推入一个**异步更新队列**。这保证了在同一个事件循环内的多次数据变化只会触发一次重新渲染。

4.  **重新渲染阶段：**
    *   在下一个事件循环中，异步更新队列被清空，队列中的所有 `Watcher` 会执行它们的 `run()` 方法。
    *   `run()` 方法会再次执行 `get()`，也就是重新执行渲染函数，生成新的 Virtual DOM，然后进行 patch 更新真实 DOM。

---

### 4. Vue 2 响应式的局限性

1.  **对象属性的添加和删除：**
    *   `Object.defineProperty` 只能劫持已存在的属性。对于动态新增或删除的属性，Vue 无法检测到。
    *   **解决方案：** 使用 `Vue.set(object, propertyName, value)` 或 `this.$set()` 添加新属性；使用 `Vue.delete(object, propertyName)` 或 `this.$delete()` 删除属性。

2.  **数组变化：**
    *   直接通过索引设置数组项 (`arr[index] = newValue`) 或修改数组长度 (`arr.length = newLength`) 是无法被侦测的。
    *   **解决方案：** 使用 `Vue.set(arr, index, newValue)` 或数组的变异方法（如 `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`）。Vue 重写了这些数组方法，使其在改变数组的同时能够触发视图更新。

```javascript
// 原理：重写数组方法
const originalArrayProto = Array.prototype;
const arrayMethods = Object.create(originalArrayProto);

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
  const original = originalArrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__; // Observer 实例
    ob.dep.notify(); // 手动通知更新
    return result;
  });
});
```

### 总结

**通过 `Object.defineProperty` 劫持数据的 getter 和 setter。在 getter 中收集依赖（Watcher），在 setter 中通知依赖更新。每个组件实例对应一个 Watcher，它会在组件渲染时被收集为依赖。当数据变化时，setter 会通知 Watcher，Watcher 进而触发组件的异步重新渲染。**