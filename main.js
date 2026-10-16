// AVENGERS VAULT - MAIN SCRIPT

// Global State Variables
let soundEnabled = true;
let currentUser = {
  name: "Agent Stark",
  email: "stark@shield.gov",
  balance: 500.00, // Number na para sa madaling computation
  inventory: [],
  avatar: "",
  address: ""
};
let currentOpenedBox = null;
let audioCtx = null;

// Audio Context Helper
function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

// Simple Web Audio API SFX Generator
function playSFX(type) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'unbox') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'reveal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn("Audio playback issue:", e);
  }
}

// Sound Toggle Control
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById("sound-toggle");
  if (btn) {
    btn.innerHTML = soundEnabled
      ? `<i id="sound-icon" class="fa-solid fa-volume-high text-red-500"></i> <span class="hidden sm:inline">SFX On</span>`
      : `<i id="sound-icon" class="fa-solid fa-volume-xmark text-slate-500"></i> <span class="hidden sm:inline">SFX Off</span>`;
  }
}

// DATA STRUCTURES (Common, Epic, and Mythic tiers)
const BOX_TIERS = [
  {
    id: "common",
    name: "Common Box Tier",
    desc: "Standard issue container with higher odds for everyday essentials.",
    price: 29.99,
    icon: "fa-solid fa-box",
    rarity: "Common",
    odds: { common: "55%", rare: "30%", epic: "10%", legendary: "4%", mythic: "1%" }
  },
  {
    id: "epic",
    name: "Epic Box Tier",
    desc: "Upgraded container featuring better chances at high-grade tech and apparel.",
    price: 79.99,
    icon: "fa-solid fa-box-open",
    rarity: "Epic",
    odds: { common: "15%", rare: "30%", epic: "40%", legendary: "10%", mythic: "5%" }
  },
  {
    id: "mythic",
    name: "Mythic Box Tier",
    desc: "Elite ultimate vault with maximum luck percentages for rare cosmic loot.",
    price: 149.99,
    icon: "fa-solid fa-gem",
    rarity: "Mythic",
    odds: { common: "5%", rare: "5%", epic: "20%", legendary: "35%", mythic: "35%" }
  }
];

const DROP_ITEMS = [
  { id: "g1", name: "Custom RGB Mechanical Keyboard", category: "stark", categoryLabel: "Gaming", rarity: "legendary", value: "$300.99", icon: "fa-keyboard", img: "https://www.syntech.co.za/wp-content/uploads/2026/07/C3PX-H4_Keychron_C3_Pro_80_8K_Super_Banana_Switc_wr_07.jpg" },
  { id: "g2", name: "Wireless ANC Gaming Headset", category: "stark", categoryLabel: "Gaming", rarity: "epic", value: "$280.99", icon: "fa-headphones", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQi3uHUbjPboD-uVo7ngFJIKtK5BI55c9LqYtHqSd0Qg&s=10" },
  { id: "g3", name: "Ergonomic Ultra-Light Gaming Mouse", category: "stark", categoryLabel: "Gaming", rarity: "rare", value: "$190.98", icon: "fa-computer-mouse", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRToPLuPdTAWPXwf1u4nmvHzxbERLDP_c0bvcPMmth6mg&s=10" },
  { id: "g4", name: "4K High-Refresh Gaming Monitor", category: "cosmic", categoryLabel: "Gaming", rarity: "mythic", value: "$670.67", icon: "fa-desktop", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkx-8H408GOV3vd8X84P_5EEPp3lCTzLb1nZ2gePtkvw&s=10" },
  { id: "f1", name: "Over-Sized Streetwear Tech Hoodie", category: "asgard", categoryLabel: "Fashion", rarity: "rare", value: "$300.97", icon: "fa-shirt", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6JKV8rcLQmY5OrUmSBC1-djYbMJM8idmb2N3HKmLnuSx0BmsTlAnc0mI&s=10" },
  { id: "f2", name: "Limited Edition Retro Sneakers", category: "asgard", categoryLabel: "Fashion", rarity: "legendary", value: "$250.00", icon: "fa-shoe-prints", img: "https://www.hogan.com/fashion/hoganNew/HXM7370GL90W9H0FSZ/HXM7370GL90W9H0FSZ-13.jpg?imwidth=800" },
  { id: "f3", name: "Blue-Light Blocking Designer Glasses", category: "asgard", categoryLabel: "Fashion", rarity: "common", value: "$20.06", icon: "fa-glasses", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSuJsrj3eHcin9m8x6r_44J2DUgze8_bs3gtuCtNu2iw&s=10" },
  { id: "f4", name: "Minimalist Smart Fitness Watch", category: "asgard", categoryLabel: "Fashion", rarity: "epic", value: "$50.55", icon: "fa-stopwatch", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMO-qGy_sB6upeAOLZKG8Iby-cKlP5g_P85leccU3WVA&s=10" },
  { id: "s1", name: "Waterproof Anti-Theft Laptop Backpack", category: "wakanda", categoryLabel: "Student", rarity: "rare", value: "$40.67", icon: "fa-bag-shopping", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuJup3ZIQb1kDTnnQDHpqdRCQ4Vl_cR4D-5SIfvBaOGw&s=10" },
  { id: "s2", name: "Digital Stylus Drawing & Note Tablet", category: "wakanda", categoryLabel: "Student", rarity: "epic", value: "$70.32", icon: "fa-tablet-screen-button", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDqsxcfq2dnOoF2aaC4cdL9pGo1o1ta3JmNOrCljLleQ&s=10" },
  { id: "s3", name: "Insulated Stainless Steel Smart Flask", category: "wakanda", categoryLabel: "Student", rarity: "common", value: "$20.99", icon: "fa-bottle-water", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSShe5vKTc9PBHQCnnEvx9kxly3tfH45E5WAcdvNqIG_A&s" },
  { id: "s4", name: "Ergonomic Memory Foam Desk Chair", category: "cosmic", categoryLabel: "Setup", rarity: "mythic", value: "$150.67", icon: "fa-chair", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ43KheZ4k_Su2BvgpwiKICBTHq83Nt2Mp0UBxAh2W8g&s=10" }
];

const TICKER_ITEMS = [
  "Agent Stark unboxed: Custom RGB Mechanical Keyboard",
  "Agent Romanoff unboxed: Wireless ANC Gaming Headset",
  "Agent Rogers unboxed: Ultra-Light Gaming Mouse",
  "Agent Thor unboxed: 4K High-Refresh Gaming Monitor"
];

function getRarityBadgeClass(rarity) {
  switch (rarity.toLowerCase()) {
    case "common":
      return "bg-slate-800 text-slate-300 border border-slate-700";
    case "rare":
      return "bg-blue-950/80 text-blue-400 border border-blue-500/40";
    case "epic":
      return "bg-purple-950/80 text-purple-400 border border-purple-500/40";
    case "legendary":
      return "bg-amber-950/80 text-amber-400 border border-amber-500/40";
    case "mythic":
      return "bg-pink-950/80 text-pink-400 border border-pink-500/40 animate-pulse";
    default:
      return "bg-slate-800 text-slate-300";
  }
}

// Balance Display Updater
function updateBalanceDisplay() {
  const headerBal = document.getElementById("user-balance-display");
  const profileBal = document.getElementById("profile-balance");
  const formattedVal = currentUser ? `$${currentUser.balance.toFixed(2)}` : "$0.00";

  if (headerBal) headerBal.textContent = formattedVal;
  if (profileBal) profileBal.textContent = formattedVal;
}

// Render Tiers
function renderTiers() {
  const container = document.getElementById("tiers-container");
  if (!container) return;

  container.innerHTML = BOX_TIERS.map(
    (tier) => `
    <div class="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between hover:border-red-500/50 transition-all group shadow-xl">
      <div>
        <div class="w-full h-40 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 overflow-hidden group-hover:scale-105 transition-transform relative">
          <i class="${tier.icon} text-red-500 text-5xl"></i>
          <button onclick="openBoxContentsModal('${tier.id}')" class="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm transition-all border border-slate-700">
            <i class="fa-solid fa-eye mr-1"></i> View Contents
          </button>
        </div>
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-white">${tier.name}</h3>
          <span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${getRarityBadgeClass(
            tier.rarity
          )}">${tier.rarity}</span>
        </div>
        <p class="text-xs text-slate-400 mt-2 leading-relaxed">${tier.desc}</p>
      </div>
      <div class="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
        <span class="text-sm font-bold text-amber-400">$${tier.price.toFixed(2)}</span>
        <button onclick="openUnboxModal('${tier.id}')" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30">
          Unbox
        </button>
      </div>
    </div>
  `
  ).join("");
}

// VIEW BOX CONTENTS MODAL SYSTEM
function openBoxContentsModal(tierId) {
  playSFX("click");
  const tier = BOX_TIERS.find(t => t.id === tierId);
  if (!tier) return;

  let modal = document.getElementById("box-contents-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "box-contents-modal";
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md opacity-0 transition-opacity duration-300 hidden";
    modal.innerHTML = `
      <div id="contents-modal-container" class="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full mx-4 p-6 shadow-2xl transform scale-95 transition-transform duration-300 relative max-h-[90vh] flex flex-col">
        <button onclick="closeBoxContentsModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div id="contents-modal-body" class="overflow-y-auto pr-1"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const bodyEl = document.getElementById("contents-modal-body");
  bodyEl.innerHTML = `
    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
        <i class="${tier.icon} text-red-500 text-2xl"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold text-white">${tier.name} Contents</h3>
        <p class="text-xs text-slate-400">Guaranteed percentage drop rates for this tier</p>
      </div>
    </div>

    <div class="grid grid-cols-5 gap-2 mb-6 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
      <div>
        <span class="block text-[10px] uppercase font-bold text-slate-400">Common</span>
        <span class="text-xs font-extrabold text-slate-200">${tier.odds.common}</span>
      </div>
      <div>
        <span class="block text-[10px] uppercase font-bold text-blue-400">Rare</span>
        <span class="text-xs font-extrabold text-blue-400">${tier.odds.rare}</span>
      </div>
      <div>
        <span class="block text-[10px] uppercase font-bold text-purple-400">Epic</span>
        <span class="text-xs font-extrabold text-purple-400">${tier.odds.epic}</span>
      </div>
      <div>
        <span class="block text-[10px] uppercase font-bold text-amber-400">Legendary</span>
        <span class="text-xs font-extrabold text-amber-400">${tier.odds.legendary}</span>
      </div>
      <div>
        <span class="block text-[10px] uppercase font-bold text-pink-400">Mythic</span>
        <span class="text-xs font-extrabold text-pink-400">${tier.odds.mythic}</span>
      </div>
    </div>

    <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">All Possible Drop Items in Vault</h4>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      ${DROP_ITEMS.map(item => `
        <div class="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center">
          <div class="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2 overflow-hidden">
            ${item.img ? `<img src="${item.img}" class="w-full h-full object-cover" />` : `<i class="fa-solid ${item.icon} text-slate-300"></i>`}
          </div>
          <span class="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getRarityBadgeClass(item.rarity)} mb-1">${item.rarity}</span>
          <h5 class="text-[11px] font-bold text-white truncate w-full">${item.name}</h5>
          <span class="text-[10px] text-amber-400 font-semibold mt-0.5">${item.value}</span>
        </div>
      `).join("")}
    </div>
  `;

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    document.getElementById("contents-modal-container").classList.remove("scale-95");
  }, 10);
}

function closeBoxContentsModal() {
  playSFX("click");
  const modal = document.getElementById("box-contents-modal");
  if (!modal) return;
  modal.classList.add("opacity-0");
  document.getElementById("contents-modal-container").classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function renderCatalog(filter = "all") {
  const container = document.getElementById("catalog-grid");
  if (!container) return;

  const itemsToDisplay =
    filter === "all"
      ? DROP_ITEMS
      : DROP_ITEMS.filter((item) => item.category === filter);

  container.innerHTML = itemsToDisplay
    .map(
      (item) => `
    <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center hover:border-slate-700 transition-all">
      <div class="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center mb-3 overflow-hidden">
        ${
          item.img
            ? `<img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" />`
            : `<i class="fa-solid ${item.icon} text-slate-300 text-2xl"></i>`
        }
      </div>
      <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${getRarityBadgeClass(
        item.rarity
      )} mb-1">
        ${item.rarity}
      </span>
      <h4 class="text-xs font-bold text-white truncate w-full mt-1">${item.name}</h4>
      <p class="text-[11px] text-amber-400 font-semibold mt-0.5">${item.value}</p>
    </div>
  `
    )
    .join("");
}

function renderTicker() {
  const tickerContent = document.getElementById("live-ticker-content");
  if (!tickerContent) return;

  const itemsStr = TICKER_ITEMS.map(
    (txt) => `<span class="mx-4 flex items-center gap-2"><i class="fa-solid fa-shield-halved text-red-500 text-[10px]"></i> ${txt}</span>`
  ).join("");

  tickerContent.innerHTML = itemsStr + itemsStr;
}

function filterCatalog(category, event) {
  playSFX("click");
  document.querySelectorAll(".catalog-btn").forEach((btn) => {
    btn.classList.remove("bg-red-600", "text-white");
    btn.classList.add("bg-slate-800/80", "text-slate-400");
  });

  if (event && event.currentTarget) {
    event.currentTarget.classList.remove("bg-slate-800/80", "text-slate-400");
    event.currentTarget.classList.add("bg-red-600", "text-white");
  }

  renderCatalog(category);
}

// UNBOXING SYSTEM WITH AUTOMATIC BALANCE DEDUCTION
function openUnboxModal(tierId = "common") {
  const tier = BOX_TIERS.find(t => t.id === tierId) || BOX_TIERS[0];

  // Suriin kung may sapat na pera
  if (!currentUser || currentUser.balance < tier.price) {
    playSFX("click");
    alert(`Kulang ang iyong pondo! Ang presyo ng ${tier.name} ay $${tier.price.toFixed(2)}. Mag-top up muna ng pondo.`);
    openTopUpModal();
    return;
  }

  // Bawasan ang balance ng user
  currentUser.balance -= tier.price;
  updateBalanceDisplay();

  playSFX("unbox");

  const modal = document.getElementById("unbox-modal");
  const modalContainer = document.getElementById("modal-container");
  const animStage = document.getElementById("unbox-animation-stage");
  const resultStage = document.getElementById("unbox-result-stage");

  if (!modal || !animStage || !resultStage) return;

  animStage.classList.remove("hidden");
  resultStage.classList.add("hidden");

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    if (modalContainer) modalContainer.classList.remove("scale-95");
  }, 10);

  runUnboxProgress();

  buildRollerStrip(animStage, tierId);
}

function buildRollerStrip(animStyleContainer, tierId) {
  const winningItem = getWeightedDropItem(tierId);
  currentOpenedBox = winningItem;
  currentOpenedBox.tierSource = tierId;

  const stripItems = [];
  for (let i = 0; i < 60; i++) {
    const randomDrop = DROP_ITEMS[Math.floor(Math.random() * DROP_ITEMS.length)];
    stripItems.push(randomDrop);
  }
  stripItems.push(winningItem);

  animStyleContainer.innerHTML = `
    <div class="text-center mb-4">
      <h3 class="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Decrypting Vault...</h3>
    </div>
    <div id="roller-container" class="relative w-full overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl py-6 shadow-inner flex items-center justify-center">
      <div id="roller-track" class="flex gap-3 transition-all ease-out duration-[3500ms]" style="transform: translateX(0px);">
        ${stripItems.map(item => `
          <div class="flex-shrink-0 w-28 h-28 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center p-2 text-center select-none">
            <div class="w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center mb-2 overflow-hidden">
              ${item.img ? `<img src="${item.img}" class="w-full h-full object-cover" />` : `<i class="fa-solid ${item.icon} text-slate-300"></i>`}
            </div>
            <span class="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${getRarityBadgeClass(item.rarity)} mb-1">${item.rarity}</span>
            <h6 class="text-[10px] font-bold text-white truncate w-full">${item.name}</h6>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  setTimeout(() => {
    const track = document.getElementById("roller-track");
    const container = document.getElementById("roller-container");
    if (!track || !container) return;

    const itemWidth = 112 + 12;
    const totalScrollWidth = (stripItems.length - 1) * itemWidth - (container.offsetWidth / 2) + 56;

    track.style.transform = `translateX(-${Math.max(0, totalScrollWidth)}px)`;

    let ticks = 0;
    const tickInterval = setInterval(() => {
      playSFX("tick");
      ticks++;
      if (ticks > 20) clearInterval(tickInterval);
    }, 150);

  }, 50);

  setTimeout(() => {
    playSFX("reveal");
    animStyleContainer.classList.add("hidden");
    const resultStage = document.getElementById("unbox-result-stage");
    if (resultStage) resultStage.classList.remove("hidden");

    const itemImgElement = document.getElementById("result-item-image");
    const itemIconElement = document.getElementById("result-item-icon");

    if (itemImgElement && itemIconElement) {
      if (winningItem.img) {
        itemImgElement.src = winningItem.img;
        itemImgElement.alt = winningItem.name;
        itemImgElement.classList.remove("hidden");
        itemIconElement.classList.add("hidden");
      } else {
        itemImgElement.classList.add("hidden");
        itemIconElement.classList.remove("hidden");
        itemIconElement.className = `fa-solid ${winningItem.icon || "fa-gift"} text-amber-400 text-5xl`;
      }
    }

    const badgeEl = document.getElementById("result-rarity-badge");
    const nameEl = document.getElementById("result-item-name");
    const valEl = document.getElementById("result-item-value");

    if (badgeEl) {
      badgeEl.textContent = winningItem.rarity;
      badgeEl.className = `px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest ${getRarityBadgeClass(winningItem.rarity)}`;
    }
    if (nameEl) nameEl.textContent = winningItem.name;
    if (valEl) valEl.textContent = winningItem.value;

    if (currentUser) {
      currentUser.inventory.unshift(winningItem);
      updateInventoryUI();
    }

    if (typeof confetti === "function") {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#e23636", "#f59e0b", "#3b82f6"]
      });
    }
  }, 3600);
}

// INVENTORY UI DISPLAY WITH SELECTION FOR DELIVERY
let selectedDeliveryItem = null;

function updateInventoryUI() {
  const invList = document.getElementById("account-inventory-list");
  if (!invList || !currentUser) return;

  if (currentUser.inventory.length === 0) {
    invList.innerHTML = `<p class="text-xs text-slate-500 italic">No items unboxed yet.</p>`;
  } else {
    invList.innerHTML = currentUser.inventory.map((item, index) => {
      const itemName = typeof item === 'string' ? item : item.name;
      const itemRarity = typeof item === 'string' ? 'common' : item.rarity;
      const itemImg = typeof item === 'object' && item.img ? item.img : null;
      const isSelected = selectedDeliveryItem === itemName;

      return `
        <div onclick="selectItemForDelivery('${itemName.replace(/'/g, "\\'")}')" class="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border ${isSelected ? 'border-amber-400 bg-amber-950/20' : 'border-slate-800 hover:border-slate-700'} cursor-pointer transition-all text-xs text-slate-200">
          <div class="flex items-center gap-2.5 truncate">
            <div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              ${itemImg ? `<img src="${itemImg}" class="w-full h-full object-cover" />` : `<i class="fa-solid fa-box-open text-amber-400 text-xs"></i>`}
            </div>
            <div class="truncate">
              <span class="block font-bold text-white truncate">${itemName}</span>
              <span class="text-[9px] uppercase px-1.5 py-0.2 rounded-full ${getRarityBadgeClass(itemRarity)}">${itemRarity}</span>
            </div>
          </div>
          <span class="text-[10px] ${isSelected ? 'text-amber-400 font-extrabold' : 'text-green-400 font-bold'} uppercase flex-shrink-0 ml-2">
            ${isSelected ? 'Selected' : 'Claimed'}
          </span>
        </div>
      `;
    }).join("");
  }
}

function selectItemForDelivery(itemName) {
  playSFX("click");
  selectedDeliveryItem = itemName;
  const nameDisplay = document.getElementById("selected-delivery-item-name");
  const dispatchSection = document.getElementById("delivery-dispatch-section");
  
  if (nameDisplay) nameDisplay.innerText = itemName;
  if (dispatchSection) dispatchSection.classList.remove("hidden");
  updateInventoryUI();
}

function dispatchPriorityDelivery() {
  playSFX("click");
  const address = currentUser?.address || document.getElementById("update-address")?.value;

  if (!address) {
    alert("Mangyaring maglagay muna ng iyong Delivery Address sa iyong profile settings!");
    return;
  }
  if (!selectedDeliveryItem) {
    alert("Mangyaring pumili muna ng item mula sa iyong inventory para i-deliver.");
    return;
  }

  alert(`Quinjet Logistics Dispatched! Ang iyong item na "${selectedDeliveryItem}" ay ihahatid sa address na: ${address}`);
}

// Luck/Percentage Calculator Function
function getWeightedDropItem(tierId) {
  const rand = Math.random() * 100;
  let targetRarities = [];

  if (tierId === "mythic") {
    if (rand < 35) targetRarities = ["mythic"];
    else if (rand < 70) targetRarities = ["legendary"];
    else if (rand < 90) targetRarities = ["epic"];
    else targetRarities = ["rare", "common"];
  } else if (tierId === "epic") {
    if (rand < 40) targetRarities = ["epic"];
    else if (rand < 70) targetRarities = ["rare"];
    else if (rand < 85) targetRarities = ["legendary", "mythic"];
    else targetRarities = ["common"];
  } else {
    if (rand < 55) targetRarities = ["common"];
    else if (rand < 85) targetRarities = ["rare"];
    else if (rand < 95) targetRarities = ["epic"];
    else targetRarities = ["legendary", "mythic"];
  }

  let pool = DROP_ITEMS.filter((item) => targetRarities.includes(item.rarity.toLowerCase()));
  if (pool.length === 0) pool = DROP_ITEMS;

  return pool[Math.floor(Math.random() * pool.length)];
}

function closeUnboxModal() {
  playSFX("click");
  const modal = document.getElementById("unbox-modal");
  const modalContainer = document.getElementById("modal-container");

  if (!modal) return;

  modal.classList.add("opacity-0");
  if (modalContainer) modalContainer.classList.add("scale-95");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function reOpenCurrentBox() {
  openUnboxModal(currentOpenedBox ? currentOpenedBox.tierSource : "common");
}

function quickDemoUnbox() {
  openUnboxModal("common");
}

// TOP UP / PAYMENT METHOD FUNCTIONS (Front-End)
function openTopUpModal() {
  playSFX("click");
  const modal = document.getElementById("topup-modal");
  const container = document.getElementById("topup-modal-container");
  if (!modal) return;

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    if (container) container.classList.remove("scale-95");
  }, 10);
}

function closeTopUpModal() {
  playSFX("click");
  const modal = document.getElementById("topup-modal");
  const container = document.getElementById("topup-modal-container");
  if (!modal) return;

  modal.classList.add("opacity-0");
  if (container) container.classList.add("scale-95");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function selectPresetAmount(amount) {
  playSFX("click");
  const input = document.getElementById("topup-amount-input");
  if (input) input.value = amount;
}

function handleTopUpSubmit(e) {
  e.preventDefault();
  playSFX("click");

  const amountInput = document.getElementById("topup-amount-input");
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert("Mangyaring maglagay ng tamang halaga.");
    return;
  }

  if (!currentUser) {
    currentUser = {
      name: "Agent Stark",
      email: "stark@shield.gov",
      balance: 0,
      inventory: [],
      avatar: "",
      address: ""
    };
  }

  // Idagdag ang halaga sa pondo
  currentUser.balance += amount;
  updateBalanceDisplay();

  alert(`Matagumpay na naidagdag ang $${amount.toFixed(2)} sa iyong account balance!`);
  amountInput.value = "";
  closeTopUpModal();
}

// Navigation switching
function switchNav(page) {
  const homeSec = document.getElementById('section-home-content');
  const aboutSec = document.getElementById('section-about-content');
  const supportSec = document.getElementById('section-support-content');

  const navHome = document.getElementById('nav-home');
  const navAbout = document.getElementById('nav-about');
  const navSupport = document.getElementById('nav-support');

  if (homeSec) homeSec.classList.add('hidden');
  if (aboutSec) aboutSec.classList.add('hidden');
  if (supportSec) supportSec.classList.add('hidden');

  [navHome, navAbout, navSupport].forEach(btn => {
    if (btn) {
      btn.classList.remove('text-red-500');
      btn.classList.add('text-slate-400');
    }
  });

  if (page === 'home') {
    if (homeSec) homeSec.classList.remove('hidden');
    if (navHome) {
      navHome.classList.add('text-red-500');
      navHome.classList.remove('text-slate-400');
    }
  } else if (page === 'about') {
    if (aboutSec) aboutSec.classList.remove('hidden');
    if (navAbout) {
      navAbout.classList.add('text-red-500');
      navAbout.classList.remove('text-slate-400');
    }
  } else if (page === 'support') {
    if (supportSec) supportSec.classList.remove('hidden');
    if (navSupport) {
      navSupport.classList.add('text-red-500');
      navSupport.classList.remove('text-slate-400');
    }
  }
}

function openAccountModal() {
  playSFX("click");
  const modal = document.getElementById("account-modal");
  const container = document.getElementById("account-modal-container");

  if (!modal) return;

  if (currentUser) {
    switchAuthTab("profile");
  } else {
    switchAuthTab("signin");
  }

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    if (container) container.classList.remove("scale-95");
  }, 10);
}

function closeAccountModal() {
  playSFX("click");
  const modal = document.getElementById("account-modal");
  const container = document.getElementById("account-modal-container");

  if (!modal) return;

  modal.classList.add("opacity-0");
  if (container) container.classList.add("scale-95");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function switchAuthTab(tab) {
  playSFX("click");
  const tabSignin = document.getElementById("auth-tab-signin");
  const tabSignup = document.getElementById("auth-tab-signup");
  const tabProfile = document.getElementById("auth-tab-profile");

  const formSignin = document.getElementById("auth-signin-form");
  const formSignup = document.getElementById("auth-signup-form");
  const viewProfile = document.getElementById("auth-profile-view");

  [tabSignin, tabSignup, tabProfile].forEach((t) => {
    if (t) {
      t.classList.remove("text-red-500", "border-red-500");
      t.classList.add("text-slate-400", "border-transparent");
    }
  });

  [formSignin, formSignup, viewProfile].forEach((v) => {
    if (v) v.classList.add("hidden");
  });

  if (tab === "signin") {
    if (tabSignin) tabSignin.classList.add("text-red-500", "border-red-500");
    if (formSignin) formSignin.classList.remove("hidden");
  } else if (tab === "signup") {
    if (tabSignup) tabSignup.classList.add("text-red-500", "border-red-500");
    if (formSignup) formSignup.classList.remove("hidden");
  } else if (tab === "profile") {
    if (tabProfile) {
      tabProfile.classList.remove("hidden");
      tabProfile.classList.add("text-red-500", "border-red-500");
    }
    if (viewProfile) viewProfile.classList.remove("hidden");
    updateProfileUI();
  }
}

function handleSignIn(e) {
  e.preventDefault();
  playSFX("click");
  const email = document.getElementById("signin-email").value;

  currentUser = {
    name: email.split("@")[0] || "Agent",
    email: email,
    balance: 500.00,
    inventory: [],
    avatar: currentUser?.avatar || "",
    address: currentUser?.address || ""
  };

  updateAccountState();
  updateUIAvatar();
  switchAuthTab("profile");
}

function handleSignUp(e) {
  e.preventDefault();
  playSFX("click");
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const address = document.getElementById("signup-address") ? document.getElementById("signup-address").value : "";

  currentUser = {
    name: name,
    email: email,
    balance: 500.00,
    inventory: [],
    avatar: "",
    address: address
  };

  updateAccountState();
  updateUIAvatar();
  switchAuthTab("profile");
}

function handleSignOut() {
  playSFX("click");
  currentUser = null;
  updateAccountState();
  updateUIAvatar();
  switchAuthTab("signin");
}

function updateAccountState() {
  const label = document.getElementById("nav-account-label");
  const tabProfile = document.getElementById("auth-tab-profile");

  if (currentUser) {
    if (label) label.textContent = currentUser.name;
    if (tabProfile) tabProfile.classList.remove("hidden");
  } else {
    if (label) label.textContent = "Sign In / Register";
    if (tabProfile) tabProfile.classList.add("hidden");
  }
  updateBalanceDisplay();
}

function updateProfileUI() {
  if (!currentUser) return;
  const nameEl = document.getElementById("profile-agent-name");
  const emailEl = document.getElementById("profile-agent-email");
  const addressInput = document.getElementById("update-address");
  const avatarInput = document.getElementById("update-avatar-url");

  if (nameEl) nameEl.textContent = currentUser.name;
  if (emailEl) emailEl.textContent = currentUser.email;
  if (addressInput) addressInput.value = currentUser.address || "";
  if (avatarInput) avatarInput.value = currentUser.avatar || "";

  updateBalanceDisplay();
  updateInventoryUI();
  updateUIAvatar();
}

// Avatar Updater Helper Functions
function updateUIAvatar() {
  const navAvatarImg = document.getElementById('nav-avatar-img');
  const navAvatarIcon = document.getElementById('nav-avatar-icon');
  const profileAvatarImg = document.getElementById('profile-avatar-img');
  const profileAvatarIcon = document.getElementById('profile-avatar-icon');
  const navLabel = document.getElementById('nav-account-label');

  if (currentUser && navLabel) navLabel.innerText = currentUser.name || 'Agent Stark';

  if (currentUser && currentUser.avatar) {
    if (navAvatarImg) { navAvatarImg.src = currentUser.avatar; navAvatarImg.classList.remove('hidden'); }
    if (navAvatarIcon) navAvatarIcon.classList.add('hidden');
    if (profileAvatarImg) { profileAvatarImg.src = currentUser.avatar; profileAvatarImg.classList.remove('hidden'); }
    if (profileAvatarIcon) profileAvatarIcon.classList.add('hidden');
  } else {
    if (navAvatarImg) navAvatarImg.classList.add('hidden');
    if (navAvatarIcon) navAvatarIcon.classList.remove('hidden');
    if (profileAvatarImg) profileAvatarImg.classList.add('hidden');
    if (profileAvatarIcon) profileAvatarIcon.classList.remove('hidden');
  }
}

function handleUpdateProfileSettings() {
  playSFX("click");
  const newAvatar = document.getElementById('update-avatar-url').value.trim();
  const newAddress = document.getElementById('update-address').value.trim();

  if (!currentUser) {
    currentUser = { name: "Agent Stark", email: "stark@shield.gov", balance: 500.00, inventory: [], avatar: "", address: "" };
  }

  currentUser.avatar = newAvatar;
  currentUser.address = newAddress;

  updateUIAvatar();
  alert('Matagumpay na nai-save ang iyong profile settings at delivery address!');
}

// Support Form Handler
function handleSupportSubmit(e) {
  e.preventDefault();
  playSFX("click");
  alert("Dispatch transmitted to Stark Industries team! Reference ID: " + Math.floor(100000 + Math.random() * 900000));
  e.target.reset();
}

document.addEventListener("DOMContentLoaded", () => {
  renderTiers();
  renderCatalog("all");
  renderTicker();
  updateBalanceDisplay();
  updateUIAvatar();
});

// Datalist Catalog Search Handler
function handleCatalogSearch(query) {
  const searchTerm = query.toLowerCase().trim();
  const container = document.getElementById("catalog-grid");
  if (!container) return;

  if (!searchTerm) {
    renderCatalog("all");
    return;
  }

  const filtered = DROP_ITEMS.filter(item => item.name.toLowerCase().includes(searchTerm));
  container.innerHTML = filtered.length > 0 ? filtered.map(item => `
    <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center">
      <div class="w-20 h-20 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center mb-3 overflow-hidden">
        <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" />
      </div>
      <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${getRarityBadgeClass(item.rarity)} mb-1">${item.rarity}</span>
      <h4 class="text-xs font-bold text-white truncate w-full mt-1">${item.name}</h4>
      <p class="text-[11px] text-amber-400 font-semibold mt-0.5">${item.value}</p>
    </div>
  `).join("") : `<p class="col-span-full text-center text-xs text-slate-500 italic py-4">No armory gear found matching your search.</p>`;
}

// Progress Bar Animation Handler during Unbox
function runUnboxProgress() {
  const progressBar = document.getElementById("unbox-progress-bar");
  const progressPercent = document.getElementById("progress-percentage");
  if (!progressBar || !progressPercent) return;

  progressBar.value = 0;
  progressPercent.textContent = "0%";

  let currentVal = 0;
  const interval = setInterval(() => {
    currentVal += 5;
    progressBar.value = currentVal;
    progressPercent.textContent = `${currentVal}%`;
    if (currentVal >= 100) {
      clearInterval(interval);
    }
  }, 130);
}

// Social Network Hover Handler for Image Map & Mouse Over
function showSocialInfo(infoText) {
  playSFX("tick");
  const statusEl = document.getElementById("blueprint-status-text");
  if (statusEl) {
    statusEl.textContent = infoText;
    statusEl.classList.add("text-blue-400");
    setTimeout(() => statusEl.classList.remove("text-blue-400"), 400);
  }
}