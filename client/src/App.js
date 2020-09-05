import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'
import './App.css';
import TileGrid from './TileGrid';
import Button from './Button';
import Room from './Room';

let socket = io.connect('http://localhost:5000');
if(process.env.NODE_ENV === 'production') {
    socket = io.connect('https://bingo-game-react.herokuapp.com/') 
}

function App() {
  const [reset, setReset] = useState(false);
  const [room, setRoom] = useState(null);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    socket.on('users', (users) => {
      setUserList(users)
    })
  }, []);

  return (
    // BEM
    <div className="app">
      {/* <ColorPicker setColor={setColor} /> */}
      {room ?
        <TileGrid width={5} reset={reset} socket={socket}/> :
        <Room socket={socket} userList={userList} setRoom={setRoom} />
    }
    </div>
  );
}

export default App;
