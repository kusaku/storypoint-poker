const { createServer } = require('node:http')
const next = require('next')
const { Server } = require('socket.io')
const { registerRooms } = require('./server/rooms')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = Number(process.env.PORT || 3000)
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const httpServer = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        status: 'ok',
        service: 'storypoint-poker',
        timestamp: new Date().toISOString(),
        git_sha: process.env.GIT_SHA || 'unknown',
        repo_url: process.env.REPO_URL || 'unknown',
      }))
    }

    await handle(req, res)
  } catch (error) {
    console.error('Error handling request:', error)
    if (res.writableEnded) return
    if (!res.headersSent) res.statusCode = 500
    res.end('Internal server error')
  }
})

registerRooms(new Server(httpServer))

httpServer.once('error', (error) => {
  console.error('Failed to listen:', error)
  process.exit(1)
})

app.prepare().then(() => {
  httpServer.listen(port, hostname, () => {
    console.log('Server ready on http://' + hostname + ':' + port)
  })
}).catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
