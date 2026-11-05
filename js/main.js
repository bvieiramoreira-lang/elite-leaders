/**
 * ============================================================================
 * SCRIPT PRINCIPAL — ELITE LEADERS (PÚBLICO QUENTE — HOME)
 * ============================================================================
 * Gerencia:
 * 1. Injeção da configuração central (js/config.js)
 * 2. Captura de UTMs e fbclid em sessionStorage
 * 3. Modal de captura de leads antes do redirecionamento para o grupo do WhatsApp
 * 4. Eventos do Meta Pixel (ID 1664860865268299):
 *    - AbriuFormulario no clique dos botões do grupo
 *    - Correspondência Avançada Manual + Lead (com eventID) após envio válido
 *    - Contact exclusivo no link de dúvidas (wa.me/554891787828)
 * 5. Envio dos leads via POST para Google Apps Script (timeout máx. 3s)
 * 6. Menu Mobile, barra fixa mobile, FAQ e Modais Legais
 */

(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const META_PIXEL_ID = "1664860865268299";
  const PAGE_VARIANT = "publico_quente_home";
  const WHATSAPP_GROUP_URL =
    config.whatsappGroupUrl || "https://chat.whatsapp.com/COnk3PsetVd3xpBVKX5qPV";

  // CONSTANTE FÁCIL DE TROCAR — URL do Web App publicado no Google Apps Script:
  const GOOGLE_SHEETS_WEB_APP_URL =
    window.GOOGLE_SHEETS_WEB_APP_URL ||
    config.googleSheetsWebhookUrl ||
    "https://script.google.com/macros/s/AKfycbwotywcJA5pmAVyorNHKIHHfOrcyhcfDGaahHbVCnOruKxgeEBNv4D_RSXbqeeT_gL4Iw/exec";

  /**
   * 1. Aplica os textos e mídias vindos do arquivo js/config.js
   */
  function applySiteConfig() {
    const brandPrefix = config.brandPrefix || "ELITE";
    const brandHighlight = config.brandHighlight || "Leaders";
    const brandName = config.brandName || `${brandPrefix} ${brandHighlight}`;
    const brandTagline = config.brandTagline || "A Comunidade do Mercado Promocional";
    const founderName = config.founderName || "Bruno Vieira";
    const founderCompany = config.founderCompany || "Personaliza Brindes";
    const launchDateText = config.launchDateText || "LANÇAMENTO EM NOVEMBRO DE 2026";
    const copyrightYear = config.copyrightYear || "2026";

    document.querySelectorAll("[data-brand-prefix]").forEach((el) => {
      el.textContent = brandPrefix;
    });

    document.querySelectorAll("[data-brand-highlight]").forEach((el) => {
      el.textContent = brandHighlight;
    });

    document.querySelectorAll("[data-brand-name]").forEach((el) => {
      el.textContent = brandName;
    });

    document.querySelectorAll("[data-brand-tagline]").forEach((el) => {
      el.textContent = brandTagline;
    });

    document.querySelectorAll("[data-founder-name]").forEach((el) => {
      el.textContent = founderName;
    });

    document.querySelectorAll("[data-founder-company]").forEach((el) => {
      el.textContent = founderCompany;
    });

    document.querySelectorAll("[data-launch-badge]").forEach((el) => {
      el.textContent = launchDateText;
    });

    document.querySelectorAll("[data-copyright-year]").forEach((el) => {
      el.textContent = copyrightYear;
    });

    const fullTitle = `${brandName} | ${brandTagline}`;
    document.title = fullTitle;

    const ogSiteName = document.querySelector("[data-og-sitename]");
    if (ogSiteName) ogSiteName.setAttribute("content", brandName);

    const ogTitle = document.querySelector("[data-og-title]");
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    const twitterTitle = document.querySelector("[data-twitter-title]");
    if (twitterTitle) twitterTitle.setAttribute("content", fullTitle);

    if (config.media && config.media.openGraphImage) {
      const ogImg = document.querySelector("[data-og-image]");
      if (ogImg) ogImg.setAttribute("content", config.media.openGraphImage);
    }

    // Garante o href nos botões de grupo (o clique é interceptado para abrir o modal)
    document.querySelectorAll("[data-whatsapp-cta]").forEach((btn) => {
      btn.setAttribute("href", WHATSAPP_GROUP_URL);
      btn.removeAttribute("target");
    });

    if (config.instagramUrl) {
      document.querySelectorAll("[data-instagram-link]").forEach((link) => {
        link.setAttribute("href", config.instagramUrl);
      });
    }

    if (config.whatsappSupportUrl) {
      document.querySelectorAll("[data-whatsapp-support-link]").forEach((link) => {
        link.setAttribute("href", config.whatsappSupportUrl);
      });
    }
    if (config.whatsappSupportDisplay) {
      document.querySelectorAll("[data-whatsapp-support-text]").forEach((el) => {
        el.textContent = config.whatsappSupportDisplay;
      });
    }

    applyMediaSlots(brandName, founderName);
  }

  /**
   * 2. Atualiza as imagens/vídeos a partir de js/config.js
   */
  function applyMediaSlots(brandName, founderName) {
    if (!config.media) return;

    const heroContainer = document.getElementById("hero-media-container");
    const heroImg = document.getElementById("hero-cover-img");

    if (heroContainer) {
      if (config.media.heroVideoUrl) {
        heroContainer.innerHTML = `<div class="hero-cover-frame">${createVideoMarkup(
          config.media.heroVideoUrl,
          `Apresentação ${brandName}`
        )}</div>`;
      } else if (config.media.heroImage && heroImg) {
        heroImg.src = config.media.heroImage;
        heroImg.alt = `${founderName} — ${brandName}`;
      }
    }

    const founderImg = document.getElementById("founder-photo-img");
    if (founderImg && config.media.founderImage) {
      founderImg.src = config.media.founderImage;
      founderImg.alt = `${founderName} na Personaliza Brindes`;
    }

    const founderVideoContainer = document.getElementById("founder-video-container");
    if (founderVideoContainer && config.media.founderVideoUrl) {
      const url = config.media.founderVideoUrl;
      const isEmbed =
        url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");

      if (isEmbed) {
        founderVideoContainer.innerHTML = createVideoMarkup(url, `Mensagem de ${founderName}`);
      } else {
        const videoEl = document.getElementById("founder-video-player");
        const posterOverlay = document.getElementById("founder-video-poster-overlay");

        if (videoEl) {
          if (videoEl.getAttribute("src") !== url) {
            videoEl.setAttribute("src", url);
            videoEl.querySelectorAll("source").forEach((s) => s.setAttribute("src", url));
            videoEl.load();
          }

          if (posterOverlay) {
            const startVideo = () => {
              posterOverlay.hidden = true;
              founderVideoContainer.classList.add("is-playing");
              const playPromise = videoEl.play();
              if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
              }
            };

            posterOverlay.addEventListener("click", startVideo);
            posterOverlay.addEventListener("keydown", (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                startVideo();
              }
            });
          }
        } else {
          founderVideoContainer.innerHTML = createVideoMarkup(url, `Mensagem de ${founderName}`);
        }
      }
    }

    if (config.media.pillarImages) {
      document.querySelectorAll("[data-pillar-card]").forEach((card) => {
        const key = card.getAttribute("data-pillar-card");
        const imgUrl = config.media.pillarImages[key];
        if (imgUrl && imgUrl.trim() !== "") {
          card.style.backgroundImage = `url('${imgUrl}')`;
        }
      });
    }
  }

  function createVideoMarkup(url, title) {
    if (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com")) {
      return `<iframe class="configured-media-video" src="${url}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    }
    return `<video class="configured-media-video" src="${url}" controls preload="metadata" playsinline></video>`;
  }

  /**
   * 3. Captura e persiste UTMs e fbclid em sessionStorage (com try/catch)
   */
  function captureAndGetUtms() {
    const STORAGE_KEY = "elite_leaders_utms_session";
    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid"
    ];

    let stored = {};
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        stored = JSON.parse(raw) || {};
      }
    } catch (_) {}

    try {
      const params = new URLSearchParams(window.location.search);
      let updated = false;
      keys.forEach((k) => {
        const val = params.get(k);
        if (val !== null && val.trim() !== "") {
          stored[k] = val.trim();
          updated = true;
        }
      });
      if (updated) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      }
    } catch (_) {}

    return {
      utm_source: stored.utm_source || "",
      utm_medium: stored.utm_medium || "",
      utm_campaign: stored.utm_campaign || "",
      utm_content: stored.utm_content || "",
      utm_term: stored.utm_term || "",
      fbclid: stored.fbclid || ""
    };
  }

  /**
   * 4. Utilitários de Formatação e Validação
   */
  function formatPhoneMask(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length > 11 && digits.startsWith("55")) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);

    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function extractLocalPhoneDigits(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.length > 11 && digits.startsWith("55")) {
      digits = digits.slice(2);
    }
    return digits.slice(0, 11);
  }

  function removeAccents(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
  }

  function isValidBrazilianPhone(value) {
    const digits = extractLocalPhoneDigits(value);
    if (digits.length !== 10 && digits.length !== 11) return false;
    const ddd = parseInt(digits.slice(0, 2), 10);
    if (isNaN(ddd) || ddd < 11 || ddd > 99) return false;
    return true;
  }

  /**
   * 5. Resolve a posição do botão clicado dentro do padrão exigido:
   * header, hero, beneficios, passo_a_passo, pre_lancamento, faq, cta_final, footer, barra_fixa
   */
  function resolveButtonLocation(el) {
    const raw =
      el.getAttribute("data-button-location") ||
      el.getAttribute("data-cta-location") ||
      "";

    const locationMap = {
      "header": "header",
      "mobile-menu": "header",
      "hero": "hero",
      "comunidade": "beneficios",
      "beneficios": "beneficios",
      "passo_a_passo": "passo_a_passo",
      "pre-lancamento": "pre_lancamento",
      "pre_lancamento": "pre_lancamento",
      "faq": "faq",
      "cta_final": "cta_final",
      "footer": "footer",
      "mobile-sticky": "barra_fixa",
      "barra_fixa": "barra_fixa"
    };

    if (raw && locationMap[raw]) {
      return locationMap[raw];
    }

    if (el.closest("#mobile-sticky-bar")) return "barra_fixa";
    if (el.closest("header")) return "header";
    if (el.closest("#abertura")) return "hero";
    if (el.closest("#comunidade")) return "beneficios";
    if (el.closest("#passo-a-passo")) return "passo_a_passo";
    if (el.closest("#pre-lancamento")) return "pre_lancamento";
    if (el.closest("#faq")) return "faq";
    if (el.closest("#cta-final")) return "cta_final";
    if (el.closest("footer")) return "footer";
    return "hero";
  }

  /**
   * 6. Envia os dados do lead via POST para o Google Apps Script (com timeout de 3s)
   */
  function saveLeadToGoogleSheets(leadPayload) {
    const webhookUrl = String(
      window.GOOGLE_SHEETS_WEB_APP_URL ||
      (window.SITE_CONFIG && window.SITE_CONFIG.googleSheetsWebhookUrl) ||
      GOOGLE_SHEETS_WEB_APP_URL ||
      ""
    ).trim();

    if (!webhookUrl) {
      return Promise.resolve();
    }

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    let fetchPromise;
    try {
      fetchPromise = fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(leadPayload)
      }).catch(() => {});
    } catch (_) {
      fetchPromise = Promise.resolve();
    }

    return Promise.race([fetchPromise, timeoutPromise]);
  }

  /**
   * 7. Interações de Navegação Mobile e Barra Fixa Mobile
   */
  function initNavigation() {
    const toggleBtn = document.querySelector(".mobile-menu-toggle");
    const mobileDrawer = document.getElementById("mobile-nav");

    if (toggleBtn && mobileDrawer) {
      toggleBtn.addEventListener("click", () => {
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!isExpanded));
        mobileDrawer.hidden = isExpanded;
      });

      mobileDrawer.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          toggleBtn.setAttribute("aria-expanded", "false");
          mobileDrawer.hidden = true;
        });
      });
    }

    const stickyBar = document.getElementById("mobile-sticky-bar");
    if (stickyBar) {
      const onScroll = () => {
        if (window.scrollY > 420) {
          stickyBar.classList.add("is-visible");
          stickyBar.setAttribute("aria-hidden", "false");
        } else {
          stickyBar.classList.remove("is-visible");
          stickyBar.setAttribute("aria-hidden", "true");
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /**
   * 8. Acordeão da Seção 7 (Perguntas Frequentes)
   */
  function initFaqAccordion() {
    const triggers = document.querySelectorAll(".faq-trigger");

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const isExpanded = trigger.getAttribute("aria-expanded") === "true";
        const panel = trigger.nextElementSibling;

        triggers.forEach((otherTrigger) => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute("aria-expanded", "false");
            if (otherTrigger.nextElementSibling) {
              otherTrigger.nextElementSibling.hidden = true;
            }
          }
        });

        trigger.setAttribute("aria-expanded", String(!isExpanded));
        if (panel) {
          panel.hidden = isExpanded;
        }
      });
    });
  }

  /**
   * 9. Gerenciamento de Cliques nos CTAs, Modal de Formulário e Modais Legais
   */
  function initModalsAndCtas() {
    // Captura antecipada de UTMs e fbclid ao entrar na página
    captureAndGetUtms();

    const modal = document.getElementById("site-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    // Garante que o modal de captura de lead exista no DOM
    let leadModal = document.getElementById("lead-capture-modal");
    if (!leadModal) {
      leadModal = document.createElement("div");
      leadModal.id = "lead-capture-modal";
      leadModal.className = "lead-modal-backdrop";
      leadModal.hidden = true;
      leadModal.setAttribute("role", "dialog");
      leadModal.setAttribute("aria-modal", "true");
      leadModal.setAttribute("aria-labelledby", "lead-modal-title");
      leadModal.innerHTML = `
        <div class="lead-modal-card">
          <button type="button" class="lead-modal-close" id="lead-modal-close-btn" aria-label="Fechar">×</button>
          <span class="lead-modal-badge">GRUPO VIP DE PRÉ-LANÇAMENTO</span>
          <h3 class="lead-modal-title" id="lead-modal-title">Falta pouco para você entrar no grupo!</h3>
          <p class="lead-modal-subtitle">Preencha seus dados para acessar o grupo gratuito de pré-lançamento.</p>
          <form class="lead-modal-form" id="lead-capture-form" novalidate>
            <div class="lead-form-group">
              <label class="lead-form-label" for="lead-input-name">Nome</label>
              <input type="text" id="lead-input-name" name="nome" class="lead-form-input" placeholder="Seu nome" autocomplete="name" required />
              <span class="lead-field-error" id="lead-error-name" role="alert" hidden></span>
            </div>
            <div class="lead-form-group">
              <label class="lead-form-label" for="lead-input-email">E-mail</label>
              <input type="email" id="lead-input-email" name="email" class="lead-form-input" placeholder="Seu melhor e-mail" autocomplete="email" required />
              <span class="lead-field-error" id="lead-error-email" role="alert" hidden></span>
            </div>
            <div class="lead-form-group">
              <label class="lead-form-label" for="lead-input-phone">WhatsApp com DDD</label>
              <input type="tel" id="lead-input-phone" name="telefone" class="lead-form-input" placeholder="(11) 99999-9999" autocomplete="tel" inputmode="tel" maxlength="15" required />
              <span class="lead-field-error" id="lead-error-phone" role="alert" hidden></span>
            </div>
            <p class="lead-form-status" id="lead-form-status" role="status" hidden>Tudo certo! Redirecionando para o grupo...</p>
            <button type="submit" class="btn btn-gold lead-form-submit" id="lead-form-submit-btn">
              <span>ENTRAR NO GRUPO AGORA</span>
            </button>
          </form>
          <p class="lead-modal-footer-note">
            Seus dados estão seguros. Ao continuar, você concorda com a nossa <a href="#privacidade" class="lead-privacy-link" data-legal-trigger="privacy">Política de Privacidade</a>.
          </p>
        </div>
      `;
      document.body.appendChild(leadModal);
    }

    const leadForm = document.getElementById("lead-capture-form");
    const leadNameInput = document.getElementById("lead-input-name");
    const leadEmailInput = document.getElementById("lead-input-email");
    const leadPhoneInput = document.getElementById("lead-input-phone");
    const leadNameError = document.getElementById("lead-error-name");
    const leadEmailError = document.getElementById("lead-error-email");
    const leadPhoneError = document.getElementById("lead-error-phone");
    const leadStatusEl = document.getElementById("lead-form-status");
    const leadSubmitBtn = document.getElementById("lead-form-submit-btn");
    const leadCloseBtn = document.getElementById("lead-modal-close-btn");

    let activeGroupUrl = WHATSAPP_GROUP_URL;
    let activeButtonLocation = "hero";
    let isSubmittingLead = false;

    function setFieldError(inputEl, errorEl, message) {
      if (inputEl) inputEl.classList.add("is-invalid");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      }
    }

    function clearFieldError(inputEl, errorEl) {
      if (inputEl) inputEl.classList.remove("is-invalid");
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.hidden = true;
      }
    }

    function clearAllErrors() {
      clearFieldError(leadNameInput, leadNameError);
      clearFieldError(leadEmailInput, leadEmailError);
      clearFieldError(leadPhoneInput, leadPhoneError);
      if (leadStatusEl) leadStatusEl.hidden = true;
    }

    function openLeadModal(targetUrl, location) {
      activeGroupUrl = targetUrl || WHATSAPP_GROUP_URL;
      activeButtonLocation = location || "hero";
      clearAllErrors();
      leadModal.hidden = false;
      document.body.style.overflow = "hidden";

      // Dispara AbriuFormulario no Pixel da Meta
      try {
        if (typeof window.fbq === "function") {
          window.fbq("trackCustom", "AbriuFormulario", {
            page_variant: PAGE_VARIANT,
            button_location: activeButtonLocation
          });
        }
      } catch (_) {}

      setTimeout(() => {
        if (leadNameInput) leadNameInput.focus();
      }, 60);
    }

    function closeLeadModal() {
      if (isSubmittingLead) return;
      leadModal.hidden = true;
      if (!modal || modal.hidden) {
        document.body.style.overflow = "";
      }
    }

    if (leadCloseBtn) {
      leadCloseBtn.addEventListener("click", closeLeadModal);
    }

    leadModal.addEventListener("click", (e) => {
      if (e.target === leadModal) closeLeadModal();
    });

    if (leadNameInput) {
      leadNameInput.addEventListener("input", () => {
        clearFieldError(leadNameInput, leadNameError);
      });
    }

    if (leadEmailInput) {
      leadEmailInput.addEventListener("input", () => {
        clearFieldError(leadEmailInput, leadEmailError);
      });
    }

    if (leadPhoneInput) {
      leadPhoneInput.addEventListener("input", (e) => {
        e.target.value = formatPhoneMask(e.target.value);
        clearFieldError(leadPhoneInput, leadPhoneError);
      });
    }

    if (leadForm) {
      leadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isSubmittingLead) return;

        clearAllErrors();

        const nome = (leadNameInput ? leadNameInput.value : "").trim();
        const email = (leadEmailInput ? leadEmailInput.value : "").trim();
        const telefone = (leadPhoneInput ? leadPhoneInput.value : "").trim();

        let firstInvalidInput = null;

        if (nome.length < 2) {
          setFieldError(leadNameInput, leadNameError, "Por favor, informe seu nome.");
          if (!firstInvalidInput) firstInvalidInput = leadNameInput;
        }

        if (!isValidEmail(email)) {
          setFieldError(
            leadEmailInput,
            leadEmailError,
            "Por favor, informe um e-mail válido (ex.: voce@empresa.com)."
          );
          if (!firstInvalidInput) firstInvalidInput = leadEmailInput;
        }

        if (!isValidBrazilianPhone(telefone)) {
          setFieldError(
            leadPhoneInput,
            leadPhoneError,
            "Informe seu WhatsApp completo com DDD (10 ou 11 números)."
          );
          if (!firstInvalidInput) firstInvalidInput = leadPhoneInput;
        }

        if (firstInvalidInput) {
          firstInvalidInput.focus();
          return;
        }

        // Trava o botão e mostra "Enviando..."
        isSubmittingLead = true;
        if (leadSubmitBtn) {
          leadSubmitBtn.disabled = true;
          leadSubmitBtn.innerHTML = "<span>Enviando...</span>";
        }

        // Formatação para Correspondência Avançada Manual (Meta Pixel)
        const emailFormatado = email.toLowerCase().replace(/\s+/g, "");
        const localPhoneDigits = extractLocalPhoneDigits(telefone);
        const telefoneFormatado = "55" + localPhoneDigits;

        const cleanNameParts = removeAccents(nome.toLowerCase())
          .replace(/[^a-z\s]/g, " ")
          .split(/\s+/)
          .filter(Boolean);
        const primeiroNome = cleanNameParts[0] || "";
        const sobrenome =
          cleanNameParts.length > 1 ? cleanNameParts.slice(1).join(" ") : "";

        // ID único do evento Lead (para deduplicação com API de Conversões)
        const eventId =
          "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);

        // 1. Dispara Correspondência Avançada Manual + Evento Lead no Pixel da Meta
        try {
          if (typeof window.fbq === "function") {
            window.fbq("init", META_PIXEL_ID, {
              em: emailFormatado,
              ph: telefoneFormatado,
              fn: primeiroNome,
              ln: sobrenome,
              country: "br"
            });

            window.fbq(
              "track",
              "Lead",
              {
                content_name: "Grupo Pre-Lancamento ELITE Leaders",
                content_category: "whatsapp_group",
                page_variant: PAGE_VARIANT,
                button_location: activeButtonLocation
              },
              { eventID: eventId }
            );
          }
        } catch (_) {
          // Segue normalmente se bloqueador de anúncios impedir o fbq
        }

        // 2. Monta o payload com as colunas exatas da planilha
        const utms = captureAndGetUtms();
        const leadPayload = {
          data_hora: new Date().toLocaleString("pt-BR"),
          nome: nome,
          email: emailFormatado,
          telefone: telefone,
          pagina: PAGE_VARIANT,
          botao: activeButtonLocation,
          utm_source: utms.utm_source,
          utm_medium: utms.utm_medium,
          utm_campaign: utms.utm_campaign,
          utm_content: utms.utm_content,
          utm_term: utms.utm_term,
          fbclid: utms.fbclid,
          event_id: eventId
        };

        // Timeout de segurança absoluto para nunca travar o usuário
        let hasRedirected = false;
        const doRedirect = () => {
          if (hasRedirected) return;
          hasRedirected = true;
          window.location.href = activeGroupUrl;
        };

        const safetyFallbackTimer = setTimeout(doRedirect, 3400);

        // 3. Salva na planilha (aguarda no máximo 3 segundos)
        await saveLeadToGoogleSheets(leadPayload);

        // 4. Mostra mensagem rápida de confirmação e redireciona após ~400ms
        if (leadStatusEl) {
          leadStatusEl.textContent = "Tudo certo! Redirecionando para o grupo...";
          leadStatusEl.hidden = false;
        }
        if (leadSubmitBtn) {
          leadSubmitBtn.innerHTML = "<span>Tudo certo! Redirecionando para o grupo...</span>";
        }

        setTimeout(() => {
          clearTimeout(safetyFallbackTimer);
          doRedirect();
        }, 400);
      });
    }

    // Intercepta todos os botões que levam para o grupo (a[href*="chat.whatsapp.com"])
    document.querySelectorAll('a[href*="chat.whatsapp.com"]').forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const location = resolveButtonLocation(btn);
        const href = btn.getAttribute("href") || WHATSAPP_GROUP_URL;
        openLeadModal(href, location);
      });
    });

    // O link de dúvidas (wa.me/554891787828) dispara APENAS Contact e NÃO abre o modal
    document.querySelectorAll('a[href*="wa.me/554891787828"]').forEach((supportLink) => {
      let isContactLocked = false;

      supportLink.addEventListener("click", () => {
        if (isContactLocked) return;
        isContactLocked = true;

        try {
          if (typeof window.fbq === "function") {
            window.fbq("track", "Contact");
          }
        } catch (_) {}

        setTimeout(() => {
          isContactLocked = false;
        }, 1000);
      });
    });

    // Modais Legais (Política de Privacidade e Termos de Uso)
    function openLegalModal(title, htmlContent) {
      if (!modal || !modalTitle || !modalBody) return;
      modalTitle.textContent = title;
      modalBody.innerHTML = htmlContent;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeLegalModal() {
      if (!modal) return;
      modal.hidden = true;
      if (!leadModal || leadModal.hidden) {
        document.body.style.overflow = "";
      }
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeLegalModal);
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeLegalModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (modal && !modal.hidden) {
          closeLegalModal();
        } else if (leadModal && !leadModal.hidden) {
          closeLeadModal();
        }
      }
    });

    document.querySelectorAll("[data-legal-trigger]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const type = link.getAttribute("data-legal-trigger");
        const brand = config.brandName || "ELITE Leaders";

        if (type === "privacy") {
          if (config.privacyPolicyUrl && config.privacyPolicyUrl.trim() !== "") {
            link.setAttribute("href", config.privacyPolicyUrl);
            return;
          }
          e.preventDefault();
          openLegalModal(
            "Política de Privacidade",
            `
              <p>A <strong>${brand}</strong> respeita a sua privacidade e utiliza os dados fornecidos exclusivamente para organizar a comunicação e o acesso ao grupo de pré-lançamento.</p>
              <p>Ao ingressar no grupo gratuito de pré-lançamento no WhatsApp, sua participação estará sujeita às configurações de privacidade do próprio aplicativo WhatsApp.</p>
              <p>Não comercializamos nem compartilhamos seus dados de contato com terceiros.</p>
            `
          );
        }

        if (type === "terms") {
          if (config.termsOfUseUrl && config.termsOfUseUrl.trim() !== "") {
            link.setAttribute("href", config.termsOfUseUrl);
            return;
          }
          e.preventDefault();
          openLegalModal(
            "Termos de Uso",
            `
              <p>Esta página tem caráter informativo e destina-se à captação de interessados para o grupo gratuito de pré-lançamento da comunidade <strong>${brand}</strong>, idealizada por <strong>${config.founderName || "Bruno Vieira"}</strong>.</p>
              <p>O ingresso no grupo de pré-lançamento do WhatsApp é gratuito e não gera obrigação de compra ou assinatura.</p>
              <p>As condições comerciais, valores da assinatura anual e regras de participação em encontros presenciais, visitas técnicas e eventos serão apresentados oficialmente no lançamento previsto para novembro de 2026.</p>
            `
          );
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applySiteConfig();
    initNavigation();
    initFaqAccordion();
    initModalsAndCtas();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  });
})();
