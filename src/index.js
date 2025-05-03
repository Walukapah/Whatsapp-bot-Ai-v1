require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const whatsapp = require('./whatsapp')(io);

// Serve static files
app.use(express.static(join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
