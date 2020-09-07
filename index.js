const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static(path.resolve(__dirname, './client/build')));

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

const server = http.createServer(app);
const io = socketIo(server);

let users = [];
io.on('connection', socket => {
    socket.on('message', ({score, message, id}) => {
      io.emit('message', {score, message, id})
    })

    socket.on('addUser', (user) => {
      socket.join('game');
      socket.nickname = user;
      console.log(socket.nickname, `(${socket.id})`, 'has connected to \'game\'!');
      users.push({ id: socket.id, nickname: socket.nickname });
      io.in('game').emit('users', users);
    })

    socket.on('playRequest', ({ from, to, id }) => {
      console.log('play request sent from', from, 'to', to);
      io.to(to).emit('play', { message: `Player '${from}' wants to play with you. Join game?`, from, id });
    })

    socket.on('playRequestDeny', () => {

    });

    socket.on('playRequestConfirm', ({ to }) => {
      console.log('play request accepted to', to);
      io.to(to).emit('accepted', socket.id);
      socket.join(`${to}_vs_${socket.id}`)
    });

    socket.on('joinRoom', (from) => {
      socket.join(`${socket.id}_vs_${from}`);
    });

    socket.on('disconnect', () => {
      if (socket.nickname) {
        users = users.filter(u => u.id !== socket.id);
        console.log(socket.nickname, `(${socket.id})`, 'has disconnected from \'game\'!', 'Users left:', users);
        io.in('game').emit('users', users);
      }
  });
})

// Priority serve any static files.

server.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
});
