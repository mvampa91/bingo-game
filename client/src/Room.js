import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';


const Room = ({ socket, userList, setRoom }) => {
    const [open, setOpen] = useState(true);
    const [userName, setUsername] = useState('');
    const [player, setPlayer] = useState(null);
    
    const handleClose = () => {
        setOpen(false);
        socket.emit('addUser', { user: userName, id: socket.id });
    };

    const handlePlay = () => {
        setRoom([socket, player])
    }
    
    return (
        <div className="room">
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
            <FormControl component="fieldset">
            <FormLabel component="legend">Online players</FormLabel>
                <RadioGroup aria-label="gender" name="gender1" value={player} onChange={(e) => setPlayer(e.target.value) }>
                    {userList.filter(i => i.id !== socket.id ).map(u => <FormControlLabel value={u.id} control={<Radio />} key={`${u.id}`} label={u.user}/>)}
                </RadioGroup>
            </FormControl>
            {player && <Button color="primary" className="button__button" onClick={handlePlay}>Play</Button>}
        </div>
    )
}

export default Room
