/**
 * CTL Matrix Review: Google Sheet back end
 *
 * Stores anonymous responses from the CTL Matrix Review page in a sheet
 * named "Responses", and returns them to the page's results screen.
 * See README.md for setup steps.
 */

var SHEET_NAME = 'Responses';
var CRITERIA = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
var ROLES = ['Administrator', 'Faculty', 'Staff'];
var YEARS = ['2025–26', '2026–27', '2027–28', '2028–29', '2029–30', '2030–31'];
var SCORE_TO_CELL = { '1': 1, '2': 2, '3': 3, 'IE': 'IE', 'NA': 'N/A' };
var FIXED = ['Submitted', 'Response ID', 'Year', 'Role', 'School or office'];
var HEADERS = FIXED.concat(CRITERIA).concat(CRITERIA.map(function (c) { return c + ' comment'; }));

/** Run once from the editor to create the sheet and grant permissions. */
function setup() {
  getSheet_();
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange('B:E').setNumberFormat('@'); // keep IDs, years, roles, units as plain text
    sh.getRange(1, FIXED.length + CRITERIA.length + 1, sh.getMaxRows(), CRITERIA.length).setNumberFormat('@');
  }
  return sh;
}

function clean_(value, max) {
  var s = String(value == null ? '' : value)
    .replace(/[\u0000-\u0009\u000B-\u001F]/g, ' ')
    .trim()
    .slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // never let a response become a formula
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Receives one response. Resubmitting the same response ID replaces the earlier row. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse(e.postData.contents);
    if (!/^[a-z0-9-]{8,64}$/i.test(String(d.id || ''))) throw new Error('Missing response ID.');
    if (YEARS.indexOf(d.year) < 0) throw new Error('Unknown academic year.');
    if (ROLES.indexOf(d.role) < 0) throw new Error('Unknown role.');
    var unit = clean_(d.unit, 120);
    if (!unit) throw new Error('School or office is required.');

    var row = [new Date(), String(d.id), d.year, d.role, unit];
    CRITERIA.forEach(function (c) {
      var v = d.ratings && d.ratings[c];
      row.push(SCORE_TO_CELL.hasOwnProperty(v) ? SCORE_TO_CELL[v] : '');
    });
    CRITERIA.forEach(function (c) { row.push(clean_(d.comments && d.comments[c], 1000)); });

    var sh = getSheet_();
    var last = sh.getLastRow(), target = 0;
    if (last > 1) {
      var ids = sh.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) { if (String(ids[i][0]) === String(d.id)) { target = i + 2; break; } }
    }
    if (target) sh.getRange(target, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Returns responses, optionally for one academic year: ?year=2026–27 */
function doGet(e) {
  try {
    var year = e && e.parameter && e.parameter.year;
    var sh = getSheet_();
    var values = sh.getDataRange().getValues();
    var head = values[0], col = {};
    head.forEach(function (h, i) { col[h] = i; });
    var out = [];
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var y = String(row[col['Year']]);
      if (!row[col['Response ID']] || (year && y !== year)) continue;
      var ratings = {}, comments = {};
      CRITERIA.forEach(function (c) {
        var v = row[col[c]];
        if (v === 1 || v === 2 || v === 3 || v === '1' || v === '2' || v === '3') ratings[c] = String(v);
        else if (v === 'IE') ratings[c] = 'IE';
        else if (v === 'N/A' || v === 'NA') ratings[c] = 'NA';
        var cm = row[col[c + ' comment']];
        if (cm) comments[c] = String(cm);
      });
      var when = row[col['Submitted']];
      out.push({
        id: String(row[col['Response ID']]),
        submitted: when instanceof Date ? when.toISOString() : String(when),
        year: y,
        role: String(row[col['Role']]),
        unit: String(row[col['School or office']]),
        ratings: ratings,
        comments: comments
      });
    }
    return json_({ ok: true, count: out.length, responses: out });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}
