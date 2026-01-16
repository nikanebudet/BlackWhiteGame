/**
 * Version: v3.0.27 - Полное сохранение состояния
 * - Лига + ставки + время раунда + USD+USD-R
 * - Перезагрузка = точное восстановление игры

cd /X/YandexDisk/Game/BlackWhite
git add .
git commit -m "Версия 3.0.26 js"
git push origin main




 */















(() => {
//═══════════════════════════════════════════════════
// 1. DOM ЭЛЕМЕНТЫ
//═══════════════════════════════════════════════════
  const ELEMENTS = {
    left: document.getElementById("leftSide"),
    right: document.getElementById("rightSide"),
    msg: document.getElementById("message"),
    /*boardNumber: document.getElementById("boardNumber"),*/
	boardNumbers: document.querySelectorAll('.board-number[data-league]'),
    timerText: document.getElementById("timerText"),
    nextButton: document.getElementById("nextButton"),

    leftSticker: document.querySelector("#leftSide .sticker"),
    rightSticker: document.querySelector("#rightSide .sticker"),
    
    leftTapsEl: document.getElementById("leftTaps"),
    rightTapsEl: document.getElementById("rightTaps"),
    leftTapsValueEl: document.getElementById("leftTapsValue"),
    rightTapsValueEl: document.getElementById("rightTapsValue"),
    
    leftFinalBetsEl: document.getElementById("leftFinalBets"),
    rightFinalBetsEl: document.getElementById("rightFinalBets"),
    leftFinalBetsValueEl: document.getElementById("leftFinalBetsValue"),
    rightFinalBetsValueEl: document.getElementById("rightFinalBetsValue"),

    leftPercentEl: document.getElementById("leftPercent"),
    rightPercentEl: document.getElementById("rightPercent"),
    BetsEl: document.getElementById("Bets"),
    BetsValueEl: document.getElementById("BetsValue"),
    
    ticketsBalanceEl: document.getElementById("ticketsBalance"),
    ticketsIconSmall: document.querySelector(".tickets-icon-small"),
    betsIcon: document.querySelector(".bets-icon"),

    ticketsValueDisplayEl: document.getElementById("ticketsValueDisplay"),
    walletAmountEl: document.getElementById("walletAmount"),

    randomCheckBoxEl: document.getElementById("randomCheckBox"),
    randomMaxInputEl: document.getElementById("randomMaxInput"),
    debugCheckBoxEl: document.getElementById("showRandomCheckBox"),

    leagueModal: document.getElementById("leagueModal")
  };

//═══════════════════════════════════════════════════
// 2. ЛИГИ
//═══════════════════════════════════════════════════
  const LEAGUES = {
    test: {
      name: "TEST", ticketsWhole: 100, ticketsRemainder: 0,
      ticketIcon: "./pic/icon/tickets_test.svg",
      leftSticker: "./pic/stikers/4.1 fire.svg", leftMainColorSticker: "#f8a624",
      rightSticker: "./pic/stikers/4.2 water.svg", rightMainColorSticker: "#5dadec",
      boardStart: 1, boardCurrent: 1
    },
    cash: {
      name: "CASH", ticketsWhole: 55, ticketsRemainder: 0,
      ticketIcon: "./pic/icon/tickets_wood.svg",
      leftSticker: "./pic/stikers/5.1 wulf.svg", leftMainColorSticker: "#66757F",
      rightSticker: "./pic/stikers/5.2 fox.svg", rightMainColorSticker: "#F4900C",
      boardStart: 100, boardCurrent: 127
    },
    ad: {
      name: "AD", ticketsWhole: 103, ticketsRemainder: 0,
      ticketIcon: "./pic/icon/tickets_ads.svg",
      leftSticker: "./pic/stikers/3.1 like.svg", leftMainColorSticker: "#DD2E44",
      rightSticker: "./pic/stikers/3.2 flirt.svg", rightMainColorSticker: "#E8596E",
      boardStart: 500, boardCurrent: 543
    }
  };

//═══════════════════════════════════════════════════
// 3. КОНСТАНТЫ + STATE  
//═══════════════════════════════════════════════════
const CONSTANTS = {
  ROUND_DURATION_SEC: 570,
  BETWEEN_SEC: 30,
  USD_CENTS: 100,
  EXTRA_ROUND_SEC: 570,
  MIN_BETS_TRIGGER: 3,
  WIN_THRESHOLD: 45,
  SUPERFUNDS_DEFAULT: [1000, 10000, 100000, 1000000],
  SUPERFUNDS_SPLIT: [25, 25, 25, 25]
};

window.DEBUG_MODE = false;

let STATE = {
  currentLeague: "test",
  cashBalanceCents: 12000,
  tgPlayer: { id: null, username: null, photo: null },
  leaguesState: {
    test: { boardCurrent: 1, simulationLeftVotes: 0, simulationRightVotes: 0, timeLeft: 570, isRoundFinished: false, isBetweenRounds: false },
    cash: { boardCurrent: 127, simulationLeftVotes: 0, simulationRightVotes: 0, timeLeft: 570, isRoundFinished: false, isBetweenRounds: false },
    ad: { boardCurrent: 543, simulationLeftVotes: 0, simulationRightVotes: 0, timeLeft: 570, isRoundFinished: false, isBetweenRounds: false }
  },
  superfunds: {
    test: { '1K': 0, '10K': 0, '100K': 0, '1M': 0 },
    cash: { '1K': 0, '10K': 0, '100K': 0, '1M': 0 },
    ad: { '1K': 0, '10K': 0, '100K': 0, '1M': 0 }
  },
  leagueTimers: { test: null, cash: null, ad: null },
  playerSimulationId: null,
  playerLeftTickets: { test: 0, cash: 0, ad: 0 },
  playerRightTickets: { test: 0, cash: 0, ad: 0 },
  simulationLeftVotes: 0,
  simulationRightVotes: 0,
  isRandomMode: true,
  isDebugMode: true,
  randomMaxTickets: 200
};

// ⭐ ПОЛНАЯ СТРУКТУРА cookies (ФИКС ТАЙМЕРОВ!)
STATE.cookies = {
  version: '1.1',
  lastUpdate: Date.now(),
  currentLeague: "test",
  playerLeftTickets: { test: 0, cash: 0, ad: 0 },
  playerRightTickets: { test: 0, cash: 0, ad: 0 },
  leaguesState: {
    test: { 
      timeLeft: 570, boardCurrent: 1, 
      isRoundFinished: false, isBetweenRounds: false,
      simulationLeftVotes: 0, simulationRightVotes: 0 
    },
    cash: { 
      timeLeft: 570, boardCurrent: 127, 
      isRoundFinished: false, isBetweenRounds: false,
      simulationLeftVotes: 0, simulationRightVotes: 0 
    },
    ad: { 
      timeLeft: 570, boardCurrent: 543, 
      isRoundFinished: false, isBetweenRounds: false,
      simulationLeftVotes: 0, simulationRightVotes: 0 
    }
  },
  player: {
    id: null, username: null, avatar: null,
    usd: 120, usdR: 0,
    tickets: { test: 100, cash: 55, ad: 103 }
  }
};
//═══════════════════════════════════════════════════
// 4. МОДАЛКА ЛИГ
//═══════════════════════════════════════════════════
function updateLeagueModalTickets() {
  const leagueModal = document.getElementById('leagueModal');
  if (!leagueModal) return;
  
  leagueModal.querySelectorAll('.league-btn').forEach(btn => {
    const league = btn.dataset.league;
    
    // ✅ ВРЕМЕННО ПЕРЕКЛЮЧАЕМСЯ НА ЛИГУ → ЧИТАЕМ ЕЁ БАЛАНС → ВОЗВРАЩАЕМСЯ
    const prevLeague = STATE.currentLeague;
    STATE.currentLeague = league;
    
    const ticketsRemain = UTILS.getCurrentTicketsWhole(); // ← ТОТ ЖЕ БАЛАНС ЧТО В ticketsValueDisplay
    
    STATE.currentLeague = prevLeague; // Возвращаем обратно
    
    const ticketsEl = btn.querySelector('.league-tickets');
    ticketsEl.textContent = ticketsRemain;
    
    if (ticketsRemain <= 0) {
      btn.classList.add('disabled');
    } else {
      btn.classList.remove('disabled');
    }
  });
}

//═══════════════════════════════════════════════════
// 5. УТИЛИТЫ
//═══════════════════════════════════════════════════
const UTILS = {
  getLeagueData(league = STATE.currentLeague) {
    return LEAGUES[league];
  },

  getCurrentPlayerTickets() {
    return STATE.playerLeftTickets[STATE.currentLeague] + STATE.playerRightTickets[STATE.currentLeague];
  },

  getTotalTickets() {
    return UTILS.getCurrentPlayerTickets() + STATE.simulationLeftVotes + STATE.simulationRightVotes;
  },

  getCurrentTicketsWhole() {
    return UTILS.getLeagueData().ticketsWhole;
  },

  setCurrentTicketsWhole(value) {
    const league = STATE.currentLeague;
    const data = UTILS.getLeagueData(league);
    data.ticketsWhole = Math.max(0, Math.floor(value));
  },

  getTicketsDisplay() {
    const data = UTILS.getLeagueData();
    if (data.ticketsRemainder < 10) return data.ticketsWhole.toString();
    return `${data.ticketsWhole}.${Math.floor(data.ticketsRemainder / 10)}`;
  },

  updateTicketsDisplay() {
    ELEMENTS.ticketsValueDisplayEl.textContent = UTILS.getTicketsDisplay();
  },

  switchLeague(league) {
    const prevLeague = STATE.currentLeague;
    
    // ⭐ Остановить симуляцию предыдущей лиги
    if (STATE.playerSimulationId) {
      clearInterval(STATE.playerSimulationId);
      STATE.playerSimulationId = null;
    }
    
    // Сохранить состояние предыдущей лиги
    STATE.leaguesState[prevLeague] = {
      ...STATE.leaguesState[prevLeague],
      simulationLeftVotes: STATE.simulationLeftVotes,
      simulationRightVotes: STATE.simulationRightVotes,
      boardCurrent: LEAGUES[prevLeague].boardCurrent
    };
    
    // Переключить лигу
    STATE.currentLeague = league;
    const data = UTILS.getLeagueData(league);
    const leagueState = STATE.leaguesState[league];
    
    // Восстановить состояние новой лиги
    STATE.simulationLeftVotes = leagueState.simulationLeftVotes;
    STATE.simulationRightVotes = leagueState.simulationRightVotes;
    
    // Обновить визуал
    UTILS.updateTicketsDisplay();
    if (ELEMENTS.ticketsIconSmall) ELEMENTS.ticketsIconSmall.src = data.ticketIcon;
    if (ELEMENTS.betsIcon) ELEMENTS.betsIcon.src = data.ticketIcon;
    if (ELEMENTS.leftSticker) ELEMENTS.leftSticker.src = data.leftSticker;
    if (ELEMENTS.rightSticker) ELEMENTS.rightSticker.src = data.rightSticker;
    
    ELEMENTS.left.style.backgroundColor = data.rightMainColorSticker;
    ELEMENTS.right.style.backgroundColor = data.leftMainColorSticker;
    if (ELEMENTS.leftPercentEl) ELEMENTS.leftPercentEl.style.color = data.leftMainColorSticker;
    if (ELEMENTS.rightPercentEl) ELEMENTS.rightPercentEl.style.color = data.rightMainColorSticker;
    
    // ⭐ Обновить отображаемый таймер
    ELEMENTS.timerText.textContent = UTILS.formatTime(leagueState.timeLeft);
    
    updateDisplay();
    
    // ⭐ Запустить симуляцию для новой лиги (если нужно)
    if (STATE.isRandomMode && !leagueState.isRoundFinished && !leagueState.isBetweenRounds) {
      PLAYER_SIMULATION.start();
    }
    
    console.log(`🔄 Лига: ${league} | #${data.boardCurrent} | ${UTILS.formatTime(leagueState.timeLeft)}`);
    updateBoardNumbers(); // ✅ ДОБАВИТЬ В КОНЕЦ
  },

  cycleLeague() {
    const leagues = ['test', 'cash', 'ad'];
    const currentIndex = leagues.indexOf(STATE.currentLeague);
    const nextIndex = (currentIndex + 1) % leagues.length;
    UTILS.switchLeague(leagues[nextIndex]);
  },

  formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  },

  // ⭐ USD-R КОНВЕРТЕР + BALANCE DISPLAY (НОВОЕ!)
  convertUsdR: function() {
    if (STATE.cookies.player.usdR >= 100) {
      const extraUsd = Math.floor(STATE.cookies.player.usdR / 100);
      STATE.cookies.player.usd += extraUsd;
      STATE.cookies.player.usdR = STATE.cookies.player.usdR % 100;
      if (window.DEBUG_MODE) console.log(`💰 USD-R → USD: +${extraUsd}, остаток ${STATE.cookies.player.usdR}`);
    }
  },

  getBalanceDisplay() {
    UTILS.convertUsdR();
    return `${STATE.cookies.player.usd}.${STATE.cookies.player.usdR.toString().padStart(2, '0')}`;
  },

  updateBalanceDisplay() {
    UTILS.convertUsdR();
    ELEMENTS.walletAmountEl.textContent = 
      `$${STATE.cookies.player.usd}.${STATE.cookies.player.usdR.toString().padStart(2, '0')}`;
  }
};
  
//═══════════════════════════════════════════════════
// 5.2. БЛОК 2: УТИЛИТЫ SUPERFUNDS
//═══════════════════════════════════════════════════
  const SUPERFUNDS = {
    isEnabled(league) {
      // Проверяем, включены ли суперфонды для лиги (есть ненулевые значения)
      const funds = STATE.superfunds[league];
      return Object.values(funds).some(value => value > 0);
    },

    distribute(league, totalBets) {
      // Распределяем банк по суперфондам по процентам
      const funds = STATE.superfunds[league];
      CONSTANTS.SUPERFUNDS_DEFAULT.forEach((fundSize, index) => {
        const percentage = CONSTANTS.SUPERFUNDS_SPLIT[index] || 0;
        if (percentage > 0) {
          const share = Math.floor(totalBets * (percentage / 100));
          const fundKey = STATE.superfunds[league][index] ? Object.keys(funds)[index] : `${fundSize}`;
          funds[fundKey] += share;
        }
      });
      console.log(`💰 Суперфонды [${league}]:`, funds);
    },

    /*getFundNames() {
      return ['1K', '10K', '100K', '1M'];
    }*/
  };

  

//═══════════════════════════════════════════════════
// 5. СИМУЛЯЦИЯ ИГРОКОВ
//═══════════════════════════════════════════════════
  const PLAYER_SIMULATION = {
    interval: 2500,
    
    start() {
      if (STATE.playerSimulationId) return;
      
      const simulateBet = () => {
        const leagueState = STATE.leaguesState[STATE.currentLeague];
        if (leagueState.isRoundFinished || leagueState.isBetweenRounds) return;
        
        const side = Math.random() < 0.52 ? 'left' : 'right';
        const betAmount = Math.floor(Math.random() * 3) + 2;
        
        if (side === 'left') {
          STATE.simulationLeftVotes += betAmount;
        } else {
          STATE.simulationRightVotes += betAmount;
        }
        
        console.log(`📊 Симуляция: L:${STATE.simulationLeftVotes} R:${STATE.simulationRightVotes}`);
        updateDisplay();
      };
      
      STATE.playerSimulationId = setInterval(simulateBet, PLAYER_SIMULATION.interval);
    },
    
    stop() {
      if (STATE.playerSimulationId) {
        clearInterval(STATE.playerSimulationId);
        STATE.playerSimulationId = null;
      }
    }
  };


//═══════════════════════════════════════════════════
// 5.1. Авторизация в телеграмме
//═══════════════════════════════════════════════════

function initTelegramPlayer() {
  if (window.Telegram?.WebApp?.initDataUnsafe?.player) {
    const player = Telegram.WebApp.initDataUnsafe.player;
    STATE.tgPlayer = {
      id: player.id,
      username: player.username || `User${player.id}`,
      photo: player.photo_url || ''
    };
    updateTGDisplay();
  }
}

function updateTGDisplay() {
  const infoEl = document.getElementById('tgPlayerInfo');
  const idEl = document.getElementById('tgUserId');
  const nickEl = document.getElementById('tgUsername');
  const avatarEl = document.getElementById('tgAvatar');
  
  if (STATE.tgPlayer.id) {
    idEl.textContent = `ID: ${STATE.tgPlayer.id}`;
    nickEl.textContent = STATE.tgPlayer.username;
    avatarEl.src = STATE.tgPlayer.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiM0Q0FGNTAiLz4KPHRleHQgeD0iMTQiIHk9IjE5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5IDwvdGV4dD4KPC9zdmc+';
    infoEl.classList.remove('hidden');
  } else {
    infoEl.classList.add('hidden');
  }
}

//═══════════════════════════════════════════════════
// 6. ГЛОБАЛЬНЫЙ МАСТЕР-ТАЙМЕР (тикает ВСЕ лиги)
//═══════════════════════════════════════════════════
  const MASTER_TIMER = {
    id: null,
    
    start() {
      if (MASTER_TIMER.id) return;
      
      MASTER_TIMER.id = setInterval(() => {
        // Тикаем ВСЕ лиги параллельно
        ['test', 'cash', 'ad'].forEach(league => {
          const state = STATE.leaguesState[league];
          if (!state.isRoundFinished && !state.isBetweenRounds && state.timeLeft > 0) {
            state.timeLeft--;
            
            // ⭐ Если это текущая лига - обновляем UI
            if (league === STATE.currentLeague) {
              ELEMENTS.timerText.textContent = UTILS.formatTime(state.timeLeft);
              
              // Завершить раунд если время вышло
              if (state.timeLeft <= 0) {
                ROUND.finish();
              }
            }
          }
        });
      }, 1000);
    }
  };



//═══════════════════════════════════════════════════
// 7. ЛОГИКА РАУНДА (НОВАЯ)
//═══════════════════════════════════════════════════
  const ROUND = {
    reset() {
      const league = STATE.currentLeague;
      const leagueState = STATE.leaguesState[league];
      
      leagueState.isRoundFinished = false;
      leagueState.isBetweenRounds = false;
      leagueState.simulationLeftVotes = 0;
      STATE.simulationLeftVotes = 0;
      STATE.simulationRightVotes = 0;
      
      ELEMENTS.left.classList.remove("winner");
      ELEMENTS.right.classList.remove("winner");
      ELEMENTS.nextButton.disabled = true;
      ELEMENTS.msg.textContent = "Разместите ставки";
      
      const data = UTILS.getLeagueData();
      /*ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;*/
      leagueState.timeLeft = CONSTANTS.ROUND_DURATION_SEC;
      
      updateDisplay();
    },

    finish() {
      const league = STATE.currentLeague;
      const leagueState = STATE.leaguesState[league];
      const leftTotal = STATE.playerLeftTickets[league] + STATE.simulationLeftVotes;
      const rightTotal = STATE.playerRightTickets[league] + STATE.simulationRightVotes;
      const totalBets = leftTotal + rightTotal;
      
      console.log(`🎲 ИТОГО: L:${leftTotal} R:${rightTotal} = ${totalBets} билетов`);
      
      // ⭐ ИСХОД 1: < 3 билетов → ПРОДЛЕНИЕ
      if (totalBets < CONSTANTS.MIN_BETS_TRIGGER) {
        leagueState.isRoundFinished = false;
        leagueState.timeLeft = CONSTANTS.EXTRA_ROUND_SEC;
        ELEMENTS.msg.textContent = "Мало ставок! Продлеваем раунд...";
        ELEMENTS.nextButton.disabled = true;
        
        // Сброс симуляции (НЕ билетов игрока)
        STATE.simulationLeftVotes = 0;
        STATE.simulationRightVotes = 0;
        leagueState.simulationLeftVotes = 0;
        leagueState.simulationRightVotes = 0;
        
        PLAYER_SIMULATION.start();
        updateDisplay();
        return;
      }
      
      leagueState.isRoundFinished = true;
      PLAYER_SIMULATION.stop();

      const leftPercent = (leftTotal / totalBets) * 100;
      const rightPercent = 100 - leftPercent;
      
      // ⭐ ИСХОД 2: СЛАБАЯ СТОРОНА < 45% ВЫИГРЫВАЕТ
      if (leftPercent < CONSTANTS.WIN_THRESHOLD) {
        ELEMENTS.left.classList.add("winner");
        ELEMENTS.right.classList.remove("winner");
        ELEMENTS.msg.textContent = "ЛЕВЫЙ ВЫИГРАЛ! (упорная борьба)";
        console.log(`🏆 ЛЕВЫЙ: ${leftPercent.toFixed(1)}% < ${CONSTANTS.WIN_THRESHOLD}%`);
      } 
      else if (rightPercent < CONSTANTS.WIN_THRESHOLD) {
        ELEMENTS.right.classList.add("winner");
        ELEMENTS.left.classList.remove("winner");
        ELEMENTS.msg.textContent = "ПРАВЫЙ ВЫИГРАЛ! (упорная борьба)";
        console.log(`🏆 ПРАВЫЙ: ${rightPercent.toFixed(1)}% < ${CONSTANTS.WIN_THRESHOLD}%`);
      } 
      else {
        // ⭐ ИСХОД 3: СУПЕРФОНДЫ (≥45% обе стороны)
        ELEMENTS.left.classList.remove("winner");
        ELEMENTS.right.classList.remove("winner");
        ELEMENTS.msg.textContent = "СТОЛ В СУПЕРФОНДЫ!";
        
        // Распределение по суперфондам
        SUPERFUNDS.distribute(league, totalBets);
        
        console.log(`🎰 СУПЕРФОНДЫ: L:${leftPercent.toFixed(1)}% R:${rightPercent.toFixed(1)}%`);
      }
      
      ELEMENTS.nextButton.disabled = false;
      updateDisplay();
    }
  };


//═══════════════════════════════════════════════════
// 8. ОБНОВЛЕНИЕ UI
//═══════════════════════════════════════════════════

  // Новая функция для обновления номеров столов
function updateBoardNumbers() {
  if (!ELEMENTS.boardNumbers || ELEMENTS.boardNumbers.length === 0) return;
  ELEMENTS.boardNumbers.forEach(boardEl => {
    const league = boardEl.dataset.league;
    
    // Номер стола
    boardEl.textContent = `#${LEAGUES[league].boardCurrent}`;
    
    // Подсветка текущей лиги
    if (league === STATE.currentLeague) {
      boardEl.classList.add('active-league');
    } else {
      boardEl.classList.remove('active-league');
    }
  });
}
  function updateDisplay() {
  const league = STATE.currentLeague;
  const leagueState = STATE.leaguesState[league];
  const leftPlayerBets = STATE.playerLeftTickets[league];
  const rightPlayerBets = STATE.playerRightTickets[league];
  
  ELEMENTS.leftTapsValueEl.textContent = leftPlayerBets;
  ELEMENTS.rightTapsValueEl.textContent = rightPlayerBets;
  
  ELEMENTS.leftTapsEl.classList.toggle("hidden", leftPlayerBets === 0);
  ELEMENTS.rightTapsEl.classList.toggle("hidden", rightPlayerBets === 0);

  ELEMENTS.BetsValueEl.textContent = UTILS.getTotalTickets();

  if (STATE.isDebugMode) {
    ELEMENTS.leftFinalBetsValueEl.textContent = leftPlayerBets + STATE.simulationLeftVotes;
    ELEMENTS.rightFinalBetsValueEl.textContent = rightPlayerBets + STATE.simulationRightVotes;
    ELEMENTS.leftFinalBetsEl.classList.remove("hidden");
    ELEMENTS.rightFinalBetsEl.classList.remove("hidden");
    
    ELEMENTS.leftPercentEl.classList.remove("hidden");
    ELEMENTS.rightPercentEl.classList.remove("hidden");
	
    ELEMENTS.nextButton.style.display = "block";
    ELEMENTS.msg.parentElement.style.display = "flex";
	
  } else {
    ELEMENTS.leftFinalBetsEl.classList.add("hidden");
    ELEMENTS.rightFinalBetsEl.classList.add("hidden");
    ELEMENTS.leftPercentEl.classList.add("hidden");
    ELEMENTS.rightPercentEl.classList.add("hidden");
    ELEMENTS.nextButton.style.display = "none";
    ELEMENTS.msg.style.display = "none";
  }



  // ⭐ ФИКС ПРОЦЕНТОВ — всегда сумма = 100%!
  const totalAll = UTILS.getTotalTickets() || 1;
  const leftPercentRaw = ((leftPlayerBets + STATE.simulationLeftVotes) / totalAll) * 100;
  
  let leftPercent = leftPercentRaw < 50 ? 
    // Левый < 50% → округляем ВНИЗ
    Math.floor(leftPercentRaw) :
    // Левый ≥ 50% → округляем ВВЕРХ
    Math.ceil(leftPercentRaw);
  
  const rightPercent = 100 - leftPercent; // ✅ ГАРАРНИРОВАННА 100%!
  
  ELEMENTS.leftPercentEl.textContent = `${leftPercent}%`;
  ELEMENTS.rightPercentEl.textContent = `${rightPercent}%`;
  
  // ⭐ ДИНАМИЧЕСКИЙ ТЕКСТ КНОПКИ
if (ELEMENTS.nextButton) {
  const leagueState = STATE.leaguesState[STATE.currentLeague];
  ELEMENTS.nextButton.textContent = leagueState.isRoundFinished ? "СЛЕДУЮЩИЙ РАУНД" : "ЗАВЕРШИТЬ РАУНД";
}
    // ✅ МОДАЛКА ЛИГ - обновление при каждой ставке
    updateLeagueModalTickets();
	updateBoardNumbers();
}


//═══════════════════════════════════════════════════
// 9. ОБРАБОТЧИКИ СОБЫТИЙ
//═══════════════════════════════════════════════════
  function initEventListeners() {
	document.getElementById('tgPlayerInfo').addEventListener('click', () => {
	  if (STATE.tgPlayer.id) {
		console.log('👤 Player:', STATE.tgPlayer);
		Telegram.WebApp.showAlert(`ID: ${STATE.tgPlayer.id}\n@${STATE.tgPlayer.username}`);
	  }
	});
    if (ELEMENTS.left) ELEMENTS.left.addEventListener("click", handleLeftClick);
    if (ELEMENTS.right) ELEMENTS.right.addEventListener("click", handleRightClick);
    if (ELEMENTS.nextButton) ELEMENTS.nextButton.addEventListener("click", nextRound);
    
    // ✅ BetsValueEl + betsIcon - ОТКРЫВАЕТ МОДАЛКУ ЛИГ
    [ELEMENTS.BetsValueEl, ELEMENTS.betsIcon].forEach(el => {
      if (el) {
        el.style.cursor = "pointer";
        el.style.pointerEvents = "auto";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (ELEMENTS.leagueModal) {
            ELEMENTS.leagueModal.classList.toggle("active");
          }
          console.log('📋 МОДАЛКА лиг (общие билеты)');
        });
      }
    });

    // ✅ ticketsValueDisplay - цикл лиг
    [ELEMENTS.ticketsValueDisplayEl, ELEMENTS.ticketsIconSmall].forEach(el => {
      if (el) {
        el.style.cursor = "pointer";
        el.style.pointerEvents = "auto";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          UTILS.cycleLeague();
          console.log('🔄 Цикл лиг (твои билеты)');
        });
      }
    });

    // ✅ КНОПКИ ЛИГ В МОДАЛКЕ
    if (ELEMENTS.leagueModal) {
      ELEMENTS.leagueModal.querySelectorAll(".league-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const league = btn.dataset.league;
          UTILS.switchLeague(league);
          
          ELEMENTS.leagueModal.querySelectorAll(".league-btn")
            .forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          
          ELEMENTS.ticketsBalanceEl?.classList.toggle("active-league", league === "test");
          ELEMENTS.leagueModal.classList.remove("active");
        });
      });
      
      // Закрытие модалки кликом вне
      ELEMENTS.leagueModal.addEventListener('click', (e) => {
        if (e.target.classList.contains('league-modal')) {
          ELEMENTS.leagueModal.classList.remove('active');
        }
      });
    }

    if (ELEMENTS.randomCheckBoxEl) {
      ELEMENTS.randomCheckBoxEl.addEventListener("change", () => {
        STATE.isRandomMode = ELEMENTS.randomCheckBoxEl.checked;
        if (STATE.isRandomMode) PLAYER_SIMULATION.start();
        else PLAYER_SIMULATION.stop();
      });
    }

    if (ELEMENTS.debugCheckBoxEl) {
      ELEMENTS.debugCheckBoxEl.addEventListener("change", () => {
        STATE.isDebugMode = ELEMENTS.debugCheckBoxEl.checked;
        updateDisplay();
      });
    }

    if (ELEMENTS.randomMaxInputEl) {
      ELEMENTS.randomMaxInputEl.addEventListener("input", () => {
        const value = parseInt(ELEMENTS.randomMaxInputEl.value) || 1;
        STATE.randomMaxTickets = Math.max(1, Math.min(500, value));
        ELEMENTS.randomMaxInputEl.value = STATE.randomMaxTickets;
      });
    }

    if (ELEMENTS.leagueModal) {
      ELEMENTS.leagueModal.querySelectorAll(".league-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const league = btn.dataset.league;
          UTILS.switchLeague(league);
          
          ELEMENTS.leagueModal.querySelectorAll(".league-btn")
            .forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          if (ELEMENTS.ticketsBalanceEl) {
            ELEMENTS.ticketsBalanceEl.classList.toggle("active-league", league === "test");
          }
          ELEMENTS.leagueModal.classList.remove("active");
        });
      });
    }
  }

  function handleLeftClick() {
    const leagueState = STATE.leaguesState[STATE.currentLeague];
    if (leagueState.isRoundFinished || leagueState.isBetweenRounds || UTILS.getCurrentTicketsWhole() <= 0) return;

    const ticketsToBet = 1;
    if (ticketsToBet <= UTILS.getCurrentTicketsWhole()) {
      STATE.playerLeftTickets[STATE.currentLeague] += ticketsToBet;
      UTILS.setCurrentTicketsWhole(UTILS.getCurrentTicketsWhole() - ticketsToBet);
      UTILS.updateTicketsDisplay();
      updateDisplay();
    }
  }

  function handleRightClick() {
    const leagueState = STATE.leaguesState[STATE.currentLeague];
    if (leagueState.isRoundFinished || leagueState.isBetweenRounds || UTILS.getCurrentTicketsWhole() <= 0) return;

    const ticketsToBet = 1;
    if (ticketsToBet <= UTILS.getCurrentTicketsWhole()) {
      STATE.playerRightTickets[STATE.currentLeague] += ticketsToBet;
      UTILS.setCurrentTicketsWhole(UTILS.getCurrentTicketsWhole() - ticketsToBet);
      UTILS.updateTicketsDisplay();
      updateDisplay();
    }
  }

function nextRound() {
  const league = STATE.currentLeague;
  
  // ⭐ Если НЕ завершён раунд → ПРИНУДИТЕЛЬНО завершить ВСЕ лиги
  if (!STATE.leaguesState[league].isRoundFinished) {
    console.log('🔄 ПРИНУДИТЕЛЬНО завершаем ВСЕ раунды...');
    
    // Завершить ВСЕ лиги
    ['test', 'cash', 'ad'].forEach(l => {
      if (!STATE.leaguesState[l].isRoundFinished && !STATE.leaguesState[l].isBetweenRounds) {
        STATE.simulationLeftVotes = STATE.leaguesState[l].simulationLeftVotes;
        STATE.simulationRightVotes = STATE.leaguesState[l].simulationRightVotes;
        STATE.currentLeague = l; // Временно переключаемся
        ROUND.finish();
      }
    });
    
    // Вернуть текущую лигу
    STATE.currentLeague = league;
    updateDisplay();
    return;
  }
  
  // ⭐ Если раунд завершён → показать результаты ВСЕХ лиг → затем следующий раунд
  console.log('📊 Показываем результаты ВСЕХ лиг...');

  
  // Показать результаты всех лиг (1 секунда)
  let resultTimer = 0;
  const showResultsInterval = setInterval(() => {
    resultTimer++;
    const leagues = ['test', 'cash', 'ad'];
    const currentIndex = leagues.indexOf(STATE.currentLeague);
    const nextLeagueIndex = (currentIndex + 1) % 3;
    
    STATE.currentLeague = leagues[nextLeagueIndex];
    updateDisplay();
    
    if (resultTimer >= 3) { // Показать 3 лиги
      clearInterval(showResultsInterval);
      startNextRoundAllLeagues();
    }
  }, 1000);
}

function startNextRoundAllLeagues() {
  console.log('🚀 ЗАПУСК НОВЫХ РАУНДОВ ВО ВСЕХ ЛИГАХ');
  
  ['test', 'cash', 'ad'].forEach(league => {
    const leagueState = STATE.leaguesState[league];
    
    // Увеличиваем номер стола ТОЛЬКО при запуске нового раунда
    const data = LEAGUES[league];
    data.boardCurrent++;
    
    // Сброс состояния для нового раунда
    leagueState.isRoundFinished = false;
    leagueState.isBetweenRounds = false;
    leagueState.simulationLeftVotes = 0;
    leagueState.simulationRightVotes = 0;
    leagueState.timeLeft = CONSTANTS.ROUND_DURATION_SEC;
  });
  
  // Вернуть первую лигу и обновить
  STATE.currentLeague = 'test';
  UTILS.switchLeague('test');
  ELEMENTS.msg.textContent = "НОВЫЙ РАУНД!";
  updateDisplay();
  
  // Запустить симуляцию
  PLAYER_SIMULATION.start();
}


//═══════════════════════════════════════════════════
// 10. ИНИЦИАЛИЗАЦИЯ
//═══════════════════════════════════════════════════
function init() {
  if (window.STATE?.tgPlayer) {
    console.log('🚀 3.0.27 - ИГРА СТАРТ с cookies (@BvsWBot)');
    startGame();
  } else {
    window.addEventListener('gameReady', init);
    console.log('⏳ Ждём @BvsWBot авторизацию...');
    startGame();
  }
}

function startGame() {
  // ⭐ 1. ЗАГРУЗКА ПОЛНОГО СОСТОЯНИЯ
  COOKIE_MANAGER.loadAll();  // 1️⃣ Загрузка
  
  console.log('👤 Игрок:', window.STATE.tgPlayer);
  
  // ⭐ 2. ПРИМЕНЕНИЕ СОСТОЯНИЯ К UI
  UTILS.updateTicketsDisplay();
  UTILS.updateBalanceDisplay();
  
  // ⭐ 3. ОТКРЫТЬ ПОСЛЕДНЮЮ ЛИГУ + состояние
  UTILS.switchLeague(STATE.currentLeague);
  
  MASTER_TIMER.start();
  initTelegramPlayer();
  
  STATE.isRandomMode = true;
  STATE.isDebugMode = true;
  if (ELEMENTS.randomCheckBoxEl) ELEMENTS.randomCheckBoxEl.checked = true;
  if (ELEMENTS.debugCheckBoxEl) ELEMENTS.debugCheckBoxEl.checked = true;
  
  PLAYER_SIMULATION.start();
  initEventListeners();
  updateLeagueModalTickets();
  updateBoardNumbers();
  updateDisplay();
  
  // ⭐ 4. АВТОСЕЙВ
  setInterval(COOKIE_MANAGER.saveAll, 10000);
  window.addEventListener('beforeunload', COOKIE_MANAGER.saveAll);
  
  console.log('🎮 ИГРА ЗАГРУЖЕНА с ПОЛНЫМ состоянием!');
}


//═══════════════════════════════════════════════════
// 11. COOKIE MANAGER (ИСПРАВЛЕННЫЙ)  
//═══════════════════════════════════════════════════
const COOKIE_MANAGER = {
  saveAll() {
    UTILS.convertUsdR();
    
    const data = {
      version: STATE.cookies.version,
      lastUpdate: Date.now(),
      currentLeague: STATE.currentLeague,
      playerLeftTickets: STATE.playerLeftTickets,
      playerRightTickets: STATE.playerRightTickets,
      leaguesState: STATE.leaguesState,
      superfunds: STATE.superfunds,
      player: STATE.cookies.player
    };
    
    localStorage.setItem('BvsWGameState', JSON.stringify(data));
    console.log('💾 Сохранено:', data.currentLeague);
  },

  loadAll() {
    try {
      const data = localStorage.getItem('BvsWGameState');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.version === '1.1') {
          STATE.currentLeague = parsed.currentLeague || "test";
          STATE.playerLeftTickets = parsed.playerLeftTickets || { test: 0, cash: 0, ad: 0 };
          STATE.playerRightTickets = parsed.playerRightTickets || { test: 0, cash: 0, ad: 0 };
          
          ['test', 'cash', 'ad'].forEach(league => {
            STATE.leaguesState[league] = {
              ...STATE.leaguesState[league],
              ...parsed.leaguesState?.[league]
            };
          });
          
          STATE.cookies.player = { ...STATE.cookies.player, ...parsed.player };
          console.log('📂 Загружено:', STATE.currentLeague);
          return true;
        }
      }
    } catch(e) {
      console.error('❌ Cookies сброшены');
      localStorage.removeItem('BvsWGameState');
    }
    return false;
  },

  addUsdR(amount) {
    STATE.cookies.player.usdR += amount;
    if (STATE.cookies.player.usdR >= 100) UTILS.convertUsdR();
    COOKIE_MANAGER.saveAll();
  }
};

// 🔥 КОНЕЦ ФАЙЛА - ИНИЦИАЛИЗАЦИЯ
function init() {
  console.log('🚀 Инициализация v3.0.27');
  startGame();
}

init();  // ← АВТОЗАПУСК
