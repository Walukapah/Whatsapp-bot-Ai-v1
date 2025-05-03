const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers, delay } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const logger = require('pino')({ level: 'silent' }); // Silent logs for production

module.exports = function(io) {
    let socket = null;
    let qrCode = null;
    let sessionId = null;
    let retryCount = 0;
    const maxRetries = 5;

    io.on('connection', (sock) => {
        socket = sock;
        console.log('Client connected');

        if (qrCode) {
            socket.emit('qr', qrCode);
        }

        sock.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    async function connectToWhatsApp() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        const sock = makeWASocket({
            logger: logger,
            printQRInTerminal: false,
            browser: Browsers.macOS("Firefox"),
            auth: state,
            version: [2, 2413, 1],
            markOnlineOnConnect: false, // Reduce connection issues
            getMessage: async () => ({}), // Required for some versions
            connectTimeoutMs: 30000, // Increase timeout
            keepAliveIntervalMs: 15000 // Maintain connection
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCode = qr;
                qrcode.generate(qr, { small: true });
                if (socket) {
                    socket.emit('qr', qr);
                    retryCount = 0; // Reset retry count on new QR
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut);
                
                console.log(`Connection closed, reconnecting... ${shouldReconnect}`);
                
                if (shouldReconnect && retryCount < maxRetries) {
                    retryCount++;
                    await delay(5000); // Wait 5 seconds before reconnecting
                    connectToWhatsApp();
                } else if (retryCount >= maxRetries) {
                    console.log('Max retries reached. Please restart the server.');
                }
            } else if (connection === 'open') {
                console.log('WhatsApp connected successfully');
                sessionId = sock.authState.creds.me?.id;
                if (socket) {
                    socket.emit('connected', sessionId);
                }
                retryCount = 0; // Reset on successful connection
            }
        });

        return sock;
    }

    // Initial connection with error handling
    connectToWhatsApp().catch(err => {
        console.error('Initial connection error:', err);
        // Attempt reconnect after error
        setTimeout(connectToWhatsApp, 10000);
    });

    return {
        getSessionId: () => sessionId
    };
};
