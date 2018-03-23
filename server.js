var http = require('http');
var argv = require('yargs').argv;
const url = require('url');

// 默认监听端口
var port = 8900;

// 可设置不同端口
if (argv.p) {
  port = +argv.p;
}

http.createServer(function(request, response) {
  // response.end('Hello World\n');

  var urlObj = url.parse(request.url, true);

  // console.log(urlObj);
  var pathname = urlObj.pathname;

  if (pathname.indexOf('/api') === 0) {
    var realApi = pathname.substr(4);
    switch (realApi) {
      case '/get1':
        response.end('get1 success');
        break;

      case '/get2':
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.end('get2 success');
        break;

      case '/get3':
        // response.end('get3 success');
        response.end(urlObj.query.callback + '(' + '"get3 success"' + ')');
        break;

      default:
        console.log(urlObj);
        response.end(JSON.stringify(urlObj));

    }
  }
}).listen(port)

console.log('Server running at http://127.0.0.1:' + port);  