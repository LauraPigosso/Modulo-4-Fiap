/* =====================================================
   cards.js - organizado e comentado por blocos
   - Contém dois módulos principais:
     1) card4line (grid de 4) - render + carousel mobile
     2) cardwide (card horizontal grande)
   - Dependências: nenhum obrigatório (fetch para data/games.json).
     Opcional: jQuery + Bootstrap para inicializar carousel se presente.
=====================================================*/

(function () {
  /* ---------------------------
     CONFIG / CONSTANTES GLOBAIS
  ----------------------------*/
  const GRID_BREAKPOINT = 1024; // largura em px para trocar grid -> carousel

  /* ---------------------------
     UTILIDADES GERAIS
     (escape, formatação de preço, desconto)
  ----------------------------*/
  function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function formatPrecoFull(raw) {
    if (raw == null || raw === "") return "";
    const s = String(raw).trim();
    const num = parseFloat(
      s
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    );
    if (!isNaN(num) && num === 0) return "Grátis";
    if (/R\$\s*/i.test(s)) return s;
    if (!isNaN(num)) {
      return "R$ " + num.toFixed(2).replace(".", ",");
    }
    return "R$ " + s;
  }

  function formatPrecoJustNumber(raw) {
    if (raw == null || raw === "") return null;
    const s = String(raw).trim();
    const num = parseFloat(
      s
        .replace(/\s/g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    );
    return isNaN(num) ? null : num;
  }

  function formatDesconto(raw) {
    if (raw == null) return "";
    const s = String(raw).trim();
    if (s.includes("%")) return s;
    if (s.includes(".")) {
      const n = parseFloat(s);
      if (!isNaN(n)) return Math.round(n * 100) + "%";
    }
    const n = parseInt(s.replace(/\D/g, ""), 10);
    if (!isNaN(n)) return n + "%";
    return s;
  }

  function hasDesconto(raw) {
    if (raw == null) return false;
    const s = String(raw).trim();
    const found = parseInt(s.replace(/\D/g, ""), 10);
    return !isNaN(found) && found !== 0;
  }

  /* -------------------------------------------------
     markupCard - cria o HTML string para um card4line
     - Regras: mostra badge, preco antigo (riscado) e preco final
  --------------------------------------------------*/
  function markupCard(jogo) {
    const titulo = escapeHtml(jogo.titulo || "");
    const imagem = escapeHtml(jogo.imagem_header || "");
    const pagina = escapeHtml(jogo.pagina_loja || "#");
    const alt = escapeHtml(jogo.alt || "")

    const descontoRaw = jogo.desconto;
    const temDesconto = hasDesconto(descontoRaw);

    const precoDisplay = formatPrecoFull(jogo.preco);
    const precoNum = formatPrecoJustNumber(jogo.preco);

    const precoComRaw = jogo.preco_com_desconto != null ? jogo.preco_com_desconto : jogo.preco;

    const precoComDisplay = formatPrecoFull(precoComRaw);

    const isGratis = precoNum === 0;

    const badgeHtml =
      temDesconto && !isGratis
        ? `<span class="badge badge-success mb-2 align-self-start card4line-jogo-desconto">
           ${formatDesconto(descontoRaw)}
         </span>`
        : "";

    const precoOriginalHtml =
      temDesconto && !isGratis
        ? `<span class="text-muted text-line-through mr-2 card4line-jogo-preco">
           ${escapeHtml(precoDisplay)}
         </span>`
        : "";

    const precoFinalHtml = `
    <span class="font-weight-bold h5 mb-0 card4line-jogo-preco-desconto">
      ${escapeHtml(temDesconto ? precoComDisplay : precoDisplay)}
    </span>
  `;

    return `
    <a href="${pagina}" class="card4line-link-wrapper" aria-label="Abrir página de ${titulo}">
      <div class="card4line-card card shadow bg-dark text-light border-0">
        
        <img src="${imagem}"
             alt="${alt}"
             class="card-img-top card4line-imagem"
             loading="lazy">

        <div class="card-body p-3 d-flex flex-column card4line-conteudo">

          <div class="card4line-jogo-titulo h5 font-weight-bold mb-2">
            ${titulo}
          </div>

          ${isGratis ? "" : badgeHtml}

          <div class="d-flex align-items-center card4line-jogo-precos">
            ${isGratis ? "" : precoOriginalHtml}
            ${precoFinalHtml}
          </div>

        </div>

      </div>
    </a>
  `;
  }

  /* -------------------------------------------------
     initBlock: inicializa um único bloco (.card4line)
     - Suporta grid desktop e carousel mobile
  --------------------------------------------------*/
  function initBlock(gridContainer, wrapper, index, jogos) {
    const slotContainers = gridContainer.querySelectorAll("div[id]");

    function renderGrid() {
      gridContainer.style.display = "";
      if (wrapper) wrapper.classList.add("d-none");
      if (wrapper) wrapper.innerHTML = "";

      slotContainers.forEach((slot) => {
        const jogo = jogos.find((j) => j.id === slot.id);
        slot.innerHTML = jogo ? markupCard(jogo) : `<div class="text-danger text-center">Jogo não encontrado</div>`;
      });
    }

    function renderCarousel() {
      gridContainer.style.display = "none";
      if (!wrapper) return;
      wrapper.classList.remove("d-none");
      wrapper.innerHTML = "";

      const jogosOrdenados = Array.from(slotContainers)
        .map((slot) => jogos.find((j) => j.id === slot.id))
        .filter(Boolean);

      const itemsHtml = jogosOrdenados
        .map(
          (jogo, i) => `
          <div class="card4line-carousel-item ${i === 0 ? "active" : ""}">
            ${markupCard(jogo)}
          </div>
        `
        )
        .join("");

      const carouselId = `card4lineBootstrapCarousel_${index}`;
      wrapper.innerHTML = `
        <div id="${carouselId}" class="carousel slide card4line-carousel" data-ride="carousel" data-interval="false">
          <div class="carousel-inner">${itemsHtml}</div>
        </div>
      `;

      // Tenta inicializar o carousel do Bootstrap se disponível (não é obrigatório)
      try {
        $(`#${carouselId}`).carousel({ interval: false, wrap: false, touch: true });
      } catch {}

      // Implementa arraste nativo para a faixa do carousel (mouse + touch)
      const carouselInner = wrapper.querySelector(`#${carouselId} .carousel-inner`);
      let isDown = false,
        startX = 0,
        scrollLeft = 0;

      carouselInner.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX;
        scrollLeft = carouselInner.scrollLeft;
      });

      window.addEventListener("mouseup", () => (isDown = false));

      carouselInner.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const walk = e.pageX - startX;
        carouselInner.scrollLeft = scrollLeft - walk;
      });

      carouselInner.addEventListener("touchstart", (e) => {
        startX = e.touches[0].pageX;
        scrollLeft = carouselInner.scrollLeft;
      });

      carouselInner.addEventListener("touchmove", (e) => {
        const walk = e.touches[0].pageX - startX;
        carouselInner.scrollLeft = scrollLeft - walk;
      });
    }

    function renderMode() {
      if (window.innerWidth <= GRID_BREAKPOINT) renderCarousel();
      else renderGrid();
    }

    // render inicial + debounce em resize
    renderMode();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderMode, 180);
    });
  }

  /* -------------------------------------------------
     main(): carrega JSON e configura blocos card4line
     - Ajusta --card4line-row-gap inline por bloco (dinâmica)
  --------------------------------------------------*/
  function main() {
    fetch("data/games.json")
      .then((r) => r.json())
      .then((jogos) => {
        let grids = Array.from(document.querySelectorAll(".card4line, #card4line"));
        let wrappers = Array.from(document.querySelectorAll(".card4lineCarouselWrapper, #card4lineCarouselWrapper"));

        grids.forEach((grid, idx) => {
          // conte quantos slots (cards) existem neste bloco
          const slotCount = grid.querySelectorAll("div[id]").length;

          // calcula número de linhas (4 por linha)
          const rows = Math.ceil(slotCount / 4);

          // decide row-gap baseado em rows ou slotCount
          // ajuste estes valores conforme sua preferência
          let rowGap = "25px"; // padrão
          if (slotCount > 4 && slotCount <= 8) rowGap = "20px";
          else if (slotCount > 8 && slotCount <= 12) rowGap = "12px";
          else if (slotCount > 12) rowGap = "10px";

          // aplica no bloco (inline style) — afeta apenas este bloco
          grid.style.setProperty("--card4line-row-gap", rowGap);

          // --- wrapper existente ou criar novo ---
          let wrapper = wrappers[idx];
          if (!wrapper || wrapper.previousElementSibling !== grid) {
            const created = document.createElement("div");
            created.className = "card4lineCarouselWrapper d-none";
            grid.parentNode.insertBefore(created, grid.nextSibling);

            wrappers = Array.from(document.querySelectorAll(".card4lineCarouselWrapper, #card4lineCarouselWrapper"));
            wrapper = wrappers[idx];
          }

          // inicia o bloco
          initBlock(grid, wrapper, idx, jogos);
        });
      })
      .catch((err) => console.error("Erro carregando JSON:", err));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();
})();

/* =======================================================================
   js/cards.js — Módulo cardwide (separado para clareza)
   - Entrypoint: quando DOM pronto, carrega data/games.json e monta cardwide
   - Funções auxiliares de normalização e render
   ======================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/games.json")
    .then((resp) => {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    })
    .then((raw) => {
      const games = cardwideNormalizeJson(raw);
      cardwideMountFromMap(games);
    })
    .catch((err) => {
      console.error("cardwide -> erro carregando data/games.json:", err);
    });
});

/* =========================
   cardwideNormalizeJson
   - Aceita { games: {...} } ou [ {...}, {...} ] ou {id: {...}}
   - Retorna mapa id -> jogo
   ========================= */
function cardwideNormalizeJson(raw) {
  if (!raw) return {};
  if (raw.games && typeof raw.games === "object") return raw.games;
  if (Array.isArray(raw)) {
    const map = {};
    raw.forEach((item) => {
      if (item && item.id) map[item.id] = item;
    });
    return map;
  }
  if (typeof raw === "object") {
    // assume já é um mapa id -> jogo
    return raw;
  }
  console.warn("cardwide -> formato JSON inesperado; usando objeto vazio.");
  return {};
}

/* =========================
   cardwideMountFromMap
   - Encontra #cardwide-section e monta os cards nas divs com id dentro dela
   ========================= */
function cardwideMountFromMap(gamesMap) {
  const section = document.getElementById("cardwide-section");
  if (!section) {
    console.error("cardwide -> section #cardwide-section não encontrada no DOM.");
    return;
  }

  // seleciona apenas as divs com id (na ordem em que aparecem no DOM)
  const divs = Array.from(section.querySelectorAll("div[id]"));
  if (!divs.length) {
    console.warn('cardwide -> nenhum <div id="..."> encontrado dentro de #cardwide-section.');
    return;
  }

  divs.forEach((div) => {
    const id = div.id;
    if (!id) return;

    const rawGame = gamesMap[id];
    if (!rawGame) {
      console.warn(`cardwide -> jogo com id "${id}" não encontrado em data/games.json — pulando.`);
      return;
    }

    const game = cardwidePrepareGameFields(rawGame);
    const html = cardwideRenderCard(game);
    div.innerHTML = html;
    div.classList.add("cardwide-item-wrapper");
    div.style.padding = "0";
    const article = div.querySelector(".cardwide-item");
    if (article && game.image) {
      // aplica a imagem de fundo inline (escape simples)
      article.style.backgroundImage = `url('${cardwideEscapeAttr(game.image)}')`;
    }
  });
}

/* =========================
   Helpers de parsing/formatação para cardwide
   - cardwideLooksLikeFreeString
   - cardwideParseBRLToNumber
   - cardwidePrepareGameFields
   ========================= */
function cardwideLooksLikeFreeString(s) {
  if (!s) return false;
  return String(s).toLowerCase().includes("grat");
}

function cardwideParseBRLToNumber(s) {
  if (typeof s === "number") return s;
  if (!s || typeof s !== "string") return NaN;
  const cleaned = s.replace(/[^\d.,-]/g, "").trim();
  if (cleaned === "") return NaN;
  if (cleaned.indexOf(".") > -1 && cleaned.indexOf(",") > -1) {
    const tmp = cleaned.replace(/\./g, "").replace(",", ".");
    const n = Number(tmp);
    return isFinite(n) ? n : NaN;
  }
  if (cleaned.indexOf(",") > -1 && cleaned.indexOf(".") === -1) {
    const tmp = cleaned.replace(",", ".");
    const n = Number(tmp);
    return isFinite(n) ? n : NaN;
  }
  const n = Number(cleaned);
  return isFinite(n) ? n : NaN;
}

function cardwidePrepareGameFields(game) {
  const g = Object.assign({}, game);
  const nf = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  const precoNum = cardwideParseBRLToNumber(g.preco);
  const precoComNum = cardwideParseBRLToNumber(g.preco_com_desconto);

  const isFreeByNumber = (typeof precoNum === "number" && !isNaN(precoNum) && precoNum === 0) || (typeof precoComNum === "number" && !isNaN(precoComNum) && precoComNum === 0);
  const isFreeByString = cardwideLooksLikeFreeString(g.preco) || cardwideLooksLikeFreeString(g.preco_com_desconto);
  const isFree = isFreeByNumber || isFreeByString;

  let descontoIsNumber = false;
  let descontoValueNum = NaN;
  if (typeof g.desconto === "number") {
    descontoIsNumber = true;
    descontoValueNum = g.desconto;
  } else if (typeof g.desconto === "string") {
    const maybe = g.desconto
      .replace(/[^\d,-]/g, "")
      .replace(",", ".")
      .trim();
    const parsed = maybe === "" ? NaN : Number(maybe);
    if (!isNaN(parsed)) {
      descontoIsNumber = true;
      descontoValueNum = parsed;
    }
  }

  const precoComEqualsPrecoNum = (() => {
    if (!isNaN(precoNum) && !isNaN(precoComNum)) return precoNum === precoComNum;
    if (typeof g.preco === "string" && typeof g.preco_com_desconto === "string") {
      const a = g.preco.replace(/\s/g, "").replace(/R\$/gi, "").replace(/\./g, "").replace(/,/g, ".");
      const b = g.preco_com_desconto.replace(/\s/g, "").replace(/R\$/gi, "").replace(/\./g, "").replace(/,/g, ".");
      return a === b;
    }
    return false;
  })();

  if (isFree) {
    g.preco_com_desconto_formatted = "Grátis";
    g.preco_formatted = "";
    g.desconto_label = null;
  } else if (precoComEqualsPrecoNum) {
    if (!isNaN(precoComNum)) g.preco_com_desconto_formatted = nf.format(precoComNum);
    else if (!isNaN(precoNum)) g.preco_com_desconto_formatted = nf.format(precoNum);
    else g.preco_com_desconto_formatted = g.preco_com_desconto || g.preco || "";

    g.preco_formatted = "";
    g.desconto_label = null;
  } else {
    if (!isNaN(precoComNum)) g.preco_com_desconto_formatted = nf.format(precoComNum);
    else g.preco_com_desconto_formatted = g.preco_com_desconto || "";

    if (!isNaN(precoNum)) g.preco_formatted = nf.format(precoNum);
    else g.preco_formatted = g.preco || "";

    if (descontoIsNumber && !isNaN(descontoValueNum) && descontoValueNum > 0) {
      g.desconto_label = `${descontoValueNum}%`;
    } else if (typeof g.desconto === "string" && g.desconto.trim()) {
      g.desconto_label = g.desconto.trim();
    } else {
      g.desconto_label = null;
    }
  }

  g.titulo = g.titulo || "";
  g.descricao_curta = g.descricao_curta || g.descricao_resumida || g.descricao || "";

  if (Array.isArray(g.genero)) g.genero_raw = g.genero.join(" ");
  else g.genero_raw = g.genero || "";
  g.genero_words = g.genero_raw
    .split(/[\s,·|\/\\]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  g.image = g.imagem_header || g.image_header || g.image || "";
  if (g.alt && typeof g.alt === "string" && g.alt.trim()) {
    g.alt_text = g.alt.trim();
  } else if (g.image_alt && typeof g.image_alt === "string" && g.image_alt.trim()) {
    g.alt_text = g.image_alt.trim();
  } else if (g.titulo && g.titulo.trim()) {
    g.alt_text = `Capa do jogo ${g.titulo.trim()}`;
  } else {
    g.alt_text = "Capa do jogo";
  }

  g.pagina_loja = g.pagina_loja || g.pagina || "#";
  g.id = g.id || (g.titulo ? cardwideSlugify(g.titulo) : "");

  g.preco_formatted = g.preco_formatted || "";
  g.preco_com_desconto_formatted = g.preco_com_desconto_formatted || "";

  g.__isFree = !!isFree;
  g.__priceEqual = !!precoComEqualsPrecoNum;

  return g;
}

/* =========================
   sanitize / escape helpers
  ========================= */
function cardwideEscapeHTML(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function cardwideEscapeAttr(s) {
  // versão segura para URL dentro do style backgroundImage
  return String(s || "")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "");
}

/* =========================
   cardwideRenderGenreBadges
  ========================= */
function cardwideRenderGenreBadges(words) {
  if (!words || !words.length) return "";
  return words.map((w) => `<span class="cardwide-genre-badge">${cardwideEscapeHTML(w)}</span>`).join("");
}

/* =========================
   cardwideRenderCard -> retorna HTML do cardwide
  ========================= */
function cardwideRenderCard(g) {
  const hasOldPriceValue = !!g.preco_formatted && g.preco_formatted.trim() !== "";
  const precoDifferent = !(g.preco_formatted && g.preco_com_desconto_formatted && g.preco_formatted === g.preco_com_desconto_formatted);
  const showOldPrice = !g.__isFree && hasOldPriceValue && (precoDifferent || !!g.desconto_label);

  const href = g.pagina_loja && String(g.pagina_loja).trim() ? cardwideEscapeHTML(g.pagina_loja) : "#";
  const descontoBadgeHtml = g.desconto_label ? `<div class="cardwide-discount-badge">${cardwideEscapeHTML(g.desconto_label)}</div>` : "";

  return `
    <a class="cardwide-link" href="${href}">
      <article class="cardwide-item" role="article" aria-labelledby="${cardwideEscapeHTML(g.id)}-title" data-cardwide-isfree="${g.__isFree ? 1 : 0}" data-cardwide-showold="${
    showOldPrice ? 1 : 0
  }">
        ${descontoBadgeHtml}
        <div class="cardwide-body">
          <div class="cardwide-content">
            <h3 class="cardwide-title" id="${cardwideEscapeHTML(g.id)}-title">${cardwideEscapeHTML(g.titulo)}</h3>
            <p class="cardwide-desc">${cardwideEscapeHTML(g.descricao_curta)}</p>

            <div class="cardwide-genre-wrap">${cardwideRenderGenreBadges(g.genero_words)}</div>

            <div class="cardwide-price-block">
              ${showOldPrice ? `<div class="preco-antigo">${cardwideEscapeHTML(g.preco_formatted)}</div>` : ""}
              <div class="preco-desconto">${cardwideEscapeHTML(g.preco_com_desconto_formatted)}</div>
            </div>
          </div>

          <span class="cardwide-sr-only" role="img" aria-label="${cardwideEscapeHTML(g.alt_text)}"></span>
        </div>
      </article>
    </a>
  `;
}

/* =========================
   cardwideSlugify
  ========================= */
function cardwideSlugify(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/* =======================================================================
   FIM do js/cards.js (card4line + cardwide)
   ======================================================================= */
