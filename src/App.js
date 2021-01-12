import React, { useEffect, useState } from 'react'

import { io } from 'socket.io-client'

import DEFAULT_OPTIONS from './options'

import Slider from './components/Slider'
import SidebarItem from './components/SidebarItem'
import './App.css'

function App() {
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)
    const [options, setOptions] = useState(DEFAULT_OPTIONS)
    const selectedOption = options[selectedOptionIndex]

    const [filter, setFilter] = useState(getImageStyle(DEFAULT_OPTIONS))
    const [filterSnapshot, setFilterSnapshot] = useState() // snapshot of filter

    const [socket, setSocket] = useState(null)
    const [_, setClientNum] = useState(0)
    const [roomNum, setRoomNum] = useState(0)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        console.log(_)
        console.log(setRoomNum)

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

    useEffect(() => {
        setFilter(getImageStyle(options))
    }, [options])

    useEffect(() => {
        if (connected && filter !== filterSnapshot) {
            console.log('a')

            socket.emit('filter-change', {
                filter,
                roomNum,
            })
        }
    }, [filter])

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

    function handleSliderChange({ target }) {
        setOptions((prevOptions) => {
            return prevOptions.map((option, index) => {
                if (index !== selectedOptionIndex) return option
                return {
                    ...option,
                    value: target.value,
                }
            })
        })
    }

    function getImageStyle() {
        const filters = options.map((option) => {
            return `${option.property}(${option.value}${option.unit})`
        })

        return {
            filter: filters.join(' '),
        }
    }

    return (
        <div className="container">
            <div className="main-image" style={filter} />{' '}
            <div className="sidebar">
                {' '}
                {options.map((option, index) => {
                    return (
                        <SidebarItem
                            key={index}
                            name={option.name}
                            active={index === selectedOptionIndex}
                            handleClick={() => setSelectedOptionIndex(index)}
                        />
                    )
                })}{' '}
            </div>{' '}
            <Slider
                min={selectedOption.range.min}
                max={selectedOption.range.max}
                value={selectedOption.value}
                handleChange={handleSliderChange}
            />{' '}
        </div>
    )
}

export default App
