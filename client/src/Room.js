import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const Room = ({ socket, userList, setRoom }) => {
    const [open, setOpen] = useState(true);
    const [userName, setUsername] = useState('');
    const [player, setPlayer] = useState(null);
    const [message, setMessage] = useState('');

    const [waiting, setWaiting] = useState(false);
    
    const classes = useStyles();

    const noPlayers = userList.filter(i => i.id !== socket.id ).length < 1;

    useEffect(() => {
        socket.on('play', (message) => {
            setMessage(message);
          });
        socket.on('accepted', (from) => {
            setWaiting(false);
            setRoom({ p1: socket.id, p2: from });
            socket.emit('joinRoom', from);
        });
    })
    
    const handleClose = () => {
        setOpen(false);
        socket.emit('addUser', userName);
    };

    const handlePlay = () => {
        setWaiting(true);
        socket.emit('playRequest', { from: userName, id: socket.id, to: player  })
    }

    const handlePlayCancel = () => {
        console.log('denied');
        setOpen(false);
        socket.emit('playRequestDeny', { to: message.from })
    }

    const handlePlayJoin = () => {
        console.log('joined');
        setRoom({ p1: message.id, p2: socket.id });
        socket.emit('playRequestConfirm', { to: message.id })
        socket.emit('joinRoom', { p1: message.id, p2: socket.id })
    }
    
    return (
        <div className="room">
            <Backdrop className={classes.backdrop} open={waiting}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {userName && !open && <h1>Welcome {userName}!</h1>}
            <Dialog open={open} onClose={() => {}} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Type a username</DialogTitle>
                <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Username"
                    type="text"
                    fullWidth
                    onChange={(e) => setUsername(e.target.value)}
                />
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Join
                </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={!!message.message} onClose={() => {}} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{message.message}</DialogTitle>
                <DialogActions>
                <Button onClick={handlePlayCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={handlePlayJoin} color="primary">
                    Join
                </Button>
                </DialogActions>
            </Dialog>
            <FormControl component="fieldset">
            <FormLabel component="legend">Online players</FormLabel>
                <RadioGroup aria-label="gender" name="gender1" value={player} onChange={(e) => setPlayer(e.target.value) }>
                    {noPlayers && <h6 style={{ marginTop: '1em' }}>No players online...</h6>}
                    {userList.filter(i => i.id !== socket.id ).map(u => <FormControlLabel value={u.id} control={<Radio />} key={`${u.id}`} label={u.nickname}/>)}
                </RadioGroup>
            </FormControl>
            {player && <Button color="primary" className="button__button" onClick={handlePlay}>Play</Button>}
        </div>
    )
}

export default Room
