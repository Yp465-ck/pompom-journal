const STATE_KEY = 'ponpon-journal-state';
const CHATGPT_URL = 'https://chatgpt.com/g/g-p-699de305b37c8191aa8b27ebae2ef3dc-siyanarinkuyong/project';
const NOTION_URL = 'https://www.notion.so/yui0403/78c6e2fe3393445795a7604156695f3a?v=3113f8375e4a807ea930000c38a1b40b&source=copy_link';
const NLM_URL = 'https://notebooklm.google.com/notebook/e39ed8d6-83e9-440f-adc9-6a40d1c68d71';

const DEFAULT_STATE = {
  dailyLogs: [],
  weeklyReviews: [],
  monthlyExtractions: [],
  emotionalSessions: [],
  beliefCount: 0,
  setupCompleted: false,
};

let state = {};
let calendarMonth = new Date();
let calPopupDate = null;

// ==========================================
// Date Helpers (local timezone)
// ==========================================

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function today() {
  return toDateStr(new Date());
}

function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toDateStr(d);
}

function isSunday() {
  return new Date().getDay() === 0;
}

function isLastDayOfMonth() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getDate() === 1;
}

function getNextSunday() {
  const now = new Date();
  const days = (7 - now.getDay()) % 7;
  if (days === 0) return '今日';
  return `${days}日後`;
}

function getLastDayStr() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  if (now.getDate() === lastDay.getDate()) return '今日';
  return `${now.getMonth() + 1}/${lastDay.getDate()}`;
}

function formatDateForPopup(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

// ==========================================
// State Management
// ==========================================

function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    state = saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE };
  } catch {
    state = { ...DEFAULT_STATE };
  }
}

function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

// ==========================================
// Celebration Toast
// ==========================================

function showCelebration() {
  const el = document.getElementById('toast-overlay');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ==========================================
// Dashboard
// ==========================================

function renderDashboard() {
  renderDateDisplay();
  renderDailyCard();
  renderPeriodicSection();
  renderStats();
}

function renderDateDisplay() {
  const now = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  document.getElementById('date-display').textContent =
    `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日（${days[now.getDay()]}）`;
}

function renderDailyCard() {
  const card = document.getElementById('daily-card');
  const done = state.dailyLogs.includes(today());

  if (done) {
    card.className = 'daily-card completed';
    card.innerHTML = `
      <div class="daily-info">
        <div class="daily-title">✅ 今日のジャーナリング完了！</div>
        <div class="daily-sub">吐き出した言葉が未来の武器になる</div>
      </div>
      <button class="task-check checked" onclick="toggleDailyToday()">✓</button>
    `;
  } else {
    card.className = 'daily-card';
    card.innerHTML = `
      <div class="daily-info">
        <div class="daily-title">📓 AIに喋って、Notionに保存しよう</div>
        <div class="daily-sub"><a href="${CHATGPT_URL}" target="_blank">ChatGPTで喋る →</a>　<a href="${NOTION_URL}" target="_blank">Notionに保存する →</a></div>
      </div>
      <button class="task-check" onclick="toggleDailyToday()"></button>
    `;
  }
}

function renderPeriodicSection() {
  const container = document.getElementById('periodic-section');
  const todayStr = today();
  const sundayToday = isSunday();
  const lastDayToday = isLastDayOfMonth();
  const weeklyDone = state.weeklyReviews.includes(todayStr);
  const monthlyDone = state.monthlyExtractions.includes(todayStr);

  let html = '';

  // Weekly row
  if (sundayToday) {
    html += `
      <div class="periodic-row highlight-purple">
        <div class="periodic-left">
          <span class="periodic-icon">📊</span>
          <div>
            <div class="periodic-name">${weeklyDone ? '✅ 今週の週次振り返り完了' : '今日は週次振り返りの日'}</div>
            ${!weeklyDone ? `<div class="periodic-sub"><a href="${NLM_URL}" target="_blank" style="color:var(--accent-purple);text-decoration:none;font-weight:600;">NotebookLMへ →</a></div>` : ''}
          </div>
        </div>
        <button class="task-check${weeklyDone ? ' checked' : ''}" onclick="toggleWeeklyToday()">${weeklyDone ? '✓' : ''}</button>
      </div>
    `;
  } else {
    html += `
      <div class="periodic-row">
        <div class="periodic-left">
          <span class="periodic-icon">📊</span>
          <div><div class="periodic-name">週次振り返り</div><div class="periodic-sub">次回: 日曜日（${getNextSunday()}）</div></div>
        </div>
      </div>
    `;
  }

  // Monthly row
  if (lastDayToday) {
    html += `
      <div class="periodic-row highlight-green">
        <div class="periodic-left">
          <span class="periodic-icon">💡</span>
          <div>
            <div class="periodic-name">${monthlyDone ? '✅ 今月の信念抽出完了' : '今日は月次信念抽出の日'}</div>
            ${!monthlyDone ? `<div class="periodic-sub"><a href="${NLM_URL}" target="_blank" style="color:var(--accent-green);text-decoration:none;font-weight:600;">NotebookLMへ →</a></div>` : ''}
          </div>
        </div>
        <button class="task-check${monthlyDone ? ' checked' : ''}" onclick="toggleMonthlyToday()">${monthlyDone ? '✓' : ''}</button>
      </div>
    `;
  } else {
    html += `
      <div class="periodic-row">
        <div class="periodic-left">
          <span class="periodic-icon">💡</span>
          <div><div class="periodic-name">月次 信念抽出</div><div class="periodic-sub">次回: ${getLastDayStr()}</div></div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// Toggle Actions
// ==========================================

function toggleDailyToday() {
  toggleDateInArray('dailyLogs', today());
}

function toggleWeeklyToday() {
  toggleDateInArray('weeklyReviews', today());
}

function toggleMonthlyToday() {
  toggleDateInArray('monthlyExtractions', today());
}

function toggleDateInArray(key, dateStr) {
  const idx = state[key].indexOf(dateStr);
  if (idx >= 0) {
    state[key].splice(idx, 1);
  } else {
    state[key].push(dateStr);
    showCelebration();
  }
  saveState();
  renderDashboard();
  renderCalendar();
}

function completeEmotionalSession() {
  const d = today();
  if (!state.emotionalSessions.includes(d)) {
    state.emotionalSessions.push(d);
    saveState();
    showCelebration();
  }
  const btn = document.getElementById('btn-emotional-complete');
  if (btn) {
    btn.innerHTML = '✅ 壁打ち完了しました';
    btn.className = 'action-btn done full-width';
  }
}

// ==========================================
// Stats
// ==========================================

function renderStats() {
  const streak = calculateStreak();
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyCount = state.dailyLogs.filter(d => d.startsWith(monthPrefix)).length;

  document.getElementById('stat-streak').textContent = streak;
  document.getElementById('stat-monthly').textContent = monthlyCount;
  document.getElementById('stat-beliefs').textContent = state.beliefCount;
  document.getElementById('stat-weekly').textContent = state.weeklyReviews.length;
}

function calculateStreak() {
  if (state.dailyLogs.length === 0) return 0;
  const sorted = [...state.dailyLogs].sort().reverse();
  const todayStr = today();
  const yesterdayStr = getDateStr(-1);
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;
  let streak = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = new Date(sorted[i] + 'T00:00:00');
    const prev = new Date(sorted[i + 1] + 'T00:00:00');
    const diff = (current - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ==========================================
// Calendar
// ==========================================

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const title = document.getElementById('cal-title');
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  title.textContent = `${year}年${month + 1}月`;

  const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];
  let html = dayHeaders.map(d => `<div class="cal-day-header">${d}</div>`).join('');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today();

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-cell empty"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const hasDaily = state.dailyLogs.includes(dateStr);
    const hasWeekly = state.weeklyReviews.includes(dateStr);
    const hasMonthly = state.monthlyExtractions.includes(dateStr);

    const classes = ['cal-cell'];
    if (isToday) classes.push('today');
    if (hasMonthly) classes.push('monthly-done');
    else if (hasWeekly) classes.push('weekly-done');
    else if (hasDaily) classes.push('daily-done');

    const hasCheck = hasDaily || hasWeekly || hasMonthly;
    const checkHtml = hasCheck ? '<span class="cal-check">✓</span>' : '';

    const secondaryDots = [];
    if (hasDaily && (hasWeekly || hasMonthly)) secondaryDots.push('daily');
    if (hasWeekly && hasMonthly) secondaryDots.push('weekly');

    let dots = '';
    if (secondaryDots.length > 0) {
      dots = '<div class="cal-dots">' + secondaryDots.map(t => `<span class="cal-dot ${t}"></span>`).join('') + '</div>';
    }

    html += `<div class="${classes.join(' ')}" onclick="openCalPopup('${dateStr}')"><span>${day}</span>${checkHtml}${dots}</div>`;
  }

  grid.innerHTML = html;
}

// ==========================================
// Calendar Popup
// ==========================================

function openCalPopup(dateStr) {
  calPopupDate = dateStr;
  const overlay = document.getElementById('cal-popup-overlay');
  const dateEl = document.getElementById('cal-popup-date');
  const itemsEl = document.getElementById('cal-popup-items');

  dateEl.textContent = formatDateForPopup(dateStr);

  const items = [
    { key: 'dailyLogs', icon: '📓', label: '日次ジャーナリング' },
    { key: 'weeklyReviews', icon: '📊', label: '週次振り返り' },
    { key: 'monthlyExtractions', icon: '💡', label: '月次 信念抽出' },
  ];

  itemsEl.innerHTML = items.map(item => {
    const checked = state[item.key].includes(dateStr);
    return `
      <div class="cal-popup-item" onclick="toggleCalItem('${item.key}', '${dateStr}')">
        <span class="cal-popup-check${checked ? ' checked' : ''}">${checked ? '✓' : ''}</span>
        <span class="cal-popup-label">${item.icon} ${item.label}</span>
      </div>
    `;
  }).join('');

  overlay.classList.remove('hidden');
}

function closeCalPopup() {
  document.getElementById('cal-popup-overlay').classList.add('hidden');
  calPopupDate = null;
}

function toggleCalItem(key, dateStr) {
  const idx = state[key].indexOf(dateStr);
  if (idx >= 0) {
    state[key].splice(idx, 1);
  } else {
    state[key].push(dateStr);
    showCelebration();
  }
  saveState();
  renderDashboard();
  renderCalendar();
  openCalPopup(dateStr);
}

// ==========================================
// Copy to Clipboard
// ==========================================

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textEl = document.getElementById(targetId);
      if (!textEl) return;
      const text = textEl.textContent.trim();
      navigator.clipboard.writeText(text).then(() => showCopied(btn)).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showCopied(btn);
      });
    });
  });
}

function showCopied(btn) {
  btn.classList.add('copied');
  const original = btn.innerHTML;
  btn.innerHTML = '✅ コピーしました';
  setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = original; }, 2000);
}

// ==========================================
// Accordion
// ==========================================

function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.accordion').classList.toggle('open');
    });
  });
}

// ==========================================
// Emotion Trigger (navigation only)
// ==========================================

function initEmotionTrigger() {
  document.getElementById('emotion-trigger').addEventListener('click', () => {
    const el = document.getElementById('step15');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!el.classList.contains('open')) el.classList.add('open');
    }
  });
}

// ==========================================
// Onboarding
// ==========================================

let onboardingPage = 0;

function initOnboarding() {
  if (state.setupCompleted) {
    document.getElementById('onboarding-overlay').classList.add('hidden');
  }
}

function nextOnboardingPage() {
  document.getElementById(`onboarding-page-${onboardingPage}`).classList.add('hidden');
  document.getElementById(`dot-${onboardingPage}`).classList.remove('active');
  onboardingPage++;
  document.getElementById(`onboarding-page-${onboardingPage}`).classList.remove('hidden');
  document.getElementById(`dot-${onboardingPage}`).classList.add('active');
}

function completeOnboarding() {
  state.setupCompleted = true;
  saveState();
  document.getElementById('onboarding-overlay').classList.add('hidden');
}

// ==========================================
// Calendar Navigation
// ==========================================

function initCalendarNav() {
  document.getElementById('cal-prev').addEventListener('click', () => {
    calendarMonth.setMonth(calendarMonth.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calendarMonth.setMonth(calendarMonth.getMonth() + 1);
    renderCalendar();
  });
}

// ==========================================
// Calendar Popup: close on overlay tap
// ==========================================

function initCalPopupClose() {
  document.getElementById('cal-popup-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'cal-popup-overlay') closeCalPopup();
  });
}

// ==========================================
// Prompt expand/collapse
// ==========================================

function initPromptExpand() {
  document.querySelectorAll('.prompt-text').forEach(el => {
    if (el.scrollHeight > 210) {
      const block = el.closest('.prompt-block');
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'prompt-toggle';
      toggleBtn.textContent = '▼ 全文を表示';
      toggleBtn.addEventListener('click', () => {
        block.classList.toggle('expanded');
        toggleBtn.textContent = block.classList.contains('expanded') ? '▲ 折りたたむ' : '▼ 全文を表示';
      });
      block.insertBefore(toggleBtn, block.querySelector('.copy-btn'));
    }
  });
}

// ==========================================
// Step 2/3 completion buttons
// ==========================================

function addCompletionButtons() {
  addStepButton('step2-content', 'weeklyReviews', '✅ 週次レビュー完了');
  addStepButton('step3-content', 'monthlyExtractions', '✅ 月次信念抽出 完了');
}

function addStepButton(containerId, stateKey, label) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const btn = document.createElement('button');
  const done = state[stateKey].includes(today());
  btn.className = done ? 'action-btn done full-width' : 'action-btn complete full-width';
  btn.innerHTML = done ? '✅ 今日は完了済み' : label;
  btn.onclick = () => {
    toggleDateInArray(stateKey, today());
    const nowDone = state[stateKey].includes(today());
    btn.className = nowDone ? 'action-btn done full-width' : 'action-btn complete full-width';
    btn.innerHTML = nowDone ? '✅ 今日は完了済み' : label;
  };
  container.appendChild(btn);
}

// ==========================================
// Init
// ==========================================

function init() {
  loadState();
  initOnboarding();
  renderDashboard();
  renderCalendar();
  initAccordion();
  initCopyButtons();
  initEmotionTrigger();
  initCalendarNav();
  initCalPopupClose();
  initPromptExpand();
  addCompletionButtons();
}

document.addEventListener('DOMContentLoaded', init);
