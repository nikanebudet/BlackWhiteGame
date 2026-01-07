// admin.js
import { gameConfig } from "gameConfig.js";

const input = document.getElementById("feesPercentInput");
const saveBtn = document.getElementById("saveFeesBtn");

// при открытии формы — подставляем текущее значение
if (input) {
  input.value = (gameConfig.feesPercent * 100).toFixed(2);
}

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const raw = input.value.replace(",", ".");
    const val = Number(raw);
    if (!Number.isFinite(val) || val < 0 || val > 100) {
      alert("Введите процент от 0 до 100");
      return;
    }

    const percent = val / 100;

    // локально (в рамках сессии)
    gameConfig.feesPercent = percent;

    // пример сохранения на бэкенд (можешь адаптировать под свой API)
    fetch("/api/admin/settings/fees", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feesPercent: percent }),
    }).catch(() => {
      /* проглотить для прототипа */
    });

    alert("Комиссия сохранена");
  });
}
