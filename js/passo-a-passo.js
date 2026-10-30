/**
 * ============================================================================
 * SCRIPT DEDICADO — PÁGINA DE VENDAS PÚBLICO FRIO (/passo-a-passo)
 * ============================================================================
 * Gerencia:
 * 1. Pixel da Meta (ID 1664860865268299) com proteção contra duplicação
 * 2. Disparo de Lead em todos os links a[href*="chat.whatsapp.com"] com trava de duplo clique
 * 3. Disparo de Contact exclusivo no link de dúvidas (wa.me/554891787828)
 * 4. Barra fixa mobile após rolar além da primeira dobra
 * 5. Player de vídeo da Seção 5, Acordeão do FAQ e Modais Legais
 */

(function () {
  "use strict";

  const META_PIXEL_ID = "1664860865268299";

  /**
   * 1. Inicializa o Pixel da Meta uma única vez (sem duplicar se já iniciado no <head>)
   */
  function initMetaPixelOnce() {
    if (window.__ELITE_META_PIXEL_INITIALIZED__ || typeof window.fbq === "function") {
      window.__ELITE_META_PIXEL_INITIALIZED__ = true;
      return;
    }
    window.__ELITE_META_PIXEL_INITIALIZED__ = true;

    try {
      if (!window.fbq) {
        /* eslint-disable */
        !(function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        /* eslint-enable */
      }

      if (typeof window.fbq === "function") {
        window.fbq("init", META_PIXEL_ID);
        window.fbq("track", "PageView");
      }
    } catch (_) {
      // Silencia erros causados por bloqueadores de anúncios
    }
  }

  /**
   * Captura e persiste UTMs e IDs de clique de anúncio (Meta / Google)
   */
  function captureAndGetUtms() {
    const STORAGE_KEY = "elite_leaders_utms";
    const keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "gclid"
    ];

    let stored = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) || {};
    } catch (_) {}

    try {
      const params = new URLSearchParams(window.location.search);
      let updated = false;
      keys.forEach((k) => {
        const val = params.get(k);
        if (val && val.trim() !== "") {
          stored[k] = val.trim();
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      }
    } catch (_) {}

    return {
      utm_source: stored.utm_source || "direto",
      utm_medium: stored.utm_medium || "",
      utm_campaign: stored.utm_campaign || "",
      utm_content: stored.utm_content || "",
      utm_term: stored.utm_term || "",
      fbclid: stored.fbclid || "",
      gclid: stored.gclid || ""
    };
  }

  function formatPhoneMask(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function sendLeadToGoogleSheets(leadData) {
    const config = window.SITE_CONFIG || {};
    const webhookUrl = (config.googleSheetsWebhookUrl || "").trim();
    if (!webhookUrl) return;

    try {
      const bodyStr = JSON.stringify(leadData);
      fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: bodyStr
      }).catch(() => {});
    } catch (_) {
      // Nunca bloqueia o redirecionamento
    }
  }

  /**
   * 2. Rastreamento de Conversão (Modal de Captura -> Google Sheets + Lead -> WhatsApp)
   */
  function initConversionTracking() {
    captureAndGetUtms();

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
          <h3 class="lead-modal-title" id="lead-modal-title">Falta só um passo para entrar no grupo gratuito</h3>
          <p class="lead-modal-subtitle">Preencha seus dados abaixo para liberar seu acesso imediato ao grupo no WhatsApp:</p>
          <form class="lead-modal-form" id="lead-capture-form" novalidate>
            <div class="lead-form-group">
              <label class="lead-form-label" for="lead-input-name">Seu nome</label>
              <input type="text" id="lead-input-name" name="nome" class="lead-form-input" placeholder="Digite seu nome completo" autocomplete="name" required />
            </div>
            <div class="lead-form-group">
              <label class="lead-form-label" for="lead-input-email">Seu melhor e-mail</label>
              <input type="email" id="lead-input-email" name="email" class="lead-form-input" placeholder="seu@email.com" autocomplete="email" required />
            </div>
            <div class="lead-form-group">
              <label class="lead-form-label" for="lead-input-phone">Seu WhatsApp (com DDD)</label>
              <input type="tel" id="lead-input-phone" name="telefone" class="lead-form-input" placeholder="(00) 00000-0000" autocomplete="tel" inputmode="numeric" required />
            </div>
            <p class="lead-form-error" id="lead-form-error" hidden></p>
            <button type="submit" class="btn btn-gold lead-form-submit" id="lead-form-submit-btn">
              <span>IR PARA O GRUPO NO WHATSAPP</span>
            </button>
          </form>
          <p class="lead-modal-footer-note">Seus dados estão seguros. Você será redirecionado para o grupo oficial imediatamente.</p>
        </div>
      `;
      document.body.appendChild(leadModal);
    }

    const leadForm = document.getElementById("lead-capture-form");
    const leadNameInput = document.getElementById("lead-input-name");
    const leadEmailInput = document.getElementById("lead-input-email");
    const leadPhoneInput = document.getElementById("lead-input-phone");
    const leadErrorEl = document.getElementById("lead-form-error");
    const leadSubmitBtn = document.getElementById("lead-form-submit-btn");
    const leadCloseBtn = document.getElementById("lead-modal-close-btn");

    let activeGroupUrl = "https://chat.whatsapp.com/COnk3PsetVd3xpBVKX5qPV";
    let activeButtonLocation = "hero";
    let isSubmittingLead = false;

    function openLeadModal(targetUrl, location) {
      activeGroupUrl = targetUrl || "https://chat.whatsapp.com/COnk3PsetVd3xpBVKX5qPV";
      activeButtonLocation = location || "pagina";
      if (leadErrorEl) leadErrorEl.hidden = true;
      leadModal.hidden = false;
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (leadNameInput) leadNameInput.focus();
      }, 60);
    }

    function closeLeadModal() {
      leadModal.hidden = true;
      document.body.style.overflow = "";
    }

    if (leadCloseBtn) {
      leadCloseBtn.addEventListener("click", closeLeadModal);
    }

    leadModal.addEventListener("click", (e) => {
      if (e.target === leadModal) closeLeadModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !leadModal.hidden) {
        closeLeadModal();
      }
    });

    if (leadPhoneInput) {
      leadPhoneInput.addEventListener("input", (e) => {
        e.target.value = formatPhoneMask(e.target.value);
      });
    }

    if (leadForm) {
      leadForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (isSubmittingLead) return;

        const nome = (leadNameInput ? leadNameInput.value : "").trim();
        const email = (leadEmailInput ? leadEmailInput.value : "").trim();
        const telefone = (leadPhoneInput ? leadPhoneInput.value : "").trim();
        const phoneDigits = telefone.replace(/\D/g, "");

        if (nome.length < 2) {
          if (leadErrorEl) {
            leadErrorEl.textContent = "Por favor, informe seu nome.";
            leadErrorEl.hidden = false;
          }
          if (leadNameInput) leadNameInput.focus();
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          if (leadErrorEl) {
            leadErrorEl.textContent = "Por favor, informe um e-mail válido.";
            leadErrorEl.hidden = false;
          }
          if (leadEmailInput) leadEmailInput.focus();
          return;
        }

        if (phoneDigits.length < 10) {
          if (leadErrorEl) {
            leadErrorEl.textContent = "Por favor, informe seu WhatsApp com DDD.";
            leadErrorEl.hidden = false;
          }
          if (leadPhoneInput) leadPhoneInput.focus();
          return;
        }

        isSubmittingLead = true;
        if (leadErrorEl) leadErrorEl.hidden = true;
        if (leadSubmitBtn) {
          leadSubmitBtn.disabled = true;
          leadSubmitBtn.innerHTML = "<span>REDIRECIONANDO PARA O GRUPO...</span>";
        }

        const utms = captureAndGetUtms();
        const leadPayload = {
          data_hora: new Date().toLocaleString("pt-BR"),
          nome,
          email,
          telefone,
          pagina_tipo: "Fria",
          page_variant: "publico_frio_passo_a_passo",
          button_location: activeButtonLocation,
          utm_source: utms.utm_source,
          utm_medium: utms.utm_medium,
          utm_campaign: utms.utm_campaign,
          utm_content: utms.utm_content,
          utm_term: utms.utm_term,
          fbclid: utms.fbclid,
          gclid: utms.gclid,
          page_url: window.location.href,
          referrer: document.referrer || ""
        };

        // 1. Envia os dados e UTMs para a planilha Google Sheets
        sendLeadToGoogleSheets(leadPayload);

        // 2. Dispara o evento Lead no Pixel da Meta e GA4 (1 única vez por envio)
        try {
          if (typeof window.fbq === "function") {
            window.fbq("track", "Lead", {
              content_name: "Grupo Pre-Lancamento ELITE Leaders",
              content_category: "whatsapp_group",
              page_variant: "publico_frio_passo_a_passo",
              button_location: activeButtonLocation
            });
          }
        } catch (_) {}

        try {
          if (typeof window.gtag === "function") {
            window.gtag("event", "generate_lead", {
              event_category: "whatsapp_prelaunch",
              event_label: activeButtonLocation
            });
          }
        } catch (_) {}

        // 3. Redireciona para o grupo do WhatsApp após ~300ms
        setTimeout(() => {
          window.location.href = activeGroupUrl;
          setTimeout(() => {
            isSubmittingLead = false;
            if (leadSubmitBtn) {
              leadSubmitBtn.disabled = false;
              leadSubmitBtn.innerHTML = "<span>IR PARA O GRUPO NO WHATSAPP</span>";
            }
          }, 1500);
        }, 300);
      });
    }

    // 2.1 Botões do grupo do WhatsApp usando o seletor exigido: a[href*="chat.whatsapp.com"]
    const groupLinks = document.querySelectorAll('a[href*="chat.whatsapp.com"]');

    groupLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const targetUrl = link.getAttribute("href");
        const buttonLocation = link.getAttribute("data-button-location") || "pagina";
        openLeadModal(targetUrl, buttonLocation);
      });
    });

    // 2.2 Link de dúvidas (wa.me/554891787828) -> dispara APENAS Contact (NÃO dispara Lead)
    const supportLinks = document.querySelectorAll('a[href*="wa.me/554891787828"]');

    supportLinks.forEach((supportLink) => {
      let isContactLocked = false;

      supportLink.addEventListener("click", () => {
        if (isContactLocked) return;
        isContactLocked = true;

        try {
          if (typeof window.fbq === "function") {
            window.fbq("track", "Contact");
          }
        } catch (_) {
          // Segue normalmente se bloqueado
        }

        setTimeout(() => {
          isContactLocked = false;
        }, 1000);
      });
    });
  }

  /**
   * 3. Barra fixa no rodapé no mobile após rolar além da primeira dobra
   */
  function initStickyBar() {
    const stickyBar = document.getElementById("mobile-sticky-bar");
    const heroSection = document.getElementById("abertura");
    if (!stickyBar) return;

    const onScroll = () => {
      let passedFirstFold = window.scrollY > 480;
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        passedFirstFold = rect.bottom <= 80;
      }

      if (passedFirstFold) {
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

  /**
   * 4. Player de vídeo da Seção 5 (Quem é o Bruno)
   */
  function initFounderVideo() {
    const container = document.getElementById("founder-video-container");
    const videoEl = document.getElementById("founder-video-player");
    const posterOverlay = document.getElementById("founder-video-poster-overlay");

    if (!container || !videoEl || !posterOverlay) return;

    const startVideo = () => {
      posterOverlay.hidden = true;
      container.classList.add("is-playing");
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

  /**
   * 5. Acordeão de Perguntas Frequentes (todas fechadas por padrão)
   */
  function initFaqAccordion() {
    const triggers = document.querySelectorAll(".faq-trigger");

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const isExpanded = trigger.getAttribute("aria-expanded") === "true";
        const panel = trigger.nextElementSibling;

        triggers.forEach((other) => {
          if (other !== trigger) {
            other.setAttribute("aria-expanded", "false");
            if (other.nextElementSibling) {
              other.nextElementSibling.hidden = true;
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
   * 6. Modais de Política de Privacidade e Termos de Uso no Rodapé
   */
  function initLegalModals() {
    const modal = document.getElementById("site-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalCloseBtn = document.getElementById("modal-close-btn");

    function openModal(title, htmlContent) {
      if (!modal || !modalTitle || !modalBody) return;
      modalTitle.textContent = title;
      modalBody.innerHTML = htmlContent;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.hidden) {
        closeModal();
      }
    });

    document.querySelectorAll("[data-legal-trigger]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const type = link.getAttribute("data-legal-trigger");

        if (type === "privacy") {
          openModal(
            "Política de Privacidade",
            `
              <p>A <strong>ELITE Leaders</strong> respeita a sua privacidade e utiliza dados de navegação exclusivamente para melhorar a experiência na página e organizar a comunicação de pré-lançamento.</p>
              <p>Ao clicar para ingressar no grupo gratuito de pré-lançamento no WhatsApp, sua participação estará sujeita às configurações de privacidade do próprio aplicativo WhatsApp.</p>
              <p>Não comercializamos nem compartilhamos dados de contato de participantes com terceiros.</p>
            `
          );
        }

        if (type === "terms") {
          openModal(
            "Termos de Uso",
            `
              <p>Esta página tem caráter informativo e destina-se à captação de interessados para o grupo gratuito de pré-lançamento da comunidade <strong>ELITE Leaders</strong>, idealizada por <strong>Bruno Vieira</strong>.</p>
              <p>O ingresso no grupo de pré-lançamento do WhatsApp é gratuito e não gera obrigação de compra ou assinatura.</p>
              <p>As condições comerciais, valores da assinatura anual e regras de participação em encontros presenciais, visitas técnicas e eventos serão apresentados oficialmente no lançamento previsto para novembro de 2026.</p>
            `
          );
        }
      });
    });
  }

  function removeHostingBadge() {
    const clean = () => {
      document
        .querySelectorAll('#nl-badge-frame, #nl-hud-frame, iframe[title="Powered by Netlify"], iframe[title="Netlify"]')
        .forEach((el) => el.remove());
    };
    clean();
    const obs = new MutationObserver(clean);
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  initMetaPixelOnce();
  removeHostingBadge();

  document.addEventListener("DOMContentLoaded", () => {
    removeHostingBadge();
    initConversionTracking();
    initStickyBar();
    initFounderVideo();
    initFaqAccordion();
    initLegalModals();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  });
})();
