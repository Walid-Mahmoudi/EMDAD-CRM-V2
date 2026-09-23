/**
 * EMDAD NEXUS — Source Sheet Bridge
 * NEW standalone Apps Script project. DO NOT paste this into the legacy CRM.
 * Deploy as Web App: Execute as Me, Who has access: Anyone with the URL.
 */
const CONFIG = {
  SPREADSHEET_ID: '1Qk-2V-RLSLpz9PoTttA-XrnZP3_n15jNRSfnGARiUXU',
  SHEET_GID: 2048855263,
  TOKEN_PROPERTY: 'EMDAD_SOURCE_SYNC_TOKEN'
};

function doGet(e) {
  const token = PropertiesService.getScriptProperties().getProperty(CONFIG.TOKEN_PROPERTY);
  const supplied = e && e.parameter ? e.parameter.token : '';
  if (!token || supplied !== token) return json_({ok:false,error:'Unauthorized'}, 401);

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sh = ss.getSheets().find(s => String(s.getSheetId()) === String(CONFIG.SHEET_GID));
  if (!sh) return json_({ok:false,error:'Source sheet not found'}, 404);

  const values = sh.getDataRange().getValues();
  if (!values.length) return json_({ok:true,headers:[],rows:[]});

  const headers = values[0].map(v => String(v || '').trim());
  const rows = values.slice(1).filter(r => r.some(v => String(v ?? '').trim() !== '')).map(r => {
    const o = {};
    headers.forEach((h,i) => { if (h) o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    return o;
  });

  return json_({
    ok:true,
    source_system:'google_sheet',
    spreadsheet_id:CONFIG.SPREADSHEET_ID,
    sheet_gid:CONFIG.SHEET_GID,
    fetched_at:new Date().toISOString(),
    headers,
    rows
  });
}

function json_(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
