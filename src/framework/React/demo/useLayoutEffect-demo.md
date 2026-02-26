# 场景
### 案例1：自定义下拉菜单（防止跳动）

```javascript
function Dropdown({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState('bottom');
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;

    // 判断下方空间是否足够
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const shouldPlaceAbove = spaceBelow < menuHeight;

    setPlacement(shouldPlaceAbove ? 'top' : 'bottom');
  }, [isOpen]);

  return (
    <div className="dropdown">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className="dropdown-menu"
          style={{
            position: 'absolute',
            [placement]: '100%',
            left: 0,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
```

### 案例2：模态框聚焦管理

```javascript
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useLayoutEffect(() => {
    if (isOpen) {
      // 保存之前聚焦的元素
      previousActiveElement.current = document.activeElement;
      // 聚焦到模态框
      modalRef.current?.focus();
    } else {
      // 恢复之前的聚焦
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      tabIndex={-1}
      className="modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}
```

### 案例3：虚拟滚动列表

```javascript
function VirtualList({ items, itemHeight, containerHeight }) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    const handleScroll = () => {
      const scrollTop = scrollRef.current.scrollTop;
      const newStartIndex = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const newEndIndex = newStartIndex + visibleCount + 1;

      setStartIndex(newStartIndex);
      setEndIndex(newEndIndex);
    };

    handleScroll(); // 初始计算
    scrollRef.current.addEventListener('scroll', handleScroll);
    return () => scrollRef.current.removeEventListener('scroll', handleScroll);
  }, [itemHeight, containerHeight]);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={scrollRef}
      style={{ height: containerHeight, overflow: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 最佳实践总结

### ✅ 应该使用 `useLayoutEffect` 的场景

1. **测量 DOM 后同步更新样式**
```javascript
useLayoutEffect(() => {
  const height = elementRef.current.scrollHeight;
  elementRef.current.style.maxHeight = `${height}px`;
}, [children]);
```

2. **防止视觉跳动**
```javascript
useLayoutEffect(() => {
  if (isOpen) {
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom, left: rect.left });
  }
}, [isOpen]);
```

3. **同步滚动位置**
```javascript
useLayoutEffect(() => {
  containerRef.current.scrollTop = savedScrollPosition;
}, [savedScrollPosition]);
```

### ❌ 不应该使用 `useLayoutEffect` 的场景

1. **数据获取**
```javascript
// ❌ 会阻塞渲染
useLayoutEffect(() => {
  fetchData().then(setData);
}, [id]);

// ✅ 使用 useEffect
useEffect(() => {
  fetchData().then(setData);
}, [id]);
```

2. **日志记录或分析**
```javascript
// ❌ 没必要阻塞渲染
useLayoutEffect(() => {
  analytics.track('page_view');
}, []);

// ✅ 使用 useEffect
useEffect(() => {
  analytics.track('page_view');
}, []);
```

3. **复杂计算**
```javascript
// ❌ 会阻塞渲染
useLayoutEffect(() => {
  const result = expensiveComputation(data);
  setResult(result);
}, [data]);

// ✅ 使用 useEffect 或 useMemo
const result = useMemo(() => expensiveComputation(data), [data]);
```

---
