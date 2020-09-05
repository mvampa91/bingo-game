const express = require('express');
const http = require('http');
const path = require('path');
const io = require('socket.io');

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static(path.resolve(__dirname, './client/build')));

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

const server = http.createServer(app);
const webrtc = io(server);

webrtc.set('origins', '*:*');
webrtc.on('connection', socket => {
    socket.on('message', ({score, message, id}) => {
      webrtc.emit('message', {score, message, id})
    })
})

// Priority serve any static files.

server.listen(PORT, function () {
  console.error(`Node ${isDev ? 'dev server' : 'cluster worker '+process.pid}: listening on port ${PORT}`);
});
