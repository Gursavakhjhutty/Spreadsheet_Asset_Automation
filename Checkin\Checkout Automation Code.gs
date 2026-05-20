const CONFIG = {
  RESPONSE_SHEET_NAME: 'Form Responses 1',

  IDENTIFIER_COL: 1,  // A
  LOCATION_COL: 2,    // B

  CHECKIN_TOKEN: 'DATA SYSTEMS',  // case-insensitive match
  CANONICAL_CHECKIN: 'Data Systems',

  FORM_HEADERS: {
    TIMESTAMP: 'Timestamp',
    CATEGORY: 'Category',
    IDENTIFIER: 'Identifier',
    LOCATION: 'Location'
  },

  CATEGORY_TO_SHEET: null
  // Example if names differ:
  // CATEGORY_TO_SHEET: { 'Cables and Adapters': 'Cables & Adapters' }
};

function onFormSubmit(e) {
  const resp = getResponseObject_(e);
  if (!resp) return;

  // Required fields
  let category = (resp.category || '').trim();
  let identifier = (resp.identifier || '').trim();
  let location = (resp.location || '').trim();

  if (!category || !identifier || !location) {
    Logger.log('Missing required fields.');
    return;
  }

  // Normalize identifier to avoid duplicates with spacing/case
  identifier = normalizeKey_(identifier);

  // Check-in heuristic: location equals "Data Systems" (case-insensitive)
  const isCheckIn = normalizeKey_(location) === CONFIG.CHECKIN_TOKEN;
  const finalLocation = isCheckIn ? CONFIG.CANONICAL_CHECKIN : location;

  // Resolve target sheet
  const targetSheetName = resolveCategorySheetName_(category);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws = ss.getSheetByName(targetSheetName);
  if (!ws) {
    Logger.log('Worksheet not found for category: ' + category);
    return;
  }

  upsertByIdentifier_(ws, identifier, finalLocation);
}

/**
 * Update if Identifier exists; else append new row.
 */
function upsertByIdentifier_(ws, identifier, location) {
  const idCol = CONFIG.IDENTIFIER_COL;
  const locCol = CONFIG.LOCATION_COL;

  const lastRow = ws.getLastRow();
  if (lastRow < 2) {
    ws.getRange(2, idCol).setValue(identifier);
    ws.getRange(2, locCol).setValue(location);
    return;
  }

  // Bulk read identifiers for speed
  const idVals = ws.getRange(2, idCol, lastRow - 1, 1).getValues(); // rows 2..lastRow
  for (let i = 0; i < idVals.length; i++) {
    const existing = normalizeKey_(String(idVals[i][0] || ''));
    if (existing && existing === identifier) {
      const r = 2 + i;
      ws.getRange(r, locCol).setValue(location);
      return;
    }
  }

  // Not found -> append
  ws.appendRow(buildRow_(ws, identifier, location));
}

/**
 * Build a new row matching current sheet width.
 * Assumes Identifier in IDENTIFIER_COL and Location in LOCATION_COL.
 */
function buildRow_(ws, identifier, location) {
  const out = [];
  const lastCol = Math.max(ws.getLastColumn(), CONFIG.LOCATION_COL);
  for (let c = 1; c <= lastCol; c++) {
    if (c === CONFIG.IDENTIFIER_COL) out.push(identifier);
    else if (c === CONFIG.LOCATION_COL) out.push(location);
    else out.push('');
  }
  return out;
}

/**
 * Map the form submission to an object by header name.
 */
function getResponseObject_(e) {
  try {
    const sheet = e.range ? e.range.getSheet() : SpreadsheetApp.getActiveSheet();
    if (sheet.getName() !== CONFIG.RESPONSE_SHEET_NAME) return null;

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const vals = sheet.getRange(e.range.getRow(), 1, 1, sheet.getLastColumn()).getValues()[0];
    const h = CONFIG.FORM_HEADERS;

    const map = {};
    headers.forEach((name, i) => { map[name] = vals[i]; });

    return {
      timestamp: map[h.TIMESTAMP],
      category: map[h.CATEGORY],
      identifier: map[h.IDENTIFIER],
      location: map[h.LOCATION]
    };
  } catch (err) {
    Logger.log(err);
    return null;
  }
}

function resolveCategorySheetName_(category) {
  const mapping = CONFIG.CATEGORY_TO_SHEET;
  if (mapping && mapping[category]) return mapping[category];
  return category;
}

function normalizeKey_(s) {
  return String(s).replace(/\s+/g, ' ').trim().toUpperCase();
}
