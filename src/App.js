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

    // const [filterSnapshot, setFilterSnapshot] = useState({}) // snapshot of filter

    const [socket, setSocket] = useState(null)
    const [clientNum, setClientNum] = useState(0)
    const [roomNum, setRoomNum] = useState(0)
    const [connected, setConnected] = useState(false)

    const [isFocusing, setIsFocusing] = useState(false)
    // const [isEditing, setIsEditing] = useState(false)
    const [shouldDisable, setShouldDisable] = useState(false)

    useEffect(() => {
        console.log(setRoomNum)

        const newSocket = io.connect('http://localhost:4000')
        setSocket(newSocket)
        getClientNum(newSocket, (clientNum) => {
            newSocket.on(`filter-change-${roomNum}`, (ev) => {
                if (ev !== options) {
                    setOptions(ev)
                }
            })

            newSocket.on(`on-focus-${roomNum}`, (ev) => {
                if (ev === -1) {
                    setShouldDisable(false)
                } else if (ev !== clientNum) {
                    if (!shouldDisable) {
                        setShouldDisable(true)
                    }
                }
            })
        })

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
    })

    useEffect(() => {
        if (connected) {
            getClientNum(socket)
        }
    }, [roomNum])

    useEffect(() => {
        emitIsFocusing()
    }, [isFocusing])

    /**
     * Get client number/id from the socket io
     * @param {Object} socketObj: Socket IO Object
     */
    const getClientNum = (socketObj, onSuccess) => {
        socketObj.emit('connect-room', {
            roomNum,
        })

        socketObj.on('receive-id', (event) => {
            setClientNum(event.clientNum)
            socketObj.off('receive-id')
            onSuccess(event.clientNum)
        })
    }

    const emitChanges = () => {
        if (connected) {
            socket.emit('filter-change', {
                options,
                roomNum,
            })
        }
    }

    const emitIsFocusing = () => {
        if (connected) {
            const status = isFocusing ? clientNum : -1

            socket.emit('on-focus', {
                status,
                roomNum,
            })

            if (!isFocusing) {
                emitChanges()
            }
        }
    }

    // /**
    //  * Get the current counter of a room
    //  * @param {Object} socketObj
    //  */
    // const getRoomCounter = (socketObj) => {
    //     socketObj.emit('get-content', {
    //         roomNum,
    //     })

    //     socketObj.on('receive-content', (event) => {
    //         setCounter(event.counter)
    //         socketObj.off('receive-content')
    //     })
    // }

    // const changeRoom = (newRoomNum) => {
    //     if (!socket || !connected) return
    //     socket.off(`new-post-${roomNum}`) // unsubscribe from the last room Number
    //     setRoomNum(newRoomNum) // subscribing to the new room number
    // }

    // const emitMsg = () => {
    //     if (connected) {
    //         socket.emit('post', {
    //             msg: 'Hello, World!',
    //             clientNum,
    //             roomNum: roomNum,
    //         })
    //     }
    // }

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
            {!shouldDisable && (
                <div className="main-image" style={getImageStyle(options)} />
            )}
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
            <button onClick={emitChanges}>Emit changes</button>
            <Slider
                min={selectedOption.range.min}
                max={selectedOption.range.max}
                value={selectedOption.value}
                handleChange={handleSliderChange}
                handleMouseDown={() => {
                    setIsFocusing(true)
                }}
                handleMouseUp={() => {
                    setIsFocusing(false)
                }}
            />{' '}
        </div>
    )
}

export default App
