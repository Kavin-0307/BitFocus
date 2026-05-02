/* ================================================================
   FOCUSQUEST — Complete Game Logic
   Pomodoro Timer + RPG Boss System + Tasks + Stats + Calendar
   ================================================================ */

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const MODES = {
  focus: { label: 'FOCUS SESSION',      secs: 25 * 60, color: '#a78bfa' },
  short: { label: 'SHORT BREAK',        secs:  5 * 60, color: '#10b981' },
  long:  { label: 'LONG BREAK',         secs: 15 * 60, color: '#3b82f6' },
};

const BOSS_EMOJIS = {
  full:    ['👹','🐉','🧟','🦹','👾','🐲','💀','🧌'],
  damaged: ['👺','🐊','🧟','🦹','👾','🔥','💀','😤'],
  critical:['💀','😡','🩸','😱','⚠️','😤','🔥','💔'],
};

const RANKS = [
  { min: 0,  label: 'Rookie Hero',   color: '#64748b' },
  { min: 20, label: 'Apprentice',    color: '#3b82f6' },
  { min: 40, label: 'Warrior',       color: '#10b981' },
  { min: 60, label: 'Champion',      color: '#a78bfa' },
  { min: 80, label: 'Legendary',     color: '#f59e0b' },
  { min: 96, label: 'MYTHIC ⚡',     color: '#ef4444' },
];

const XP_PER_SESSION = 50;
const XP_PER_QUEST   = 120;
const XP_PER_LEVEL   = 500;
const CIRCUMFERENCE  = 2 * Math.PI * 140; // r=140 for timer ring
const PROD_CIRC      = 2 * Math.PI * 56;  // r=56 for prod ring

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
let state = {
  tasks:       [],
  activeTaskId: null,
  mode:        'focus',
  running:     false,
  timeLeft:    25 * 60,
  totalSecs:   25 * 60,
  interval:    null,
  sessionNum:  1,          // 1-4 in a cycle
  cycleCount:  0,          // completed full cycles

  stats: {
    sessions:    0,
    focusMin:    0,
    bossDefeated:0,
    xp:          0,
    level:       1,
    streak:      0,
    lastDate:    null,
    powerScore:  0,
    energy:      0,
    totalPomos:  0,
  },

  calendar: {},   // { "YYYY-MM-DD": sessionCount }
  bossHpPct: 100,
  selectedPriority: 'high',
  modalPomos: 2,
};

// ──────────────────────────────────────────────
// STORAGE
// ──────────────────────────────────────────────
function save() {
  const toStore = {
    tasks:    state.tasks,
    stats:    state.stats,
    calendar: state.calendar,
    sessionNum: state.sessionNum,
    cycleCount: state.cycleCount,
  };
  localStorage.setItem('fq_state', JSON.stringify(toStore));
}

function load() {
  try {
    const raw = localStorage.getItem('fq_state');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.tasks)    state.tasks    = saved.tasks;
    if (saved.stats)    state.stats    = { ...state.stats, ...saved.stats };
    if (saved.calendar) state.calendar = saved.calendar;
    if (saved.sessionNum) state.sessionNum = saved.sessionNum;
    if (saved.cycleCount) state.cycleCount  = saved.cycleCount;
  } catch(e) { console.warn('Load error', e); }
}

// ──────────────────────────────────────────────
// TIMER
// ──────────────────────────────────────────────
function toggleTimer() {
  state.running ? pauseTimer() : startTimer();
}

function startTimer() {
  if (state.running) return;
  state.running = true;
  updatePlayPauseBtn();
  document.querySelector('.timer-wrap')?.classList.add('running');
  state.interval = setInterval(tick, 1000);
}

function pauseTimer() {
  state.running = false;
  clearInterval(state.interval);
  state.interval = null;
  updatePlayPauseBtn();
  document.querySelector('.timer-wrap')?.classList.remove('running');
}

function resetTimer() {
  pauseTimer();
  state.timeLeft  = MODES[state.mode].secs;
  state.totalSecs = MODES[state.mode].secs;
  updateDisplay();
  updateRing();
}

function skipSession() {
  pauseTimer();
  onSessionComplete(false);
}

function tick() {
  if (state.timeLeft <= 0) {
    clearInterval(state.interval);
    state.interval = null;
    state.running = false;
    updatePlayPauseBtn();
    onSessionComplete(true);
    return;
  }
  state.timeLeft--;
  updateDisplay();
  updateRing();

  // Pulse timer digits in last 10 seconds of focus
  if (state.mode === 'focus' && state.timeLeft <= 10 && state.timeLeft > 0) {
    const el = document.getElementById('timer');
    el.style.color = '#ef4444';
    el.style.textShadow = '0 0 40px rgba(239,68,68,.7)';
  }
}

function onSessionComplete(natural) {
  const wasFocus = state.mode === 'focus';

  if (wasFocus && natural) {
    // Award stats
    state.stats.sessions++;
    state.stats.focusMin += Math.floor(MODES.focus.secs / 60);
    state.stats.totalPomos++;
    addXP(XP_PER_SESSION);
    checkStreak();

    // Calendar entry
    const today = todayKey();
    state.calendar[today] = (state.calendar[today] || 0) + 1;

    // Boss damage
    dealDamage();

    // Dot + cycle progress
    const dotIdx = (state.sessionNum - 1) % 4;
    markPomoDot(dotIdx, 'done');
    markCycleDot(dotIdx, 'done');

    // Advance session
    state.sessionNum++;
    if (state.sessionNum > 4) {
      state.sessionNum = 1;
      state.cycleCount++;
      // Long break after 4 sessions
      switchMode('long', document.querySelector('[data-mode="long"]'));
      toast('⚔️ 4 Sessions Complete! Take a long rest, hero!');
      flashScreen('flash-gold');
      launchConfetti();
      resetCycleDots();
      save();
      updateStatsPanel();
      return;
    }

    // Short break next
    switchMode('short', document.querySelector('[data-mode="short"]'));
    toast('🎉 +50 XP! Session Complete! Short break time.');
    flashScreen('flash-purple');
    launchConfetti();

    // Energy modal
    setTimeout(() => showEnergyModal(), 1200);

  } else if (!wasFocus) {
    // Break over → back to focus
    switchMode('focus', document.querySelector('[data-mode="focus"]'));
    toast('⚔️ Break over! Back to battle, hero!');
    flashScreen('flash-purple');
  }

  updateStatsPanel();
  updateInsights();
  save();
  updateDisplay();
}

// ──────────────────────────────────────────────
// MODE
// ──────────────────────────────────────────────
function switchMode(mode, btn) {
  pauseTimer();
  state.mode     = mode;
  state.timeLeft = MODES[mode].secs;
  state.totalSecs = MODES[mode].secs;

  // Update tabs
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Update session label
  const lbl = document.getElementById('session-type-label');
  if (lbl) lbl.textContent = MODES[mode].label;

  // Timer color
  const timerEl = document.getElementById('timer');
  if (timerEl) {
    timerEl.style.color = '';
    timerEl.style.textShadow = '';
    timerEl.classList.toggle('break-mode', mode !== 'focus');
  }

  updateDisplay();
  updateRing();
  document.querySelector('.timer-wrap')?.classList.remove('running');
}

// ──────────────────────────────────────────────
// DISPLAY
// ──────────────────────────────────────────────
function updateDisplay() {
  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  document.getElementById('timer').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
  document.getElementById('session-num').textContent = state.sessionNum;
  document.getElementById('cycle-display').textContent = state.cycleCount + 1;
}

function updateRing() {
  const pct    = state.timeLeft / state.totalSecs;
  const offset = CIRCUMFERENCE * (1 - pct);
  const ring   = document.getElementById('ring-prog');
  const dot    = document.getElementById('ring-dot');
  if (!ring) return;

  ring.style.strokeDasharray  = CIRCUMFERENCE;
  ring.style.strokeDashoffset = offset;

  // Move dot along ring path (r=140, cx=cy=160)
  const angle = -Math.PI / 2 + (1 - pct) * 2 * Math.PI;
  const dx    = 160 + 140 * Math.cos(angle);
  const dy    = 160 + 140 * Math.sin(angle);
  if (dot) { dot.setAttribute('cx', dx); dot.setAttribute('cy', dy); }
}

function updatePlayPauseBtn() {
  const play  = document.querySelector('.ico-play');
  const pause = document.querySelector('.ico-pause');
  if (!play || !pause) return;
  play.classList.toggle('hidden',  state.running);
  pause.classList.toggle('hidden', !state.running);
}

// ──────────────────────────────────────────────
// POMO / CYCLE DOTS
// ──────────────────────────────────────────────
function markPomoDot(idx, cls) {
  const el = document.getElementById(`pd${idx}`);
  if (el) { el.className = `pomo-dot ${cls}`; }
}

function markCycleDot(idx, cls) {
  const el = document.getElementById(`cd${idx}`);
  if (el) { el.classList.add(cls); }
}

function resetCycleDots() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`cd${i}`);
    if (el) el.className = 'cycle-dot';
    const pd = document.getElementById(`pd${i}`);
    if (pd) pd.className = 'pomo-dot';
  }
}

function setActivePomoDot() {
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById(`pd${i}`);
    if (!el) continue;
    const idx = state.sessionNum - 1;
    if (i === idx)    el.className = 'pomo-dot active';
    else if (i < idx) el.className = 'pomo-dot done';
    else              el.className = 'pomo-dot';
  }
}

// ──────────────────────────────────────────────
// BOSS SYSTEM
// ──────────────────────────────────────────────
function dealDamage() {
  const activeTask = state.tasks.find(t => t.id === state.activeTaskId);
  if (!activeTask) return;

  const isCrit = Math.random() < .25;
  const dmg    = isCrit ? 150 : 100;

  // Floating damage
  spawnDamage(isCrit ? `💥 CRIT! -${dmg}` : `-${dmg}`, isCrit ? 'crit' : 'normal');

  // Boss shake animation
  const bossEl = document.getElementById('boss-emoji');
  if (bossEl) {
    bossEl.classList.remove('hit');
    void bossEl.offsetWidth;
    bossEl.classList.add('hit');
    setTimeout(() => bossEl.classList.remove('hit'), 400);
  }

  // Advance task pomos
  activeTask.pomosLeft = Math.max(0, (activeTask.pomosLeft ?? activeTask.pomos) - 1);

  // Update boss HP pct
  const pct = activeTask.pomosLeft / activeTask.pomos;
  updateBossHP(pct, activeTask);

  if (activeTask.pomosLeft <= 0) {
    setTimeout(() => defeatBoss(activeTask), 600);
  }

  renderTasks();
}

function updateBossHP(pct, task) {
  const bar   = document.getElementById('boss-hp-bar');
  const hpTxt = document.getElementById('boss-hp-text');
  const bossEl = document.getElementById('boss-emoji');
  const aura   = document.getElementById('boss-aura');

  if (bar)   bar.style.width = `${Math.max(0, pct * 100)}%`;

  // HP dots display
  const total = task.pomos;
  const left  = task.pomosLeft;
  const dots  = Array.from({length: total}, (_, i) => i < left ? '●' : '○').join(' ');
  if (hpTxt) hpTxt.textContent = dots;

  // Boss phase transition
  if (bossEl) {
    const bossIdx = state.tasks.indexOf(task) % BOSS_EMOJIS.full.length;
    if (pct > .66)     bossEl.textContent = BOSS_EMOJIS.full[bossIdx];
    else if (pct > .33) bossEl.textContent = BOSS_EMOJIS.damaged[bossIdx];
    else               { bossEl.textContent = BOSS_EMOJIS.critical[bossIdx]; flashScreen('flash-red'); }
  }

  // Aura color by phase
  if (aura) {
    if (pct > .66)      aura.style.background = 'radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%)';
    else if (pct > .33) aura.style.background = 'radial-gradient(circle, rgba(245,158,11,.3) 0%, transparent 70%)';
    else                aura.style.background = 'radial-gradient(circle, rgba(239,68,68,.35) 0%, transparent 70%)';
  }

  // Color the HP bar by phase
  if (bar) {
    if (pct > .66)      bar.style.background = 'linear-gradient(90deg, #ef4444, #ff6b6b)';
    else if (pct > .33) bar.style.background = 'linear-gradient(90deg, #f59e0b, #fcd34d)';
    else                bar.style.background = 'linear-gradient(90deg, #7c3aed, #ef4444)';
  }
}

function defeatBoss(task) {
  const bossEl = document.getElementById('boss-emoji');
  if (bossEl) { bossEl.classList.add('dead'); }

  flashScreen('flash-gold');
  launchConfetti();
  spawnDamage('⭐ QUEST COMPLETE!', 'bonus');
  toast(`🏆 Quest "${task.name}" conquered! +120 XP!`);

  state.stats.bossDefeated++;
  state.stats.powerScore += 20;
  addXP(XP_PER_QUEST);

  // Mark task done
  task.done = true;
  state.activeTaskId = null;

  setTimeout(() => {
    bossEl?.classList.remove('dead');
    renderTasks();
    resetBossArena();
    updateStatsPanel();
    save();
  }, 900);
}

function resetBossArena() {
  document.getElementById('boss-emoji').textContent = '👹';
  document.getElementById('boss-hp-bar').style.width = '100%';
  document.getElementById('boss-name-label').textContent = 'FOCUS DEMON';
  document.getElementById('boss-hp-text').textContent = '● ● ● ● ●';
  document.getElementById('boss-label').textContent = '⚠ ENEMY AWAITS';
  document.getElementById('aq-name').textContent = 'Select a quest to begin your battle';
  const aura = document.getElementById('boss-aura');
  if (aura) aura.style.background = 'radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%)';
}

function activateBoss(task) {
  const idx = state.tasks.indexOf(task) % BOSS_EMOJIS.full.length;
  const pct = (task.pomosLeft ?? task.pomos) / task.pomos;

  document.getElementById('boss-emoji').textContent = BOSS_EMOJIS.full[idx];
  document.getElementById('boss-name-label').textContent = task.name.toUpperCase().slice(0, 20);
  document.getElementById('boss-label').textContent = '⚔ BATTLE IN PROGRESS';
  document.getElementById('aq-name').textContent = task.name;
  updateBossHP(pct, task);
}

// ──────────────────────────────────────────────
// TASKS
// ──────────────────────────────────────────────
let currentPri = 'high';
let currentPomos = 2;

function openTaskModal() {
  currentPri = 'high';
  currentPomos = 2;
  document.getElementById('task-name-inp').value = '';
  document.getElementById('modal-pomo-count').textContent = 2;
  updatePomoPreview();
  // Reset priority buttons
  document.querySelectorAll('.pri-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.pri-btn[data-p="high"]')?.classList.add('active');
  document.getElementById('task-modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('task-name-inp').focus(), 100);
}

function closeTaskModal(event) {
  if (event && event.target !== document.getElementById('task-modal-overlay')) return;
  document.getElementById('task-modal-overlay').classList.add('hidden');
}

function selectPriority(p, btn) {
  currentPri = p;
  document.querySelectorAll('.pri-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function adjPomos(delta) {
  currentPomos = Math.max(1, Math.min(12, currentPomos + delta));
  document.getElementById('modal-pomo-count').textContent = currentPomos;
  updatePomoPreview();
}

function updatePomoPreview() {
  const prev = document.getElementById('pomo-preview');
  if (prev) prev.textContent = '🍅'.repeat(Math.min(currentPomos, 8)) + (currentPomos > 8 ? ` +${currentPomos-8}` : '');
}

function addTask() {
  const name = document.getElementById('task-name-inp').value.trim();
  if (!name) { shakeEl('task-name-inp'); return; }

  const task = {
    id:        Date.now(),
    name,
    priority:  currentPri,
    pomos:     currentPomos,
    pomosLeft: currentPomos,
    done:      false,
    created:   Date.now(),
  };

  state.tasks.unshift(task);
  sortTasks();
  renderTasks();
  save();
  document.getElementById('task-modal-overlay').classList.add('hidden');
  toast(`⚔️ Quest "${name}" added!`);
}

function sortTasks() {
  const priScore = { high: 3, medium: 2, low: 1 };
  state.tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (priScore[b.priority] || 0) - (priScore[a.priority] || 0);
  });
}

function selectTask(id) {
  if (state.running) {
    toast('⚠️ Pause the timer before switching quests!');
    return;
  }
  state.activeTaskId = id;
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    activateBoss(task);
    setActivePomoDot();
    flashScreen('flash-purple');
  }
  renderTasks();
}

function deleteTask(id, e) {
  e.stopPropagation();
  if (state.activeTaskId === id) { state.activeTaskId = null; resetBossArena(); }
  state.tasks = state.tasks.filter(t => t.id !== id);
  renderTasks();
  save();
}

function toggleTaskDone(id, e) {
  e.stopPropagation();
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  if (task.done && id === state.activeTaskId) {
    state.activeTaskId = null;
    resetBossArena();
  }
  sortTasks();
  renderTasks();
  save();
}

function renderTasks() {
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-tasks');
  const activeTasks = state.tasks.filter(t => !t.done);
  const doneTasks   = state.tasks.filter(t =>  t.done);

  if (state.tasks.length === 0) {
    listEl.innerHTML = '';
    listEl.appendChild(emptyEl);
    emptyEl.style.display = '';
    return;
  }
  emptyEl.style.display = 'none';

  const render = (tasks) => tasks.map(task => {
    const isActive = task.id === state.activeTaskId;
    const left     = task.pomosLeft ?? task.pomos;
    const done     = task.pomos - left;
    const priCls   = { high:'pri-high', medium:'pri-medium', low:'pri-low' }[task.priority];
    const pomoDots = Array.from({length: task.pomos}, (_, i) =>
      `<span class="pomo-badge ${i < done ? 'done-p' : ''}">🍅</span>`
    ).join('');

    return `
      <div class="task-item ${isActive ? 'active' : ''} ${task.done ? 'done' : ''}"
           data-p="${task.priority}"
           onclick="selectTask(${task.id})">
        <div class="task-top">
          <div class="task-check" onclick="toggleTaskDone(${task.id}, event)">
            ${task.done ? '✓' : ''}
          </div>
          <div class="task-name">${escHtml(task.name)}</div>
          <button class="task-delete" onclick="deleteTask(${task.id}, event)">✕</button>
        </div>
        <div class="task-meta">
          <span class="priority-badge ${priCls}">
            ${task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🧊'} 
            ${task.priority.toUpperCase()}
          </span>
          <div class="pomo-badges">${pomoDots}</div>
        </div>
      </div>
    `;
  }).join('');

  listEl.innerHTML = render(activeTasks) + (doneTasks.length ? `
    <div style="font-family:var(--font-num);font-size:9px;color:var(--muted);letter-spacing:.1em;margin:12px 0 6px;text-align:center;">
      COMPLETED
    </div>
    ${render(doneTasks)}
  ` : '');
}

// ──────────────────────────────────────────────
// XP + LEVELS
// ──────────────────────────────────────────────
function addXP(amount) {
  const prevLevel = state.stats.level;
  state.stats.xp += amount;
  const newLevel = Math.floor(state.stats.xp / XP_PER_LEVEL) + 1;
  state.stats.level = newLevel;
  if (newLevel > prevLevel) showLevelUp(newLevel);
  updateXPBar();
}

function updateXPBar() {
  const xpInLevel = state.stats.xp % XP_PER_LEVEL;
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;
  const fill = document.getElementById('xp-fill');
  if (fill) fill.style.width = pct + '%';
  const now = document.getElementById('xp-now');
  const nxt = document.getElementById('xp-next');
  if (now) now.textContent = xpInLevel;
  if (nxt) nxt.textContent = XP_PER_LEVEL;
  const lvl = document.getElementById('player-level');
  if (lvl) lvl.textContent = state.stats.level;
}

function showLevelUp(level) {
  const el = document.createElement('div');
  el.className = 'levelup-banner';
  el.innerHTML = `
    <span class="levelup-icon">⬆️</span>
    <div class="levelup-title">LEVEL UP!</div>
    <div class="levelup-sub">You reached Level ${level}</div>
  `;
  document.body.appendChild(el);
  flashScreen('flash-gold');
  launchConfetti();

  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 500);
  }, 2500);
}

// ──────────────────────────────────────────────
// STREAK
// ──────────────────────────────────────────────
function checkStreak() {
  const today = todayKey();
  const last  = state.stats.lastDate;

  if (!last) {
    state.stats.streak = 1;
  } else {
    const lastD = new Date(last);
    const todD  = new Date(today);
    const diff  = (todD - lastD) / 86400000;
    if (diff === 1)      state.stats.streak++;
    else if (diff > 1)   state.stats.streak = 1;
    // same day → no change
  }
  state.stats.lastDate = today;
  document.getElementById('streak-count').textContent = state.stats.streak;
}

// ──────────────────────────────────────────────
// STATS PANEL
// ──────────────────────────────────────────────
function updateStatsPanel() {
  const s = state.stats;

  // Update counts with bump animation
  bumpStat('sc-sessions', 's-sessions', s.sessions);
  bumpStat('sc-time',     's-time',     s.focusMin + 'm');
  bumpStat('sc-quests',   's-quests',   s.bossDefeated);

  // Power score
  const score = computeScore();
  s.powerScore = score;
  bumpStat('sc-score', 's-score', score);

  // Productivity ring
  const pct = Math.min(100, score);
  const offset = PROD_CIRC * (1 - pct / 100);
  const ring = document.getElementById('prod-prog');
  if (ring) {
    ring.style.strokeDashoffset = offset;
    // Color by score
    const color = pct >= 80 ? '#f59e0b' : pct >= 60 ? '#a78bfa' : pct >= 40 ? '#10b981' : '#3b82f6';
    ring.style.stroke = color;
  }
  const pctEl = document.getElementById('prod-pct');
  if (pctEl) pctEl.textContent = pct + '%';

  // Rank
  const rank = RANKS.slice().reverse().find(r => pct >= r.min) || RANKS[0];
  const rankEl = document.getElementById('rank-label');
  if (rankEl) { rankEl.textContent = rank.label; rankEl.style.color = rank.color; }

  // Streak
  document.getElementById('streak-count').textContent = s.streak;
  updateXPBar();
}

function bumpStat(cardId, valId, val) {
  const valEl  = document.getElementById(valId);
  const cardEl = document.getElementById(cardId);
  if (valEl) valEl.textContent = val;
  if (cardEl) {
    cardEl.classList.remove('bump');
    void cardEl.offsetWidth;
    cardEl.classList.add('bump');
  }
}

function computeScore() {
  const s = state.stats;
  const completionRate = state.tasks.length > 0
    ? state.tasks.filter(t => t.done).length / state.tasks.length
    : 0;
  return Math.min(100, Math.floor(
    s.sessions * 5 + completionRate * 40 + s.streak * 3 + s.bossDefeated * 8
  ));
}

// ──────────────────────────────────────────────
// ENERGY
// ──────────────────────────────────────────────
function setEnergy(level) {
  state.stats.energy = level;
  const fill = document.getElementById('energy-fill');
  const lbl  = document.getElementById('energy-label');
  if (fill) fill.style.width = (level / 5 * 100) + '%';
  const labels = ['', 'Drained 😴', 'Low 😐', 'Okay 😊', 'Pumped 🔥', 'Unstoppable ⚡'];
  if (lbl) lbl.textContent = labels[level] || '';

  document.querySelectorAll('.e-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i + 1 === level);
  });
  save();
}

function showEnergyModal() {
  document.getElementById('energy-modal-overlay').classList.remove('hidden');
}

function setEnergyModal(level) {
  document.getElementById('energy-modal-overlay').classList.add('hidden');
  setEnergy(level);
}

// ──────────────────────────────────────────────
// INSIGHTS
// ──────────────────────────────────────────────
function updateInsights() {
  const container = document.getElementById('insights');
  const insights  = [];
  const s = state.stats;

  if (s.sessions === 0) {
    insights.push({ ico: '💡', text: 'Complete a session to unlock insights.' });
  } else {
    if (s.sessions >= 4)
      insights.push({ ico: '⚡', text: `You've done ${s.sessions} sessions today. Impressive hero!` });
    if (s.streak >= 3)
      insights.push({ ico: '🔥', text: `${s.streak}-day streak! Consistency is your superpower.` });
    if (s.energy <= 2 && s.energy > 0)
      insights.push({ ico: '😴', text: 'Energy is low. Consider a longer break or a walk.' });
    if (s.energy >= 4)
      insights.push({ ico: '⚡', text: 'High energy! Perfect time for your hardest quest.' });

    const stalledTasks = state.tasks.filter(t => !t.done && t.pomosLeft === t.pomos && t.pomos > 4);
    if (stalledTasks.length > 0)
      insights.push({ ico: '⚠️', text: `"${stalledTasks[0].name}" looks heavy — try splitting it into smaller quests!` });

    const completionRate = state.tasks.length > 0
      ? (state.tasks.filter(t => t.done).length / state.tasks.length * 100).toFixed(0)
      : 0;
    if (completionRate >= 80)
      insights.push({ ico: '🏆', text: `${completionRate}% quest completion today! Legendary performance!` });

    if (insights.length === 0)
      insights.push({ ico: '⚔️', text: 'Keep fighting! Select a quest and defeat your next boss.' });
  }

  container.innerHTML = insights.map(i =>
    `<div class="insight-item"><span class="ins-ico">${i.ico}</span><span>${i.text}</span></div>`
  ).join('');
}

// ──────────────────────────────────────────────
// CALENDAR
// ──────────────────────────────────────────────
function renderCalendar() {
  const grid  = document.getElementById('calendar-grid');
  const month = document.getElementById('cal-month');
  if (!grid) return;

  const today = new Date();
  const year  = today.getFullYear();
  const mon   = today.getMonth();
  const todayStr = todayKey();

  if (month) {
    month.textContent = today.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  }

  // Day headers
  const days = ['S','M','T','W','T','F','S'];
  let html = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');

  // First day of month & blank cells
  const firstDay = new Date(year, mon, 1).getDay();
  html += '<div class="cal-day empty"></div>'.repeat(firstDay);

  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const key      = `${year}-${String(mon+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const sessions = state.calendar[key] || 0;
    const level    = sessions === 0 ? 'd0' : sessions <= 2 ? 'd1' : sessions <= 4 ? 'd2' : 'd3';
    const isToday  = key === todayStr ? 'today' : '';
    const tip      = sessions > 0 ? `title="${sessions} session${sessions>1?'s':''}"` : '';
    html += `<div class="cal-day ${level} ${isToday}" ${tip}></div>`;
  }

  grid.innerHTML = html;
}

// ──────────────────────────────────────────────
// VISUAL EFFECTS
// ──────────────────────────────────────────────
function spawnDamage(text, type = 'normal') {
  const layer  = document.getElementById('dmg-layer');
  if (!layer) return;

  const el = document.createElement('div');
  el.className = `dmg-text ${type}`;
  el.textContent = text;

  // Spawn near center-top of viewport
  const x = 30 + Math.random() * 40; // 30–70% of width
  const y = 25 + Math.random() * 20; // 25–45% of height
  el.style.left = x + 'vw';
  el.style.top  = y + 'vh';

  layer.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function flashScreen(cls) {
  const el = document.getElementById('screen-flash');
  if (!el) return;
  el.className = `screen-flash ${cls} go`;
  setTimeout(() => { el.className = 'screen-flash'; }, 550);
}

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
}

function launchConfetti() {
  if (typeof confetti !== 'function') return;
  const end = Date.now() + 1800;
  (function frame() {
    confetti({ particleCount: 6, angle: 60,  spread: 60, origin: { x: 0,   y: .7 }, colors: ['#7c3aed','#f59e0b','#a78bfa'] });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1,   y: .7 }, colors: ['#7c3aed','#f59e0b','#10b981'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function shakeEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'shake .4s ease';
  setTimeout(() => el.style.animation = '', 400);
}

// ──────────────────────────────────────────────
// TICK MARKS (decorative ring)
// ──────────────────────────────────────────────
function drawTickMarks() {
  const g = document.getElementById('tick-marks');
  if (!g) return;
  const cx = 160, cy = 160, r = 148;
  let html = '';
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const isMaj = i % 5 === 0;
    const len   = isMaj ? 10 : 5;
    const x1    = cx + r * Math.cos(angle);
    const y1    = cy + r * Math.sin(angle);
    const x2    = cx + (r - len) * Math.cos(angle);
    const y2    = cy + (r - len) * Math.sin(angle);
    html += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="tick-mark ${isMaj ? 'tick-major' : ''}"/>`;
  }
  g.innerHTML = html;
}

// ──────────────────────────────────────────────
// PARTICLE BACKGROUND
// ──────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');

  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const COUNT  = 50;
  const particles = Array.from({ length: COUNT }, () => mkParticle());

  function mkParticle() {
    return {
      x:    Math.random() * innerWidth,
      y:    Math.random() * innerHeight,
      vy:   -(0.2 + Math.random() * 0.5),
      vx:   (Math.random() - .5) * 0.3,
      r:    0.5 + Math.random() * 1.5,
      life: Math.random(),
      maxL: 0.5 + Math.random() * 0.5,
      hue:  Math.random() > .5 ? 270 : 45, // purple or amber
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life += 0.004;

      if (p.life > p.maxL || p.y < 0) { particles[i] = mkParticle(); particles[i].y = innerHeight; return; }

      const alpha = Math.sin(p.life / p.maxL * Math.PI) * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// ──────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close task modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('task-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) document.getElementById('task-modal-overlay').classList.add('hidden');
    });
  }
});

// Add shake keyframe dynamically
const styleEl = document.createElement('style');
styleEl.textContent = `@keyframes shake {
  0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}
}`;
document.head.appendChild(styleEl);

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
function init() {
  load();
  initParticles();
  drawTickMarks();

  // Set initial timer display
  state.timeLeft  = MODES[state.mode].secs;
  state.totalSecs = MODES[state.mode].secs;
  updateDisplay();
  updateRing();
  updatePlayPauseBtn();
  renderTasks();
  renderCalendar();
  updateStatsPanel();
  updateInsights();
  setActivePomoDot();

  // Sync streak display
  document.getElementById('streak-count').textContent = state.stats.streak;

  // Initialize energy display
  if (state.stats.energy > 0) setEnergy(state.stats.energy);

  // Restore active task boss display
  if (state.activeTaskId) {
    const t = state.tasks.find(t => t.id === state.activeTaskId);
    if (t && !t.done) activateBoss(t);
    else state.activeTaskId = null;
  }

  console.log('%c⚔️ FocusQuest Loaded!', 'color:#a78bfa;font-size:16px;font-weight:bold;');
}

init();
