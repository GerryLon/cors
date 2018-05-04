var http = require('http');
var argv = require('yargs').argv;
const request = require('request');
const url = require('url');


// 默认监听端口
var port = 8900;

// 可设置不同端口
if (argv.p) {
  port = +argv.p;
}

http.createServer(function(req, res) {
  // res.end('Hello World\n');

  var urlObj = url.parse(req.url, true);

  // console.log(urlObj);
  var pathname = urlObj.pathname;

  if (pathname.indexOf('/api') === 0) {

    // 实际调用的api名称
    var realApi = pathname.substr(4);

    // 获取Origin请求头, 这里应该大写的O, 
    // 不过node下请求头全是小写的, 应该是作了封装
    let origin = req.headers['origin'];

    switch (realApi) {
      case '/get1':
        res.end('get1 success');
        break;

      case '/get2':
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end('get2 success');
        break;

      case '/get3':
        // res.end('get3 success');
        res.end(urlObj.query.callback + '(' + '"get3 success"' + ')');
        break;

      // 动态添加Access-Control-Allow-Origin头
      case '/get4':

        // 需要的才加
        // 这里用正则判断是test.com或者xx.test.com的形式都允许跨域访问
        if (origin && /^https?:\/\/(?:\w+\.)?test\.com.*$/.test(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.end('get4 success');
        break;

      // 带cookie
      case '/get5':

        // 需要的才加
        // 这里用正则判断是test.com或者xx.test.com的形式都允许跨域访问
        if (origin && /^https?:\/\/(?:\w+\.)?test\.com.*$/.test(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        // let cookies = req.headers['cookie'];
        // console.log(cookies);
        res.end('get5 success');
      break;

      // 代理接口
      case '/proxy':
        let query = urlObj.query,
          method = req.method.toUpperCase(),

          // 区分出来目标地址
          target = query.__target;

        delete query.__target;

        if (origin && /^https?:\/\/(?:\w+\.)?test\.com.*$/.test(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }

        request({
          url: target,
          qs: query
        }).pipe(res);
        break;

      default:
        console.log('default: ', urlObj);
        res.end(JSON.stringify(urlObj));
    }
  }
}).listen(port)

console.log('Server running at http://127.0.0.1:' + port);  