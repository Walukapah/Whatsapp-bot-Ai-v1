require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Ensure auth directory exists
const fs = require('fs');
const path = require('path');
const authDir = path.join(__dirname, '../auth_info_baileys');
if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir);
}

const whatsapp = require('./whatsapp')(io);

app.use(express.static(join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
