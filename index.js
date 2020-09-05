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

io.set('origins', '*:*');
let users = [];
io.on('connection', socket => {
    socket.on('message', ({score, message, id}) => {
      io.emit('message', {score, message, id})
    })

    socket.on('addUser', ({ user, id }) => {
      users.push({ id, user }); 
      socket.emit('users', users);
    })

    socket.on('disconnect', () => {
      users.splice(users.indexOf(socket), 1);
  });
})

// Priority serve any static files.

server.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
});
