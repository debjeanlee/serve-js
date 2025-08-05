// Target: 10 Nov 2025, 2:30PM Singapore time (UTC+08:00)
const targetDate = new Date(Date.UTC(2025, 10, 10, 6, 30, 0));
// Note: Month is 0-indexed (10 = November), 6:30 UTC = 2:30PM Singapore

const countdownEl = document.getElementById("countdown");

function updateCountdown() {
  const now = new Date();
  const nowUTC = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );

  const diff = targetDate - nowUTC;

  if (diff <= 0) {
    countdownEl.innerHTML = "🎉 It's time!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (days === 1) {
    countdownEl.innerHTML = `
      <span><b>${days}</b> DAY</span>
      <span><b>${hours}</b> HRS</span>
      <span><b>${minutes}</b> MINS</span>
      <span><b>${seconds}</b> SECS</span>
    `;
    return;
  }
  if (days <= 10) {
    countdownEl.innerHTML = `
    <span><b>${days}</b> DAYS</span>
    <span><b>${hours}</b> HRS</span>
    <span><b>${minutes}</b> MINS</span>
    <span><b>${seconds}</b> SECS</span>
    `;
    return;
  }
  countdownEl.innerHTML = `
    <span><b>${days}</b> DAYS</span>
    <span><b>${hours}</b> HRS</span>
    <span><b>${minutes}</b> MINS</span>
    `;
}

setInterval(updateCountdown, 1000);
updateCountdown();
