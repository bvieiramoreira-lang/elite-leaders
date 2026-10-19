# ELITE LEADERS — A Comunidade do Mercado Promocional

Landing page de pré-lançamento desenvolvida para captação de empresários e profissionais do setor de brindes, personalizados e produtos promocionais para o **grupo gratuito de pré-lançamento no WhatsApp**.

---

## Como editar o projeto facilmente (em um único arquivo)

Todas as configurações principais estão centralizadas em [`js/config.js`](./js/config.js):

1. **Trocar o nome da comunidade (sem reconstruir a página):**
   Abra `js/config.js` e altere `brandName: "ELITE LEADERS"`. Todos os títulos, cabeçalho, textos, rodapé, SEO e Open Graph serão atualizados automaticamente.
2. **Inserir o link oficial do Grupo de WhatsApp:**
   Em `js/config.js`, substitua o valor de `whatsappGroupUrl` pelo link oficial (ex: `"https://chat.whatsapp.com/SEU_CODIGO"`). Todos os botões da página passarão a redirecionar para o grupo imediatamente.
3. **Adicionar as fotos e vídeos reais do Bruno Vieira e da Personaliza Brindes:**
   Coloque os arquivos dentro da pasta `assets/` e preencha os caminhos em `js/config.js`:
   - `media.heroImage`: Foto do Bruno Vieira na abertura (Seção 1)
   - `media.heroVideoUrl`: Vídeo opcional na abertura (Seção 1)
   - `media.founderImage`: Foto do Bruno Vieira na estrutura da Personaliza Brindes (Seção 5)
   - `media.founderVideoUrl`: Vídeo opcional de apresentação de ~60s (Seção 5)
   - `media.openGraphImage`: Imagem de pré-visualização ao compartilhar o link no WhatsApp
4. **Ativar Meta Pixel e Google Analytics (GA4):**
   Basta preencher `analytics.metaPixelId` e/ou `analytics.googleAnalyticsId` em `js/config.js`. Os cliques em qualquer botão de WhatsApp já disparam automaticamente o evento de conversão (`Lead` / `generate_lead`).

---

## Estrutura de Arquivos

```text
Elite Leaders/
├── index.html        # Estrutura semântica com as 7 seções, SEO, Open Graph e Schema FAQ
├── css/
│   └── styles.css    # Identidade visual em Azul-Marinho (#07172B / #102D4F) e Dourado (#C5A46D)
├── js/
│   ├── config.js     # Arquivo central para editar nome, link do WhatsApp, fotos e Pixel/GA4
│   └── main.js       # Interações (FAQ, menu mobile, barra fixa mobile, modais e rastreamento)
└── assets/           # Pasta reservada para fotos e vídeos reais
```
