/*
  app.js
  Final demo: 5 unread + 3 read notifications; clicking unread marks read instantly and updates badge/header (persisted)
  Also includes inventory + history demo with simple filters/search
*/

const STORE_KEYS = {
  NOTI: 'qmedic_demo_notifications_v1',
  INV: 'qmedic_demo_inventory_v1',
  HIST: 'qmedic_demo_history_v1'
};

// small dom helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const todayStart = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); r.setHours(0,0,0,0); return r; };
const parseDate = s => s ? new Date(s + 'T00:00:00') : null;
const fmtDate = s => s ? new Date(s).toLocaleDateString() : '-';
const escapeHtml = s => (''+s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// ---------- mock data (exact: 5 unread, 3 read) ----------
const seedNotifications = [
  // 5 unread
  { id:'n1', itemId:'item-morphine', name:'Morphine 10mg', expiry:'2025-11-20', location:'Ambulance A', message:'Expiring soon: 2025-11-20', date: new Date().toISOString(), read:false, type:'expiring' },
  { id:'n2', itemId:'item-gauze', name:'Sterile Gauze Pads', expiry:'2025-10-30', location:'Ambulance B', message:'Expiring soon: 2025-10-30', date: new Date().toISOString(), read:false, type:'expiring' },
  { id:'n3', itemId:'item-naloxone', name:'Naloxone 0.4mg', expiry:'2025-11-05', location:'Ambulance C', message:'Expiring soon: 2025-11-05', date: new Date().toISOString(), read:false, type:'expiring' },
  { id:'n4', itemId:'item-syringe', name:'Syringe 5ml', expiry:'2025-11-03', location:'Ambulance D', message:'Expiring soon: 2025-11-03', date: new Date().toISOString(), read:false, type:'expiring' },
  { id:'n5', itemId:'item-defibpads', name:'Defibrillator Pads', expiry:'2025-11-02', location:'Station Supply Closet', message:'Expiring soon: 2025-11-02', date: new Date().toISOString(), read:false, type:'expiring' },

  // 3 read
  { id:'n6', itemId:'item-ivkits', name:'IV Starter Kits', expiry:'2025-12-01', location:'Station', message:'Expiry: 2025-12-01', date: new Date(Date.now()-86400000*5).toISOString(), read:true, type:'info' },
  { id:'n7', itemId:'item-oxygen', name:'Oxygen Mask', expiry:null, location:'Ambulance C', message:'Low stock: 2 remaining', date: new Date(Date.now()-86400000*8).toISOString(), read:true, type:'info' },
  { id:'n8', itemId:'item-bandages', name:'Bandages', expiry:'2026-01-10', location:'Station', message:'Restocked', date: new Date(Date.now()-86400000*10).toISOString(), read:true, type:'info' }
];

const seedInventory = [
  { id:'item-morphine', name:'Morphine 10mg', code:'DRG-101', qty:2, expiry:'2025-11-20', location:'Ambulance A', category:'drug', desc:'Pain relief.' },
  { id:'item-gauze', name:'Sterile Gauze Pads', code:'SUP-210', qty:5, expiry:'2025-10-30', location:'Ambulance B', category:'consumable', desc:'Gauze pads.' },
  { id:'item-naloxone', name:'Naloxone 0.4mg', code:'DRG-303', qty:3, expiry:'2025-11-05', location:'Ambulance C', category:'drug', desc:'Opioid antidote.' },
  { id:'item-syringe', name:'Syringe 5ml', code:'SUP-503', qty:10, expiry:'2025-11-03', location:'Ambulance D', category:'consumable', desc:'Disposable syringe.' },
  { id:'item-defibpads', name:'Defibrillator Pads', code:'EQP-210', qty:4, expiry:'2025-11-02', location:'Station Supply Closet', category:'equipment', desc:'AED pads.' },
  { id:'item-ivkits', name:'IV Starter Kits', code:'KIT-011', qty:6, expiry:'2025-12-01', location:'Station', category:'consumable', desc:'IV starter kits' },
  { id:'item-oxygen', name:'Oxygen Mask', code:'EQP-501', qty:2, expiry:null, location:'Ambulance C', category:'equipment', desc:'Oxygen masks.' },
  { id:'item-bandages', name:'Bandages', code:'SUP-001', qty:20, expiry:'2026-01-10', location:'Station', category:'consumable', desc:'Bandages pack.' }
];

const seedHistory = [
  { id:'h1', itemId:'item-morphine', name:'Morphine 10mg', caseId:'#CASE-100', date:'2025-10-14', qty:1, type:'drug' },
  { id:'h2', itemId:'item-defibpads', name:'Defibrillator Pads', caseId:'#CASE-099', date:'2025-09-18', qty:1, type:'equipment' },
  { id:'h3', itemId:'item-gauze', name:'Sterile Gauze Pads', caseId:'#CASE-098', date:'2025-09-15', qty:2, type:'consumable' }
];

// ---------- load or seed storage ----------
function loadOrSeed(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed.slice();
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('load error', e);
    localStorage.setItem(key, JSON.stringify(seed));
    return seed.slice();
  }
}

let notifications = loadOrSeed(STORE_KEYS.NOTI, seedNotifications);
let inventory = loadOrSeed(STORE_KEYS.INV, seedInventory);
let history = loadOrSeed(STORE_KEYS.HIST, seedHistory);

// ---------- helpers ----------
function saveAll() {
  localStorage.setItem(STORE_KEYS.NOTI, JSON.stringify(notifications));
  localStorage.setItem(STORE_KEYS.INV, JSON.stringify(inventory));
  localStorage.setItem(STORE_KEYS.HIST, JSON.stringify(history));
}
function countUnread() { return notifications.filter(n => !n.read).length; }

// UI refs
const bellBadge = $('#bell-badge');
const notiListEl = $('#noti-list');
const notiHeaderEl = $('#noti-header');
const invListEl = $('#inv-list');
const histListEl = $('#hist-list');

// ---------- renderers ----------
function updateBellBadge() {
  const unread = countUnread();
  if (unread > 0) {
    bellBadge.classList.remove('hidden');
    bellBadge.innerText = unread > 9 ? '9+' : String(unread);
  } else {
    bellBadge.classList.add('hidden');
  }
}

function renderNotificationsPage() {
  notiListEl.innerHTML = '';
  const unread = countUnread();
  notiHeaderEl.innerText = `Notifications (${unread} unread)`;
  $('#noti-sub').innerText = 'Tap an alert to mark it read and view the item.';

  if (notifications.length === 0) {
    notiListEl.innerHTML = `<div class="text-slate-500">No notifications</div>`;
    return;
  }

  // Render each notification
  notifications.forEach(n => {
    const card = document.createElement('div');
    // unread style = light orange bg; read = white
    card.className = `rounded-lg p-4 border ${n.read ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-200'}`;
    card.style.position = 'relative';
    card.dataset.id = n.id;

    // red dot (only if unread) - positioned top-right inside card
    const dotHTML = n.read ? '' : `<span class="noti-dot" style="position:absolute;right:16px;top:18px"></span>`;

    card.innerHTML = `
      <div class="flex gap-4 items-start">
        <div class="text-amber-600">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <div class="flex-1">
          <div class="text-lg font-semibold text-slate-800">${escapeHtml(n.name)}</div>
          <div class="text-slate-600 mt-1">${escapeHtml(n.message)}</div>
          <div class="text-slate-500 text-sm mt-2">Location: ${escapeHtml(n.location || '-')}</div>
          <div class="text-slate-400 text-xs mt-2">${new Date(n.date).toLocaleString()}</div>
        </div>
      </div>
      ${dotHTML}
    `;

    // clicking marks read (if unread) AND opens item detail (demo)
    card.addEventListener('click', () => {
      if (!n.read) {
        n.read = true;
        saveAll();
        updateBellBadge();
        // Immediately update header and UI
        renderNotificationsPage();
      }
      // Demo behavior: navigate to inventory page and show simple detail alert
      const item = inventory.find(i => i.id === n.itemId);
      if (item) {
        // go to inventory and show a simple detail alert after short delay
        showPage('inventory');
        setTimeout(() => {
          alert(`${item.name}\nCode: ${item.code}\nQty: ${item.qty}\nExpiry: ${item.expiry || '-'}\nLocation: ${item.location}`);
        }, 220);
      } else {
        alert(`${n.name}\n${n.message}\n${n.location}`);
      }
    });

    notiListEl.appendChild(card);
  });
}

// Inventory rendering
function populateInvFilters() {
  const catSet = Array.from(new Set(inventory.map(i => i.category).filter(Boolean)));
  const locSet = Array.from(new Set(inventory.map(i => i.location).filter(Boolean)));
  const catEl = $('#inv-cat'); catEl.innerHTML = '<option value="">All categories</option>';
  catSet.forEach(c => catEl.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`));
  const locEl = $('#inv-loc'); locEl.innerHTML = '<option value="">All locations</option>';
  locSet.forEach(l => locEl.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`));
}

let invFilter = { q:'', cat:'', loc:'', exp:'' };
function renderInventory() {
  invListEl.innerHTML = '';
  const q = (invFilter.q || '').toLowerCase().trim();
  const now = todayStart();
  const windowEnd = addDays(now, 7);

  const rows = inventory.filter(it => {
    if (q) {
      const hay = (it.name + ' ' + it.code + ' ' + it.location).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (invFilter.cat && it.category !== invFilter.cat) return false;
    if (invFilter.loc && it.location !== invFilter.loc) return false;
    if (invFilter.exp) {
      const ed = it.expiry ? parseDate(it.expiry) : null;
      if (invFilter.exp === 'expired' && !(ed && ed < now)) return false;
      if (invFilter.exp === 'soon' && !(ed && ed >= now && ed <= windowEnd)) return false;
      if (invFilter.exp === 'ok' && ed && ed <= windowEnd) return false;
    }
    return true;
  });

  if (!rows.length) {
    invListEl.innerHTML = `<div class="text-slate-500">No items found</div>`;
    return;
  }

  rows.forEach(it => {
    const ed = it.expiry ? parseDate(it.expiry) : null;
    const now = todayStart();
    const windowEnd = addDays(now, 7);
    let dotColor = 'bg-green-500';
    if (ed) {
      if (ed < now) dotColor = 'bg-red-500';
      else if (ed <= windowEnd) dotColor = 'bg-yellow-400';
    }

    const row = document.createElement('div');
    row.className = 'bg-white p-3 rounded-lg border flex justify-between items-center cursor-pointer';
    row.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl text-blue-600">medication</span>
        </div>
        <div>
          <div class="font-semibold text-slate-800">${escapeHtml(it.name)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(it.code)}</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="${dotColor} w-3 h-3 rounded-full"></div>
          <div class="font-semibold">${escapeHtml(String(it.qty))}</div>
        </div>
        <div class="text-slate-400 material-symbols-outlined">chevron_right</div>
      </div>
    `;
    row.addEventListener('click', () => {
      // show detail demo
      alert(`${it.name}\nCode: ${it.code}\nQty: ${it.qty}\nExpiry: ${it.expiry || '-'}\nLocation: ${it.location}`);
    });
    invListEl.appendChild(row);
  });
}

// History rendering
let histFilter = { caseId:'', start:'', end:'', q:'' };
function renderHistory() {
  histListEl.innerHTML = '';
  let rows = history.slice();
  if (histFilter.caseId) rows = rows.filter(r => r.caseId && r.caseId.includes(histFilter.caseId));
  if (histFilter.start) {
    const sd = parseDate(histFilter.start);
    rows = rows.filter(r => parseDate(r.date) >= sd);
  }
  if (histFilter.end) {
    const ed = parseDate(histFilter.end);
    rows = rows.filter(r => parseDate(r.date) <= ed);
  }
  if (histFilter.q) {
    const q = histFilter.q.toLowerCase();
    rows = rows.filter(r => (r.name + ' ' + (r.type||'')).toLowerCase().includes(q));
  }
  if (!rows.length) { histListEl.innerHTML = `<div class="text-slate-500">No history found</div>`; return; }
  rows.forEach(r => {
    const el = document.createElement('div');
    el.className = 'bg-white p-3 rounded-lg border flex justify-between items-center cursor-pointer';
    el.innerHTML = `
      <div>
        <div class="font-semibold">${escapeHtml(r.name)}</div>
        <div class="text-xs text-slate-500">Date: ${escapeHtml(r.date)} — Case: ${escapeHtml(r.caseId)}</div>
      </div>
      <div class="font-bold">${escapeHtml(String(r.qty))}</div>
    `;
    el.addEventListener('click', () => {
      const item = inventory.find(i => i.id === r.itemId);
      if (item) alert(`${item.name}\nCode: ${item.code}\nQty: ${item.qty}\nExpiry: ${item.expiry || '-'}\nLocation: ${item.location}`);
      else alert(`${r.name}\nCase: ${r.caseId}`);
    });
    histListEl.appendChild(el);
  });
}

// ---------- nav / ui wiring ----------
const pages = {
  home: $('#page-home'),
  scan: $('#page-scan'),
  inventory: $('#page-inventory'),
  history: $('#page-history'),
  notifications: $('#page-notifications')
};
function hideAll() { Object.values(pages).forEach(p => p.classList.remove('active')); }
function showPage(name) {
  hideAll();
  if (name === 'home') pages.home.classList.add('active');
  if (name === 'scan') pages.scan.classList.add('active');
  if (name === 'inventory') pages.inventory.classList.add('active');
  if (name === 'history') pages.history.classList.add('active');
  if (name === 'notifications') {
    pages.notifications.classList.add('active');
    renderNotificationsPage();
  }
}

// nav btns
$$('.nav-btn').forEach(b => b.addEventListener('click', () => {
  const tgt = b.dataset.target;
  if (tgt === 'home') showPage('home');
  if (tgt === 'scan') showPage('scan');
  if (tgt === 'inventory') showPage('inventory');
  if (tgt === 'history') showPage('history');
}));

// bell open notifications
$('#btn-bell').addEventListener('click', () => showPage('notifications'));
$('#home-open-noti').addEventListener('click', () => showPage('notifications'));
$('#noti-close').addEventListener('click', () => showPage('home'));

// bottom cta / simple nav
$('#cta-scan').addEventListener('click', () => showPage('scan'));
$('#scan-back').addEventListener('click', () => showPage('home'));
$('#inv-back').addEventListener('click', () => showPage('home'));
$('#hist-back').addEventListener('click', () => showPage('home'));
$('#manual-entry').addEventListener('click', () => {
  const it = inventory.find(x => x.id === 'item-morphine'); if (it) alert(`${it.name}\n${it.code}`);
});

// inv filters toggle
$('#inv-filter-toggle').addEventListener('click', () => $('#inv-filters').classList.toggle('hidden'));

// inv search/filter events
$('#inv-search').addEventListener('input', e => { invFilter.q = e.target.value; renderInventory(); });
$('#inv-cat').addEventListener('change', e => { invFilter.cat = e.target.value; renderInventory(); });
$('#inv-loc').addEventListener('change', e => { invFilter.loc = e.target.value; renderInventory(); });
$('#inv-exp').addEventListener('change', e => { invFilter.exp = e.target.value; renderInventory(); });

// history filters
$('#hist-case').addEventListener('input', e => { histFilter.caseId = e.target.value; renderHistory(); });
$('#hist-start').addEventListener('change', e => { histFilter.start = e.target.value; renderHistory(); });
$('#hist-end').addEventListener('change', e => { histFilter.end = e.target.value; renderHistory(); });
$('#hist-free').addEventListener('input', e => { histFilter.q = e.target.value; renderHistory(); });

// ---------- init ----------
function init() {
  // ensure consistent ordering (unread first)
  notifications.sort((a,b) => (a.read === b.read) ? (new Date(b.date) - new Date(a.date)) : (a.read ? 1 : -1));
  saveAll();

  updateBellBadge();
  populateInvFilters();
  renderInventory();
  renderHistory();

  // attach home cards open
  $$('.card-item').forEach(c => c.addEventListener('click', () => {
    const id = c.dataset.id;
    const it = inventory.find(i => i.id === id);
    if (it) alert(`${it.name}\nCode: ${it.code}\nQty: ${it.qty}`);
  }));
}

init();
