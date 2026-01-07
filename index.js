/**
 * Version: 3.0.24 - ✅ ПОЛНЫЙ ФИКС КЛИКОВ + ИКОНКИ!
 * - BetsIcon + BetsValueEl → МОДАЛКА (с stopPropagation)
 * - ticketsIconSmall + ticketsValueDisplayEl → ЦИКЛ лиг
 * - ГЛАДКИЙ счёт: МОИ + СИМУЛЯЦИЯ
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
      name: "TEST",
      ticketsWhole: 100, ticketsRemainder: 0,
      ticketIcon: "pic/Icon/tickets_test.svg",
      leftSticker: "pic/Stikers/4.1 fire.svg",
      rightSticker: "pic/Stikers/4.2 water.svg",
      boardStart: 1, boardCurrent: 1
    },
    cash: {
      name: "CASH", 
      ticketsWhole: 55, ticketsRemainder: 0,
      ticketIcon: "pic/Icon/tickets_wood.svg",
      leftSticker: "pic/Stikers/4.3 earth.svg",
      rightSticker: "pic/Stikers/4.4 air.svg",
      boardStart: 100, boardCurrent: 127
    },
    ad: {
      name: "AD",
      ticketsWhole: 103, ticketsRemainder: 0,
      ticketIcon: "pic/Icon/tickets_ads.svg",
      leftSticker: "pic/Stikers/4.5 lightning.svg",
      rightSticker: "pic/Stikers/4.6 shadow.svg",
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
    
    timeLeft: CONSTANTS.ROUND_DURATION_SEC,
    timerId: null,
    playerSimulationId: null,
    isRoundFinished: false,
    isBetweenRounds: false,

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
      return STATE.playerLeftTickets[STATE.currentLeague] + 
             STATE.playerRightTickets[STATE.currentLeague];
    },

    getTotalTickets() {
      return UTILS.getCurrentPlayerTickets() + 
             STATE.simulationLeftVotes + 
             STATE.simulationRightVotes;
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
      ELEMENTS.walletAmountEl.textContent = 
        `$${Math.floor(STATE.cashBalanceCents / CONSTANTS.USD_CENTS)}`;
    },

    switchLeague(league) {
      STATE.currentLeague = league;
      const data = UTILS.getLeagueData(league);
      
      UTILS.updateTicketsDisplay();
      
      if (ELEMENTS.ticketsIconSmall) ELEMENTS.ticketsIconSmall.src = data.ticketIcon;
      if (ELEMENTS.betsIcon) ELEMENTS.betsIcon.src = data.ticketIcon;
      
      if (ELEMENTS.leftSticker) ELEMENTS.leftSticker.src = data.leftSticker;
      if (ELEMENTS.rightSticker) ELEMENTS.rightSticker.src = data.rightSticker;
      
      ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;
      
      STATE.simulationLeftVotes = 0;
      STATE.simulationRightVotes = 0;
      
      updateDisplay();
      console.log(`🔄 Лига: ${league} | Всего билетов: ${UTILS.getTotalTickets()}`);
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
        if (STATE.isRoundFinished || STATE.isBetweenRounds) return;
        
        const side = Math.random() < 0.52 ? 'left' : 'right';
        const betAmount = Math.floor(Math.random() * 3) + 2;
        
        if (side === 'left') {
          STATE.simulationLeftVotes += betAmount;
        } else {
          STATE.simulationRightVotes += betAmount;
        }
        
        console.log(`📊 Симуляция: L:${STATE.simulationLeftVotes} R:${STATE.simulationRightVotes} | Всего: ${UTILS.getTotalTickets()}`);
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
  // 6. ЛОГИКА РАУНДА
  // ═════════════════════════════════════════════════════
  const ROUND = {
    reset() {
      STATE.isRoundFinished = false;
      STATE.simulationLeftVotes = 0;
      STATE.simulationRightVotes = 0;
      
      ELEMENTS.left.classList.remove("winner");
      ELEMENTS.right.classList.remove("winner");
      ELEMENTS.nextButton.disabled = true;
      ELEMENTS.msg.textContent = "Разместите ставки";
      
      const data = UTILS.getLeagueData();
      ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;
      STATE.timeLeft = CONSTANTS.ROUND_DURATION_SEC;
      
      updateDisplay();
    },

    startTimer() {
      if (STATE.timerId) clearInterval(STATE.timerId);
      STATE.timerId = setInterval(() => {
        STATE.timeLeft--;
        if (STATE.timeLeft <= 0 && !STATE.isRoundFinished && !STATE.isBetweenRounds) {
          ROUND.finish();
        }
        ELEMENTS.timerText.textContent = UTILS.formatTime(STATE.timeLeft);
      }, 1000);
    },

    finish() {
      STATE.isRoundFinished = true;
      clearInterval(STATE.timerId);
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
  // 7. ОБНОВЛЕНИЕ UI
  // ═════════════════════════════════════════════════════
  function updateDisplay() {
    const leftPlayerBets = STATE.playerLeftTickets[STATE.currentLeague];
    const rightPlayerBets = STATE.playerRightTickets[STATE.currentLeague];
    
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
    
    ELEMENTS.leftPercentEl.textContent = `${leftPercent}%`;
    ELEMENTS.rightPercentEl.textContent = `${rightPercent}%`;
  }

  // ═════════════════════════════════════════════════════
  // 8. ОБРАБОТЧИКИ СОБЫТИЙ - ✅ ФИКС КЛИКОВ!
  // ═════════════════════════════════════════════════════
  function initEventListeners() {
    // Стороны
    if (ELEMENTS.left) ELEMENTS.left.addEventListener("click", handleLeftClick);
    if (ELEMENTS.right) ELEMENTS.right.addEventListener("click", handleRightClick);
    if (ELEMENTS.nextButton) ELEMENTS.nextButton.addEventListener("click", nextRound);
    
    // ✅ ОБЩИЕ БИЛЕТЫ: Иконка + Цифра → МОДАЛКА
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

    // ✅ ТВОИ БИЛЕТЫ: Иконка + Цифра → ЦИКЛ лиг
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
    if (STATE.isRoundFinished || STATE.isBetweenRounds || UTILS.getCurrentTicketsWhole() <= 0) return;

    const ticketsToBet = 1;
    if (ticketsToBet <= UTILS.getCurrentTicketsWhole()) {
      STATE.playerLeftTickets[STATE.currentLeague] += ticketsToBet;
      UTILS.setCurrentTicketsWhole(UTILS.getCurrentTicketsWhole() - ticketsToBet);
      UTILS.updateTicketsDisplay();
      updateDisplay();
    }
  }

  function handleRightClick() {
    if (STATE.isRoundFinished || STATE.isBetweenRounds || UTILS.getCurrentTicketsWhole() <= 0) return;

    const ticketsToBet = 1;
    if (ticketsToBet <= UTILS.getCurrentTicketsWhole()) {
      STATE.playerRightTickets[STATE.currentLeague] += ticketsToBet;
      UTILS.setCurrentTicketsWhole(UTILS.getCurrentTicketsWhole() - ticketsToBet);
      UTILS.updateTicketsDisplay();
      updateDisplay();
    }
  }

  function nextRound() {
    const data = UTILS.getLeagueData();
    data.boardCurrent++;
    ELEMENTS.boardNumber.textContent = `#${data.boardCurrent}`;
    
    STATE.isBetweenRounds = true;
    STATE.timeLeft = CONSTANTS.BETWEEN_SEC;
    ELEMENTS.msg.textContent = "Следующий раунд...";
    ELEMENTS.nextButton.disabled = true;
    ROUND.startTimer();

    setTimeout(() => {
      STATE.isBetweenRounds = false;
      ROUND.reset();
    }, CONSTANTS.BETWEEN_SEC * 1000);
  }

  // ═════════════════════════════════════════════════════
  // 9. ИНИЦИАЛИЗАЦИЯ
  // ═════════════════════════════════════════════════════
  function init() {
    console.log('🚀 3.0.24 - ПОЛНАЯ ВЕРСИЯ С ФИКСОМ КЛИКОВ!');
    
    UTILS.updateTicketsDisplay();
    UTILS.updateBalanceDisplay();
    UTILS.switchLeague("test");
    ROUND.reset();
    ROUND.startTimer();

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
