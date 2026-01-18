/* ===== GAME STATE ===== */
let money = 0;
let perSec = 0;
let multiplier = 1;
let totalEarned = 0;

let prestigeUnlocked = false;
let prestigeCount = 0;
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

/* SOUNDS */
const sounds = {
  click: new Audio("sounds/click.mp3"),
  buy: new Audio("sounds/buy.mp3"),
  achievement: new Audio("sounds/achievement.mp3"),
  prestige: new Audio("sounds/prestige_available.mp3"),
  rankup: new Audio("sounds/rank_up.mp3")
};

Object.values(sounds).forEach(s => s.volume = 0.5);

let audioUnlocked = false;
function unlockSounds() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  Object.values(sounds).forEach(s => {
    s.play().catch(()=>{});
    s.pause();
    s.currentTime = 0;
  });
}

/* FIX SPAM CLICK */
bill.addEventListener("mousedown", e => e.preventDefault());
bill.addEventListener("touchstart", e => e.preventDefault());

bill.addEventListener("click", e => {
  unlockSounds();
  sounds.click.currentTime = 0;
  sounds.click.play();

  money += multiplier;
  totalEarned += multiplier;

  spawnFloat(e.clientX, e.clientY);
  checkAchievements();
  checkPrestige();
  updateUI();
});

/* IDLE */
setInterval(() => {
  if (perSec > 0) {
    money += perSec * multiplier;
    totalEarned += perSec * multiplier;
    checkAchievements();
    checkPrestige();
    updateUI();
  }
}, 1000);

/* BUY */
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

/* ACHIEVEMENTS */
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
  sounds.achievement.currentTime = 0;
  sounds.achievement.play();

  popup.textContent = "🏆 " + name;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

function renderAchievements() {
  achList.innerHTML = unlocked.map(a => "✔ " + a).join("<br>");
}

/* PRESTIGE + RANK */
function checkPrestige() {
  if (!prestigeUnlocked && money >= PRESTIGE_REQUIREMENT) {
    prestigeUnlocked = true;

    prestigeCard.style.display = "block";
    prestigeTitle.style.display = "block";

    unlockSounds();
    sounds.prestige.currentTime = 0;
    sounds.prestige.play();

    showPrestigeNotif(); // 👈 MANQUAIT
  }
}

function prestige() {
  prestigeCount++;
  multiplier *= 2;

  money = 0;
  perSec = 0;
  costs = [25, 100, 1000, 5000, 20000];

  resetBuildingPrices(); // 👈 FIX ICI

  prestigeUnlocked = false;
  document.getElementById("prestigeCard").style.display = "none";
  document.getElementById("prestigeTitle").style.display = "none";

  showRankPopup();
  updateUI();
}

function getRank() {
  if (prestigeCount === 0) return "Non classé";

  if (prestigeCount <= 3)
    return "🥉 Bronze " + ["I","II","III"][prestigeCount - 1];

  if (prestigeCount <= 6)
    return "🥈 Silver " + ["I","II","III"][prestigeCount - 4];

  if (prestigeCount <= 9)
    return "🥇 Gold " + ["I","II","III"][prestigeCount - 7];

  return "💎 Diamond";
}

function showRankPopup() {
  const popup = document.getElementById("rankPopup");
  popup.textContent = getRank();
  sounds.rankup.play();
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}

/* FLOAT */
function spawnFloat(x, y) {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = "+€";
  el.style.left = x + "px";
  el.style.top = y + "px";
  left.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* UI */
function updateUI() {
  moneyEl.textContent = formatNumber(money) + " €";
  statsEl.textContent =
    `${formatNumber(perSec * multiplier)} €/sec | x${multiplier}`;

  const rankEl = document.getElementById("rankDisplay");
  const rank = getRank();
  rankEl.textContent = rank;

  rankEl.className = "";
  if (rank.includes("Bronze")) rankEl.classList.add("bronze");
  else if (rank.includes("Silver")) rankEl.classList.add("silver");
  else if (rank.includes("Gold")) rankEl.classList.add("gold");
  else if (rank.includes("Diamond")) rankEl.classList.add("diamond");
}

function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "k";
  return Math.floor(n);
}

function resetBuildingPrices() {
  const spans = document.querySelectorAll(".card span");
  spans.forEach((span, i) => {
    span.textContent = costs[i];
  });
}

function saveGame() {
  const data = {
    money,
    perSec,
    multiplier,
    totalEarned,
    costs,
    prestigeCount,
    unlocked
  };
  localStorage.setItem("cashClickerSave", JSON.stringify(data));
}

function loadGame() {
  const save = localStorage.getItem("cashClickerSave");
  if (!save) return;

  const data = JSON.parse(save);

  money = data.money ?? 0;
  perSec = data.perSec ?? 0;
  multiplier = data.multiplier ?? 1;
  totalEarned = data.totalEarned ?? 0;
  costs = data.costs ?? costs;
  prestigeCount = data.prestigeCount ?? 0;
  unlocked = data.unlocked ?? [];

  resetBuildingPrices();
  renderAchievements();
  updateUI();
}

setInterval(saveGame, 5000);
loadGame();
updateUI();
