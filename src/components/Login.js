import React from 'react'

export default function Login({ goToRoom }) {
    return (
        <div className="screen">
            <div className="login-wrapper">
            <h1> Welcome to FOTO FOR 2 </h1>
            <h3> Click the button down below to start editing.</h3> 
            <button className="login-button"
                onClick={() => {
                    goToRoom(1)
                }}
            >
                START EDITING
            </button>
        </div>
        </div>
    )
}
