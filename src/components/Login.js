import React from 'react'

export default function Login({ goToRoom }) {
    return (
        <div>
            Login page
            <button
                onClick={() => {
                    goToRoom(1)
                }}
            >
                Go to room1
            </button>
        </div>
    )
}
