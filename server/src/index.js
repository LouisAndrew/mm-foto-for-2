const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        // handling CORS -> https://socket.io/docs/v3/handling-cors/
        origin: 'http://localhost:3000', // Request from this address won't be blocked.
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    socket.on('post', ({ roomNum, ...rest }) => {
        io.emit(`new-post-${roomNum}`, rest)
    })
})

const PORT = 4000

http.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})
