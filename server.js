var http = require('http');
var argv = require('yargs').argv;

// 默认监听端口
var port = 8900;

// 可设置不同端口
if (argv.p) {
  port = argv.p;
}

http.createServer(function(request, response) {
  // response.end('Hello World\n');

}).listen(port)

console.log('Server running at http://127.0.0.1:' + port);  