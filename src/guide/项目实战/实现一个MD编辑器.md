# 实现一个简易MD编辑器，支持实时预览并展示渲染效果

1）核心思路

实现一个简易的 Markdown 编辑器，主要包括两个部分：输入区（用于编写 Markdown 文本）和预览区（实时渲染 Markdown 内容）。用户在输入区输入 Markdown 语法内容，编辑器会监听输入变化，实时将 Markdown 文本解析为 HTML，并在预览区展示渲染效果。

2）实现步骤

* 使用 React 或 Vue 等前端框架，创建一个文本输入框（如 textarea）和一个用于展示渲染结果的区域。
* 监听输入框内容变化（如 onChange 事件），将 Markdown 文本传递给解析函数。
* 使用开源 Markdown 解析库（如 marked、markdown-it）将 Markdown 文本转换为 HTML。
* 将解析后的 HTML 通过 dangerouslySetInnerHTML（React）或 v-html（Vue）渲染到页面上，实现实时预览。
* 可选：增加防抖处理，避免输入过快导致性能问题。

3）代码实现示例（React + marked）

```
//src/components/MarkdownEditor.js
import { useState } from "react";
import { marked } from "marked";

export default function MarkdownEditor() {
  const [value, setValue] = useState("# Hello Markdown!");
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <textarea
        style={{ width: 300, height: 300 }}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <div
        style={{ width: 300, height: 300, border: "1px solid #ccc", padding: 10, overflow: "auto" }}
        dangerouslySetInnerHTML={{ __html: marked(value) }}
      />
    </div>
  );
}
```

4）注意事项

* 为了安全，生产环境下建议对解析后的 HTML 进行 XSS 过滤（如使用 DOMPurify）。
* 可以根据需求扩展功能，如支持代码高亮、图片上传、全屏编辑等。

## 扩展

### 1）常用 Markdown 解析库

* marked：轻量、速度快，社区活跃，支持扩展语法。
* markdown-it：插件丰富，支持自定义渲染规则。
* showdown：兼容性好，API 简单。

### 2）代码高亮

如果需要对 Markdown 中的代码块进行高亮，可以结合 highlight.js 或 prism.js。以 marked 为例：

```javascript
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

marked.setOptions({
  highlight: function (code, lang) {
    return hljs.highlightAuto(code, [lang]).value;
  }
});
```

### 3）防止 XSS 攻击

Markdown 解析后生成的 HTML 可能包含恶意脚本，建议结合 DOMPurify 进行过滤：

```
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(value)) }} />
```

### 4）Mermaid 流程图辅助

### 5）相关文档地址

* marked 官方文档：<https://marked.js.org/>
* markdown-it 官方文档：<https://markdown-it.github.io/>
* React 官方文档：<https://react.dev/>
* DOMPurify：<https://github.com/cure53/DOMPurify>
* highlight.js：<https://highlightjs.org/>

<!-- ## 项目实战

我们将上述的题解方案整合成了一个案例项目，感兴趣的同学可以动手下载下来结合题解分析一下项目源码，相信 会有更深入的理解，你也可以在线访问项目地址进行体验。

![image.png](https://pic.code-nav.cn/mianshiya/question_picture/1810587471143874561/EdlJ51zB_image.png)

项目源码：

<https://github.com/mianshiya/exampleProject/tree/main/project-bolt-sb1-oizk3jd8>

在线地址： <https://wonderful-figolla-a89b88.netlify.app/> -->
