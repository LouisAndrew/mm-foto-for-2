import React from 'react'

export default function Slider({
    min,
    max,
    value,
    shouldDisable,
    handleChange,
    handleMouseDown,
    handleMouseUp,
}) {
    return (
        <div className="slider-container">
            {!shouldDisable ? (
                <input
                    type="range"
                    className="slider"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleChange}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                />
            ) : (
                <h2 style={{ textAlign: 'center' }}>
                    Someone is editing the image
                </h2>
            )}
        </div>
    )
}
