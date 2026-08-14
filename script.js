// ===== Menú móvil =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('open');
  }
});

// ===== Contador animado del hero =====
const statFps = document.getElementById('statFps');
const FPS_TARGET = 60;
const COUNT_DURATION = 1200;

function animateFpsCounter() {
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / COUNT_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    statFps.textContent = '+' + Math.round(eased * FPS_TARGET);
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

animateFpsCounter();

// ===== Calculadora de eDPI =====
const dpiInput = document.getElementById('dpiInput');
const sensInput = document.getElementById('sensInput');
const calcBtn = document.getElementById('calcBtn');
const calcResult = document.getElementById('calcResult');
const edpiValue = document.getElementById('edpiValue');
const edpiMarker = document.getElementById('edpiMarker');
const edpiVerdict = document.getElementById('edpiVerdict');

// La barra representa 0–160 de eDPI; el rango pro (40–80) está pintado en CSS.
const BAR_MAX_EDPI = 160;
const PRO_MIN = 40;
const PRO_MAX = 80;

function calcularEdpi() {
  const dpi = parseFloat(dpiInput.value);
  const sens = parseFloat(sensInput.value);

  if (!dpi || !sens || dpi <= 0 || sens <= 0) {
    calcResult.hidden = false;
    edpiValue.textContent = '—';
    edpiVerdict.textContent = 'Introduce un DPI y una sensibilidad válidos.';
    edpiVerdict.className = 'edpi-verdict warn';
    return;
  }

  // eDPI en Fortnite: DPI × sensibilidad (%) / 100... pero la convención
  // habitual en la comunidad es DPI × sens% (ej. 800 × 8% = 64).
  const edpi = Math.round(dpi * (sens / 100) * 100) / 100;

  calcResult.hidden = false;
  edpiValue.textContent = edpi;

  const pos = Math.min(edpi / BAR_MAX_EDPI, 1) * 100;
  edpiMarker.style.left = `calc(${pos}% - 2px)`;

  if (edpi >= PRO_MIN && edpi <= PRO_MAX) {
    edpiVerdict.textContent = `✅ ${edpi} de eDPI está dentro del rango pro (${PRO_MIN}–${PRO_MAX}). Sensibilidad equilibrada para apuntar y editar.`;
    edpiVerdict.className = 'edpi-verdict ok';
  } else if (edpi < PRO_MIN) {
    edpiVerdict.textContent = `🐢 ${edpi} de eDPI es más bajo que el rango pro (${PRO_MIN}–${PRO_MAX}). Buena precisión, pero puede costarte girar rápido en peleas de cajas.`;
    edpiVerdict.className = 'edpi-verdict warn';
  } else {
    edpiVerdict.textContent = `⚡ ${edpi} de eDPI es más alto que el rango pro (${PRO_MIN}–${PRO_MAX}). Giros rápidos, pero la puntería fina sufre. Prueba a bajarla poco a poco.`;
    edpiVerdict.className = 'edpi-verdict warn';
  }
}

calcBtn.addEventListener('click', calcularEdpi);

[dpiInput, sensInput].forEach((input) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calcularEdpi();
  });
});
