# Vue3设计实现一个弹窗组件

设计Vue3弹窗组件需要考虑多个方面。可以采用组合式API实现，主要设计思路包括：

1）组件结构：基础弹窗包含header（标题栏）、body（内容区）和footer（按钮区）三部分

2）功能设计：支持自定义内容、可拖拽、多种预设类型（提示、确认、警告等）

3）实现方式：使用Teleport将弹窗渲染到body标签下，避免父组件CSS影响

4）状态管理：通过响应式ref控制弹窗显隐状态

5）交互设计：支持多种关闭方式（按钮关闭、点击遮罩层关闭、ESC键关闭）

### 组件基本结构

首先创建一个Modal.vue组件：

```js
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :style="modalStyle" @mousedown="startDrag" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
          <!-- 标题栏 -->
          <div class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="modal-close" @click="close">×</button>
          </div>
          
          <!-- 内容区 -->
          <div class="modal-body">
            <slot>
              {{ content }}
            </slot>
          </div>
          
          <!-- 按钮区 -->
          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-btn cancel" v-if="showCancel" @click="cancel">取消</button>
              <button class="modal-btn confirm" @click="confirm">确定</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: Boolean, // v-model绑定值
  title: {
    type: String,
    default: '提示'
  },
  content: String,
  width: {
    type: [String, Number],
    default: '500px'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  },
  draggable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

// 处理拖拽逻辑
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: 0, y: 0 });

const modalStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    transform: `translate(${position.value.x}px, ${position.value.y}px)`
  };
});

function startDrag(event) {
  if (!props.draggable) return;
  
  // 只在点击标题栏时才能拖动
  if (event.target.closest('.modal-header')) {
    isDragging.value = true;
    dragOffset.value = {
      x: event.clientX - position.value.x,
      y: event.clientY - position.value.y
    };
  }
}

function onDrag(event) {
  if (isDragging.value) {
    position.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y
    };
  }
}

function stopDrag() {
  isDragging.value = false;
}

function close() {
  emit('update:modelValue', false);
}

function confirm() {
  emit('confirm');
  close();
}

function cancel() {
  emit('cancel');
  close();
}

function handleOverlayClick(event) {
  // 只有点击遮罩层而不是弹窗本身才关闭
  if (props.closeOnClickOverlay && event.target.classList.contains('modal-overlay')) {
    close();
  }
}

// 按ESC键关闭弹窗
function handleKeyDown(event) {
  if (event.key === 'Escape' && props.modelValue) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 90%;
  max-height: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  cursor: move;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
  text-align: right;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  outline: none;
}

.modal-btn {
  padding: 8px 15px;
  margin-left: 10px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background: #fff;
  cursor: pointer;
}

.modal-btn.confirm {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
```

### 注册并使用弹窗组件

可以创建一个全局弹窗服务，让弹窗的使用更加便捷：

```js
// src/plugins/modal.js
import { createApp, h, ref } from 'vue';
import Modal from '../components/Modal.vue';

export function createModal() {
  // 全局实例存储
  const instances = [];
  
  function modal(options = {}) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const visible = ref(true);
    
    const app = createApp({
      setup() {
        const onClose = () => {
          visible.value = false;
          setTimeout(() => {
            app.unmount();
            container.remove();
            const index = instances.findIndex(instance => instance === app);
            if (index !== -1) {
              instances.splice(index, 1);
            }
          }, 300); // 给过渡动画留时间
        };
        
        return () => h(Modal, {
          modelValue: visible.value,
          'onUpdate:modelValue': (val) => {
            visible.value = val;
            if (!val) onClose();
          },
          onConfirm: () => {
            if (options.onConfirm) options.onConfirm();
            onClose();
          },
          onCancel: () => {
            if (options.onCancel) options.onCancel();
            onClose();
          },
          ...options
        }, options.slots || {});
      }
    });
    
    instances.push(app);
    app.mount(container);
    
    return {
      close: () => {
        visible.value = false;
      }
    };
  }
  
  // 预设类型
  modal.alert = (content, title = '提示', onConfirm) => {
    return modal({
      title,
      content,
      showCancel: false,
      onConfirm
    });
  };
  
  modal.confirm = (content, title = '确认', onConfirm, onCancel) => {
    return modal({
      title,
      content,
      onConfirm,
      onCancel
    });
  };
  
  // 关闭所有弹窗
  modal.closeAll = () => {
    instances.forEach(instance => {
      const vm = instance._instance.subTree.component.ctx;
      if (vm?.close) vm.close();
    });
  };
  
  return modal;
}

export default {
  install(app) {
    const modal = createModal();
    app.config.globalProperties.$modal = modal;
    app.provide('modal', modal);
  }
};
```

在main.js中注册插件：

```js
import { createApp } from 'vue';
import App from './App.vue';
import ModalPlugin from './plugins/modal';

const app = createApp(App);
app.use(ModalPlugin);
app.mount('#app');
```

### 在组件中使用弹窗

```html
<template>
  <div>
    <button @click="openModal">打开普通弹窗</button>
    <button @click="showAlert">打开Alert弹窗</button>
    <button @click="showConfirm">打开Confirm弹窗</button>
    
    <!-- 使用组件方式 -->
    <Modal v-model="visible" title="组件式弹窗">
      <p>这是一个使用组件方式打开的弹窗</p>
      <template #footer>
        <button @click="visible = false">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';
import Modal from './components/Modal.vue';

// 使用组件方式
const visible = ref(false);

// 使用服务方式
const modal = inject('modal');

function openModal() {
  modal({
    title: '自定义弹窗',
    content: '这是一个通过服务方式打开的弹窗',
    width: 600,
    onConfirm: () => {
      console.log('点击了确定');
    },
    onCancel: () => {
      console.log('点击了取消');
    }
  });
}

function showAlert() {
  modal.alert('这是一个提示框', '提示', () => {
    console.log('alert确认');
  });
}

function showConfirm() {
  modal.confirm(
    '确定要执行此操作吗？',
    '确认操作',
    () => {
      console.log('confirm确认');
    },
    () => {
      console.log('confirm取消');
    }
  );
}
</script>
```

### 设计亮点

1）使用Teleport

利用Vue3的Teleport特性将弹窗渲染到body元素下，避免受到父组件样式和布局的影响。这一点在Vue2中较难实现。

相关文档：<https://cn.vuejs.org/guide/built-ins/teleport.html>

2）组合式API优势

使用setup语法糖，简化代码结构，更好地组织逻辑并重用代码。

3）两种使用方式

同时支持组件式（通过v-model控制显隐）和服务式（通过API调用）两种使用方式，满足不同场景需求。

4）支持多种交互方式

支持按钮关闭、点击遮罩层关闭、ESC键关闭等多种交互方式。

5）自定义能力

通过插槽机制支持自定义内容、标题和底部按钮，增强组件的灵活性。

这种设计结合了Vue3的新特性和最佳实践，既保证了良好的用户体验，又提供了灵活的使用方式，适用于大多数前端项目中的弹窗需求。


