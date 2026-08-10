/* ===== DailyDrive — app logic ===== */

// ----- Mobile navigation (all pages) -----
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// ----- My Day planner (only on my-day.html) -----
const plannerRoot = document.getElementById('list-schedule');

if (plannerRoot) {
  const STORAGE_KEY = 'dailydrive-myday';
  const LIST_NAMES = ['schedule', 'materials', 'calls', 'money', 'errands'];

  const emptyState = () => ({
    priorities: ['', '', ''],
    notes: '',
    lists: { schedule: [], materials: [], calls: [], money: [], errands: [] }
  });

  let state = emptyState();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.lists) {
      state = { ...emptyState(), ...saved, lists: { ...emptyState().lists, ...saved.lists } };
    }
  } catch (e) { /* corrupted storage — start fresh */ }

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  // Today's date in the hero
  const dateEl = document.getElementById('today-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Progress bar counts every checkable item
  const progressFill = document.getElementById('progress-fill');
  const progressLabel = document.getElementById('progress-label');

  function updateProgress() {
    const items = LIST_NAMES.flatMap(name => state.lists[name]);
    const done = items.filter(item => item.done).length;
    const total = items.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    progressFill.style.width = pct + '%';
    if (total === 0) {
      progressLabel.textContent = 'Your day is a blank page — start writing it below!';
    } else if (done === total) {
      progressLabel.textContent = `All ${total} done — you are UNSTOPPABLE today! 🎉`;
    } else {
      progressLabel.textContent = `${done} of ${total} done — keep that momentum going!`;
    }
  }

  // Render one list
  function renderList(name) {
    const ul = document.getElementById('list-' + name);
    ul.innerHTML = '';
    const items = state.lists[name].slice();
    if (name === 'schedule') {
      items.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }
    items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'item' + (item.done ? ' item--done' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'item__check';
      check.checked = item.done;
      check.setAttribute('aria-label', 'Mark done');
      check.addEventListener('change', () => {
        item.done = check.checked;
        const original = state.lists[name].find(i => i.id === item.id);
        if (original) original.done = check.checked;
        save();
        renderList(name);
        updateProgress();
      });
      li.appendChild(check);

      if (name === 'schedule' && item.time) {
        const time = document.createElement('span');
        time.className = 'item__time';
        time.textContent = item.time;
        li.appendChild(time);
      }

      const text = document.createElement('span');
      text.className = 'item__text';
      text.textContent = item.text;
      li.appendChild(text);

      const del = document.createElement('button');
      del.className = 'item__delete';
      del.textContent = '✕';
      del.setAttribute('aria-label', 'Delete item');
      del.addEventListener('click', () => {
        state.lists[name] = state.lists[name].filter(i => i.id !== item.id);
        save();
        renderList(name);
        updateProgress();
      });
      li.appendChild(del);

      ul.appendChild(li);
    });
  }

  // Wire the add forms
  document.querySelectorAll('.add-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = form.dataset.list;
      const textInput = form.querySelector('.add-form__text');
      const timeInput = form.querySelector('.add-form__time');
      const text = textInput.value.trim();
      if (!text) return;
      state.lists[name].push({
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        text,
        time: timeInput ? timeInput.value : '',
        done: false
      });
      save();
      textInput.value = '';
      if (timeInput) timeInput.value = '';
      renderList(name);
      updateProgress();
      textInput.focus();
    });
  });

  // Priorities
  document.querySelectorAll('.priority-input').forEach(input => {
    const index = Number(input.dataset.priority);
    input.value = state.priorities[index] || '';
    input.addEventListener('input', () => {
      state.priorities[index] = input.value;
      save();
    });
  });

  // Notes
  const notes = document.getElementById('day-notes');
  notes.value = state.notes || '';
  notes.addEventListener('input', () => {
    state.notes = notes.value;
    save();
  });

  // Fresh day
  document.getElementById('new-day').addEventListener('click', () => {
    const sure = confirm('Start a fresh day? This clears your priorities, schedule, lists and notes.');
    if (!sure) return;
    state = emptyState();
    save();
    LIST_NAMES.forEach(renderList);
    document.querySelectorAll('.priority-input').forEach(i => { i.value = ''; });
    notes.value = '';
    updateProgress();
  });

  // Initial paint
  LIST_NAMES.forEach(renderList);
  updateProgress();
}
