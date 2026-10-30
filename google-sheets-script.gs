/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — PLANILHA DE LEADS ELITE LEADERS (QUENTE vs FRIA + UTMs)
 * ============================================================================
 * COMO USAR NA SUA PLANILHA GOOGLE SHEETS:
 * 1. Crie uma nova planilha em https://sheets.new
 * 2. No menu superior, clique em: Extensões -> Apps Script
 * 3. Apague o código que estiver lá e cole TODO este arquivo.
 * 4. (Opcional) Clique em "Executar" na função "configurarPlanilha" para já criar
 *    as 3 abas ("Todos os Leads", "Pagina Quente" e "Pagina Fria") formatadas.
 * 5. No canto superior direito, clique em: Implantar -> Nova implantação
 * 6. Em "Selecionar tipo" (ícone de engrenagem), escolha: App da Web
 * 7. Em "Executar como", deixe: "Eu"
 * 8. Em "Quem pode acessar", escolha: "Qualquer pessoa"
 * 9. Clique em "Implantar", autorize o acesso e copie a "URL do app da Web".
 * 10. Cole essa URL no arquivo js/config.js no campo: googleSheetsWebhookUrl
 */

const HEADERS = [
  "Data/Hora",
  "Nome",
  "E-mail",
  "Telefone / WhatsApp",
  "Página (Quente / Fria)",
  "Variante da Página",
  "Posição do Botão",
  "utm_source (Origem)",
  "utm_medium (Mídia)",
  "utm_campaign (Campanha)",
  "utm_content (Anúncio / Criativo)",
  "utm_term (Conjunto / Público)",
  "fbclid",
  "gclid",
  "URL Completa",
  "Referrer"
];

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#070610");
    headerRange.setFontColor("#c69f00");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function configurarPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(ss, "Todos os Leads");
  getOrCreateSheet(ss, "Pagina Quente");
  getOrCreateSheet(ss, "Pagina Fria");
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(raw);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const paginaTipo = String(data.pagina_tipo || "Quente");

    const row = [
      data.data_hora || new Date().toLocaleString("pt-BR"),
      data.nome || "",
      data.email || "",
      data.telefone || "",
      paginaTipo,
      data.page_variant || "",
      data.button_location || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_content || "",
      data.utm_term || "",
      data.fbclid || "",
      data.gclid || "",
      data.page_url || "",
      data.referrer || ""
    ];

    // 1. Salva na aba geral "Todos os Leads"
    const allSheet = getOrCreateSheet(ss, "Todos os Leads");
    allSheet.appendRow(row);

    // 2. Salva também separado na aba correspondente ("Pagina Fria" ou "Pagina Quente")
    const targetTabName =
      paginaTipo.toLowerCase().indexOf("fria") !== -1 ? "Pagina Fria" : "Pagina Quente";
    const specificSheet = getOrCreateSheet(ss, targetTabName);
    specificSheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", tab: targetTabName })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
