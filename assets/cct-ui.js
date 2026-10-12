/* The free CCT date calculator's page: form, result, timeline, share link.
 * The counting lives in cct.js (AdeptCCT); the methods offered are listed in
 * AdeptCCT.methods. Nothing typed here leaves the browser - the share link
 * carries the inputs in the part of the address after '#', which browsers
 * never send to a server.
 */
(function () {
  'use strict';
  var C = window.AdeptCCT;
  var $ = function (id) { return document.getElementById(id); };
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var PATTERNS = [[1, 'Full time'], [0.9, '90%'], [0.8, '80%'], [0.7, '70%'], [0.6, '60%'], [0.5, '50%'],
                  [0, 'Time out (not counted)']];

  function fmt(n, long) {
    var p = C.parts(n);
    return long ? DAYS_LONG[p.wd] + ' ' + p.d + ' ' + MONTHS_LONG[p.m - 1] + ' ' + p.y
                : DAYS[p.wd] + ' ' + p.d + ' ' + MONTHS[p.m - 1] + ' ' + p.y;
  }
  function fmtDay(n) { var p = C.parts(n); return p.d + ' ' + MONTHS_LONG[p.m - 1] + ' ' + p.y; }
  function pct(w) { return w === 0 ? 'Time out' : w === 1 ? 'Full time' : Math.round(w * 100) + '%'; }
  function num(n) { return n.toLocaleString('en-GB'); }
  function qty(n, unit) {
    if (unit === 'months') return (Math.round(n * 100) / 100).toLocaleString('en-GB') + ' months';
    return (Math.round(n * 10) / 10).toLocaleString('en-GB') + ' days';
  }
  function span(a, b) {
    // Whole months and days from a to b, for "how much later than full time".
    var pa = C.parts(a), pb = C.parts(b);
    var m = (pb.y - pa.y) * 12 + (pb.m - pa.m);
    if (pb.d < pa.d) m -= 1;
    var rest = b - C.plusMonths(a, m);
    var out = [];
    if (m >= 12) out.push(Math.floor(m / 12) + (Math.floor(m / 12) === 1 ? ' year' : ' years'));
    if (m % 12) out.push((m % 12) + ((m % 12) === 1 ? ' month' : ' months'));
    if (rest || !out.length) out.push(rest + (rest === 1 ? ' day' : ' days'));
    return out.join(', ');
  }

  var state = { method: C.methods[0].id, stage: 0, years: 4, start: '', rows: [] };
  function method() { return C.methods.filter(function (m) { return m.id === state.method; })[0] || C.methods[0]; }
  function stage() { var s = method().stages[state.stage]; return s || null; }
  function years() { var s = stage(); return s ? s.years : state.years; }

  // ---- The form -------------------------------------------------------------
  function buildMethods() {
    var sel = $('method');
    sel.innerHTML = '';
    var groups = {};
    C.methods.forEach(function (m) {
      var g = groups[m.group];
      if (!g) { g = groups[m.group] = document.createElement('optgroup'); g.label = m.group; sel.appendChild(g); }
      var o = document.createElement('option');
      o.value = m.id; o.textContent = m.label;
      g.appendChild(o);
    });
    sel.value = state.method;
  }
  function buildStages() {
    var box = $('stages');
    box.innerHTML = '';
    var list = method().stages.concat([{ label: 'Other length', custom: true }]);
    list.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      var custom = !!s.custom;
      var on = custom ? !stage() : i === state.stage;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = s.label + (s.years ? ' · ' + s.years + (s.years === 1 ? ' year' : ' years') : '');
      b.addEventListener('click', function () {
        state.stage = custom ? -1 : i;
        buildStages();
        update();
      });
      box.appendChild(b);
    });
    $('custom-years').hidden = !!stage();
    $('years').value = state.years;
    var m = method();
    $('method-note').innerHTML = m.note;
  }
  function rowEl(r, i) {
    var div = document.createElement('div');
    div.className = 'prow';
    var first = i === 0;
    div.innerHTML =
      '<div class="field"><label class="label" for="rf' + i + '">' + (first ? 'From the start' : 'From') + '</label>' +
      (first ? '<input id="rf' + i + '" type="date" disabled>' : '<input id="rf' + i + '" type="date" required>') + '</div>' +
      '<div class="field"><label class="label" for="rw' + i + '">Working</label><select id="rw' + i + '"></select></div>' +
      (first ? '<span class="iconbtn-spacer"></span>'
             : '<button type="button" class="iconbtn" aria-label="Remove this change"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>');
    var f = div.querySelector('input'), w = div.querySelector('select');
    PATTERNS.forEach(function (p) {
      if (first && p[0] === 0) return;
      var o = document.createElement('option');
      o.value = String(p[0]); o.textContent = p[1];
      w.appendChild(o);
    });
    f.value = first ? state.start : r.from;
    w.value = String(r.wte);
    if (!first) {
      f.addEventListener('change', function () { r.from = f.value; update(); });
      div.querySelector('.iconbtn').addEventListener('click', function () {
        state.rows.splice(i, 1);
        buildRows();
        update();
      });
    }
    w.addEventListener('change', function () { r.wte = parseFloat(w.value); update(); });
    return div;
  }
  function buildRows() {
    var box = $('rows');
    box.innerHTML = '';
    state.rows.forEach(function (r, i) { box.appendChild(rowEl(r, i)); });
  }

  // ---- The result -----------------------------------------------------------
  function readSpells(start) {
    var out = [], bad = null;
    state.rows.forEach(function (r, i) {
      var f = i === 0 ? start : C.parse(r.from);
      if (f === null) { bad = bad || 'Add a date to each change, or remove it.'; return; }
      if (f < start) { bad = bad || 'A change cannot come before the start date.'; return; }
      out.push({ from: f, wte: r.wte });
    });
    return { spells: out, error: bad };
  }

  function timeline(start, res, spells) {
    var end = res.end, total = Math.max(1, end - start);
    var x = function (d) { return Math.max(0, Math.min(100, (d - start) / total * 100)); };
    var segs = '';
    var sorted = spells.slice().sort(function (a, b) { return a.from - b.from; });
    sorted.forEach(function (s, i) {
      var a = Math.max(s.from, start), b = i + 1 < sorted.length ? sorted[i + 1].from : end + 1;
      if (b <= a) return;
      var cls = s.wte === 0 ? 'seg-out' : s.wte === 1 ? 'seg-ft' : 'seg-ltft';
      segs += '<div class="tl-seg ' + cls + '" style="left:' + x(a) + '%;width:' + (x(b) - x(a)) + '%" title="' +
              pct(s.wte) + ' from ' + fmt(s.from) + '"></div>';
    });
    var labels = stage() ? stage().grades : null;
    var ticks = '';
    res.starts.forEach(function (d, i) {
      var name = labels && labels[i] ? labels[i] : 'Year ' + (i + 1);
      ticks += '<div class="tl-tick" style="left:' + x(d) + '%"><span>' + name + '</span></div>';
    });
    // Year labels along the bottom.
    var years = '', y0 = C.parts(start).y, y1 = C.parts(end).y;
    var step = y1 - y0 > 8 ? 2 : 1;
    for (var y = y0 + 1; y <= y1; y += step) {
      var d = C.dn(y, 1, 1);
      if (d > start && d < end) years += '<div class="tl-year" style="left:' + x(d) + '%">' + y + '</div>';
    }
    return '<div class="tl"><div class="tl-track">' + segs + '</div>' + ticks +
           '<div class="tl-end" style="left:100%"></div>' + years + '</div>' +
           '<div class="tl-legend"><span><i class="seg-ft"></i>Full time</span><span><i class="seg-ltft"></i>Less than full time</span><span><i class="seg-out"></i>Time out, not counted</span></div>';
  }

  function update() {
    writeHash();
    var out = $('result');
    var start = C.parse(state.start);
    var st = stage(), m = method();
    var endLabel = st && st.endLabel ? st.endLabel : 'Estimated completion date';
    if (start === null) {
      out.innerHTML = '<div class="r-empty"><div class="r-icon" aria-hidden="true">' +
        '<svg width="22" height="22" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '</div><p><strong>Enter the date this stage of training started</strong> (or will start) to see the date it ends.</p></div>';
      return;
    }
    var y = years();
    if (!(y >= 1 && y <= 12)) { out.innerHTML = '<p class="r-error">Choose a length between 1 and 12 years.</p>'; return; }
    var rs = readSpells(start);
    if (rs.error) { out.innerHTML = '<p class="r-error">' + rs.error + '</p>'; return; }
    var res = m.count(start, rs.spells, y);
    var ft = m.count(start, [{ from: start, wte: 1 }], y);
    var later = res.end - ft.end;
    var html = '<p class="eyebrow" style="margin:0 0 8px">' + endLabel + '</p>' +
      '<p class="r-date" id="r-date">' + fmtDay(res.end) + '</p>' +
      '<p class="r-sub">' + DAYS_LONG[C.parts(res.end).wd] + ' · ' + span(start, res.end + 1) + ' from the start' +
      (later > 0 ? ' · <strong>' + span(ft.end, res.end) + ' later</strong> than full time' : '') + '</p>';
    if (res.moved) {
      html += '<p class="r-flag"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              m.movedText(res) + '</p>';
    }
    if (res.leaveRunsOn) {
      html += '<p class="r-flag amber">The last row is time out with no end date, so it has been counted as full time from then on, as the college spreadsheets do. Add a change for the date training restarts.</p>';
    }
    html += timeline(start, res, rs.spells);
    var labels = st ? st.grades : null;
    html += '<div class="r-cols"><div><h3 class="r-h">Start of each year</h3><ul class="r-list">';
    res.starts.forEach(function (d, i) {
      html += '<li><span>' + (labels && labels[i] ? labels[i] : 'Year ' + (i + 1)) + '</span><b>' + fmt(d) + '</b></li>';
    });
    html += '<li class="r-end"><span>' + (st && st.endShort ? st.endShort : 'Completion') + '</span><b>' + fmt(res.end) + '</b></li></ul></div>';
    html += '<div><h3 class="r-h">How it was counted</h3><ul class="r-list">';
    res.rows.forEach(function (r) {
      var amt = res.unit === 'months' ? r.months : r.days;
      html += '<li><span>' + pct(r.wte) + ', ' + fmt(r.from) + (r.last ? ' onwards' : ' to ' + fmt(r.to)) + '</span><b>' +
              (amt ? qty(amt, res.unit) : 'none') + '</b></li>';
    });
    html += '<li class="r-end"><span>Training needed</span><b>' + qty(res.total, res.unit) + '</b></li></ul>' +
            '<p class="r-how">' + m.howText + '</p></div></div>';
    out.innerHTML = html;
  }

  // ---- The share link -------------------------------------------------------
  function writeHash() {
    var bits = ['m=' + state.method, 's=' + (stage() ? state.stage : 'y' + state.years)];
    if (state.start) bits.push('d=' + state.start);
    var rows = state.rows.map(function (r, i) { return (i === 0 ? '' : r.from) + '_' + r.wte; });
    bits.push('r=' + rows.join('.'));
    var h = '#' + bits.join('&');
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  function readHash() {
    var q = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    if (q.m && C.methods.some(function (m) { return m.id === q.m; })) state.method = q.m;
    if (q.s) {
      if (q.s[0] === 'y') { state.stage = -1; state.years = parseInt(q.s.slice(1), 10) || 4; }
      else state.stage = parseInt(q.s, 10) || 0;
    } else {
      state.stage = method().defaultStage || 0;
    }
    if (q.d && C.parse(q.d) !== null) state.start = q.d;
    state.rows = [];
    (q.r || '').split('.').forEach(function (x, i) {
      var p = x.split('_');
      var w = parseFloat(p[1]);
      if (isNaN(w) || w < 0 || w > 1) return;
      if (i === 0) state.rows.push({ from: '', wte: w || 1 });
      else if (C.parse(p[0]) !== null) state.rows.push({ from: p[0], wte: w });
    });
    if (!state.rows.length) state.rows = [{ from: '', wte: 1 }];
  }

  function init() {
    readHash();
    buildMethods();
    buildStages();
    buildRows();
    $('start').value = state.start;
    $('method').addEventListener('change', function () {
      state.method = $('method').value;
      state.stage = method().defaultStage || 0;
      buildStages();
      update();
    });
    $('years').addEventListener('input', function () { state.years = parseInt($('years').value, 10); update(); });
    $('start').addEventListener('change', function () {
      state.start = $('start').value;
      buildRows();
      update();
    });
    $('add').addEventListener('click', function () {
      var last = state.rows[state.rows.length - 1];
      var base = C.parse(last.from) || C.parse(state.start);
      var next = base !== null ? C.iso(C.plusMonths(base, 6)) : '';
      state.rows.push({ from: next, wte: last.wte === 1 ? 0.8 : 1 });
      buildRows();
      update();
      var inputs = $('rows').querySelectorAll('input[type=date]');
      inputs[inputs.length - 1].focus();
    });
    $('example').addEventListener('click', function () {
      var ex = method().example;
      state.stage = ex.stage; state.start = ex.start;
      state.rows = ex.rows.map(function (r) { return { from: r[0], wte: r[1] }; });
      $('start').value = state.start;
      buildStages(); buildRows(); update();
    });
    $('copy').addEventListener('click', function () {
      var btn = $('copy'), done = function () {
        btn.textContent = 'Link copied';
        setTimeout(function () { btn.textContent = 'Copy a link to this'; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () { prompt('Copy this link', location.href); });
      else prompt('Copy this link', location.href);
    });
    $('print').addEventListener('click', function () { window.print(); });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
