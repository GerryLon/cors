var http = require('http');
var argv = require('yargs').argv;

// 默认监听端口
var port = 8900;

// 可设置不同端口
if (argv.p) {
  port = +argv.p;
}

http.createServer(function(request, response) {
  // response.end('Hello World\n');
  var url = request.url;

  if (url.indexOf('/api') === 0) {
    var realApi = url.substr(4);

    console.log(realApi);
    switch (realApi) {
      case '/get1':
        response.end('get1 success');
        break;
        
      case '/get2':
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.end('get2 success');
        break;
    }
  }
}).listen(port)

console.log('Server running at http://127.0.0.1:' + port);  