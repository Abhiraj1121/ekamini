document.addEventListener('DOMContentLoaded', () => {

  // ── DOM REFS ──
  const splash        = document.getElementById('splash');
  const signin        = document.getElementById('signin');
  const app           = document.getElementById('app');
  const siName        = document.getElementById('siName');
  const siEmail       = document.getElementById('siEmail');
  const siError       = document.getElementById('siError');
  const siTerms       = document.getElementById('siTerms');
  const siSubmit      = document.getElementById('siSubmit');

  const chat          = document.getElementById('chat');
  const mMsg          = document.getElementById('mMsg');
  const mSend         = document.getElementById('mSend');
  const mMic          = document.getElementById('mMic');
  const mStatus       = document.getElementById('mStatus');
  const mWebToggle    = document.getElementById('mWebToggle');
  const mMenuToggle   = document.getElementById('mMenuToggle');
  const speakGrid     = document.getElementById('speakGrid');
  const sgCells       = document.getElementById('sgCells');

  const mAttachBtn      = document.getElementById('mAttachBtn');
  const mPhotoInput     = document.getElementById('mPhotoInput');
  const mAttachPreview  = document.getElementById('mAttachPreview');
  const mAttachThumb    = document.getElementById('mAttachThumb');
  const mAttachRemove   = document.getElementById('mAttachRemove');

  const mSheetOverlay = document.getElementById('mSheetOverlay');
  const mSheet        = document.getElementById('mSheet');
  const mSheetAvatar  = document.getElementById('mSheetAvatar');
  const mSheetName    = document.getElementById('mSheetName');
  const mSheetEmail   = document.getElementById('mSheetEmail');
  const mNewChat      = document.getElementById('mNewChat');
  const mMute         = document.getElementById('mMute');
  const mWebSetting   = document.getElementById('mWebSetting');
  const mSignOut      = document.getElementById('mSignOut');
  const mSound        = document.getElementById('mSound');
  const mHaptic       = document.getElementById('mHaptic');
  const mLangSelect   = document.getElementById('mLangSelect');
  const mExportChat   = document.getElementById('mExportChat');
  const mClearData    = document.getElementById('mClearData');

  const mEditNameBtn      = document.getElementById('mEditNameBtn');
  const mNameModalOverlay = document.getElementById('mNameModalOverlay');
  const mNameInput        = document.getElementById('mNameInput');
  const mNameSave         = document.getElementById('mNameSave');
  const mNameCancel       = document.getElementById('mNameCancel');

  const mChatHistoryBtn = document.getElementById('mChatHistoryBtn');
  const mHistoryOverlay = document.getElementById('mHistoryOverlay');
  const mHistorySheet   = document.getElementById('mHistorySheet');
  const mHistoryClose   = document.getElementById('mHistoryClose');
  const mHistoryList    = document.getElementById('mHistoryList');
  const mHistoryEmpty   = document.getElementById('mHistoryEmpty');

  // ── STATE ──
  let chatHistory      = [];   // [{role, content}] sent to the API
  let renderLog        = [];   // [{who, text, source, imgData}] used to re-render bubbles from storage
  let isMuted           = false;
  let webSearchEnabled  = false;
  let isThinking        = false;
  let attachedImage     = null;
  let recognition       = null;
  let soundOn           = true;
  let hapticOn          = true;
  let currentLang       = 'auto';
  let currentSessionId  = null;

  const API_ENDPOINT = '/api/chat'; // same-origin: works on Render domain and inside the Kotlin WebView

  // ══════════════════════════════
  // BUILD SPEAKING GRID CELLS
  // ══════════════════════════════
  const hues = ['var(--gold)','var(--orchid)','var(--teal)'];
  for (let i = 0; i < 21; i++) {
    const c = document.createElement('div');
    c.className = 'cell';
    c.style.color = hues[i % hues.length];
    c.style.background = hues[i % hues.length];
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
    for (let i = 0; i < 40; i++) dust.push({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      r: Math.random()*1.1+0.3, a: Math.random()*0.25+0.05,
      vx:(Math.random()-0.5)*0.2, vy:(Math.random()-0.5)*0.15,
      hue:[42,270,168][i%3]
    });
    function frame() {
      ctx.clearRect(0,0,W,H);
      for (const p of dust) {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},70%,65%,${p.a})`; ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  })();

  // ══════════════════════════════
  // SPLASH → SIGN-IN / APP
  // ══════════════════════════════
  function loadProfile() {
    try { return JSON.parse(localStorage.getItem('eka_mobile_profile') || 'null'); }
    catch { return null; }
  }
  function saveProfile(p) { localStorage.setItem('eka_mobile_profile', JSON.stringify(p)); }

  // ── PREFERENCES (mute / web search / sound / haptic / language) ──
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem('eka_mobile_prefs') || '{}'); }
    catch { return {}; }
  }
  function savePrefs() {
    localStorage.setItem('eka_mobile_prefs', JSON.stringify({
      muted: isMuted, web: webSearchEnabled, sound: soundOn, haptic: hapticOn, lang: currentLang
    }));
  }
  function applyPrefs() {
    const p = loadPrefs();
    isMuted          = !!p.muted;
    webSearchEnabled = !!p.web;
    soundOn          = p.sound === undefined ? true : !!p.sound;
    hapticOn         = p.haptic === undefined ? true : !!p.haptic;
    currentLang      = p.lang || 'auto';
    mMute.checked        = isMuted;
    mWebSetting.checked  = webSearchEnabled;
    mSound.checked       = soundOn;
    mHaptic.checked      = hapticOn;
    mLangSelect.value    = currentLang;
    mWebToggle.classList.toggle('active', webSearchEnabled);
    if (recognition) recognition.lang = currentLang === 'auto' ? 'en-IN' : currentLang;
  }

  // ── CHAT SESSIONS (stored locally in this browser) ──
  const SESSIONS_KEY = 'eka_mobile_sessions';
  function loadSessions() {
    try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
    catch { return []; }
  }
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
    const data = {
      id: currentSessionId,
      title: makeSessionTitle(renderLog),
      log: renderLog,
      history: chatHistory,
      updated: Date.now()
    };
    if (idx >= 0) sessions[idx] = data; else sessions.unshift(data);
    saveSessions(sessions);
  }

  function startNewSession(withWelcome) {
    currentSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('eka_mobile_current_session', currentSessionId);
    chat.innerHTML = '';
    chatHistory = [];
    renderLog = [];
    if (withWelcome) {
      const profile = loadProfile();
      addBubble(`Hey **${(profile && profile.name) || 'there'}**! I'm EKA \u2728 — ask me anything, or tap the mic to talk.`, 'bot', '', true);
    }
  }

  function restoreLastSession() {
    const lastId = localStorage.getItem('eka_mobile_current_session');
    const sessions = loadSessions();
    const found = lastId && sessions.find(s => s.id === lastId);
    if (found) {
      currentSessionId = found.id;
      chatHistory = found.history || [];
      renderLog = (found.log || []).slice();
      chat.innerHTML = '';
      renderLog.forEach(m => addBubble(m.text, m.who, m.source || '', false, m.imgData || null, true));
      return true;
    }
    return false;
  }

  function renderHistoryList() {
    const sessions = loadSessions().sort((a, b) => b.updated - a.updated);
    mHistoryList.innerHTML = '';
    mHistoryEmpty.classList.toggle('show', sessions.length === 0);
    sessions.forEach((s, i) => {
      const item = document.createElement('div');
      item.className = 'm-history-item' + (s.id === currentSessionId ? ' active' : '');
      item.style.setProperty('--d', i);
      const dt = new Date(s.updated);
      item.innerHTML = `
        <button class="m-history-main">
          <div class="m-history-title">${escapeHtml(s.title || 'New conversation')}</div>
          <div class="m-history-meta">${dt.toLocaleDateString([], { month:'short', day:'numeric' })} · ${dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })} · ${(s.log||[]).length} msgs</div>
        </button>
        <button class="m-history-del" title="Delete">🗑️</button>`;
      item.querySelector('.m-history-main').addEventListener('click', () => {
        persistCurrentSession();
        currentSessionId = s.id;
        localStorage.setItem('eka_mobile_current_session', s.id);
        chatHistory = s.history || [];
        renderLog = (s.log || []).slice();
        chat.innerHTML = '';
        renderLog.forEach(m => addBubble(m.text, m.who, m.source || '', false, m.imgData || null, true));
        closeHistory(); closeSheet();
        vibrate(8);
      });
      item.querySelector('.m-history-del').addEventListener('click', (e) => {
        e.stopPropagation();
        const remaining = loadSessions().filter(x => x.id !== s.id);
        saveSessions(remaining);
        if (s.id === currentSessionId) startNewSession(true);
        renderHistoryList();
        showToast('Conversation deleted');
        vibrate(12);
      });
      mHistoryList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
  }

  function openHistory() { renderHistoryList(); mHistoryOverlay.classList.add('show'); }
  function closeHistory() { mHistoryOverlay.classList.remove('show'); }
  mChatHistoryBtn.addEventListener('click', openHistory);
  mHistoryClose.addEventListener('click', closeHistory);
  mHistoryOverlay.addEventListener('click', (e) => { if (e.target === mHistoryOverlay) closeHistory(); });
  mHistorySheet.addEventListener('click', (e) => e.stopPropagation());

  // ── SOUND EFFECTS ──
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

  // ── HAPTICS ──
  function vibrate(ms) { if (hapticOn && navigator.vibrate) navigator.vibrate(ms); }

  // ── RIPPLE EFFECT (tactile tap feedback) ──
  function attachRipple(el) {
    el.addEventListener('click', function (e) {
      const rect = el.getBoundingClientRect();
      const r = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      r.className = 'm-ripple';
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size / 2) + 'px';
      r.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
      el.appendChild(r);
      setTimeout(() => r.remove(), 550);
    });
  }
  document.querySelectorAll('.m-round-btn, .m-send-btn, .m-icon-btn, .si-submit, .m-sheet-item, .m-history-item, .m-modal-btn, .m-close-btn, .m-edit-name-btn, .m-history-del')
    .forEach(attachRipple);

  setTimeout(() => {
    splash.style.pointerEvents = 'none';
    const profile = loadProfile();
    if (profile && profile.email) {
      enterApp(profile);
    } else {
      signin.classList.add('show');
    }
  }, 2200);

  // ══════════════════════════════
  // SIGN-IN VALIDATION (client-side, email mandatory)
  // ══════════════════════════════
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  siSubmit.addEventListener('click', () => {
    const name  = siName.value.trim();
    const email = siEmail.value.trim();

    if (!email) {
      siError.textContent = 'Email is required to continue.';
      siSubmit.classList.add('shake'); setTimeout(()=>siSubmit.classList.remove('shake'),400);
      siEmail.focus();
      return;
    }
    if (!validEmail(email)) {
      siError.textContent = 'That doesn\u2019t look like a valid email address.';
      siSubmit.classList.add('shake'); setTimeout(()=>siSubmit.classList.remove('shake'),400);
      siEmail.focus();
      return;
    }
    siError.textContent = '';
    const profile = { name: name || 'Guest', email, joined: Date.now() };
    saveProfile(profile);
    signin.classList.remove('show');
    setTimeout(() => enterApp(profile), 350);
  });

  function enterApp(profile) {
    signin.classList.remove('show');
    app.classList.add('ready');
    mSheetName.textContent  = profile.name || 'Guest';
    mSheetEmail.textContent = profile.email || '—';
    mSheetAvatar.textContent = (profile.name || profile.email || '?').trim().charAt(0).toUpperCase();
    applyPrefs();
    if (chat.children.length === 0) {
      if (!restoreLastSession()) startNewSession(true);
    }
  }

  // ══════════════════════════════
  // SLIDE-UP MENU SHEET
  // ══════════════════════════════
  function openSheet() { mSheetOverlay.classList.add('show'); }
  function closeSheet() { mSheetOverlay.classList.remove('show'); }
  mMenuToggle.addEventListener('click', openSheet);
  mSheetOverlay.addEventListener('click', (e) => { if (e.target === mSheetOverlay) closeSheet(); });
  mSheet.addEventListener('click', (e) => e.stopPropagation());

  mNewChat.addEventListener('click', () => {
    persistCurrentSession();
    startNewSession(true);
    closeSheet(); showToast('New chat started'); vibrate(8);
  });
  mMute.addEventListener('change', () => { isMuted = mMute.checked; savePrefs(); vibrate(6); });
  mWebSetting.addEventListener('change', () => { webSearchEnabled = mWebSetting.checked; mWebToggle.classList.toggle('active', webSearchEnabled); savePrefs(); vibrate(6); });
  mSound.addEventListener('change', () => { soundOn = mSound.checked; savePrefs(); if (soundOn) playBeep(660, 0.08); });
  mHaptic.addEventListener('change', () => { hapticOn = mHaptic.checked; savePrefs(); vibrate(15); });
  mLangSelect.addEventListener('change', () => {
    currentLang = mLangSelect.value; savePrefs();
    if (recognition) recognition.lang = currentLang === 'auto' ? 'en-IN' : currentLang;
    showToast('Language set to ' + mLangSelect.options[mLangSelect.selectedIndex].text);
  });

  mExportChat.addEventListener('click', () => {
    if (renderLog.length === 0) { showToast('Nothing to export yet'); return; }
    const text = renderLog.map(m => `[${m.who === 'user' ? 'You' : 'EKA'}] ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `eka-chat-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
    showToast('Chat exported'); vibrate(8);
  });

  mClearData.addEventListener('click', () => {
    saveSessions([]);
    localStorage.removeItem('eka_mobile_current_session');
    startNewSession(true);
    renderHistoryList();
    closeSheet();
    showToast('All chat history cleared');
    vibrate(15);
  });

  mSignOut.addEventListener('click', () => {
    persistCurrentSession();
    localStorage.removeItem('eka_mobile_profile');
    closeSheet();
    location.reload();
  });

  mWebToggle.addEventListener('click', () => {
    webSearchEnabled = !webSearchEnabled;
    mWebToggle.classList.toggle('active', webSearchEnabled);
    mWebSetting.checked = webSearchEnabled;
    savePrefs();
    showToast(webSearchEnabled ? '\ud83c\udf10 Web search on' : 'Web search off');
  });

  // ── EDIT NAME MODAL ──
  function openNameModal() {
    const profile = loadProfile() || {};
    mNameInput.value = profile.name && profile.name !== 'Guest' ? profile.name : '';
    mNameModalOverlay.classList.add('show');
    setTimeout(() => mNameInput.focus(), 250);
  }
  function closeNameModal() { mNameModalOverlay.classList.remove('show'); }
  mEditNameBtn.addEventListener('click', openNameModal);
  mNameCancel.addEventListener('click', closeNameModal);
  mNameModalOverlay.addEventListener('click', (e) => { if (e.target === mNameModalOverlay) closeNameModal(); });
  mNameSave.addEventListener('click', () => {
    const profile = loadProfile() || { email: '' };
    const newName = mNameInput.value.trim() || 'Guest';
    profile.name = newName;
    saveProfile(profile);
    mSheetName.textContent = newName;
    mSheetAvatar.textContent = (newName || profile.email || '?').trim().charAt(0).toUpperCase();
    closeNameModal();
    showToast('Name updated');
    vibrate(8);
  });

  // ══════════════════════════════
  // TOAST
  // ══════════════════════════════
  let toastEl = null;
  function showToast(text) {
    if (!text) return;
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'm-toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ══════════════════════════════
  // PHOTO ATTACH
  // ══════════════════════════════
  mAttachBtn.addEventListener('click', () => mPhotoInput.click());
  mPhotoInput.addEventListener('change', () => {
    const file = mPhotoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      attachedImage = reader.result;
      mAttachThumb.src = attachedImage;
      mAttachPreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  });
  mAttachRemove.addEventListener('click', () => {
    attachedImage = null; mAttachPreview.style.display = 'none'; mPhotoInput.value = '';
  });

  // ══════════════════════════════
  // BUBBLE RENDERING (3D entrance handled by CSS)
  // ══════════════════════════════
  function addBubble(text, who = 'bot', source = '', animate = false, imgData = null, skipLog = false) {
    if (!skipLog) {
      renderLog.push({ who, text, source, imgData });
      persistCurrentSession();
    }
    const row = document.createElement('div');
    row.className = `m-row ${who}`;

    const bubble = document.createElement('div');
    bubble.className = 'm-bubble';

    if (imgData) {
      const img = document.createElement('img');
      img.src = imgData; img.className = 'b-img'; img.alt = 'attached';
      bubble.appendChild(img);
    }

    const content = document.createElement('div');
    bubble.appendChild(content);

    const finalize = () => {
      if (source) {
        const meta = document.createElement('div'); meta.className = 'm-meta';
        const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = source;
        meta.appendChild(badge);
        meta.appendChild(document.createTextNode(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })));
        bubble.appendChild(meta);
      }
    };

    if (animate && who === 'bot') {
      let i = 0; const raw = text;
      const timer = setInterval(() => {
        if (i < raw.length) {
          i += 2;
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
    t.className = 'm-row bot'; t.id = 'mTypingRow';
    t.innerHTML = `<div class="m-typing"><div class="td"></div><div class="td"></div><div class="td"></div></div>`;
    chat.appendChild(t); chat.scrollTop = chat.scrollHeight;
  }
  function removeTyping() { document.getElementById('mTypingRow')?.remove(); }

  function setStatus(state) {
    const dot = mStatus.querySelector('.m-dot');
    dot.className = 'm-dot' + (state !== 'ready' ? ` ${state}` : '');
    const map = { ready:'Ready', thinking:'Thinking…', speaking:'Speaking…' };
    mStatus.lastChild.textContent = ' ' + (map[state] || 'Ready');
  }

  // ══════════════════════════════
  // SEND MESSAGE
  // ══════════════════════════════
  async function sendMessage(text) {
    const cleaned = (text || '').trim();
    if (!cleaned && !attachedImage) return;
    if (isThinking) return;

    const imageToSend = attachedImage;
    if (attachedImage) { attachedImage = null; mAttachPreview.style.display = 'none'; }

    chatHistory.push({ role:'user', content: cleaned || '[image attached]' });
    addBubble(cleaned || '', 'user', '', false, imageToSend);
    mMsg.value = '';
    playBeep(520, 0.07); vibrate(10);
    addTyping(); isThinking = true; setStatus('thinking');

    try {
      const body = { message: cleaned || 'Please analyse this image.', history: chatHistory, wiki: webSearchEnabled, lang: currentLang };
      if (imageToSend) body.image = imageToSend;

      const res = await fetch(API_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      }).then(r => r.json());

      removeTyping(); isThinking = false;
      const srcLabel = res.source === 'web+ai' ? '\ud83c\udf10 Web + AI' : res.source === 'local' ? '\ud83d\udcc1 Cached' : '\ud83e\udd16 AI';
      chatHistory.push({ role:'assistant', content: res.reply });

      setTimeout(() => {
        addBubble(res.reply, 'bot', srcLabel, true);
        setStatus('speaking');
        const plain = res.reply.replace(/(\*\*|__|[\*_`])/g,'').replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}\s.,!?]/gu,'').trim();
        speak(plain, () => setStatus('ready'));
      }, 180);
    } catch {
      removeTyping(); isThinking = false; setStatus('ready');
      addBubble('Something went wrong reaching EKA. Please try again.', 'bot');
    }
  }

  mSend.addEventListener('click', () => sendMessage(mMsg.value));
  mMsg.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(mMsg.value); });

  // ══════════════════════════════
  // TTS with color-grid speaking animation
  // ══════════════════════════════
  function speak(text, onEnd = null) {
    if (!text || isMuted || !('speechSynthesis' in window)) { onEnd?.(); return; }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0; utter.pitch = 1.05;
    const isHindi = /[\u0900-\u097F]/.test(text);
    utter.lang = isHindi ? 'hi-IN' : 'en-GB';
    utter.onstart = () => { speakGrid.style.display = 'flex'; };
    utter.onend   = () => { speakGrid.style.display = 'none'; onEnd?.(); };
    utter.onerror = () => { speakGrid.style.display = 'none'; onEnd?.(); };
    speechSynthesis.speak(utter);
  }

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

});