/**
 * SMART GROCERY PRO - NEO-CYBER & SUPABASE CLOUD SYNC CORE
 * Menjawab seluruh kebutuhan SRS F-01 s/d F-06 & Cerita Belanja Rian
 * Terintegrasi Cloud Supabase Hybrid (LocalStorage + Cloud Sync)
 */

(function () {
  'use strict';

  // --- SUPABASE EMBEDDED CONFIG ---
  const SUPABASE_CONFIG = {
    URL: 'https://wkrspzoixbkbpanoelvp.supabase.co',
    KEY: 'sb_publishable_1FHBAEbLjAx-FI9RrBxY5A_71gqi_dG'
  };

  // --- STORAGE KEYS ---
  const STORAGE_KEYS = {
    CART: 'smart_grocery_cart',
    BUDGET: 'smart_grocery_budget',
    HISTORY: 'smart_grocery_history',
    MASTER: 'smart_grocery_master',
    PRICE_HISTORY: 'smart_grocery_price_history',
    SOUND: 'smart_grocery_sound_enabled',
    PLANNER: 'smart_grocery_planner'
  };

  const AUTH_STORAGE_KEYS = {
    CURRENT_USER: 'smart_grocery_current_user',
    KNOWN_USERS: 'smart_grocery_known_users'
  };

  function getUserSlug(username) {
    if (!username) return 'rian';
    return String(username)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 32) || 'user';
  }

  function getUserKey(baseKey) {
    const slug = (appState && appState.currentUser && appState.currentUser.slug)
      ? appState.currentUser.slug
      : 'rian';
    return `sg_usr_${slug}_${baseKey}`;
  }

  // Default Master Reference Items for Rian & DT2 Evaluation (SRS F-04)
  const DEFAULT_MASTER_ITEMS = [
    { name: 'Beras 5kg', category: 'Bahan Pokok', unit: 'pack', lastPrice: 68000 },
    { name: 'Beras Rojolele', category: 'Bahan Pokok', unit: 'karung/5kg', lastPrice: 68000 },
    { name: 'Telur 1kg', category: 'Bahan Pokok', unit: 'kg', lastPrice: 32000 },
    { name: 'Garam 500g', category: 'Dapur & Bumbu', unit: 'pack', lastPrice: 5000 },
    { name: 'Minyak Goreng 2L', category: 'Bahan Pokok', unit: 'pouch', lastPrice: 43000 },
    { name: 'Wajan', category: 'Peralatan', unit: 'pcs', lastPrice: 100000 },
    { name: 'Sabun Mandi', category: 'Kebersihan', unit: 'pcs', lastPrice: 15000 },
    { name: 'Beras Ramos 5kg', category: 'Bahan Pokok', unit: 'pack', lastPrice: 72000 },
    { name: 'Minyak Goreng Sania 2L', category: 'Bahan Pokok', unit: 'pouch', lastPrice: 36000 },
    { name: 'Telur Ayam Negeri 1kg', category: 'Bahan Pokok', unit: 'kg', lastPrice: 28000 },
    { name: 'Sabun Cuci Deterjen 800g', category: 'Kebersihan', unit: 'pack', lastPrice: 19500 },
    { name: 'Pasta Gigi Herbal 190g', category: 'Kebersihan', unit: 'pcs', lastPrice: 14000 },
    { name: 'Sabun Pembersih Lantai 750ml', category: 'Kebersihan', unit: 'botol', lastPrice: 16000 },
    { name: 'Mie Instan Goreng Spesial', category: 'Makanan & Minuman', unit: 'pcs', lastPrice: 3100 },
    { name: 'Kecap Manis Refill 520ml', category: 'Dapur & Bumbu', unit: 'pouch', lastPrice: 17500 },
    { name: 'Biskuit Cokelat Kaleng', category: 'Makanan & Minuman', unit: 'kaleng', lastPrice: 32000 }
  ];

  // ==========================================================================
  // LOTTE MART GROCERY - PURI INDAH CATALOG (8 PRODUK KEBUTUHAN POKOK)
  // Harga real-time Lotte Mart Puri Indah, tidak perlu ketik manual!
  // ==========================================================================
  const ASTRO_OFFICIAL_CATALOG = [
    {
      id: 'lotte-beras-5kg',
      name: 'Beras Premium Setra Ramos 5kg',
      category: 'Bahan Pokok',
      unit: 'Karung 5kg',
      price: 69900,
      originalPrice: 74500,
      discountRaw: '-Rp 4.600',
      badge: 'Promo Sembako',
      emoji: '🌾',
      description: 'Beras putih pulen super quality Lotte Mart'
    },
    {
      id: 'astro-minyak-sunco-2l',
      name: 'Minyak Goreng SunCo 2L',
      category: 'Bahan Pokok',
      unit: 'Pouch 2L',
      price: 38900,
      originalPrice: 42000,
      discountRaw: '7%',
      badge: 'Best Seller',
      emoji: '🍳',
      description: 'Minyak goreng bening kelapa sawit pilihan'
    },
    {
      id: 'lotte-telur-1kg',
      name: 'Telur Ayam Negeri Fresh 1kg',
      category: 'Bahan Pokok',
      unit: 'Pack 1kg (16 btr)',
      price: 28000,
      originalPrice: 32000,
      discountRaw: '',
      badge: 'Harga Turun',
      emoji: '🥚',
      description: 'Telur ayam negeri segar kualitas pilihan'
    },
    {
      id: 'astro-gulaku-1kg',
      name: 'Gula Pasir Gulaku Tebu Murni 1kg',
      category: 'Bahan Pokok',
      unit: 'Pack 1kg',
      price: 18500,
      originalPrice: 19500,
      discountRaw: '',
      badge: 'Gula Murni',
      emoji: '🍬',
      description: 'Gula tebu kristal putih higienis'
    },
    {
      id: 'astro-tepung-segitiga-1kg',
      name: 'Tepung Terigu Segitiga Biru 1kg',
      category: 'Bahan Pokok',
      unit: 'Pack 1kg',
      price: 14500,
      originalPrice: 15500,
      discountRaw: '',
      badge: 'Serbaguna',
      emoji: '🌾',
      description: 'Tepung terigu protein sedang aneka olahan'
    },
    {
      id: 'astro-indomie-goreng-5',
      name: 'Indomie Goreng Spesial (Pack 5 Pcs)',
      category: 'Bahan Pokok',
      unit: 'Pack 5 pcs',
      price: 15500,
      originalPrice: 16500,
      discountRaw: '',
      badge: 'Favorit Hemat',
      emoji: '🍜',
      description: 'Mie goreng instan rasa spesial legendaris'
    },
    {
      id: 'lotte-garam-500g',
      name: 'Garam Dapur Beryodium 500g',
      category: 'Bahan Pokok',
      unit: 'Pack 500g',
      price: 5000,
      originalPrice: 5000,
      discountRaw: '',
      badge: 'Beryodium',
      emoji: '🧂',
      description: 'Garam halus beryodium untuk memasak'
    },
    {
      id: 'astro-ultra-fullcream-1l',
      name: 'Ultra Milk Full Cream UHT 1000ml',
      category: 'Bahan Pokok',
      unit: 'Kotak 1L',
      price: 21000,
      originalPrice: 22500,
      discountRaw: '',
      badge: 'Nutrisi Harian',
      emoji: '🥛',
      description: 'Susu sapi segar UHT murni kaya kalsium'
    }
  ];

  // Default Shopping Planner (Kebutuhan yang Direncanakan Sebelum ke Supermarket)
  const DEFAULT_SAMPLE_PLANNER = [
    { id: 'plan-1', name: 'Beras 5kg', category: 'Bahan Pokok', unit: 'pack', qty: 1, isPurchased: true, createdAt: Date.now() - 3600000 },
    { id: 'plan-2', name: 'Telur 1kg', category: 'Bahan Pokok', unit: 'kg', qty: 1, isPurchased: true, createdAt: Date.now() - 3000000 },
    { id: 'plan-3', name: 'Garam 500g', category: 'Dapur & Bumbu', unit: 'pack', qty: 1, isPurchased: true, createdAt: Date.now() - 2400000 },
    { id: 'plan-4', name: 'Minyak Goreng SunCo 2L', category: 'Bahan Pokok', unit: 'pouch', qty: 1, isPurchased: false, createdAt: Date.now() - 1800000 },
    { id: 'plan-5', name: 'Mie Instan Goreng Spesial', category: 'Makanan & Minuman', unit: 'pcs', qty: 5, isPurchased: false, createdAt: Date.now() - 1200000 },
    { id: 'plan-6', name: 'Kecap Manis Refill 520ml', category: 'Dapur & Bumbu', unit: 'pouch', qty: 1, isPurchased: false, createdAt: Date.now() - 600000 },
    { id: 'plan-7', name: 'Pasta Gigi Herbal 190g', category: 'Kebersihan', unit: 'pcs', qty: 1, isPurchased: false, createdAt: Date.now() - 300000 }
  ];

  // Default cart items for the starter experience.
  const DEFAULT_SAMPLE_CART = [
    {
      id: 'item-1',
      name: 'Beras 5kg',
      category: 'Bahan Pokok',
      unit: 'pack',
      qty: 1,
      price: 74000,
      lastMonthPrice: 68000,
      storeName: 'Lotte Mart Grocery - Puri Indah',
      priceDate: getLocalDateKey(),
      discountRaw: '',
      isPlanned: true,
      inPhysicalCart: true,
      createdAt: Date.now() - 3600000
    },
    {
      id: 'item-2',
      name: 'Telur 1kg',
      category: 'Bahan Pokok',
      unit: 'kg',
      qty: 1,
      price: 28000,
      lastMonthPrice: 32000,
      storeName: 'Lotte Mart Grocery - Puri Indah',
      priceDate: getLocalDateKey(),
      discountRaw: '',
      isPlanned: true,
      inPhysicalCart: true,
      createdAt: Date.now() - 3000000
    },
    {
      id: 'item-3',
      name: 'Garam 500g',
      category: 'Dapur & Bumbu',
      unit: 'pack',
      qty: 1,
      price: 5000,
      lastMonthPrice: 5000,
      storeName: 'Lotte Mart Grocery - Puri Indah',
      priceDate: getLocalDateKey(),
      discountRaw: '',
      isPlanned: true,
      inPhysicalCart: true,
      createdAt: Date.now() - 2400000
    },
    {
      id: 'item-4',
      name: 'Minyak Goreng SunCo 2L',
      category: 'Bahan Pokok',
      unit: 'pouch',
      qty: 1,
      price: 38900,
      lastMonthPrice: 42000,
      storeName: 'Lotte Mart Grocery - Puri Indah',
      priceDate: getLocalDateKey(),
      discountRaw: '7%',
      isPlanned: true,
      inPhysicalCart: false,
      createdAt: Date.now() - 1800000
    },
    {
      id: 'item-5',
      name: 'Mie Instan Goreng Spesial',
      category: 'Makanan & Minuman',
      unit: 'pcs',
      qty: 5,
      price: 3100,
      lastMonthPrice: 3100,
      storeName: 'Lotte Mart Grocery - Puri Indah',
      priceDate: getLocalDateKey(),
      discountRaw: '',
      isPlanned: true,
      inPhysicalCart: false,
      createdAt: Date.now() - 1200000
    }
  ];

  // --- STATE MANAGEMENT ---
  let appState = {
    currentUser: null,
    cart: [],
    planner: [],
    budgetLimit: 350000,
    history: [],
    masterItems: [],
    priceHistory: [],
    searchQuery: '',
    astroCategory: 'ALL',
    astroSearchQuery: '',
    editingItemId: null,
    soundEnabled: true,
    supabaseUrl: '',
    supabaseKey: '',
    supabaseClient: null,
    isCloudConnected: false,
    isRealtimeSubscribed: false,
    hasInitialCloudPulled: false,
    lastCartPushTimestamp: 0,
    lastPlannerPushTimestamp: 0,
    deviceId: 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    realtimeChannel: null
  };

  let routeAuthenticatedSupabaseUser = null;

  // Sound effects are disabled throughout Cartly.
  const AudioEngine = {
    init() {},
    playTap() {},
    playScan() {},
    playCashier() {},
    playSuccess() {},
    playAlert() {},
    playBeep() {},
    playPrinter() {},
    playLimitAlert() {}
  };
  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', event => {
      const checkoutTrigger = event.target?.closest?.('#btnFinishShopping, #btnCheckoutCashierSticky');
      if (!checkoutTrigger) return;
      event.preventDefault();
      openAstroCheckoutModal();
    }, true);
    initApp();
  });

  function initApp() {
    initAuthModule();
    initSupabaseClient();
    setupNavigation();
    initAstroCheckoutModule();
    setupEventListeners();
    setupSoundToggle();
    initShelfAdderTray();
    initBarcodeScannerModule();
    initStoreSelectorModule();
    initAstroCatalogModule();
    renderAll();
    initComparatorTool();
    initDockAutoHide();
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // --- AUTO-HIDE BOTTOM DOCK ON SCROLL ---
  function initDockAutoHide() {
    const scrollArea = document.querySelector('.neo-main-content');
    const dock = document.querySelector('.neo-bottom-dock');
    if (!scrollArea || !dock) return;

    let lastScrollY = 0;
    let ticking = false;

    scrollArea.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = scrollArea.scrollTop;
          const delta = currentY - lastScrollY;

          // Selalu tampil di paling atas
          if (currentY <= 10) {
            dock.classList.remove('dock-hidden');
          } else if (delta > 5) {
            // Scroll ke BAWAH → sembunyikan dock
            dock.classList.add('dock-hidden');
          } else if (delta < -5) {
            // Scroll ke ATAS → tampilkan dock
            dock.classList.remove('dock-hidden');
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  // --- STORAGE ---
  function loadDataFromStorage() {
    try {
      const cartKey = getUserKey(STORAGE_KEYS.CART);
      const plannerKey = getUserKey(STORAGE_KEYS.PLANNER);
      const budgetKey = getUserKey(STORAGE_KEYS.BUDGET);
      const historyKey = getUserKey(STORAGE_KEYS.HISTORY);
      const masterKey = getUserKey(STORAGE_KEYS.MASTER);
      const soundKey = getUserKey(STORAGE_KEYS.SOUND);
      const storeKey = getUserKey('store');

      const savedCart = localStorage.getItem(cartKey);
      const savedPlanner = localStorage.getItem(plannerKey);
      const savedBudget = localStorage.getItem(budgetKey);
      const savedHistory = localStorage.getItem(historyKey);
      const savedMaster = localStorage.getItem(masterKey);
      const savedPriceHistory = localStorage.getItem(getUserKey(STORAGE_KEYS.PRICE_HISTORY));
      const savedSound = localStorage.getItem(soundKey);
      const savedStore = localStorage.getItem(storeKey);

      const isRian = !appState.currentUser || appState.currentUser.slug === 'rian';

      // If user is Rian and no user-specific key exists, check legacy un-namespaced keys
      if (isRian && savedCart === null) {
        const legacyCart = localStorage.getItem(STORAGE_KEYS.CART);
        const legacyPlanner = localStorage.getItem(STORAGE_KEYS.PLANNER);
        const legacyBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
        const legacyHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const legacyMaster = localStorage.getItem(STORAGE_KEYS.MASTER);

        appState.cart = legacyCart ? JSON.parse(legacyCart) : DEFAULT_SAMPLE_CART;
        appState.planner = legacyPlanner ? JSON.parse(legacyPlanner) : DEFAULT_SAMPLE_PLANNER;
        appState.budgetLimit = legacyBudget ? Number(legacyBudget) : 350000;
        appState.history = legacyHistory ? JSON.parse(legacyHistory) : [];
        appState.masterItems = legacyMaster ? JSON.parse(legacyMaster) : DEFAULT_MASTER_ITEMS;

        saveCart();
        savePlanner();
        saveBudget();
        saveHistory();
        saveMaster();
      } else if (savedCart !== null) {
        // User already has isolated data saved
        appState.cart = JSON.parse(savedCart);
        appState.planner = savedPlanner ? JSON.parse(savedPlanner) : [];
        appState.budgetLimit = savedBudget ? Number(savedBudget) : 350000;
        appState.history = savedHistory ? JSON.parse(savedHistory) : [];
        appState.masterItems = savedMaster ? JSON.parse(savedMaster) : DEFAULT_MASTER_ITEMS;
      } else {
        // Brand new user (e.g. Budi, Siti, etc.) -> Clean slate! No data pollution
        appState.cart = [];
        appState.planner = [];
        appState.budgetLimit = 350000;
        appState.history = [];
        appState.masterItems = DEFAULT_MASTER_ITEMS;

        saveCart();
        savePlanner();
        saveBudget();
        saveHistory();
        saveMaster();
      }

      // Pastikan master items selalu memuat item acuan DT2 & Skenario Uji 4
      DEFAULT_MASTER_ITEMS.forEach(def => {
        const existing = appState.masterItems.find(m => m.name.toLowerCase() === def.name.toLowerCase());
        if (!existing) {
          appState.masterItems.push(def);
        }
      });

      appState.soundEnabled = savedSound !== null ? savedSound === 'true' : true;
      appState.priceHistory = savedPriceHistory ? JSON.parse(savedPriceHistory) : [];
      appState.activeStore = savedStore || localStorage.getItem('smart_grocery_store') || 'Lotte Mart Grocery - Puri Indah';
      updateStoreAcrossApp(appState.activeStore);

      appState.cart.forEach(item => {
        const previousMonthPrice = Number(item.lastMonthPrice);
        const store = String(item.storeName || appState.activeStore).trim().toLocaleLowerCase('id-ID');
        const month = getPreviousMonthKey(item.priceDate || getLocalDateKey());
        const name = String(item.name || '').trim().toLocaleLowerCase('id-ID');
        const historyExists = appState.priceHistory.some(entry => entry.name === name && entry.store === store && entry.month === month);
        if (item.priceDate && item.storeName && previousMonthPrice > 0 && month && !historyExists) {
          recordPriceObservation(item.name, previousMonthPrice, item.storeName, `${month}-01`);
        }
      });

      appState.supabaseUrl = SUPABASE_CONFIG.URL;
      appState.supabaseKey = SUPABASE_CONFIG.KEY;
    } catch (e) {
      console.warn('loadDataFromStorage error:', e);
      appState.cart = [];
      appState.planner = [];
      appState.budgetLimit = 350000;
      appState.masterItems = DEFAULT_MASTER_ITEMS;
      appState.activeStore = 'Lotte Mart Grocery - Puri Indah';
      appState.supabaseUrl = SUPABASE_CONFIG.URL;
      appState.supabaseKey = SUPABASE_CONFIG.KEY;
    }
  }

  // ==========================================================================
  // MULTI-DEVICE REALTIME BUS & SYNC ENGINE (INSTANT PHONE <-> LAPTOP REALTIME)
  // ==========================================================================
  let localSyncChannel = null;
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      localSyncChannel = new BroadcastChannel('smart_grocery_multidevice_bus');
      localSyncChannel.onmessage = (event) => {
        handleIncomingRealtimePayload(event.data);
      };
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.includes('smart_grocery_cart')) {
        loadDataFromStorage();
        renderCart();
        flashRealtimeSyncIndicator();
      } else if (e.key && e.key.includes('smart_grocery_planner')) {
        loadDataFromStorage();
        renderShoppingPlannerSection();
        flashRealtimeSyncIndicator();
      } else if (e.key && e.key.includes('smart_grocery_budget')) {
        loadDataFromStorage();
        updateBudgetHud();
        renderBudgetBreakdown();
        flashRealtimeSyncIndicator();
      }
    });
  }

  function broadcastRealtimeUpdate(type, data) {
    const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
    const message = {
      sourceDeviceId: appState.deviceId,
      userSyncId: userSyncId,
      type: type,
      data: data,
      timestamp: Date.now()
    };

    // 1. Broadcast locally to other tabs/windows
    try {
      if (localSyncChannel) localSyncChannel.postMessage(message);
    } catch (e) {}

    // 2. Broadcast to other devices over Supabase Realtime WebSocket (< 100ms latency)
    if (appState.realtimeChannel) {
      try {
        appState.realtimeChannel.send({
          type: 'broadcast',
          event: 'MULTIDEVICE_SYNC',
          payload: message
        });
      } catch (e) {
        console.warn('Realtime broadcast error:', e);
      }
    }
  }

  function handleIncomingRealtimePayload(payload) {
    if (!payload || payload.sourceDeviceId === appState.deviceId) return;
    const myUserSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
    if (payload.userSyncId && payload.userSyncId !== myUserSyncId) return;

    let needsRender = false;

    if (payload.type === 'cart' || payload.type === 'all') {
      if (Array.isArray(payload.data?.cart)) {
        appState.cart = payload.data.cart;
        saveCart(true); // simpan lokal tanpa push balik
        needsRender = true;
      }
    }

    if (payload.type === 'planner' || payload.type === 'all') {
      if (Array.isArray(payload.data?.planner)) {
        appState.planner = payload.data.planner;
        savePlanner(true);
        needsRender = true;
      }
    }

    if (payload.type === 'budget' || payload.type === 'all') {
      if (payload.data?.budgetLimit) {
        appState.budgetLimit = Number(payload.data.budgetLimit);
        saveBudget(true);
        needsRender = true;
      }
    }

    if (needsRender) {
      renderAll();
      flashRealtimeSyncIndicator();
    }
  }

  function flashRealtimeSyncIndicator() {
    const tag = document.getElementById('cloudStatusTag');
    if (tag) {
      tag.style.display = 'none';
      tag.classList.add('hidden');
    }
  }

  let syncCartTimer = null;
  function pushActiveCartToCloud() {
    clearTimeout(syncCartTimer);
    syncCartTimer = setTimeout(async () => {
      if (!appState.supabaseClient || !appState.currentUser?.id) return;
      try {
        const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
        const cartSyncId = 'active_cart_' + userSyncId;
        appState.lastCartPushTimestamp = Date.now();
        await appState.supabaseClient.from('receipts').upsert({
          id: cartSyncId,
          owner_id: appState.currentUser.id,
          date_label: 'ACTIVE_CART',
          budget_limit: Number(appState.budgetLimit) || 350000,
          grand_total: appState.cart.reduce((sum, it) => sum + (Number(it.finalPrice) || 0), 0),
          total_saved: appState.cart.reduce((sum, it) => sum + ((Number(it.savedPerUnit) || 0) * (Number(it.qty) || 1)), 0),
          item_count: appState.cart.length,
          items: appState.cart,
          created_at: new Date().toISOString()
        }, { onConflict: 'owner_id,id' });
      } catch (e) {
        console.warn('Realtime cart push error:', e);
      }
    }, 250);
  }

  let syncPlannerTimer = null;
  function pushActivePlannerToCloud() {
    clearTimeout(syncPlannerTimer);
    syncPlannerTimer = setTimeout(async () => {
      if (!appState.supabaseClient || !appState.currentUser?.id) return;
      try {
        const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
        const plannerSyncId = 'active_planner_' + userSyncId;
        appState.lastPlannerPushTimestamp = Date.now();
        await appState.supabaseClient.from('receipts').upsert({
          id: plannerSyncId,
          owner_id: appState.currentUser.id,
          date_label: 'ACTIVE_PLANNER',
          budget_limit: Number(appState.budgetLimit) || 350000,
          grand_total: 0,
          total_saved: 0,
          item_count: appState.planner.length,
          items: appState.planner,
          created_at: new Date().toISOString()
        }, { onConflict: 'owner_id,id' });
      } catch (e) {
        console.warn('Realtime planner push error:', e);
      }
    }, 250);
  }

  let syncSettingsTimer = null;
  function pushUserSettingsToCloud() {
    clearTimeout(syncSettingsTimer);
    syncSettingsTimer = setTimeout(async () => {
      if (!appState.supabaseClient || !appState.currentUser?.id) return;
      try {
        const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
        await appState.supabaseClient.from('user_settings').upsert({
          id: userSyncId,
          owner_id: appState.currentUser.id,
          budget_limit: Number(appState.budgetLimit) || 350000,
          sound_enabled: appState.soundEnabled,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Realtime settings push error:', e);
      }
    }, 300);
  }

  function saveCart(skipCloud = false) {
    localStorage.setItem(getUserKey(STORAGE_KEYS.CART), JSON.stringify(appState.cart));
    if (!skipCloud) {
      broadcastRealtimeUpdate('cart', { cart: appState.cart, budgetLimit: appState.budgetLimit });
      if (appState.supabaseClient) {
        pushActiveCartToCloud();
      }
    }
  }

  function savePlanner(skipCloud = false) {
    localStorage.setItem(getUserKey(STORAGE_KEYS.PLANNER), JSON.stringify(appState.planner));
    if (!skipCloud) {
      broadcastRealtimeUpdate('planner', { planner: appState.planner });
      if (appState.supabaseClient) {
        pushActivePlannerToCloud();
      }
    }
  }

  function saveBudget(skipCloud = false) {
    localStorage.setItem(getUserKey(STORAGE_KEYS.BUDGET), appState.budgetLimit.toString());
    if (!skipCloud) {
      broadcastRealtimeUpdate('budget', { budgetLimit: appState.budgetLimit, soundEnabled: appState.soundEnabled });
      if (appState.supabaseClient) {
        pushUserSettingsToCloud();
      }
    }
  }

  function saveHistory() {
    localStorage.setItem(getUserKey(STORAGE_KEYS.HISTORY), JSON.stringify(appState.history));
  }
  function saveMaster() {
    localStorage.setItem(getUserKey(STORAGE_KEYS.MASTER), JSON.stringify(appState.masterItems));
  }
  function saveSound() {
    localStorage.setItem(getUserKey(STORAGE_KEYS.SOUND), appState.soundEnabled.toString());
  }
  function saveStore(storeName) {
    localStorage.setItem(getUserKey('store'), storeName);
    localStorage.setItem('smart_grocery_store', storeName);
  }

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getShoppingDate() {
    return document.getElementById('sessionDatePicker')?.value || getLocalDateKey();
  }

  function getPreviousMonthKey(dateKey) {
    const [year, month] = String(dateKey || getLocalDateKey()).split('-').map(Number);
    if (!year || !month) return '';
    const previous = new Date(year, month - 2, 1);
    return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
  }

  function getMonthKey(dateKey) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || '')) ? dateKey.slice(0, 7) : '';
  }

  function savePriceHistory() {
    localStorage.setItem(getUserKey(STORAGE_KEYS.PRICE_HISTORY), JSON.stringify(appState.priceHistory));
  }

  function recordPriceObservation(name, price, storeName = appState.activeStore, date = getShoppingDate()) {
    const normalizedName = String(name || '').trim().toLocaleLowerCase('id-ID');
    const month = getMonthKey(date);
    const numericPrice = Number(price);
    if (!normalizedName || !month || !Number.isFinite(numericPrice) || numericPrice <= 0 || !storeName) return;

    const observation = {
      name: normalizedName,
      store: String(storeName).trim().toLocaleLowerCase('id-ID'),
      storeName: String(storeName).trim(),
      month,
      date,
      price: Math.round(numericPrice),
      recordedAt: Date.now()
    };
    const existingIndex = appState.priceHistory.findIndex(entry =>
      entry.name === observation.name && entry.store === observation.store && entry.month === observation.month
    );
    if (existingIndex >= 0) appState.priceHistory[existingIndex] = observation;
    else appState.priceHistory.push(observation);
    savePriceHistory();
  }

  function getPriceComparison(item) {
    const name = String(item.name || '').trim().toLocaleLowerCase('id-ID');
    const storeName = item.storeName || appState.activeStore;
    const store = String(storeName || '').trim().toLocaleLowerCase('id-ID');
    const date = item.priceDate || getShoppingDate();
    const previousMonth = getPreviousMonthKey(date);
    const savedObservation = appState.priceHistory
      .filter(entry => entry.name === name && entry.store === store && entry.month === previousMonth)
      .sort((a, b) => Number(b.recordedAt) - Number(a.recordedAt))[0];
    const previousPrice = Number(savedObservation?.price ?? item.lastMonthPrice);
    const currentPrice = Number(item.price);
    if (!Number.isFinite(previousPrice) || previousPrice <= 0 || !Number.isFinite(currentPrice) || currentPrice <= 0) return null;

    const comparison = comparePrices(currentPrice, previousPrice);
    return {
      ...comparison,
      previousPrice,
      storeName: savedObservation?.storeName || storeName
    };
  }

  function comparePrices(currentPrice, previousPrice) {
    const current = Number(currentPrice);
    const previous = Number(previousPrice);
    if (!Number.isFinite(current) || current <= 0 || !Number.isFinite(previous) || previous <= 0) return null;
    const difference = current - previous;
    return {
      difference,
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable'
    };
  }

  function validateCartItemInput({ name, category, unit, qty, price, storeName, date }) {
    if (!String(name || '').trim()) return 'name';
    if (!String(category || '').trim()) return 'category';
    if (!String(unit || '').trim()) return 'unit';
    if (!String(storeName || '').trim()) return 'store';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return 'date';
    if (!Number.isInteger(Number(qty)) || Number(qty) < 1) return 'qty';
    if (!Number.isInteger(Number(price)) || Number(price) <= 0) return 'price';
    return '';
  }


  // ==========================================================================
  // SUPABASE CLOUD INTEGRATION MODULE (REALTIME HYBRID)
  // ==========================================================================
  function initSupabaseClient() {
    if (appState.supabaseClient) return;
    if (appState.supabaseUrl && appState.supabaseKey && window.supabase) {
      try {
        function routeAuthenticatedUser(authUser, event) {
          if (!authUser) return;
          const meta = authUser.user_metadata || {};
          const email = authUser.email || authUser.new_email || meta.email || '';
          const username = meta.username || email.split('@')[0] || 'cartly_user';
          const displayName = meta.display_name || meta.full_name || meta.name || username;
          const userObj = {
            id: authUser.id,
            slug: getUserSlug(authUser.id),
            username,
            displayName,
            provider: authUser.app_metadata?.provider || 'email',
            email,
            avatarUrl: meta.avatar_url || meta.picture || '',
            avatarText: (displayName[0] || 'U').toUpperCase(),
            loginAt: Date.now()
          };

          if (event === 'PASSWORD_RECOVERY') {
            appState.authRecoveryUser = authUser;
            const recoveryModal = document.getElementById('modalForgotPasswordBackdrop');
            document.getElementById('formForgotStep1Email')?.classList.add('hidden');
            document.getElementById('formForgotStep2Reset')?.classList.remove('hidden');
            const description = document.getElementById('forgotModalDesc');
            if (description) description.textContent = 'Masukkan password baru untuk akun Anda.';
            document.getElementById('inputForgotOtp')?.removeAttribute('required');
            document.getElementById('inputForgotOtp')?.closest('div')?.classList.add('hidden');
            const targetEmail = document.getElementById('forgotTargetEmailDisplay');
            if (targetEmail) targetEmail.textContent = email;
            recoveryModal?.classList.remove('hidden');
            return;
          }

          if (appState.currentUser?.id !== authUser.id) {
            loginAsUser(userObj, event === 'SIGNED_IN');
          }
        }

        routeAuthenticatedSupabaseUser = routeAuthenticatedUser;

        appState.supabaseClient = window.supabase.createClient(appState.supabaseUrl, appState.supabaseKey);
        appState.isCloudConnected = true;
        updateCloudStatusUI(true);
        subscribeToRealtimeChanges();
        startRealtimeHeartbeat();

        appState.supabaseClient.auth.onAuthStateChange((event, session) => {
          if (!session?.user || localStorage.getItem('sg_explicit_logout') === 'true') return;
          if (!['INITIAL_SESSION', 'SIGNED_IN', 'PASSWORD_RECOVERY', 'USER_UPDATED'].includes(event)) return;
          // Keep network requests outside Supabase's auth state callback.
          window.setTimeout(() => routeAuthenticatedUser(session.user, event), 0);
        });

        // Read the persisted session as a second callback path, so a slow initial
        // auth event cannot leave a successfully signed-in user on the login screen.
        appState.supabaseClient.auth.getSession().then(({ data, error }) => {
          if (error) {
            console.warn('Supabase session restore error:', error.message);
            return;
          }
          const authUser = data?.session?.user;
          if (!authUser || localStorage.getItem('sg_explicit_logout') === 'true' || appState.currentUser?.id === authUser.id) return;
          routeAuthenticatedUser(authUser, 'INITIAL_SESSION');
        }).catch(error => console.warn('Supabase session restore error:', error));

        const callbackError = new URLSearchParams(window.location.search).get('error_description');
        if (callbackError) {
          showToast(`Login gagal: ${callbackError}`, 'danger');
          window.history.replaceState(null, '', window.location.pathname);
        }

        if (appState.currentUser) {
          pullDataFromSupabase(true).then(() => {
            appState.hasInitialCloudPulled = true;
          });
        }
      } catch (e) {
        console.error('Supabase init error:', e);
        appState.isCloudConnected = false;
        updateCloudStatusUI(false);
      }
    } else {
      appState.isCloudConnected = false;
      updateCloudStatusUI(false);
    }
  }

  function subscribeToRealtimeChanges() {
    if (!appState.supabaseClient) return;
    try {
      if (appState.realtimeChannel) {
        try {
          appState.supabaseClient.removeChannel(appState.realtimeChannel);
        } catch (e) {}
      }

      const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
      const channelName = 'room_' + userSyncId;

      appState.realtimeChannel = appState.supabaseClient
        .channel(channelName, {
          config: {
            broadcast: { self: false }
          }
        })
        .on('broadcast', { event: 'MULTIDEVICE_SYNC' }, (payload) => {
          if (payload && payload.payload) {
            handleIncomingRealtimePayload(payload.payload);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, () => {
          pullDataFromSupabase(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'master_products' }, () => {
          pullDataFromSupabase(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings' }, () => {
          pullDataFromSupabase(true);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            appState.isRealtimeSubscribed = true;
            appState.isCloudConnected = true;
            updateCloudStatusUI(true);
          } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
            appState.isRealtimeSubscribed = false;
            appState.isCloudConnected = false;
            updateCloudStatusUI(false);
          }
        });
    } catch (e) {
      console.warn('Realtime channel error:', e);
    }
  }

  // Poll only as a fallback while the Realtime listener is disconnected.
  let realtimeHeartbeatTimer = null;
  function startRealtimeHeartbeat() {
    if (realtimeHeartbeatTimer) clearInterval(realtimeHeartbeatTimer);
    realtimeHeartbeatTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && appState.supabaseClient && appState.currentUser?.id && !appState.isRealtimeSubscribed) {
        pullDataFromSupabase(true);
      }
    }, 1800);
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && appState.supabaseClient) {
        pullDataFromSupabase(true);
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (appState.supabaseClient) {
        pullDataFromSupabase(true);
      }
    });
  }

  function updateCloudStatusUI(isConnected) {
    const dot = document.getElementById('cloudStatusDot');
    const tag = document.getElementById('cloudStatusTag');
    const cloudIcon = document.getElementById('cloudIndicatorIcon');
    const cloudTitle = document.getElementById('cloudStatusTitle');
    const cloudSub = document.getElementById('cloudStatusSubtitle');

    if (tag) {
      tag.style.display = 'none';
      tag.classList.add('hidden');
    }

    if (isConnected) {
      if (dot) {
        dot.classList.add('connected');
        dot.title = 'Status: Sinkronisasi Aktif (Tersinkron di Semua HP)';
      }
      if (cloudIcon) cloudIcon.classList.add('connected');
      if (cloudTitle) cloudTitle.textContent = 'Data Belanja Tersinkron';
      if (cloudSub) cloudSub.textContent = 'Data belanja Anda otomatis tersimpan & sinkron di semua HP Anda.';
    } else {
      if (dot) {
        dot.classList.remove('connected');
        dot.title = 'Status: Mode Offline (Tersimpan di Ponsel)';
      }
      if (tag) tag.textContent = 'OFFLINE';
      if (cloudIcon) cloudIcon.classList.remove('connected');
      if (cloudTitle) cloudTitle.textContent = 'Tersimpan di Ponsel';
      if (cloudSub) cloudSub.textContent = 'Data aman tersimpan di penyimpanan perangkat ini.';
    }

    if (window.lucide) lucide.createIcons();
  }

  async function pushDataToSupabase(silent = false) {
    if (!appState.supabaseClient || !appState.currentUser?.id) {
      if (!silent) showToast('Koneksi sinkronisasi belum aktif!', 'warning');
      return;
    }

    try {
      if (!silent) showToast('Menyimpan data belanja...', 'info');

      // 1. Sync User Settings / Budget
      const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
      await appState.supabaseClient.from('user_settings').upsert({
        id: userSyncId,
        owner_id: appState.currentUser.id,
        budget_limit: appState.budgetLimit,
        sound_enabled: appState.soundEnabled,
        updated_at: new Date().toISOString()
      });

      // 2. Sync Master Items
      if (appState.masterItems.length > 0) {
        const masterPayload = appState.masterItems.map(item => ({
          owner_id: appState.currentUser.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          last_price: item.lastPrice,
          updated_at: new Date().toISOString()
        }));
        await appState.supabaseClient.from('master_products').upsert(masterPayload, { onConflict: 'owner_id,name' });
      }

      // 3. Sync Receipts (excluding active carts/planners)
      if (appState.history.length > 0) {
        const receiptsPayload = appState.history
          .filter(rcp => !rcp.id.startsWith('active_cart_') && !rcp.id.startsWith('active_planner_'))
          .map(rcp => ({
            id: rcp.id,
            owner_id: appState.currentUser.id,
            date_label: rcp.date,
            budget_limit: rcp.budgetLimit,
            grand_total: rcp.grandTotal,
            total_saved: rcp.totalSaved,
            item_count: rcp.itemCount,
            items: rcp.items,
            payment_method: rcp.paymentMethod || '',
            created_at: new Date().toISOString()
          }));
        if (receiptsPayload.length > 0) {
          await appState.supabaseClient.from('receipts').upsert(receiptsPayload, { onConflict: 'owner_id,id' });
        }
      }

      // 4. Sync Active Cart in Cloud (Realtime Across Phones)
      const cartSyncId = 'active_cart_' + userSyncId;
      appState.lastCartPushTimestamp = Date.now();
      await appState.supabaseClient.from('receipts').upsert({
        id: cartSyncId,
        owner_id: appState.currentUser.id,
        date_label: 'ACTIVE_CART',
        budget_limit: Number(appState.budgetLimit) || 350000,
        grand_total: appState.cart.reduce((sum, it) => sum + (Number(it.finalPrice) || 0), 0),
        total_saved: appState.cart.reduce((sum, it) => sum + ((Number(it.savedPerUnit) || 0) * (Number(it.qty) || 1)), 0),
        item_count: appState.cart.length,
        items: appState.cart,
        created_at: new Date().toISOString()
      }, { onConflict: 'owner_id,id' });

      // 5. Sync Active Planner in Cloud
      const plannerSyncId = 'active_planner_' + userSyncId;
      appState.lastPlannerPushTimestamp = Date.now();
      await appState.supabaseClient.from('receipts').upsert({
        id: plannerSyncId,
        owner_id: appState.currentUser.id,
        date_label: 'ACTIVE_PLANNER',
        budget_limit: Number(appState.budgetLimit) || 350000,
        grand_total: 0,
        total_saved: 0,
        item_count: appState.planner.length,
        items: appState.planner,
        created_at: new Date().toISOString()
      }, { onConflict: 'owner_id,id' });

      if (!silent) {
        AudioEngine.playSuccess();
        showToast('Seluruh data belanja tersimpan aman!', 'success');
      }
    } catch (err) {
      console.error('Push error:', err);
      if (!silent) showToast('Gagal menyimpan data: ' + (err.message || 'Koneksi terputus'), 'danger');
    }
  }

  async function pullDataFromSupabase(silent = false) {
    if (!appState.supabaseClient || !appState.currentUser?.id) {
      if (!silent) showToast('Koneksi sinkronisasi belum aktif!', 'warning');
      return;
    }

    try {
      if (!silent) showToast('Menyinkronkan data belanja...', 'info');

      // 1. Fetch Master Products
      const { data: masterData, error: masterErr } = await appState.supabaseClient
        .from('master_products')
        .select('*')
        .eq('owner_id', appState.currentUser.id);

      if (!masterErr && masterData && masterData.length > 0) {
        appState.masterItems = masterData.map(m => ({
          name: m.name,
          category: m.category,
          unit: m.unit,
          lastPrice: Number(m.last_price)
        }));
        saveMaster();
      }

      // 2. Fetch Receipts History & Active Cart / Planner
      const { data: receiptsData, error: rcpErr } = await appState.supabaseClient
        .from('receipts')
        .select('*')
        .eq('owner_id', appState.currentUser.id)
        .order('created_at', { ascending: false });

      if (!rcpErr && receiptsData && receiptsData.length > 0) {
        // Struk riwayat transaksi selesai (filter out active cart / planner)
        const actualReceipts = receiptsData.filter(r => !r.id.startsWith('active_cart_') && !r.id.startsWith('active_planner_'));
        const cloudHistory = actualReceipts.map(r => ({
          id: r.id,
          date: (r.date_label || '').replace(/[\r\n]+/g, ' ').replace(/(.)\1{8,}/g, '$1$1$1...').trim() || 'Struk Belanja',
          createdAt: r.created_at || '',
          budgetLimit: Number(r.budget_limit) || 0,
          grandTotal: Number(r.grand_total) || 0,
          totalSaved: Number(r.total_saved) || 0,
          itemCount: Number(r.item_count) || 0,
          items: Array.isArray(r.items) ? r.items : [],
          paymentMethod: r.payment_method || '',
          paymentStatus: r.payment_method && !/belum dibayar|catatan belanja/i.test(r.payment_method) ? 'paid' : 'unpaid'
        }));
        const cloudReceiptIds = new Set(cloudHistory.map(receipt => String(receipt.id)));
        appState.history = [
          ...cloudHistory,
          ...appState.history.filter(receipt => !cloudReceiptIds.has(String(receipt.id)))
        ];
        saveHistory();
        renderHistoryList();

        // Sinkronisasi Troli Aktif Pengguna dari Cloud
        const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
        const cartSyncId = 'active_cart_' + userSyncId;
        const cartRow = receiptsData.find(r => r.id === cartSyncId);

        const timeSinceMyCartPush = Date.now() - (appState.lastCartPushTimestamp || 0);
        if (timeSinceMyCartPush > 2000) {
          if (cartRow && Array.isArray(cartRow.items)) {
            appState.cart = cartRow.items;
            saveCart(true); // skip pushing back to cloud
          } else if (appState.cart.length > 0 && !cartRow) {
            // Jika akun baru punya keranjang lokal tapi di cloud belum ada, upload ke cloud
            pushActiveCartToCloud();
          }
        }

        // Sinkronisasi Daftar Rencana (Planner) dari Cloud
        const plannerSyncId = 'active_planner_' + userSyncId;
        const plannerRow = receiptsData.find(r => r.id === plannerSyncId);

        const timeSinceMyPlannerPush = Date.now() - (appState.lastPlannerPushTimestamp || 0);
        if (timeSinceMyPlannerPush > 2000) {
          if (plannerRow && Array.isArray(plannerRow.items)) {
            appState.planner = plannerRow.items;
            savePlanner(true); // skip pushing back to cloud
          } else if (appState.planner.length > 0 && !plannerRow) {
            pushActivePlannerToCloud();
          }
        }
      }

      // 3. Fetch Settings
      const userSyncId = 'user_' + (appState.currentUser ? appState.currentUser.slug : 'rian');
      const { data: settingsData } = await appState.supabaseClient
        .from('user_settings')
        .select('*')
        .eq('id', userSyncId)
        .eq('owner_id', appState.currentUser.id)
        .single();

      if (settingsData) {
        appState.budgetLimit = Number(settingsData.budget_limit) || 350000;
        appState.soundEnabled = settingsData.sound_enabled ?? true;
        saveBudget(true);
        saveSound();
      }

      appState.hasInitialCloudPulled = true;
      renderAll();
      if (!silent) {
        AudioEngine.playSuccess();
        showToast('Data belanja berhasil disinkronkan!', 'success');
      }
    } catch (err) {
      console.error('Pull error:', err);
      appState.hasInitialCloudPulled = true;
      if (!silent) showToast('Gagal menyinkronkan data: ' + (err.message || 'Error'), 'danger');
    }
  }

  async function syncCloudData() {
    if (!appState.supabaseClient) {
      initSupabaseClient();
    }
    if (!appState.supabaseClient) {
      showToast('Koneksi sinkronisasi belum aktif', 'danger');
      return;
    }
    AudioEngine.playTap();
    showToast('Menyinkronkan antar perangkat...', 'info');
    await pushDataToSupabase();
    await pullDataFromSupabase();
    showToast('Semua data belanja sudah sinkron!', 'success');
  }

  // ==========================================================================
  // F-03: LOGIKA KALKULATOR DISKON BERTINGKAT
  // ==========================================================================
  function calculateDiscount(originalPrice, discountString) {
    if (!originalPrice || originalPrice <= 0) {
      return { finalUnitPrice: 0, savedPerUnit: 0, discountLabel: '', formulaText: '' };
    }

    const price = Number(originalPrice);
    if (!discountString || typeof discountString !== 'string' || discountString.trim() === '') {
      return {
        finalUnitPrice: price,
        savedPerUnit: 0,
        discountLabel: '',
        formulaText: 'Harga Normal (Tanpa Promo)'
      };
    }

    const cleanStr = discountString.trim().toLowerCase();

    // Buy 2 Get 1
    if (cleanStr.includes('buy 2 get 1') || cleanStr.includes('beli 2 gratis 1')) {
      const discountedUnit = (price * 2) / 3;
      const saved = price - discountedUnit;
      return {
        finalUnitPrice: Math.round(discountedUnit),
        savedPerUnit: Math.round(saved),
        discountLabel: 'Beli 2 Gratis 1 (33.3%)',
        formulaText: `Beli 3 bayar 2: Rp ${(price * 2).toLocaleString('id-ID')} / 3 = Rp ${Math.round(discountedUnit).toLocaleString('id-ID')}`
      };
    }

    // Direct Nominal (accept both "Rp 5.000" and "-Rp 5.000").
    const nominalMatch = cleanStr.match(/^-?\s*(?:rp\s*)?([\d.]+)$/);
    if (nominalMatch) {
      const nominal = Number(nominalMatch[1].replace(/\./g, ''));
      if (nominal > 0 && nominal < price) {
        const finalPrice = price - nominal;
        return {
          finalUnitPrice: finalPrice,
          savedPerUnit: nominal,
          discountLabel: `-Rp ${formatNumber(nominal)}`,
          formulaText: `Potongan Langsung: Rp ${formatNumber(price)} - Rp ${formatNumber(nominal)} = Rp ${formatNumber(finalPrice)}`
        };
      }
    }

    // Tiered Discount (50+20)
    if (cleanStr.includes('+') || cleanStr.includes('%') || !isNaN(Number(cleanStr))) {
      const parts = cleanStr.split('+').map(p => {
        const num = parseFloat(p.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      }).filter(num => num > 0);

      if (parts.length > 0) {
        if (parts.some(pct => pct > 100)) {
          return {
            finalUnitPrice: price,
            savedPerUnit: 0,
            discountLabel: '',
            formulaText: 'Setiap lapis diskon harus antara 1% dan 100%'
          };
        }
        let currentAmount = price;
        const steps = [];
        parts.forEach((pct, index) => {
          const cut = currentAmount * (pct / 100);
          const afterCut = currentAmount - cut;
          steps.push(`Lapis ${index + 1} (-${pct}%): Rp ${formatNumber(Math.round(currentAmount))} ➔ Rp ${formatNumber(Math.round(afterCut))}`);
          currentAmount = afterCut;
        });

        const finalPrice = Math.round(currentAmount);
        const saved = price - finalPrice;
        const totalEffectivePct = ((saved / price) * 100).toFixed(1);

        return {
          finalUnitPrice: finalPrice,
          savedPerUnit: saved,
          discountLabel: `Promo ${parts.join('% + ')}% (-${totalEffectivePct}%)`,
          formulaText: steps.join(' | ')
        };
      }
    }

    return {
      finalUnitPrice: price,
      savedPerUnit: 0,
      discountLabel: '',
      formulaText: 'Format diskon tidak dikenali'
    };
  }

  // ==========================================================================
  function calculateLineTotal(price, discountString, qty) {
    const quantity = Number(qty);
    if (!Number.isInteger(quantity) || quantity < 1) return 0;
    return calculateDiscount(price, discountString).finalUnitPrice * quantity;
  }

  function getBudgetLevel(percentage) {
    if (percentage >= 90 && percentage <= 100) return 'warning';
    if (percentage > 100) return 'over';
    return 'normal';
  }

  // F-05: PENGENDALI ANGGARAN (NEO-BENTO SAFETY CAP) CALCULATION & UI
  // ==========================================================================
  function getPurchasedCartItems() {
    return appState.cart.filter(item => item.inPhysicalCart === true);
  }

  function calculateCurrentSubtotal() {
    return getPurchasedCartItems().reduce((total, item) => {
      return total + calculateLineTotal(item.price, item.discountRaw, item.qty);
    }, 0);
  }

  function updateBudgetHud() {
    let totalSpent = 0;
    let totalSaved = 0;
    let totalQty = 0;

    const purchasedItems = getPurchasedCartItems();
    purchasedItems.forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const lineTotal = calculateLineTotal(item.price, item.discountRaw, item.qty);
      totalSpent += lineTotal;
      totalSaved += disc.savedPerUnit * item.qty;
      totalQty += item.qty;
    });

    const limit = appState.budgetLimit;
    const remaining = limit - totalSpent;
    const percentage = limit > 0 ? (totalSpent / limit) * 100 : 0;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    const checkoutButton = document.getElementById('btnFinishShopping');
    if (checkoutButton) {
      const overBudget = totalSpent > limit;
      const allowed = purchasedItems.length > 0 && !overBudget;
      checkoutButton.disabled = !allowed;
      checkoutButton.setAttribute('aria-disabled', String(!allowed));
      checkoutButton.title = overBudget
        ? `Kurangi belanja Rp ${formatNumber(totalSpent - limit)} agar sesuai batas anggaran.`
        : allowed ? 'Lanjut ke pembayaran' : 'Centang barang yang sudah dibeli';
      const checkoutLabel = document.getElementById('checkoutButtonLabel');
      const checkoutHint = document.getElementById('checkoutButtonHint');
      if (checkoutLabel) checkoutLabel.textContent = overBudget ? 'Anggaran Terlampaui' : 'Bayar Sekarang';
      if (checkoutHint) checkoutHint.textContent = overBudget ? 'Kurangi barang untuk lanjut' : 'Lanjut ke pembayaran';
    }

    // Text Elements
    document.getElementById('hudTotalSpending').textContent = formatNumber(totalSpent);
    const shortLimit = limit >= 1000000 ? `${(limit / 1000000).toFixed(1)}jt` : `${Math.round(limit / 1000)}k`;
    document.getElementById('hudBudgetLimit').textContent = `Rp ${shortLimit}`;
    const hudPercentEl = document.getElementById('budgetPercentLabel');
    if (hudPercentEl) hudPercentEl.textContent = `${percentage.toFixed(0)}%`;

    const hudSavingsEl = document.getElementById('hudTotalSavingsText');
    if (hudSavingsEl) hudSavingsEl.textContent = `Hemat Rp ${formatNumber(totalSaved)}`;

    const hudSubtickMax = document.getElementById('hudSubtickMax');
    if (hudSubtickMax) hudSubtickMax.textContent = '100% Limit';

    const hudSubtickLimit = document.getElementById('hudSubtickLimit');
    if (hudSubtickLimit) hudSubtickLimit.textContent = `Rp ${formatNumber(limit)}`;

    document.getElementById('summaryTotalItems').textContent = `${purchasedItems.length} Jenis (${totalQty} Qty)`;
    document.getElementById('summaryTotalSaved').textContent = `Hemat Rp ${formatNumber(totalSaved)}`;

    // DOM Elements
    const hudCard = document.getElementById('budgetHudCard');
    const progressBar = document.getElementById('budgetProgressBar');
    const statusBadge = document.getElementById('hudStatusBadge');
    const statusText = document.getElementById('hudStatusText');
    const statusIcon = document.getElementById('hudStatusIcon');
    const remainingText = document.getElementById('hudRemainingText');

    if (progressBar) {
      progressBar.style.width = `${clampedPercentage}%`;
      progressBar.setAttribute('aria-valuenow', String(Math.round(clampedPercentage)));
    }

    const navBudgetDot = document.getElementById('navBudgetDot');
    if (statusBadge) {
      statusBadge.style.display = 'none';
      statusBadge.classList.add('hidden');
    }

    const budgetLevel = getBudgetLevel(percentage);
    if (budgetLevel === 'normal') {
      if (remainingText) {
        remainingText.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b0c14] border border-[#334155]"><span class="text-slate-200 text-[11px] font-semibold">Sisa anggaran:</span><strong class="text-emerald-300 font-black text-[13px]">Rp ${formatNumber(remaining)}</strong></span>`;
      }
      if (hudPercentEl) hudPercentEl.className = 'font-mono text-sm sm:text-base text-emerald-400 font-black tracking-tight';
      if (navBudgetDot) navBudgetDot.className = 'w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-1';
      if (progressBar) progressBar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
    } else if (budgetLevel === 'warning') {
      if (remainingText) {
        remainingText.innerHTML = `<div class="budget-alert budget-alert-warning" role="status"><strong>⚠ Anggaran hampir habis (${percentage.toFixed(0)}%)</strong><span>Sisa Rp ${formatNumber(remaining)}</span></div>`;
      }
      if (hudPercentEl) hudPercentEl.className = 'font-mono text-sm sm:text-base text-yellow-400 font-black tracking-tight';
      if (navBudgetDot) navBudgetDot.className = 'w-2 h-2 rounded-full bg-yellow-400 absolute -top-0.5 -right-1';
      if (progressBar) progressBar.className = 'h-full bg-yellow-400 rounded-full transition-all duration-300';
    } else {
      const overAmount = Math.abs(remaining);
      if (remainingText) {
        remainingText.innerHTML = `<div class="budget-alert budget-alert-over" role="alert"><strong>Anggaran terlampaui (${percentage.toFixed(0)}%)</strong><span>Kurangi Rp ${formatNumber(overAmount)} untuk kembali ke batas.</span></div>`;
      }
      if (hudPercentEl) hudPercentEl.className = 'font-mono text-sm sm:text-base text-rose-400 font-black tracking-tight animate-pulse';
      if (navBudgetDot) navBudgetDot.className = 'w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-1';
      if (progressBar) progressBar.className = 'h-full bg-rose-500 rounded-full transition-all duration-300';
      if (navBudgetDot) navBudgetDot.className = 'w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-1 animate-ping';
      if (progressBar) progressBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300';
      AudioEngine.playAlert();
    }

    // Dock Badges & Sticky Checkout Total
    const stickyGrandTotal = document.getElementById('cartBottomGrandTotal');
    if (stickyGrandTotal) stickyGrandTotal.textContent = `Rp ${formatNumber(totalSpent)}`;

    const navCartBadge = document.getElementById('navCartBadge');
    if (navCartBadge) navCartBadge.textContent = appState.cart.length;

    // Macro Allocator & Budget Screen Sync (tabDompet)
    const dompetLimitEl = document.getElementById('hudDompetLimitDisplay');
    if (dompetLimitEl) dompetLimitEl.textContent = `Rp ${formatNumber(limit)}`;

    const planSpend = document.getElementById('budgetCurrentSpend');
    if (planSpend) planSpend.textContent = `Rp ${formatNumber(totalSpent)}`;

    const planRemain = document.getElementById('budgetRemainingAmount');
    if (planRemain) {
      if (remaining >= 0) {
        planRemain.textContent = `Rp ${formatNumber(remaining)}`;
        planRemain.className = 'font-mono text-xs sm:text-sm font-black text-citrus';
      } else {
        planRemain.textContent = `-Rp ${formatNumber(Math.abs(remaining))}`;
        planRemain.className = 'font-mono text-xs sm:text-sm font-black text-rose-400 animate-pulse';
      }
    }

    const planMeter = document.getElementById('budgetHealthMeter');
    if (planMeter) {
      planMeter.style.width = `${clampedPercentage}%`;
      if (budgetLevel === 'normal') {
        planMeter.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
      } else if (budgetLevel === 'warning') {
        planMeter.className = 'h-full bg-yellow-500 rounded-full transition-all duration-300';
      } else {
        planMeter.className = 'h-full bg-rose-600 rounded-full transition-all duration-300';
      }
    }

    const planPercent = document.getElementById('budgetHealthPercent');
    if (planPercent) planPercent.textContent = `${percentage.toFixed(0)}% Terpakai`;

    const budgetTabStatusPill = document.getElementById('budgetTabStatusPill');
    if (budgetTabStatusPill) {
      budgetTabStatusPill.style.display = 'none';
      budgetTabStatusPill.classList.add('hidden');
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // ==========================================================================
  // RENDER CART ITEMS (STITCH SCREEN 2: TACTILE TICKET LOT CARDS)
  // ==========================================================================
  function renderCart() {
    const container = document.getElementById('cartItemsList');
    const summaryBottom = document.getElementById('cartSummaryBottom');
    const filteredItems = appState.cart.filter(item =>
      appState.searchQuery === '' || item.name.toLowerCase().includes(appState.searchQuery.toLowerCase())
    );

    if (appState.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state" role="status">
          <span class="material-symbols-outlined" aria-hidden="true">shopping_basket</span>
          <h3>Troli belanja masih kosong</h3>
          <p>Tambahkan barang dari katalog atau catat barang yang Anda temukan di toko.</p>
          <button type="button" class="cart-empty-action" onclick="document.getElementById('btnOpenAddModal')?.click()">Tambah barang</button>
        </div>
      `;
      summaryBottom.classList.add('hidden');
      updateBudgetHud();
      return;
    }

    summaryBottom.classList.toggle('hidden', !document.getElementById('tabCart')?.classList.contains('active'));

    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center bg-white rounded-2xl border-2 border-dashed border-stone-300 text-stone-500 font-mono text-xs">
          TIDAK ADA ITEM DITEMUKAN PADA KATEGORI INI
        </div>
      `;
      updateBudgetHud();
      return;
    }

    let html = '';
    filteredItems.forEach((item, index) => {
      const discount = calculateDiscount(item.price, item.discountRaw);
      const lineTotal = calculateLineTotal(item.price, item.discountRaw, item.qty);
      const hasDiscount = discount.savedPerUnit > 0;
      const isChecked = !!item.inPhysicalCart;
      const comparison = getPriceComparison(item);
      const comparisonText = comparison
        ? comparison.direction === 'up'
          ? `↗ Naik Rp ${formatNumber(comparison.difference)} dari bulan lalu`
          : comparison.direction === 'down'
            ? `↘ Turun Rp ${formatNumber(Math.abs(comparison.difference))} dari bulan lalu`
            : '→ Stabil dibanding bulan lalu'
        : 'Belum ada riwayat harga bulan lalu';

      html += `
        <div class="neo-ticket-card ticket-perforation-left ${isChecked ? 'is-checked' : 'is-pending'}" data-id="${escapeHtml(item.id)}">
          <!-- Top Row: Checkbox, Category, Barcode Strip & Quick Actions -->
          <div class="flex items-center justify-between border-b border-stone-200/80 pb-2">
            <div class="flex items-center gap-2">
              <button type="button" class="cart-check-btn ${isChecked ? 'checked' : ''}" aria-pressed="${isChecked}" onclick="window.toggleItemInCart('${item.id}')" title="${isChecked ? 'Barang masuk total dan transaksi' : 'Centang barang yang sudah dibeli'}">
                <i data-lucide="check"></i>
              </button>
              <div class="flex items-center gap-1.5">
                <span class="cat-mono-tag">${escapeHtml(item.category)}</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              ${isChecked ? `
                <span class="rubber-stamp rubber-stamp-green text-[9px]">DI RAK ✓</span>
              ` : `
                <span class="rubber-stamp rubber-stamp-pending text-[9px]">PENDING</span>
              `}
              <div class="flex items-center gap-0.5 ml-1">
                <button class="btn-ico-subtle" onclick="window.editCartItem('${item.id}')" title="Edit">
                  <i data-lucide="edit-3"></i>
                </button>
                <button type="button" class="btn-ico-subtle trash" onclick="window.deleteCartItem('${escapeHtml(item.id)}')" title="Hapus">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Middle Row: Title, Spec & Status Rencana -->
          <div class="flex items-start justify-between gap-2 pt-0.5">
            <div>
              <h4 class="card-item-title text-[15px] font-extrabold text-white leading-snug">${escapeHtml(item.name)}</h4>
              <div class="flex items-center gap-2 mt-1">
                <span class="font-mono text-[11px] text-white font-semibold">Kemasan: ${escapeHtml(item.unit)}</span>
                ${item.isPlanned !== false ? `
                  <span class="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <i data-lucide="check-circle-2" class="w-2.5 h-2.5"></i>
                    <span>Rencana</span>
                  </span>
                ` : `
                  <span class="inline-flex items-center gap-1 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200" title="Di luar daftar rencana">
                    <i data-lucide="alert-circle" class="w-2.5 h-2.5"></i>
                    <span>Impulsif</span>
                  </span>
                `}
              </div>
            </div>
          </div>

          <!-- Pricing Flow & Badges Row -->
          <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-dashed border-stone-200">
            <span class="unit-rate-mono">
              ${hasDiscount ? `<span class="strike text-stone-400">Rp ${formatNumber(item.price)}</span>` : ''}
              <strong>Rp ${formatNumber(discount.finalUnitPrice)}</strong><span class="text-stone-500">/${escapeHtml(item.unit)}</span>
            </span>
            <span class="price-comparison price-trend-${comparison?.direction || 'unknown'}" aria-label="${escapeHtml(comparisonText)} di ${escapeHtml(comparison?.storeName || item.storeName || appState.activeStore)}">
              ${escapeHtml(comparisonText)} <span class="price-comparison-store">· ${escapeHtml(comparison?.storeName || item.storeName || appState.activeStore)}</span>
            </span>

            <!-- F-03: Stamped Discount Rubber Stamp -->
            ${hasDiscount ? `
              <span class="rubber-stamp rubber-stamp-terracotta text-[9px]">
                <i data-lucide="tag"></i>
                <span>${discount.discountLabel}</span>
              </span>
            ` : ''}
            ${hasDiscount && discount.formulaText && discount.formulaText.includes('Lapis') ? `
              <div class="w-full text-[10.5px] font-mono text-purple-900 bg-purple-50/90 px-2.5 py-1.5 rounded-xl border border-purple-200 mt-1 flex items-start gap-1">
                <span class="font-bold shrink-0">✨ Diskon Kompound:</span>
                <span>${escapeHtml(discount.formulaText)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Row: Tactile POS Stepper & Chunky Subtotal -->
          <div class="flex items-center justify-between pt-2 border-t border-[#222638] mt-1">
            <div class="flex items-center gap-1.5 bg-[#0b0c14] p-1 rounded-xl border border-[#222638] shadow-pos-key">
              <button type="button" class="w-11 h-11 rounded-lg bg-[#181d30] border border-[#262f4c] text-white font-black flex items-center justify-center hover:bg-[#202742] active:scale-95 cursor-pointer ${item.qty === 1 ? 'text-rose-400' : ''}" onclick="window.changeItemQty('${item.id}', -1)" title="${item.qty === 1 ? 'Hapus Barang' : 'Kurangi'}">
                <i data-lucide="${item.qty === 1 ? 'trash-2' : 'minus'}"></i>
              </button>
              <input type="number" inputmode="numeric" min="1" step="1" class="cart-qty-input w-12 text-center font-mono font-black text-sm text-white bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 rounded p-1" value="${item.qty}" onchange="window.setItemQty('${escapeHtml(item.id)}', this.value)" oninput="window.previewItemQty('${escapeHtml(item.id)}', this.value)" title="Ketik kuantitas langsung" aria-label="Kuantitas ${escapeHtml(item.name)}" />
              <button type="button" class="w-11 h-11 rounded-lg bg-[#181d30] border border-[#262f4c] text-white font-black flex items-center justify-center hover:bg-[#202742] active:scale-95 cursor-pointer" onclick="window.changeItemQty('${item.id}', 1)" title="Tambah">
                <i data-lucide="plus"></i>
              </button>
            </div>

            <div class="text-right">
              <div data-item-subtotal-label class="font-mono text-[9px] ${isChecked ? 'text-stone-500' : 'text-slate-500'} font-bold uppercase tracking-wider">${isChecked ? `Subtotal (${item.qty} ${escapeHtml(item.unit)})` : 'Belum dibeli'}</div>
              <div data-item-subtotal class="font-headline-md text-[18px] font-black ${isChecked ? 'text-emerald-700' : 'text-slate-400 line-through'} tracking-tight">Rp ${formatNumber(lineTotal)}</div>
              ${isChecked ? '' : '<div class="text-[9px] text-slate-500">Tidak masuk total</div>'}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    updateBudgetHud();

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  // Toggle Physical Cart Status
  window.toggleItemInCart = function (id) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;
    item.inPhysicalCart = !item.inPhysicalCart;
    AudioEngine.playTap();
    saveCart();
    renderCart();
  };

  // ==========================================================================
  // F-02: LOGIKA STEPPER & TOUCH
  // ==========================================================================
  window.changeItemQty = function (id, delta) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      window.deleteCartItem(id);
      return;
    }

    item.qty = newQty;
    AudioEngine.playTap();
    saveCart();
    renderCart();
  };

  window.setItemQty = function (id, value) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;

    const parsed = Number(value);
    item.qty = Number.isInteger(parsed) && parsed >= 1 ? parsed : Math.max(1, Number(item.qty) || 1);
    AudioEngine.playTap();
    saveCart();
    renderCart();
  };

  window.previewItemQty = function (id, value) {
    const item = appState.cart.find(i => i.id === id);
    const parsed = Number(value);
    if (!item || !Number.isInteger(parsed) || parsed < 1) return;

    item.qty = parsed;
    const row = [...document.querySelectorAll('.neo-ticket-card')].find(card => card.dataset.id === String(id));
    const discount = calculateDiscount(item.price, item.discountRaw);
    const subtotal = row?.querySelector('[data-item-subtotal]');
    const subtotalLabel = row?.querySelector('[data-item-subtotal-label]');
    if (subtotal) subtotal.textContent = `Rp ${formatNumber(discount.finalUnitPrice * parsed)}`;
    if (subtotalLabel && item.inPhysicalCart) subtotalLabel.textContent = `Subtotal (${parsed} ${item.unit})`;
    saveCart();
    updateBudgetHud();
  };

  window.deleteCartItem = function (id) {
    const item = appState.cart.find(i => i.id === id);
    if (!item) return;
    const modal = document.getElementById('modalConfirmDeleteItem');
    if (!modal) return;
    document.getElementById('confirmDeleteItemName').textContent = item.name;
    modal.classList.remove('hidden');
    modal.dataset.itemId = String(item.id);
    document.getElementById('btnConfirmDeleteItem')?.focus();
  };

  const deleteItemModal = document.getElementById('modalConfirmDeleteItem');
  const closeDeleteItemModal = () => {
    if (!deleteItemModal) return;
    deleteItemModal.classList.add('hidden');
    deleteItemModal.dataset.itemId = '';
  };
  document.getElementById('btnCancelDeleteItem')?.addEventListener('click', closeDeleteItemModal);
  document.getElementById('btnConfirmDeleteItem')?.addEventListener('click', () => {
    const itemId = deleteItemModal?.dataset.itemId;
    const item = appState.cart.find(entry => String(entry.id) === String(itemId));
    if (!item) return closeDeleteItemModal();
    appState.cart = appState.cart.filter(entry => String(entry.id) !== String(itemId));
    closeDeleteItemModal();
    AudioEngine.playTap();
    saveCart();
    renderCart();
    renderAstroCatalog();
    showToast(`"${item.name}" dihapus dari troli`, 'warning');
  });
  deleteItemModal?.addEventListener('click', event => {
    if (event.target === deleteItemModal) closeDeleteItemModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && deleteItemModal && !deleteItemModal.classList.contains('hidden')) {
      closeDeleteItemModal();
    }
  });

  // ==========================================================================
  // MODAL TAMBAH & EDIT ITEM
  // ==========================================================================
  const modalItemBackdrop = document.getElementById('modalItemBackdrop');
  const formItemModal = document.getElementById('formItemModal');
  const inputItemName = document.getElementById('inputItemName');
  const selectItemCategory = document.getElementById('selectItemCategory');
  const selectItemUnit = document.getElementById('selectItemUnit');
  const inputItemQty = document.getElementById('inputItemQty');
  const inputItemPrice = document.getElementById('inputItemPrice');
  const inputItemDiscount = document.getElementById('inputItemDiscount');
  const autoSuggestContainer = document.getElementById('autoSuggestContainer');

  function openItemModal(itemId = null) {
    appState.editingItemId = itemId;
    const title = document.getElementById('modalItemTitle');
    const submitText = document.getElementById('btnSubmitItemText');

    if (itemId) {
      const item = appState.cart.find(i => i.id === itemId);
      if (!item) return;
      title.textContent = 'Edit Produk';
      submitText.textContent = 'SIMPAN PERUBAHAN';

      document.getElementById('modalItemId').value = item.id;
      inputItemName.value = item.name;
      selectItemCategory.value = item.category;
      selectItemUnit.value = item.unit;
      inputItemQty.value = item.qty;
      inputItemPrice.value = item.price;
      inputItemDiscount.value = item.discountRaw || '';
    } else {
      title.textContent = 'Tambah ke Troli';
      submitText.textContent = 'SIMPAN KE TROLI';
      formItemModal.reset();
      document.getElementById('modalItemId').value = '';
      inputItemQty.value = 1;
    }

    updateModalLiveCalculations();
    modalItemBackdrop.classList.remove('hidden');
    inputItemName.focus();
    if (window.lucide) lucide.createIcons();
  }

  function closeItemModal() {
    modalItemBackdrop.classList.add('hidden');
    autoSuggestContainer.classList.add('hidden');
    appState.editingItemId = null;
  }

  window.editCartItem = function (id) {
    openItemModal(id);
  };

  function updateModalLiveCalculations() {
    const price = parseFloat(inputItemPrice.value) || 0;
    const qty = parseInt(inputItemQty.value, 10) || 1;
    const discountRaw = inputItemDiscount.value.trim();

    // 1. Discount Preview
    const disc = calculateDiscount(price, discountRaw);
    const discPreview = document.getElementById('modalDiscountPreview');
    const elFinalPrice = document.getElementById('modalDiscountFinalPrice');
    const elSavedText = document.getElementById('modalDiscountSavedText');
    const elBreakdown = document.getElementById('modalDiscountBreakdown');

    if (disc.savedPerUnit > 0) {
      if (discPreview) discPreview.classList.remove('hidden');
      if (elFinalPrice) elFinalPrice.textContent = `Rp ${formatNumber(disc.finalUnitPrice)}`;
      if (elSavedText) elSavedText.textContent = `Hemat Rp ${formatNumber(disc.savedPerUnit)}/item (${disc.discountLabel || 'Promo'})`;
      if (elBreakdown) {
        if (disc.formulaText && disc.formulaText.includes('Lapis')) {
          elBreakdown.classList.remove('hidden');
          elBreakdown.textContent = `Rincian: ${disc.formulaText}`;
        } else {
          elBreakdown.classList.add('hidden');
        }
      }
    } else {
      if (discPreview) discPreview.classList.add('hidden');
    }

    // 2. Subtotal
    const lineTotal = disc.finalUnitPrice * qty;
    document.getElementById('modalLineTotal').textContent = `Rp ${formatNumber(lineTotal)}`;

    if (window.lucide) lucide.createIcons();
  }

  // Autocomplete Suggestions
  inputItemName.addEventListener('input', () => {
    const val = inputItemName.value.trim().toLowerCase();
    if (val.length < 1) {
      autoSuggestContainer.classList.add('hidden');
      return;
    }

    const matches = appState.masterItems.filter(m => m.name.toLowerCase().includes(val));
    if (matches.length === 0) {
      autoSuggestContainer.classList.add('hidden');
      return;
    }

    let html = '';
    matches.forEach(m => {
      html += `
        <div class="auto-row-neo" onclick="window.selectMasterSuggestion('${escapeHtml(m.name)}')">
          <div>
            <strong>${escapeHtml(m.name)}</strong>
            <small style="display:block; color:var(--text-muted); font-size:0.65rem;">${escapeHtml(m.category)} • ${escapeHtml(m.unit)}</small>
          </div>
        </div>
      `;
    });

    autoSuggestContainer.innerHTML = html;
    autoSuggestContainer.classList.remove('hidden');
  });

  window.selectMasterSuggestion = function (name) {
    const item = appState.masterItems.find(m => m.name === name);
    if (!item) return;

    inputItemName.value = item.name;
    selectItemCategory.value = item.category;
    selectItemUnit.value = item.unit;
    if (!inputItemPrice.value && item.lastPrice > 0) {
      inputItemPrice.value = item.lastPrice;
    }
    autoSuggestContainer.classList.add('hidden');
    updateModalLiveCalculations();
    AudioEngine.playTap();
  };

  // Submit Modal
  formItemModal.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = inputItemName.value.trim();
    const category = selectItemCategory.value;
    const unit = selectItemUnit.value;
    const qty = Number(inputItemQty.value);
    const price = Number(inputItemPrice.value);
    const discountRaw = inputItemDiscount.value.trim();

    const invalidField = validateCartItemInput({
      name, category, unit, qty, price, storeName: appState.activeStore, date: getShoppingDate()
    });
    if (invalidField) {
      const messages = {
        name: 'Nama barang tidak boleh kosong.',
        category: 'Pilih kategori barang.',
        unit: 'Pilih kemasan atau satuan barang.',
        store: 'Pilih toko belanja terlebih dahulu.',
        date: 'Pilih tanggal belanja yang valid.',
        qty: 'Kuantitas harus berupa angka bulat minimal 1.',
        price: 'Harga harus berupa angka positif.'
      };
      const fields = {
        name: inputItemName,
        category: selectItemCategory,
        unit: selectItemUnit,
        qty: inputItemQty,
        price: inputItemPrice
      };
      showToast(`Gagal: ${messages[invalidField]}`, 'danger');
      AudioEngine.playAlert();
      fields[invalidField]?.focus();
      return;
    }

    if (appState.editingItemId) {
      const idx = appState.cart.findIndex(i => i.id === appState.editingItemId);
      if (idx !== -1) {
        appState.cart[idx] = {
          ...appState.cart[idx],
          name, category, unit, qty, price, discountRaw,
          storeName: appState.activeStore,
          priceDate: getShoppingDate()
        };
        showToast(`"${name}" berhasil diubah`, 'success');
      }
    } else {
      const newItem = {
        id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name, category, unit, qty, price, discountRaw,
        storeName: appState.activeStore,
        priceDate: getShoppingDate(),
        inPhysicalCart: true,
        isPlanned: true,
        createdAt: Date.now()
      };
      appState.cart.unshift(newItem);
      showToast(`"${name}" ditambahkan ke troli`, 'success');
    }

    AudioEngine.playTap();
    updateMasterDatabaseItem(name, category, unit, price);
    saveCart();
    renderCart();
    closeItemModal();
  });

  function updateMasterDatabaseItem(name, category, unit, price) {
    recordPriceObservation(name, price);
    const existing = appState.masterItems.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.category = category;
      existing.unit = unit;
      if (price > 0) existing.lastPrice = price;
    } else {
      appState.masterItems.push({ name, category, unit, lastPrice: price });
    }
    saveMaster();

    // Auto-sync single item to Supabase if connected
    if (appState.supabaseClient) {
      if (appState.currentUser?.id) appState.supabaseClient.from('master_products').upsert({
        owner_id: appState.currentUser?.id,
        name, category, unit, last_price: price, updated_at: new Date().toISOString()
      }, { onConflict: 'owner_id,name' }).then(() => { });
    }
  }

  // ==========================================================================
  // NAVIGATION & TABS
  // ==========================================================================
  function setupNavigation() {
    const navButtons = document.querySelectorAll('.dock-tab');
    const panes = document.querySelectorAll('.tab-pane');
    const floatingCartSummary = document.getElementById('cartSummaryBottom');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTabId = btn.getAttribute('data-tab');
        if (!targetTabId) return;

        let paneId = targetTabId;

        // Reset semua tombol nav ke gaya inaktif (100% solid, tidak transparan)
        navButtons.forEach(b => {
          b.classList.remove('active');
        });

        // Aktifkan tombol yang dipilih
        btn.classList.add('active');

        // Toggle pane tampilan
        panes.forEach(p => {
          p.classList.remove('active');
          p.classList.add('hidden');
        });

        const targetPane = document.getElementById(paneId);
        if (targetPane) {
          targetPane.classList.add('active');
          targetPane.classList.remove('hidden');
        }
        if (floatingCartSummary) {
          floatingCartSummary.classList.toggle('hidden', paneId !== 'tabCart' || appState.cart.length === 0);
        }

        AudioEngine.playTap();

        // Tab Scan Barcode dinonaktifkan sesuai permintaan pengguna

        if (paneId === 'tabBudget') {
          renderShoppingPlannerSection();
        } else if (paneId === 'tabDompet') {
          renderDompetTab();
        } else if (paneId === 'tabHistory') {
          renderHistoryList();
        } else if (paneId === 'tabCart') {
          renderCart();
        }

        if (window.lucide) lucide.createIcons();
      });
    });

    // Sub-mode tabs in Scan Screen (Screen 2 Stitch)
    const btnModeBarcode = document.getElementById('tab-scan-barcode');
    const btnModeMulti = document.getElementById('tab-scan-multibuy');
    const btnModeManual = document.getElementById('tab-scan-manual');

    if (btnModeBarcode && btnModeMulti && btnModeManual) {
      const modeButtons = [btnModeBarcode, btnModeMulti, btnModeManual];
      modeButtons.forEach(mBtn => {
        mBtn.addEventListener('click', () => {
          modeButtons.forEach(b => {
            b.classList.remove('active', 'bg-primary-container', 'text-on-primary', 'shadow-md');
            b.classList.add('text-on-surface-variant');
          });
          mBtn.classList.add('active', 'bg-primary-container', 'text-on-primary', 'shadow-md');
          mBtn.classList.remove('text-on-surface-variant');
          AudioEngine.playTap();

          if (mBtn.id === 'tab-scan-multibuy') {
            openComparatorToolModal();
          } else if (mBtn.id === 'tab-scan-manual') {
            openItemModal();
          }
        });
      });
    }
  }

  function openComparatorToolModal() {
    const card = document.getElementById('scannerComparatorCard');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('ring-4', 'ring-secondary-fixed');
      setTimeout(() => card.classList.remove('ring-4', 'ring-secondary-fixed'), 2000);
      showToast('Kalkulator kemasan aktif (Opsi A vs B)', 'info');
    }
  }

  function setupSoundToggle() {
    const btnSound = document.getElementById('btnSoundToggle');
    const iconSound = document.getElementById('soundIcon');
    if (!btnSound) return;

    function refreshSoundIcon() {
      if (iconSound) {
        iconSound.textContent = appState.soundEnabled ? 'volume_up' : 'volume_off';
      }
      btnSound.title = appState.soundEnabled ? 'Suara Aktif (Klik untuk Matikan)' : 'Suara Mati (Klik untuk Nyalakan)';
    }

    refreshSoundIcon();

    btnSound.addEventListener('click', () => {
      appState.soundEnabled = !appState.soundEnabled;
      saveSound();
      refreshSoundIcon();
      if (appState.soundEnabled) {
        showToast('Efek suara aktif 🔊', 'info');
        AudioEngine.playTap();
      } else {
        showToast('Efek suara nonaktif 🔇', 'info');
      }
    });
  }

  // ==========================================================================
  // EVENT LISTENERS & SUPABASE MODAL HANDLERS
  // ==========================================================================
  function setupEventListeners() {
    // Discount Quick Builder Buttons (+10%, +20%, +25%, etc.)
    document.querySelectorAll('.btn-add-discount-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val') || '';
        const cur = inputItemDiscount.value.trim();
        const isPercent = /^\d+(?:[.,]\d+)?%$/.test(val.trim());
        const currentIsPercentFormula = cur.includes('%') && !/\brp\b/i.test(cur);

        // Repeated percentage taps add another discount layer (e.g. 10% + 10%).
        // The fixed rupiah shortcut remains a standalone discount value.
        inputItemDiscount.value = isPercent && currentIsPercentFormula
          ? `${cur} + ${val.trim()}`
          : val.trim();
        AudioEngine.playTap();
        updateModalLiveCalculations();
      });
    });

    const btnClearDisc = document.getElementById('btnClearDiscountPill');
    if (btnClearDisc) {
      btnClearDisc.addEventListener('click', () => {
        inputItemDiscount.value = '';
        AudioEngine.playTap();
        updateModalLiveCalculations();
      });
    }

    document.getElementById('btnOpenAddModal').addEventListener('click', () => openItemModal());
    document.getElementById('btnCloseItemModal').addEventListener('click', closeItemModal);
    document.getElementById('btnCancelModalItem').addEventListener('click', closeItemModal);

    // Modal Qty Stepper
    document.getElementById('btnModalQtyMinus').addEventListener('click', () => {
      const q = parseInt(inputItemQty.value, 10) || 1;
      if (q > 1) inputItemQty.value = q - 1;
      AudioEngine.playTap();
      updateModalLiveCalculations();
    });
    document.getElementById('btnModalQtyPlus').addEventListener('click', () => {
      const q = parseInt(inputItemQty.value, 10) || 1;
      inputItemQty.value = q + 1;
      AudioEngine.playTap();
      updateModalLiveCalculations();
    });

    inputItemPrice.addEventListener('input', updateModalLiveCalculations);
    inputItemDiscount.addEventListener('input', updateModalLiveCalculations);
    inputItemQty.addEventListener('input', updateModalLiveCalculations);

    // Search
    const searchInput = document.getElementById('searchCartInput');
    const btnClearSearch = document.getElementById('btnClearSearch');

    searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value.trim();
      if (appState.searchQuery) {
        btnClearSearch.classList.remove('hidden');
      } else {
        btnClearSearch.classList.add('hidden');
      }
      renderCart();
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      appState.searchQuery = '';
      btnClearSearch.classList.add('hidden');
      renderCart();
    });

    // Budget Quick Edit
    const budgetModal = document.getElementById('modalBudgetBackdrop');
    document.getElementById('btnEditBudgetTrigger').addEventListener('click', () => {
      document.getElementById('inputQuickBudget').value = appState.budgetLimit;
      budgetModal.classList.remove('hidden');
      AudioEngine.playTap();
    });

    document.getElementById('btnCloseBudgetModal').addEventListener('click', () => budgetModal.classList.add('hidden'));
    document.getElementById('btnCancelQuickBudget').addEventListener('click', () => budgetModal.classList.add('hidden'));
    document.getElementById('btnSaveQuickBudget').addEventListener('click', () => {
      const val = Number(document.getElementById('inputQuickBudget').value);
      if (Number.isInteger(val) && val > 0) {
        appState.budgetLimit = val;
        saveBudget();
        updateBudgetHud();
        budgetModal.classList.add('hidden');
        AudioEngine.playSuccess();
        showToast('Batas anggaran berhasil disimpan', 'success');
      } else {
        showToast('Masukkan batas anggaran berupa angka bulat yang lebih besar dari 0.', 'danger');
      }
    });

    // Cloud Sync Buttons
    const btnSyncHeader = document.getElementById('btnSyncCloudHeader');
    if (btnSyncHeader) btnSyncHeader.addEventListener('click', syncCloudData);

    const btnSyncNow = document.getElementById('btnSyncNow');
    if (btnSyncNow) btnSyncNow.addEventListener('click', syncCloudData);

    // Trim Helper
    document.getElementById('btnCloseTrimModal').addEventListener('click', () => {
      document.getElementById('modalTrimBackdrop').classList.add('hidden');
    });
    document.getElementById('btnCloseTrimDone').addEventListener('click', () => {
      document.getElementById('modalTrimBackdrop').classList.add('hidden');
      renderCart();
    });

    // Clear Cart with Safety Confirmation Modal (Skenario 8)
    const modalClearCart = document.getElementById('modalConfirmClearCart');
    const btnOpenClearCart = document.getElementById('btnOpenClearCartModal');
    const btnCancelClearCart = document.getElementById('btnCancelClearCart');
    const btnConfirmClearCart = document.getElementById('btnConfirmClearCart');

    if (btnOpenClearCart && modalClearCart) {
      btnOpenClearCart.addEventListener('click', () => {
        if (appState.cart.length === 0) {
          showToast('Keranjang sudah dalam keadaan kosong', 'info');
          return;
        }
        modalClearCart.classList.remove('hidden');
        AudioEngine.playTap();
      });
    }

    if (btnCancelClearCart && modalClearCart) {
      btnCancelClearCart.addEventListener('click', () => {
        modalClearCart.classList.add('hidden');
      });
    }

    if (btnConfirmClearCart && modalClearCart) {
      btnConfirmClearCart.addEventListener('click', () => {
        appState.cart = [];
        saveCart();
        renderCart();
        modalClearCart.classList.add('hidden');
        AudioEngine.playSuccess();
        showToast('Seluruh isi troli berhasil dikosongkan', 'success');
      });
    }

    // Selector Tanggal Belanja (Skenario 1 & 6)
    const datePickerEl = document.getElementById('sessionDatePicker');
    if (datePickerEl) {
      const savedDate = localStorage.getItem('smart_grocery_date') || getLocalDateKey();
      datePickerEl.value = savedDate;
      datePickerEl.addEventListener('change', (e) => {
        const newDate = e.target.value;
        if (newDate) {
          localStorage.setItem('smart_grocery_date', newDate);
          AudioEngine.playTap();
          showToast(`Tanggal belanja disetel: ${newDate}`, 'info');
        }
      });
    }

    // Header Utility Buttons
    const btnCompareHeader = document.getElementById('btnQuickCompareHeader');
    if (btnCompareHeader) {
      btnCompareHeader.addEventListener('click', () => {
        const navBudget = document.getElementById('navBtnBudget');
        if (navBudget) navBudget.click();
      });
    }

    const btnScanHeader = document.getElementById('btnOpenScannerHeader');
    if (btnScanHeader) {
      btnScanHeader.addEventListener('click', () => {
        const navBudget = document.getElementById('navBtnBudget');
        if (navBudget) navBudget.click();
      });
    }

    const btnGoToScanTab = document.getElementById('btnGoToScanTab');
    if (btnGoToScanTab) {
      btnGoToScanTab.addEventListener('click', () => {
        const navBudget = document.getElementById('navBtnBudget');
        if (navBudget) navBudget.click();
      });
    }

    const btnStore = document.getElementById('btnStoreSelector');
    if (btnStore) {
      btnStore.addEventListener('click', openStoreModal);
    }
    const btnCloseStore = document.getElementById('btnCloseStoreModal');
    if (btnCloseStore) {
      btnCloseStore.addEventListener('click', closeStoreModal);
    }

    // Scanner Modals Close & Submit
    const btnCloseScan = document.getElementById('btnCloseScannerModal');
    if (btnCloseScan) {
      btnCloseScan.addEventListener('click', closeBarcodeScanner);
    }
    const btnCloseScanRes = document.getElementById('btnCloseScanResultModal');
    if (btnCloseScanRes) {
      btnCloseScanRes.addEventListener('click', () => {
        document.getElementById('modalScanResultBackdrop')?.classList.add('hidden');
      });
    }
    const btnCancelScanRes = document.getElementById('btnCancelScanResult');
    if (btnCancelScanRes) {
      btnCancelScanRes.addEventListener('click', () => {
        document.getElementById('modalScanResultBackdrop')?.classList.add('hidden');
        openBarcodeScanner();
      });
    }
    const btnApplyScan = document.getElementById('btnApplyScanToCart');
    if (btnApplyScan) {
      btnApplyScan.addEventListener('click', applyScannedItemToCart);
    }

    // Flashlight & Flip Camera Toggles
    const btnFlash = document.getElementById('btnScannerFlash');
    if (btnFlash) {
      btnFlash.addEventListener('click', toggleScannerTorch);
    }
    const btnFlip = document.getElementById('btnScannerFlip');
    if (btnFlip) {
      btnFlip.addEventListener('click', flipScannerCamera);
    }

    // Sync & Data
    document.getElementById('btnExportData')?.addEventListener('click', exportDataJson);
    document.getElementById('btnImportDataTrigger')?.addEventListener('click', () => {
      document.getElementById('importFileInput')?.click();
    });
    document.getElementById('importFileInput')?.addEventListener('change', importDataJson);
    document.getElementById('btnResetToDefaults')?.addEventListener('click', resetAllData);
    document.getElementById('btnCloseReceiptModal')?.addEventListener('click', () => {
      document.getElementById('modalReceiptBackdrop')?.classList.add('hidden');
    });

    // Smart Price & Discount Scanner Execution
    const btnRunPy = document.getElementById('btnRunPythonScanAnalysis');
    if (btnRunPy) {
      btnRunPy.addEventListener('click', () => {
        AudioEngine.playTap();
        runPythonScanAnalysis();
        showToast('Analisis harga dan diskon berhasil diperbarui', 'success');
      });
    }

    // Node.js & TypeScript Cloud Insights
    const btnRunNode = document.getElementById('btnRunNodeAnalytics');
    if (btnRunNode) {
      btnRunNode.addEventListener('click', requestNodeSmartInsights);
    }

    // Shopping Planner & Shelf Price Modal Handlers
    const formPlan = document.getElementById('formAddPlannerItem');
    if (formPlan) formPlan.addEventListener('submit', addPlannerItemFromForm);

    const formShelf = document.getElementById('formShelfPriceModal');
    if (formShelf) formShelf.addEventListener('submit', applyShelfPriceModalSubmit);

    const btnCloseShelf = document.getElementById('btnCloseShelfModal');
    if (btnCloseShelf) {
      btnCloseShelf.addEventListener('click', () => {
        document.getElementById('modalShelfPriceBackdrop').classList.add('hidden');
      });
    }

    const btnCancelShelf = document.getElementById('btnCancelShelfModal');
    if (btnCancelShelf) {
      btnCancelShelf.addEventListener('click', () => {
        document.getElementById('modalShelfPriceBackdrop').classList.add('hidden');
      });
    }

    const btnGoPlan = document.getElementById('btnGoToPlannerTab');
    if (btnGoPlan) {
      btnGoPlan.addEventListener('click', () => {
        const tabBtn = document.getElementById('navBtnBudget');
        if (tabBtn) tabBtn.click();
      });
    }

    const btnClearPlan = document.getElementById('btnClearCompletedPlanner');
    if (btnClearPlan) {
      btnClearPlan.addEventListener('click', clearCompletedPlannerItems);
    }
  }

  // ==========================================================================
  // STITCH SHELF-ADDER TRAY MODULE ("Input Cepat di Rak")
  // ==========================================================================
  let traySelectedPromo = '0';
  let traySelectedCategory = 'Bahan Pokok';

  function initShelfAdderTray() {
    const promoChips = document.querySelectorAll('.tray-promo-chip');
    promoChips.forEach(chip => {
      chip.addEventListener('click', () => {
        promoChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        traySelectedPromo = chip.getAttribute('data-promo') || '0';
        AudioEngine.playTap();
      });
    });

    const catTags = document.querySelectorAll('.tray-cat-tag');
    catTags.forEach(tag => {
      tag.addEventListener('click', () => {
        catTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        traySelectedCategory = tag.getAttribute('data-cat') || 'Bahan Pokok';
        AudioEngine.playTap();
      });
    });

    const btnScanTray = document.getElementById('btnQuickScanTray');
    if (btnScanTray) {
      btnScanTray.addEventListener('click', openBarcodeScanner);
    }

    const btnAddTray = document.getElementById('btnTrayAddToCart');
    if (btnAddTray) {
      btnAddTray.addEventListener('click', () => {
        const priceInput = document.getElementById('trayItemPrice');
        const nameInput = document.getElementById('trayItemName');
        if (!priceInput || !nameInput) return;

        const priceVal = parseFloat(priceInput.value);
        if (!priceVal || priceVal <= 0) {
          showToast('Masukkan harga di rak terlebih dahulu!', 'warning');
          priceInput.focus();
          return;
        }

        const nameVal = nameInput.value.trim() || `${traySelectedCategory} Rak`;
        const newItem = {
          id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: nameVal,
          category: traySelectedCategory,
          unit: 'pcs',
          qty: 1,
          price: priceVal,
          discountRaw: (traySelectedPromo && traySelectedPromo !== '0') ? traySelectedPromo : '',
          storeName: appState.activeStore,
          priceDate: getShoppingDate(),
          createdAt: Date.now(),
          inPhysicalCart: true,
          isPlanned: true
        };

        appState.cart.unshift(newItem);
        updateMasterDatabaseItem(newItem.name, newItem.category, newItem.unit, newItem.price);
        saveCart();
        renderCart();

        priceInput.value = '';
        nameInput.value = '';
        AudioEngine.playSuccess();
        showToast(`"${nameVal}" masuk ke troli aktif!`, 'success');
      });
    }
  }

  // ==========================================================================
  // BARCODE DATABASE & REALTIME SCANNER MODULE (STITCH SPEC)
  // ==========================================================================
  const BARCODE_CATALOG = [
    {
      barcode: '84101970',
      name: 'Olive Oil Extra Virgin 500ml',
      brand: 'Borges Mediterranean Craft • Spanyol',
      category: 'Dapur & Bumbu',
      unit: 'botol',
      unitSize: '500ml',
      price: 125000,
      lastMonthPrice: 130000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr02p4i7QikyTt3l67LStzsEpbx6b5dkONS-XcxxFFfiASKe_AU8nrJelLfQ4dUBxeIKYD4Z5whmp0swAWtI9OkCH3u-4pcEwFjzInLqNc8mlKYPg0ap0BkVxTmAWc2jYP3Gi6ERtirta3o5sY0mX9bVOny3OQpMHvJgMtH7DnZgERkymPK4DwzFOU7142FDkjCh9mmG671eqGR6eQQ6uabRMRB42aiQ1suBXwW0BVRyKQIhIYHnB1Kg',
      unitPricingDesc: 'Rp 17.000 / 100ml',
      defaultDiscounts: [
        { id: 'katalog', label: 'Diskon Katalog Mingguan (-20%)', type: 'pct', value: 20, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Member Supermarket Club (-5%)', type: 'pct', value: 5, tag: 'Member', checked: true },
        { id: 'qris', label: 'Cashback Bank QRIS (Min. 100k)', type: 'nom', value: 10000, tag: 'Bank', checked: true }
      ]
    },
    {
      barcode: '89927531',
      name: 'Susu UHT Full Cream 1L',
      brand: 'Ultra Milk Dairy Farms • Lembang',
      category: 'Makanan & Minuman',
      unit: 'pack',
      unitSize: '1 Liter',
      price: 22000,
      lastMonthPrice: 20500,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX4hERzTA6DhuC2FLnb6P2eu1QiDZdRhb3ckzupgDiGgDWA2oDsD_UcS_eHGcv-h2eu-cNQJ5xxFeSdydTZ5yqhjqeU5MtXX-Ki63qqcrzs9a7SC-BHOnMYaLDBBTYgoonbrrdGX7s--77gJclOD5G1xj5cpwgdrepmIXUuzLqyTkzOdqOWokwJGe7zUWPYTgBS0NVZoxp7xAamjtavwPLE3io_h1yfvptOUSwKRS81fXljc8EmRObiQ',
      unitPricingDesc: 'Rp 18.700 / Liter',
      defaultDiscounts: [
        { id: 'katalog', label: 'Diskon Belanja Mingguan (-15%)', type: 'pct', value: 15, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Member Club Point (-5%)', type: 'pct', value: 5, tag: 'Member', checked: false }
      ]
    },
    {
      barcode: '20019280',
      name: 'Dada Ayam Fillet Segar 500g',
      brand: 'Fresh Butcher Farm Choice',
      category: 'Bahan Pokok',
      unit: 'pack',
      unitSize: '0.51 kg',
      price: 48500,
      lastMonthPrice: 52000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzra5PPTiPJt7jEUu4_x-LkTHhYmToF-wR8nLhrRmeRSJQ6u4dTmFKkkOfiBMHMGapoMc_HU-xwxjOYuHW0ogI9-MWhWyVzilurIAhs8VL6cJsZ8tTDh-44_X__xi7jzANSEvySd5THSgFSJXhQQaRLpWlRk7GnRCa_u6pbSELveNiOXHvGP-ZR5X2EWeS-zi9_hFO4FUyFrrv7dGMU7_qpBjzLfW6jFmpOnDC5L6S5iafMWunm045PA',
      unitPricingDesc: 'Rp 95 / gram',
      defaultDiscounts: [
        { id: 'katalog', label: 'Promo Protein Segar (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89938210',
      name: 'Apel Fuji Wang Shan 1kg',
      brand: 'Fresh Import Fruit Market',
      category: 'Makanan & Minuman',
      unit: 'kg',
      unitSize: '1 kg',
      price: 38000,
      lastMonthPrice: 38000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcqp4_nHG0hMnJd8CYsRtlh0iQ9ZNX8X7tqVMXZtTktDWdvQEF8_LcKciaJxB_Esx9XmR8DGXjQRu427JEeK1CQSllJ1Iq_5lVs9vV2k5E__89zNuvl-F8lNSc2XKHgZQNIIPQdtl7zs5A5VFv-nPlwL0phATCnkHySqWTGCAWvpU-MQuOwnz2QzXLpTxxp9yhUtyTm9D6OQ2Y_dUOmXJsqlnWOvpfpA2HdJJYctiS14_XTDxzeoDwjg',
      unitPricingDesc: 'Rp 34.200 / kg',
      defaultDiscounts: [
        { id: 'katalog', label: 'Diskon Buah Segar (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Diskon Member Fresh (-5%)', type: 'pct', value: 5, tag: 'Member', checked: true }
      ]
    },
    {
      barcode: '89927753',
      name: 'Minyak Goreng Sania 2L',
      brand: 'Sania Royale Kelapa Sawit',
      category: 'Bahan Pokok',
      unit: 'pouch',
      unitSize: '2 Liter',
      price: 38000,
      lastMonthPrice: 36000,
      image: '',
      unitPricingDesc: 'Rp 17.100 / Liter',
      defaultDiscounts: [
        { id: 'katalog', label: 'Katalog Minyak Hemat (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89910023',
      name: 'Beras Ramos Super 5kg',
      brand: 'Ramos Setra Super Premium',
      category: 'Bahan Pokok',
      unit: 'pack',
      unitSize: '5 kg',
      price: 75000,
      lastMonthPrice: 72000,
      image: '',
      unitPricingDesc: 'Rp 14.250 / kg',
      defaultDiscounts: [
        { id: 'katalog', label: 'Subsidi Pokok (-5%)', type: 'pct', value: 5, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89988662',
      name: 'Indomie Goreng Spesial',
      brand: 'Indofood Rasa Legendaris',
      category: 'Makanan & Minuman',
      unit: 'pcs',
      unitSize: '85g',
      price: 3100,
      lastMonthPrice: 3100,
      image: '',
      unitPricingDesc: 'Rp 3.100 / bks',
      defaultDiscounts: [
        { id: 'katalog', label: 'Beli 5 Potongan Rp 1.000', type: 'nom', value: 200, tag: 'Katalog', checked: true }
      ]
    },
    {
      barcode: '89923456',
      name: 'Biore Guard Body Wash 400ml',
      brand: 'Kao Biore Antibacterial Clean',
      category: 'Kebersihan',
      unit: 'pouch',
      unitSize: '400ml',
      price: 24500,
      lastMonthPrice: 22000,
      image: '',
      unitPricingDesc: 'Rp 4.900 / 100ml',
      defaultDiscounts: [
        { id: 'katalog', label: 'Promo Kebersihan Rumah (-20%)', type: 'pct', value: 20, tag: 'Katalog', checked: true },
        { id: 'member', label: 'Member Cashback (-5%)', type: 'pct', value: 5, tag: 'Member', checked: true }
      ]
    }
  ];

  let html5QrScannerInstance = null;
  let isScannerActive = false;
  let currentCameraFacing = 'environment';
  let isTorchOn = false;
  let currentScannedItem = null;
  let scannedDiscountsState = [];

  function initBarcodeScannerModule() {
    // Initializer
  }

  function openBarcodeScanner() {
    AudioEngine.playTap();
    const modal = document.getElementById('modalScannerBackdrop');
    if (!modal) return;
    modal.classList.remove('hidden');
    renderBarcodePresets();
    startCameraScanner();
    if (window.lucide) lucide.createIcons();
  }

  function closeBarcodeScanner() {
    stopCameraScanner();
    const modal = document.getElementById('modalScannerBackdrop');
    if (modal) modal.classList.add('hidden');
  }

  async function startCameraScanner() {
    const viewContainer = document.getElementById('interactiveScannerView');
    if (!viewContainer) return;

    if (window.Html5Qrcode && !isScannerActive) {
      try {
        html5QrScannerInstance = new Html5Qrcode('interactiveScannerView');
        isScannerActive = true;
        await html5QrScannerInstance.start(
          { facingMode: currentCameraFacing },
          {
            fps: 20,
            qrbox: { width: 220, height: 160 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            onBarcodeDetected(decodedText);
          },
          () => {
            // Frame search callback
          }
        );
      } catch (err) {
        console.warn('Camera could not start:', err);
        isScannerActive = false;
        showToast('Kamera tidak dapat diakses. Gunakan simulasi barcode di bawah!', 'info');
      }
    }
  }

  async function stopCameraScanner() {
    if (html5QrScannerInstance && isScannerActive) {
      try {
        await html5QrScannerInstance.stop();
        await html5QrScannerInstance.clear();
      } catch (e) { }
      isScannerActive = false;
      html5QrScannerInstance = null;
    }
  }

  async function toggleScannerTorch() {
    if (html5QrScannerInstance && isScannerActive) {
      try {
        isTorchOn = !isTorchOn;
        await html5QrScannerInstance.applyVideoConstraints({
          advanced: [{ torch: isTorchOn }]
        });
        showToast(isTorchOn ? 'Lampu flash aktif' : 'Lampu flash mati', 'info');
      } catch (e) {
        showToast('Fitur lampu flash tidak didukung perangkat', 'warning');
      }
    } else {
      showToast('Kamera belum aktif', 'info');
    }
  }

  async function flipScannerCamera() {
    currentCameraFacing = currentCameraFacing === 'environment' ? 'user' : 'environment';
    await stopCameraScanner();
    await startCameraScanner();
  }

  function renderBarcodePresets() {
    const container = document.getElementById('scannerPresetsList');
    if (!container) return;

    let html = '';
    BARCODE_CATALOG.forEach(prod => {
      html += `
        <div class="preset-card" onclick="window.selectBarcodePreset('${prod.barcode}')" title="Klik untuk simulasi scan">
          <div class="preset-img-wrap">
            ${prod.image ? `<img src="${prod.image}" alt="${escapeHtml(prod.name)}">` : `<div style="font-size:1.6rem; color:var(--volt-main);">🛒</div>`}
            <span class="preset-unit-tag">${escapeHtml(prod.unitSize)}</span>
          </div>
          <div class="preset-title">${escapeHtml(prod.name)}</div>
          <div class="preset-price-row">
            <span>Rp ${formatNumber(prod.price)}</span>
            <span class="preset-barcode-badge">EAN:${prod.barcode}</span>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  window.selectBarcodePreset = function (barcode) {
    onBarcodeDetected(barcode);
  };

  function onBarcodeDetected(code) {
    AudioEngine.playScan();
    stopCameraScanner();
    closeBarcodeScanner();

    let found = BARCODE_CATALOG.find(p => p.barcode === code || code.includes(p.barcode));
    if (!found) {
      const inMaster = appState.masterItems.find(m => m.name.toLowerCase().includes(code.toLowerCase()));
      if (inMaster) {
        found = {
          barcode: code,
          name: inMaster.name,
          brand: 'Produk Terdaftar di Riwayat',
          category: inMaster.category,
          unit: inMaster.unit,
          unitSize: inMaster.unit,
          price: inMaster.lastPrice || 25000,
          lastMonthPrice: inMaster.lastPrice || 25000,
          image: '',
          unitPricingDesc: `Rp ${formatNumber(inMaster.lastPrice || 25000)} / ${inMaster.unit}`,
          defaultDiscounts: [
            { id: 'katalog', label: 'Promo Toko Mingguan (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
          ]
        };
      } else {
        found = {
          barcode: code,
          name: `Item Barcode #${code}`,
          brand: 'Item Supermarket',
          category: 'Bahan Pokok',
          unit: 'pcs',
          unitSize: '1 pcs',
          price: 32000,
          lastMonthPrice: 32000,
          image: '',
          unitPricingDesc: 'Rp 32.000 / pcs',
          defaultDiscounts: [
            { id: 'katalog', label: 'Diskon Rak (-10%)', type: 'pct', value: 10, tag: 'Katalog', checked: true }
          ]
        };
      }
    }

    currentScannedItem = JSON.parse(JSON.stringify(found));
    scannedDiscountsState = JSON.parse(JSON.stringify(found.defaultDiscounts || []));
    openScanResultModal();
    runPythonScanAnalysis(code);
  }

  function openScanResultModal() {
    if (!currentScannedItem) return;

    const titleEl = document.getElementById('scanResultTitle');
    if (titleEl) titleEl.textContent = currentScannedItem.name;

    const nameEl = document.getElementById('scanProductName');
    if (nameEl) nameEl.textContent = currentScannedItem.name;

    const brandEl = document.getElementById('scanProductBrand');
    if (brandEl) brandEl.textContent = currentScannedItem.brand || 'Item Supermarket';

    const catEl = document.getElementById('scanProductCategory');
    if (catEl) catEl.textContent = `Kategori: ${currentScannedItem.category}`;

    const unitEl = document.getElementById('scanProductUnit');
    if (unitEl) unitEl.textContent = currentScannedItem.unitSize || currentScannedItem.unit;

    const priceEl = document.getElementById('scanShelfPrice');
    if (priceEl) priceEl.textContent = `Rp ${formatNumber(currentScannedItem.price)}`;

    const imgEl = document.getElementById('scanProductImg');
    if (imgEl) {
      if (currentScannedItem.image) {
        imgEl.src = currentScannedItem.image;
        imgEl.style.display = 'block';
      } else {
        imgEl.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%2322c55e" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
      }
    }

    renderScanDiscountsChecklist();
    recalculateScanFinalResult();

    const modal = document.getElementById('modalScanResultBackdrop');
    if (modal) modal.classList.remove('hidden');

    if (window.lucide) lucide.createIcons();
  }

  function renderScanDiscountsChecklist() {
    const container = document.getElementById('scanDiscountsChecklist');
    if (!container) return;

    let html = '';
    scannedDiscountsState.forEach((d, idx) => {
      let savedPreview = 0;
      if (d.type === 'pct') {
        savedPreview = currentScannedItem.price * (d.value / 100);
      } else {
        savedPreview = d.value;
      }

      const tagClass = d.tag.toLowerCase();

      html += `
        <label class="discount-item-row flex items-center justify-between p-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/30 cursor-pointer hover:border-secondary transition-all">
          <div class="discount-item-left flex items-center gap-2.5">
            <input type="checkbox" id="disc_chk_${idx}" ${d.checked ? 'checked' : ''} onchange="window.toggleScanDiscount(${idx}, this.checked)"
              class="w-4 h-4 accent-secondary rounded cursor-pointer">
            <div class="discount-item-text">
              <span class="font-headline-sm text-label-md text-primary font-bold block">${escapeHtml(d.label)}</span>
              <span class="font-numeric-sm text-body-sm text-secondary font-bold">Hemat Rp ${formatNumber(savedPreview)}</span>
            </div>
          </div>
          <span class="font-label-sm text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tagClass === 'katalog' ? 'bg-secondary-fixed text-on-secondary-fixed' : tagClass === 'member' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container-high text-primary'}">
            ${escapeHtml(d.tag)}
          </span>
        </label>
      `;
    });
    container.innerHTML = html;
  }

  window.toggleScanDiscount = function (idx, isChecked) {
    if (scannedDiscountsState[idx]) {
      scannedDiscountsState[idx].checked = isChecked;
      recalculateScanFinalResult();
      AudioEngine.playTap();
    }
  };

  function recalculateScanFinalResult() {
    if (!currentScannedItem) return;
    const basePrice = currentScannedItem.price;
    let currentPrice = basePrice;
    let totalDiscount = 0;
    let activeCount = 0;

    scannedDiscountsState.forEach(d => {
      if (d.checked) {
        activeCount++;
        let cut = 0;
        if (d.type === 'pct') {
          cut = currentPrice * (d.value / 100);
        } else {
          cut = d.value;
        }
        totalDiscount += cut;
        currentPrice -= cut;
      }
    });

    if (currentPrice < 0) currentPrice = 0;
    currentPrice = Math.round(currentPrice);
    totalDiscount = Math.round(totalDiscount);

    const savingsPct = basePrice > 0 ? ((totalDiscount / basePrice) * 100).toFixed(0) : 0;

    const countEl = document.getElementById('scanActiveDiscountsCount');
    if (countEl) countEl.textContent = `${activeCount} Promo Aktif`;

    const finalPriceEl = document.getElementById('scanFinalPrice');
    if (finalPriceEl) finalPriceEl.textContent = `Rp ${formatNumber(currentPrice)}`;

    const pctEl = document.getElementById('scanSavingsPercent');
    if (pctEl) pctEl.textContent = `Hemat ${savingsPct}%`;

    const nomEl = document.getElementById('scanSavingsNominal');
    if (nomEl) nomEl.textContent = `Total Hemat: Rp ${formatNumber(totalDiscount)}`;

    const unitDescEl = document.getElementById('scanUnitPriceDetail');
    if (unitDescEl) unitDescEl.textContent = currentScannedItem.unitPricingDesc || `Rp ${formatNumber(currentPrice)} / ${currentScannedItem.unit}`;

    // Wallet Impact
    let currentTotalSpent = 0;
    getPurchasedCartItems().forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      currentTotalSpent += disc.finalUnitPrice * item.qty;
    });
    const newTotalSpent = currentTotalSpent + currentPrice;
    const limit = appState.budgetLimit;
    const sisa = limit - newTotalSpent;

    const tagEl = document.getElementById('scanImpactTag');
    const descEl = document.getElementById('scanImpactDesc');

    if (tagEl && descEl) {
      if (sisa >= 0) {
        tagEl.textContent = 'Aman ✅';
        tagEl.className = 'font-label-sm text-label-sm text-secondary font-bold';
        descEl.innerHTML = `Budget sisa menjadi <strong class="text-primary font-semibold">Rp ${formatNumber(sisa)}</strong> dari limit Rp ${formatNumber(Math.round(limit / 1000))}k`;
      } else {
        tagEl.textContent = 'Defisit ⚠️';
        tagEl.className = 'font-label-sm text-label-sm text-error font-bold';
        descEl.innerHTML = `<span class="text-error font-medium">Melebihi budget saku sebesar <strong class="font-bold">Rp ${formatNumber(Math.abs(sisa))}</strong>!</span>`;
      }
    }

    // Update Python analysis card
    updatePythonAnalysisCard({
      name: currentScannedItem.name,
      finalPrice: currentPrice,
      totalDiscount: totalDiscount,
      basePrice: basePrice,
      sisa: sisa
    });
  }

  function updatePythonAnalysisCard(info) {
    const nameEl = document.getElementById('pyScannedName');
    const formulaEl = document.getElementById('pyFormulaBreakdown');
    const capEl = document.getElementById('pyBudgetCapStatus');

    if (nameEl && info.name) nameEl.textContent = info.name;
    if (formulaEl) {
      const saved = info.totalDiscount || 0;
      formulaEl.textContent = `Nett: Rp ${formatNumber(info.finalPrice)} (Hemat Rp ${formatNumber(saved)})`;
    }
    if (capEl) {
      if (info.sisa < 0) {
        capEl.textContent = `Over-Budget 🚨 (Defisit Rp ${formatNumber(Math.abs(info.sisa))})`;
        capEl.className = 'text-rose-400 font-bold';
      } else if (info.sisa < appState.budgetLimit * 0.2) {
        capEl.textContent = `Waspada ⚠️ (Sisa Rp ${formatNumber(info.sisa)})`;
        capEl.className = 'text-yellow-300 font-bold';
      } else {
        capEl.textContent = `Aman ✅ (Sisa Rp ${formatNumber(info.sisa)})`;
        capEl.className = 'text-secondary-fixed font-bold';
      }
    }
  }

  async function runPythonScanAnalysis(barcode, discount) {
    const statusBadge = document.getElementById('pyEngineStatusBadge');
    if (statusBadge) {
      statusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span> Menganalisis Promo...';
      statusBadge.className = 'px-2.5 py-0.5 rounded-full bg-yellow-500/30 text-[10.5px] font-semibold text-yellow-300 flex items-center gap-1';
    }

    const code = barcode || (currentScannedItem ? currentScannedItem.barcode : '8991002105432');
    const disc = discount !== undefined ? discount : (currentScannedItem ? currentScannedItem.defaultDiscounts || '15+5' : '15+5');
    const shelfPrice = currentScannedItem ? currentScannedItem.price : 38500;
    const itemName = currentScannedItem ? currentScannedItem.name : 'Minyak Goreng Sania Pouch';

    try {
      let data = null;
      try {
        const res = await fetch(`/api/scan-python?barcode=${encodeURIComponent(code)}&discount=${encodeURIComponent(disc)}&price=${shelfPrice}`);
        if (res.ok) data = await res.json();
      } catch (netErr) {
        // Fallback offline calculation
      }

      if (!data) {
        // High-precision local calculation fallback
        const discRes = calculateDiscount(shelfPrice, disc);
        data = {
          name: itemName,
          discount_result: {
            formula_text: discRes.discountTag || (disc ? `${disc}%` : 'Harga Normal'),
            final_price: discRes.finalUnitPrice
          }
        };
      }

      const nameEl = document.getElementById('pyScannedName');
      const formulaEl = document.getElementById('pyFormulaBreakdown');
      const capEl = document.getElementById('pyBudgetCapStatus');

      if (nameEl) nameEl.textContent = data.name;
      if (formulaEl) formulaEl.textContent = `${data.discount_result.formula_text} = Rp ${formatNumber(data.discount_result.final_price)}`;

      const totalCart = getPurchasedCartItems().reduce((s, it) => s + (it.price * it.qty), 0);
      const remaining = appState.budgetLimit - (totalCart + data.discount_result.final_price);
      if (capEl) {
        if (remaining < 0) {
          capEl.textContent = `Over-Budget 🚨 (Defisit Rp ${formatNumber(Math.abs(remaining))})`;
          capEl.className = 'text-rose-400 font-bold';
        } else if (remaining < appState.budgetLimit * 0.2) {
          capEl.textContent = `Waspada ⚠️ (Sisa Rp ${formatNumber(remaining)})`;
          capEl.className = 'text-yellow-300 font-bold';
        } else {
          capEl.textContent = `Aman ✅ (Sisa Rp ${formatNumber(remaining)})`;
          capEl.className = 'text-secondary-fixed font-bold';
        }
      }

      if (statusBadge) {
        statusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-ping"></span> Sistem Aktif & Terhubung';
        statusBadge.className = 'px-2.5 py-0.5 rounded-full bg-secondary/30 text-[10.5px] font-semibold text-secondary-fixed flex items-center gap-1';
      }
    } catch (e) {
      if (statusBadge) {
        statusBadge.textContent = 'Sistem Siap (Mode Offline)';
        statusBadge.className = 'px-2.5 py-0.5 rounded-full bg-surface-container text-[10.5px] font-semibold text-outline-variant';
      }
    }
  }

  function applyScannedItemToCart() {
    if (!currentScannedItem) return;

    const basePrice = currentScannedItem.price;
    let currentPrice = basePrice;
    let totalDiscount = 0;

    scannedDiscountsState.forEach(d => {
      if (d.checked) {
        let cut = d.type === 'pct' ? currentPrice * (d.value / 100) : d.value;
        totalDiscount += cut;
        currentPrice -= cut;
      }
    });

    if (currentPrice < 0) currentPrice = 0;
    currentPrice = Math.round(currentPrice);

    const discountEffective = totalDiscount > 0 ? `${Math.round((totalDiscount / basePrice) * 100)}%` : '';

    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: currentScannedItem.name,
      category: currentScannedItem.category,
      unit: currentScannedItem.unit,
      qty: 1,
      price: currentScannedItem.price,
      discountRaw: discountEffective,
      lastMonthPrice: Number(currentScannedItem.lastMonthPrice) || undefined,
      storeName: appState.activeStore,
      priceDate: getShoppingDate(),
      barcode: currentScannedItem.barcode,
      createdAt: Date.now(),
      inPhysicalCart: true
    };

    appState.cart.unshift(newItem);
    saveCart();
    updateMasterDatabaseItem(newItem.name, newItem.category, newItem.unit, newItem.price);
    renderCart();

    AudioEngine.playSuccess();
    if (window.confetti) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#131312', '#131312', '#ffffff']
      });
    }

    showToast(`"${newItem.name}" dimasukkan ke troli!`, 'success');

    const modal = document.getElementById('modalScanResultBackdrop');
    if (modal) modal.classList.add('hidden');

    // Alihkan otomatis ke troli agar user langsung melihat item di keranjang
    const navCartBtn = document.getElementById('navBtnCart');
    if (navCartBtn) {
      setTimeout(() => navCartBtn.click(), 400);
    }
  }

  // ==========================================================================
  // SUPERMARKET STORE SELECTOR MODULE (DYNAMIC & CUSTOM STORES)
  // ==========================================================================
  const DEFAULT_SUPERMARKET_STORES = [
    'Lotte Mart Grocery - Puri Indah',
    'GrandLucky SCBD',
    'Superindo Express',
    'Hypermart Mega Mall',
    'Alfamidi Super'
  ];

  function getStoredSupermarkets() {
    try {
      const raw = localStorage.getItem('smart_grocery_stores');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [...DEFAULT_SUPERMARKET_STORES];
  }

  function saveSupermarkets(list) {
    try {
      localStorage.setItem('smart_grocery_stores', JSON.stringify(list));
    } catch (e) {}
  }

  function renderStoreButtonsList() {
    const container = document.getElementById('storeButtonsList');
    if (!container) return;

    const stores = getStoredSupermarkets();
    const active = appState.activeStore || DEFAULT_SUPERMARKET_STORES[0];

    let html = '';
    stores.forEach(store => {
      const isSelected = store === active;
      const isCustom = !DEFAULT_SUPERMARKET_STORES.includes(store);

      html += `
        <div class="store-item-row flex items-center gap-2 p-1 rounded-xl transition-all ${isSelected ? 'bg-emerald-950/40 border border-emerald-500/40 shadow-sm' : 'bg-[#181d2a] border border-[#22293d] hover:border-stone-600'}">
          <button type="button"
            class="store-item-btn flex-1 p-2.5 text-left text-white flex items-center justify-between font-mono text-xs font-bold cursor-pointer transition-all min-w-0"
            data-store="${escapeHtml(store)}"
            onclick="window.selectStore('${escapeHtml(store)}')">
            <div class="flex items-center gap-2 min-w-0">
              <span class="material-symbols-outlined text-[16px] ${isSelected ? 'text-emerald-400' : 'text-stone-400'} shrink-0">storefront</span>
              <span class="truncate ${isSelected ? 'text-emerald-300 font-black' : 'text-white'}">${escapeHtml(store)}</span>
            </div>
            <span class="material-symbols-outlined text-emerald-400 text-[18px] store-check-icon shrink-0 ${isSelected ? '' : 'hidden'}">check_circle</span>
          </button>
          ${isCustom ? `
            <button type="button"
              class="store-item-delete p-2 text-stone-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
              onclick="window.removeCustomStore('${escapeHtml(store)}', event)"
              title="Hapus supermarket ini">
              <span class="material-symbols-outlined text-[16px]">delete</span>
            </button>
          ` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  }

  window.addNewSupermarket = function () {
    const input = document.getElementById('inputNewStoreName');
    if (!input) return;
    const name = input.value.trim();
    if (!name || name.length < 2) {
      showToast('Masukkan nama supermarket yang valid (min. 2 karakter)', 'warning');
      AudioEngine.playLimitAlert();
      return;
    }

    const stores = getStoredSupermarkets();
    const existing = stores.find(s => s.toLowerCase() === name.toLowerCase());
    if (existing) {
      selectStore(existing);
      input.value = '';
      showToast(`Supermarket "${existing}" sudah ada dan kini dipilih`, 'info');
      return;
    }

    stores.unshift(name);
    saveSupermarkets(stores);
    input.value = '';

    selectStore(name);
    showToast(`✨ Supermarket baru ditambahkan: "${name}"`, 'success');
    AudioEngine.playSuccess();
  };

  window.removeCustomStore = function (storeName, event) {
    if (event) event.stopPropagation();
    if (!confirm(`Hapus "${storeName}" dari daftar pilihan supermarket?`)) return;

    let stores = getStoredSupermarkets();
    stores = stores.filter(s => s !== storeName);
    saveSupermarkets(stores);

    if (appState.activeStore === storeName) {
      selectStore(stores[0] || DEFAULT_SUPERMARKET_STORES[0]);
    } else {
      renderStoreButtonsList();
    }
    showToast(`Supermarket "${storeName}" dihapus`, 'info');
  };

  function updateStoreAcrossApp(storeName) {
    if (!storeName) return;
    const storeUpper = storeName.toUpperCase();

    // 1. Top Header
    const activeLabel = document.getElementById('activeStoreName');
    if (activeLabel) activeLabel.textContent = storeName;

    // 2. Scan View
    const scanViewStore = document.getElementById('scanViewStoreName');
    if (scanViewStore) scanViewStore.textContent = storeName;

    // 3. Catalog Section
    const catalogTitle = document.getElementById('catalogStoreTitle');
    if (catalogTitle) catalogTitle.textContent = `Katalog ${storeName}`;

    const catalogSub = document.getElementById('catalogStoreSubtitle');
    if (catalogSub) catalogSub.innerHTML = `Daftar rak ${escapeHtml(storeName)} • Klik <strong class="text-emerald-400">+ Keranjang</strong> untuk belanja langsung`;

    const searchInput = document.getElementById('inputAstroSearch');
    if (searchInput) searchInput.placeholder = `Cari barang di ${storeName} (Beras, Minyak, Telur, Mie)...`;

    // 4. Checkout Modal
    const checkoutTitle = document.getElementById('checkoutModalStoreTitle');
    if (checkoutTitle) checkoutTitle.textContent = `Kasir Pembayaran ${storeName}`;

    const checkoutPill = document.getElementById('checkoutModalStorePill');
    if (checkoutPill) checkoutPill.textContent = storeName.split(/[\s-]+/)[0];

    const checkoutSub = document.getElementById('checkoutModalStoreSubtitle');
    if (checkoutSub) checkoutSub.textContent = `Rincian Belanja & Kasir ${storeName}`;

    const checkoutStore = document.getElementById('checkoutStoreName');
    if (checkoutStore) checkoutStore.textContent = storeName;

    const voucherHeader = document.getElementById('checkoutVoucherHeaderTitle');
    if (voucherHeader) voucherHeader.textContent = `VOUCHER PROMO ${storeUpper}`;

    const qrisLabel = document.getElementById('checkoutQrisLabel');
    if (qrisLabel) qrisLabel.textContent = `QRIS ${storeName}`;

    const qrisImg = document.getElementById('checkoutQrisImage');
    if (qrisImg) {
      qrisImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(storeName + '-QRIS-PAYMENT')}`;
    }

    // 5. POS Animation & Receipts
    const posBadge = document.getElementById('posRegisterBadge');
    if (posBadge) posBadge.textContent = `Kasir ${storeName}`;

    const receiptHeader = document.getElementById('receiptStoreHeader');
    if (receiptHeader) receiptHeader.textContent = storeUpper;

    const receiptSystem = document.getElementById('receiptSystemLabel');
    if (receiptSystem) receiptSystem.textContent = `Sistem Mandiri ${storeName}`;

    const receiptFooter = document.getElementById('receiptFooterNote');
    if (receiptFooter) receiptFooter.textContent = `Catatan belanja Cartly di ${storeName}. Struk ini bukan bukti pembayaran.`;

    // 6. Update selection in store modal
    renderStoreButtonsList();
  }
  window.updateStoreAcrossApp = updateStoreAcrossApp;

  function initStoreSelectorModule() {
    renderStoreButtonsList();
    const inputNew = document.getElementById('inputNewStoreName');
    if (inputNew) {
      inputNew.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          window.addNewSupermarket();
        }
      });
    }
  }

  function openStoreModal() {
    AudioEngine.playTap();
    renderStoreButtonsList();
    const modal = document.getElementById('modalStoreBackdrop');
    if (modal) modal.classList.remove('hidden');
    const inputNew = document.getElementById('inputNewStoreName');
    if (inputNew) setTimeout(() => inputNew.focus(), 150);
  }

  function closeStoreModal() {
    const modal = document.getElementById('modalStoreBackdrop');
    if (modal) modal.classList.add('hidden');
  }

  function selectStore(storeName) {
    appState.activeStore = storeName;
    appState.selectedStore = storeName;
    saveStore(storeName);

    updateStoreAcrossApp(storeName);
    closeStoreModal();
    AudioEngine.playSuccess();
    showToast(`Lokasi supermarket diubah: ${storeName}`, 'info');
  }
  window.selectStore = selectStore;

  // ==========================================================================
  // NODE.JS & TYPESCRIPT CLOUD INSIGHTS SERVICE (/api/insights)
  // ==========================================================================
  async function requestNodeSmartInsights() {
    const btn = document.getElementById('btnRunNodeAnalytics');
    const container = document.getElementById('nodeAnalyticsResult');
    if (!btn || !container) return;

    if (appState.cart.length === 0) {
      showToast('Keranjang masih kosong. Tambahkan barang dulu!', 'warning');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Memeriksa Pengeluaran Belanja...';
    if (window.lucide) lucide.createIcons();
    AudioEngine.playTap();

    try {
      let insightData = null;

      // Call live Node.js Serverless Function on Vercel / local Node server
      try {
        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: appState.cart,
            budgetLimit: appState.budgetLimit
          })
        });

        if (response.ok) {
          insightData = await response.json();
        }
      } catch (networkErr) {
        // Fallback for static file preview
      }

      // If offline/preview, calculate with matching TypeScript logic
      if (!insightData) {
        let totalSpent = 0;
        getPurchasedCartItems().forEach(item => {
          const disc = calculateDiscount(item.price, item.discountRaw);
          totalSpent += disc.finalUnitPrice * item.qty;
        });

        const limit = appState.budgetLimit;
        const ratio = limit > 0 ? totalSpent / limit : 0;
        const status = ratio >= 1.0 ? 'DANGER' : ratio >= 0.8 ? 'WARNING' : 'SAFE';
        const healthScore = status === 'DANGER' ? Math.max(20, Math.round(100 - (ratio - 1) * 150))
          : status === 'WARNING' ? Math.round(85 - (ratio - 0.8) * 150)
          : Math.round(100 - ratio * 20);

        const recs = [];
        if (status === 'DANGER') {
          recs.push({
            type: 'WARNING',
            title: 'Defisit Anggaran Terdeteksi',
            description: `Keranjang Anda melebihi batas dompet sebesar Rp ${Math.round(totalSpent - limit).toLocaleString('id-ID')}. Disarankan memangkas barang non-pokok.`
          });
        }
        recs.push({
          type: 'SAVINGS',
          title: 'Saran & Optimasi Belanja Pintar',
          description: `Total belanjaan Rp ${totalSpent.toLocaleString('id-ID')} dengan skor kesehatan belanja ${healthScore}/100.`
        });

        insightData = {
          status,
          healthScore,
          summary: `Keranjang dianalisis (${healthScore}/100). Status dompet: ${status}.`,
          recommendations: recs
        };
      }

      // Render Insight Box
      const isDanger = (insightData.status || 'SAFE') === 'DANGER';
      const isWarning = (insightData.status || 'SAFE') === 'WARNING';
      const scoreBadgeColor = isDanger ? 'bg-rose-100 text-rose-700 border-rose-300'
        : isWarning ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
        : 'bg-emerald-100 text-emerald-800 border-emerald-300';

      let recomHtml = '';
      (insightData.recommendations || []).forEach(r => {
        const isWarn = r.type === 'WARNING';
        const cardStyle = isWarn
          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950';
        const iconName = isWarn ? 'warning' : 'tips_and_updates';
        const iconColor = isWarn ? 'text-rose-600' : 'text-emerald-600';

        recomHtml += `
          <div class="p-3 rounded-xl border ${cardStyle} flex items-start gap-2.5">
            <span class="material-symbols-outlined text-[18px] ${iconColor} shrink-0 mt-0.5">${iconName}</span>
            <div class="min-w-0 flex-1">
              <div class="font-bold text-xs leading-snug">${escapeHtml(r.title)}</div>
              <div class="text-[11px] mt-0.5 opacity-90 leading-relaxed">${escapeHtml(r.description)}</div>
            </div>
          </div>
        `;
      });

      container.innerHTML = `
        <div class="p-4 bg-white rounded-2xl border border-outline-variant/30 shadow-md space-y-3 mt-3">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div>
              <span class="font-label-sm text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Health Score Belanja</span>
              <strong class="font-numeric-lg text-2xl text-primary font-bold">${insightData.healthScore}<span class="text-xs text-gray-500 font-normal">/100</span></strong>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${scoreBadgeColor}">${insightData.status}</span>
          </div>
          <p class="text-xs text-gray-700 leading-relaxed font-medium">
            ${escapeHtml(insightData.summary)}
          </p>
          <div class="space-y-2">
            ${recomHtml}
          </div>
          <div class="text-[10px] text-gray-500 text-right pt-1">
            💡 Dianalisis oleh Cartly Engine
          </div>
        </div>
      `;

      container.classList.remove('hidden');
      AudioEngine.playSuccess();
      showToast('Pemeriksaan belanjaan selesai!', 'success');
    } catch (err) {
      showToast('Gagal memeriksa belanjaan: ' + err.message, 'danger');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="refresh-cw"></i> Perbarui Analisis Cerdas';
      if (window.lucide) lucide.createIcons();
    }
  }

  window.setQuickBudget = function (amount) {
    document.getElementById('inputQuickBudget').value = amount;
    AudioEngine.playTap();
  };

  // ==========================================================================
  // SARAN PANGKAS BELANJAAN
  // ==========================================================================
  function openTrimModal() {
    const modal = document.getElementById('modalTrimBackdrop');
    const list = document.getElementById('trimSuggestionsList');

    const sorted = [...appState.cart].sort((a, b) => {
      const isAPokok = a.category === 'Bahan Pokok';
      const isBPokok = b.category === 'Bahan Pokok';
      if (isAPokok && !isBPokok) return 1;
      if (!isAPokok && isBPokok) return -1;

      const totalA = calculateDiscount(a.price, a.discountRaw).finalUnitPrice * a.qty;
      const totalB = calculateDiscount(b.price, b.discountRaw).finalUnitPrice * b.qty;
      return totalB - totalA;
    });

    let html = '';
    if (sorted.length === 0) {
      html = `
        <div class="p-4 rounded-xl bg-surface-container text-center text-xs text-on-surface-variant font-medium">
          Keranjang belanja masih kosong.
        </div>
      `;
    } else {
      sorted.forEach(item => {
        const disc = calculateDiscount(item.price, item.discountRaw);
        const lineTotal = disc.finalUnitPrice * item.qty;

        html += `
          <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-2 border border-outline-variant/30">
            <div class="min-w-0 flex-1">
              <strong class="font-headline-sm text-xs font-bold text-primary block truncate">${escapeHtml(item.name)}</strong>
              <span class="text-[11px] text-on-surface-variant font-medium">${item.qty} ${escapeHtml(item.unit)} • Rp ${formatNumber(lineTotal)}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button type="button" class="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs transition-all cursor-pointer active:scale-95" onclick="window.reduceItemFromTrim('${item.id}')">
                -1 Qty
              </button>
              <button type="button" class="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all cursor-pointer active:scale-95" onclick="window.removeItemFromTrim('${item.id}')">
                Hapus
              </button>
            </div>
          </div>
        `;
      });
    }

    list.innerHTML = html;
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  window.reduceItemFromTrim = function (id) {
    window.changeItemQty(id, -1);
    openTrimModal();
  };

  window.removeItemFromTrim = function (id) {
    window.deleteCartItem(id);
    openTrimModal();
  };

  // ==========================================================================
  // ASTRO OFFICIAL CATALOG SHELF MODULE
  // ==========================================================================
  function initAstroCatalogModule() {
    // 1. Astro Category Filter Chips
    const chips = document.querySelectorAll('.astro-cat-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => {
          c.classList.remove('active', 'bg-[#181d30]', 'text-emerald-400', 'border-emerald-500/50', 'font-black', 'bg-primary', 'text-secondary-fixed');
          c.classList.add('bg-[#11131c]', 'text-stone-300', 'border-[#222638]', 'font-semibold');
        });
        chip.classList.add('active', 'bg-[#181d30]', 'text-emerald-400', 'border-emerald-500/50', 'font-black');
        chip.classList.remove('bg-[#11131c]', 'text-stone-300', 'border-[#222638]', 'font-semibold');

        appState.astroCategory = chip.getAttribute('data-astro-cat') || 'ALL';
        AudioEngine.playTap();
        renderAstroCatalog();
      });
    });

    // 2. Astro Search
    const searchInput = document.getElementById('inputAstroSearch');
    const clearBtn = document.getElementById('btnClearAstroSearch');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        appState.astroSearchQuery = searchInput.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.classList.toggle('hidden', appState.astroSearchQuery === '');
        }
        renderAstroCatalog();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        appState.astroSearchQuery = '';
        clearBtn.classList.add('hidden');
        renderAstroCatalog();
      });
    }

    renderAstroCatalog();
  }

  function renderAstroCatalog() {
    const grid = document.getElementById('astroCatalogGrid');
    if (!grid) return;

    let items = ASTRO_OFFICIAL_CATALOG;

    // Filter category
    if (appState.astroCategory && appState.astroCategory !== 'ALL') {
      items = items.filter(i => i.category === appState.astroCategory);
    }

    // Filter search
    if (appState.astroSearchQuery) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(appState.astroSearchQuery) ||
        i.category.toLowerCase().includes(appState.astroSearchQuery) ||
        (i.description && i.description.toLowerCase().includes(appState.astroSearchQuery))
      );
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-2 text-center py-8 text-stone-400 bg-[#11131c] rounded-2xl border border-[#222638]">
          <span class="material-symbols-outlined text-[32px] text-stone-500 block mb-1">search_off</span>
          <p class="text-xs font-bold text-white">Produk Lotte Mart tidak ditemukan</p>
          <p class="text-[11px] text-stone-400 mt-0.5">Coba kata kunci lain seperti "Beras", "Minyak", atau "Susu"</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(prod => {
      // Check if product is already in active cart
      const inCart = appState.cart.find(c => c.astroId === prod.id || c.name.toLowerCase() === prod.name.toLowerCase());
      const inCartQty = inCart ? inCart.qty : 0;
      const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;

      return `
        <div class="astro-product-card bg-white text-slate-900 border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col justify-between" data-astro-id="${prod.id}">
          <div>
            <!-- Top Badges: Icon Only -->
            <div class="flex items-center justify-start gap-1 mb-2">
              <span class="w-8 h-8 rounded-xl bg-[#181d30] border border-[#262f4c] flex items-center justify-center text-lg shadow-xs shrink-0 select-none">${prod.emoji || '🛒'}</span>
            </div>

            <!-- Title & Size: Guaranteed High Contrast White -->
              <h4 class="font-headline-sm text-xs font-black text-slate-900 line-clamp-2 leading-snug mb-1" title="${escapeHtml(prod.name)}">${escapeHtml(prod.name)}</h4>
              <div class="text-[11px] text-slate-500 font-semibold mb-2">${escapeHtml(prod.unit)}</div>

            <!-- Pricing -->
            <div class="flex items-baseline gap-1.5 mb-2.5">
              ${hasDiscount ? `<del class="text-[10px] text-slate-400 font-mono">Rp ${formatNumber(prod.originalPrice)}</del>` : ''}
              <span class="font-extrabold text-[13px] text-emerald-700 font-mono">Rp ${formatNumber(prod.price)}</span>
            </div>
          </div>

          <!-- Bottom Action Button / Stepper -->
          <div>
            ${inCartQty > 0 ? `
              <div class="flex items-center justify-between bg-[#0b0c14] border border-[#222638] rounded-xl p-1 shadow-xs">
                <button type="button" class="w-7 h-7 rounded-lg bg-[#181d30] border border-[#262f4c] hover:bg-rose-900/60 hover:text-rose-300 active:scale-90 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-all" onclick="window.addAstroToCart('${prod.id}', -1)" title="Kurangi">-</button>
                <span class="font-black text-[11px] text-emerald-400 px-1 font-mono">${inCartQty} di Troli</span>
                <button type="button" class="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 active:scale-90 flex items-center justify-center font-black text-xs cursor-pointer transition-all" onclick="window.addAstroToCart('${prod.id}', 1)" title="Tambah">+</button>
              </div>
            ` : `
              <button type="button"
                class="w-full py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-pos-key active:scale-95"
                onclick="window.addAstroToCart('${prod.id}', 1)">
                <span class="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                <span>+ Keranjang</span>
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  // 1-Click add to cart from Astro Catalog
  window.addAstroToCart = function (astroId, delta = 1) {
    const prod = ASTRO_OFFICIAL_CATALOG.find(p => p.id === astroId);
    if (!prod) return;

    let existing = appState.cart.find(c => c.astroId === prod.id || c.name.toLowerCase() === prod.name.toLowerCase());

    if (!existing) {
      if (delta <= 0) return;
      const newItem = {
        id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        astroId: prod.id,
        name: prod.name,
        category: prod.category,
        unit: prod.unit,
        qty: 1,
        price: prod.price,
        discountRaw: prod.discountRaw || '',
        storeName: appState.activeStore,
        priceDate: getShoppingDate(),
        isPlanned: true,
        inPhysicalCart: true,
        createdAt: Date.now()
      };
      appState.cart.unshift(newItem);
      AudioEngine.playTap();
      showToast(`"${prod.name}" masuk ke troli!`, 'success');
    } else {
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        window.deleteCartItem(existing.id);
        return;
      } else {
        existing.qty = nextQty;
        AudioEngine.playTap();
      }
    }

    saveCart();
    renderCart();
    renderAstroCatalog();
  };

  // ==========================================================================
  // CARTLY CHECKOUT & PAYMENT RECORDING
  // ==========================================================================
  let checkoutPaymentMethod = 'cash';
  let checkoutPaymentSubmitted = false;

  function initAstroCheckoutModule() {
    document.getElementById('btnClosePaymentView')?.addEventListener('click', closeAstroCheckoutModal);
    document.getElementById('btnCloseReceiptView')?.addEventListener('click', closeAstroCheckoutModal);
    document.getElementById('btnCopyReceiptText')?.addEventListener('click', copyThermalReceiptSummary);
    document.getElementById('btnConfirmCheckoutPayment')?.addEventListener('click', completeCheckoutAndDisplayReceipt);
    document.querySelectorAll('.checkout-payment-method').forEach(button => {
      button.addEventListener('click', () => selectCheckoutPaymentMethod(button.dataset.method));
    });
    document.getElementById('checkoutExactCash')?.addEventListener('click', () => {
      const amountInput = document.getElementById('checkoutCashAmount');
      if (amountInput) amountInput.value = String(calculateCurrentSubtotal());
      updateCheckoutCashChange();
    });
    document.getElementById('checkoutCashAmount')?.addEventListener('input', updateCheckoutCashChange);
    document.getElementById('checkoutDigitalPaidConfirm')?.addEventListener('change', updateCheckoutPaymentButton);
    document.getElementById('btnDoneAstroCheckout')?.addEventListener('click', () => {
      closeAstroCheckoutModal();
      document.getElementById('navBtnCart')?.click();
    });
    document.getElementById('btnViewHistoryFromReceipt')?.addEventListener('click', () => {
      closeAstroCheckoutModal();
      document.getElementById('navBtnHistory')?.click();
    });
  }
  function openAstroCheckoutModal() {
    const purchasedItems = getPurchasedCartItems();
    if (purchasedItems.length === 0) {
      showToast('Centang barang yang sudah dibeli sebelum melanjutkan pembayaran.', 'warning');
      return;
    }
    const total = calculateCurrentSubtotal();
    if (total > appState.budgetLimit) {
      showToast(`Total belanja melebihi batas Rp ${formatNumber(appState.budgetLimit)}. Kurangi barang sebelum membayar.`, 'warning');
      return;
    }
    const modal = document.getElementById('modalAstroCheckout');
    const stagePayment = document.getElementById('checkoutStagePayment');
    const stageReceipt = document.getElementById('checkoutStageReceipt');
    if (!modal || !stagePayment || !stageReceipt) return;
    checkoutPaymentSubmitted = false;
    checkoutPaymentMethod = 'cash';
    stagePayment.classList.remove('hidden');
    stageReceipt.classList.add('hidden');
    const storeLabel = document.getElementById('checkoutStoreLabel');
    if (storeLabel) storeLabel.textContent = appState.activeStore || 'Belanja Cartly';
    const itemsContainer = document.getElementById('checkoutPaymentItems');
    if (itemsContainer) {
      itemsContainer.innerHTML = purchasedItems.map(item => {
        const finalUnitPrice = calculateDiscount(item.price, item.discountRaw).finalUnitPrice;
        return `<div class="flex justify-between gap-3 text-xs text-white"><span class="min-w-0">${escapeHtml(item.name)} × ${item.qty}</span><strong class="shrink-0">Rp ${formatNumber(finalUnitPrice * item.qty)}</strong></div>`;
      }).join('');
    }
    const subtotalEl = document.getElementById('checkoutPaymentSubtotal');
    const totalEl = document.getElementById('checkoutPaymentTotal');
    const cashInput = document.getElementById('checkoutCashAmount');
    const digitalCheck = document.getElementById('checkoutDigitalPaidConfirm');
    if (subtotalEl) subtotalEl.textContent = `Rp ${formatNumber(total)}`;
    if (totalEl) totalEl.textContent = `Rp ${formatNumber(total)}`;
    if (cashInput) cashInput.value = String(total);
    if (digitalCheck) digitalCheck.checked = false;
    selectCheckoutPaymentMethod('cash');
    modal.classList.remove('hidden');
  }

  function selectCheckoutPaymentMethod(method) {
    const allowedMethods = ['cash', 'qris'];
    checkoutPaymentMethod = allowedMethods.includes(method) ? method : 'cash';
    document.querySelectorAll('.checkout-payment-method').forEach(button => {
      const selected = button.dataset.method === checkoutPaymentMethod;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('border-emerald-500', selected);
      button.classList.toggle('bg-emerald-950/40', selected);
      button.classList.toggle('border-[#30384b]', !selected);
      button.classList.toggle('bg-[#151a24]', !selected);
    });
    document.getElementById('checkoutCashPanel')?.classList.toggle('hidden', checkoutPaymentMethod !== 'cash');
    document.getElementById('checkoutDigitalPanel')?.classList.toggle('hidden', checkoutPaymentMethod === 'cash');
    updateCheckoutCashChange();
    updateCheckoutPaymentButton();
  }

  function updateCheckoutCashChange() {
    const total = calculateCurrentSubtotal();
    const paid = Number(document.getElementById('checkoutCashAmount')?.value) || 0;
    const changeEl = document.getElementById('checkoutCashChange');
    if (changeEl) {
      if (paid < total) {
        changeEl.textContent = `Uang kurang: Rp ${formatNumber(total - paid)}`;
        changeEl.className = 'text-xs font-semibold text-rose-300';
      } else {
        changeEl.textContent = `Kembalian: Rp ${formatNumber(paid - total)}`;
        changeEl.className = 'text-xs font-semibold text-emerald-300';
      }
    }
    updateCheckoutPaymentButton();
  }

  function updateCheckoutPaymentButton() {
    const button = document.getElementById('btnConfirmCheckoutPayment');
    if (!button) return;
    const paid = Number(document.getElementById('checkoutCashAmount')?.value) || 0;
    const total = calculateCurrentSubtotal();
    const digitalConfirmed = document.getElementById('checkoutDigitalPaidConfirm')?.checked === true;
    const overBudget = total > appState.budgetLimit;
    const canSubmit = getPurchasedCartItems().length > 0 && !overBudget &&
      (checkoutPaymentMethod === 'cash' ? paid >= total : digitalConfirmed);
    button.disabled = checkoutPaymentSubmitted || !canSubmit;
    button.textContent = overBudget
      ? 'Anggaran terlampaui'
      : checkoutPaymentMethod === 'cash' ? 'Konfirmasi pembayaran tunai' : 'Catat pembayaran selesai';
  }

  function closeAstroCheckoutModal() {
    const modal = document.getElementById('modalAstroCheckout');
    if (modal) modal.classList.add('hidden');
  }

  function completeCheckoutAndDisplayReceipt() {
    const purchasedItems = getPurchasedCartItems();
    if (checkoutPaymentSubmitted) return;
    if (purchasedItems.length === 0) {
      showToast('Centang barang yang sudah dibeli sebelum menyelesaikan transaksi.', 'warning');
      return;
    }
    const total = calculateCurrentSubtotal();
    if (total > appState.budgetLimit) {
      updateCheckoutPaymentButton();
      showToast(`Transaksi tidak dapat dilanjutkan. Kurangi belanja Rp ${formatNumber(total - appState.budgetLimit)} agar sesuai anggaran.`, 'warning');
      return;
    }
    const cashPaid = Number(document.getElementById('checkoutCashAmount')?.value) || 0;
    const digitalConfirmed = document.getElementById('checkoutDigitalPaidConfirm')?.checked === true;
    if (checkoutPaymentMethod === 'cash' && cashPaid < total) {
      showToast(`Uang yang diterima kurang Rp ${formatNumber(total - cashPaid)}.`, 'warning');
      return;
    }
    if (checkoutPaymentMethod !== 'cash' && !digitalConfirmed) {
      showToast('Konfirmasi pembayaran digital terlebih dahulu.', 'warning');
      return;
    }

    const receiptItems = purchasedItems.map(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const lineTotal = disc.finalUnitPrice * item.qty;
      updateMasterDatabaseItem(item.name, item.category, item.unit, item.price);
      return {
        name: item.name,
        category: item.category,
        unit: item.unit,
        qty: item.qty,
        originalPrice: item.price,
        finalUnitPrice: disc.finalUnitPrice,
        lineTotal
      };
    });
    if (receiptItems.length === 0) {
      showToast('Struk tidak dapat dibuat karena daftar barang kosong.', 'warning');
      return;
    }

    checkoutPaymentSubmitted = true;
    updateCheckoutPaymentButton();

    document.getElementById('checkoutStagePayment')?.classList.add('hidden');
    const stageReceipt = document.getElementById('checkoutStageReceipt');
    stageReceipt?.classList.remove('hidden');

    const subtotal = total;
    const discount = 0;
    const grandTotal = subtotal;

    const storePrefix = (appState.activeStore || 'CARTLY').split(/[\s-]+/)[0].toUpperCase();
    const trxId = `${storePrefix}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';

    const customerName = appState.currentUser?.displayName || appState.currentUser?.username || 'Rian Pratama';

    const paymentLabels = { cash: 'Tunai', qris: 'QRIS (konfirmasi manual)' };
    const receiptLabel = paymentLabels[checkoutPaymentMethod];

    // Populate Thermal Receipt Elements
    const elTrx = document.getElementById('receiptTrxId');
    const elTime = document.getElementById('receiptTimestamp');
    const elCust = document.getElementById('receiptCustomerName');
    const elMethod = document.getElementById('receiptPaymentMethodLabel');
    const elStatus = document.getElementById('receiptPaymentStatus');
    const elItemsBody = document.getElementById('receiptItemsBody');
    const elSub = document.getElementById('receiptSubtotal');
    const elVouch = document.getElementById('receiptVoucherDiscount');
    const elGrand = document.getElementById('receiptGrandTotal');

    if (elTrx) elTrx.textContent = trxId;
    if (elTime) elTime.textContent = nowStr;
    if (elCust) elCust.textContent = customerName;
    if (elMethod) elMethod.textContent = receiptLabel;
    if (elStatus) elStatus.textContent = 'Lunas';
    if (elSub) elSub.textContent = `Rp ${formatNumber(subtotal)}`;
    if (elVouch) elVouch.textContent = discount > 0 ? `-Rp ${formatNumber(discount)}` : 'Rp 0';
    if (elGrand) elGrand.textContent = `Rp ${formatNumber(grandTotal)}`;

    // Render item lines after confirming the receipt has transaction items.
    if (elItemsBody) {
      elItemsBody.innerHTML = receiptItems.map(item => `
        <div class="flex justify-between items-start text-[11px] leading-tight py-1 border-b border-[#222638] last:border-b-0">
          <div class="flex-1 pr-2">
            <span class="font-bold text-white">${escapeHtml(item.name)}</span>
            <span class="block text-[10px] text-white/90 font-medium">${item.qty} ${escapeHtml(item.unit)} @ Rp ${formatNumber(item.finalUnitPrice)}</span>
          </div>
          <strong class="font-mono text-white font-bold shrink-0">Rp ${formatNumber(item.lineTotal)}</strong>
        </div>
      `).join('');
    }

    // Save to user's isolated history
    const newReceipt = {
      id: trxId,
      date: nowStr,
      createdAt: new Date().toISOString(),
      budgetLimit: appState.budgetLimit,
      grandTotal,
      totalSaved: discount,
      itemCount: receiptItems.length,
      items: receiptItems,
      paymentMethod: receiptLabel,
      paymentStatus: 'paid',
      cashReceived: checkoutPaymentMethod === 'cash' ? cashPaid : null,
      cashChange: checkoutPaymentMethod === 'cash' ? cashPaid - grandTotal : null
    };

    appState.history = [newReceipt, ...appState.history.filter(receipt => receipt.id !== newReceipt.id)];
    saveHistory();
    renderHistoryList();
    const purchasedIds = new Set(purchasedItems.map(item => item.id));
    appState.cart = appState.cart.filter(item => !purchasedIds.has(item.id));

    saveCart();
    saveMaster();

    renderCart();
    renderAstroCatalog();

    // Auto push receipt to Supabase if connected
    if (appState.supabaseClient) {
      if (appState.currentUser?.id) appState.supabaseClient.from('receipts').upsert({
        id: newReceipt.id,
        owner_id: appState.currentUser?.id,
        date_label: newReceipt.date,
        budget_limit: newReceipt.budgetLimit,
        grand_total: newReceipt.grandTotal,
        total_saved: newReceipt.totalSaved,
        item_count: newReceipt.itemCount,
        items: newReceipt.items,
        payment_method: newReceipt.paymentMethod,
        created_at: newReceipt.createdAt
      }, { onConflict: 'owner_id,id' }).then(({ error }) => {
        if (error) {
          console.error('Receipt sync failed:', error);
          showToast('Pembayaran tercatat di perangkat. Sinkronisasi cloud gagal; jalankan pembaruan skema Supabase.', 'warning');
        }
      }).catch(error => {
        console.error('Receipt sync failed:', error);
        showToast('Pembayaran tercatat di perangkat, tetapi koneksi cloud gagal.', 'warning');
      });
    }

    if (window.confetti) {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#131312', '#131312', '#ffffff', '#ffd700']
      });
    }

    showToast('Pembayaran dicatat dan struk berhasil dibuat.', 'success');
  }

  function copyThermalReceiptSummary() {
    const elTrx = document.getElementById('receiptTrxId')?.textContent || '';
    const elCust = document.getElementById('receiptCustomerName')?.textContent || '';
    const elGrand = document.getElementById('receiptGrandTotal')?.textContent || '';

    const method = document.getElementById('receiptPaymentMethodLabel')?.textContent || '';
    const text = `🧾 STRUK BELANJA ${(appState.activeStore || 'SUPERMARKET').toUpperCase()}\nNo. Transaksi: ${elTrx}\nPelanggan: ${elCust}\nTOTAL: ${elGrand}\nMetode: ${method}\nStatus: Lunas (dicatat di Cartly)`;

    navigator.clipboard?.writeText(text);
    AudioEngine.playTap();
    showToast('Teks struk berhasil disalin ke clipboard!', 'success');
  }

  function formatReceiptDate(rawDate) {
    if (!rawDate) return 'Struk Transaksi';
    // Remove consecutive repeated character spam (e.g. zzzzzzzzz)
    let clean = String(rawDate).replace(/[\r\n]+/g, ' ').replace(/(.)\1{8,}/g, '$1$1$1...').trim();
    if (clean.length > 32) {
      clean = clean.substring(0, 29) + '...';
    }
    return clean || 'Struk Transaksi';
  }

  function renderHistoryList() {
    const container = document.getElementById('historyListContainer');
    if (!container) return;

    if (appState.history.length === 0) {
      container.innerHTML = `
        <div class="neo-empty-box">
          <div class="empty-glyph">🧾</div>
          <h3>Belum Ada Struk Riwayat</h3>
          <p>Struk dari transaksi yang selesai akan tersimpan otomatis di sini.</p>
        </div>
      `;
      return;
    }

    let html = '';
    appState.history.forEach(rcp => {
      const displayDate = formatReceiptDate(rcp.date);
      html += `
        <div class="neo-history-card">
          <div class="h-top">
            <span class="h-date" title="${escapeHtml(rcp.date)}">
              <i data-lucide="calendar"></i>
              <span class="truncate">${escapeHtml(displayDate)}</span>
            </span>
            <div class="flex items-center gap-2 shrink-0">
              <span class="h-price">Rp ${formatNumber(rcp.grandTotal)}</span>
              <button class="btn-delete-receipt" onclick="window.deleteReceipt('${rcp.id}', event)" title="Hapus Struk Ini">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </div>
          <div class="h-sub">
            <span>${rcp.itemCount} Jenis • Hemat Promo: Rp ${formatNumber(rcp.totalSaved)}</span>
          </div>
          <button class="btn-neo-secondary full-w" onclick="window.showReceiptModal('${rcp.id}')">
            <i data-lucide="file-text"></i> BUKA STRUK DIGITAL
          </button>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  window.deleteReceipt = async function (receiptId, event) {
    if (event) event.stopPropagation();
    if (!confirm('Hapus struk transaksi ini dari riwayat?')) return;

    appState.history = appState.history.filter(h => h.id !== receiptId);
    saveHistory();
    renderHistoryList();

    if (appState.supabaseClient) {
      try {
        await appState.supabaseClient.from('receipts').delete().eq('id', receiptId).eq('owner_id', appState.currentUser?.id);
      } catch (err) {
        console.warn('Failed to delete receipt from Supabase:', err);
      }
    }
    AudioEngine.playTap();
    showToast('Struk riwayat berhasil dihapus', 'info');
  };

  window.clearAllHistory = async function () {
    if (appState.history.length === 0) {
      showToast('Riwayat struk sudah kosong', 'info');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA struk riwayat belanja?')) return;

    const idsToDelete = appState.history.map(h => h.id);
    appState.history = [];
    saveHistory();
    renderHistoryList();

    if (appState.supabaseClient && idsToDelete.length > 0) {
      try {
        await appState.supabaseClient.from('receipts').delete().in('id', idsToDelete).eq('owner_id', appState.currentUser?.id);
      } catch (err) {
        console.warn('Failed to clear receipts in Supabase:', err);
      }
    }
    AudioEngine.playTap();
    showToast('Semua riwayat struk telah dibersihkan', 'info');
  };

  window.showReceiptModal = function (receiptId) {
    const rcp = appState.history.find(h => h.id === receiptId);
    if (!rcp) return;

    const body = document.getElementById('receiptModalBody');
    let itemsHtml = '';

    (rcp.items || []).forEach(item => {
      itemsHtml += `
        <div class="receipt-line-split">
          <span class="break-words mr-2">${escapeHtml(item.name)} (${item.qty} ${escapeHtml(item.unit || 'pcs')})</span>
          <span class="shrink-0">Rp ${formatNumber(item.lineTotal || 0)}</span>
        </div>
      `;
    });

    const displayDate = formatReceiptDate(rcp.date);

    body.innerHTML = `
      <div class="receipt-paper-slip">
        <div class="receipt-slip-top">
          <div class="receipt-market-name">SUPERMARKET GROSIR</div>
          <small>Struk Belanja Mandiri • Cartly</small>
          <div class="receipt-meta-row font-mono text-[11px]">${escapeHtml(displayDate)}</div>
          <div class="receipt-meta-row text-[11px]">Metode: ${escapeHtml(rcp.paymentMethod || 'Belum dicatat')} • ${rcp.paymentStatus === 'paid' || (rcp.paymentMethod && !/belum dibayar|catatan belanja/i.test(rcp.paymentMethod)) ? 'Lunas' : 'Belum dibayar'}</div>
        </div>
        <div class="receipt-lines-list max-h-60 overflow-y-auto my-2 pr-1">
          ${itemsHtml}
        </div>
        <div class="receipt-slip-total">
          <span>TOTAL:</span>
          <span>Rp ${formatNumber(rcp.grandTotal)}</span>
        </div>
        <div class="receipt-savings-banner">
          Hemat Promo: Rp ${formatNumber(rcp.totalSaved)}
        </div>
      </div>
    `;

    document.getElementById('modalReceiptBackdrop').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  };

  // ==========================================================================
  // BUDGET TAB BREAKDOWN & DOMPET TAB
  // ==========================================================================
  function renderDompetTab() {
    updateBudgetHud();
    renderBudgetBreakdown();
  }

  function renderBudgetBreakdown() {
    const container = document.getElementById('categoryBreakdownList');
    if (!container) return;

    const catTotals = {};
    let grandTotal = 0;

    getPurchasedCartItems().forEach(item => {
      const disc = calculateDiscount(item.price, item.discountRaw);
      const line = disc.finalUnitPrice * item.qty;
      catTotals[item.category] = (catTotals[item.category] || 0) + line;
      grandTotal += line;
    });

    const categories = [
      { name: 'Bahan Pokok', icon: '🌾' },
      { name: 'Makanan & Minuman', icon: '🍜' },
      { name: 'Kebersihan', icon: '🧺' },
      { name: 'Dapur & Bumbu', icon: '🍳' },
      { name: 'Lainnya', icon: '📦' }
    ];
    let html = '';
    categories.forEach(item => {
      const cat = item.name;
      const total = catTotals[cat] || 0;
      const pct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : 0;

      html += `
        <div class="cat-neo-row">
          <div class="cat-neo-meta flex items-center justify-between mb-1.5 text-xs">
            <span class="flex items-center gap-1.5">
              <span class="text-sm">${item.icon}</span>
              <strong class="text-white font-bold">${cat}</strong>
              <span class="cat-pct text-stone-400 font-mono text-xs font-semibold">(${pct}%)</span>
            </span>
            <span class="cat-amt text-emerald-400 font-mono font-black text-xs">Rp ${formatNumber(total)}</span>
          </div>
          <div class="cat-track-neo">
            <div class="cat-fill-neo" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================================================
  // TAB 2: PROMO & VALUE COMPARATOR TOOL
  // ==========================================================================
  function initComparatorTool() {
    const calcOrigPrice = document.getElementById('calcOrigPrice');
    const calcDiscountInput = document.getElementById('calcDiscountInput');

    function runPromoCalc() {
      if (!calcOrigPrice || !calcDiscountInput) return;
      const price = parseFloat(calcOrigPrice.value) || 0;
      const discStr = calcDiscountInput.value;
      const res = calculateDiscount(price, discStr);

      const elFinal = document.getElementById('calcFinalPrice');
      if (elFinal) elFinal.textContent = `Rp ${formatNumber(res.finalUnitPrice)}`;
      const savedPct = price > 0 ? ((res.savedPerUnit / price) * 100).toFixed(1) : 0;
      const elSaved = document.getElementById('calcSavedAmount');
      if (elSaved) elSaved.textContent = `Hemat Rp ${formatNumber(res.savedPerUnit)} (${savedPct}%)`;
      const elFormula = document.getElementById('calcFormulaBreakdown');
      if (elFormula) elFormula.textContent = res.formulaText;
    }

    if (calcOrigPrice && calcDiscountInput) {
      calcOrigPrice.addEventListener('input', runPromoCalc);
      calcDiscountInput.addEventListener('input', runPromoCalc);
      calcOrigPrice.value = '100000';
      calcDiscountInput.value = '50+20';
      runPromoCalc();
    }

    // Unit Price Comparison
    const cmpSizeA = document.getElementById('cmpSizeA');
    const cmpUnitA = document.getElementById('cmpUnitA');
    const cmpPriceA = document.getElementById('cmpPriceA');
    const cmpSizeB = document.getElementById('cmpSizeB');
    const cmpUnitB = document.getElementById('cmpUnitB');
    const cmpPriceB = document.getElementById('cmpPriceB');

    function runUnitComparison() {
      const sizeA = parseFloat(cmpSizeA?.value) || 1;
      const priceA = parseFloat(cmpPriceA?.value) || 0;
      const sizeB = parseFloat(cmpSizeB?.value) || 1;
      const priceB = parseFloat(cmpPriceB?.value) || 0;

      let normSizeA = sizeA;
      if (cmpUnitA && (cmpUnitA.value === 'ml' || cmpUnitA.value === 'gram')) normSizeA = sizeA / 1000;

      let normSizeB = sizeB;
      if (cmpUnitB && (cmpUnitB.value === 'ml' || cmpUnitB.value === 'gram')) normSizeB = sizeB / 1000;

      const unitCostA = normSizeA > 0 ? priceA / normSizeA : 0;
      const unitCostB = normSizeB > 0 ? priceB / normSizeB : 0;

      const unitName = (cmpUnitA && (cmpUnitA.value === 'ml' || cmpUnitA.value === 'liter')) ? 'Liter' :
        (cmpUnitA && (cmpUnitA.value === 'gram' || cmpUnitA.value === 'kg')) ? 'Kg' : 'pcs';

      const elCostA = document.getElementById('unitCostA');
      if (elCostA) elCostA.textContent = `Rp ${formatNumber(Math.round(unitCostA))} / ${unitName}`;
      const elCostB = document.getElementById('unitCostB');
      if (elCostB) elCostB.textContent = `Rp ${formatNumber(Math.round(unitCostB))} / ${unitName}`;

      const title = document.getElementById('cmpVerdictTitle');
      const desc = document.getElementById('cmpVerdictDesc');

      if (title && desc && unitCostA > 0 && unitCostB > 0) {
        if (unitCostA < unitCostB) {
          const diff = unitCostB - unitCostA;
          const pct = ((diff / unitCostB) * 100).toFixed(1);
          title.textContent = 'Opsi A Lebih Hemat!';
          desc.textContent = `Hemat Rp ${formatNumber(Math.round(diff))}/${unitName} (${pct}% lebih murah).`;
        } else if (unitCostB < unitCostA) {
          const diff = unitCostA - unitCostB;
          const pct = ((diff / unitCostA) * 100).toFixed(1);
          title.textContent = 'Opsi B Lebih Hemat!';
          desc.textContent = `Hemat Rp ${formatNumber(Math.round(diff))}/${unitName} (${pct}% lebih murah).`;
        } else {
          title.textContent = 'Nilai Ekonomis Sama';
          desc.textContent = 'Harga per satuan kedua opsi persis sama.';
        }
      }
    }

    [cmpSizeA, cmpUnitA, cmpPriceA, cmpSizeB, cmpUnitB, cmpPriceB].forEach(el => {
      if (el) {
        el.addEventListener('input', runUnitComparison);
        el.addEventListener('change', runUnitComparison);
      }
    });
    runUnitComparison();
  }

  window.setCalcDiscount = function (str) {
    const input = document.getElementById('calcDiscountInput');
    if (input) {
      input.value = str;
      input.dispatchEvent(new Event('input'));
      AudioEngine.playTap();
    }
  };

  // ==========================================================================
  // DATA EXPORT / IMPORT / RESET
  // ==========================================================================
  function exportDataJson() {
    const data = {
      cart: appState.cart,
      budgetLimit: appState.budgetLimit,
      history: appState.history,
      masterItems: appState.masterItems,
      priceHistory: appState.priceHistory,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-grocery-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor', 'success');
  }

  function importDataJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = JSON.parse(event.target.result);
        if (data.cart) appState.cart = data.cart;
        if (data.budgetLimit) appState.budgetLimit = data.budgetLimit;
        if (data.history) appState.history = data.history;
        if (data.masterItems) appState.masterItems = data.masterItems;
        if (Array.isArray(data.priceHistory)) appState.priceHistory = data.priceHistory;

        saveCart();
        saveBudget();
        saveHistory();
        saveMaster();
        savePriceHistory();
        renderAll();
        showToast('Data berhasil diimpor', 'success');
      } catch (err) {
        showToast('Gagal membaca file JSON', 'danger');
      }
    };
    reader.readAsText(file);
  }

  function resetAllData() {
    if (confirm('Reset seluruh data ke pengaturan awal?')) {
      appState.cart = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_CART));
      appState.budgetLimit = 350000;
      appState.history = [];
      appState.masterItems = JSON.parse(JSON.stringify(DEFAULT_MASTER_ITEMS));
      appState.priceHistory = [];

      saveCart();
      saveBudget();
      saveHistory();
      saveMaster();
      savePriceHistory();
      renderAll();
      AudioEngine.playSuccess();
      showToast('Data direset', 'success');
    }
  }

  // ==========================================================================
  // SHOPPING PLANNER MODULE (MENCATAT SEBELUM KE SUPERMARKET)
  // ==========================================================================
  let currentShelfModalPlannerItem = null;

  function renderShoppingPlannerSection() {
    // 1. Render di Tab 1 (Troli: #plannerPendingItemsList)
    const shelfContainer = document.getElementById('plannerPendingItemsList');
    const pill = document.getElementById('plannerProgressPill');

    const pendingItems = appState.planner.filter(p => !p.isPurchased);
    const purchasedItems = appState.planner.filter(p => p.isPurchased);

    if (pill) {
      pill.textContent = `${purchasedItems.length}/${appState.planner.length} Terbeli`;
      pill.classList.toggle('hidden', appState.planner.length === 0);
    }

    const plannerBadge = document.getElementById('navPlannerBadge');
    if (plannerBadge) {
      if (pendingItems.length > 0) {
        plannerBadge.textContent = pendingItems.length;
        plannerBadge.classList.remove('hidden');
      } else {
        plannerBadge.classList.add('hidden');
      }
    }

    if (shelfContainer) {
      if (pendingItems.length === 0) {
        shelfContainer.innerHTML = '';
      } else {
        let html = '';
        pendingItems.forEach(item => {
          html += `
            <div class="p-3 bg-surface-container-low rounded-2xl flex items-center justify-between gap-2 border border-outline-variant/30">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <span class="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-surface-container text-secondary">
                    ${escapeHtml(item.category)}
                  </span>
                </div>
                <h4 class="font-headline-sm text-[14px] text-primary font-bold truncate">${escapeHtml(item.name)}</h4>
                <span class="font-body-sm text-[12px] text-on-surface-variant font-medium">Kebutuhan: <strong>${item.qty} ${escapeHtml(item.unit)}</strong></span>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <button class="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-[12px] font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer hover:bg-primary-container"
                  onclick="window.openShelfPriceModal('${item.id}')" title="Ketik harga saat menemukan di rak">
                  <span class="material-symbols-outlined text-[15px]">price_change</span>
                  <span>Input Harga Rak</span>
                </button>
              </div>
            </div>
          `;
        });
        shelfContainer.innerHTML = html;
      }
    }

    // 2. Render di Tab 3 (Shopping Planner Full List: #shoppingPlannerFullList)
    const fullContainer = document.getElementById('shoppingPlannerFullList');
    const badgeCount = document.getElementById('plannerActiveCountBadge');
    if (badgeCount) badgeCount.textContent = `${appState.planner.length} Item`;

    if (fullContainer) {
      if (appState.planner.length === 0) {
        fullContainer.innerHTML = '';
      } else {
        let html = '';
        appState.planner.forEach(item => {
          const isDone = item.isPurchased;

          html += `
            <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between gap-2 border border-outline-variant/30 ${isDone ? 'opacity-70 bg-surface-container' : ''}">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="w-6 h-6 rounded-full ${isDone ? 'bg-secondary text-white' : 'bg-surface-container-highest text-outline'} flex items-center justify-center text-[13px] font-bold">
                  ${isDone ? '✓' : '•'}
                </span>
                <div class="min-w-0">
                  <h4 class="font-headline-sm text-[14px] text-primary font-bold truncate ${isDone ? 'line-through text-outline' : ''}">${escapeHtml(item.name)}</h4>
                  <div class="flex items-center gap-2 font-body-sm text-[11px] text-on-surface-variant">
                    <span>${item.qty} ${escapeHtml(item.unit)}</span>
                    <span>•</span>
                    <span>${escapeHtml(item.category)}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <span class="font-label-sm text-[11px] font-bold px-2 py-0.5 rounded-full ${isDone ? 'bg-secondary-fixed/30 text-secondary' : 'bg-surface-container-highest text-outline'}">
                  ${isDone ? 'Sudah di Troli' : 'Direncanakan'}
                </span>
                <button class="w-7 h-7 rounded-full text-error hover:bg-red-50 flex items-center justify-center cursor-pointer"
                  onclick="window.deletePlannerItem('${item.id}')" title="Hapus dari Rencana">
                  <span class="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          `;
        });
        fullContainer.innerHTML = html;
      }
    }
  }

  window.openShelfPriceModal = function (plannerId) {
    const item = appState.planner.find(p => p.id === plannerId);
    if (!item) return;

    currentShelfModalPlannerItem = item;
    AudioEngine.playTap();

    document.getElementById('shelfModalPlannerId').value = item.id;
    document.getElementById('shelfModalItemName').textContent = item.name;
    document.getElementById('shelfModalItemSpec').textContent = `${item.qty} ${item.unit} • ${item.category}`;

    const inputPrice = document.getElementById('inputShelfPrice');
    inputPrice.value = '';
    document.getElementById('inputShelfDiscount').value = '';

    document.getElementById('modalShelfPriceBackdrop').classList.remove('hidden');
    inputPrice.focus();
  };

  function applyShelfPriceModalSubmit(e) {
    if (e) e.preventDefault();
    if (!currentShelfModalPlannerItem) return;

    const price = parseFloat(document.getElementById('inputShelfPrice').value) || 0;
    const discountRaw = document.getElementById('inputShelfDiscount').value.trim();
    if (price <= 0) {
      showToast('Masukkan harga di rak yang valid', 'warning');
      return;
    }

    const newCartItem = {
      id: 'item-' + Date.now(),
      name: currentShelfModalPlannerItem.name,
      category: currentShelfModalPlannerItem.category,
      unit: currentShelfModalPlannerItem.unit,
      qty: currentShelfModalPlannerItem.qty,
      price: price,
      discountRaw: discountRaw,
      storeName: appState.activeStore,
      priceDate: getShoppingDate(),
      createdAt: Date.now(),
      inPhysicalCart: true,
      isPlanned: true,
      plannerItemId: currentShelfModalPlannerItem.id
    };

    appState.cart.unshift(newCartItem);
    currentShelfModalPlannerItem.isPurchased = true;

    saveCart();
    savePlanner();
    updateMasterDatabaseItem(newCartItem.name, newCartItem.category, newCartItem.unit, price);

    document.getElementById('modalShelfPriceBackdrop').classList.add('hidden');
    renderCart();
    renderShoppingPlannerSection();

    AudioEngine.playSuccess();
    showToast(`"${newCartItem.name}" dimasukkan ke troli sesuai rencana!`, 'success');
  }

  function addPlannerItemFromForm(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('inputPlannerName');
    const catSelect = document.getElementById('selectPlannerCategory');
    const unitSelect = document.getElementById('selectPlannerUnit');
    const qtyInput = document.getElementById('inputPlannerQty');

    const name = nameInput.value.trim();
    const category = catSelect.value;
    const unit = unitSelect.value;
    const qty = parseInt(qtyInput.value, 10) || 1;

    if (!name) return;

    const newPlan = {
      id: 'plan-' + Date.now(),
      name,
      category,
      unit,
      qty,
      isPurchased: false,
      createdAt: Date.now()
    };

    appState.planner.unshift(newPlan);
    savePlanner();
    renderShoppingPlannerSection();

    nameInput.value = '';
    qtyInput.value = '1';

    AudioEngine.playTap();
    showToast(`"${name}" dicatat ke Rencana Belanja`, 'success');
  }

  window.deletePlannerItem = function (id) {
    const item = appState.planner.find(p => p.id === id);
    if (!item) return;

    appState.planner = appState.planner.filter(p => p.id !== id);
    savePlanner();
    renderShoppingPlannerSection();
    showToast(`"${item.name}" dihapus dari rencana`, 'warning');
  };

  function clearCompletedPlannerItems() {
    const prevCount = appState.planner.length;
    appState.planner = appState.planner.filter(p => !p.isPurchased);
    if (appState.planner.length < prevCount) {
      savePlanner();
      renderShoppingPlannerSection();
      showToast('Item yang sudah terbeli dibersihkan', 'info');
    }
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS & HELPERS
  // ==========================================================================
  function showToast(message, type = 'info') {
    const toast = document.getElementById('neoToast');
    const msgEl = document.getElementById('toastMessage');
    const iconEl = document.getElementById('toastIcon');

    if (toast && msgEl) {
      msgEl.textContent = message;
      toast.className = `neo-toast show ${type}`;
      if (iconEl) {
        iconEl.textContent = type === 'success' ? 'check_circle' :
          type === 'danger' ? 'error' :
            type === 'warning' ? 'warning' : 'info';
      }
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
      return;
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    container.appendChild(t);

    setTimeout(() => {
      t.remove();
    }, 2500);
  }

  function formatNumber(num) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('id-ID');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // AUTHENTICATION & MULTI-USER DATA ISOLATION MODULE
  // ==========================================================================
  // Supabase is the single source of truth for account credentials.

  function initAuthModule() {
    const loginScreen = document.getElementById('loginScreen');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');
    const formLogin = document.getElementById('formUsernameLogin');
    const formRegister = document.getElementById('formRegisterUser');
    const btnGoogle = document.getElementById('btnGoogleLoginTrigger');
    const GOOGLE_CLIENT_ID_KEY = 'smart_grocery_google_client_id';
    const inputUsername = document.getElementById('inputLoginUsername');
    const inputPassword = document.getElementById('inputLoginPassword');
    const inputRegUsername = document.getElementById('inputRegUsername');
    const inputRegEmail = document.getElementById('inputRegEmail');
    const inputRegPassword = document.getElementById('inputRegPassword');
    const inputRegPasswordConfirm = document.getElementById('inputRegPasswordConfirm');
    const btnToggleLoginPwd = document.getElementById('btnToggleLoginPwd');
    const btnToggleRegPwd = document.getElementById('btnToggleRegPwd');
    const btnToggleRegConfirmPwd = document.getElementById('btnToggleRegConfirmPwd');


    const btnProfileTrigger = document.getElementById('btnUserProfileTrigger');
    const modalProfile = document.getElementById('modalUserProfileBackdrop');
    const btnCloseProfile = document.getElementById('btnCloseUserProfileModal');
    const btnSwitchAccount = document.getElementById('btnSwitchAccount');
    const btnLogoutUser = document.getElementById('btnLogoutUser');

    // Tab Switching Logic: Masuk vs Daftar
    function setAuthTab(activeTab, moveFocus = true) {
      const registering = activeTab === 'register';
      if (loginScreen) loginScreen.classList.toggle('is-registering', registering);
      if (tabLoginBtn) {
        tabLoginBtn.setAttribute('aria-selected', String(!registering));
        tabLoginBtn.tabIndex = registering ? -1 : 0;
      }
      if (tabRegisterBtn) {
        tabRegisterBtn.setAttribute('aria-selected', String(registering));
        tabRegisterBtn.tabIndex = registering ? 0 : -1;
      }
      if (formLogin) {
        formLogin.classList.toggle('hidden', registering);
        formLogin.setAttribute('aria-hidden', String(registering));
      }
      if (formRegister) {
        formRegister.classList.toggle('hidden', !registering);
        formRegister.setAttribute('aria-hidden', String(!registering));
      }
      if (moveFocus) (registering ? inputRegUsername : inputUsername)?.focus();
    }

    if (tabLoginBtn && tabRegisterBtn && formLogin && formRegister) {
      tabLoginBtn.addEventListener('click', () => setAuthTab('login'));
      tabRegisterBtn.addEventListener('click', () => setAuthTab('register'));
      [tabLoginBtn, tabRegisterBtn].forEach((tab) => {
        tab.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          const next = tab === tabLoginBtn ? 'register' : 'login';
          setAuthTab(next);
          (next === 'register' ? tabRegisterBtn : tabLoginBtn).focus();
        });
      });
      setAuthTab('login', false);
    }

    // Password visibility toggles
    function bindPasswordToggle(button, input, visibleLabel, hiddenLabel) {
      if (!button || !input) return;
      button.addEventListener('click', () => {
        const showPassword = input.type === 'password';
        input.type = showPassword ? 'text' : 'password';
        button.setAttribute('aria-pressed', String(showPassword));
        button.setAttribute('aria-label', showPassword ? hiddenLabel : visibleLabel);
        const icon = button.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = showPassword ? 'visibility_off' : 'visibility';
      });
    }
    bindPasswordToggle(btnToggleLoginPwd, inputPassword, 'Tampilkan password', 'Sembunyikan password');
    bindPasswordToggle(btnToggleRegPwd, inputRegPassword, 'Tampilkan password', 'Sembunyikan password');
    bindPasswordToggle(btnToggleRegConfirmPwd, inputRegPasswordConfirm, 'Tampilkan konfirmasi password', 'Sembunyikan konfirmasi password');

    if (inputRegPassword) {
      const strengthWrap = document.getElementById('regPasswordStrength');
      const strengthLabel = document.getElementById('regPasswordStrengthLabel');
      const updatePasswordStrength = () => {
        const value = inputRegPassword.value;
        const score = value
          ? [value.length >= 8, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)]
            .filter(Boolean).length
          : 0;
        const labels = ['Belum diisi', 'Lemah', 'Cukup', 'Baik', 'Kuat'];
        if (strengthWrap) strengthWrap.dataset.strength = String(score);
        if (strengthLabel) strengthLabel.textContent = labels[score];
      };
      inputRegPassword.addEventListener('input', updatePasswordStrength);
      updatePasswordStrength();
    }
    if (inputRegPasswordConfirm) {
      inputRegPasswordConfirm.addEventListener('input', () => inputRegPasswordConfirm.setCustomValidity(''));
    }

    // Clear legacy browser-stored passwords and cached identities.
    try {
      localStorage.removeItem('smart_grocery_user_credentials');
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.KNOWN_USERS);
    } catch (e) {}
    appState.currentUser = null;
    loadDataFromStorage();
    if (loginScreen) loginScreen.classList.remove('hidden');
    updateHeaderUserUI();

    // Inline Alert Helper on Login Card
    const alertEl = document.getElementById('loginFeedbackAlert');
    const alertText = document.getElementById('loginFeedbackText');
    const alertIcon = document.getElementById('loginFeedbackIcon');

    function showLoginAlert(msg, type = 'danger') {
      if (!alertEl || !alertText) return;
      alertText.textContent = msg;
      alertEl.classList.remove('hidden', 'animate-shake');
      alertEl.style.display = 'flex';
      void alertEl.offsetWidth; // restart shake animation
      if (type === 'danger') {
        alertEl.dataset.type = 'danger';
        if (alertIcon) alertIcon.textContent = 'error';
      } else if (type === 'warning') {
        alertEl.dataset.type = 'warning';
        if (alertIcon) alertIcon.textContent = 'warning';
      } else {
        alertEl.dataset.type = 'success';
        if (alertIcon) alertIcon.textContent = 'check_circle';
      }
    }

    function hideLoginAlert() {
      if (alertEl) {
        alertEl.classList.add('hidden');
        alertEl.style.display = 'none';
      }
    }

    if (inputUsername) {
      inputUsername.addEventListener('input', () => {
        inputUsername.style.borderColor = '';
        hideLoginAlert();
      });
    }
    if (inputPassword) {
      inputPassword.addEventListener('input', () => {
        inputPassword.style.borderColor = '';
        hideLoginAlert();
      });
    }

    const btnSubmitLogin = document.getElementById('btnSubmitLogin');
    if (btnSubmitLogin && formLogin) {
      btnSubmitLogin.addEventListener('click', (e) => {
        // If form is valid, trigger submit manually if needed
        if (!formLogin.checkValidity()) {
          formLogin.reportValidity();
        }
      });
    }

    // Sign in with a Supabase Auth email/password account.
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideLoginAlert();
        const rawEmail = inputUsername ? inputUsername.value.trim().toLowerCase() : '';
        const rawPassword = inputPassword ? inputPassword.value : '';

        if (!appState.supabaseClient) initSupabaseClient();
        if (!rawEmail || !rawEmail.includes('@') || !rawPassword) {
          showLoginAlert('Masukkan email dan password yang valid.', 'warning');
          return;
        }
        if (!appState.supabaseClient) {
          showLoginAlert('Layanan autentikasi belum siap. Coba muat ulang halaman.', 'danger');
          return;
        }

        localStorage.removeItem('sg_explicit_logout');
        const { error } = await appState.supabaseClient.auth.signInWithPassword({ email: rawEmail, password: rawPassword });
        if (error) {
          const loginErrorMessage = error.code === 'invalid_credentials'
            ? 'Email atau kata sandi tidak cocok. Gunakan metode masuk yang sama seperti saat membuat akun. Untuk akun Google, pilih “Lanjutkan dengan Google” atau gunakan “Lupa Password?” untuk menambahkan kata sandi.'
            : error.code === 'email_not_confirmed'
              ? 'Email akun belum dikonfirmasi. Periksa kotak masuk email Anda.'
              : error.message || 'Email atau password tidak cocok.';
          showLoginAlert(loginErrorMessage, 'danger');
          return;
        }
        hideLoginAlert();
      });
    }

    // Create the Auth account in Supabase; passwords never enter app storage.
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawUsername = inputRegUsername ? inputRegUsername.value.trim() : '';
        const rawEmail = inputRegEmail ? inputRegEmail.value.trim() : '';
        const rawPassword = inputRegPassword ? inputRegPassword.value : '';
        const rawPasswordConfirm = inputRegPasswordConfirm ? inputRegPasswordConfirm.value : '';

        if (!rawUsername || rawUsername.length < 3) {
          showToast('Username minimal 3 karakter!', 'warning');
          if (inputRegUsername) inputRegUsername.focus();
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!rawEmail || !emailRegex.test(rawEmail)) {
          showToast('Masukkan alamat email yang valid!', 'warning');
          if (inputRegEmail) inputRegEmail.focus();
          return;
        }

        if (!rawPassword || rawPassword.length < 8) {
          showToast('Password minimal 8 karakter.', 'warning');
          if (inputRegPassword) inputRegPassword.focus();
          return;
        }
        if (rawPassword !== rawPasswordConfirm) {
          if (inputRegPasswordConfirm) {
            inputRegPasswordConfirm.setCustomValidity('Kata sandi belum sama.');
            inputRegPasswordConfirm.reportValidity();
            inputRegPasswordConfirm.focus();
          }
          return;
        }

        if (!appState.supabaseClient) initSupabaseClient();
        if (!appState.supabaseClient) {
          showToast('Layanan autentikasi belum siap. Coba muat ulang halaman.', 'danger');
          return;
        }
        localStorage.removeItem('sg_explicit_logout');
        const { data, error } = await appState.supabaseClient.auth.signUp({
          email: rawEmail.toLowerCase(),
          password: rawPassword,
          options: {
            data: {
              username: rawUsername,
              display_name: rawUsername,
              full_name: rawUsername
            }
          }
        });
        if (error) {
          showToast(error.message || 'Pendaftaran gagal.', 'danger');
          return;
        }

        if (!data.user || !data.session) {
          showToast(
            'Konfirmasi email masih diwajibkan oleh Supabase. Buka Authentication → Providers → Email, matikan “Confirm email”, lalu coba lagi.',
            'warning'
          );
          return;
        }

        if (inputRegUsername) inputRegUsername.value = '';
        if (inputRegEmail) inputRegEmail.value = '';
        if (inputRegPassword) inputRegPassword.value = '';
        if (inputRegPasswordConfirm) inputRegPasswordConfirm.value = '';
        const inputRegTerms = document.getElementById('inputRegTerms');
        if (inputRegTerms) inputRegTerms.checked = false;
        document.getElementById('regPasswordStrength')?.setAttribute('data-strength', '0');
        document.getElementById('regPasswordStrengthLabel')?.replaceChildren('Belum diisi');

        hideLoginAlert();
        showToast(`Akun ${rawUsername} berhasil dibuat. Anda langsung masuk ke Cartly.`, 'success');
      });
    }

    // ==========================================================================
    // Supabase-managed password recovery.
    const btnForgotTrigger = document.getElementById('btnForgotPasswordTrigger');
    const modalForgot = document.getElementById('modalForgotPasswordBackdrop');
    const btnCancelForgot = document.getElementById('btnCancelForgotModal');
    const formForgotStep1 = document.getElementById('formForgotStep1Email');
    const inputForgotEmail = document.getElementById('inputForgotEmail');
    const formForgotStep2 = document.getElementById('formForgotStep2Reset');
    const inputForgotNewPassword = document.getElementById('inputForgotNewPassword');
    if (formForgotStep2) {
      formForgotStep2.classList.add('hidden');
      formForgotStep2.addEventListener('submit', async (event) => {
        event.preventDefault();
        const password = inputForgotNewPassword?.value || '';
        if (password.length < 8) return showToast('Password minimal 8 karakter.', 'warning');
        const { data, error } = await appState.supabaseClient.auth.updateUser({ password });
        if (error) return showToast(error.message, 'danger');
        modalForgot?.classList.add('hidden');
        if (data.user && routeAuthenticatedSupabaseUser) routeAuthenticatedSupabaseUser(data.user, 'USER_UPDATED');
        showToast('Password berhasil diperbarui.', 'success');
        inputForgotNewPassword.value = '';
        appState.authRecoveryUser = null;
      });
    }
    if (btnForgotTrigger && modalForgot) btnForgotTrigger.addEventListener('click', () => {
      formForgotStep1?.classList.remove('hidden');
      formForgotStep2?.classList.add('hidden');
      document.getElementById('inputForgotOtp')?.closest('div')?.classList.remove('hidden');
      document.getElementById('inputForgotOtp')?.setAttribute('required', 'required');
      document.getElementById('forgotModalDesc').textContent = 'Masukkan email akun Anda untuk menerima tautan reset.';
      if (inputForgotEmail) inputForgotEmail.value = inputUsername?.value.includes('@') ? inputUsername.value.trim() : '';
      modalForgot.classList.remove('hidden');
    });
    if (btnCancelForgot && modalForgot) btnCancelForgot.addEventListener('click', () => modalForgot.classList.add('hidden'));
    if (formForgotStep1) formForgotStep1.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = inputForgotEmail?.value.trim().toLowerCase() || '';
      if (!email.includes('@')) return showToast('Masukkan alamat email yang valid.', 'warning');
      if (!appState.supabaseClient) initSupabaseClient();
      if (!appState.supabaseClient) return showToast('Layanan autentikasi belum siap.', 'danger');
      const { error } = await appState.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`
      });
      if (error) return showToast(error.message, 'danger');
      modalForgot?.classList.add('hidden');
      showToast('Jika email terdaftar, tautan reset password akan dikirim.', 'success');
    });
    // Start the official Google OAuth flow using Supabase Auth.
    if (btnGoogle) btnGoogle.addEventListener('click', async () => {
      AudioEngine.playTap();
      localStorage.removeItem('sg_explicit_logout');
      if (!appState.supabaseClient) initSupabaseClient();
      if (!appState.supabaseClient) {
        showToast('Layanan autentikasi belum siap.', 'danger');
        return;
      }
      try {
        const { error } = await appState.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}${window.location.pathname}`,
            queryParams: { prompt: 'select_account' }
          }
        });
        if (error) showLoginAlert(error.message || 'Login Google gagal dimulai.', 'danger');
      } catch (error) {
        showLoginAlert(error.message || 'Koneksi login Google gagal.', 'danger');
      }
    });
    // 7. Profile Header Trigger
    if (btnProfileTrigger) {
      btnProfileTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        AudioEngine.playTap();
        openUserProfileModal();
      });
    }

    const headerAvatarEl = document.getElementById('headerUserAvatar');
    if (headerAvatarEl) {
      headerAvatarEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        AudioEngine.playTap();
        openUserProfileModal();
      });
    }

    // 8. Close Profile Modal
    if (btnCloseProfile && modalProfile) {
      btnCloseProfile.addEventListener('click', () => {
        modalProfile.classList.add('hidden');
        modalProfile.style.display = 'none';
      });
    }

    if (modalProfile) {
      modalProfile.addEventListener('click', (e) => {
        if (e.target === modalProfile) {
          modalProfile.classList.add('hidden');
          modalProfile.style.display = 'none';
        }
      });
    }

    // 9. Switch Account Button (From Profile Modal)
    if (btnSwitchAccount) {
      btnSwitchAccount.addEventListener('click', () => {
        AudioEngine.playTap();
        if (modalProfile) {
          modalProfile.classList.add('hidden');
          modalProfile.style.display = 'none';
        }
        if (loginScreen) {
          loginScreen.classList.remove('hidden');
          loginScreen.style.display = '';
          renderSavedAccountsList();
          if (inputUsername) {
            inputUsername.focus();
          }
        }
      });
    }

    // 10. Logout Button
    if (btnLogoutUser) {
      btnLogoutUser.addEventListener('click', () => {
        AudioEngine.playTap();
        logoutUser();
      });
    }

    // 11. Data Management in Profile Modal
    const btnExpProfile = document.getElementById('btnExportDataProfile');
    if (btnExpProfile) btnExpProfile.addEventListener('click', exportDataJson);

    const btnImpProfile = document.getElementById('btnImportDataProfile');
    if (btnImpProfile) {
      btnImpProfile.addEventListener('click', () => {
        document.getElementById('importFileInput')?.click();
      });
    }

    const btnResetProfile = document.getElementById('btnResetDataProfile');
    if (btnResetProfile) btnResetProfile.addEventListener('click', resetAllData);
  }

  function loginAsUser(userObj, withGreeting = true) {
    try {
      localStorage.removeItem('sg_explicit_logout');
    } catch (e) {}
    appState.currentUser = userObj;
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));

      localStorage.removeItem(AUTH_STORAGE_KEYS.KNOWN_USERS);
    } catch (e) {
      console.warn('Error saving user session:', e);
    }

    // Load data isolated strictly for this user
    loadDataFromStorage();
    appState.hasInitialCloudPulled = false;

    // Hide login screen
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      loginScreen.classList.add('hidden');
      loginScreen.style.display = 'none';
    }

    // Update Header UI
    updateHeaderUserUI();

    // Render all components
    renderAll();

    // Immediately pull latest real-time cloud data (cart, planner, budget) and subscribe to user channel
    if (appState.supabaseClient) {
      subscribeToRealtimeChanges();
      pullDataFromSupabase(true).then(() => {
        appState.hasInitialCloudPulled = true;
      });
    } else {
      initSupabaseClient();
    }

    if (withGreeting) {
      AudioEngine.playSuccess();
      showToast(`Halo, ${userObj.displayName}! Ruang belanja Anda aktif.`, 'success');
    }
  }

  async function logoutUser() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('sg_oauth_sync_user');
      localStorage.setItem('sg_explicit_logout', 'true');

      // Bersihkan semua token auth Supabase dari localStorage agar tidak auto-restore session
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.includes('supabase.auth'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {}

    // Sign out tuntas dari Supabase Client
    if (appState.supabaseClient && appState.supabaseClient.auth) {
      try {
        await appState.supabaseClient.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }

    appState.currentUser = null;
    const modalProfile = document.getElementById('modalUserProfileBackdrop');
    if (modalProfile) modalProfile.classList.add('hidden');

    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      loginScreen.classList.remove('hidden');
      loginScreen.style.display = '';
      renderSavedAccountsList();
    }

    updateHeaderUserUI();
    showToast('Anda telah keluar dari akun.', 'info');
  }

  function updateHeaderUserUI() {
    const avatarEl = document.getElementById('headerUserAvatar');
    const nameEl = document.getElementById('headerUsername');
    if (!appState.currentUser) {
      if (avatarEl) {
        avatarEl.textContent = '?';
        avatarEl.className = 'w-6 h-6 rounded-full bg-stone-300 text-stone-700 text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      }
      if (nameEl) nameEl.textContent = 'Masuk';
      return;
    }
    if (avatarEl) {
      if (appState.currentUser.avatarUrl) {
        avatarEl.innerHTML = `<img src="${appState.currentUser.avatarUrl}" alt="Avatar" class="w-full h-full object-cover rounded-full" referrerpolicy="no-referrer" />`;
      } else {
        avatarEl.textContent = appState.currentUser.avatarText || 'U';
      }
      if (appState.currentUser.avatarClass === 'avatar-green') {
        avatarEl.className = 'w-6 h-6 rounded-full bg-emerald-600 text-white text-[12px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      } else if (appState.currentUser.avatarClass === 'avatar-gray') {
        avatarEl.className = 'w-6 h-6 rounded-full bg-stone-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      } else if (appState.currentUser.avatarClass === 'avatar-dark') {
        avatarEl.className = 'w-6 h-6 rounded-full bg-stone-900 text-white text-[12px] font-black flex items-center justify-center shrink-0 shadow-sm border border-stone-700 pointer-events-none';
      } else if (appState.currentUser.avatarClass === 'avatar-amber') {
        avatarEl.className = 'w-6 h-6 rounded-full bg-emerald-500 text-stone-950 text-[12px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      } else if (appState.currentUser.avatarClass === 'avatar-brown') {
        avatarEl.className = 'w-6 h-6 rounded-full bg-stone-800 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      } else if (appState.currentUser.provider === 'google' || appState.currentUser.avatarClass === 'avatar-blue') {
        avatarEl.className = 'w-6 h-6 rounded-full bg-blue-600 text-white text-[12px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      } else {
        avatarEl.className = 'w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm pointer-events-none';
      }
    }
    if (nameEl) nameEl.textContent = appState.currentUser.displayName || appState.currentUser.username || 'User';
  }

  function openUserProfileModal() {
    const modalProfile = document.getElementById('modalUserProfileBackdrop');
    if (!modalProfile) return;

    if (!appState.currentUser) {
      const loginScreen = document.getElementById('loginScreen');
      if (loginScreen) {
        loginScreen.classList.remove('hidden');
        loginScreen.style.display = '';
        renderSavedAccountsList();
      }
      return;
    }

    const avatar = document.getElementById('profileModalAvatar');
    const displayName = document.getElementById('profileModalDisplayName');
    const subtitle = document.getElementById('profileModalSubtitle');
    const cartCount = document.getElementById('profileModalCartCount');
    const budgetCap = document.getElementById('profileModalBudgetCap');

    const isGoogle = appState.currentUser.provider === 'google';
    if (avatar) {
      if (appState.currentUser.avatarUrl) {
        avatar.innerHTML = `<img src="${appState.currentUser.avatarUrl}" alt="Avatar" class="w-full h-full object-cover rounded-2xl" referrerpolicy="no-referrer" />`;
      } else {
        avatar.textContent = appState.currentUser.avatarText || 'U';
      }
      if (appState.currentUser.avatarClass === 'avatar-green') {
        avatar.className = 'w-14 h-14 rounded-2xl bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0';
      } else if (appState.currentUser.avatarClass === 'avatar-amber') {
        avatar.className = 'w-14 h-14 rounded-2xl bg-emerald-500 text-stone-950 text-2xl font-bold flex items-center justify-center shadow-md shrink-0';
      } else if (appState.currentUser.avatarClass === 'avatar-dark') {
        avatar.className = 'w-14 h-14 rounded-2xl bg-stone-900 text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0 border border-stone-700';
      } else if (isGoogle) {
        avatar.className = 'w-14 h-14 rounded-2xl bg-blue-600 text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0';
      } else {
        avatar.className = 'w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-secondary-fixed text-xl font-bold flex items-center justify-center shadow-md shrink-0';
      }
    }
    if (displayName) displayName.textContent = appState.currentUser.displayName || appState.currentUser.username;
    if (subtitle) {
      subtitle.textContent = isGoogle && appState.currentUser.email
        ? appState.currentUser.email
        : `@${appState.currentUser.username} • Ruang Data Privat`;
    }

    if (cartCount) {
      const physicalCount = appState.cart.filter(i => i.inPhysicalCart).length;
      cartCount.textContent = `${appState.cart.length} Produk (${physicalCount} fisik)`;
    }

    if (budgetCap) {
      budgetCap.textContent = 'Rp ' + formatNumber(appState.budgetLimit);
    }

    modalProfile.classList.remove('hidden');
    modalProfile.style.display = 'flex';
  }

  function renderSavedAccountsList() {
    const section = document.getElementById('sectionSavedAccounts');
    const list = document.getElementById('savedAccountsList');
    if (!section || !list) return;

    let knownUsers = [];
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEYS.KNOWN_USERS);
      if (saved) knownUsers = JSON.parse(saved);
    } catch (e) {}

    // Sembunyikan bagian jika tidak ada akun tersimpan di perangkat
    if (!Array.isArray(knownUsers) || knownUsers.length === 0) {
      section.classList.add('hidden');
      list.innerHTML = '';
      return;
    }

    section.classList.remove('hidden');
    list.innerHTML = knownUsers.map(u => {
      const isGoogle = u.provider === 'google';
      const badgeIcon = isGoogle ? 'verified' : 'person';
      return `
        <div class="inline-flex items-center rounded-full bg-[#181d30] border border-[#2a3454] hover:border-emerald-500 transition-all shadow-xs group">
          <button type="button" class="btn-quick-user-chip flex items-center gap-1.5 py-1.5 pl-2.5 pr-1 text-white text-xs font-bold cursor-pointer active:scale-95 transition-transform" data-user='${escapeHtml(JSON.stringify(u))}'>
            <span class="w-5 h-5 rounded-full ${isGoogle ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'} text-[10px] font-bold flex items-center justify-center shrink-0">${escapeHtml(u.avatarText || 'U')}</span>
            <span class="truncate max-w-[110px] text-white font-bold">${escapeHtml(u.displayName || u.username)}</span>
            <span class="material-symbols-outlined text-[13px] text-emerald-400">${badgeIcon}</span>
          </button>
          <button type="button" class="btn-delete-saved-user w-6 h-6 mr-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-950/40 flex items-center justify-center transition-colors cursor-pointer" data-slug="${escapeHtml(u.slug)}" title="Hapus dari daftar tersimpan">
            <span class="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      `;
    }).join('');

    // Klik chip akun tersimpan untuk langsung masuk (Quick Login)
    list.querySelectorAll('.btn-quick-user-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          const u = JSON.parse(btn.getAttribute('data-user'));
          AudioEngine.playTap();
          loginAsUser(u, true);
        } catch (e) {
          console.warn('Error selecting saved user:', e);
        }
      });
    });

    // Klik tombol silang (x) untuk menghapus akun dari daftar tersimpan
    list.querySelectorAll('.btn-delete-saved-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slugToDelete = btn.getAttribute('data-slug');
        if (!slugToDelete) return;
        AudioEngine.playTap();
        deleteSavedAccount(slugToDelete);
      });
    });
  }

  function deleteSavedAccount(slugToDelete) {
    try {
      let knownUsers = [];
      const saved = localStorage.getItem(AUTH_STORAGE_KEYS.KNOWN_USERS);
      if (saved) knownUsers = JSON.parse(saved);

      const removedUser = knownUsers.find(u => u.slug === slugToDelete);
      const updated = knownUsers.filter(u => u.slug !== slugToDelete);
      localStorage.setItem(AUTH_STORAGE_KEYS.KNOWN_USERS, JSON.stringify(updated));

      renderSavedAccountsList();
      const name = removedUser ? (removedUser.displayName || removedUser.username) : (slugToDelete === 'rian' ? 'Rian Kos' : 'Akun');
      showToast(`Akun ${name} dihapus dari daftar tersimpan`, 'info');
    } catch (e) {
      console.warn('Error deleting saved user:', e);
    }
  }

  function renderAll() {
    renderCart();
    renderAstroCatalog();
    renderShoppingPlannerSection();
    renderBudgetBreakdown();
    renderHistoryList();
    updateStoreAcrossApp(appState.activeStore);
    renderStoreButtonsList();
  }

})();
