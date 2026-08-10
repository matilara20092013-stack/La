/* ==========================================================================
   GlobalRoute Consulting — Interactividad
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initScrollAnimations();
  initCounters();
  initForm();
  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ===== Menú móvil ===== */
function initMobileMenu() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Cierra el menú al pulsar un enlace (navegación por anclas)
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ===== Animaciones al hacer scroll (IntersectionObserver) ===== */
function initScrollAnimations() {
  const elements = document.querySelectorAll("[data-animate]");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ===== Contadores animados del hero ===== */
function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  const DURATION = 1800;

  const animate = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / DURATION, 1);
      // Easing out para que frene suavemente al final
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach((el) => {
      el.textContent = el.dataset.counter + (el.dataset.suffix || "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ===== Formulario / Simulador ===== */
function initForm() {
  const form = document.getElementById("expansion-form");
  const success = document.getElementById("form-success");
  const successDetail = document.getElementById("form-success-detail");
  const resetBtn = document.getElementById("form-reset");
  const requiredFields = ["nombre", "email", "producto", "origen", "destino"];

  const showError = (id, visible) => {
    const field = document.getElementById(id);
    const error = form.querySelector(`[data-error-for="${id}"]`);
    field.classList.toggle("is-invalid", visible);
    if (error) error.classList.toggle("is-visible", visible);
  };

  const validateField = (id) => {
    const field = document.getElementById(id);
    let valid = field.value.trim() !== "";
    if (valid && field.type === "email") {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }
    showError(id, !valid);
    return valid;
  };

  // Validación en vivo: limpia el error en cuanto el campo es válido
  requiredFields.forEach((id) => {
    const field = document.getElementById(id);
    const eventName = field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, () => {
      if (field.classList.contains("is-invalid")) validateField(id);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const allValid = requiredFields
      .map((id) => validateField(id))
      .every(Boolean);

    if (!allValid) {
      const firstInvalid = form.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Mensaje de éxito personalizado con los datos del simulador
    const nombre = document.getElementById("nombre").value.trim();
    const producto = document.getElementById("producto");
    const productoTexto = producto.options[producto.selectedIndex].text;
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;

    successDetail.textContent =
      `Gracias, ${nombre}. Hemos registrado tu solicitud para exportar ` +
      `${productoTexto.toLowerCase()} desde ${origen} hacia ${destino}. ` +
      `Nuestro equipo te contactará en menos de 48 horas con tu propuesta personalizada.`;

    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    requiredFields.forEach((id) => showError(id, false));
    success.hidden = true;
  });
}
