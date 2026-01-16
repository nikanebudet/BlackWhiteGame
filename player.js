// player.js - запускается ТОЛЬКО после telegramReady
window.addEventListener('telegramReady', function() {
  console.log('🚀 player.js - TG READY (@BvsWBot)');
  
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  
  const player = Telegram.WebApp.initDataUnsafe?.player || Telegram.WebApp.initDataUnsafe?.user;
  
  if (player?.id) {
    window.STATE = window.STATE || {};
    window.STATE.tgPlayer = {
      id: player.id,
      username: player.username || player.first_name || `User${player.id.toString().slice(-4)}`,
      photo: player.photo_url || ''
    };
    
    console.log('✅ @BvsWBot Player:', window.STATE.tgPlayer);
    showTGPlayer();
    
    // ✅ СИГНАЛ ДЛЯ ИГРЫ
    window.dispatchEvent(new CustomEvent('gameReady'));
    
  } else {
    console.error('❌ Player не найден → обратно к @BvsWBot');
    window.location.href = 'https://t.me/BvsWBot';
  }
});

function showTGPlayer() {
  const infoEl = document.getElementById('tgPlayerInfo');
  if (!infoEl || !window.STATE?.tgPlayer) return;
  
  document.getElementById('tgUserId').textContent = `ID: ${window.STATE.tgPlayer.id}`;
  document.getElementById('tgUsername').textContent = `@${window.STATE.tgPlayer.username}`;
  document.getElementById('tgAvatar').src = window.STATE.tgPlayer.photo || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiM0Q0FGNTAiLz4KPHRleHQgeD0iMTQiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiPkI8L3RleHQ+Cjwvc3ZnPg==';
  
  infoEl.classList.remove('hidden');
  infoEl.style.cursor = 'pointer';
  infoEl.onclick = () => {
    Telegram.WebApp.showAlert(`🎮 Black vs White\nID: ${window.STATE.tgPlayer.id}\n@${window.STATE.tgPlayer.username}`);
  };
}
