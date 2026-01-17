/* ===== GAME STATE ===== */
let money = 0;
let perSec = 0;
let multiplier = 1;
let totalEarned = 0;
let totalClicks = 0;
let bestPerSec = 0;
let playTime = 0;
let prestigeCount = 0;

let prestigeUnlocked = false;
const PRESTIGE_REQUIREMENT = 50000;

/* COSTS */
let costs = [25, 100, 1000, 5000, 20000];
let gains = [1, 5, 25, 100, 500];

/* ACHIEVEMENTS */
let achievements = [
  { name: "Premier Euro 💸", cond: () => totalEarned >= 1 },
  { name: "Riche 💰", cond: () => totalEarned >= 1000 },
  { name: "Machine à cash 🏭", cond: () => perSec >= 100 },
  { name: "Empire financier 👑", cond: () => perSec >= 1000 }
];

let unlocked = [];

/* DOM */
const moneyEl = document.getElementById("money");
const statsEl = document.getElementById("stats");
const bill = document.getElementById("bill");
const popup = document.getElementById("achievementPopup");
const achList = document.getElementById("achievements");
const left = document.getElementById("left");

const prestigeCard = document.getElementById("prestigeCard");
const prestigeTitle = document.getElementById("prestigeTitle");
const prestigeNotif = document.getElementById("prestigeNotif");

/* ===== SOUNDS ===== */
const sounds = {
  click: new Audio("sounds/click.mp3"),
  buy: new Audio("sounds/buy.mp3"),
  achievement: new Audio("sounds/achievement.mp3")
};

Object.values(sounds).forEach(s => s.volume = 0.5);

let soundUnlocked = false;
function unlockSounds() {
  if (soundUnlocked) return;
  soundUnlocked = true;
  Object.values(sounds).forEach(s => {
    s.play().catch(() => {});
    s.pause();
    s.currentTime = 0;
  });
}

/* ===== CLICK ===== */
bill.addEventListener("mousedown", e => e.preventDefault());
bill.addEventListener("touchstart", e => e.preventDefault());

bill.addEventListener("click", e => {
  unlockSounds();
  sounds.click.currentTime = 0;
  sounds.click.play();

  money += multiplier;
  totalEarned += multiplier;

  spawnFloat(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
  checkAchievements();
  checkPrestige();
  updateUI();
});

/* ===== IDLE ===== */
setInterval(() => {
  if (perSec > 0) {
    money += perSec * multiplier;
    totalEarned += perSec * multiplier;
    checkAchievements();
    checkPrestige();
    updateUI();
  }
}, 1000);

/* ===== BUY ===== */
function buy(amount) {
  const i = gains.indexOf(amount);
  if (money >= costs[i]) {
    unlockSounds();
    sounds.buy.currentTime = 0;
    sounds.buy.play();

    money -= costs[i];
    perSec += amount;
    costs[i] = Math.floor(costs[i] * 1.6);
    document.querySelectorAll(".card span")[i].textContent = costs[i];
  }
}

/* ===== ACHIEVEMENTS ===== */
function checkAchievements() {
  achievements.forEach(a => {
    if (!unlocked.includes(a.name) && a.cond()) {
      unlocked.push(a.name);
      showAchievement(a.name);
      renderAchievements();
    }
  });
}

function showAchievement(name) {
  unlockSounds();
  sounds.achievement.currentTime = 0;
  sounds.achievement.play();

  popup.textContent = "🏆 " + name;
  popup.classList.remove("hide");
  popup.classList.add("show");

  setTimeout(() => popup.classList.add("hide"), 2500);
  setTimeout(() => popup.classList.remove("show", "hide"), 3500);
}

function renderAchievements() {
  achList.innerHTML = unlocked.map(a => "✔ " + a).join("<br>");
}

/* ===== PRESTIGE ===== */
function checkPrestige() {
  if (!prestigeUnlocked && money >= PRESTIGE_REQUIREMENT) {
    prestigeUnlocked = true;
    prestigeCard.style.display = "block";
    prestigeTitle.style.display = "block";
    showPrestigeNotif();
  }
}

function showPrestigeNotif() {
  prestigeNotif.classList.add("show");

  setTimeout(() => prestigeNotif.classList.add("hide"), 2500);
  setTimeout(() => {
    prestigeNotif.classList.remove("show", "hide");
  }, 3500);
}

function prestige() {
  multiplier *= 2;
  money = 0;
  perSec = 0;
  costs = [25, 100, 1000, 5000, 20000];

  prestigeUnlocked = false;
  prestigeCard.style.display = "none";
  prestigeTitle.style.display = "none";

  updateUI();
}

/* ===== FLOAT ===== */
function spawnFloat(x, y) {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = "+€";
  el.style.left = x + "px";
  el.style.top = y + "px";
  left.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* ===== UI ===== */
function updateUI() {
  moneyEl.textContent = formatNumber(money) + " €";
  statsEl.textContent =
    `${formatNumber(perSec * multiplier)} €/sec | x${multiplier}`;
}

/* ===== Abrev Number ==== */

function formatNumber(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "k";
  return Math.floor(n);
}

const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const toggleSound = document.getElementById("toggleSound");
const toggleVibration = document.getElementById("toggleVibration");

settingsBtn.addEventListener("click", () => {
  settingsMenu.classList.add("show");
});

function closeSettings() {
  settingsMenu.classList.remove("show");
}

/* SOUND TOGGLE */
toggleSound.addEventListener("change", () => {
  Object.values(sounds).forEach(s => s.muted = !toggleSound.checked);
});

/* VIBRATION */
toggleVibration.addEventListener("change", () => {
  if (toggleVibration.checked && navigator.vibrate) {
    navigator.vibrate(50);
  }
});
