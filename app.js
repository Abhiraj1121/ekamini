document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════
  // DOM REFS
  // ══════════════════════════════
  const splash = document.getElementById('splash');
  const signin = document.getElementById('signin');
  const app    = document.getElementById('app');
  const siName = document.getElementById('siName');
  const siEmail = document.getElementById('siEmail');
  const siError = document.getElementById('siError');
  const siSubmit = document.getElementById('siSubmit');

  const viewChat = document.getElementById('viewChat');
  const viewSettings = document.getElementById('viewSettings');
  const btnMenu = document.getElementById('btnMenu');
  const btnWebToggle = document.getElementById('btnWebToggle');
  const btnImageToggle = document.getElementById('btnImageToggle');
  const btnNewChat = document.getElementById('btnNewChat');
  const btnSettingsBack = document.getElementById('btnSettingsBack');

  const chat = document.getElementById('chat');
  const mMsg = document.getElementById('mMsg');
  const mSend = document.getElementById('mSend');
  const mMic = document.getElementById('mMic');
  const mStatus = document.getElementById('mStatus');
  const speakGrid = document.getElementById('speakGrid');
  const sgCells = document.getElementById('sgCells');
  const sgStop = document.getElementById('sgStop');
  const suggestionRow = document.getElementById('suggestionRow');

  const mAttachBtn = document.getElementById('mAttachBtn');
  const mPhotoInput = document.getElementById('mPhotoInput');
  const mAttachPreview = document.getElementById('mAttachPreview');
  const mAttachThumb = document.getElementById('mAttachThumb');
  const mAttachRemove = document.getElementById('mAttachRemove');

  const mSheetOverlay = document.getElementById('mSheetOverlay');
  const mSheet = document.getElementById('mSheet');
  const mSheetAvatar = document.getElementById('mSheetAvatar');
  const mSheetName = document.getElementById('mSheetName');
  const mSheetEmail = document.getElementById('mSheetEmail');
  const sheetUserRow = document.getElementById('sheetUserRow');
  const mNewChat = document.getElementById('mNewChat');
  const mOpenSettings = document.getElementById('mOpenSettings');
  const mHistorySearch = document.getElementById('mHistorySearch');
  const mHistoryList = document.getElementById('mHistoryList');
  const mHistoryEmpty = document.getElementById('mHistoryEmpty');

  // Settings page controls
  const stAvatar = document.getElementById('stAvatar');
  const stName = document.getElementById('stName');
  const stEmail = document.getElementById('stEmail');
  const stEditName = document.getElementById('stEditName');
  const rowThemeMode = document.getElementById('rowThemeMode');
  const themeModeSub = document.getElementById('themeModeSub');
  const swatchRow = document.getElementById('swatchRow');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeSub = document.getElementById('fontSizeSub');
  const swReduceMotion = document.getElementById('swReduceMotion');
  const rowPersona = document.getElementById('rowPersona');
  const personaSub = document.getElementById('personaSub');
  const swWeb = document.getElementById('swWeb');
  const swImage = document.getElementById('swImage');
  const swSuggestions = document.getElementById('swSuggestions');
  const swMute = document.getElementById('swMute');
  const swSound = document.getElementById('swSound');
  const swHaptic = document.getElementById('swHaptic');
  const rowLang = document.getElementById('rowLang');
  const langSub = document.getElementById('langSub');
  const rowVoice = document.getElementById('rowVoice');
  const voiceSub = document.getElementById('voiceSub');
  const btnChatHistory = document.getElementById('btnChatHistory');
  const historyCountSub = document.getElementById('historyCountSub');
  const btnExportChat = document.getElementById('btnExportChat');
  const btnClearData = document.getElementById('btnClearData');
  const btnSignOut = document.getElementById('btnSignOut');

  // Picker sheets
  const pickThemeOverlay = document.getElementById('pickThemeOverlay');
  const themeOptions = document.getElementById('themeOptions');
  const pickPersonaOverlay = document.getElementById('pickPersonaOverlay');
  const personaOptions = document.getElementById('personaOptions');
  const pickLangOverlay = document.getElementById('pickLangOverlay');
  const langOptions = document.getElementById('langOptions');
  const pickVoiceOverlay = document.getElementById('pickVoiceOverlay');
  const voiceOptions = document.getElementById('voiceOptions');

  const mHistoryOverlay = document.getElementById('mHistoryOverlay');
  const mHistorySheet = document.getElementById('mHistorySheet');
  const mHistoryClose = document.getElementById('mHistoryClose');
  const mHistoryFullList = document.getElementById('mHistoryFullList');
  const mHistoryFullEmpty = document.getElementById('mHistoryFullEmpty');

  const mNameModalOverlay = document.getElementById('mNameModalOverlay');
  const mNameInput = document.getElementById('mNameInput');
  const mNameSave = document.getElementById('mNameSave');
  const mNameCancel = document.getElementById('mNameCancel');

  const mConfirmOverlay = document.getElementById('mConfirmOverlay');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmSub = document.getElementById('confirmSub');
  const mConfirmOk = document.getElementById('mConfirmOk');
  const mConfirmCancel = document.getElementById('mConfirmCancel');

  // ══════════════════════════════
  // STATE
  // ══════════════════════════════
  let chatHistory = [];
  let renderLog = [];
  let isMuted = false;
  let webSearchEnabled = false;
  let imageGenEnabled = false;
  let isThinking = false;
  let attachedImage = null;
  let recognition = null;
  let soundOn = true;
  let hapticOn = true;
  let currentLang = 'auto';
  let selectedVoiceURI = 'auto';
  let availableVoices = [];
  let activeSpeakBtn = null; // the msg-action-btn currently reading aloud, if any
  let currentSessionId = null;
  let themeMode = 'system';     // system | dark | light
  let accentColor = 'violet';
  let fontSize = 1;
  let reduceMotion = false;
  let persona = 'balanced';
  let showSuggestions = true;
  let pendingConfirmAction = null;

  const API_ENDPOINT = '/api/chat';

  // ══════════════════════════════
  // THEME ENGINE
  // ══════════════════════════════
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  function resolveTheme() {
    if (themeMode === 'system') return mq.matches ? 'light' : 'dark';
    return themeMode;
  }
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', resolveTheme());
    document.documentElement.setAttribute('data-accent', accentColor);
    document.documentElement.setAttribute('data-fontsize', String(fontSize));
    document.documentElement.setAttribute('data-reduce-motion', reduceMotion ? '1' : '0');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--md-surface').trim() || '#141017');
  }
  mq.addEventListener?.('change', () => { if (themeMode === 'system') applyTheme(); });

  // Apply saved theme/accent/font-size right away — otherwise the splash and
  // sign-in screens flash the hardcoded default palette before enterApp() runs.
  (function applyThemeEarly() {
    const p = loadPrefs();
    themeMode = p.themeMode || 'system';
    accentColor = p.accentColor || 'violet';
    fontSize = p.fontSize === undefined ? 1 : p.fontSize;
    reduceMotion = !!p.reduceMotion;
    applyTheme();
  })();

  const ACCENTS = [
    { id:'violet',  label:'Violet',  hex:'#9C7EDC' },
    { id:'teal',    label:'Teal',    hex:'#5BC9BA' },
    { id:'rose',    label:'Rose',    hex:'#E88CA3' },
    { id:'amber',   label:'Amber',   hex:'#E3A94A' },
    { id:'blue',    label:'Blue',    hex:'#6E97DE' },
    { id:'sage',    label:'Sage',    hex:'#7CB07A' },
    { id:'crimson', label:'Crimson', hex:'#E0464A' },
    { id:'indigo',  label:'Indigo',  hex:'#5C5FCE' },
    { id:'emerald', label:'Emerald', hex:'#22B074' },
    { id:'coral',   label:'Coral',   hex:'#E87A46' },
    { id:'ocean',   label:'Ocean',   hex:'#1AA0C4' },
    { id:'slate',   label:'Slate',   hex:'#6B7086' },
  ];
  function buildSwatches() {
    swatchRow.innerHTML = '';
    ACCENTS.forEach(a => {
      const el = document.createElement('button');
      el.className = 'swatch' + (a.id === accentColor ? ' active' : '');
      el.style.background = a.hex;
      el.title = a.label;
      el.addEventListener('click', () => {
        accentColor = a.id; savePrefs(); applyTheme(); buildSwatches(); vibrate(8);
        showToast(a.label + ' accent applied');
      });
      swatchRow.appendChild(el);
    });
  }

  const FONT_LABELS = ['Small', 'Medium', 'Large', 'Extra large'];
  function applyFontSizeUI() {
    fontSizeSlider.value = String(fontSize);
    fontSizeSub.textContent = FONT_LABELS[fontSize];
  }

  const THEME_LABELS = { system:'System default', dark:'Dark', light:'Light', black:'Pure black' };
  const PERSONA_LABELS = { balanced:'Balanced', concise:'Concise & direct', detailed:'Detailed & thorough', creative:'Creative & casual' };
  const LANG_LABELS = { auto:'Auto detect', 'en-IN':'English (India)', 'en-GB':'English (UK)', 'en-US':'English (US)', 'hi-IN':'हिन्दी (Hindi)' };

  // ══════════════════════════════
  // SPEAKING GRID CELLS
  // ══════════════════════════════
  for (let i = 0; i < 27; i++) {
    const c = document.createElement('div');
    c.className = 'cell';
    c.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's';
    sgCells.appendChild(c);
  }

  // ══════════════════════════════
  // BACKGROUND PARTICLE CANVAS
  // ══════════════════════════════
  (function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    const dust = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 30; i++) dust.push({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      r: Math.random()*1.1+0.3, a: Math.random()*0.18+0.04,
      vx:(Math.random()-0.5)*0.15, vy:(Math.random()-0.5)*0.12,
    });
    let raf;
    function frame() {
      if (!reduceMotion) {
        ctx.clearRect(0,0,W,H);
        const primary = getComputedStyle(document.documentElement).getPropertyValue('--md-primary').trim() || '#D6BBFB';
        for (const p of dust) {
          p.x+=p.vx; p.y+=p.vy;
          if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle = primary; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
  })();

  // ══════════════════════════════
  // PROFILE + PREFS PERSISTENCE
  // ══════════════════════════════
  function loadProfile() {
    try { return JSON.parse(localStorage.getItem('eka_profile') || 'null'); } catch { return null; }
  }
  function saveProfile(p) { localStorage.setItem('eka_profile', JSON.stringify(p)); }

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem('eka_prefs') || '{}'); } catch { return {}; }
  }
  function savePrefs() {
    localStorage.setItem('eka_prefs', JSON.stringify({
      muted:isMuted, web:webSearchEnabled, image:imageGenEnabled, sound:soundOn, haptic:hapticOn, lang:currentLang,
      themeMode, accentColor, fontSize, reduceMotion, persona, showSuggestions, voiceURI:selectedVoiceURI
    }));
  }
  function applyPrefs() {
    const p = loadPrefs();
    isMuted = !!p.muted;
    webSearchEnabled = !!p.web;
    imageGenEnabled = !!p.image;
    soundOn = p.sound === undefined ? true : !!p.sound;
    hapticOn = p.haptic === undefined ? true : !!p.haptic;
    currentLang = p.lang || 'auto';
    themeMode = p.themeMode || 'system';
    accentColor = p.accentColor || 'violet';
    fontSize = p.fontSize === undefined ? 1 : p.fontSize;
    reduceMotion = !!p.reduceMotion;
    persona = p.persona || 'balanced';
    showSuggestions = p.showSuggestions === undefined ? true : !!p.showSuggestions;
    selectedVoiceURI = p.voiceURI || 'auto';

    swMute.checked = isMuted;
    swWeb.checked = webSearchEnabled;
    swImage.checked = imageGenEnabled;
    swSound.checked = soundOn;
    swHaptic.checked = hapticOn;
    swSuggestions.checked = showSuggestions;
    swReduceMotion.checked = reduceMotion;
    langSub.textContent = LANG_LABELS[currentLang] || 'Auto detect';
    themeModeSub.textContent = THEME_LABELS[themeMode] || 'System default';
    personaSub.textContent = PERSONA_LABELS[persona] || 'Balanced';
    btnWebToggle.classList.toggle('active', webSearchEnabled);
    btnWebToggle.setAttribute('aria-pressed', String(webSearchEnabled));
    btnImageToggle.classList.toggle('active', imageGenEnabled);
    btnImageToggle.setAttribute('aria-pressed', String(imageGenEnabled));
    mMsg.placeholder = imageGenEnabled ? 'Describe the image to generate…' : 'Message Eka…';
    applyFontSizeUI();
    buildSwatches();
    applyTheme();
    updateVoiceSub();
    if (recognition) recognition.lang = currentLang === 'auto' ? 'en-IN' : currentLang;
  }

  // ══════════════════════════════
  // CHAT SESSIONS
  // ══════════════════════════════
  const SESSIONS_KEY = 'eka_sessions';
  function loadSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch { return []; } }
  function saveSessions(list) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(list)); }

  function makeSessionTitle(log) {
    const firstUser = log.find(m => m.who === 'user' && m.text);
    if (firstUser) return firstUser.text.slice(0, 40) + (firstUser.text.length > 40 ? '…' : '');
    return 'New conversation';
  }

  function persistCurrentSession() {
    if (!currentSessionId || renderLog.length === 0) return;
    const sessions = loadSessions();
    const idx = sessions.findIndex(s => s.id === currentSessionId);
    const data = { id: currentSessionId, title: makeSessionTitle(renderLog), log: renderLog, history: chatHistory, updated: Date.now() };
    if (idx >= 0) sessions[idx] = data; else sessions.unshift(data);
    saveSessions(sessions);
  }

  function startNewSession(withWelcome) {
    currentSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('eka_current_session', currentSessionId);
    chat.innerHTML = '';
    chatHistory = [];
    renderLog = [];
    renderSuggestions(['What can you help with?', 'Explain a concept simply', 'Write something for me']);
    if (withWelcome) {
      const profile = loadProfile();
      addBubble(`Hey **${(profile && profile.name) || 'there'}**! I'm **Eka** ✨ — ask me anything, or tap the mic to talk.`, 'bot', '', true);
    }
  }

  function renderLogEntry(m) {
    if (m.genImg) { addImageBubble(m.genImg, m.genPrompt || '', true); }
    else { addBubble(m.text, m.who, m.source || '', false, m.imgData || null, true); }
  }

  function restoreLastSession() {
    const lastId = localStorage.getItem('eka_current_session');
    const sessions = loadSessions();
    const found = lastId && sessions.find(s => s.id === lastId);
    if (found) {
      currentSessionId = found.id;
      chatHistory = found.history || [];
      renderLog = (found.log || []).slice();
      chat.innerHTML = '';
      renderLog.forEach(renderLogEntry);
      renderSuggestions([]);
      return true;
    }
    return false;
  }

  function switchToSession(s) {
    persistCurrentSession();
    currentSessionId = s.id;
    localStorage.setItem('eka_current_session', s.id);
    chatHistory = s.history || [];
    renderLog = (s.log || []).slice();
    chat.innerHTML = '';
    renderLog.forEach(renderLogEntry);
    renderSuggestions([]);
  }

  function renderHistoryList(container, emptyEl, filterText) {
    let sessions = loadSessions().sort((a, b) => b.updated - a.updated);
    if (filterText) {
      const f = filterText.toLowerCase();
      sessions = sessions.filter(s => (s.title || '').toLowerCase().includes(f));
    }
    container.innerHTML = '';
    emptyEl.classList.toggle('show', sessions.length === 0);
    sessions.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = (container === mHistoryFullList ? 'history-item' : 'sheet-item') + (s.id === currentSessionId ? ' active' : '');
      item.style.setProperty('--d', i);
      const dt = new Date(s.updated);
      const isFull = container === mHistoryFullList;
      item.innerHTML = isFull
        ? `<button class="history-main"><div class="history-title">${escapeHtml(s.title || 'New conversation')}</div>
             <div class="history-meta">${dt.toLocaleDateString([], { month:'short', day:'numeric' })} · ${dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} · ${(s.log||[]).length} msgs</div></button>
           <button class="history-del" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:var(--md-on-surface-variant)"><path d="M21 11.5a8.38 8.38 0 0 1-3.8 7.1 8.5 8.5 0 0 1-9.8-.3L3 21l1.9-4.9A8.5 8.5 0 0 1 12.5 3.5a8.48 8.48 0 0 1 8.5 8v0z"/></svg><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(s.title || 'New conversation')}</span>`;

      if (isFull) {
        item.querySelector('.history-main').addEventListener('click', () => { switchToSession(s); closeHistoryFull(); closeSheet(); vibrate(8); });
        item.querySelector('.history-del').addEventListener('click', (e) => {
          e.stopPropagation();
          const remaining = loadSessions().filter(x => x.id !== s.id);
          saveSessions(remaining);
          if (s.id === currentSessionId) startNewSession(true);
          renderHistoryList(mHistoryFullList, mHistoryFullEmpty);
          updateHistoryCount();
          showToast('Conversation deleted'); vibrate(12);
        });
      } else {
        item.addEventListener('click', () => { switchToSession(s); closeSheet(); vibrate(8); });
      }
      container.appendChild(item);
    });
  }
  function updateHistoryCount() {
    const n = loadSessions().length;
    historyCountSub.textContent = n === 1 ? '1 conversation' : `${n} conversations`;
  }

  function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

  // ══════════════════════════════
  // SOUND + HAPTICS
  // ══════════════════════════════
  let audioCtx = null;
  function playBeep(freq, dur) {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.06, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.12));
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + (dur || 0.12));
    } catch {}
  }
  function vibrate(ms) { if (hapticOn && navigator.vibrate) navigator.vibrate(ms); }

  // ══════════════════════════════
  // RIPPLE
  // ══════════════════════════════
  function attachRipple(el) {
    if (!el || el.dataset.rippleBound) return; // avoid stacking duplicate listeners on repeat calls
    el.dataset.rippleBound = '1';
    el.addEventListener('click', function (e) {
      const rect = el.getBoundingClientRect();
      const r = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      r.className = 'ripple';
      r.style.width = r.style.height = size + 'px';
      const cx = (e.clientX ?? rect.left + rect.width/2) - rect.left - size/2;
      const cy = (e.clientY ?? rect.top + rect.height/2) - rect.top - size/2;
      r.style.left = cx + 'px'; r.style.top = cy + 'px';
      el.appendChild(r);
      setTimeout(() => r.remove(), 620);
    });
  }
  function attachRippleAll() {
    document.querySelectorAll('.round-btn, .send-btn, .icon-btn, .si-submit, .sheet-item, .history-item, .modal-btn, .close-btn, .profile-edit, .history-del, .setting-row.action, .picker-option, .swatch')
      .forEach(attachRipple);
  }

  // ══════════════════════════════
  // TOAST
  // ══════════════════════════════
  let toastEl = null;
  function showToast(text) {
    if (!text) return;
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }

  // ══════════════════════════════
  // CONFIRM MODAL
  // ══════════════════════════════
  function askConfirm(title, sub, onOk) {
    confirmTitle.textContent = title;
    confirmSub.textContent = sub;
    pendingConfirmAction = onOk;
    mConfirmOverlay.classList.add('show');
  }
  function closeConfirm() { mConfirmOverlay.classList.remove('show'); pendingConfirmAction = null; }
  mConfirmCancel.addEventListener('click', closeConfirm);
  mConfirmOverlay.addEventListener('click', (e) => { if (e.target === mConfirmOverlay) closeConfirm(); });
  mConfirmOk.addEventListener('click', () => { const fn = pendingConfirmAction; closeConfirm(); fn && fn(); });

  // ══════════════════════════════
  // PHOTO ATTACH
  // ══════════════════════════════
  const MAX_ATTACH_DIM = 1600;       // longest side, px — keeps uploads fast & within API limits
  const ATTACH_JPEG_QUALITY = 0.82;

  function compressImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, MAX_ATTACH_DIM / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', ATTACH_JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error('Could not read that image.'));
      img.src = dataUrl;
    });
  }

  mAttachBtn.addEventListener('click', () => mPhotoInput.click());
  mPhotoInput.addEventListener('change', () => {
    const file = mPhotoInput.files[0];
    mPhotoInput.value = ''; // allow re-selecting the same file next time
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file');
      return;
    }
    const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // 20MB raw photo ceiling before we even try
    if (file.size > MAX_SOURCE_BYTES) {
      showToast('That photo is too large — try a smaller one');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => showToast('Could not read that image — please try again');
    reader.onload = async () => {
      try {
        attachedImage = await compressImage(reader.result);
        mAttachThumb.src = attachedImage;
        mAttachPreview.hidden = false;
      } catch {
        showToast('Could not read that image — please try again');
      }
    };
    reader.readAsDataURL(file);
  });
  mAttachRemove.addEventListener('click', () => { attachedImage = null; mAttachPreview.hidden = true; mPhotoInput.value = ''; });

  // ══════════════════════════════
  // SUGGESTIONS
  // ══════════════════════════════
  const SUGGESTION_POOL = [
    'Summarize this in 3 bullet points',
    'Explain like I\u2019m new to this',
    'Give me a code example',
    'What are the pros and cons?',
    'Make it shorter',
    'Can you elaborate?',
  ];
  function renderSuggestions(list) {
    suggestionRow.innerHTML = '';
    if (!showSuggestions || !list || list.length === 0) return;
    list.forEach((text, i) => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.style.setProperty('--i', i);
      chip.style.animationDelay = (i * 0.05) + 's';
      chip.textContent = text;
      chip.addEventListener('click', () => { sendMessage(text); });
      suggestionRow.appendChild(chip);
    });
    attachRippleAll();
  }

  // ══════════════════════════════
  // BUBBLE RENDERING
  // ══════════════════════════════
  // Shared icon strings used by message action buttons + the global stop control
  const ICON_COPY  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const ICON_CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg>';
  const ICON_LIKE  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
  const ICON_DISLIKE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>';
  const ICON_SPEAKER = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  const ICON_STOP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="11" height="11" rx="2.5"/></svg>';

  function addBubble(text, who = 'bot', source = '', animate = false, imgData = null, skipLog = false) {
    if (!skipLog) { renderLog.push({ who, text, source, imgData }); persistCurrentSession(); }

    const row = document.createElement('div');
    row.className = `row ${who}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (imgData) {
      const img = document.createElement('img');
      img.src = imgData; img.className = 'b-img'; img.alt = 'attached';
      bubble.appendChild(img);
    }

    const content = document.createElement('div');
    bubble.appendChild(content);

    function copyToClipboard(str, btn, toastMsg) {
      navigator.clipboard?.writeText(str);
      if (btn) {
        const original = btn.innerHTML;
        btn.classList.add('copied'); btn.innerHTML = ICON_CHECK;
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = original; }, 1400);
      }
      if (toastMsg) showToast(toastMsg);
      vibrate(6);
    }

    // Adds a header (language + copy button) to every fenced code block in a rendered bubble.
    function enhanceCodeBlocks(root) {
      root.querySelectorAll('pre').forEach(pre => {
        if (pre.dataset.enhanced) return;
        pre.dataset.enhanced = '1';
        const codeEl = pre.querySelector('code');
        const langMatch = codeEl && codeEl.className.match(/language-(\w+)/);
        const lang = langMatch ? langMatch[1] : 'code';

        const wrap = document.createElement('div'); wrap.className = 'code-block';
        pre.parentNode.insertBefore(wrap, pre);

        const head = document.createElement('div'); head.className = 'code-block-head';
        const langLabel = document.createElement('span'); langLabel.className = 'code-lang'; langLabel.textContent = lang;
        const copyBtn = document.createElement('button'); copyBtn.className = 'code-copy-btn'; copyBtn.type = 'button';
        copyBtn.innerHTML = ICON_COPY + '<span>Copy</span>';
        copyBtn.addEventListener('click', () => {
          copyToClipboard((codeEl || pre).innerText, null);
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = ICON_CHECK + '<span>Copied</span>';
          setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.innerHTML = ICON_COPY + '<span>Copy</span>'; }, 1400);
        });
        attachRipple(copyBtn);
        head.appendChild(langLabel); head.appendChild(copyBtn);

        wrap.appendChild(head);
        wrap.appendChild(pre);
      });
    }

    const finalize = () => {
      if (source) {
        const meta = document.createElement('div'); meta.className = 'meta-row';
        const badge = document.createElement('span'); badge.className = 'badge'; badge.innerHTML = source;
        meta.appendChild(badge);
        meta.appendChild(document.createTextNode(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })));
        bubble.appendChild(meta);
      }

      if (who === 'bot') {
        enhanceCodeBlocks(content);

        const actions = document.createElement('div'); actions.className = 'msg-actions';
        const copyBtn = document.createElement('button'); copyBtn.className = 'msg-action-btn'; copyBtn.title = 'Copy message';
        copyBtn.innerHTML = ICON_COPY;
        copyBtn.addEventListener('click', () => copyToClipboard(text, copyBtn, 'Copied to clipboard'));

        const likeBtn = document.createElement('button'); likeBtn.className = 'msg-action-btn'; likeBtn.title = 'Good response';
        likeBtn.innerHTML = ICON_LIKE;
        const dislikeBtn = document.createElement('button'); dislikeBtn.className = 'msg-action-btn'; dislikeBtn.title = 'Bad response';
        dislikeBtn.innerHTML = ICON_DISLIKE;

        const speakBtn = document.createElement('button'); speakBtn.className = 'msg-action-btn'; speakBtn.title = 'Read aloud';
        speakBtn.innerHTML = ICON_SPEAKER;
        speakBtn.addEventListener('click', () => {
          const wasSpeakingThis = speakBtn.classList.contains('speaking');
          speechSynthesis.cancel();
          if (activeSpeakBtn && activeSpeakBtn !== speakBtn) { activeSpeakBtn.classList.remove('speaking'); activeSpeakBtn.innerHTML = ICON_SPEAKER; }
          activeSpeakBtn = null;
          vibrate(6);
          if (wasSpeakingThis) { speakBtn.classList.remove('speaking'); speakBtn.innerHTML = ICON_SPEAKER; return; }
          speakBtn.classList.add('speaking'); speakBtn.innerHTML = ICON_STOP; activeSpeakBtn = speakBtn;
          speak(text, () => {
            speakBtn.classList.remove('speaking'); speakBtn.innerHTML = ICON_SPEAKER;
            if (activeSpeakBtn === speakBtn) activeSpeakBtn = null;
          }, true);
        });

        likeBtn.addEventListener('click', () => {
          const wasLiked = likeBtn.classList.contains('liked');
          likeBtn.classList.toggle('liked', !wasLiked);
          dislikeBtn.classList.remove('disliked');
          vibrate(6);
          if (!wasLiked) showToast('Thanks for the feedback');
        });
        dislikeBtn.addEventListener('click', () => {
          const wasDisliked = dislikeBtn.classList.contains('disliked');
          dislikeBtn.classList.toggle('disliked', !wasDisliked);
          likeBtn.classList.remove('liked');
          vibrate(6);
          if (!wasDisliked) showToast('Thanks — we\u2019ll use this to improve');
        });

        actions.appendChild(copyBtn); actions.appendChild(speakBtn); actions.appendChild(likeBtn); actions.appendChild(dislikeBtn);
        bubble.appendChild(actions);
        attachRipple(copyBtn); attachRipple(speakBtn); attachRipple(likeBtn); attachRipple(dislikeBtn);
      } else if (who === 'user' && text) {
        const actions = document.createElement('div'); actions.className = 'msg-actions';
        const copyBtn = document.createElement('button'); copyBtn.className = 'msg-action-btn'; copyBtn.title = 'Copy message';
        copyBtn.innerHTML = ICON_COPY;
        copyBtn.addEventListener('click', () => copyToClipboard(text, copyBtn, 'Copied to clipboard'));
        actions.appendChild(copyBtn);
        bubble.appendChild(actions);
        attachRipple(copyBtn);
      }
    };

    if (animate && who === 'bot' && !reduceMotion) {
      let i = 0; const raw = text;
      const step = Math.max(2, Math.round(raw.length / 90));
      const timer = setInterval(() => {
        if (i < raw.length) {
          i += step;
          content.innerHTML = typeof marked !== 'undefined' ? marked.parse(raw.slice(0, i)) : raw.slice(0, i);
          chat.scrollTop = chat.scrollHeight;
        } else { clearInterval(timer); content.innerHTML = typeof marked !== 'undefined' ? marked.parse(raw) : raw; finalize(); }
      }, 14);
    } else {
      content.innerHTML = typeof marked !== 'undefined' ? marked.parse(text) : text;
      finalize();
    }

    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }

  function addTyping() {
    const t = document.createElement('div');
    t.className = 'row bot'; t.id = 'mTypingRow';
    t.innerHTML = `<div class="typing-row"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    chat.appendChild(t); chat.scrollTop = chat.scrollHeight;
  }
  function removeTyping() { document.getElementById('mTypingRow')?.remove(); }

  // ── Image-generation "drawing" placeholder — shimmering canvas with a sweeping brush glow ──
  function addImageGenerating(prompt) {
    const row = document.createElement('div');
    row.className = 'row bot'; row.id = 'mImageGenRow';
    row.innerHTML = `
      <div class="bubble img-gen-bubble">
        <div class="img-gen-canvas">
          <div class="img-gen-shimmer"></div>
          <div class="img-gen-sweep"></div>
          <div class="img-gen-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        </div>
        <div class="img-gen-label"><span class="img-gen-dot"></span>Painting your image…</div>
      </div>`;
    chat.appendChild(row); chat.scrollTop = chat.scrollHeight;
  }
  function removeImageGenerating() { document.getElementById('mImageGenRow')?.remove(); }

  function addImageBubble(dataUrl, prompt, skipLog = false) {
    if (!skipLog) {
      renderLog.push({ who: 'bot', text: '', source: '', imgData: null, genImg: dataUrl, genPrompt: prompt });
      persistCurrentSession();
    }

    const row = document.createElement('div'); row.className = 'row bot';
    const bubble = document.createElement('div'); bubble.className = 'bubble img-result-bubble';

    const img = document.createElement('img');
    img.src = dataUrl; img.className = 'gen-img'; img.alt = prompt; img.loading = 'lazy';
    img.addEventListener('click', () => window.open(dataUrl, '_blank'));
    bubble.appendChild(img);

    const caption = document.createElement('div'); caption.className = 'gen-caption';
    caption.textContent = prompt;
    bubble.appendChild(caption);

    const actions = document.createElement('div'); actions.className = 'msg-actions';
    const dlBtn = document.createElement('button'); dlBtn.className = 'msg-action-btn'; dlBtn.title = 'Download image';
    dlBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
    dlBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = dataUrl; a.download = `eka-image-${Date.now()}.jpg`;
      document.body.appendChild(a); a.click(); a.remove();
      vibrate(6);
    });
    actions.appendChild(dlBtn);
    bubble.appendChild(actions);
    attachRipple(dlBtn);

    row.appendChild(bubble);
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }

  function setStatus(state) {
    const dot = mStatus.querySelector('.status-dot');
    dot.className = 'status-dot' + (state !== 'ready' ? ` ${state}` : '');
    const map = { ready:'Ready', thinking:'Thinking…', speaking:'Speaking…' };
    mStatus.querySelector('.status-text').textContent = map[state] || 'Ready';
  }

  // ══════════════════════════════
  // SEND MESSAGE
  // ══════════════════════════════
  const PERSONA_TAGS = {
    balanced: '', concise: ' Be brief and to the point.', detailed: ' Be thorough and explain in depth.', creative: ' Feel free to be playful and casual.'
  };

  async function sendMessage(text) {
    const cleaned = (text || '').trim();
    if (!cleaned && !attachedImage) return;
    if (isThinking) return;

    // ── Image generation mode: typed text is a drawing prompt, not a chat message ──
    if (imageGenEnabled && !attachedImage) {
      if (!cleaned) return;
      suggestionRow.innerHTML = '';
      renderLog.push({ who: 'user', text: cleaned, source: '', imgData: null });
      addBubble(cleaned, 'user');
      mMsg.value = ''; autoGrow();
      playBeep(520, 0.07); vibrate(10);
      addImageGenerating(cleaned); isThinking = true; setStatus('thinking');
      mSend.disabled = true;

      try {
        const res = await fetch('/api/image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: cleaned })
        }).then(r => r.json());

        removeImageGenerating(); isThinking = false; mSend.disabled = false; setStatus('ready');

        if (res.image) {
          addImageBubble(res.image, cleaned);
          vibrate(14);
        } else {
          addBubble(res.error || 'Image generation failed — please try again.', 'bot');
        }
      } catch {
        removeImageGenerating(); isThinking = false; mSend.disabled = false; setStatus('ready');
        addBubble('Something went wrong generating that image. Please try again.', 'bot');
      }
      return;
    }

    suggestionRow.innerHTML = '';
    const imageToSend = attachedImage;
    if (attachedImage) { attachedImage = null; mAttachPreview.hidden = true; }

    chatHistory.push({ role:'user', content: cleaned || '[image attached]' });
    addBubble(cleaned || '', 'user', '', false, imageToSend);
    mMsg.value = ''; autoGrow();
    playBeep(520, 0.07); vibrate(10);
    addTyping(); isThinking = true; setStatus('thinking');
    mSend.disabled = true;

    try {
      const body = {
        message: (cleaned || 'Please analyse this image.') + (PERSONA_TAGS[persona] || ''),
        history: chatHistory, wiki: webSearchEnabled, lang: currentLang
      };
      if (imageToSend) body.image = imageToSend;

      const res = await fetch(API_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      }).then(r => r.json());

      removeTyping(); isThinking = false; mSend.disabled = false;
      const ICON_WEB  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>';
      const ICON_LOCAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>';
      const ICON_AI   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none"/></svg>';
      const srcLabel = res.source === 'web+ai' ? `${ICON_WEB} Web + AI` : res.source === 'local' ? `${ICON_LOCAL} Cached` : `${ICON_AI} AI`;
      chatHistory.push({ role:'assistant', content: res.reply });

      setTimeout(() => {
        addBubble(res.reply, 'bot', srcLabel, true);
        setStatus('speaking');
        const plain = res.reply.replace(/(\*\*|__|[\*_`])/g,'').replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}\s.,!?]/gu,'').trim();
        speak(plain, () => { setStatus('ready'); maybeShowFollowups(); });
      }, 180);
    } catch {
      removeTyping(); isThinking = false; mSend.disabled = false; setStatus('ready');
      addBubble('Something went wrong reaching Eka. Please try again.', 'bot');
    }
  }

  function maybeShowFollowups() {
    if (!showSuggestions) return;
    const shuffled = [...SUGGESTION_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    renderSuggestions(shuffled);
  }

  function autoGrow() {
    mMsg.style.height = 'auto';
    mMsg.style.height = Math.min(mMsg.scrollHeight, 120) + 'px';
  }
  mMsg.addEventListener('input', autoGrow);

  mSend.addEventListener('click', () => sendMessage(mMsg.value));
  mMsg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(mMsg.value); }
  });

  // ══════════════════════════════
  // TTS — voice discovery & selection
  // ══════════════════════════════
  // Browsers load voices asynchronously (esp. Chrome), so we listen for 'voiceschanged'
  // rather than reading the list once at startup — otherwise getVoices() often returns [].
  function refreshVoices() {
    availableVoices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    buildVoiceOptions();
  }
  if ('speechSynthesis' in window) {
    refreshVoices();
    speechSynthesis.addEventListener('voiceschanged', refreshVoices);
  }

  // Ranks a voice by how natural + female it's likely to sound, from its name/metadata.
  // There's no standard "gender" field in the Web Speech API, so this is a best-effort
  // heuristic based on the naming conventions every major platform actually uses.
  function voiceScore(v) {
    const n = v.name.toLowerCase();
    let s = 0;
    if (/female|woman|girl|aria|jenny|zira|samantha|susan|neerja|swara|kavya|heera|salli|joanna|amy|emma|libby|sonia|natasha|priya|kalpana|veena|moira|tessa|karen|victoria/.test(n)) s += 6;
    if (/\bmale\b|\bman\b|david|guy|ravi|daniel|george|arthur|fred/.test(n)) s -= 8;
    if (/neural|natural|premium|online|enhanced|plus/.test(n)) s += 5;
    if (/google/.test(n)) s += 3;
    if (v.localService === false) s += 1; // network-backed voices are usually higher quality
    return s;
  }

  function pickBestVoice(lang) {
    if (!availableVoices.length) return null;
    const wantHindi = lang.startsWith('hi');
    let pool = availableVoices.filter(v => wantHindi ? v.lang.startsWith('hi') : /^en/i.test(v.lang));
    if (!pool.length) pool = availableVoices;
    return [...pool].sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
  }

  function buildVoiceOptions() {
    if (!voiceOptions) return;
    const relevant = availableVoices.filter(v => /^en|^hi/i.test(v.lang));
    const list = (relevant.length ? relevant : availableVoices).slice()
      .sort((a, b) => voiceScore(b) - voiceScore(a));
    voiceOptions.querySelectorAll('.picker-option:not([data-val="auto"])').forEach(b => b.remove());
    list.slice(0, 14).forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'picker-option'; btn.dataset.val = v.voiceURI;
      const icon = document.createElement('span'); icon.className = 'po-icon';
      icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></svg>';
      const label = document.createElement('span'); label.textContent = v.name.replace(/^Microsoft |^Google /, '') + ' \u00b7 ' + v.lang;
      const check = document.createElement('span'); check.className = 'po-check';
      check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      btn.appendChild(icon); btn.appendChild(label); btn.appendChild(check);
      voiceOptions.appendChild(btn);
    });
    updateVoiceSub();
  }

  function updateVoiceSub() {
    if (!voiceSub) return;
    if (selectedVoiceURI === 'auto') { voiceSub.textContent = 'Auto (best available)'; return; }
    const v = availableVoices.find(x => x.voiceURI === selectedVoiceURI);
    voiceSub.textContent = v ? v.name.replace(/^Microsoft |^Google /, '') : 'Auto (best available)';
  }

  function speak(text, onEnd = null, force = false) {
    if (!text || (isMuted && !force) || !('speechSynthesis' in window)) { onEnd?.(); return; }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const isHindi = /[\u0900-\u097F]/.test(text);
    utter.lang = isHindi ? 'hi-IN' : 'en-GB';
    // Slightly slower + a touch higher than default — closer to natural conversational cadence
    // than the flat 1.0/1.0 robotic default, without sounding sped-up or cartoonish.
    utter.rate = 0.98; utter.pitch = 1.04; utter.volume = 1;

    const chosen = selectedVoiceURI === 'auto'
      ? pickBestVoice(utter.lang)
      : (availableVoices.find(v => v.voiceURI === selectedVoiceURI) || pickBestVoice(utter.lang));
    if (chosen) { utter.voice = chosen; utter.lang = chosen.lang || utter.lang; }

    utter.onstart = () => { speakGrid.hidden = false; };
    utter.onend   = () => { speakGrid.hidden = true; onEnd?.(); };
    utter.onerror = () => { speakGrid.hidden = true; onEnd?.(); };
    speechSynthesis.speak(utter);
  }
  sgStop.addEventListener('click', () => {
    speechSynthesis.cancel(); speakGrid.hidden = true; setStatus('ready'); vibrate(6);
    if (activeSpeakBtn) { activeSpeakBtn.classList.remove('speaking'); activeSpeakBtn.innerHTML = ICON_SPEAKER; activeSpeakBtn = null; }
  });

  rowVoice.addEventListener('click', () => openPicker(pickVoiceOverlay, voiceOptions, selectedVoiceURI, (val) => {
    selectedVoiceURI = val; savePrefs(); updateVoiceSub();
    speak("Hi, I'm Eka. This is how I sound now.", null, true);
  }));

  // ══════════════════════════════
  // SPEECH RECOGNITION
  // ══════════════════════════════
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    recognition = new SR();
    recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-IN';
    recognition.onstart = () => { mMic.classList.add('mic-active'); };
    recognition.onend   = () => { mMic.classList.remove('mic-active'); };
    recognition.onresult = (e) => { const t = e.results[0][0].transcript; mMsg.value = t; sendMessage(t); };
    recognition.onerror  = () => { mMic.classList.remove('mic-active'); };
    mMic.addEventListener('click', () => {
      if (mMic.classList.contains('mic-active')) recognition.stop(); else recognition.start();
    });
  } else {
    mMic.style.display = 'none';
  }

  // ══════════════════════════════
  // SPLASH → SIGN-IN / APP
  // ══════════════════════════════
  setTimeout(() => {
    splash.style.pointerEvents = 'none';
    const profile = loadProfile();
    if (profile && profile.email) enterApp(profile);
    else signin.classList.add('show');
  }, 1800);

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  siSubmit.addEventListener('click', () => {
    const name = siName.value.trim();
    const email = siEmail.value.trim();
    if (!email) {
      siError.textContent = 'Email is required to continue.';
      siSubmit.classList.add('shake'); setTimeout(()=>siSubmit.classList.remove('shake'),400);
      siEmail.focus(); return;
    }
    if (!validEmail(email)) {
      siError.textContent = 'That doesn\u2019t look like a valid email address.';
      siSubmit.classList.add('shake'); setTimeout(()=>siSubmit.classList.remove('shake'),400);
      siEmail.focus(); return;
    }
    siError.textContent = '';
    const profile = { name: name || 'Guest', email, joined: Date.now() };
    saveProfile(profile);
    signin.classList.remove('show');
    setTimeout(() => enterApp(profile), 320);
  });

  function enterApp(profile) {
    signin.classList.remove('show');
    app.classList.add('ready');
    updateProfileUI(profile);
    applyPrefs();
    updateHistoryCount();
    if (chat.children.length === 0) { if (!restoreLastSession()) startNewSession(true); }
    attachRippleAll();
  }

  function updateProfileUI(profile) {
    const initial = (profile.name || profile.email || '?').trim().charAt(0).toUpperCase();
    mSheetName.textContent = profile.name || 'Guest';
    mSheetEmail.textContent = profile.email || '—';
    mSheetAvatar.textContent = initial;
    stName.textContent = profile.name || 'Guest';
    stEmail.textContent = profile.email || '—';
    stAvatar.textContent = initial;
  }

  // ══════════════════════════════
  // NAVIGATION: SETTINGS PAGE
  // ══════════════════════════════
  function openSettings() {
    viewSettings.hidden = false;
    requestAnimationFrame(() => viewSettings.classList.add('show'));
    viewChat.classList.add('pushed');
    updateHistoryCount();
  }
  function closeSettings() {
    viewSettings.classList.remove('show');
    viewChat.classList.remove('pushed');
    setTimeout(() => { viewSettings.hidden = true; }, 420);
  }
  btnSettingsBack.addEventListener('click', () => { closeSettings(); vibrate(6); });
  mOpenSettings.addEventListener('click', () => { closeSheet(); setTimeout(openSettings, 200); });

  // ══════════════════════════════
  // SLIDE-UP MENU SHEET
  // ══════════════════════════════
  function openSheet() { renderHistoryList(mHistoryList, mHistoryEmpty); mSheetOverlay.classList.add('show'); attachRippleAll(); }
  function closeSheet() { mSheetOverlay.classList.remove('show'); }
  btnMenu.addEventListener('click', openSheet);
  mSheetOverlay.addEventListener('click', (e) => { if (e.target === mSheetOverlay) closeSheet(); });
  mSheet.addEventListener('click', (e) => e.stopPropagation());
  sheetUserRow.addEventListener('click', () => { closeSheet(); setTimeout(openSettings, 200); });

  mHistorySearch.addEventListener('input', () => renderHistoryList(mHistoryList, mHistoryEmpty, mHistorySearch.value));

  mNewChat.addEventListener('click', () => {
    persistCurrentSession(); startNewSession(true); closeSheet();
    showToast('New chat started'); vibrate(8);
  });

  btnNewChat.addEventListener('click', () => {
    persistCurrentSession(); startNewSession(true);
    showToast('New chat started'); vibrate(8);
  });

  btnWebToggle.addEventListener('click', () => {
    webSearchEnabled = !webSearchEnabled;
    btnWebToggle.classList.toggle('active', webSearchEnabled);
    btnWebToggle.setAttribute('aria-pressed', String(webSearchEnabled));
    swWeb.checked = webSearchEnabled;
    savePrefs();
    showToast(webSearchEnabled ? 'Web search on' : 'Web search off');
    vibrate(6);
  });

  btnImageToggle.addEventListener('click', () => {
    imageGenEnabled = !imageGenEnabled;
    btnImageToggle.classList.toggle('active', imageGenEnabled);
    btnImageToggle.setAttribute('aria-pressed', String(imageGenEnabled));
    swImage.checked = imageGenEnabled;
    mMsg.placeholder = imageGenEnabled ? 'Describe the image to generate…' : 'Message Eka…';
    savePrefs();
    showToast(imageGenEnabled ? 'Image generation on — describe what to create' : 'Image generation off');
    vibrate(6);
  });

  swImage.addEventListener('change', () => {
    imageGenEnabled = swImage.checked;
    btnImageToggle.classList.toggle('active', imageGenEnabled);
    btnImageToggle.setAttribute('aria-pressed', String(imageGenEnabled));
    mMsg.placeholder = imageGenEnabled ? 'Describe the image to generate…' : 'Message Eka…';
    savePrefs();
    vibrate(6);
  });

  // ══════════════════════════════
  // SETTINGS PAGE — TOGGLES
  // ══════════════════════════════
  swWeb.addEventListener('change', () => { webSearchEnabled = swWeb.checked; btnWebToggle.classList.toggle('active', webSearchEnabled); savePrefs(); vibrate(6); });
  swMute.addEventListener('change', () => { isMuted = swMute.checked; savePrefs(); vibrate(6); });
  swSound.addEventListener('change', () => { soundOn = swSound.checked; savePrefs(); if (soundOn) playBeep(660, 0.08); });
  swHaptic.addEventListener('change', () => { hapticOn = swHaptic.checked; savePrefs(); vibrate(15); });
  swSuggestions.addEventListener('change', () => { showSuggestions = swSuggestions.checked; savePrefs(); if(!showSuggestions) suggestionRow.innerHTML=''; });
  swReduceMotion.addEventListener('change', () => { reduceMotion = swReduceMotion.checked; savePrefs(); applyTheme(); vibrate(6); });

  fontSizeSlider.addEventListener('input', () => {
    fontSize = parseInt(fontSizeSlider.value, 10);
    applyFontSizeUI(); applyTheme(); savePrefs();
  });

  // ── Picker sheets (theme / persona / language) ──
  function openPicker(overlay, optionsEl, currentVal, onSelect) {
    optionsEl.querySelectorAll('.picker-option').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.val === currentVal);
      btn.onclick = () => { onSelect(btn.dataset.val); closePicker(overlay); vibrate(6); };
    });
    overlay.classList.add('show'); attachRippleAll();
  }
  function closePicker(overlay) { overlay.classList.remove('show'); }

  rowThemeMode.addEventListener('click', () => openPicker(pickThemeOverlay, themeOptions, themeMode, (val) => {
    themeMode = val; themeModeSub.textContent = THEME_LABELS[val]; savePrefs(); applyTheme();
    showToast('Theme set to ' + THEME_LABELS[val]);
  }));
  rowPersona.addEventListener('click', () => openPicker(pickPersonaOverlay, personaOptions, persona, (val) => {
    persona = val; personaSub.textContent = PERSONA_LABELS[val]; savePrefs();
    showToast('Style set to ' + PERSONA_LABELS[val]);
  }));
  rowLang.addEventListener('click', () => openPicker(pickLangOverlay, langOptions, currentLang, (val) => {
    currentLang = val; langSub.textContent = LANG_LABELS[val]; savePrefs();
    if (recognition) recognition.lang = val === 'auto' ? 'en-IN' : val;
    showToast('Voice language set to ' + LANG_LABELS[val]);
  }));
  [pickThemeOverlay, pickPersonaOverlay, pickLangOverlay, pickVoiceOverlay].forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) closePicker(ov); });
    ov.querySelector('.sheet').addEventListener('click', (e) => e.stopPropagation());
  });

  // ── Chat history (full list in settings) ──
  function openHistoryFull() { renderHistoryList(mHistoryFullList, mHistoryFullEmpty); mHistoryOverlay.classList.add('show'); attachRippleAll(); }
  function closeHistoryFull() { mHistoryOverlay.classList.remove('show'); }
  btnChatHistory.addEventListener('click', openHistoryFull);
  mHistoryClose.addEventListener('click', closeHistoryFull);
  mHistoryOverlay.addEventListener('click', (e) => { if (e.target === mHistoryOverlay) closeHistoryFull(); });
  mHistorySheet.addEventListener('click', (e) => e.stopPropagation());

  // ── Export / clear / sign out ──
  btnExportChat.addEventListener('click', () => {
    if (renderLog.length === 0) { showToast('Nothing to export yet'); return; }
    const text = renderLog.map(m => `[${m.who === 'user' ? 'You' : 'Eka'}] ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `eka-chat-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported'); vibrate(8);
  });

  btnClearData.addEventListener('click', () => {
    askConfirm('Clear all chat history?', 'All saved conversations on this device will be permanently deleted.', () => {
      saveSessions([]);
      localStorage.removeItem('eka_current_session');
      startNewSession(true);
      updateHistoryCount();
      showToast('All chat history cleared'); vibrate(15);
    });
  });

  btnSignOut.addEventListener('click', () => {
    askConfirm('Sign out?', 'You can sign back in anytime with your email.', () => {
      persistCurrentSession();
      localStorage.removeItem('eka_profile');
      location.reload();
    });
  });

  // ── Edit name (from settings page) ──
  function openNameModal() {
    const profile = loadProfile() || {};
    mNameInput.value = profile.name && profile.name !== 'Guest' ? profile.name : '';
    mNameModalOverlay.classList.add('show');
    setTimeout(() => mNameInput.focus(), 250);
  }
  function closeNameModal() { mNameModalOverlay.classList.remove('show'); }
  stEditName.addEventListener('click', openNameModal);
  mNameCancel.addEventListener('click', closeNameModal);
  mNameModalOverlay.addEventListener('click', (e) => { if (e.target === mNameModalOverlay) closeNameModal(); });
  mNameSave.addEventListener('click', () => {
    const profile = loadProfile() || { email: '' };
    const newName = mNameInput.value.trim() || 'Guest';
    profile.name = newName;
    saveProfile(profile);
    updateProfileUI(profile);
    closeNameModal();
    showToast('Name updated'); vibrate(8);
  });

});
