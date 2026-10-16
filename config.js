// ==========================================
// 1. CONFIGURATION, STATE & DATA
// ==========================================

 let soundEnabled = true;
let currentUser = {
  name: "Agent Stark",
  email: "stark@shield.gov",
  balance: 500.00,
  inventory: [],
  avatar: "",
  address: ""
};
 let currentOpenedBox = null;
 let selectedDeliveryItem = null;
let audioCtx = null;

 function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

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
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn("Audio playback issue:", e);
  }
}

 function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById("sound-toggle");
  if (btn) {
    btn.innerHTML = soundEnabled
      ? `<i id="sound-icon" class="fa-solid fa-volume-high text-red-500"></i> <span class="hidden sm:inline">SFX On</span>`
      : `<i id="sound-icon" class="fa-solid fa-volume-xmark text-slate-500"></i> <span class="hidden sm:inline">SFX Off</span>`;
  }
}

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