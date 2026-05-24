let items = [];
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const inputField = document.getElementById('item-input');

// Listener untuk tombol Enter
if (inputField) {
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addItem();
    });
}

function addItem() {
    const val = inputField.value.trim();
    if (val && items.length < 20) {
        items.push(val);
        inputField.value = '';
        renderList();
        checkReady();
    }
}

function removeItem(index) {
    items.splice(index, 1);
    renderList();
    checkReady();
}

function renderList() {
    const list = document.getElementById('item-list');
    if (list) {
        list.innerHTML = items.map((item, i) => `
            <li>
                <span>${item}</span>
                <span class="remove-btn" onclick="removeItem(${i})">×</span>
            </li>
        `).join('');
    }
}

function checkReady() {
    const readyBtn = document.getElementById('ready-btn');
    const isReady = items.length >= 2;

    if (readyBtn) {
        readyBtn.disabled = !isReady;
        if (isReady) {
            readyBtn.classList.add('active');
            readyBtn.innerText = "Mulai Bermain! 🚀";
        } else {
            readyBtn.classList.remove('active');
            readyBtn.innerText = `Tambah ${2 - items.length} Pilihan Lagi...`;
        }
    }
}

function goToWheel() {
    const setup = document.getElementById('setup-area');
    const game = document.getElementById('game-session');
    
    if (setup && game) {
        setup.style.display = 'none';
        game.style.display = 'block';
        drawWheel();
    }
}

function drawWheel() {
    if (items.length === 0) return;
    const arc = (2 * Math.PI) / items.length;
    ctx.clearRect(0, 0, 300, 300);
    
    items.forEach((item, i) => {
        const angle = i * arc - Math.PI / 2; 
        
        ctx.fillStyle = `hsl(${i * (360 / items.length)}, 70%, 50%)`;
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 140, angle, angle + arc);
        ctx.fill();
        
        ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(angle + arc / 2);
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "right"; 
        ctx.fillText(item.substring(0, 15), 130, 5);
        ctx.restore();
    });
}

let currentRotation = 0;
function spinWheel() {
    const spinBtn = document.getElementById('spin-btn');
    const resultDisplay = document.getElementById('result-display');
    
    if (spinBtn) spinBtn.disabled = true;
    if (resultDisplay) resultDisplay.innerText = "Memutar...";

    const extraSpins = 5 + Math.random() * 5; 
    const spinAngle = extraSpins * 2 * Math.PI;
    const totalRotation = currentRotation + spinAngle;

    canvas.style.transition = "transform 4s cubic-bezier(0.15, 0, 0.15, 1)";
    canvas.style.transform = `rotate(${totalRotation}rad)`;

    setTimeout(() => {
        if (spinBtn) spinBtn.disabled = false;
        currentRotation = totalRotation;
        
        const actualRotation = totalRotation % (2 * Math.PI);
        const arc = (2 * Math.PI) / items.length;
        const winningIndex = Math.floor((2 * Math.PI - actualRotation) / arc) % items.length;
        
        if (resultDisplay) resultDisplay.innerText = `Selamat! Dapat: ${items[winningIndex]}`;
    }, 4000);
}

function resetGame() {
    location.reload(); 
}
