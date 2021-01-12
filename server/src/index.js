const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        // handling CORS -> https://socket.io/docs/v3/handling-cors/
        origin: 'http://localhost:3000', // Request from this address won't be blocked.
        methods: ['GET', 'POST'],
    },
})

// we can change this to an object with 10 rooms with each of its passwords and clients?
let room = {}

const updateCounter = (roomNum) => {
    room[roomNum].counter++
}

io.on('connection', (socket) => {
    socket.on('connect-room', ({ roomNum }) => {
        if (!room[roomNum]) {
            // create room if the room doesn't exist
            room[roomNum] = {
                clients: 1,
                counter: 0,
            }
        } else {
            room[roomNum].clients++ // Add more client if the room does exists.
        }

        io.emit('receive-id', { clientNum: room[roomNum].clients })
    })

    socket.on('get-content', ({ roomNum }) => {
        if (!room[roomNum]) {
            return
        }

        io.emit('receive-content', { counter: room[roomNum].counter })
    })

    socket.on('post', ({ roomNum, ...rest }) => {
        if (!room[roomNum]) {
            // do nothing if room does not exist
            return
        }

        updateCounter(roomNum)

        io.emit(`new-post-${roomNum}`, { rest, counter: room[roomNum].counter })
    })
})

const PORT = 4000

http.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})
