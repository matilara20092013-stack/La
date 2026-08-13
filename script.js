/* ============================================================
   FortMacros XB — Interacciones
   ============================================================ */

// ===== Datos de presets: bind por botón del control =====
const PRESETS = {
  edicion: {
    nombre: "Edición Rápida",
    binds: {
      LT: "Apuntar (ADS)",
      RT: "Disparar",
      LB: "Rueda de objetos",
      RB: "Cambiar a construcción",
      LS: "Moverse / Click: esprintar",
      RS: "Mirar / Click: restablecer edición",
      DPAD: "Emotes y marcadores",
      Y: "Cambiar de arma",
      X: "Recargar / Interactuar",
      B: "Agacharse",
      A: "Saltar",
      P1: "Editar (= Y en modo construcción)",
      P2: "Confirmar edición (= RT)",
      P3: "Saltar (= A)",
      P4: "Agacharse (= B)"
    }
  },
  constructor: {
    nombre: "Constructor Pro+",
    binds: {
      LT: "Techo cono",
      RT: "Rampa",
      LB: "Piso",
      RB: "Muro",
      LS: "Moverse / Click: esprintar",
      RS: "Mirar / Click: editar",
      DPAD: "Emotes y marcadores",
      Y: "Cambiar de arma",
      X: "Interactuar / Recargar",
      B: "Agacharse",
      A: "Saltar",
      P1: "Editar (= click stick der.)",
      P2: "Confirmar edición (= RT)",
      P3: "Saltar (= A)",
      P4: "Rueda de objetos (= LB)"
    }
  },
  aim: {
    nombre: "Aim Fighter",
    binds: {
      LT: "Apuntar (ADS)",
      RT: "Disparar",
      LB: "Arma anterior",
      RB: "Arma siguiente",
      LS: "Moverse / Click: esprintar",
      RS: "Mirar / Click: golpe de pico",
      DPAD: "Marcadores rápidos",
      Y: "Modo construcción",
      X: "Recargar / Interactuar",
      B: "Agacharse / Deslizarse",
      A: "Saltar",
      P1: "Arma anterior (= LB)",
      P2: "Arma siguiente (= RB)",
      P3: "Saltar (= A)",
      P4: "Esprintar (= click stick izq.)"
    }
  }
};

let presetActivo = "constructor";

// ===== Navegación móvil =====
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");

navToggle.addEventListener("click", () => {
  const abierto = navMenu.classList.toggle("is-open");
  navToggle.classList.toggle("is-open", abierto);
  navToggle.setAttribute("aria-expanded", String(abierto));
});

navMenu.querySelectorAll("a").forEach((enlace) => {
  enlace.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ===== Animaciones de entrada =====
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll("[data-animate]").forEach((el) => observador.observe(el));

// ===== Contadores del hero =====
function animarContador(el) {
  const objetivo = Number(el.dataset.count);
  const duracion = 1200;
  const inicio = performance.now();

  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    el.textContent = Math.round(objetivo * progreso);
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

const observadorStats = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        animarContador(entrada.target);
        observadorStats.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat__number").forEach((el) => observadorStats.observe(el));

// ===== Mapeo interactivo =====
const nombrePresetEl = document.getElementById("mapa-preset-nombre");
const bindTitulo = document.getElementById("bind-titulo");
const bindDescripcion = document.getElementById("bind-descripcion");
const bindTabla = document.getElementById("bind-tabla");
const botonesPad = document.querySelectorAll(".pad__btn");
const botonesPreset = document.querySelectorAll("[data-preset]");

function pintarTabla() {
  const binds = PRESETS[presetActivo].binds;
  bindTabla.innerHTML = "";
  Object.entries(binds).forEach(([boton, accion]) => {
    const fila = document.createElement("div");
    fila.className = "row";
    fila.dataset.bind = boton;
    fila.innerHTML = `<b>${boton}</b><span>${accion}</span>`;
    bindTabla.appendChild(fila);
  });
}

function seleccionarBoton(boton) {
  const accion = PRESETS[presetActivo].binds[boton];
  bindTitulo.textContent = boton;
  bindDescripcion.textContent = accion || "Sin asignación en este preset.";

  botonesPad.forEach((b) => b.classList.toggle("is-active", b.dataset.bind === boton));
  bindTabla.querySelectorAll(".row").forEach((fila) => {
    fila.classList.toggle("is-active", fila.dataset.bind === boton);
  });
}

function cargarPreset(clave) {
  presetActivo = clave;
  nombrePresetEl.textContent = PRESETS[clave].nombre;
  botonesPreset.forEach((b) => b.classList.toggle("is-active", b.dataset.preset === clave));
  pintarTabla();
  bindTitulo.textContent = "Toca un botón";
  bindDescripcion.textContent =
    "Pulsa cualquier botón del control para ver qué hace en el preset activo. P1–P4 son las paletas traseras (Elite / remapeo en app Accesorios).";
  botonesPad.forEach((b) => b.classList.remove("is-active"));
}

botonesPad.forEach((boton) => {
  boton.addEventListener("click", () => seleccionarBoton(boton.dataset.bind));
});

botonesPreset.forEach((boton) => {
  boton.addEventListener("click", () => {
    cargarPreset(boton.dataset.preset);
    document.getElementById("mapeo").scrollIntoView({ behavior: "smooth" });
  });
});

cargarPreset("constructor");

// ===== Calculadora de sensibilidad =====
const sliders = [
  { id: "sens-x", out: "sens-x-val", etiqueta: "Mirar horizontal" },
  { id: "sens-y", out: "sens-y-val", etiqueta: "Mirar vertical" },
  { id: "sens-boost", out: "sens-boost-val", etiqueta: "Aceleración de giro" },
  { id: "dz-left", out: "dz-left-val", etiqueta: "Zona muerta stick izq." },
  { id: "dz-right", out: "dz-right-val", etiqueta: "Zona muerta stick der." }
];

const resumenEl = document.getElementById("sens-resumen");

function actualizarResumen() {
  const lineas = sliders.map(({ id, out, etiqueta }) => {
    const valor = document.getElementById(id).value;
    document.getElementById(out).textContent = valor + "%";
    return `${etiqueta.padEnd(26, " ")} ${valor}%`;
  });
  lineas.push(`${"Curva de respuesta".padEnd(26, " ")} Lineal`);
  lineas.push(`${"Turbo construcción".padEnd(26, " ")} Activada`);
  resumenEl.textContent = lineas.join("\n");
}

sliders.forEach(({ id }) => {
  document.getElementById(id).addEventListener("input", actualizarResumen);
});

actualizarResumen();

// ===== Copiar configuración =====
const btnCopiar = document.getElementById("copiar-config");
const msgCopiado = document.getElementById("copiado-msg");

btnCopiar.addEventListener("click", async () => {
  const texto = `FortMacros XB — Preset ${PRESETS[presetActivo].nombre}\n\n${resumenEl.textContent}`;
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const area = document.createElement("textarea");
    area.value = texto;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  msgCopiado.hidden = false;
  setTimeout(() => { msgCopiado.hidden = true; }, 2200);
});
