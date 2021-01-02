import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

import logo from './logo.svg'
import './App.css'

function App() {
    // connect to socket io here.
    const [socket, setSocket] = useState(null)
    const [clientNum, setClientNum] = useState(0)
    const [roomNum, setRoomNum] = useState(0)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        setClientNum(Math.round(Math.random() * 10))
        const newSocket = io.connect('http://localhost:4000')
        setSocket(newSocket)

        return () => {
            newSocket.close()
        }
    }, [])

    useEffect(() => {
        if (!socket) return

        if (!connected) {
            socket.on('connect', () => {
                setConnected(true)
            })
        }

        // listen to new post event (with room number)
        socket.on(`new-post-${roomNum}`, (event) => {
            if (connected) {
                console.log(event)
            }
        })
    })

    const changeRoom = (newRoomNum) => {
        if (!socket || !connected) return
        socket.off(`new-post-${roomNum}`) // unsubscribe from the last room Number
        setRoomNum(newRoomNum) // subscribing to the new room number
    }

    const emitMsg = () => {
        if (connected) {
            socket.emit('post', {
                msg: 'Hello, World!',
                clientNum,
                roomNum: roomNum,
            })
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Room number: {roomNum}</h1>
                <img src={logo} className="App-logo" alt="logo" />
                <p>See console to view changes.</p>
                <button style={{ marginTop: 8 }} onClick={emitMsg}>
                    Emit msg.
                </button>
                <button
                    style={{ marginTop: 16 }}
                    onClick={() => {
                        changeRoom(roomNum + 1)
                    }}
                >
                    Go to room 1.
                </button>
            </header>
        </div>
    )
}

export default App
