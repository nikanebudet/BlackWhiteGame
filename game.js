// game.js
import { gameConfig } from "gameConfig.js";

const left = document.getElementById("leftSide");
const right = document.getElementById("rightSide");
const msg = document.getElementById("message");

const gameHeaderText = document.getElementById("gameHeaderText");
const roundText = document.getElementById("roundText");
const timerText = document.getElementById("timerText");
const nextButton = document.getElementById("nextButton");

const leftTapsEl = document.getElementById("leftTaps");
const rightTapsEl = document.getElementById("rightTaps");
const leftTapsValueEl = document.getElementById("leftTapsValue");
const rightTapsValueEl = document.getElementById("rightTapsValue");

const leftRandomEl = document.getElementById("leftRandom");
const rightRandomEl = document.getElementById("rightRandom");
const leftRandomValueEl = document.getElementById("leftRandomValue");
const rightRandomValueEl = document.getElementById("rightRandomValue");

const ticketsBalanceEl = document.getElementById("ticketsBalance");
const walletAmountEl = document.getElementById("walletAmount");
const centerBetsEl = document.getElementById("centerBets");

const randomToggleEl = document.getElementById("randomToggle");
const randomMaxInputEl = document.getElementById("randomMaxInput");
const showRandomToggleEl = document.getElementById("showRandomToggle");

const ROUND_DURATION_SEC = gameConfig.roundDurationSec;
const BETWEEN_SEC = gameConfig.betweenSec;

const USD_CENTS = 100;
const TICKET_PRICE_CENTS = gameConfig.ticketPriceCents;

// комиссия берётся из конфига (может быть изменена админкой до старта игры)
let FEES_PERCENT = gameConfig.feesPercent;

// утилита: жёсткое обрезание вниз до decimals знаков
function toFixedDown(value, decimals) {
  const factor = 10 ** decimals;
  const floored = Math.floor(value * factor) / factor;
  return floored.toFixed(decimals);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

let currentLeague = "test";

// -------- билеты по лигам: целые + остатки (в сотых) --------

let testTicketsWhole = 100;
let testTicketRemainder = 0;

let cashTicketsWhole = 0;
let cashTicketRemainder = 0;

let adTicketsWhole = 0;
let adTicketRemainder = 0;

let adWinTicketsWhole = 0;
let adWinTicketRemainder = 0;

// деньги
let cashBalanceCents = 0;
let gameBudgetCents = 0;

// -------- состояние раунда --------

let currentRound = 1;
let selectedSide = null;
let timeLeft = ROUND_DURATION_SEC;
let timerId = null;

let isRoundFinished = false;
let isBetweenRounds = false;

let leftVotes = 0;
let rightVotes = 0;

let playerLeftTickets = 0;
let playerRightTickets = 0;

let randomLeft = 0;
let randomRight = 0;

let ticketsPerTap = 1;
let isRandomMode = false;
let randomMaxTickets = 2;
let showRandom = false;

let lastRoundWinDisplay = "0.00";

// -------- билеты: геттеры/сеттеры --------

function getCurrentTicketsWhole() {
  if (currentLeague === "test") return testTicketsWhole;
  if (currentLeague === "cash") return cashTicketsWhole;
  if (currentLeague === "ad") return adTicketsWhole;
  return 0;
}

function setCurrentTicketsWhole(value) {
  const v = Math.max(0, Math.floor(value));
  if (currentLeague === "test") testTicketsWhole = v;
  if (currentLeague === "cash") cashTicketsWhole = v;
  if (currentLeague === "ad") adTicketsWhole = v;
}

function getCurrentTicketRemainder() {
  if (currentLeague === "test") return testTicketRemainder;
  if (currentLeague === "cash") return cashTicketRemainder;
  if (currentLeague === "ad") return adTicketRemainder;
  return 0;
}

function setCurrentTicketRemainder(value) {
  let v = Math.max(0, Math.floor(value));
  let wholeAdd = 0;
  if (v >= 100) {
    wholeAdd = Math.floor(v / 100);
    v = v % 100;
  }

  if (currentLeague === "test") {
    testTicketsWhole += wholeAdd;
    testTicketRemainder = v;
  } else if (currentLeague === "cash") {
    cashTicketsWhole += wholeAdd;
    cashTicketRemainder = v;
  } else if (currentLeague === "ad") {
    adTicketsWhole += wholeAdd;
    adTicketRemainder = v;
  }
}

// добавить дробные билеты к балансу лиги (ticketsFloat может быть дробным)
function addTicketsWithRemainder(league, ticketsFloat) {
  const totalHundredths = Math.floor(ticketsFloat * 100);
  const whole = Math.floor(totalHundredths / 100);
  const rem = totalHundredths % 100;

  if (league === "test") {
    testTicketsWhole += whole;
    testTicketRemainder += rem;
    if (testTicketRemainder >= 100) {
      const extra = Math.floor(testTicketRemainder / 100);
      testTicketRemainder = testTicketRemainder % 100;
      testTicketsWhole += extra;
    }
  } else if (league === "cash") {
    cashTicketsWhole += whole;
    cashTicketRemainder += rem;
    if (cashTicketRemainder >= 100) {
      const extra = Math.floor(cashTicketRemainder / 100);
      cashTicketRemainder = cashTicketRemainder % 100;
      cashTicketsWhole += extra;
    }
  } else if (league === "ad") {
    adTicketsWhole += whole;
    adTicketRemainder += rem;
    if (adTicketRemainder >= 100) {
      const extra = Math.floor(adTicketRemainder / 100);
      adTicketRemainder = adTicketRemainder % 100;
      adTicketsWhole += extra;
    }
  }
}

function refundPlayerBetsIfNeeded() {
  const totalPlayerTickets = playerLeftTickets + playerRightTickets;
  if (totalPlayerTickets <= 0) return;

  const current = getCurrentTicketsWhole();
  setCurrentTicketsWhole(current + totalPlayerTickets);
}

// отображение билетов: целые + десятые, если remainder >= 10
function getLeagueTicketsDisplay(league) {
  let whole, rem;

  if (league === "test") {
    whole = testTicketsWhole;
    rem = testTicketRemainder;
  } else if (league === "cash") {
    whole = cashTicketsWhole;
    rem = cashTicketRemainder;
  } else if (league === "ad") {
    whole = adTicketsWhole;
    rem = adTicketRemainder;
  } else {
    return "0";
  }

  if (rem < 10) return whole.toString();

  const tenths = Math.floor(rem / 10);
  return `${whole}.${tenths}`;
}

// -------- рендеры --------

function renderBalance() {
  const valueEl = ticketsBalanceEl.querySelector(".tickets-value");
  const ticketsStr = getLeagueTicketsDisplay(currentLeague);
  valueEl.textContent = ticketsStr;

  const dollars = (cashBalanceCents / USD_CENTS).toFixed(2);
  walletAmountEl.textContent = `$${dollars}`;
}

function renderGameBudgetHeader() {
  if (!gameHeaderText) return;
  const gameDollars = (gameBudgetCents / USD_CENTS).toFixed(2);
  gameHeaderText.textContent = `Игра: $${gameDollars}`;
}

// -------- рандом --------

function randomIntToMax(max) {
  if (max <= 0) return 0;
  return Math.floor(Math.random() * (max + 1));
}

function renderRandomSideInfo() {
  if (showRandom && randomLeft > 0) {
    leftRandomValueEl.textContent = randomLeft.toString();
    leftRandomEl.classList.remove("hidden");
  } else {
    leftRandomValueEl.textContent = "";
    leftRandomEl.classList.add("hidden");
  }

  if (showRandom && randomRight > 0) {
    rightRandomValueEl.textContent = randomRight.toString();
    rightRandomEl.classList.remove("hidden");
  } else {
    rightRandomValueEl.textContent = "";
    rightRandomEl.classList.add("hidden");
  }
}

function setupRandomOpponent() {
  randomLeft = 0;
  randomRight = 0;

  if (!isRandomMode) {
    renderRandomSideInfo();
    const total = leftVotes + rightVotes;
    centerBetsEl.textContent = total.toString();
    return;
  }

  const val = randomMaxInputEl.valueAsNumber;
  const maxTickets = Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 2;
  randomMaxTickets = maxTickets;

  const totalRandom = randomIntToMax(randomMaxTickets);
  if (totalRandom === 0) {
    const total = leftVotes + rightVotes;
    centerBetsEl.textContent = total.toString();
    renderRandomSideInfo();
    return;
  }

  for (let i = 0; i < totalRandom; i++) {
    if (Math.random() < 0.5) randomLeft += 1;
    else randomRight += 1;
  }

  leftVotes += randomLeft;
  rightVotes += randomRight;

  if (playerLeftTickets > 0) {
    leftTapsValueEl.textContent = playerLeftTickets.toString();
    leftTapsEl.classList.remove("hidden");
  } else {
    leftTapsValueEl.textContent = "";
    leftTapsEl.classList.add("hidden");
  }

  if (playerRightTickets > 0) {
    rightTapsValueEl.textContent = playerRightTickets.toString();
    rightTapsEl.classList.remove("hidden");
  } else {
    rightTapsValueEl.textContent = "";
    rightTapsEl.classList.add("hidden");
  }

  const total = leftVotes + rightVotes;
  centerBetsEl.textContent = total.toString();

  renderRandomSideInfo();
}

function renderRound() {
  renderGameBudgetHeader();

  roundText.textContent = `#${currentRound}`;
  timerText.textContent = formatTime(timeLeft);

  left.classList.remove("active", "winner");
  right.classList.remove("active", "winner");

  selectedSide = null;
  leftVotes = 0;
  rightVotes = 0;
  playerLeftTickets = 0;
  playerRightTickets = 0;
  randomLeft = 0;
  randomRight = 0;

  leftTapsValueEl.textContent = "";
  rightTapsValueEl.textContent = "";
  leftTapsEl.classList.add("hidden");
  rightTapsEl.classList.add("hidden");

  centerBetsEl.textContent = "0";

  renderBalance();

  lastRoundWinDisplay = "0.00";
  msg.textContent = "";
  renderRandomSideInfo();
  setupRandomOpponent();
}

// -------- таймер --------

function tick() {
  timeLeft -= 1;
  timerText.textContent = formatTime(timeLeft);

  if (timeLeft <= 0) {
    clearInterval(timerId);
    timerId = null;

    if (!isRoundFinished && !isBetweenRounds) {
      finishRound();
    } else if (isBetweenRounds) {
      isBetweenRounds = false;
      currentRound += 1;
      startRound();
    }
  }
}

function startRound() {
  // обновить локальный FEES_PERCENT на случай, если админка его изменила до старта нового раунда
  FEES_PERCENT = gameConfig.feesPercent;

  timeLeft = ROUND_DURATION_SEC;
  isRoundFinished = false;
  isBetweenRounds = false;
  renderRound();

  if (timerId) clearInterval(timerId);
  timerId = setInterval(tick, 1000);

  nextButton.textContent = "Завершить раунд";
}

function startBetweenRoundsCountdown() {
  isBetweenRounds = true;
  timeLeft = BETWEEN_SEC;
  timerText.textContent = formatTime(timeLeft);

  if (timerId) clearInterval(timerId);
  timerId = setInterval(tick, 1000);
}

// -------- расчёт раунда --------

function finishRound() {
  isRoundFinished = true;
  nextButton.textContent = "Следующий раунд";

  const totalVotes = leftVotes + rightVotes;
  const roundHappened = totalVotes >= 3;

  if (
    !roundHappened ||
    (leftVotes === 0 && rightVotes === 0) ||
    leftVotes === rightVotes
  ) {
    refundPlayerBetsIfNeeded();
    renderBalance();
    lastRoundWinDisplay = "0.00";
    msg.textContent = "Раунд не состоялся";

    startRound();
    return;
  }

  const winner = leftVotes < rightVotes ? "left" : "right";

  left.classList.remove("winner");
  right.classList.remove("winner");
  if (winner === "left") left.classList.add("winner");
  else right.classList.add("winner");

  const totalStakeHundredths = totalVotes * 100;
  const feesHundredthsFloat = totalStakeHundredths * FEES_PERCENT;
  const feesHundredths = Math.floor(feesHundredthsFloat);
  const prizeFundHundredths = totalStakeHundredths - feesHundredths;
  const prizeFundTicketsFloat = prizeFundHundredths / 100;

  const winnerTotalTickets = winner === "left" ? leftVotes : rightVotes;
  const playerWinnerTickets =
    winner === "left" ? playerLeftTickets : playerRightTickets;

  let formulaText = "";

  if (winnerTotalTickets > 0) {
    const prizePerTicket = prizeFundTicketsFloat / winnerTotalTickets;
    const prizePerTicketDisplay = toFixedDown(prizePerTicket, 1);
    formulaText =
      `(${totalVotes} - ${toFixedDown(
        feesHundredths / 100,
        2
      )}) / ${winnerTotalTickets} = ` +
      `${prizePerTicketDisplay} билета за 1 билет`;
  }

  if (playerWinnerTickets > 0 && winnerTotalTickets > 0) {
    const prizePerTicket = prizeFundTicketsFloat / winnerTotalTickets;
    const winTicketsFloat = playerWinnerTickets * prizePerTicket;

    if (currentLeague === "test") {
      addTicketsWithRemainder("test", winTicketsFloat);
      lastRoundWinDisplay = toFixedDown(winTicketsFloat, 2);
    } else if (currentLeague === "cash") {
      const winCentsFloat = winTicketsFloat * TICKET_PRICE_CENTS;
      const winCentsPlayer = Math.floor(winCentsFloat);
      const centsRemainder = winCentsFloat - winCentsPlayer;

      if (centsRemainder > 0) {
        gameBudgetCents += Math.floor(centsRemainder);
      }

      cashBalanceCents += winCentsPlayer;
      lastRoundWinDisplay = toFixedDown(winCentsPlayer / USD_CENTS, 2);
    } else if (currentLeague === "ad") {
      addTicketsWithRemainder("ad", winTicketsFloat);
      lastRoundWinDisplay = toFixedDown(winTicketsFloat, 2);
    }
  } else {
    lastRoundWinDisplay = "0.00";
  }

  renderBalance();

  if (formulaText) {
    msg.textContent = `${lastRoundWinDisplay} | ${formulaText}`;
  } else {
    msg.textContent = lastRoundWinDisplay;
  }

  renderGameBudgetHeader();
  startBetweenRoundsCountdown();
}

// -------- ставка игрока --------

function select(side) {
  if (timeLeft <= 0 || isRoundFinished || isBetweenRounds) return;

  let balance = getCurrentTicketsWhole();
  if (balance < ticketsPerTap) {
    msg.textContent = "Недостаточно билетов для хода.";
    return;
  }

  balance -= ticketsPerTap;
  setCurrentTicketsWhole(balance);
  renderBalance();

  if (side === "left") {
    leftVotes += ticketsPerTap;
    playerLeftTickets += ticketsPerTap;
    leftTapsValueEl.textContent = playerLeftTickets.toString();
    leftTapsEl.classList.remove("hidden");
  } else {
    rightVotes += ticketsPerTap;
    playerRightTickets += ticketsPerTap;
    rightTapsValueEl.textContent = playerRightTickets.toString();
    rightTapsEl.classList.remove("hidden");
  }

  const total = leftVotes + rightVotes;
  centerBetsEl.textContent = total.toString();

  left.classList.remove("active");
  right.classList.remove("active");
  selectedSide = side;
  if (side === "left") left.classList.add("active");
  else right.classList.add("active");
}

// -------- реклама (заглушка) --------

function settleAdBudgetStub(adAvailableUsd, adWinTicketsTotalForAllPlayers) {
  if (adAvailableUsd <= 0 || adWinTicketsTotalForAllPlayers <= 0) {
    console.log("[AD_SETTLEMENT] Недостаточно данных для расчёта.");
    return;
  }

  const adPrizePerTicketUsd = adAvailableUsd / adWinTicketsTotalForAllPlayers;
  const totalAdTickets = adWinTicketsWhole + adWinTicketRemainder / 100;
  const playerPayoutUsd = totalAdTickets * adPrizePerTicketUsd;

  console.log(
    "[AD_SETTLEMENT] Теоретический payout для текущего игрока:",
    playerPayoutUsd.toFixed(4)
  );
  console.log(
    "[AD_SETTLEMENT] Теоретическая цена 1 ad‑ticket:",
    adPrizePerTicketUsd.toFixed(6)
  );
}

// -------- события --------

left.addEventListener("click", () => select("left"));
right.addEventListener("click", () => select("right"));

nextButton.addEventListener("click", () => {
  if (!isRoundFinished && !isBetweenRounds && timeLeft > 0) {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    timeLeft = 0;
    tick();
  } else if (isBetweenRounds) {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    isBetweenRounds = false;
    currentRound += 1;
    startRound();
  } else if (isRoundFinished && !isBetweenRounds) {
    currentRound += 1;
    startRound();
  }
});

randomToggleEl.addEventListener("change", () => {
  isRandomMode = randomToggleEl.checked;
  renderRound();
});

randomMaxInputEl.addEventListener("change", () => {
  const val = randomMaxInputEl.valueAsNumber;
  if (!Number.isFinite(val) || val < 0) {
    randomMaxInputEl.value = "2";
  }
});

showRandomToggleEl.addEventListener("change", () => {
  showRandom = showRandomToggleEl.checked;
  renderRandomSideInfo();
});

// старт первого раунда
renderGameBudgetHeader();
startRound();
