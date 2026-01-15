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
// player.js - ✅ БЕЗОПАСНАЯ ВЕРСИЯ (НЕ ЛОМАЕТ index.js)
(function() {
  'use strict';
  
  // ГЛОБАЛЬНЫЙ STATE (для index.js)
  window.STATE = window.STATE || { tgPlayer: { id: null, username: null, photo: null } };
  
  function initTelegram() {
    // Ждём Telegram WebApp
    if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
      console.log('⏳ Ждём Telegram WebApp...');
      setTimeout(initTelegram, 200);
      return;
    }

    console.log('✅ Telegram WebApp НАЙДЕН!');
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    const player = Telegram.WebApp.initDataUnsafe?.player || Telegram.WebApp.initDataUnsafe?.user;
    
    if (player?.id) {
      console.log('👤 TG PLAYER DATA:', player);
      STATE.tgPlayer = {
        id: player.id,
        username: player.username || player.first_name || `User${player.id.toString().slice(-4)}`,
        photo: player.photo_url || ''
      };
      console.log('✅ TG PLAYER УСТАНОВЛЕН:', STATE.tgPlayer);
      updateTGDisplay();
    } else {
      console.log('⚠️ TG Player НЕ НАЙДЕН');
      showNoAuth();
    }
  }

  function updateTGDisplay() {
    const infoEl = document.getElementById('tgPlayerInfo');
    const idEl = document.getElementById('tgUserId');
    const nickEl = document.getElementById('tgUsername');
    const avatarEl = document.getElementById('tgAvatar');
    
    if (!infoEl || !idEl || !nickEl || !avatarEl) return;
    
    idEl.textContent = `ID: ${STATE.tgPlayer.id}`;
    nickEl.textContent = STATE.tgPlayer.username;
    avatarEl.src = STATE.tgPlayer.photo || 
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiM0Q0FGNTAiLz4KPHRleHQgeD0iMTQiIHk9IjE5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiPlU8L3RleHQ+Cjwvc3ZnPg==';
    infoEl.classList.remove('hidden');
  }

  function showNoAuth() {
    const infoEl = document.getElementById('tgPlayerInfo');
    if (infoEl) {
      infoEl.innerHTML = '<span style="color:#ff6b6b;font-size:11px;">⛔ Не в Telegram</span>';
    }
  }

  // ✅ СТАРТ ПОСЛЕ DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTelegram);
  } else {
    setTimeout(initTelegram, 100);
  }
})();