/* Changeover and notice dates. Rotation months differ by specialty and
 * region, so the viewer chooses them (and whether the changeover is the
 * first Wednesday or the 1st of the month), or gives any single start date.
 * The table is rebuilt from today's date (the page's own rows are as of when
 * it was built) and each row is offered as an .ics file made on the device.
 * The choice is kept in the address after '#', so a link shares it. */
(function () {
  'use strict';
  var DAY = 86400000;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function utc(y, m, d) { return new Date(Date.UTC(y, m - 1, d)); }
  function add(d, n) { return new Date(d.getTime() + n * DAY); }
  function fmt(d) { return DAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function ymd(d) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }
  function firstWed(y, m) { var d = utc(y, m, 1); return add(d, (3 - d.getUTCDay() + 7) % 7); }
  function $(id) { return document.getElementById(id); }

  var state = { months: [2, 8], rule: 'wed', single: '' };

  function ics(c) {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    var ev = [
      [add(c, -84), '12 weeks to changeover: placement details due (Code of Practice)'],
      [add(c, -56), '8 weeks to changeover: work schedule and post details due'],
      [add(c, -42), '6 weeks to changeover: duty roster (rota slot) due'],
      [add(c, -1), 'Last day before changeover'],
      [c, 'Rotation changeover']
    ];
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//adept//Changeover dates//EN', 'CALSCALE:GREGORIAN'];
    ev.forEach(function (e, i) {
      lines.push('BEGIN:VEVENT', 'UID:' + ymd(c) + '-' + i + '@adept-platforms.com', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + ymd(e[0]), 'DTEND;VALUE=DATE:' + ymd(add(e[0], 1)),
        'SUMMARY:' + e[1], 'DESCRIPTION:Changeover ' + fmt(c) + '. From www.adept-platforms.com/changeover-dates/',
        'TRANSP:TRANSPARENT', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }

  function dates(today) {
    if (state.single) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(state.single);
      return m ? [utc(+m[1], +m[2], +m[3])] : [];
    }
    var list = [], months = state.months.slice().sort(function (a, b) { return a - b; });
    if (!months.length) return list;
    for (var y = today.getUTCFullYear(); list.length < 8 && y < today.getUTCFullYear() + 10; y++) {
      months.forEach(function (mo) {
        var c = state.rule === 'first' ? utc(y, mo, 1) : firstWed(y, mo);
        if (c > today && list.length < 8) list.push(c);
      });
    }
    return list;
  }

  var urls = [];
  function render() {
    writeHash();
    renderSub();
    var tbody = document.querySelector('#co-table tbody');
    var now = new Date(), today = utc(now.getFullYear(), now.getMonth() + 1, now.getDate());
    urls.forEach(function (u) { URL.revokeObjectURL(u); });
    urls = [];
    tbody.innerHTML = '';
    var list = dates(today);
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6">Choose at least one month, or enter a start date.</td></tr>';
      return;
    }
    list.forEach(function (c) {
      var tr = document.createElement('tr');
      var cells = [fmt(c), fmt(add(c, -1)), fmt(add(c, -84)), fmt(add(c, -56)), fmt(add(c, -42))];
      cells.forEach(function (t, i) {
        var td = document.createElement('td');
        if (i === 0) { var b = document.createElement('strong'); b.textContent = t; td.appendChild(b); }
        else td.textContent = t;
        if (i >= 2 && add(c, [0, 0, -84, -56, -42][i]) < today) { td.style.color = 'var(--faint)'; td.title = 'Already passed'; }
        tr.appendChild(td);
      });
      var td = document.createElement('td');
      var a = document.createElement('a');
      a.className = 'btn btn-outline btn-sm';
      a.textContent = 'Add to calendar';
      a.setAttribute('aria-label', 'Add the ' + fmt(c) + ' changeover deadlines to your calendar');
      a.download = 'changeover-' + ymd(c) + '.ics';
      a.href = URL.createObjectURL(new Blob([ics(c)], { type: 'text/calendar' }));
      urls.push(a.href);
      td.appendChild(a);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
  }

  // ---- Subscribe (2026-10-12) ------------------------------------------------
  // One static calendar per pattern lives in /calendar/ (scripts/
  // build_site_calendars.py in the adept repo): every single month and every
  // pair, for both changeover rules.
  var LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function feedPath() {
    var m = state.months.slice().sort(function (a, b) { return a - b; });
    if (state.single || !m.length || m.length > 2) return null;
    return 'www.adept-platforms.com/calendar/changeovers-' + state.rule + '-' +
      m.map(function (x) { return (x < 10 ? '0' : '') + x; }).join('-') + '.ics';
  }
  function renderSub() {
    var card = $('co-sub');
    if (!card) return;
    var path = feedPath(), m = state.months.slice().sort(function (a, b) { return a - b; });
    card.hidden = !!state.single || !m.length;
    if (card.hidden) return;
    $('co-sub-btns').hidden = !path;
    $('co-sub-lede').hidden = !path;
    if (!path) {
      $('co-sub-note').textContent = 'Subscribing covers one or two rotation months. For more, use "Add to calendar" on each changeover below.';
      return;
    }
    var https = 'https://' + path, webcal = 'webcal://' + path;
    var name = 'Changeovers (' + m.map(function (x) { return MONTHS[x - 1]; }).join(', ') + ')';
    $('sub-google').href = 'https://calendar.google.com/calendar/r?cid=' + encodeURIComponent(webcal);
    $('sub-outlook').href = 'https://outlook.office.com/calendar/0/addfromweb?url=' + encodeURIComponent(https) + '&name=' + encodeURIComponent(name);
    $('sub-apple').href = webcal;
    $('sub-copy').dataset.url = https;
    $('co-sub-note').textContent = 'For ' + m.map(function (x) { return LONG[x - 1]; }).join(' and ') +
      ', on the ' + (state.rule === 'first' ? '1st of the month' : 'first Wednesday') +
      '. Apple Calendar also opens Outlook on a Windows PC; any other calendar can subscribe with the copied link.';
  }

  function buildMonths() {
    var box = $('co-months');
    box.innerHTML = '';
    MONTHS.forEach(function (name, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = name;
      b.setAttribute('aria-pressed', state.months.indexOf(i + 1) >= 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        var k = state.months.indexOf(i + 1);
        if (k >= 0) state.months.splice(k, 1); else state.months.push(i + 1);
        state.single = '';
        $('co-single').value = '';
        buildMonths();
        render();
      });
      box.appendChild(b);
    });
    box.classList.toggle('dim', !!state.single);
  }

  function writeHash() {
    var h = state.single ? '#d=' + state.single : '#m=' + state.months.slice().sort(function (a, b) { return a - b; }).join('.') + '&r=' + state.rule;
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  function readHash() {
    location.hash.replace(/^#/, '').split('&').forEach(function (kv) {
      var p = kv.split('=');
      if (p[0] === 'm') state.months = p[1].split('.').map(Number).filter(function (n) { return n >= 1 && n <= 12; });
      if (p[0] === 'r' && (p[1] === 'wed' || p[1] === 'first')) state.rule = p[1];
      if (p[0] === 'd' && /^\d{4}-\d{2}-\d{2}$/.test(p[1])) state.single = p[1];
    });
  }

  function init() {
    if (!$('co-table')) return;
    readHash();
    $('co-rule').value = state.rule;
    $('co-single').value = state.single;
    $('co-rule').addEventListener('change', function () { state.rule = $('co-rule').value; state.single = ''; $('co-single').value = ''; buildMonths(); render(); });
    $('co-single').addEventListener('change', function () { state.single = $('co-single').value; buildMonths(); render(); });
    $('co-controls').hidden = false;
    $('sub-copy').addEventListener('click', function () {
      var btn = $('sub-copy'), url = btn.dataset.url;
      var done = function () { btn.textContent = 'Link copied'; setTimeout(function () { btn.textContent = 'Copy link'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link', url); });
      else prompt('Copy this link', url);
    });
    buildMonths();
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
