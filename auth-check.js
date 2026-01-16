// auth-check.js - АВТОАВТОРИЗАЦИЯ + РЕДИРЕКТ @BvsWBot
(function() {
  console.log('🔍 auth-check.js - проверка Telegram...');
  
  setTimeout(() => {
    // ❌ НЕ в Telegram → РЕДИРЕКТ на @BvsWBot
    if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
      console.log('❌ НЕ в Telegram → редирект https://t.me/BvsWBot');
      window.location.href = 'https://t.me/BvsWBot';
      return;
    }
    
    // ✅ В Telegram → запускаем авторизацию
    console.log('✅ В Telegram → запускаем player.js');
    window.dispatchEvent(new CustomEvent('telegramReady'));
  }, 1000);
})();