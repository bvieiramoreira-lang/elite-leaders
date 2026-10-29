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
   * 1. Inicializa o Pixel da Meta uma única vez (sem duplicar base nem init/PageView)
   */
  function initMetaPixelOnce() {
    if (window.__ELITE_META_PIXEL_INITIALIZED__) return;
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
   * 2. Rastreamento de Conversão (Lead nos botões do grupo e Contact no suporte)
   */
  function initConversionTracking() {
    // 2.1 Botões do grupo do WhatsApp usando o seletor exigido: a[href*="chat.whatsapp.com"]
    const groupLinks = document.querySelectorAll('a[href*="chat.whatsapp.com"]');

    groupLinks.forEach((link) => {
      let isProcessingClick = false;

      link.addEventListener("click", (event) => {
        event.preventDefault();

        // Proteção contra duplo clique: no máximo 1 Lead por clique
        if (isProcessingClick) return;
        isProcessingClick = true;

        const targetUrl = link.getAttribute("href");
        const targetAttr = (link.getAttribute("target") || "").toLowerCase();
        const buttonLocation = link.getAttribute("data-button-location") || "pagina";

        try {
          if (typeof window.fbq === "function") {
            window.fbq("track", "Lead", {
              content_name: "Grupo Pre-Lancamento ELITE Leaders",
              content_category: "whatsapp_group",
              page_variant: "publico_frio_passo_a_passo",
              button_location: buttonLocation
            });
          }
        } catch (_) {
          // O botão NUNCA deixa de funcionar mesmo se o pixel falhar ou for bloqueado
        }

        if (targetAttr === "_blank") {
          window.open(targetUrl, "_blank", "noopener,noreferrer");
          setTimeout(() => {
            isProcessingClick = false;
          }, 1200);
        } else {
          setTimeout(() => {
            window.location.href = targetUrl;
            setTimeout(() => {
              isProcessingClick = false;
            }, 1000);
          }, 300);
        }
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
