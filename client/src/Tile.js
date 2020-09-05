import React, { useState, useEffect } from 'react'

const Tile = ({value, reset, row, column, onSelected, selected}) => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        setActive(false);
    }, [reset]);

    useEffect(() => {
        setActive(selected);
    }, [selected]);
    return (
        <div className={`tile ${active && 'selected'}`}>
            <div
                className="tile__value"
                role="button"
                onClick={(e) => {
                    if (active) return;
                    setActive(!active);
                    onSelected(row, column);
                }}
            >
                {value}
            </div>
        </div>
    )
}

export default Tile
