/* ════════════════════════════════════════════════════ */
/* index.js - Version: 4.0.0 - ПЕРЕСТРУКТУРИРОВАН     */
/* ✅ 12 БЛОКОВ | БЕЗ ДУБЛЕЙ | ФИКС БАГОВ | ЧИСТЫЙ КОД */
/* ════════════════════════════════════════════════════ *//*

cd /X/YandexDisk/Game/BlackWhite
git add .
git commit -m "Версия 3.0.26 js"
git push origin main


(() => {
 */


//═══════════════════════════════════════════════════════
// 0. КОНСТАНТЫ + ИНИЦИАЛИЗАЦИЯ
//═══════════════════════════════════════════════════════
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

//═══════════════════════════════════════════════════════
// 1. STATE + COOKIES
//═══════════════════════════════════════════════════════
const STATE = {
  currentLeague: "test",
  cashBalanceCents: 12000,
  tgPlayer: { id: null, username: null, photo: null },
  playerBets: { left: [], right: [] }, // ✅ ФИКС: добавлено
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
  randomMaxTickets: 200,
  cookies: {
    version: '1.3',
    lastUpdate: Date.now(),
    currentLeague: "test",
    playerLeftTickets: { test: 0, cash: 0, ad: 0 },
    playerRightTickets: { test: 0, cash: 0, ad: 0 },
    player: { id: null, username: null, avatar: null, usd: 120, usdR: 0, tickets: { test: 100, cash: 55, ad: 103 } },
    totalTickets: { test: 0, cash: 0, ad: 0 }
  }
};

//═══════════════════════════════════════════════════════
// 2. DOM ЭЛЕМЕНТЫ
//═══════════════════════════════════════════════════════
let ELEMENTS = {}; // ← ПУСТОЙ ОБЪЕКТ

function initElements() {

	ELEMENTS = {
	  left: document.getElementById("leftSide"),
	  right: document.getElementById("rightSide"),
	  msg: document.getElementById("message"),
	  boardNumbers: document.querySelectorAll('.board-number[data-league]'),
	  timerText: document.getElementById("timerText"),
	  nextButton: document.getElementById("nextButton"),

	  // ✅ ФИКС: правильные селекторы для финальных ставок
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

	  // Отладка
	  randomCheckBoxEl: document.getElementById("randomCheckBox"),
	  randomMaxInputEl: document.getElementById("randomMaxInput"),
	  debugCheckBoxEl: document.getElementById("showRandomCheckBox"),
	  leagueModal: document.getElementById("leagueModal"),

	  // ✅ ПРОГРЕССИВНЫЕ СТАВКИ
	  leftBetLoader: document.getElementById("leftBetLoader"),
	  rightBetLoader: document.getElementById("rightBetLoader"),
	  leftBetMain: document.getElementById("leftBetMain"),
	  rightBetMain: document.getElementById("rightBetMain"),
	  leftBetList: document.getElementById("leftBetList"),
	  rightBetList: document.getElementById("rightBetList"),

	  leftSticker: document.querySelector("#leftSide .sticker"),
	  rightSticker: document.querySelector("#rightSide .sticker")
	};
  console.log('✅ ELEMENTS:', Object.keys(ELEMENTS).length, 'элементов');
}
//═══════════════════════════════════════════════════════
// 3. ЛИГИ (LEAGUES)
//═══════════════════════════════════════════════════════
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

//═══════════════════════════════════════════════════════
// 4. УТИЛИТЫ (UTILS)
//═══════════════════════════════════════════════════════
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

  // ✅ ЕДИНАЯ ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ЛИГ (без дублей!)
  switchLeague(league) {
    const prevLeague = STATE.currentLeague;

    // Остановить симуляцию предыдущей лиги
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

    ELEMENTS.timerText.textContent = UTILS.formatTime(leagueState.timeLeft);
    updateDisplay();
    updateBoardNumbers();

    // Запустить симуляцию для новой лиги
    if (STATE.isRandomMode && !leagueState.isRoundFinished && !leagueState.isBetweenRounds) {
      PLAYER_SIMULATION.start();
    }

    console.log(`🔄 Лига: ${league} | #${data.boardCurrent} | ${UTILS.formatTime(leagueState.timeLeft)}`);
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

  // USD-R КОНВЕРТЕР
  convertUsdR() {
    if (STATE.cookies.player.usdR >= 100) {
      const extraUsd = Math.floor(STATE.cookies.player.usdR / 100);
      STATE.cookies.player.usd += extraUsd;
      STATE.cookies.player.usdR = STATE.cookies.player.usdR % 100;
    }
  },

  getBalanceDisplay() {
    UTILS.convertUsdR();
    return `${STATE.cookies.player.usd}.${STATE.cookies.player.usdR.toString().padStart(2, '0')}`;
  },

  updateBalanceDisplay() {
    UTILS.convertUsdR();
    ELEMENTS.walletAmountEl.textContent = `$${STATE.cookies.player.usd}.${STATE.cookies.player.usdR.toString().padStart(2, '0')}`;
  }
};

//═══════════════════════════════════════════════════════
// 5. TELEGRAM PLAYER
//═══════════════════════════════════════════════════════
function initTelegramPlayer() {
  if (window.STATE?.tgPlayer) {
    STATE.tgPlayer = window.STATE.tgPlayer;
    updateTGDisplay();
  } else if (Telegram?.WebApp?.initDataUnsafe?.player) {
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

//═══════════════════════════════════════════════════════
// 6. МАСТЕР ТАЙМЕР
//═══════════════════════════════════════════════════════
const MASTER_TIMER = {
  id: null,

  start() {
    if (MASTER_TIMER.id) return;

    MASTER_TIMER.id = setInterval(() => {
      ['test', 'cash', 'ad'].forEach(league => {
        const state = STATE.leaguesState[league];
        if (!state.isRoundFinished && !state.isBetweenRounds && state.timeLeft > 0) {
          state.timeLeft--;

          if (league === STATE.currentLeague) {
            ELEMENTS.timerText.textContent = UTILS.formatTime(state.timeLeft);

            if (state.timeLeft <= 0) {
              ROUND.finish();
            }
          }
        }
      });
    }, 1000);
  }
};

//═══════════════════════════════════════════════════════
// 7. СИМУЛЯЦИЯ ИГРОКОВ
//═══════════════════════════════════════════════════════
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

//═══════════════════════════════════════════════════════
// 8. СУПЕРФОНДЫ
//═══════════════════════════════════════════════════════
const SUPERFUNDS = {
  isEnabled(league) {
    const funds = STATE.superfunds[league];
    return Object.values(funds).some(value => value > 0);
  },

  distribute(league, totalBets) {
    const funds = STATE.superfunds[league];
    CONSTANTS.SUPERFUNDS_DEFAULT.forEach((fundSize, index) => {
      const percentage = CONSTANTS.SUPERFUNDS_SPLIT[index] || 0;
      if (percentage > 0) {
        const share = Math.floor(totalBets * (percentage / 100));
        const fundKey = `${fundSize}`;
        funds[fundKey] += share;
      }
    });
    console.log(`💰 Суперфонды [${league}]:`, funds);
  }
};

//═══════════════════════════════════════════════════════
// 9. ЛОГИКА РАУНДОВ
//═══════════════════════════════════════════════════════
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

    if (totalBets < CONSTANTS.MIN_BETS_TRIGGER) {
      leagueState.isRoundFinished = false;
      leagueState.timeLeft = CONSTANTS.EXTRA_ROUND_SEC;
      ELEMENTS.msg.textContent = "Мало ставок! Продлеваем раунд...";
      ELEMENTS.nextButton.disabled = true;

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

    if (leftPercent < CONSTANTS.WIN_THRESHOLD) {
      ELEMENTS.left.classList.add("winner");
      ELEMENTS.right.classList.remove("winner");
      ELEMENTS.msg.textContent = "ЛЕВЫЙ ВЫИГРАЛ! (упорная борьба)";
    } 
    else if (rightPercent < CONSTANTS.WIN_THRESHOLD) {
      ELEMENTS.right.classList.add("winner");
      ELEMENTS.left.classList.remove("winner");
      ELEMENTS.msg.textContent = "ПРАВЫЙ ВЫИГРАЛ! (упорная борьба)";
    } 
    else {
      ELEMENTS.left.classList.remove("winner");
      ELEMENTS.right.classList.remove("winner");
      ELEMENTS.msg.textContent = "СТОЛ В СУПЕРФОНДЫ!";
      SUPERFUNDS.distribute(league, totalBets);
    }

    ELEMENTS.nextButton.disabled = false;
    updateDisplay();
  }
};

//═══════════════════════════════════════════════════════
// 10. ПРОГРЕССИВНЫЕ СТАВКИ
//═══════════════════════════════════════════════════════
function showBetLoading(side) {
  const loader = document.getElementById(`${side}BetLoader`);
  const main = document.getElementById(`${side}BetMain`);
  const list = document.getElementById(`${side}BetList`);

  loader?.classList.remove('hidden');
  main?.classList.add('hidden');
  list?.classList.add('hidden');
}

function showFirstBet(side, tableId) {
  const loader = document.getElementById(`${side}BetLoader`);
  const main = document.getElementById(`${side}BetMain`);
  const list = document.getElementById(`${side}BetList`);
  const tableNum = main?.querySelector('.table-number');
  const betAmt = main?.querySelector('.bet-amount');

  loader?.classList.add('hidden');
  main?.classList.remove('hidden');
  list?.classList.add('hidden');

  tableNum.textContent = `#${tableId.toString().padStart(3, '0')}`;
  betAmt.textContent = '1';
}

function addBetToList(side, tableId, amount, betIndex) {
  const list = document.getElementById(`${side}BetList`);
  const betItem = document.createElement('div');
  betItem.className = `bet-item ${betIndex === 1 ? 'first' : betIndex === 2 ? 'second' : 'later'}`;
  betItem.innerHTML = `#${tableId.toString().padStart(3, '0')}: ${amount}`;
  betItem.style.cursor = 'grab';

  list.appendChild(betItem);
  list.scrollTop = list.scrollHeight;

  if (betIndex >= 2) {
    document.getElementById(`${side}BetMain`).classList.add('hidden');
    list.classList.remove('hidden');
  }
}

function onBetSuccess(tableId, ticketsLeft, side) {
  UTILS.setCurrentTicketsWhole(ticketsLeft);
  UTILS.updateTicketsDisplay();

  const betCount = (STATE.playerBets?.[side]?.length || 0) + 1;

  if (betCount === 1) {
    showFirstBet(side, tableId);
  } else {
    addBetToList(side, tableId, 1, betCount);
  }

  STATE.playerBets[side] = STATE.playerBets[side] || [];
  STATE.playerBets[side].push({ tableId, amount: 1 });

  COOKIE_MANAGER.saveAll();
}

//═══════════════════════════════════════════════════════
// 11. UI ОБНОВЛЕНИЕ
//═══════════════════════════════════════════════════════
function updateBoardNumbers() {
  ELEMENTS.boardNumbers.forEach(boardEl => {
    const league = boardEl.dataset.league;
    boardEl.textContent = `#${LEAGUES[league].boardCurrent}`;

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

  // Финальные ставки (не taps!)
  ELEMENTS.leftFinalBetsValueEl.textContent = leftPlayerBets + STATE.simulationLeftVotes;
  ELEMENTS.rightFinalBetsValueEl.textContent = rightPlayerBets + STATE.simulationRightVotes;

  ELEMENTS.leftFinalBetsEl.classList.toggle("hidden", leftPlayerBets + STATE.simulationLeftVotes === 0);
  ELEMENTS.rightFinalBetsEl.classList.toggle("hidden", rightPlayerBets + STATE.simulationRightVotes === 0);

  ELEMENTS.BetsValueEl.textContent = UTILS.getTotalTickets();

  // Проценты (гарантированно 100%)
  const totalAll = UTILS.getTotalTickets() || 1;
  const leftPercentRaw = ((leftPlayerBets + STATE.simulationLeftVotes) / totalAll) * 100;
  const leftPercent = leftPercentRaw < 50 ? Math.floor(leftPercentRaw) : Math.ceil(leftPercentRaw);
  const rightPercent = 100 - leftPercent;

  ELEMENTS.leftPercentEl.textContent = `${leftPercent}%`;
  ELEMENTS.rightPercentEl.textContent = `${rightPercent}%`;

  // Отладочный режим
  if (STATE.isDebugMode) {
    ELEMENTS.leftPercentEl.classList.remove("hidden");
    ELEMENTS.rightPercentEl.classList.remove("hidden");
    ELEMENTS.nextButton.style.display = "block";
    ELEMENTS.msg.parentElement.style.display = "flex";
  } else {
    ELEMENTS.leftPercentEl.classList.add("hidden");
    ELEMENTS.rightPercentEl.classList.add("hidden");
    ELEMENTS.nextButton.style.display = "none";
    ELEMENTS.msg.style.display = "none";
  }

  // Динамический текст кнопки
  ELEMENTS.nextButton.textContent = leagueState.isRoundFinished ? "СЛЕДУЮЩИЙ РАУНД" : "ЗАВЕРШИТЬ РАУНД";

  updateLeagueModalTickets();
  updateBoardNumbers();
  UTILS.updateBalanceDisplay();
}

//═══════════════════════════════════════════════════════
// 12. COOKIE MANAGER + СОБЫТИЯ + ИНИЦИАЛИЗАЦИЯ
//═══════════════════════════════════════════════════════
const COOKIE_MANAGER = {
  saveAll() {
    UTILS.convertUsdR();

    const saveData = {
      version: '1.3',
      timestamp: Date.now(),
      currentLeague: STATE.currentLeague,
      ticketsWhole: {
        test: UTILS.getLeagueData('test').ticketsWhole,
        cash: UTILS.getLeagueData('cash').ticketsWhole,
        ad: UTILS.getLeagueData('ad').ticketsWhole
      },
      playerLeftTickets: { ...STATE.playerLeftTickets },
      playerRightTickets: { ...STATE.playerRightTickets },
      leaguesState: { ...STATE.leaguesState },
      player: STATE.cookies.player,
      superfunds: { ...STATE.superfunds },
      playerBets: STATE.playerBets // ✅ Сохранение ставок
    };

    localStorage.setItem('BvsWGameState', JSON.stringify(saveData));
  },

  loadAll() {
    try {
      const data = localStorage.getItem('BvsWGameState');
      if (!data) return false;

      const parsed = JSON.parse(data);

      if (Date.now() - parsed.timestamp > 10 * 60 * 1000 || parsed.version !== '1.3') {
        localStorage.removeItem('BvsWGameState');
        return false;
      }

      ['test', 'cash', 'ad'].forEach(league => {
        UTILS.getLeagueData(league).ticketsWhole = parsed.ticketsWhole[league] || 100;
      });

      if (STATE.isDebugMode) {
        STATE.playerLeftTickets = parsed.playerLeftTickets || { test: 0, cash: 0, ad: 0 };
        STATE.playerRightTickets = parsed.playerRightTickets || { test: 0, cash: 0, ad: 0 };
        STATE.playerBets = parsed.playerBets || { left: [], right: [] };
      }

      STATE.currentLeague = parsed.currentLeague || 'test';
      STATE.leaguesState = parsed.leaguesState || STATE.leaguesState;
      STATE.cookies.player = parsed.player || STATE.cookies.player;
      STATE.superfunds = parsed.superfunds || STATE.superfunds;

      console.log('✅ Cookies загружены');
      return true;
    } catch (e) {
      console.error('❌ Ошибка cookies:', e);
      return false;
    }
  }
};

function initEventListeners() {
  // TG Player info
  document.getElementById('tgPlayerInfo')?.addEventListener('click', () => {
    if (STATE.tgPlayer.id) {
      Telegram?.WebApp?.showAlert(`ID: ${STATE.tgPlayer.id}\n@${STATE.tgPlayer.username}`);
    }
  });

  // Основные клики
  ELEMENTS.left?.addEventListener("click", handleLeftClick);
  ELEMENTS.right?.addEventListener("click", handleRightClick);
  ELEMENTS.nextButton?.addEventListener("click", nextRound);

  // ✅ ЕДИНЫЙ ОБРАБОТЧИК ЛИГ (без дублей!)
  document.querySelectorAll('[data-league], .tickets-value, .tickets-icon-small').forEach(el => {
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const league = e.currentTarget.dataset.league || STATE.currentLeague;
      UTILS.switchLeague(league);
      ELEMENTS.leagueModal?.classList.remove('active');
    });
  });

  // Модалка лиг
  ELEMENTS.leagueModal?.querySelectorAll(".league-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const league = btn.dataset.league;
      UTILS.switchLeague(league);
      ELEMENTS.leagueModal.querySelectorAll(".league-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      ELEMENTS.leagueModal.classList.remove("active");
    });
  });

  ELEMENTS.leagueModal?.addEventListener('click', (e) => {
    if (e.target.classList.contains('league-modal')) {
      ELEMENTS.leagueModal.classList.remove('active');
    }
  });

  // Общие билеты → модалка
  [ELEMENTS.BetsValueEl, ELEMENTS.betsIcon].forEach(el => {
    if (el) {
      el.style.cursor = "pointer";
      el.style.pointerEvents = "auto";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        ELEMENTS.leagueModal?.classList.toggle("active");
      });
    }
  });

  // Отладка
  ELEMENTS.randomCheckBoxEl?.addEventListener("change", () => {
    STATE.isRandomMode = ELEMENTS.randomCheckBoxEl.checked;
    if (STATE.isRandomMode) PLAYER_SIMULATION.start();
    else PLAYER_SIMULATION.stop();
  });

  ELEMENTS.debugCheckBoxEl?.addEventListener("change", () => {
    STATE.isDebugMode = ELEMENTS.debugCheckBoxEl.checked;
    updateDisplay();
  });

  ELEMENTS.randomMaxInputEl?.addEventListener("input", () => {
    const value = parseInt(ELEMENTS.randomMaxInputEl.value) || 1;
    STATE.randomMaxTickets = Math.max(1, Math.min(500, value));
    ELEMENTS.randomMaxInputEl.value = STATE.randomMaxTickets;
  });
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
    COOKIE_MANAGER.saveAll();
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
    COOKIE_MANAGER.saveAll();
  }
}

function nextRound() {
  const league = STATE.currentLeague;

  if (!STATE.leaguesState[league].isRoundFinished) {
    console.log('🔄 ПРИНУДИТЕЛЬНО завершаем ВСЕ раунды...');
    ['test', 'cash', 'ad'].forEach(l => {
      if (!STATE.leaguesState[l].isRoundFinished && !STATE.leaguesState[l].isBetweenRounds) {
        STATE.simulationLeftVotes = STATE.leaguesState[l].simulationLeftVotes;
        STATE.simulationRightVotes = STATE.leaguesState[l].simulationRightVotes;
        STATE.currentLeague = l;
        ROUND.finish();
      }
    });
    STATE.currentLeague = league;
    updateDisplay();
    return;
  }

  let resultTimer = 0;
  const showResultsInterval = setInterval(() => {
    resultTimer++;
    const leagues = ['test', 'cash', 'ad'];
    const currentIndex = leagues.indexOf(STATE.currentLeague);
    const nextLeagueIndex = (currentIndex + 1) % 3;

    STATE.currentLeague = leagues[nextLeagueIndex];
    updateDisplay();

    if (resultTimer >= 3) {
      clearInterval(showResultsInterval);
      startNextRoundAllLeagues();
    }
  }, 1000);
}

function startNextRoundAllLeagues() {
  console.log('🚀 ЗАПУСК НОВЫХ РАУНДОВ ВО ВСЕХ ЛИГАХ');

  ['test', 'cash', 'ad'].forEach(league => {
    const data = LEAGUES[league];
    const leagueState = STATE.leaguesState[league];

    data.boardCurrent++;
    leagueState.isRoundFinished = false;
    leagueState.isBetweenRounds = false;
    leagueState.simulationLeftVotes = 0;
    leagueState.simulationRightVotes = 0;
    leagueState.timeLeft = CONSTANTS.ROUND_DURATION_SEC;
  });

  UTILS.switchLeague('test');
  ELEMENTS.msg.textContent = "НОВЫЙ РАУНД!";
  PLAYER_SIMULATION.start();
}

function updateLeagueModalTickets() {
  ELEMENTS.leagueModal?.querySelectorAll('.league-btn').forEach(btn => {
    const league = btn.dataset.league;
    const prevLeague = STATE.currentLeague;
    STATE.currentLeague = league;
    const ticketsRemain = UTILS.getCurrentTicketsWhole();
    STATE.currentLeague = prevLeague;

    const ticketsEl = btn.querySelector('.league-tickets');
    ticketsEl.textContent = ticketsRemain;

    if (ticketsRemain <= 0) {
      btn.classList.add('disabled');
    } else {
      btn.classList.remove('disabled');
    }
  });
}

// 🎮 ИНИЦИАЛИЗАЦИЯ
window.addEventListener('gameReady', () => {
  console.log('🎮 Black vs White v4.0.0 - ИНИЦИАЛИЗАЦИЯ');
  
  COOKIE_MANAGER.loadAll();
  initTelegramPlayer();
  initEventListeners();
  UTILS.switchLeague(STATE.currentLeague);
  MASTER_TIMER.start();
  updateDisplay();
  
  if (STATE.isRandomMode) {
    PLAYER_SIMULATION.start();
  }
});
