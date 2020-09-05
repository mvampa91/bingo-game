import React, { useState, useEffect } from 'react'

const Tile = ({value, reset, row, column, onSelected}) => {
    const [selected, setSelected] = useState(false);
    useEffect(() => {
        setSelected(false);
    }, [reset]);
    return (
        <div className={`tile ${selected && 'selected'}`}>
            <div
                className="tile__value"
                role="button"
                onClick={(e) => {
                    if (selected) return;
                    setSelected(!selected);
                    onSelected(row, column);
                }}
            >
                {value}
            </div>
        </div>
    )
}

export default Tile
