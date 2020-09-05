import React from 'react'

const Button = ({setReset, reset}) => {
    return (
        <div className="button">
            <button className="button__button" onClick={() => setReset(!reset)}>New Game!</button>
        </div>
    )
}

export default Button
