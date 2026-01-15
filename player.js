/*// Инициализация Telegram Web App
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
*/

// player.js - ✅ ИСПРАВЛЕННАЯ ВЕРСИЯ
(function() {
  // Ждём Telegram WebApp
  function initTelegram() {
    if (!window.Telegram?.WebApp) {
      console.error('❌ Telegram WebApp НЕ НАЙДЕН!');
      setTimeout(initTelegram, 100); // Повторяем
      return;
    }

    console.log('✅ Telegram WebApp НАЙДЕН!');
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    const player = Telegram.WebApp.initDataUnsafe?.player || Telegram.WebApp.initDataUnsafe?.user;
    
    if (player) {
      console.log('👤 TG PLAYER DATA:', player);
      STATE.tgPlayer = {
        id: player.id,
        username: player.username || player.first_name || `User${player.id?.toString().slice(-4)}`,
        photo: player.photo_url || ''
      };
      console.log('✅ TG PLAYER УСТАНОВЛЕН:', STATE.tgPlayer);
      updateTGDisplay();
    } else {
      console.log('⚠️ TG Player НЕ НАЙДЕН');
    }
  }

  function updateTGDisplay() {
    const infoEl = document.getElementById('tgPlayerInfo');
    const idEl = document.getElementById('tgUserId');
    const nickEl = document.getElementById('tgUsername');
    const avatarEl = document.getElementById('tgAvatar');
    
    if (!infoEl || !idEl || !nickEl || !avatarEl) {
      console.error('❌ TG элементы НЕ НАЙДЕНЫ!');
      return;
    }
    
    if (STATE.tgPlayer.id) {
      idEl.textContent = `ID: ${STATE.tgPlayer.id}`;
      nickEl.textContent = STATE.tgPlayer.username;
      avatarEl.src = STATE.tgPlayer.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiM0Q0FGNTAiLz4KPHRleHQgeD0iMTQiIHk9IjE5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5VPC90ZXh0Pg==';
      infoEl.classList.remove('hidden');
    }
  }

  // ✅ БЕЗОПАСНЫЙ СТАРТ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTelegram);
  } else {
    initTelegram();
  }
})();
