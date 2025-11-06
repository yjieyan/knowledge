# Jquery

1. 你觉得jQuery或zepto源码有哪些写的好的地方
    jquery源码封装在⼀个匿名函数的自执行环境中，有助于防止变量的全局污染，然后通过
    传⼊window对象参数， 可以使window对象作为局部变量使用， 好处是当jquery中访问
    window对象的时候，就不用将作用域链退回到顶层作用域了，从而可以更快的访问
    window对象 。同样，传⼊undefined参数， 可以缩短查找undefined时的作用域链

    ```js
    (function( window, undefined ) {

    //用⼀个函数域包起来，就是所谓的沙箱

    //在这里边var定义的变量，属于这个函数域内的局部变量，避免污染全局

    //把当前沙箱需要的外部变量通过函数参数引⼊进来

    //只要保证参数对内提供的接⼝的⼀致性，你还可以随意替换传进来的这个参数

    window.jQuery = window.$ = jQuery;

    })( window );
    ```

    jquery将⼀些原型属性和方法封装在了jquery.prototype中， 为了缩短名称， ⼜赋值给了
    jquery.fn， 这是很形象的写法
    有⼀些数组或对象的方法经常能使用到，jQuery将其保存为局部变量以提高访问速度
    jquery实现的链式调用可以节约代码，所返回的都是同⼀个对象， 可以提高代码效率

2. jQuery 的实现原理

    ```js
    (function(window, undefined) {})(window);
    ```

    jQuery 利用 JS 函数作用域的特性， 采用立即调用表达式包裹了自身，解决命名空间
    和变量污染问题

    window.jQuery = window.$ = jQuery;

    在闭包当中将 jQuery 和 $ 绑定到 window 上， 从而将 jQuery 和 $ 暴露为全局变量

3. jQuery.fn 的 init 方法返回的 this 指的是什么对象
    jQuery.fn 的 init 方法 返回的 this 就是 jQuery 对象
    用户使用 jQuery() 或 $() 即可初始化 jQuery 对象，不需要动态的去调用 init 方法

4. jQuery.extend 与 jQuery.fn.extend 的区别
    ```js
    $.fn.extend() 和 $.extend() 是 jQuery 为扩展插件提拱了两个方法
    $.extend(object) ; // 为jQuery添加“静态方法” ( 工具方法)

    $.extend({
    min: function(a, b) { return a < b ? a : b; },
    max: function(a, b) { return a > b ? a : b; }

    });
    $.min(2,3); // 2
    $.max(4,5); // 5

    $.extend([true,] targetObject, object1[, object2]); // 对targt对象进行扩展

    var settings = { validate: false, limit: 5 } ;

    var options = {validate:true, name:"bar"};

    $.extend(settings, options); // 注意：不支持第⼀个参数传 false
    // settings == {validate:true, limit:5, name:"bar"}

    $.fn.extend(json) ; // 为jQuery添加“成员函数” ( 实例方法)

    $.fn.extend({
    alertValue: function() {

    $(this).click(function(){
    alert($(this).val());

    });
    }
    });

    $("#email").alertValue();
    ```



5. jQuery 的属性拷贝(extend)的实现原理是什么， 如何实现深拷贝

    浅拷贝 ( 只复制⼀份原始对象的引用) 
    ```js
    var newObject = $.extend({}, oldObject);
    ```

    深拷贝 ( 对原始对象属性所引用的对象进行进行递归拷贝) 
    ```js
    var newObject = $.extend(true, {}, oldObject);
    ```

6. jQuery 的队列是如何实现的
    jQuery 核心中有⼀组队列控制方法， 由 queue()/dequeue()/clearQueue() 三个方法组
    成。

    主要应用于 animate() ， ajax ， 其他要按时间顺序执行的事件中

    ```js
    var func1 = function(){alert( '事件1');}
    var func2 = function(){alert( '事件2');}
    var func3 = function(){alert( '事件3');}
    var func4 = function(){alert( '事件4');}

    // 入栈队列事件
    $( '#box').queue("queue1", func1); // push func1 to queue1
    $( '#box').queue("queue1", func2); // push func2 to queue1

    // 替换队列事件
    $( '#box').queue("queue1", []); // delete queue1 with empty array
    $( '#box').queue("queue1", [func3, func4]); // replace queue1

    // 获取队列事件 ( 返回⼀个函数数组)
    $( '#box').queue("queue1"); // [func3(), func4()]

    // 出栈队列事件并执行
    $( '#box').dequeue("queue1"); // return func3 and do func3
    $( '#box').dequeue("queue1"); // return func4 and do func4

    // 清空整个队列
    $( '#box').clearQueue("queue1"); // delete queue1 with clearQueue
    ```

7. jQuery 中的 bind(), live(), delegate(), on()的区别

    bind() 直接绑定在目标元素上
    live() 通过冒泡传播事件， 默认 document 上， ⽀持动态数据
    delegate() 更精确的小范围使用事件代理，性能优于 live
    on() 是最新的 1.9 版本整合了之前的三种⽅式的新事件绑定机制

8. 是否知道自定义事件

    事件即“发布/订阅”模式， 自定义事件即“消息发布”，事件的监听即“订阅订阅”
    JS 原生⽀持自定义事件， 示例：
    ```js
        document.createEvent(type); // 创建事件
        event.initEvent(eventType, canBubble, prevent); // 初始化事件
        target.addEventListener( 'dataavailable', handler, false); // 监听事件
        target.dispatchEvent(e); // 触发事件
    ```
    jQuery 里的 fire 函数用于调用 jQuery 自定义事件列表中的事件

9. jQuery 通过哪个方法和 Sizzle 选择器结合的

    Sizzle 选择器采取 Right To Left 的匹配模式， 先搜寻所有匹配标签， 再判断它的父
    节点
    jQuery 通过 $(selecter).find(selecter); 和 Sizzle 选择器结合

10. jQuery 中如何将数组转化为 JSON 字符串，然后再转化回来
    ```js
    // 通 过 原 生 JSON.stringify/JSON.parse 扩 展 jQuery 实 现
    $.array2json = function(array) {

    return JSON.stringify(array);
    }

    $.json2array = function(array) {

    // $.parseJSON(array); // 3.0 开始， 已过时
    return JSON.parse(array);

    }

    // 调用
    var json = $.array2json( [ 'a', 'b', 'c']);
    var array = $.json2array(json);

    11.jQuery ⼀个对象可以同时绑定多个事件， 这是如何实现的

    $ ("# btn"). on("mouseover mouseout", func);

    $("#btn").on({
    mouseover: func1,
    mouseout: func2,
    click: func3

    });
    ```
12. 针对 jQuery 的优化方法
    缓存频繁操作 DOM 对象
    尽量使用 id 选择器代替 class 选择器
    总是从 #id 选择器来继承
    尽量使用链式操作
    使用时间委托 on 绑定事件
    采用 jQuery 的内部函数 data() 来存储数据
    使用最新版本的 jQuery

13. jQuery 的 slideUp 动画， 当鼠标快速连续触发, 动画会滞后反复执行，该如何处理呢

    在触发元素上的事件设置为延迟处理：使用 JS 原生 setTimeout 方法
    在触发元素的事件时预先停止所有的动画， 再执行相应的动画事件：
    $('.tab').stop().slideUp();

14. jQuery UI 如何自定义组件

    通过向 $.widget() 传递组件名称和⼀个原型对象来完成
    $.widget("ns.widgetName", [baseWidget], widgetPrototype);

15. jQuery 与 jQuery UI 、jQuery Mobile 区别

    jQuery 是 JS 库，兼容各种PC浏览器， 主要用作更方便地处理 DOM 、事件 、动画、
    AJAX

    jQuery UI 是建立在 jQuery 库上的⼀组用户界面交互 、特效 、小部件及主题

    jQuery Mobile 以 jQuery 为基础，用于创建“移动Web应用”的框架

16. jQuery 和 Zepto 的区别？ 各自的使用场景

    jQuery 主要目标是 PC 的网页中，兼容全部主流浏览器 。在移动设备方面， 单独推出
    、jQueryMobile

    Zepto 从⼀开始就定 位移动设备，相对更轻量级 。它的 API 基本兼容 jQuery、，但对PC浏
    览器兼容不理想

17. jQuery对象的特点

    只有 JQuery 对象才能使用 JQuery 方法
    JQuery 对象是⼀个数组对象

五、Bootstrap

1. 什么是Bootstrap？ 以及为什么要使用Bootstrap？

Bootstrap 是⼀个用于快速开发 Web 应用程序和网站的前端框架。
Bootstrap 是基于 HTML 、 CSS 、 JAVASCRIPT 的

Bootstrap 具有移动设备优先 、浏览器支持良好 、容易上手 、响应式设计等优点，所以
Bootstrap 被广泛应用

2. 使用Bootstrap时，要声明的文档类型是什么？ 以及为什么要这样声明？

    使用 Bootstrap 时， 需要使用 HTML5 文档类型 ( Doctype ) 。 <!DOCTYPE html>

    因为 Bootstrap 使用了⼀些 HTML5 元素和 CSS 属性， 如果在 Bootstrap 创建的网
    页开头不使用 HTML5 的文档类型 ( Doctype )， 可能会面临⼀些浏览器显示不⼀致的
    问题， 甚至可能面临⼀些特定情境下的不⼀致， 以致于代码不能通过 W3C 标准的验证

3. 什么是Bootstrap网格系统

    Bootstrap 包含了⼀个响应式的 、移动设备优先的 、不固定的网格系统， 可
    以随着设备或视⼝大⼩的增加而适当地扩展到 12 列 。它包含了用于简单的
    布局选项的预定义类，也包含了用于生成更多语义布局的功能强大的混合类

    响应式网格系统随着屏幕或视⼝ ( viewport ) 尺⼨的增加， 系统会自动分为最多 12

    列。

4. Bootstrap 网格系统 ( Grid System) 的工作原理

    ( 1) 行必须放置在 .container class 内， 以便获得适当的对齐 ( alignment ) 和内
    边距 ( padding ) 。

    ( 2) 使用行来创建列的水平组。
    ( 3) 内容应该放置在列内，且唯有列可以是行的直接⼦元素。
    ( 4) 预定义的网格类， 比如 .row 和 .col-xs-4 ， 可用于快速创建网格布局 。 LESS

    混合类可用于更多语义布局。
    ( 5) 列通过内边距 ( padding ) 来创建列内容之间的间隙 。该内边距是通过 .rows 上

    的外边距 ( margin ) 取负，表示第⼀列和最后⼀列的行偏移。
    ( 6) 网格系统是通过指定您想要横跨的⼗⼆个可用的列来创建的 。例如，要创建三个相等

    的列，则使用三个 .col-xs-4

5. 对于各类尺寸的设备， Bootstrap设置的class前缀分别是什么
    超⼩设备手机 ( <768px )： .col-xs-*

    ⼩型设备平板电脑 ( >=768px )： .col-sm-*

    中型设备台式电脑 ( >=992px )： .col-md-*

    大型设备台式电脑 ( >=1200px )： .col-lg-*

6. Bootstrap 网格系统列与列之间的间隙宽度是多少

    间隙宽度为 30px (⼀个列的每边分别是 15px )

7. 如果需要在⼀个标题的旁边创建副标题， 可以怎样操作

    在元素两旁添加 `<small>` ， 或者添加 `.small` 的 `class`

8. 用Bootstrap ， 如何设置文字的对齐方式？

    class="text-center" 设置居中文本
    class="text-right" 设置向右对齐文本
    class="text-left" 设置向左对齐文本

9. Bootstrap如何设置响应式表格？

    增加 `class="table-responsive"`

10. 使用Bootstrap创建垂直表单的基本步骤？

    ( 1) 向父 `<form>` 元素添加 role="form" ；

    ( 2) 把标签和控件放在⼀个带有 class="form-group" 的 `<div>` 中， 这是获取最佳间距
    所必需的；

    ( 3) 向所有的文本元素 `<input>` 、 `<textarea>` 、 `<select> `添加 class="form-

    control"

11. 使用Bootstrap创建水平表单的基本步骤？

    ( 1) 向父 <form> 元素添加 class="form-horizontal" ；

    ( 2) 把标签和控件放在⼀个带有 class="form-group" 的 <div> 中；

    ( 3) 向标签添加 class="control-label" 。

12. 使用Bootstrap如何创建表单控件的帮助文本？

    增加 class="help-block" 的 span 标签或 p 标签。

13. 使用Bootstrap激活或禁用按钮要如何操作？

    激活按钮：给按钮增加 .active 的 class

    禁用按钮：给按钮增加 disabled="disabled" 的属性

14. Bootstrap有哪些关于的class？

    ( 1) .img-rounded 为图片添加圆角
    ( 2) .img-circle 将图片变为圆形
    ( 3) .img-thumbnail 缩略图功能
    ( 4) .img-responsive 图片响应式 (将很好地扩展到父元素)

15. Bootstrap中有关元素浮动及清除浮动的class？
    ( 1) class="pull-left" 元素浮动到左边

    ( 2) class="pull-right" 元素浮动到右边

    ( 3) class="clearfix" 清除浮动

16. 除了屏幕阅读器外， 其他设备上隐藏元素的class？

    `class="sr-only"`

17. Bootstrap如何制作下拉菜单？

    ( 1) 将下拉菜单包裹在 class="dropdown" 的 <div> 中；
    ( 2) 在触发下拉菜单的按钮中添加： class="btn dropdown-toggle"

    id="dropdownMenu1" data-toggle="dropdown"

    ( 3) 在包裹下拉菜单的ul中添加： `class="dropdown-menu" role="menu" aria-

    labelledby="dropdownMenu1"`

    ( 4) 在下拉菜单的列表项中添加： role="presentation" 。其中，下拉菜单的标题要添
    加 class="dropdown-header" ， 选项部分要添加 tabindex="-1" 。

18.  Bootstrap如何制作按钮组？ 以及水平按钮组和垂直按钮组的优先级？

    ( 1) 用 class="btn-group" 的 `<div>` 去包裹按钮组；
     `class="btn-group-vertical"` 可设置垂直按钮组。
    ( 2) btn-group 的优先级高于 btn-group-vertical 的优先级。

19. Bootstrap如何设置按钮的下拉菜单？

    在⼀个 `.btn-group` 中放置按钮和下拉菜单即可。

20. Bootstrap中的输入框组如何制作？

    ( 1) 把前缀或者后缀元素放在⼀个带有 class="input-group" 中的 `<div>` 中
    ( 2) 在该 `<div>` 内，在 class="input-group-addon" 的 `<span> `里面放置额外的内容；
    ( 3) 把 `<span>` 放在 `<input>` 元素的前面或后面。

21. Bootstrap中的导航都有哪些？
    ( 1) 导航元素：有 class="nav nav-tabs" 的标签页导航， 还有 class="nav nav-

    pills" 的胶囊式标签页导航；
    ( 2) 导航栏： `class="navbar navbar-default" role="navigation"` ；
    ( 3) 面包屑导航： `class="breadcrumb"`

22. Bootstrap中设置分页的class？

    默认的分页： `class="pagination"`

    默认的翻页： `class="pager"`

23. Bootstrap中显示标签的class？

    ```html
    class="label"
    ```

24. Bootstrap中如何制作徽章？

    ```html
    <span class="badge">26</span>
    ```

25. Bootstrap中超大屏幕的作用是什么？

    设置 `class="jumbotron"` 可以制作超大屏幕，该组件可以增加标题的大小并增加更多的外边距
