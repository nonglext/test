// --- БАЗА ДАННЫХ (LOCALSTORAGE) ---
if (!localStorage.getItem('robuy_users_db')) {
    const startDB = [
        { email: 'user@gmail.com', username: 'tester', password: 'user123', role: 'user' },
        { email: 'admin@robuy.com', username: 'admin', password: 'admin123', role: 'admin' }
    ];
    localStorage.setItem('robuy_users_db', JSON.stringify(startDB));
}
if (!localStorage.getItem('robuy_site_stock')) {
    localStorage.setItem('robuy_site_stock', '1076953');
}

// --- ЭЛЕМЕНТЫ DOM ---
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

// Модалка
const authModal = document.getElementById('authModal');
const headerAuthBtn = document.getElementById('headerAuthBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const standardAuthBlock = document.getElementById('standardAuthBlock');
const gmailAuthBlock = document.getElementById('gmailAuthBlock');
const switchToGmailBtn = document.getElementById('switchToGmailBtn');
const btnBackToClassic = document.getElementById('btnBackToClassic');

// Инпуты авторизации
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

// Профиль
const headerProfileWidget = document.getElementById('headerProfileWidget');
const sessionUsername = document.getElementById('sessionUsername');
const sessionRoleBadge = document.getElementById('sessionRoleBadge');
const btnExitSession = document.getElementById('btnExitSession');
const avatarSlot = document.getElementById('avatarSlot');

const rateFactor = 0.653594;
let currentAuthMode = 'login';

// --- ЛОГИКА КАЛЬКУЛЯТОРА ---
function updateSliderUI() {
    const val = parseInt(mainSlider.value, 10);
    const percent = ((val - mainSlider.min) / (mainSlider.max - mainSlider.min)) * 100;
    
    // Тёмный стиль ползунка с желтым заполнением
    mainSlider.style.background = `linear-gradient(to right, #FACC15 ${percent}%, #2D3748 ${percent}%)`;
    sliderThumb.style.left = `${percent}%`;
    sliderThumb.innerText = val;
    
    robuxValue.innerText = `${val} R$`;
    rublesValue.innerText = `${(val * rateFactor).toFixed(2)} ₽`;
}
mainSlider.addEventListener('input', updateSliderUI);

// --- НАВИГАЦИЯ ---
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

// --- УПРАВЛЕНИЕ ОКНАМИ АВТОРИЗАЦИИ ---
headerAuthBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));

// Переключение Classic / Gmail
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

// Переключение Вход / Регистрация
tabLogin.addEventListener('click', () => {
    currentAuthMode = 'login';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    emailRegWrapper.classList.add('hidden');
    authTitle.innerText = "Вход в аккаунт";
    authSubtitle.innerText = "Войдите для доступа к панели Robuy";
    labelUserField.innerText = "Имя пользователя или Email";
});
tabRegister.addEventListener('click', () => {
    currentAuthMode = 'register';
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    emailRegWrapper.classList.remove('hidden');
    authTitle.innerText = "Создать аккаунт";
    authSubtitle.innerText = "Зарегистрируйтесь для сохранения истории";
    labelUserField.innerText = "Придумайте Username";
});

// --- СИСТЕМА СЕССИЙ ---
function refreshSessionState() {
    const user = JSON.parse(localStorage.getItem('robuy_current_session'));
    const stock = localStorage.getItem('robuy_site_stock');
    
    liveStockCounter1.innerText = parseInt(stock, 10).toLocaleString('ru-RU') + " R$";

    if (user) {
        headerAuthBtn.classList.add('hidden');
        headerProfileWidget.classList.remove('hidden');
        sessionUsername.innerText = user.email || user.username;
        
        if (user.role === 'admin') {
            sessionRoleBadge.innerText = "ADMINISTRATOR";
            sessionRoleBadge.style.color = "#F97316";
            avatarSlot.innerText = "👑";
            navAdminBtn.classList.remove('hidden');
        } else {
            sessionRoleBadge.innerText = "BETA TESTER";
            sessionRoleBadge.style.color = "#38BDF8";
            avatarSlot.innerText = "🤖";
            navAdminBtn.classList.add('hidden');
        }
    } else {
        headerAuthBtn.classList.remove('hidden');
        headerProfileWidget.classList.add('hidden');
        navAdminBtn.classList.add('hidden');
        if (!viewAdminPanel.classList.contains('hidden')) switchActiveView('slider');
    }
}

// Отправка формы Username/Pass
credForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    const uName = authUsername.value.trim();
    const uPass = authPassword.value;

    if (currentAuthMode === 'login') {
        const found = db.find(u => (u.username === uName || u.email === uName) && u.password === uPass);
        if (found) {
            localStorage.setItem('robuy_current_session', JSON.stringify(found));
            authModal.classList.add('hidden');
            credForm.reset();
            refreshSessionState();
        } else {
            alert('Неверные данные!');
        }
    } else {
        const uEmail = authEmail.value.trim();
        if (db.some(u => u.username.toLowerCase() === uName.toLowerCase() || u.email.toLowerCase() === uEmail.toLowerCase())) {
            alert('Пользователь уже существует!'); return;
        }
        const newUser = { email: uEmail, username: uName, password: uPass, role: 'user' };
        db.push(newUser);
        localStorage.setItem('robuy_users_db', JSON.stringify(db));
        localStorage.setItem('robuy_current_session', JSON.stringify(newUser));
        authModal.classList.add('hidden');
        credForm.reset();
        refreshSessionState();
    }
});

// Отправка Gmail
btnGoogleSubmit.addEventListener('click', () => {
    const mail = gmailInputField.value.trim();
    if (!mail.includes('@')) { alert('Введите корректный Gmail!'); return; }

    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    let account = db.find(u => u.email.toLowerCase() === mail.toLowerCase());
    
    if (!account) {
        const isTargetAdmin = (mail === 'admin@robuy.com');
        account = { 
            email: mail, 
            username: isTargetAdmin ? 'admin' : `Gamer_${Math.floor(100+Math.random()*900)}`, 
            password: 'OAuth', 
            role: isTargetAdmin ? 'admin' : 'user' 
        };
        db.push(account);
        localStorage.setItem('robuy_users_db', JSON.stringify(db));
    }

    localStorage.setItem('robuy_current_session', JSON.stringify(account));
    authModal.classList.add('hidden');
    gmailInputField.value = '';
    refreshSessionState();
});

btnExitSession.addEventListener('click', () => {
    localStorage.removeItem('robuy_current_session');
    refreshSessionState();
});

// --- АДМИНКА ---
function renderAdminDashboard() {
    const db = JSON.parse(localStorage.getItem('robuy_users_db'));
    const stock = localStorage.getItem('robuy_site_stock');

    document.getElementById('admTotalUsers').innerText = db.filter(u => u.role === 'user').length;
    document.getElementById('admTotalAdmins').innerText = db.filter(u => u.role === 'admin').length;
    document.getElementById('admStockInput').value = stock;

    const list = document.getElementById('admAccountsList');
    list.innerHTML = '';
    db.forEach(acc => {
        const div = document.createElement('div');
        div.className = 'log-item';
        div.innerHTML = `
            <span><strong style="color:#FFF;">${acc.username}</strong> (${acc.email})</span>
            <span style="color: ${acc.role === 'admin' ? '#F97316' : '#9CA3AF'}; font-weight:700;">${acc.role.toUpperCase()}</span>
        `;
        list.appendChild(div);
    });
}

document.getElementById('btnSaveStock').addEventListener('click', () => {
    const val = parseInt(document.getElementById('admStockInput').value, 10);
    if (!isNaN(val) && val >= 0) {
        localStorage.setItem('robuy_site_stock', val.toString());
        refreshSessionState();
        alert('Баланс обновлен!');
    }
});

document.getElementById('btnCreateAdmin').addEventListener('click', () => {
    const name = document.getElementById('admNewUser').value.trim();
    const mail = document.getElementById('admNewEmail').value.trim();
    const pass = document.getElementById('admNewPass').value;

    if (name && mail && pass) {
        const db = JSON.parse(localStorage.getItem('robuy_users_db'));
        db.push({ email: mail, username: name, password: pass, role: 'admin' });
        localStorage.setItem('robuy_users_db', JSON.stringify(db));
        renderAdminDashboard();
        alert(`Админ ${name} добавлен!`);
    }
});

// Запуск
updateSliderUI();
refreshSessionState();