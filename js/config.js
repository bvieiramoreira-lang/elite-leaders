/**
 * ============================================================================
 * CONFIGURAÇÃO CENTRAL DO PROJETO — ELITE LEADERS
 * ============================================================================
 * Altere as informações abaixo em um único lugar para atualizar toda a página
 * automaticamente (nome da marca, link do grupo de WhatsApp, redes sociais,
 * fotos/vídeos e IDs de rastreamento).
 */

window.SITE_CONFIG = {
  // 1. IDENTIDADE DA MARCA (Pode ser alterado facilmente sem reconstruir a página)
  brandPrefix: "ELITE",
  brandHighlight: "Leaders",
  brandName: "ELITE Leaders",
  brandTagline: "A Comunidade do Mercado Promocional",
  founderName: "Bruno Vieira",
  founderCompany: "Personaliza Brindes",
  launchDateText: "LANÇAMENTO EM NOVEMBRO DE 2026",
  copyrightYear: "2026",

  // 2. LINKS DE CONVERSÃO E REDES SOCIAIS
  whatsappGroupUrl: "https://chat.whatsapp.com/COnk3PsetVd3xpBVKX5qPV",
  instagramUrl: "https://www.instagram.com/brunopersonalizaa",
  whatsappSupportUrl: "https://wa.me/554891787828",
  whatsappSupportDisplay: "+55 48 9178-7828",

  // 3. LINKS LEGAIS (Se deixar vazio "", abrirá o modal integrado de Termos / Privacidade)
  privacyPolicyUrl: "",
  termsOfUseUrl: "",

  // 4. MÍDIAS (FOTOS E VÍDEOS REAIS EXTRAÍDOS DO MANUAL DA MARCA)
  media: {
    heroImage: "assets/hero-bg.png",           // Fundo em tela cheia da seção inicial com foto à direita
    heroVideoUrl: "",                          // Opcional: URL de vídeo na abertura
    founderImage: "assets/manual-page-3.png",  // Foto de Bruno Vieira (Página 3 do Manual da Logo)
    founderVideoUrl: "",                       // Opcional: Vídeo de apresentação de ~60s na Seção 5
    openGraphImage: "assets/manual-page-2.png",// Imagem de compartilhamento no WhatsApp

    // Imagens de fundo dos 6 cards da seção "O Que Você Vai Aprender"
    pillarImages: {
      vendas: "assets/vendas.png",
      marketing: "assets/marketing.png",
      producao: "assets/producao.png",
      fornecedores: "assets/fornecedores.png",
      gestao: "assets/gestao.png",
      maquinas: "assets/maquinas.png"
    }
  },

  // 5. INTEGRAÇÕES DE TRÁFEGO (Deixe vazio "" até configurar suas contas)
  analytics: {
    metaPixelId: "",           // Ex: "123456789012345"
    googleAnalyticsId: ""      // Ex: "G-XXXXXXXXXX"
  }
};
