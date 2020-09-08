import React, { useEffect, useState } from 'react'
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { shuffle, transpose } from './helpers.js'
import Tile from './Tile.js';

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const TileGrid = ({ width, userColor, socket, room}) => {
    const [schema, setSchema] = useState([]);
    const [score, setScore] = useState(0);
    const [scores, setScores] = useState({ [socket.id]: 0 });
    const [open, setOpen] = useState(false);
    const [reset, setReset] = useState(false);
    const [moves, setMoves] = useState([]);
    const [win, setWin] = useState(false);
    const [lost, setLost] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        socket.on('sendmove', ({ message, id }) => {
            setMoves((oldMooves) => [...oldMooves, { id, message }]);
        });
        socket.on('sendscore', ({ score: scr, id }) => {
            setScores((oldScores) => ({ ...oldScores, [id]: scr }));
        });
    }, [room, socket]);

    useEffect(() => {
        const move = moves[moves.length -1] || {};
        const { message, id } = move;
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
    }, [moves, socket.id]);

    useEffect(() => {
        const players = room.split('_vs_');
        const p1 = players.find(p => p === socket.id);
        const p2 = players.find(p => p !== socket.id);
        const p1score = scores[p1];
        const p2score = scores[p2];

        if (p1score >= 5 && p2score < 5) setWin(true);
        if (p1score < 5 && p2score >= 5) setLost(true);
        if (p1score >= 5 && p2score >= 5) {
            if (p1score > p2score) setWin(true);
            if (p1score < p2score) setLost(true);
        }
    }, [scores]);

    useEffect(() => {
        const array = [...Array(width * width)].map((x, i) => ({ value: i + 1, selected: false }));
        const randomArray = shuffle(array);
        let output = [];
        [...Array(width)].forEach((x , i) => {
            output[i] = randomArray.filter((f, j) => j >= (i * width) && j < ((i + 1) * (width)));
        });
        setSchema([...output]);
    }, [reset, width]);

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
        setScores((oldScores) => ({ ...oldScores, [socket.id]: newScore }))
        socket.emit('score', { score: newScore, id: socket.id, room });
    }, [schema])

    const onSelected = (row, column) => {
        const newSchema = [...schema];
        newSchema[row][column].selected = true;
        setSchema(newSchema);
        socket.emit('move', { message: schema[row][column].value, id: socket.id, room});
        setOpen(true);
    };

    const handleNewGame = () => {
        setReset(!reset);
        setOpen(false);
        setLost(false);
        setWin(false);
        setScore(0);
        setScores({ [socket.id]: 0 } );
    };

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
            <Dialog open={win || lost} onClose={() => {}} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{win ? 'You win!' : ''}{lost ? 'You Lost!' : ''}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleNewGame} color="primary">
                        New Game
                    </Button>
                </DialogActions>
            </Dialog>
            <div className="tileGrid">
                {[...Array(width)].map((x, i) => renderTile(i))}
            </div>
            <p className="tileGrid__score">Your score: {score}</p>
        </>
    )
}

export default TileGrid
