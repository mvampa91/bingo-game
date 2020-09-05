import React, { useEffect, useState } from 'react'
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import { shuffle, transpose } from './helpers.js'
import Tile from './Tile.js';

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const TileGrid = ({ reset, width, userColor, socket}) => {
    const [schema, setSchema] = useState([]);
    const [score, setScore] = useState(0);
    const [open, setOpen] = useState(false);
    const classes = useStyles();


    useEffect(() => {
        socket.on('message', ({score, message, id}) => {
            if (id !== socket.id) {
                const newSchema = [...schema];
                newSchema.forEach((x, i) => x.forEach((y, j) => {
                    if (newSchema[i][j].value === message) {
                        newSchema[i][j].selected = true;
                    }
                }));
                setSchema(newSchema);
                setOpen(false);
            }
        })
    });

    useEffect(() => {
        const array = [...Array(width * width)].map((x, i) => ({ value: i + 1, selected: false }));
        const randomArray = shuffle(array);
        let output = [];
        [...Array(width)].forEach((x , i) => {
            output[i] = randomArray.filter((f, j) => j >= (i * width) && j < ((i + 1) * (width)));
        });
        setSchema([...output]);
    }, [reset, width]);

    const onSelected = (row, column) => {
        const newSchema = [...schema];
        newSchema[row][column].selected = true;
        setSchema(newSchema);
        socket.emit('message', {score, message: newSchema[row][column].value, id: socket.id});
        setOpen(true);
    };

    useEffect(() => {
        let newScore = 0;
        const columns = transpose(schema);
        const diagona1 = schema.map((x, i) => x[i]);
        const diagona2 = schema.map((x, i, all) => x[all.length - 1 - i]);

        if(diagona1.every(x => x.selected)) {
            newScore += 1;
        }

        if(diagona2.every(x => x.selected)) {
            newScore += 1;
        }

        schema.forEach(f => {
            if (f.every(x => x.selected)) {
                newScore += 1;
            }
        })
        columns.forEach(f => {
            if (f.every(x => x.selected)) {
                newScore += 1;
            }
        })
        setScore(newScore);
    }, [schema])

    const renderTile = (row) => {
    return <div key={`${row}`} className="tileGrid__row">{(schema[row] || []).map((j, i) =>
        <Tile
            key={`${i}`}
            reset={reset}
            color={userColor}
            value={j.value}
            selected={j.selected}
            row={row}
            column={i}
            onSelected={onSelected}
            />)}
        </div>;
    }

    return (
        <>
            <Backdrop className={classes.backdrop} open={open}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {score >= 5 && <p className="tileGrid__win">You WIN!</p>}
            <div className="tileGrid">
                {[...Array(width)].map((x, i) => renderTile(i))}
            </div>
            <p className="tileGrid__score">Your score: {score}</p>
        </>
    )
}

export default TileGrid
