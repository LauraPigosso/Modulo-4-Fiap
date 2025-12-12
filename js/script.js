// Base: script de acessibilidade e nova lógica de carrossel (JS-driven).

const body = document.body;

// ---------- LEITURA EM VOZ ALTA (HOVER) ----------
let hoverReaderEnabled = JSON.parse(localStorage.getItem("hoverReaderEnabled") || "false");
const hoverToggleBtn = document.getElementById("toggle-hover-reader");

if (hoverToggleBtn) {
  hoverToggleBtn.setAttribute("aria-pressed", String(hoverReaderEnabled));
  hoverToggleBtn.textContent = `Leitura por Hover: ${hoverReaderEnabled ? "On" : "Off"}`;
}
let hoverTimer = null;
let lastSpoken = null;

function speakText(text) {
  if (!text || text.trim().length === 0) return;

  if (text !== lastSpoken) {
    speechSynthesis.cancel();
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  utter.rate = 1;
  utter.pitch = 1;
  speechSynthesis.speak(utter);
  lastSpoken = text;
}

document.body.addEventListener(
  "mouseenter",
  (e) => {
    if (!hoverReaderEnabled) return;
    const target = e.target;
    if (!target) return;

    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    hoverTimer = setTimeout(() => {
      const texto = target.innerText || target.alt || target.getAttribute("aria-label") || "";
      if (texto && texto.trim().length > 0) {
        speakText(texto.trim());
      }
    }, 1000);
  },
  true
);

document.body.addEventListener(
  "mouseleave",
  () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  },
  true
);

if (hoverToggleBtn) {
  hoverToggleBtn.addEventListener("click", () => {
    hoverReaderEnabled = !hoverReaderEnabled;
    hoverToggleBtn.setAttribute("aria-pressed", String(hoverReaderEnabled));
    hoverToggleBtn.classList.toggle("active", hoverReaderEnabled);
    hoverToggleBtn.textContent = `Leitura por Hover: ${hoverReaderEnabled ? "On" : "Off"}`;
    localStorage.setItem("hoverReaderEnabled", JSON.stringify(hoverReaderEnabled));
    if (!hoverReaderEnabled) speechSynthesis.cancel();
  });
}

// ---------- PAINEL DE ACESSIBILIDADE ----------
const a11yFloating = document.getElementById("a11y-floating");
const a11yToggle = document.getElementById("a11y-toggle");
const a11yCloseBtn = document.getElementById("a11y-close");

const toggleA11yPanel = (isOpen) => {
  if (isOpen === undefined) {
    isOpen = a11yFloating.getAttribute("aria-hidden") === "true";
  }
  const newHiddenState = !isOpen;

  a11yFloating.setAttribute("aria-hidden", String(newHiddenState));
  a11yToggle.setAttribute("aria-expanded", String(isOpen));
  a11yToggle.setAttribute("aria-label", isOpen ? "Fechar painel de acessibilidade" : "Abrir painel de acessibilidade");

  if (isOpen) {
    document.querySelector("#a11y-panel button")?.focus();
  }
};

if (a11yToggle) {
  a11yToggle.addEventListener("click", () => toggleA11yPanel());
}
if (a11yCloseBtn) {
  a11yCloseBtn.addEventListener("click", () => toggleA11yPanel(false));
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && a11yFloating.getAttribute("aria-hidden") === "false") {
    toggleA11yPanel(false);
    a11yToggle.focus();
  }
});

document.addEventListener("click", (e) => {
  const isPanelOpen = a11yFloating.getAttribute("aria-hidden") === "false";
  if (isPanelOpen && !a11yFloating.contains(e.target) && e.target !== a11yToggle) {
    toggleA11yPanel(false);
  }
});

// Funções de Aplicação de Acessibilidade (Texto, Visual, Fonte, Reset)
// (Mantidas para funcionalidade, removido código redundante da inicialização)

const textSizeBtns = document.querySelectorAll(".text-size");
const applyTextSize = (sizeKey) => {
  document.documentElement.classList.remove("text-size-normal", "text-size-medio", "text-size-grande");
  if (sizeKey === "normal") document.documentElement.classList.add("text-size-normal");
  if (sizeKey === "medio") document.documentElement.classList.add("text-size-medio");
  if (sizeKey === "grande") document.documentElement.classList.add("text-size-grande");
  localStorage.setItem("textSize", sizeKey);
};
textSizeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const sz = btn.getAttribute("data-size");
    applyTextSize(sz);
    textSizeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

const visualBtns = document.querySelectorAll(".visual");
const applyVisual = (visual) => {
  body.classList.remove("modo-claro", "modo-escuro", "alto-contraste", "monocromatico");

  if (visual === "claro") {
    body.classList.add("modo-claro");
  } else if (visual === "escuro") {
    body.classList.add("modo-escuro");
  } else if (visual === "alto-contraste") {
    body.classList.add("alto-contraste");
  } else if (visual === "monocromatico") {
    body.classList.add("monocromatico");
  }
  localStorage.setItem("tema", visual);
};

visualBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const visual = btn.getAttribute("data-visual");
    applyVisual(visual);
    visualBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

const fontBtns = document.querySelectorAll(".font-switch");
const applyFont = (fontKey) => {
  body.classList.remove("font-inter", "font-lexend", "font-baloo");
  if (fontKey === "inter") body.classList.add("font-inter");
  if (fontKey === "lexend") body.classList.add("font-lexend");
  if (fontKey === "baloo") body.classList.add("font-baloo");
  localStorage.setItem("font", fontKey);
};
fontBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.getAttribute("data-font");
    applyFont(f);
    fontBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

const resetBtn = document.getElementById("reset-a11y");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem("textSize");
    localStorage.removeItem("tema");
    localStorage.removeItem("font");
    localStorage.removeItem("hoverReaderEnabled");
    applyTextSize("normal");
    applyVisual("escuro");
    applyFont("system");
    hoverReaderEnabled = false;
    hoverToggleBtn.setAttribute("aria-pressed", "false");
    hoverToggleBtn.classList.remove("active");
    hoverToggleBtn.textContent = `Leitura por Hover: Off`;
    document.querySelectorAll(".a11y-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(`.text-size[data-size="normal"], .visual[data-visual="escuro"], .font-switch[data-font="system"]`).forEach((b) => b.classList.add("active"));
  });
}

// Lógica de carregamento de preferências na inicialização
const savedTextSize = localStorage.getItem("textSize") || "normal";
applyTextSize(savedTextSize);
document.querySelectorAll(`.text-size[data-size="${savedTextSize}"]`).forEach((b) => b.classList.add("active"));

const savedTheme = localStorage.getItem("tema") || "escuro";
applyVisual(savedTheme);
document.querySelectorAll(`.visual[data-visual="${savedTheme}"]`).forEach((b) => b.classList.add("active"));

const savedFont = localStorage.getItem("font") || "system";
applyFont(savedFont);
document.querySelectorAll(`.font-switch[data-font="${savedFont}"]`).forEach((b) => b.classList.add("active"));

// ---------- TORNAR CARDS CLICÁVEIS ----------
function initClickableCards() {
  const clickable = document.querySelectorAll(".card-jogo[tabindex], .card-lista-jogo[tabindex], .card-categoria");
  clickable.forEach((el) => {
    if (el.classList.contains("card-categoria")) {
      el.setAttribute("tabindex", "0");
    }
    el.addEventListener("click", (ev) => {
      const href = el.getAttribute("data-href") || el.closest("a")?.getAttribute("href") || "#";
      if (href && href !== "#") {
        window.location.href = href;
      }
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });
}

// #######################################################
// ---------- NOVO CARROSSEL JS-DRIVEN (LÓGICA ADAPTADA) ----------
// #######################################################

const carousels = {}; // Armazenamento global para instâncias de carrossel

function initCarousel(carouselId) {
  const container = document.getElementById(carouselId);
  if (!container) return;

  const track = container.querySelector(".carousel-track");
  const items = container.querySelectorAll(".carousel-item");
  const dotsContainer = document.getElementById(`dots-${carouselId}`);
  const navButtons = container.querySelectorAll(".carousel-nav");

  // Inicializa a instância
  const carousel = {
    id: carouselId,
    container: container,
    track: track,
    items: items,
    totalItems: items.length,
    currentIndex: 0,
    autoInterval: null,
    autoDelay: 3000, // 3 segundos
  };

  carousels[carouselId] = carousel;

  // 1. Cria os pontos de navegação dinamicamente
  dotsContainer.innerHTML = "";
  items.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.setAttribute("aria-label", `Ir para slide ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(carouselId, index));
    dotsContainer.appendChild(dot);
  });

  // 2. Configura a navegação manual
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = parseInt(button.getAttribute("data-nav"));
      moveCarousel(carouselId, direction);
    });
  });

  // 3. Inicia o carrossel na posição 0 e ativa o auto-slide
  updateCarousel(carouselId);
  startAutoSlide(carouselId);
}

function moveCarousel(carouselId, direction) {
  const carousel = carousels[carouselId];

  // Limpa e reinicia o auto-slide após interação manual
  clearInterval(carousel.autoInterval);

  carousel.currentIndex += direction;

  if (carousel.currentIndex < 0) {
    carousel.currentIndex = carousel.totalItems - 1;
  } else if (carousel.currentIndex >= carousel.totalItems) {
    carousel.currentIndex = 0;
  }

  updateCarousel(carouselId);

  // Reinicia o auto-slide
  startAutoSlide(carouselId);
}

function goToSlide(carouselId, index) {
  const carousel = carousels[carouselId];
  clearInterval(carousel.autoInterval);

  carousel.currentIndex = index;
  updateCarousel(carouselId);

  startAutoSlide(carouselId);
}

function updateCarousel(carouselId) {
  const carousel = carousels[carouselId];

  // Calcula o deslocamento e aplica a transição
  const offset = -carousel.currentIndex * 100;
  carousel.track.style.transform = `translateX(${offset}%)`;

  // Atualiza os pontos de navegação
  const dots = carousel.container.querySelectorAll(".carousel-dots .dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === carousel.currentIndex);
  });
}

function startAutoSlide(carouselId) {
  const carousel = carousels[carouselId];
  clearInterval(carousel.autoInterval); // Garantir que só há um intervalo ativo

  carousel.autoInterval = setInterval(() => {
    moveCarousel(carouselId, 1); // Move para o próximo slide
  }, carousel.autoDelay);
}

// ---------- INICIALIZAÇÃO GERAL ----------
document.addEventListener("DOMContentLoaded", () => {
  initClickableCards();

  // Inicializa o carrossel principal
  initCarousel("carousel-main");
});
