/**
 * ============================================================================
 * SCRIPT PRINCIPAL — ELITE LEADERS
 * ============================================================================
 * Gerencia:
 * 1. Injeção da configuração central (js/config.js)
 * 2. Ícones Lucide
 * 3. Menu Mobile e barra fixa de conversão no celular
 * 4. Acordeão de Perguntas Frequentes (FAQ)
 * 5. Eventos de conversão preparados para Meta Pixel e Google Analytics (GA4)
 * 6. Modais de Política de Privacidade, Termos de Uso e aviso de placeholder
 */

(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};

  /**
   * 1. Aplica os textos e links vindos do arquivo js/config.js
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
    const whatsappUrl = config.whatsappGroupUrl || "#pre-lancamento-whatsapp";

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

    // Atualiza SEO e Open Graph dinamicamente caso o nome da marca mude
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

    // Atualiza todos os botões de WhatsApp em um único lugar
    const isRealWhatsappUrl =
      whatsappUrl &&
      whatsappUrl !== "#pre-lancamento-whatsapp" &&
      !whatsappUrl.startsWith("#");

    document.querySelectorAll("[data-whatsapp-cta]").forEach((btn) => {
      btn.setAttribute("href", whatsappUrl);
      if (isRealWhatsappUrl) {
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener noreferrer");
      }
    });

    // Atualiza link do Instagram
    if (config.instagramUrl) {
      document.querySelectorAll("[data-instagram-link]").forEach((link) => {
        link.setAttribute("href", config.instagramUrl);
      });
    }

    // Atualiza link e número do WhatsApp de dúvidas no rodapé
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

    // Renderiza mídias reais se configuradas em js/config.js
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
      founderVideoContainer.innerHTML = createVideoMarkup(
        config.media.founderVideoUrl,
        `Mensagem de ${founderName}`
      );
    }

    // Imagens de fundo dos cards da Seção 4 ("O Que Você Vai Aprender")
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
   * 3. Inicializa Meta Pixel e Google Analytics (GA4) apenas se os IDs existirem
   */
  function initAnalytics() {
    if (!config.analytics) return;

    const { metaPixelId, googleAnalyticsId } = config.analytics;

    if (metaPixelId && metaPixelId.trim() !== "") {
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
      window.fbq("init", metaPixelId.trim());
      window.fbq("track", "PageView");
      /* eslint-enable */
    }

    if (googleAnalyticsId && googleAnalyticsId.trim() !== "") {
      const gaId = googleAnalyticsId.trim();
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", gaId);
    }
  }

  function trackCtaClick(location) {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {
        content_name: config.brandName || "ELITE Leaders",
        content_category: "Grupo Pre-Lancamento WhatsApp",
        cta_location: location
      });
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", {
        event_category: "whatsapp_prelaunch",
        event_label: location
      });
    }
  }

  /**
   * 4. Interações de Navegação Mobile e Barra Fixa Mobile
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
   * 5. Acordeão da Seção 7 (Perguntas Frequentes)
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
   * 6. Gerenciamento de Cliques nos CTAs e Modais
   */
  function initModalsAndCtas() {
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

    document.querySelectorAll("[data-whatsapp-cta]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const location = btn.getAttribute("data-cta-location") || "page";
        trackCtaClick(location);

        const href = btn.getAttribute("href") || "";
        if (!href || href === "#pre-lancamento-whatsapp" || href.startsWith("#")) {
          e.preventDefault();
          openModal(
            "Grupo de Pré-Lançamento no WhatsApp",
            `
              <p><strong>Link em configuração:</strong> O endereço oficial do grupo de pré-lançamento no WhatsApp será inserido aqui antes da publicação.</p>
              <p>Para configurar o link definitivo em todos os botões da página de uma só vez, basta abrir o arquivo <code>js/config.js</code> e preencher o campo <code>whatsappGroupUrl</code>.</p>
            `
          );
        }
      });
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
          openModal(
            "Política de Privacidade",
            `
              <p>A <strong>${brand}</strong> respeita a sua privacidade e utiliza dados de navegação exclusivamente para melhorar a experiência na página e organizar a comunicação de pré-lançamento.</p>
              <p>Ao clicar para ingressar no grupo gratuito de pré-lançamento no WhatsApp, sua participação estará sujeita às configurações de privacidade do próprio aplicativo WhatsApp.</p>
              <p>Não comercializamos nem compartilhamos dados de contato de participantes com terceiros.</p>
            `
          );
        }

        if (type === "terms") {
          if (config.termsOfUseUrl && config.termsOfUseUrl.trim() !== "") {
            link.setAttribute("href", config.termsOfUseUrl);
            return;
          }
          e.preventDefault();
          openModal(
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

  removeHostingBadge();

  document.addEventListener("DOMContentLoaded", () => {
    removeHostingBadge();
    applySiteConfig();
    initAnalytics();
    initNavigation();
    initFaqAccordion();
    initModalsAndCtas();

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  });
})();
