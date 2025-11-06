# Jquery

1 你觉得jQuery或zepto源码有哪些写的好的地方
jquery源码封装在⼀个匿名函数的自执行环境中，有助于防止变量的全局污染，然后通过
传⼊window对象参数， 可以使window对象作为局部变量使用， 好处是当jquery中访问
window对象的时候，就不用将作用域链退回到顶层作用域了，从而可以更快的访问
window对象 。同样，传⼊undefined参数， 可以缩短查找undefined时的作用域链

(function( window, undefined ) {

//用⼀个函数域包起来，就是所谓的沙箱

//在这里边var定义的变量，属于这个函数域内的局部变量，避免污染全局

//把当前沙箱需要的外部变量通过函数参数引⼊进来

//只要保证参数对内提供的接⼝的⼀致性，你还可以随意替换传进来的这个参数

window.jQuery = window.$ = jQuery;

})( window );

jquery将⼀些原型属性和方法封装在了jquery.prototype中， 为了缩短名称， ⼜赋值给了
jquery.fn， 这是很形象的写法
有⼀些数组或对象的方法经常能使用到，jQuery将其保存为局部变量以提高访问速度
jquery实现的链式调用可以节约代码，所返回的都是同⼀个对象， 可以提高代码效率

2 jQuery 的实现原理

(function(window, undefined) {})(window);

jQuery 利用 JS 函数作用域的特性， 采用立即调用表达式包裹了自身，解决命名空间
和变量污染问题

window.jQuery = window.$ = jQuery;

在闭包当中将 jQuery 和 $ 绑定到 window 上， 从而将 jQuery 和 $ 暴露为全局变量

3 jQuery.fn 的 init 方法返回的 this 指的是什么对象
jQuery.fn 的 init 方法 返回的 this 就是 jQuery 对象
用户使用 jQuery() 或 $() 即可初始化 jQuery 对象，不需要动态的去调用 init 方法

4 jQuery.extend 与 jQuery.fn.extend 的区别

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

5 jQuery 的属性拷贝(extend)的实现原理是什么， 如何实现深拷贝

浅拷贝 ( 只复制⼀份原始对象的引用) var newObject = $.extend({}, oldObject);

深拷贝 ( 对原始对象属性所引用的对象进行进行递归拷贝) var newObject =
$.extend(true, {}, oldObject);

6 jQuery 的队列是如何实现的
jQuery 核心中有⼀组队列控制方法， 由 queue()/dequeue()/clearQueue() 三个方法组
成。

主要应用于 animate() ， ajax ， 其他要按时间顺序执行的事件中

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

91/115





7 jQuery 中的 bind(), live(), delegate(), on()的区别

bind() 直接绑定在目标元素上
live() 通过冒泡传播事件， 默认 document 上， ⽀持动态数据
delegate() 更精确的小范围使用事件代理，性能优于 live
on() 是最新的 1.9 版本整合了之前的三种⽅式的新事件绑定机制

8 是否知道自定义事件

事件即“发布/订阅”模式， 自定义事件即“消息发布”，事件的监听即“订阅订阅”
JS 原生⽀持自定义事件， 示例：

document.createEvent(type); // 创建事件
event.initEvent(eventType, canBubble, prevent); // 初始化事件
target.addEventListener( 'dataavailable', handler, false); // 监听事件
target.dispatchEvent(e); // 触发事件

jQuery 里的 fire 函数用于调用 jQuery 自定义事件列表中的事件

9 jQuery 通过哪个方法和 Sizzle 选择器结合的

Sizzle 选择器采取 Right To Left 的匹配模式， 先搜寻所有匹配标签， 再判断它的父
节点
jQuery 通过 $(selecter).find(selecter); 和 Sizzle 选择器结合

10jQuery 中如何将数组转化为 JSON 字符串，然后再转化回来

/ / 通 过 原 生 JSON.stringify/JSON.parse 扩 展 jQuery 实 现
$.array2json = function(array) {

return JSON.stringify(array);
}

$.json2array = function(array) {

// $.parseJSON(array); // 3.0 开始， 已过时
return JSON.parse(array);

}

92/115





// 调用
var json = $.array2json( [ 'a', 'b', 'c']);
var array = $.json2array(json);

11jQuery ⼀个对象可以同时绑定多个事件， 这是如何实现的

$ ("# btn"). on("mouseover mouseout", func);

$("#btn").on({
mouseover: func1,
mouseout: func2,
click: func3

});

12 针对 jQuery 的优化方法
缓存频繁操作 DOM 对象
尽量使用 id 选择器代替 class 选择器
总是从 #id 选择器来继承
尽量使用链式操作
使用时间委托 on 绑定事件
采用 jQuery 的内部函数 data() 来存储数据
使用最新版本的 jQuery

13jQuery 的 slideUp 动画， 当鼠标快速连续触发, 动画会滞后反复执
行，该如何处理呢

在触发元素上的事件设置为延迟处理：使用 JS 原生 setTimeout 方法
在触发元素的事件时预先停止所有的动画， 再执行相应的动画事件：
$('.tab').stop().slideUp();

14jQuery UI 如何自定义组件

通过向 $.widget() 传递组件名称和⼀个原型对象来完成
$.widget("ns.widgetName", [baseWidget], widgetPrototype);

15jQuery 与 jQuery UI 、jQuery Mobile 区别

93/115





jQuery 是 JS 库，兼容各种PC浏览器， 主要用作更方便地处理 DOM 、事件 、动画、
AJAX

jQuery UI 是建立在 jQuery 库上的⼀组用户界面交互 、特效 、小部件及主题

jQuery Mobile 以 jQuery 为基础，用于创建“移动Web应用”的框架

16jQuery 和 Zepto 的区别？ 各自的使用场景

jQuery 主要目标是 PC 的网页中，兼容全部主流浏览器 。在移动设备方面， 单独推出
、jQueryMobile

Zepto 从⼀开始就定 位移动设备，相对更轻量级 。它的 API 基本兼容 jQuery、，但对PC浏
览器兼容不理想

17jQuery对象的特点

只有 JQuery 对象才能使用 JQuery 方法
JQuery 对象是⼀个数组对象

五、Bootstrap

1 什么是Bootstrap？ 以及为什么要使用Bootstrap？

Bootstrap 是⼀个用于快速开发 Web 应用程序和网站的前端框架。
Bootstrap 是基于 HTML 、 CSS 、 JAVASCRIPT 的

Bootstrap 具有移动设备优先 、浏览器支持良好 、容易上手 、响应式设计等优点，所以
Bootstrap 被广泛应用

2 使用Bootstrap时，要声明的文档类型是什么？ 以及为什么要这样声
明？

使用 Bootstrap 时， 需要使用 HTML5 文档类型 ( Doctype ) 。 <!DOCTYPE html>

因为 Bootstrap 使用了⼀些 HTML5 元素和 CSS 属性， 如果在 Bootstrap 创建的网
页开头不使用 HTML5 的文档类型 ( Doctype )， 可能会面临⼀些浏览器显示不⼀致的
问题， 甚至可能面临⼀些特定情境下的不⼀致， 以致于代码不能通过 W3C 标准的验证

94/115





3 什么是Bootstrap网格系统

Bootstrap 包含了⼀个响应式的 、移动设备优先的 、不固定的网格系统， 可
以随着设备或视⼝大⼩的增加而适当地扩展到 12 列 。它包含了用于简单的
布局选项的预定义类，也包含了用于生成更多语义布局的功能强大的混合类

响应式网格系统随着屏幕或视⼝ ( viewport ) 尺⼨的增加， 系统会自动分为最多 12

列。

4 Bootstrap 网格系统 ( Grid System) 的工作原理

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

5 对于各类尺寸的设备， Bootstrap设置的class前缀分别是什么
超⼩设备手机 ( <768px )： .col-xs-*

⼩型设备平板电脑 ( >=768px )： .col-sm-*

中型设备台式电脑 ( >=992px )： .col-md-*

大型设备台式电脑 ( >=1200px )： .col-lg-*

6 Bootstrap 网格系统列与列之间的间隙宽度是多少

间隙宽度为 30px (⼀个列的每边分别是 15px )

95/115





7 如果需要在⼀个标题的旁边创建副标题， 可以怎样操作

在元素两旁添加 <small> ， 或者添加 .small 的 class

8 用Bootstrap ， 如何设置文字的对齐方式？

class="text-center" 设置居中文本
class="text-right" 设置向右对齐文本
class="text-left" 设置向左对齐文本

9 Bootstrap如何设置响应式表格？

增加 class="table-responsive"

10 使用Bootstrap创建垂直表单的基本步骤？

( 1) 向父 <form> 元素添加 role="form" ；

( 2) 把标签和控件放在⼀个带有 class="form-group" 的 <div> 中， 这是获取最佳间距
所必需的；

( 3) 向所有的文本元素 <input> 、 <textarea> 、 <select> 添加 class="form-

control"

11 使用Bootstrap创建水平表单的基本步骤？

( 1) 向父 <form> 元素添加 class="form-horizontal" ；

( 2) 把标签和控件放在⼀个带有 class="form-group" 的 <div> 中；

( 3) 向标签添加 class="control-label" 。

12 使用Bootstrap如何创建表单控件的帮助文本？

96/115





增加 class="help-block" 的 span 标签或 p 标签。

13 使用Bootstrap激活或禁用按钮要如何操作？

激活按钮：给按钮增加 .active 的 class

禁用按钮：给按钮增加 disabled="disabled" 的属性

14 Bootstrap有哪些关于的class？

( 1) .img-rounded 为图片添加圆角
( 2) .img-circle 将图片变为圆形
( 3) .img-thumbnail 缩略图功能
( 4) .img-responsive 图片响应式 (将很好地扩展到父元素)

15 Bootstrap中有关元素浮动及清除浮动的class？
( 1) class="pull-left" 元素浮动到左边

( 2) class="pull-right" 元素浮动到右边

( 3) class="clearfix" 清除浮动

16 除了屏幕阅读器外， 其他设备上隐藏元素的class？

、class="sr-only"、、

17 Bootstrap如何制作下拉菜单？

( 1) 将下拉菜单包裹在 class="dropdown" 的 <div> 中；
( 2) 在触发下拉菜单的按钮中添加： class="btn dropdown-toggle"

id="dropdownMenu1" data-toggle="dropdown"

( 3) 在包裹下拉菜单的ul中添加： class="dropdown-menu" role="menu" aria-

labelledby="dropdownMenu1"

( 4) 在下拉菜单的列表项中添加： role="presentation" 。其中，下拉菜单的标题要添
加 class="dropdown-header" ， 选项部分要添加 tabindex="-1" 。

97/115





18 Bootstrap如何制作按钮组？ 以及水平按钮组和垂直按钮组的优先
级？

( 1) 用 class="btn-group" 的 <div> 去包裹按钮组； class="btn-group-

vertical" 可设置垂直按钮组。
( 2) btn-group 的优先级高于 btn-group-vertical 的优先级。

19 Bootstrap如何设置按钮的下拉菜单？

在⼀个 .btn-group 中放置按钮和下拉菜单即可。

20 Bootstrap中的输入框组如何制作？

( 1) 把前缀或者后缀元素放在⼀个带有 class="input-group" 中的 <div> 中
( 2) 在该 <div> 内，在 class="input-group-addon" 的 <span> 里面放置额外的内

容；
( 3) 把 <span> 放在 <input> 元素的前面或后面。

21 Bootstrap中的导航都有哪些？
( 1) 导航元素：有 class="nav nav-tabs" 的标签页导航， 还有 class="nav nav-

pills" 的胶囊式标签页导航；
( 2) 导航栏： class="navbar navbar-default" role="navigation" ；
( 3) 面包屑导航： class="breadcrumb"

22 Bootstrap中设置分页的class？

默认的分页： class="pagination"

默认的翻页： class="pager"

23 Bootstrap中显示标签的class？

class="label"

98/115





24 Bootstrap中如何制作徽章？

<span class="badge">26</span>

25 Bootstrap中超大屏幕的作用是什么？

设置 class="jumbotron" 可以制作超大屏幕，该组件可以增加标题的大小并
增加更多的外边距

六、微信小程序

1 微信小程序有几个文件

WXSS (WeiXin Style Sheets) 是⼀套样式语言，用于描述 WXML 的组件样式， js

逻辑处理， 网络请求 json 小程序设置， 如页面注册， 页面标题及 tabBar 。
app.json 必须要有这个文件， 如果没有这个文件，项目无法运行， 因为微信框架把这个

作为配置文件⼊⼝ ，整个小程序的全局配置 。包括页面注册， 网络设置， 以及小程序的
window 背景色， 配置导航条样式， 配置默认标题。
app.js 必须要有这个文件，没有也是会报错！但是这个文件创建⼀下就行 什么都不需要

写以后我们可以在这个文件中监听并处理小程序的生命周期函数 、声明全局变量。
app.wxss 配置全局 css

2 微信小程序怎样跟事件传值

给 HTML 元素添加 data-* 属性来传递我们需要的值，然后通过
e.currentTarget.dataset 或 onload 的 param 参数获取 。但 data -

名称不能有大写字母和不可以存放对象

3 小程序的 wxss 和 css 有哪些不⼀样的地方？
wxss 的图片引⼊需使用外链地址

没有 Body ；样式可直接使用 import 导⼊
99/115





4 小程序关联微信公众号如何确定用户的唯⼀性

使用 wx.getUserInfo ⽅法 withCredentials 为 true 时 可获取
encryptedData ， 里面有 union_id 。后端需要进行对称解密

5 微信小程序与vue区别
生命周期不⼀样，微信小程序生命周期比较简单
数据绑定也不同，微信小程序数据绑定需要使用 {{}} ， vue 直接 : 就可以
显示与隐藏元素， vue 中，使用 v-if 和 v-show 控制元素的显示和隐藏，小程序
中，使用 wx-if 和 hidden 控制元素的显示和隐藏
事件处理不同，小程序中，全用 bindtap(bind+event) ， 或者
catchtap(catch+event) 绑定事件, vue： 使用 v-on:event 绑定事件， 或者使用
@event 绑定事件

数据双向绑定也不也不⼀样在 vue 中,只需要再表单元素上加上 v-model ,然后再绑定
data 中对应的⼀个值， 当表单元素内容发生变化时， data 中对应的值也会相应改变，

这是 vue 非常 nice 的⼀点 。微信小程序必须获取到表单元素， 改变的值，然后再把值赋
给⼀个 data 中声明的变量。

七、webpack相关

1 打包体积 优化思路

提取第三⽅库或通过引用外部⽂件的⽅式引⼊第三⽅库
代码压缩插件 UglifyJsPlugin

服务器启用gzip压缩

按需加载资源⽂件 require.ensure

优化 devtool 中的 source-map

剥离 css ⽂件， 单独打包
去除不必要插件， 通常就是开发环境与生产环境用同⼀套配置⽂件导致

2 打包效率
开发环境采用增量构建，启用热更新

100/115





开发环境不做无意义的工作如提取 css 计算文件hash等
配置 devtool
选择合适的 loader

个别 loader 开启 cache 如 babel-loader

第三方库采用引⼊方式
提取公共代码

优化构建时的搜索路径 指明需要构建目录及不需要构建目录
模块化引⼊需要的部分

3 Loader

编写⼀个loader

loader 就是⼀个 node 模块， 它输出了⼀个函数 。当某种资源需要用这个
loader 转换时， 这个函数会被调用 。并且， 这个函数可以通过提供给它的
this 上下文访问 Loader API 。 reverse-txt-loader

// 定义
module.exports = function(src) {

//src是原文件内容 ( abcde)，下面对内容进行处理， 这里是反转
var result = src.split( '').reverse().join( '');

//返回JavaScript源码，必须是String或者Buffer
return `module.exports = '${result} '`;

}

//使用
{

test: /\.txt$/,
use: [

{

'./path/reverse-txt-loader'
}

]
},

4 说⼀下webpack的⼀些plugin ， 怎么使用webpack对项目进行优化
构建优化

减少编译体积 ContextReplacementPugin 、 IgnorePlugin 、 babel-plugin-
import 、 babel-plugin-transform-runtime

101/115





并行编译 happypack 、 thread-loader 、 uglifyjsWebpackPlugin 开启并行
缓存 cache-loader 、 hard-source-webpack-plugin 、 uglifyjsWebpackPlugin 开
启缓存 、 babel-loader 开启缓存
预编译 dllWebpackPlugin && DllReferencePlugin 、 auto-dll-webapck-plugin

性能优化

减少编译体积 Tree-shaking 、 Scope Hositing

hash 缓存 webpack-md5-plugin

拆包 splitChunksPlugin 、 import() 、 require.ensure

八、编程题

1 写⼀个通用的事件侦听器函数

// event(事件)工具集，来源：github.com/markyun
markyun.Event = {

// 视能力分别使用dom0| |dom2 | |IE方式 来绑定事件
// 参数： 操作的元素 ,事件名称 ,事件处理程序
addEvent : function(element, type, handler) {

if (element.addEventListener) {

//事件类型 、需要执行的函数 、是否捕捉
element.addEventListener(type, handler, false);

} else if (element.attachEvent) {
element.attachEvent( 'on' + type, function() {

handler.call(element);
});

} else {
element [ 'on' + type] = handler;

}
},
// 移除事件
removeEvent : function(element, type, handler) {

if (element.removeEventListener) {
element.removeEventListener(type, handler, false);

} else if (element.datachEvent) {
element.detachEvent( 'on' + type, handler);

} else {
element [ 'on' + type] = null;

}
},
// 阻止事件 (主要是事件冒泡， 因为IE不支持事件捕获)
stopPropagation : function(ev) {

102/115





if (ev.stopPropagation) {
ev.stopPropagation();

} else {
ev.cancelBubble = true;

}
},
// 取消事件的默认行为
preventDefault : function(event) {

if (event.preventDefault) {
event.preventDefault();

} else {
event.returnValue = false;

}
},
// 获取事件目标
getTarget : function(event) {

return event.target || event.srcElement;
}

2 如何判断⼀个对象是否为数组

function isArray( arg) {

if (typeof arg === 'object') {
return Object.prototype.toString.call(arg) === '[object Array]';

}
return false;

}

3 冒泡排序
每次比较相邻的两个数， 如果后⼀个比前⼀个小，换位置

var arr = [3, 1, 4, 6, 5, 7, 2];

function bubbleSort(arr) {
for (var i = 0; i < arr.length - 1; i++) {

for(var j = 0; j < arr.length - i - 1; j++) {
if(arr[j + 1] < arr[j]) {

var temp;
temp = arr[j];
arr[j] = arr[j + 1];
arr[j + 1] = temp;

103/115





}
}

}
return arr;

}

console.log(bubbleSort(arr));

4 快速排序
采用二分法， 取出中间数，数组每次和中间数比较，小的放到左边，大的放到右边

var arr = [3, 1, 4, 6, 5, 7, 2];

function quickSort(arr) {
if(arr.length == 0) {

return []; // 返回空数组
}

var cIndex = Math.floor(arr.length / 2);
var c = arr.splice(cIndex, 1);
var l = [];
var r = [];

for (var i = 0; i < arr.length; i++) {
if(arr[i] < c) {

l.push(arr[i]);
} else {

r.push(arr[i]);
}

}

return quickSort(l).concat(c, quickSort(r));
}

console.log(quickSort(arr));

5 编写⼀个方法 求⼀个字符串的字节长度
假设：⼀个英文字符占用⼀个字节，⼀个中文字符占用两个字节

104/115





function GetBytes( str) {

var len = str.length;

var bytes = len;

for(var i=0; i<len; i++){

if (str.charCodeAt(i) > 255) bytes++;

}

return bytes;

}

alert(GetBytes("你好,as"));

6 bind的用法， 以及如何实现bind的函数和需要注意的点

bind 的作用与 call 和 apply 相同， 区别是 call 和 apply 是立即调用函数， 而
bind 是返回了⼀个函数， 需要调用的时候再执行 。 ⼀个简单的 bind 函数实现如下

Function.prototype.bind = function(ctx) {

var fn = this;
return function() {

fn.apply(ctx, arguments);
};

};

7 实现⼀个函数clone

可以对 JavaScript 中的5种主要的数据类型,包括 Number 、 String 、
Object 、 Array 、 Boolean ) 进行值复

考察点1：对于基本数据类型和引用数据类型在内存中存放的是值还是指针这⼀区别是否清
楚
考察点2：是否知道如何判断⼀个变量是什么类型的

105/115





考察点3：递归算法的设计

// 方法⼀：
Object.prototype.clone = function(){

var o = this.constructor === Array ? [] : {};
for(var e in this){

o[e] = typeof this [e] === "object" ? this [e].clone() : th
}
return o;

}

//方法二：
/**

* 克隆⼀个对象
* @param Obj
* @returns
*/
function clone(Obj) {

var buf;
if (Obj instanceof Array) {

buf = []; //创建⼀个空的数组
var i = Obj.length;
while (i--) {

buf [i] = clone(Obj [i]);
}
return buf;

}else if (Obj instanceof Object){

buf = {}; //创建⼀个空对象
for (var k in Obj) { //为这个对象添加新的属性

buf [k] = clone(Obj [k]);
}
return buf;

}else{ //普通变量直接赋值
return Obj;

}
}

8 下面这个ul， 如何点击每⼀列的时候alert其index

考察闭包

106/115





<ul id=”test”>

<li>这是第⼀条</li>
<li>这是第二条</li>
<li>这是第三条</li>

</ul>

// 方法⼀：
var lis=document.getElementById( '2223').getElementsByTagName( 'li');
for(var i=0;i<3;i++)
{

lis [i].index=i;
lis [i].onclick=function(){

alert(this.index);
}

//方法二：
var lis=document.getElementById( '2223').getElementsByTagName( 'li');
for(var i=0;i<3;i++)
{

lis [i].index=i;
lis [i].onclick=(function(a){

return function() {
alert(a);

}
})(i);

}

9 定义⼀个log方法，让它可以代理console.log的方法

可行的方法⼀：

function log(msg) {
console.log(msg);

}

log("hello world!") // hello world!

如果要传入多个参数呢？显然上面的方法不能满足要求，所以更好的方法是：

107/115





function log( ) {

console.log.apply(console, arguments);
};

10 输出今天的日期

以 YYYY-MM-DD 的方式， 比如今天是2014年9月26日，则输出2014-09-26

var d = new Date();

// 获取年， getFullYear()返回4位的数字
var year = d.getFullYear();

// 获取月， 月份比较特殊， 0是1月， 11是12月
var month = d.getMonth() + 1;

// 变成两位
month = month < 10 ? '0' + month : month;

// 获取日
var day = d.getDate();
day = day < 10 ? '0' + day : day;
alert(year + '- ' + month + '- ' + day);

11 用js实现随机选取10– 100之间的10个数字，存入⼀个数组， 并排
序

var iArray = [];
funtion getRandom(istart, iend){

var iChoice = istart - iend +1;
return Math.floor(Math.random() * iChoice + istart;

}
for(var i=0; i<10; i++){

iArray.push(getRandom(10,100));
}
iArray.sort();

12 写⼀段JS程序提取URL中的各个GET参数

有这样⼀个 URL ： http://item.taobao.com/item.htm?

a=1&b=2&c=&d=xxx&e ，请写⼀段JS程序提取URL中的各个GET参数(参数名和
108/115





参数个数不确定)，将其按 key-value 形式返回到⼀个 json 结构中， 如
{a:'1', b:'2', c:'', d:'xxx', e:undefined}

function serilizeUrl( url) {

var result = {};
url = url.split("?") [1];
var map = url.split("&");
for(var i = 0, len = map.length; i < len; i++) {

result[map[i].split("=") [0]] = map[i].split("=") [1];
}
return result;

}

13 写⼀个 function ， 清除字符串前后的空格

使用自带接口 trim() ，考虑兼容性：

if ( !String.prototype.trim) {
String.prototype.trim = function() {

return this.replace(/^\s+/, "").replace(/\s+$/,"");
}

}

// test the function
var str = " \t\n test string ".trim();
alert(str == "test string"); // alerts "true"

14 实现每隔⼀秒钟输出1,2,3...数字

for(var i=0;i<10;i++){
(function(j){

setTimeout(function(){
console.log(j+1)

},j*1000)
})(i)

}

109/115





15 实现⼀个函数， 判断输入是不是回文字符串

function run( input) {

if (typeof input !== 'string') return false;
return input.split( '').reverse().join( '') === input;

}

16 、数组扁平化处理

实现⼀个 flatten 方法，使得输入⼀个数组，该数组里面的元素也可以是数
组，该方法会输出⼀个扁平化的数组

function flatten(arr){
return arr.reduce(function(prev,item){

return prev.concat(Array.isArray(item)?flatten(item):item);
}, []);

}

九、其他

1 负载均衡

多台服务器共同协作，不让其中某⼀台或几台超额工作，发挥服务器的最大作
用

http 重定向负载均衡：调度者根据策略选择服务器以302响应请求， 缺点只有第⼀次有
效果，后续操作维持在该服务器 dns负载均衡：解析域名时，访问多个 ip 服务器中的⼀
个( 可监控性较弱)
反向代理负载均衡：访问统⼀的服务器， 由服务器进行调度访问实际的某个服务器，对统
⼀的服务器要求大，性能受到 服务器群的数量

2 CDN

110/115





内容分发网络， 基本思路是尽可能避开互联网上有可能影响数据传输速度和稳
定性的瓶颈和环节，使内容传输的更快 、更稳定。

3 内存泄漏

定义：程序中⼰动态分配的堆内存由于某种原因程序未释放或无法释放引发的
各种问题。

js中可能出现的内存泄漏情况

结果：变慢， 崩溃，延迟大等，原因：

全局变量

dom 清空时， 还存在引用
ie 中使用闭包

定时器未清除
⼦元素存在引起的内存泄露

避免策略

减少不必要的全局变量， 或者生命周期较长的对象，及时对无用的数据进行垃圾回收；
注意程序逻辑， 避免“死循环”之类的 ；
避免创建过多的对象 原则：不用了的东西要及时归还。
减少层级过多的引用

4 babel原理

ES6、7 代码输⼊ -> babylon 进行解析 -> 得到 AST ( 抽象语法树) ->
plugin 用b abel-traverse 对 AST 树进行遍历转译 ->得到新的 AST 树->

用 babel-generator 通过 AST 树生成 ES5 代码

5 js自定义事件

三要素： document.createEvent() event.initEvent()

element.dispatchEvent()

111/115





// (en:自定义事件名称， fn:事件处理函数， addEvent:为DOM元素添加自定义事件， triggerEv
window.onload = function(){

var demo = document.getElementById("demo");
demo.addEvent("test",function(){console.log("handler1")});
demo.addEvent("test",function(){console.log("handler2")});
demo.onclick = function(){

this.triggerEvent("test");
}

}
Element.prototype.addEvent = function(en,fn){

this.pools = this.pools || {};
if(en in this.pools){

this.pools [en].push(fn);
}else{

this.pools [en] = [];
this.pools [en].push(fn);

}
}
Element.prototype.triggerEvent = function(en){

if(en in this.pools){
var fns = this.pools [en];
for(var i=0,il=fns.length;i<il;i++){

fns [i]();
}

}else{
return;

}
}

6 前后端路由差别
后端每次路由请求都是重新访问服务器

前端路由实际上只是 JS 根据 URL 来操作 DOM 元素，根据每个页面需要的去服务端请求
数据， 返回数据后和模板进行组合

十、综合

1 谈谈你对重构的理解

112/115





网站重构：在不改变外部⾏为的前提下， 简化结构 、添加可读性， 而在网站前端保持⼀致
的⾏为 。也就是说是在不改变UI的情况下， 对网站进⾏优化， 在扩展的同时保持⼀致的UI
对于传统的网站来说重构通常是：

表格( table )布局改为 DIV+CSS

使网站前端兼容于现代浏览器(针对于不合规范的 CSS 、如对Im6有效的)
对于移动平台的优化
针对于 SEO 进⾏优化

2 什么样的前端代码是好的

高复用低耦合， 这样⽂件⼩， 好维护， 而且好扩展。
具有可用性 、健壮性 、可靠性 、宽容性等特点
遵循设计模式的六大原则

3 对前端工程师这个职位是怎么样理解的？ 它的前景会怎么样
前端是最贴近用户的程序员， 比后端 、数据库 、产品经理 、运营 、安全都近

实现界面交互
提升用户体验
基于NodeJS， 可跨平台开发

前端是最贴近用户的程序员， 前端的能⼒就是能让产品从 90分进化到 100 分， 甚至更好，
与团队成员， UI 设计，产品经理的沟通；
做好的页面结构， 页面重构和用户体验；

4 你觉得前端工程的价值体现在哪
为简化用户使用提供技术⽀持 ( 交互部分)
为多个浏览器兼容性提供⽀持
为提高用户浏览速度 ( 浏览器性能) 提供⽀持
为跨平台或者其他基于webkit或其他渲染引擎的应用提供⽀持
为展示数据提供⽀持 ( 数据接⼝)

5 平时如何管理你的项目
先期团队必须确定好全局样式 ( globe.css )， 编码模式( utf-8 ) 等；
编写习惯必须⼀致 (例如都是采用继承式的写法， 单样式都写成⼀⾏)；
标注样式编写⼈ ，各模块都及时标注 (标注关键样式调用的地⽅)；
页面进⾏标注 (例如 页面 模块 开始和结束)；

113/115





CSS 跟 HTML 分文件夹并⾏存放，命名都得统⼀(例如 style.css )；
JS 分文件夹存放 命名以该 JS 功能为准的英文翻译。

图片采用整合的 images.png png8 格式文件使用 - 尽量整合在⼀起使用方便将来的管理

6 组件封装

目的 ：为了重用，提高开发效率和代码质量 注意：低耦合， 单⼀职责， 可复用
性， 可维护性 常用操作

分析布局
初步开发
化繁为简
组件抽象

十⼀ 、⼀些常见问题
