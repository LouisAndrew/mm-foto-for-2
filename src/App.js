import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

import logo from './logo.svg'
import './App.css'

const socket = io.connect('http://localhost:4000')

function App() {
    // connect to socket io here.
    const [clientNum, setClientNum] = useState(0)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        setClientNum(Math.round(Math.random() * 10))
    }, [])

    socket.on('connect', () => {
        if (!connected) {
            setConnected(true)
        }
    })

    socket.on('message', (event) => {
        if (connected) {
            console.log(event)
        }
    })

    const emitMsg = () => {
        if (connected) {
            socket.emit('post', { msg: 'Hello, World!', clientNum, roomNum: 0 })
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
            </header>
        </div>
    )
}

export default App
