const { default: makeWASocket, BufferJSON, DisconnectReason, useMultiFileAuthState, Browsers } = require('@adiwajshing/baileys');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const logger = require('pino')(); // Add this line for proper logging

module.exports = function(io) {
    let socket = null;
    let qrCode = null;
    let sessionId = null;

    io.on('connection', (sock) => {
        socket = sock;
        console.log('Client connected');

        if (qrCode) {
            socket.emit('qr', qrCode);
        }

        if (sessionId) {
            socket.emit('session', sessionId);
        }

        sock.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    async function connectToWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        const sock = makeWASocket({
            logger: logger, // Use the proper logger
            printQRInTerminal: false,
            browser: Browsers.macOS("Firefox"),
            auth: state,
            syncFullHistory: true,
            version: [2, 2413, 1] // Specify WhatsApp version
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCode = qr;
                qrcode.generate(qr, { small: true });
                if (socket) {
                    socket.emit('qr', qr);
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
                console.log('Connection closed, reconnecting...', shouldReconnect);
                if (shouldReconnect) {
                    connectToWhatsApp();
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connection opened');
                sessionId = sock.authState.creds.me?.id;
                if (socket) {
                    socket.emit('connected', sessionId);
                }
            }
        });

        sock.ev.on('messages.upsert', ({ messages }) => {
            console.log('Received messages:', messages);
        });

        return sock;
    }

    connectToWhatsApp().catch(err => console.log('Connection error:', err));

    return {
        getSessionId: () => sessionId
    };
};
