
# ajax跨域解决方案总结
前端开发中经常会碰到各种跨域问题，在此做一总结。   
实验代码: https://github.com/GerryLon/cors

---

## 什么是跨域?
先来讲讲什么是跨域？
* XMLHttpRequest同源策略：禁止使用XHR对象向不同源的服务器地址发起HTTP请求。
* DOM同源策略：禁止对不同源页面DOM进行操作。这里主要场景是iframe跨域的情况，不同域名的iframe是限制互相访问的。

只要**协议**，**主机名**，**端口**任意一个不同都认为是不同源的，此时相互调用就会造成跨域。

## 为什么有跨域限制?
那么为什么设计之初不允许跨域操作呢？ 其实也很简单，这是因为安全问题。
暂时不作详解, 后续补充.

## 为什么我们要进行跨域操作?
既然跨域有问题， 我们都在一个域名下调用不就行了吗？   
话说我觉得这想法真是一点都没错。 可是啊, 可是，美好的东西好像都要有个可是。
实际中我们经常有这样的需要，A域名下要调用B域名下的接口，然而有可能B域名还不是我们自己公司的，不能随便改。   
就算自己公司有多个域名，也经常存在着跨域的API调用，可能企业是为了有的服务单独部署， 功能单一强大稳定一些。

总之，我们就是有跨域操作的需求！

下面对于最常见的跨域现象(ajax调用)做实验, 解析并给出相应的解决方法.

## 实验准备

* 现代浏览器一枚, 方便查看错误信息
* 本地配置一些host(将如下内容添加到hosts文件最后):   
  127.0.0.1 a.test.com   
  127.0.0.1 b.test.com
* 安装nodejs, npm, http-server(npm包, 全局安装最方便, 本地启动一个http服务用)等

* git clone https://github.com/GerryLon/cors.git
  或者直接下载[zip包](https://github.com/GerryLon/cors/archive/master.zip)

* 进入到cors工程主目录, 执行:
  ```
  npm install
  node server.js
  http-server
  ```
* 然后在浏览器中打开 http://a.test.com:8080

## 实验现象
cors仓库下的img目录有一些测试时的截图
自己也可以打开页面和控制台观察

## 实验分析
接口所在主机为a.test.com, 以下简称为A, 请求的域名为b.test.com, 以下简称为B, 且端口不一致.
已经构成跨域.
公用代码:
```
var baseUrl = 'http://b.test.com:8900/api'; // 接口所在服务器
```

 - 用例1: A直接调B的接口
  ```js
  // Client
  $.ajax({
    url: baseUrl + '/get1'
  });

  // Server
  response.end('get1 success');
  ```
  > Failed to load http://b.test.com:8900/api/get1: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://a.test.com:8080' is therefore not allowed access.

  这是最常见的情况, 相信做web开发的都遇到过.
  既然说`Access-Control-Allow-Origin`没有, 那我们加上如何?

  - 用例2: 同用例1, 不过服务端代码有改:
  ```js
  // Client
  $.ajax({
    url: baseUrl + '/get1'
  });

  // Server
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.end('get2 success');
  ```
  加上这个头就好了, 截图如下:
  ![img](http://7xl7ab.com1.z0.glb.clouddn.com/cors/2.png)
  
  不过有时被调用方不是由我们控制的, 比如我们调用别人家的接口, 这种改服务端的方法就不行了, 那么我们就改客户端代码, 也就是常说的JSONP, 见下面的用例3.

  - 用例3: JSONP方式跨域
  JSONP的原理就是利用`<script>`不受跨域限制的特点, 动态加载一个js文件.
  其本质是一个普通的GET请求, 所以它只能处理GET的情况, POST不行.
  ```js
  // Client
  $.ajax({
    url: baseUrl + '/get3',
    dataType: 'jsonp'
  })

  // Server
  response.end(urlObj.query.callback + '(' + '"get3 success"' + ')');
  ```
  其中`urlObj.query.callback`就是获取GET请求的callback参数.
  结果如图:
  ![img](http://7xl7ab.com1.z0.glb.clouddn.com/cors/3.png)
  
  返回结果是类似`jQuery18207395608856456597_1525337994247("get3 success")`这样的字符串.

  有人就说, 这种方法其实也要改服务端代码. 是这样的.
  不过现在大多数网站, 都提供JSONP格式的选项, JSONP用得还是挺多的.
  如[豆瓣的Api](https://developers.douban.com/wiki/?title=api_v2)
  ![](http://7xl7ab.com1.z0.glb.clouddn.com/cors/4.png)

  - 用例4: 使用代理接口解决跨域问题
  例子2和3都能解决问题, 但是都不太完美.
  例2直接设置`Access-Control-Allow-Origin`为`*`, 这样其实不太好.
  一般我们只想给自己域名下的api调用添加这个头: 比如常见的: a.test.com, b.test.com.
  我们希望的是在test.com下都添加上这个头, 其他不添加.
  但事实上`Access-Control-Allow-Origin`的值要么是`*`(有限制, 下面会说到), 要么是具体的`协议+域名`,
  如: `https://a.test.com`, 参见: [Access-Control-Allow-Origin wildcard subdomains, ports and protocols](https://stackoverflow.com/questions/14003332/access-control-allow-origin-wildcard-subdomains-ports-and-protocols)

  HTTP请求头中有个Origin, 代表请求来自于哪个站点, 可以根据这个判断, 以下引用了[MDN的解释:](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Origin)

  > 请求首部字段 Origin 指示了请求来自于哪个站点。该字段仅指示服务器名称，并不包含任何路径信息。该首部用于 CORS 请求或者 POST 请求。除了不包含路径信息，该字段与 Referer 首部字段相似。

  实际代码:
  ```js
  // Client
  $.ajax({
    url: baseUrl + '/get4'
  });

  // Server
  // 获取Origin请求头, 这里应该大写的O, 
  // 不过node下请求头全是小写的, 应该是作了封装
  let origin = req.headers['origin'];
  
  // 需要的才加
  // 这里用正则判断是test.com或者xx.test.com的形式都允许跨域访问
  if (origin && /^https?:\/\/(?:\w+\.)?test\.com.*$/.test(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.end('get4 success');  
  ```
  这种动态设置`Access-Control-Allow-Origin`的方法在一个公司还是很实用的.   
  不过还是有问题, 要是接口在别人家的服务器上呢(如a.test.com请求a.example.com的接口, example.com是别人家的)?   
  就是说不能改服务端代码, 这又怎么办?
  其实还可以这样, 在本域内做一个代理接口, 原理如下:
  从a.test.com请求a.example.com的接口, 构成跨域.
  这因为是在浏览器中的ajax进行的, 所以会有这个问题, 如果直接在浏览器地址栏输入或者curl什么的, 就不会有这个问题, 那么我们就自己在服务端写一个代理的接口, 然后请求自己的接口, 转发请求, 回送响应. 这个方法是万能的, 不过就是多了一层, 麻烦一些. 而且还要区分GET, POST等处理.

  实际效果:
  ![4]("http://7xl7ab.com1.z0.glb.clouddn.com/cors/douban.gif")

  ```js
  // Client
  $.ajax({
    type: 'get',
    url: baseUrl + '/proxy',
    dataType: 'json',
    data: {
      q: '伟大的数学公式',
      start: 0,
      count: 1,
      // https://developers.douban.com/wiki/?title=book_v2#get_book_search
      __target: 'https://api.douban.com/v2/book/search'
    }
  });

  // Server
  let query = urlObj.query,
    method = req.method.toUpperCase(),

    // 区分出来目标地址
    target = query.__target;

  delete query.__target;

  // 如果不加这个, 也会报跨域错误
  // 这个其实可以作为全局代码, 此仅为示例
  if (origin && /^https?:\/\/(?:\w+\.)?test\.com.*$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // request库
  request({
    url: target,
    qs: query
  }).pipe(res);
  ```
  其中使用了[request](https://www.npmjs.com/package/request)库, 具体不展开说明, 感觉相当强大方便.
  这种解决方案可以说是完美了, 原理也很简单明了.
  沿用此思路, 利用nginx也是可以了, 不过没有代码方便一些.

## 结论
  ajax跨域问题一般通过JSONP或者服务端添加CORS头就能解决绝大多数的情况, 第三方接口跨域调用可以采用代理接口的方法.


欢迎补充指正!


