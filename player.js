// Инициализация Telegram Web App
Telegram.WebApp.ready();

// Получаем данные пользователя
const user = Telegram.WebApp.initDataUnsafe?.user;
if (user) {
    document.getElementById('user-info').textContent = 
        `Привет, ${user.first_name || user.username || 'Игрок'}! ID: ${user.id}`;
    
    // Отправляем на бэкэнд для проверки (позже)
    console.log('initData:', Telegram.WebApp.initData);
} else {
    document.getElementById('user-info').textContent = 'Ошибка авторизации';
}

// Расширяем на полный экран
Telegram.WebApp.expand();

// Настраиваем главную кнопку
Telegram.WebApp.MainButton.setText('Играть!').show();
Telegram.WebApp.MainButton.onClick(() => {
    startGame(user.id);
});

function startGame(userId) {
    // Ваша игровая логика
    alert('Игра началась! User ID: ' + userId);
}
