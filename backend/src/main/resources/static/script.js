/* ================================================================
   FOCUSQUEST — Complete Game Logic
   Pomodoro Timer + RPG Boss System + Tasks + Stats + Calendar
   ================================================================ */

const API_BASE = "http://localhost:8080/api";

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
  sessionNum:  1,          
  cycleCount:  0,          

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

  calendar: {},   
  bossHpPct: 100,
  selectedPriority: 'high',
  modalPomos: 2,
};

// ──────────────────────────────────────────────
// BACKEND SYNC
// ──────────────────────────────────────────────
async function syncTasks() {
  try {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    state.tasks = await res.json();
    renderTasks();
    if (state.activeTaskId) {
        const active = state.tasks.find(t => t.taskId === state.activeTaskId);
        if (active) activateBoss(active);
        else { state.activeTaskId = null; resetBossArena(); }
    }
  } catch (e) { console.error("Sync error:", e); }
}

function save() {
  const toStore = {
    stats:    state.stats,
    calendar: state.calendar,
    sessionNum: state.sessionNum,
    cycleCount: state.cycleCount,
  };
  localStorage.setItem('fq_state', JSON.stringify(toStore));
}

async function load() {
  try {
    const raw = localStorage.getItem('fq_state');
    if (raw) {
        const saved = JSON.parse(raw);
        if (saved.stats)    state.stats    = { ...state.stats, ...saved.stats };
        if (saved.calendar) state.calendar = saved.calendar;
        if (saved.sessionNum) state.sessionNum = saved.sessionNum;
        if (saved.cycleCount) state.cycleCount  = saved.cycleCount;
    }
    await syncTasks();
    updateStatsPanel();
    updateInsights();
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

  if (state.mode === 'focus' && state.timeLeft <= 10 && state.timeLeft > 0) {
    const el = document.getElementById('timer');
    el.style.color = '#ef4444';
    el.style.textShadow = '0 0 40px rgba(239,68,68,.7)';
  }
}

async function onSessionComplete(natural) {
  const wasFocus = state.mode === 'focus';

  if (wasFocus && natural) {
    state.stats.sessions++;
    state.stats.focusMin += Math.floor(MODES.focus.secs / 60);
    state.stats.totalPomos++;
    addXP(XP_PER_SESSION);
    checkStreak();

    const today = todayKey();
    state.calendar[today] = (state.calendar[today] || 0) + 1;

    // Record on backend
    if (state.activeTaskId) {
        await recordPomodoro(state.activeTaskId, true);
    }

    const dotIdx = (state.sessionNum - 1) % 4;
    markPomoDot(dotIdx, 'done');
    markCycleDot(dotIdx, 'done');

    state.sessionNum++;
    if (state.sessionNum > 4) {
      state.sessionNum = 1;
      state.cycleCount++;
      switchMode('long', document.querySelector('[data-mode="long"]'));
      toast('⚔️ 4 Sessions Complete! Take a long rest, hero!');
      flashScreen('flash-gold');
      launchConfetti();
      resetCycleDots();
      save();
      updateStatsPanel();
      return;
    }

    switchMode('short', document.querySelector('[data-mode="short"]'));
    toast('🎉 +50 XP! Session Complete! Short break time.');
    flashScreen('flash-purple');
    launchConfetti();
    setTimeout(() => showEnergyModal(), 1200);

  } else if (!wasFocus) {
    switchMode('focus', document.querySelector('[data-mode="focus"]'));
    toast('⚔️ Break over! Back to battle, hero!');
    flashScreen('flash-purple');
  }

  updateStatsPanel();
  updateInsights();
  save();
  updateDisplay();
}

async function recordPomodoro(taskId, completed) {
    try {
        const res = await fetch(`${API_BASE}/tasks/${taskId}/pomodoro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed })
        });
        if (res.ok) {
            const updated = await res.json();
            // Sync specific task
            const idx = state.tasks.findIndex(t => t.taskId === taskId);
            if (idx !== -1) {
                state.tasks[idx] = updated;
                if (state.activeTaskId === taskId) {
                    if (updated.taskStatus === 'COMPLETED') {
                        defeatBoss(updated);
                    } else {
                        dealDamageVisual(completed);
                        updateBossHP(updated.currentHP / updated.maxHP, updated);
                    }
                }
                renderTasks();
            }
        }
    } catch (e) { console.error("Record pomo error:", e); }
}

function dealDamageVisual(isCrit) {
    const dmg = isCrit ? 100 : 40;
    spawnDamage(isCrit ? `💥 HIT! -${dmg}` : `-${dmg}`, isCrit ? 'crit' : 'normal');
    const bossEl = document.getElementById('boss-emoji');
    if (bossEl) {
        bossEl.classList.remove('hit');
        void bossEl.offsetWidth;
        bossEl.classList.add('hit');
        setTimeout(() => bossEl.classList.remove('hit'), 400);
    }
}

// ──────────────────────────────────────────────
// MODE
// ──────────────────────────────────────────────
function switchMode(mode, btn) {
  pauseTimer();
  state.mode     = mode;
  state.timeLeft = MODES[mode].secs;
  state.totalSecs = MODES[mode].secs;

  document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const lbl = document.getElementById('session-type-label');
  if (lbl) lbl.textContent = MODES[mode].label;

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
    const idx = (state.sessionNum - 1) % 4;
    if (i === idx)    el.className = 'pomo-dot active';
    else if (i < idx) el.className = 'pomo-dot done';
    else              el.className = 'pomo-dot';
  }
}

// ──────────────────────────────────────────────
// BOSS SYSTEM
// ──────────────────────────────────────────────
function updateBossHP(pct, task) {
  const bar   = document.getElementById('boss-hp-bar');
  const hpTxt = document.getElementById('boss-hp-text');
  const bossEl = document.getElementById('boss-emoji');
  const aura   = document.getElementById('boss-aura');

  if (bar)   bar.style.width = `${Math.max(0, pct * 100)}%`;

  const total = task.estimatedPomodoros;
  const left  = task.remainingPomodoros;
  const dots  = Array.from({length: total}, (_, i) => i < left ? '●' : '○').join(' ');
  if (hpTxt) hpTxt.textContent = dots;

  if (bossEl) {
    const bossIdx = state.tasks.indexOf(task) % BOSS_EMOJIS.full.length;
    if (pct > .66)     bossEl.textContent = BOSS_EMOJIS.full[bossIdx];
    else if (pct > .33) bossEl.textContent = BOSS_EMOJIS.damaged[bossIdx];
    else               { bossEl.textContent = BOSS_EMOJIS.critical[bossIdx]; flashScreen('flash-red'); }
  }

  if (aura) {
    if (pct > .66)      aura.style.background = 'radial-gradient(circle, rgba(124,58,237,.25) 0%, transparent 70%)';
    else if (pct > .33) aura.style.background = 'radial-gradient(circle, rgba(245,158,11,.3) 0%, transparent 70%)';
    else                aura.style.background = 'radial-gradient(circle, rgba(239,68,68,.35) 0%, transparent 70%)';
  }

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
  toast(`🏆 Quest "${task.taskTitle}" conquered! +120 XP!`);

  state.stats.bossDefeated++;
  state.stats.powerScore += 20;
  addXP(XP_PER_QUEST);

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
  const pct = task.currentHP / task.maxHP;

  document.getElementById('boss-emoji').textContent = BOSS_EMOJIS.full[idx];
  document.getElementById('boss-name-label').textContent = task.taskTitle.toUpperCase().slice(0, 20);
  document.getElementById('boss-label').textContent = '⚔ BATTLE IN PROGRESS';
  document.getElementById('aq-name').textContent = task.taskTitle;
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

async function addTask() {
  const title = document.getElementById('task-name-inp').value.trim();
  if (!title) { shakeEl('task-name-inp'); return; }

  const priMap = { high: 3, medium: 2, low: 1 };
  const req = {
    taskTitle: title,
    taskPriority: priMap[currentPri],
    estimatedPomodoros: currentPomos
  };

  try {
      const res = await fetch(`${API_BASE}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req)
      });
      if (res.ok) {
          await syncTasks();
          document.getElementById('task-modal-overlay').classList.add('hidden');
          toast(`⚔️ Quest "${title}" added!`);
      }
  } catch (e) { console.error("Add task error:", e); }
}

function selectTask(id) {
  if (state.running) {
    toast('⚠️ Pause the timer before switching quests!');
    return;
  }
  state.activeTaskId = id;
  const task = state.tasks.find(t => t.taskId === id);
  if (task) {
    activateBoss(task);
    setActivePomoDot();
    flashScreen('flash-purple');
  }
  renderTasks();
}

async function deleteTask(id, e) {
  e.stopPropagation();
  try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
          if (state.activeTaskId === id) { state.activeTaskId = null; resetBossArena(); }
          await syncTasks();
      }
  } catch (e) { console.error("Delete error:", e); }
}

function renderTasks() {
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-tasks');
  const activeTasks = state.tasks.filter(t => t.taskStatus === 'ACTIVE');
  const doneTasks   = state.tasks.filter(t => t.taskStatus === 'COMPLETED');

  if (state.tasks.length === 0) {
    listEl.innerHTML = '';
    listEl.appendChild(emptyEl);
    emptyEl.style.display = '';
    return;
  }
  emptyEl.style.display = 'none';

  const render = (tasks) => tasks.map(task => {
    const isActive = task.taskId === state.activeTaskId;
    const isDone = task.taskStatus === 'COMPLETED';
    const done     = task.estimatedPomodoros - task.remainingPomodoros;
    const priMapRev = { 3:'high', 2:'medium', 1:'low' };
    const priStr = priMapRev[task.taskPriority] || 'low';
    const priCls   = `pri-${priStr}`;
    const pomoDots = Array.from({length: task.estimatedPomodoros}, (_, i) =>
      `<span class="pomo-badge ${i < done ? 'done-p' : ''}">🍅</span>`
    ).join('');

    return `
      <div class="task-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}"
           onclick="selectTask(${task.taskId})">
        <div class="task-top">
          <div class="task-check">
            ${isDone ? '✓' : ''}
          </div>
          <div class="task-name">${escHtml(task.taskTitle)}</div>
          <button class="task-delete" onclick="deleteTask(${task.taskId}, event)">✕</button>
        </div>
        <div class="task-meta">
          <span class="priority-badge ${priCls}">
            ${priStr === 'high' ? '🔥' : priStr === 'medium' ? '⚡' : '🧊'} 
            ${priStr.toUpperCase()}
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
  }
  state.stats.lastDate = today;
  document.getElementById('streak-count').textContent = state.stats.streak;
}

// ──────────────────────────────────────────────
// STATS PANEL
// ──────────────────────────────────────────────
function updateStatsPanel() {
  const s = state.stats;
  bumpStat('sc-sessions', 's-sessions', s.sessions);
  bumpStat('sc-time',     's-time',     s.focusMin + 'm');
  bumpStat('sc-quests',   's-quests',   s.bossDefeated);
  const score = computeScore();
  s.powerScore = score;
  bumpStat('sc-score', 's-score', score);

  const pct = Math.min(100, score);
  const offset = PROD_CIRC * (1 - pct / 100);
  const ring = document.getElementById('prod-prog');
  if (ring) {
    ring.style.strokeDashoffset = offset;
    const color = pct >= 80 ? '#f59e0b' : pct >= 60 ? '#a78bfa' : pct >= 40 ? '#10b981' : '#3b82f6';
    ring.style.stroke = color;
  }
  const pctEl = document.getElementById('prod-pct');
  if (pctEl) pctEl.textContent = pct + '%';

  const rank = RANKS.slice().reverse().find(r => pct >= r.min) || RANKS[0];
  const rankEl = document.getElementById('rank-label');
  if (rankEl) { rankEl.textContent = rank.label; rankEl.style.color = rank.color; }
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
    ? state.tasks.filter(t => t.taskStatus === 'COMPLETED').length / state.tasks.length
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
    if (s.sessions >= 4) insights.push({ ico: '⚡', text: `You've done ${s.sessions} sessions today. Impressive hero!` });
    if (s.streak >= 3) insights.push({ ico: '🔥', text: `${s.streak}-day streak! Consistency is your superpower.` });
    if (s.energy <= 2 && s.energy > 0) insights.push({ ico: '😴', text: 'Energy is low. Consider a longer break or a walk.' });
    if (s.energy >= 4) insights.push({ ico: '⚡', text: 'High energy! Perfect time for your hardest quest.' });
    const stalledTasks = state.tasks.filter(t => t.taskStatus === 'ACTIVE' && t.remainingPomodoros === t.estimatedPomodoros && t.estimatedPomodoros > 4);
    if (stalledTasks.length > 0) insights.push({ ico: '⚠️', text: `"${stalledTasks[0].taskTitle}" looks heavy — try splitting it!` });
    const completionRate = state.tasks.length > 0 ? (state.tasks.filter(t => t.taskStatus === 'COMPLETED').length / state.tasks.length * 100).toFixed(0) : 0;
    if (completionRate >= 80) insights.push({ ico: '🏆', text: `${completionRate}% quest completion! Legendary!` });
    if (insights.length === 0) insights.push({ ico: '⚔️', text: 'Keep fighting! Select a quest and defeat your next boss.' });
  }
  container.innerHTML = insights.map(i => `<div class="insight-item"><span class="ins-ico">${i.ico}</span><span>${i.text}</span></div>`).join('');
}

// ──────────────────────────────────────────────
// CALENDAR
// ──────────────────────────────────────────────
function renderCalendar() {
  const grid  = document.getElementById('calendar-grid');
  const month = document.getElementById('cal-month');
  if (!grid) return;
  const today = new Date();
  if (month) month.textContent = today.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  grid.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const div = document.createElement('div');
    div.className = 'calendar-day d0';
    grid.appendChild(div);
  }
}

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function todayKey() { return new Date().toISOString().split('T')[0]; }
function spawnDamage(txt, type) {
  const el = document.createElement('div');
  el.className = `dmg-float ${type}`;
  el.textContent = txt;
  const rect = document.getElementById('boss-emoji').getBoundingClientRect();
  el.style.left = (rect.left + rect.width/2 + (Math.random()*40-20)) + 'px';
  el.style.top  = (rect.top + rect.height/2 + (Math.random()*40-20)) + 'px';
  document.getElementById('dmg-layer').appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
function flashScreen(cls) {
  const el = document.getElementById('screen-flash');
  el.className = 'screen-flash ' + cls;
  el.style.opacity = '1';
  setTimeout(() => el.style.opacity = '0', 400);
}
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
function shakeEl(id) {
  const el = document.getElementById(id);
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 400);
}
function launchConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#f59e0b', '#10b981'] });
}
function escHtml(s) {
  const t = document.createElement('div');
  t.textContent = s;
  return t.innerHTML;
}

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  load();
});
