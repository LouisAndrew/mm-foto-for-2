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
        if (socket) {
            if (!connected) {
                socket.on('connect', () => {
                    setConnected(true)
                })
            }

            socket.on(`new-post-${roomNum}`, (event) => {
                if (connected) {
                    console.log(event)
                }
            })
        }
    })

    const emitMsg = () => {
        if (connected) {
            console.log(roomNum)
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
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
                <button style={{ marginTop: 16 }} onClick={emitMsg}>
                    Emit msg.
                </button>
                <button
                    style={{ marginTop: 16 }}
                    onClick={() => {
                        setRoomNum(1)
                    }}
                >
                    Change room.
                </button>
            </header>
        </div>
    )
}

export default App
