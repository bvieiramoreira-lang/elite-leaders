/**
 * ============================================================================
 * GOOGLE APPS SCRIPT — CAPTURA DE LEADS ELITE LEADERS (QUENTE + FRIA + UTMs)
 * ============================================================================
 * Colunas da planilha:
 * data_hora, nome, email, telefone, pagina, botao, utm_source, utm_medium,
 * utm_campaign, utm_content, utm_term, fbclid, event_id
 */

const HEADERS = [
  "data_hora",
  "nome",
  "email",
  "telefone",
  "pagina",
  "botao",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "event_id"
];

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#070610");
    headerRange.setFontColor("#c69f00");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(raw);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    ensureHeaders(sheet);

    const row = [
      data.data_hora || Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss"),
      data.nome || "",
      data.email || "",
      data.telefone || "",
      data.pagina || data.page_variant || "",
      data.botao || data.button_location || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_content || "",
      data.utm_term || "",
      data.fbclid || "",
      data.event_id || ""
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok", event_id: data.event_id || "" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
