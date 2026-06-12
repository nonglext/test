import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpIZIojA-qYuySNiXvSG5eN-DDtdUhsNk",
  authDomain: "testbetangb.firebaseapp.com",
  databaseURL: "https://testbetangb-default-rtdb.firebaseio.com",
  projectId: "testbetangb",
  storageBucket: "testbetangb.firebasestorage.app",
  messagingSenderId: "339383875428",
  appId: "1:339383875428:web:af52361154f6f6ca8dac71",
  measurementId: "G-W41KJNYLBN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const stockRef = ref(db, 'site_stock');

// --- БАЗА ДАННЫХ ЛОКАЛЬНАЯ ---
if (!localStorage.getItem('robuy_users_db')) {
    const startDB = [
        { email: 'user@gmail.com', username: 'tester', password: 'user123', role: 'user' },
        { email: 'admin@robuy.com', username: 'admin', password: 'admin123', role: 'admin' }
    ];
    localStorage.setItem('robuy_users_db', JSON.stringify(startDB));
}

// --- DOM ЭЛЕМЕНТЫ ---
const mainSlider = document.getElementById('mainSlider');
const rublesValue = document.getElementById('rublesValue');
const robuxValue = document.getElementById('robuxValue');
const sliderThumb = document.getElementById('sliderThumb');
const viewStepSlider = document.getElementById('viewStepSlider');
const viewAdminPanel = document.getElementById('viewAdminPanel');
const liveStockCounter1 = document.getElementById('liveStockCounter1');
const navBuyBtn = document.getElementById('navBuyBtn');
const navAdminBtn = document.getElementById('navAdminBtn');
const logoToMain = document.getElementById('logoToMain');
const authModal = document.getElementById('authModal');
const headerAuthBtn = document.getElementById('headerAuthBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const standardAuthBlock = document.getElementById('standardAuthBlock');
const gmailAuthBlock = document.getElementById('gmailAuthBlock');
const switchToGmailBtn = document.getElementById('switchToGmailBtn');
const btnBackToClassic = document.getElementById('btnBackToClassic');
const credForm = document.getElementById('credForm');
const authUsername = document.getElementById('authUsername');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const emailRegWrapper = document.getElementById('emailRegWrapper');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const labelUserField = document.getElementById('labelUserField');
const gmailInputField = document.getElementById('gmailInputField');
const btnGoogleSubmit = document.getElementById('btnGoogleSubmit');
const headerProfileWidget = document.getElementById('headerProfileWidget');
const sessionUsername = document.getElementById('sessionUsername');
const sessionRoleBadge = document.getElementById('sessionRoleBadge');
const btnExitSession = document.getElementById('btnExitSession');
const avatarSlot = document.getElementById('avatarSlot');

const rateFactor = 0.653594;
let currentAuthMode = 'login';

// --- ЛОГИКА FIREBASE (БАЛАНС) ---
onValue(stockRef, (snapshot) => {
    const stock = snapshot.val() || 1076953;
    liveStockCounter1.innerText = parseInt(stock).toLocaleString('ru-RU') + " R$";
    const admInput = document.getElementById('admStockInput');
    if (admInput) admInput.value = stock;
});

// --- КАЛЬКУЛЯТОР ---
function updateSliderUI() {
    const val = parseInt(mainSlider.value, 10);
    const percent = ((val - mainSlider.min) / (mainSlider.max - mainSlider.min)) * 100;
    mainSlider.style.background = `linear-gradient(to right, #FACC15 ${percent}%, #2D3748 ${percent}%)`;
    sliderThumb.style.left = `${percent}%`;
    sliderThumb.innerText = val;
    robuxValue.innerText = `${val} R$`;
    rublesValue.innerText = `${(val * rateFactor).toFixed(2)} ₽`;
}
mainSlider.addEventListener('input', updateSliderUI);

// --- НАВИГАЦИЯ И АДМИНКА ---
function switchActiveView(target) {
    viewStepSlider.classList.add('hidden');
    viewAdminPanel.classList.add('hidden');
    navBuyBtn.classList.remove('active');
    navAdminBtn.classList.remove('active');
    if (target === 'slider') {
        viewStepSlider.classList.remove('hidden');
        navBuyBtn.classList.add('active');
    } else if (target === 'admin') {
        viewAdminPanel.classList.remove('hidden');
        navAdminBtn.classList.add('active');
        renderAdminDashboard();
    }
}
navBuyBtn.addEventListener('click', (e) => { e.preventDefault(); switchActiveView('slider'); });
navAdminBtn.addEventListener('click', (e) => { e.preventDefault(); switchActiveView('admin'); });
logoToMain.addEventListener('click', () => switchActiveView('slider'));

// --- АВТОРИЗАЦИЯ ---
headerAuthBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));

switchToGmailBtn.addEventListener('click', () => {
    standardAuthBlock.classList.add('hidden');
    document.getElementById('authTabsZone').classList.add('hidden');
    gmailAuthBlock.classList.remove('hidden');
});
btnBackToClassic.addEventListener('click', () => {
    gmailAuthBlock.classList.add('hidden');
    document.getElementById('authTabsZone').classList.remove('hidden');
    standardAuthBlock.classList.remove('hidden');
});

tabLogin.addEventListener('click', () => {
    currentAuthMode = 'login';
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    emailRegWrapper.classList.add('hidden');
    authTitle.innerText = "Вход в аккаунт";
    labelUserField.innerText = "Имя пользователя или Email";
});
tabRegister.addEventListener('click', () => {
    currentAuthMode = 'register';
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    emailRegWrapper.classList.remove('hidden');
    authTitle.innerText = "Создать аккаунт";
    labelUserField.innerText = "Придумайте Username";
});

function refreshSessionState() {
    const user = JSON.parse(localStorage.getItem('robuy_current_session'));
    if (user) {
        headerAuthBtn.classList.add('hidden');
        headerProfileWidget.classList.remove('hidden');
        sessionUsername.innerText = user.email || user.username;
        if (user.role === 'admin') {
            sessionRoleBadge.innerText = "ADMINISTRATOR";
            navAdminBtn.classList.remove('hidden');
        } else {
            sessionRoleBadge.innerText = "BETA TESTER";
            navAdminBtn.classList.add('hidden');
        }
    } else {
        headerAuthBtn.classList.remove('hidden');
        headerProfileWidget.classList.add('hidden');
        navAdminBtn.classList.add('hidden');
    }
}

credForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    const uName = authUsername.value.trim();
    const uPass = authPassword.value;
    if (currentAuthMode === 'login') {
        const found = db.find(u => (u.username === uName || u.email === uName) && u.password === uPass);
        if (found) {
            localStorage.setItem('robuy_current_session', JSON.stringify(found));
            authModal.classList.add('hidden'); refreshSessionState();
        } else alert('Неверные данные!');
    } else {
        const uEmail = authEmail.value.trim();
        const newUser = { email: uEmail, username: uName, password: uPass, role: 'user' };
        db.push(newUser); localStorage.setItem('robuy_users_db', JSON.stringify(db));
        localStorage.setItem('robuy_current_session', JSON.stringify(newUser));
        authModal.classList.add('hidden'); refreshSessionState();
    }
});

btnGoogleSubmit.addEventListener('click', () => {
    const mail = gmailInputField.value.trim();
    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    let account = db.find(u => u.email.toLowerCase() === mail.toLowerCase()) || 
                  { email: mail, username: 'Gamer_' + Math.floor(Math.random()*900), password: 'OAuth', role: 'user' };
    localStorage.setItem('robuy_current_session', JSON.stringify(account));
    authModal.classList.add('hidden'); refreshSessionState();
});

btnExitSession.addEventListener('click', () => {
    localStorage.removeItem('robuy_current_session'); refreshSessionState();
});

// --- АДМИН ПАНЕЛЬ ---
function renderAdminDashboard() {
    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    document.getElementById('admTotalUsers').innerText = db.filter(u => u.role === 'user').length;
    document.getElementById('admAccountsList').innerHTML = db.map(acc => `
        <div class="log-item"><span><strong>${acc.username}</strong></span><span>${acc.role}</span></div>
    `).join('');
}

document.getElementById('btnSaveStock').addEventListener('click', () => {
    const val = document.getElementById('admStockInput').value;
    set(stockRef, val).then(() => alert('Баланс обновлен для всех!'));
});

document.getElementById('btnCreateAdmin').addEventListener('click', () => {
    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    db.push({ email: 'new@admin.com', username: 'NewAdmin', password: '123', role: 'admin' });
    localStorage.setItem('robuy_users_db', JSON.stringify(db));
    renderAdminDashboard();
});

updateSliderUI();
refreshSessionState();