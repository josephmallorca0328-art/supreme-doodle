// UI RENDERING & DISPLAY FUNCTIONS



function updateBalanceDisplay() {
  const headerBal = document.getElementById("user-balance-display");
  const profileBal = document.getElementById("profile-balance");
  const formattedVal = currentUser ? `$${currentUser.balance.toFixed(2)}` : "$0.00";

  if (headerBal) headerBal.textContent = formattedVal;
  if (profileBal) profileBal.textContent = formattedVal;
}

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