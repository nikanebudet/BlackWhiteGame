/**
 * Version: 3.0.26 - ✅ ПАРАЛЛЕЛЬНЫЕ ТАЙМЕРЫ ЛИГ
 * - Каждая лига тикает независимо
 * - Переключение сохраняет состояние всех лиг
 */

(() => {
  // ═════════════════════════════════════════════════════
  // 1. DOM ЭЛЕМЕНТЫ
  // ═════════════════════════════════════════════════════
  const ELEMENTS = {
    left: document.getElementById("leftSide"),
    right: document.getElementById("rightSide"),
    msg: document.getElementById("message"),
    boardNumber: document.getElementById("boardNumber"),
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

  // ═════════════════════════════════════════════════════
  // 2. ЛИГИ
  // ═════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════
  // 3. КОНСТАНТЫ + STATE
  // ═════════════════════════════════════════════════════
  const CONSTANTS = {
    ROUND_DURATION_SEC: 570,
    BETWEEN_SEC: 30,
    USD_CENTS: 100
  };

  let STATE = {
    currentLeague: "test",
    cashBalanceCents: 12000,
    
    // ✅ СОСТОЯНИЕ КАЖДОЙ ЛИГИ (включая timeLeft)
    leaguesState: {
      test: { boardCurrent: 1, simulationLeftVotes: 0, simulationRightVotes: 0, timeLeft: 570, isRoundFinished: false, isBetweenRounds: false },
      cash: { boardCurrent: 127, simulationLeftVotes: 0, simulationRightVotes: 0, timeLeft: 570, isRoundFinished: false, isBetweenRounds: false },
      ad: { boardCurrent: 543, simulationLeftVotes: 0, simulationRightVotes: 0, timeLeft: 570, isRoundFinished: false, isBetweenRounds: false }
    },
    
    // ⭐ ГЛОБАЛЬНЫЕ таймеры для лиг
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

  // ═════════════════════════════════════════════════════
  // 4. УТИЛИТЫ
  // ═════════════════════════════════════════════════════
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

    updateBalanceDisplay() {
      ELEMENTS.walletAmountEl.textContent = `$${Math.floor(STATE.cashBalanceCents / CONSTANTS.USD_CENTS)}`;
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
      
      ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;
      
      // ⭐ Обновить отображаемый таймер
      ELEMENTS.timerText.textContent = UTILS.formatTime(leagueState.timeLeft);
      
      updateDisplay();
      
      // ⭐ Запустить симуляцию для новой лиги (если нужно)
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

    toFixedDown(value, decimals) {
      const factor = 10 ** decimals;
      return (Math.floor(value * factor) / factor).toFixed(decimals);
    },

    formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    }
  };

  // ═════════════════════════════════════════════════════
  // 5. СИМУЛЯЦИЯ ИГРОКОВ
  // ═════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════
  // 6. ГЛОБАЛЬНЫЙ МАСТЕР-ТАЙМЕР (тикает ВСЕ лиги)
  // ═════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════
  // 7. ЛОГИКА РАУНДА
  // ═════════════════════════════════════════════════════
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
      ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;
      leagueState.timeLeft = CONSTANTS.ROUND_DURATION_SEC;
      
      updateDisplay();
    },

    finish() {
      const league = STATE.currentLeague;
      STATE.leaguesState[league].isRoundFinished = true;
      
      PLAYER_SIMULATION.stop();
      
      const totalSimulation = STATE.simulationLeftVotes + STATE.simulationRightVotes || 1;
      const leftChance = STATE.simulationLeftVotes / totalSimulation;
      const isLeftWin = Math.random() < leftChance;

      if (isLeftWin) {
        ELEMENTS.left.classList.add("winner");
        ELEMENTS.msg.textContent = "ЛЕВЫЙ ВЫИГРАЛ!";
      } else {
        ELEMENTS.right.classList.add("winner");
        ELEMENTS.msg.textContent = "ПРАВЫЙ ВЫИГРАЛ!";
      }

      ELEMENTS.nextButton.disabled = false;
      updateDisplay();
    }
  };

  // ═════════════════════════════════════════════════════
  // 8. ОБНОВЛЕНИЕ UI
  // ═════════════════════════════════════════════════════
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

    const totalAll = UTILS.getTotalTickets() || 1;
    const leftPercent = UTILS.toFixedDown(((STATE.playerLeftTickets[STATE.currentLeague] + STATE.simulationLeftVotes) / totalAll) * 100, 0);
    const rightPercent = UTILS.toFixedDown(((STATE.playerRightTickets[STATE.currentLeague] + STATE.simulationRightVotes) / totalAll) * 100, 0);
    
    if (ELEMENTS.leftPercentEl) ELEMENTS.leftPercentEl.textContent = `${leftPercent}%`;
    if (ELEMENTS.rightPercentEl) ELEMENTS.rightPercentEl.textContent = `${rightPercent}%`;
  }

  // ═════════════════════════════════════════════════════
  // 9. ОБРАБОТЧИКИ СОБЫТИЙ
  // ═════════════════════════════════════════════════════
  function initEventListeners() {
    if (ELEMENTS.left) ELEMENTS.left.addEventListener("click", handleLeftClick);
    if (ELEMENTS.right) ELEMENTS.right.addEventListener("click", handleRightClick);
    if (ELEMENTS.nextButton) ELEMENTS.nextButton.addEventListener("click", nextRound);
    
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
    const data = UTILS.getLeagueData();
    data.boardCurrent++;
    LEAGUES[league].boardCurrent = data.boardCurrent;
    ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;
    
    STATE.leaguesState[league].isBetweenRounds = true;
    STATE.leaguesState[league].timeLeft = CONSTANTS.BETWEEN_SEC;
    ELEMENTS.msg.textContent = "Следующий раунд...";
    ELEMENTS.nextButton.disabled = true;

    setTimeout(() => {
      STATE.leaguesState[league].isBetweenRounds = false;
      ROUND.reset();
    }, CONSTANTS.BETWEEN_SEC * 1000);
  }

  // ═════════════════════════════════════════════════════
  // 10. ИНИЦИАЛИЗАЦИЯ
  // ═════════════════════════════════════════════════════
  function init() {
    console.log('🚀 3.0.26 - ПАРАЛЛЕЛЬНЫЕ ТАЙМЕРЫ ЛИГ!');
    
    UTILS.updateTicketsDisplay();
    UTILS.updateBalanceDisplay();
    UTILS.switchLeague("test");
    
    // ⭐ Запустить глобальный мастер-таймер
    MASTER_TIMER.start();
    
    STATE.isRandomMode = true;
    STATE.isDebugMode = true;
    if (ELEMENTS.randomCheckBoxEl) ELEMENTS.randomCheckBoxEl.checked = true;
    if (ELEMENTS.debugCheckBoxEl) ELEMENTS.debugCheckBoxEl.checked = true;
    
    PLAYER_SIMULATION.start();
    initEventListeners();
    updateDisplay();
  }

  // ✅ БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

