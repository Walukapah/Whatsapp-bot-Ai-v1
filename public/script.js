const socket = io();
const loginSection = document.getElementById('login-section');
const qrSection = document.getElementById('qr-section');
const sessionSection = document.getElementById('session-section');
const loginBtn = document.getElementById('login-btn');
const phoneNumberInput = document.getElementById('phone-number');
const qrCodeDiv = document.getElementById('qr-code');
const sessionIdDiv = document.getElementById('session-id');
const copyBtn = document.getElementById('copy-btn');

loginBtn.addEventListener('click', () => {
    const phoneNumber = phoneNumberInput.value.trim();
    if (phoneNumber) {
        loginSection.classList.add('hidden');
        qrSection.classList.remove('hidden');
        socket.emit('init', phoneNumber);
    }
});

socket.on('qr', (qr) => {
    qrCodeDiv.innerHTML = '';
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr)}`;
    qrCodeDiv.appendChild(qrImg);
});

socket.on('connected', (sessionId) => {
    qrSection.classList.add('hidden');
    sessionSection.classList.remove('hidden');
    sessionIdDiv.textContent = sessionId;
});

socket.on('session', (sessionId) => {
    sessionSection.classList.remove('hidden');
    sessionIdDiv.textContent = sessionId;
});

copyBtn.addEventListener('click', () => {
    const range = document.createRange();
    range.selectNode(sessionIdDiv);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
});
