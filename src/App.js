import React, { useEffect, useState } from 'react'

import { io } from 'socket.io-client'

import DEFAULT_OPTIONS from './options'

import Slider from './components/Slider'
import SidebarItem from './components/SidebarItem'
import './App.css'
import Login from './components/Login'

function App() {
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)
    const [options, setOptions] = useState(DEFAULT_OPTIONS)
    const selectedOption = options[selectedOptionIndex]

    const [socket, setSocket] = useState(null)
    const [clientNum, setClientNum] = useState(0)
    const [roomNum, setRoomNum] = useState(-1)
    const [connected, setConnected] = useState(false)

    const [isFocusing, setIsFocusing] = useState(false)
    const [shouldDisable, setShouldDisable] = useState(false)

    const [imgUrl, setImgUrl] = useState('')

    useEffect(() => {
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
    })

    useEffect(() => {
        if (connected && roomNum !== -1) {
            getClientNum(socket, (clientNum) => {
                socket.on(`filter-change-${roomNum}`, (ev) => {
                    if (ev !== options) {
                        setOptions(ev)
                    }
                })

                socket.on(`on-focus-${roomNum}`, (ev) => {
                    if (ev === -1) {
                        setShouldDisable(false)
                    } else if (ev !== clientNum) {
                        if (!shouldDisable) {
                            setShouldDisable(true)
                        }
                    }
                })

                socket.on(`img-url-${roomNum}`, (ev) => {
                    console.log(ev)
                    if (!imgUrl) {
                        setImgUrl(ev)
                    }
                })
            })
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

        socketObj.on('receive-data', (event) => {
            setImgUrl(event.imgUrl)
            if (event.options.length > 0) {
                setOptions(event.options)
            }
            socketObj.off('receive-data')
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

    const submitImgUrl = (e) => {
        e.preventDefault()

        const newImgUrl = document.getElementById('img-url').value

        setImgUrl(newImgUrl)
        socket.emit('img-url', {
            roomNum,
            newImgUrl,
        })
    }

    return (
        <div className="container">
            {roomNum !== -1 ? (
                <>
                    { imgUrl ? (
                            <img
                                src={imgUrl}
                                className="main-image"
                                style={getImageStyle(options)}
                            />
                        ) : (
                            <div className="form-wrapper">
                            <form className="login-wrapper" onSubmit={submitImgUrl}>
                                <label htmlFor="img-url">Please add an Image URL:</label>
                                <input id="img-url" type="text" />
                                <button className="login-button" type="submit">Submit URL</button>
                            </form>
                            </div>
                        )
                    }
                    <div className="sidebar">
                        {' '}
                        {options.map((option, index) => {
                            return (
                                <SidebarItem
                                    key={index}
                                    name={option.name}
                                    active={index === selectedOptionIndex}
                                    handleClick={() =>
                                        setSelectedOptionIndex(index)
                                    }
                                />
                            )
                        })}{' '}
                        <div className="button-wrapper">
                         <button className="button"
                        onClick={() => {
                            setRoomNum((r) => r + 1)
                        }}
                    >
                        Next Room
                    </button>
                    { roomNum !== 1 && 
                    <button className="button"
                        onClick={() => {
                            setRoomNum((r) => r - 1)
                        }}
                    >
                        Previous Room
                    </button>
                    }
                    </div>
                    </div>{' '}
                    <Slider shouldDisable = {shouldDisable}
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
                </>
            ) : (
                <Login
                    goToRoom={(num) => {
                        setRoomNum(num)
                    }}
                />
            )}
        </div>
    )
}

export default App
