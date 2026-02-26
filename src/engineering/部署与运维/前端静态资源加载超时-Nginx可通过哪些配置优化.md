# 前端静态资源加载超时，Nginx 可通过哪些配置优化？

## ⏱️ 超时相关核心配置

### 1. 代理和上游服务器超时设置

```nginx
server {
    # 客户端到Nginx的连接超时
    client_header_timeout 30s;
    client_body_timeout 30s;
    
    # Nginx到客户端的响应超时
    send_timeout 30s;
    
    # 解析域名超时
    resolver_timeout 10s;
}

# 上游服务器超时设置（如果有后端API）
upstream backend {
    server 127.0.0.1:8080;
    
    # 连接超时
    proxy_connect_timeout 5s;
    # 读取响应超时
    proxy_read_timeout 30s;
    # 发送请求超时
    proxy_send_timeout 30s;
}
```

### 2. 长连接优化

```nginx
http {
    # 开启长连接
    keepalive_timeout 75s;
    keepalive_requests 100;
    
    # 上游连接保持
    upstream backend {
        server 127.0.0.1:8080;
        keepalive 32;  # 连接池大小
    }
}
```

## 🚀 静态资源传输优化

### 1. Gzip压缩配置

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;  # 只压缩大于1KB的文件
    gzip_comp_level 6;     # 压缩级别1-9
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;
    
    # 预压缩版本，减少CPU消耗
    gzip_static on;
}
```

### 2. 分块传输和缓冲优化

```nginx
server {
    # 启用分块传输
    chunked_transfer_encoding on;
    
    # 输出缓冲优化
    output_buffers 4 32k;
    postpone_output 1460;
    
    # 直接IO，大文件传输优化
    directio 4m;
    directio_alignment 512;
    
    location ~* \.(mp4|avi|mkv|iso)$ {
        directio 8m;
        # 大文件使用aio
        aio on;
    }
}
```

## 📦 缓存和预读优化

### 1. 静态资源缓存策略

```nginx
server {
    # 开启文件缓存
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # 发送文件优化（零拷贝）
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        # 缓存优化
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # 断点续传
        max_ranges 1;
        
        # 文件读取优化
        read_ahead 512k;
    }
}
```

### 2. 代理缓存配置

```nginx
http {
    # 代理缓存路径
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=static_cache:10m 
                     max_size=10g inactive=60m use_temp_path=off;
    
    server {
        location /static/ {
            proxy_cache static_cache;
            proxy_cache_valid 200 302 12h;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            
            # 缓存锁，避免惊群
            proxy_cache_lock on;
            proxy_cache_lock_timeout 5s;
        }
    }
}
```

## 🌐 并发和连接优化

### 1. 连接限制优化

```nginx
http {
    # 限制每个IP的连接数
    limit_conn_zone $binary_remote_addr zone=perip:10m;
    limit_conn_zone $server_name zone=perserver:10m;
    
    server {
        # 静态资源不限制连接数
        location ~* \.(js|css|png|jpg|woff2)$ {
            limit_conn perip 50;
            limit_conn perserver 200;
        }
        
        # API接口限制较严格
        location /api/ {
            limit_conn perip 10;
            limit_conn perserver 100;
        }
    }
}
```

### 2. 请求速率限制

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
        }
    }
}
```

## 🔧 高级优化配置

### 1. HTTP/2 优化

```nginx
server {
    listen 443 ssl http2;
    
    # HTTP/2优化
    http2_max_concurrent_streams 128;
    http2_max_field_size 16k;
    http2_max_header_size 32k;
    http2_body_preread_size 64k;
    
    # 服务器推送（谨慎使用）
    # location /index.html {
    #     http2_push /static/css/app.css;
    #     http2_push /static/js/app.js;
    # }
}
```

### 2. SSL/TLS 优化

```nginx
server {
    listen 443 ssl;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:!aNULL:!MD5:!RC4;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_buffer_size 4k;  # 减少SSL记录大小
    
    # 早期数据（0-RTT）
    ssl_early_data on;
}
```

## 🎯 针对不同资源类型的优化

### 1. 大文件下载优化

```nginx
location ~* \.(zip|tar|gz|pdf|mp4)$ {
    # 大文件传输优化
    sendfile on;
    aio on;
    directio 8m;
    
    # 限速控制
    limit_rate_after 10m;  # 10MB后开始限速
    limit_rate 1m;         # 限制为1MB/s
    
    # 缓存设置
    expires 7d;
}
```

### 2. 图片资源优化

```nginx
location ~* \.(jpg|jpeg|png|gif|webp)$ {
    # 图片优化
    image_filter_buffer 10M;
    
    # WebP自动转换（需要相应模块）
    # if ($http_accept ~* "webp") {
    #     rewrite ^(.*)\.(jpg|jpeg|png)$ $1.webp break;
    # }
    
    expires 1y;
    add_header Cache-Control "public";
}
```

## 📊 监控和调试配置

### 1. 状态监控

```nginx
server {
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
    
    location /cache_status {
        proxy_cache_key "$scheme$request_method$host$request_uri";
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### 2. 日志优化

```nginx
http {
    # 定义日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'urt="$upstream_response_time"';
    
    access_log /var/log/nginx/access.log main buffer=32k flush=1m;
}
```

## 🛠️ 完整优化配置示例

```nginx
events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 基础优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # 超时设置
    client_header_timeout 15s;
    client_body_timeout 15s;
    send_timeout 15s;
    
    # 文件缓存
    open_file_cache max=2000 inactive=20s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors off;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;
    
    server {
        listen 80;
        server_name example.com;
        
        # 静态资源优化
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            
            # 传输优化
            sendfile on;
            tcp_nopush on;
            
            # 文件读取
            read_ahead 512k;
        }
        
        # HTML文件不缓存
        location ~* \.html$ {
            add_header Cache-Control "no-cache";
        }
    }
}
```

## 💡 关键优化点总结

1. **超时配置**：合理设置各类超时时间，避免连接堆积
2. **连接复用**：启用keepalive和HTTP/2减少握手开销
3. **压缩传输**：Gzip压缩减少传输体积
4. **缓存策略**：浏览器缓存+Nginx缓存减少重复请求
5. **文件传输**：sendfile、directio优化大文件传输
6. **并发控制**：合理限制连接数和请求速率
7. **监控调试**：通过日志和状态接口持续优化
