const jsonServer = require('json-server')
const mock = require('./mock.js')
const routes = require('./routes.js')
const port = 3000;

const server = jsonServer.create()
const router = jsonServer.router(mock)
const middlewares = jsonServer.defaults()
const rewriter = jsonServer.rewriter(routes)

server.use(middlewares)
// 将 POST 请求转为 GET
server.use((request, res, next) => {
  request.method = 'GET';
  next();
})

server.use(rewriter) // 注意：rewriter 的设置一定要在 router 设置之前
server.use(router)

server.listen(port, () => {
  console.log('mock-server已经启动，地址为http://127.0.0.1:' + port)
})
