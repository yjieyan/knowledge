# demo
### 案例1：完整的用户管理系统

```javascript
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 获取用户列表
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          filter,
          sortBy
        });
        
        const response = await fetch(`/api/users?${params}`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('获取用户列表失败');
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    fetchUsers();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [filter, sortBy]);
  
  // 实时更新选中用户的状态
  useEffect(() => {
    if (!selectedUserId) return;
    
    const ws = new WebSocket(`ws://localhost:8080/users/${selectedUserId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUserId 
            ? { ...user, ...data }
            : user
        )
      );
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [selectedUserId]);
  
  // 页面标题更新
  useEffect(() => {
    document.title = `用户管理 (${users.length} 人)`;
  }, [users.length]);
  
  // 错误日志记录
  useEffect(() => {
    if (error) {
      console.error('用户管理错误:', error);
      // 可以发送到错误监控服务
    }
  }, [error]);
  
  return (
    <div className="user-management">
      <h1>用户管理</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder="搜索用户..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">按姓名排序</option>
          <option value="email">按邮箱排序</option>
          <option value="createdAt">按创建时间排序</option>
        </select>
      </div>
      
      {loading && <div>加载中...</div>}
      {error && <div className="error">错误：{error}</div>}
      
      <div className="user-list">
        {users.map(user => (
          <div 
            key={user.id} 
            className={`user-item ${user.id === selectedUserId ? 'selected' : ''}`}
            onClick={() => setSelectedUserId(user.id)}
          >
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>状态: {user.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 案例2：实时聊天应用

```javascript
function ChatRoom({ roomId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // WebSocket 连接管理
  useEffect(() => {
    // 创建 WebSocket 连接
    wsRef.current = new WebSocket(`ws://localhost:8080/chat/${roomId}`);
    const ws = wsRef.current;
    
    ws.onopen = () => {
      console.log('连接到聊天室:', roomId);
      setConnected(true);
    };
    
    ws.onclose = () => {
      console.log('断开连接');
      setConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      setConnected(false);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          setMessages(prev => [...prev, data.message]);
          break;
        case 'userTyping':
          setTypingUsers(data.users);
          break;
        case 'history':
          setMessages(data.messages);
          break;
        default:
          console.log('未知消息类型:', data.type);
      }
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);
  
  // 发送消息
  const sendMessage = () => {
    if (!inputMessage.trim() || !connected) return;
    
    const message = {
      id: Date.now(),
      text: inputMessage.trim(),
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString()
    };
    
    wsRef.current.send(JSON.stringify({
      type: 'message',
      message
    }));
    
    setInputMessage('');
  };
  
  // 输入状态处理
  useEffect(() => {
    if (!connected) return;
    
    // 清除之前的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 发送正在输入状态
    if (inputMessage.trim()) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping: true
      }));
      
      // 3秒后自动停止输入状态
      typingTimeoutRef.current = setTimeout(() => {
        wsRef.current.send(JSON.stringify({
          type: 'typing',
          isTyping: false
        }));
      }, 3000);
    } else {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping: false
      }));
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputMessage, connected]);
  
  // 自动滚动到底部
  useEffect(() => {
    const messageContainer = document.getElementById('messages');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);
  
  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>聊天室: {roomId}</h2>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '已连接' : '未连接'}
        </div>
      </div>
      
      <div id="messages" className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.userId === currentUser.id ? 'own' : 'other'}`}
          >
            <div className="message-header">
              <span className="user-name">{message.userName}</span>
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
      </div>
      
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.join(', ')} 正在输入...
        </div>
      )}
      
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          disabled={!connected}
        />
        <button onClick={sendMessage} disabled={!connected || !inputMessage.trim()}>
          发送
        </button>
      </div>
    </div>
  );
}
```

### 关键要点：

1. **理解执行时机**：不同的依赖数组控制不同的执行时机
2. **处理好清理函数**：防止内存泄漏和资源浪费
3. **注意闭包问题**：使用函数式更新或 ref 获取最新值
4. **优化依赖项**：使用 useMemo 和 useCallback 减少不必要的执行
5. **分离关注点**：一个 effect 只做一件事
6. **处理竞态条件**：使用 AbortController 和标志位
