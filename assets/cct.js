/* The CCT date counts behind adept's free calculator.
 *
 * The RCoA method is the count adept itself uses for every anaesthetics
 * trainee (compute_grade_dates.dart in the app, checked to the day against
 * the RCoA CCT date calculator v4.5 workbook). Dates are whole days, held as
 * day numbers (days since 1 Jan 1970, UTC) so clock changes never shift one.
 * Runs entirely in the browser: nothing typed here is sent anywhere.
 */
(function (root) {
  'use strict';

  var DAY = 86400000;
  function dn(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / DAY); }
  function parts(n) {
    var d = new Date(n * DAY);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay() };
  }
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? dn(+m[1], +m[2], +m[3]) : null;
  }
  function iso(n) {
    var p = parts(n);
    return p.y + '-' + (p.m < 10 ? '0' : '') + p.m + '-' + (p.d < 10 ? '0' : '') + p.d;
  }
  function plusMonths(n, k) {
    var p = parts(n);
    var first = new Date(Date.UTC(p.y, p.m - 1 + k, 1));
    var y = first.getUTCFullYear(), m = first.getUTCMonth() + 1;
    var last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return dn(y, m, Math.min(p.d, last));
  }
  // ROUNDUP, forgiving the floating-point dust of 0.7 x 365.
  function roundUp(x) { return Math.ceil(x - 1e-9); }

  // Rotations change on the first Wednesday of February and August.
  var CHANGEOVER_MONTHS = [2, 8];
  function firstWednesday(y, m) {
    var n = dn(y, m, 1);
    return n + ((3 - parts(n).wd + 7) % 7);
  }

  function wteOn(spells, d) {
    var w = 1;
    for (var i = 0; i < spells.length; i++) if (spells[i].from <= d) w = spells[i].wte;
    return w;
  }
  // One row per change of pattern, as the RCoA sheet is filled in: each extra
  // row rounds up once more, so rows that say the same thing are joined.
  function counted(spells) {
    var out = [];
    spells.slice().sort(function (a, b) { return a.from - b.from; }).forEach(function (s) {
      if (out.length && out[out.length - 1].from === s.from) out.pop();
      if (out.length && out[out.length - 1].wte === s.wte) return;
      out.push({ from: s.from, wte: s.wte });
    });
    return out;
  }

  // The date the sheet reaches [total] training days, counting from [anchor].
  // Each finished row counts ROUNDUP((finish - start) x WTE) - the sheet's
  // finish-minus-start, one short of the calendar length; a leave row (WTE 0)
  // counts nothing. The row in which the total is reached gives the date:
  // (the day before it starts, or the start itself for the first row) +
  // ROUNDUP(days still needed / WTE).
  function reach(anchor, spells, total, log) {
    var rows = [[anchor, wteOn(spells, anchor)]];
    spells.forEach(function (s) { if (s.from > anchor) rows.push([s.from, s.wte]); });
    var done = 0;
    for (var i = 0; i < rows.length; i++) {
      var from = rows[i][0], w = rows[i][1], last = i === rows.length - 1;
      if (!last) {
        var finish = rows[i + 1][0] - 1;
        var g = w > 0 ? roundUp((finish - from) * w) : 0;
        if (done + g < total) {
          done += g;
          if (log) log.push({ from: from, to: finish, wte: w, days: g });
          continue;
        }
      }
      var base = i === 0 ? from : from - 1;
      var need = total - done;
      var end = base + roundUp(need / (w > 0 ? w : 1));
      if (log) log.push({ from: from, to: end, wte: w > 0 ? w : 1, days: need, last: true, leaveRunsOn: w === 0 });
      return end;
    }
    return anchor;
  }

  // The sheet's D55: a date within six days of the Tuesday before the Feb/Aug
  // changeover Wednesday moves to that Tuesday (centred on the Tuesday before
  // the LATER Wednesday among the 1st-8th; the answer is the one before the
  // first - they differ only when the 1st is a Wednesday).
  function snapEnd(d) {
    var y0 = parts(d).y, years = [y0, y0 + 1, y0 - 1];
    for (var a = 0; a < years.length; a++) {
      for (var b = CHANGEOVER_MONTHS.length - 1; b >= 0; b--) {
        var tues = [];
        for (var day = 1; day <= 8; day++) {
          var n = dn(years[a], CHANGEOVER_MONTHS[b], day);
          if (parts(n).wd === 3) tues.push(n - 1);
        }
        if (Math.abs(d - tues[tues.length - 1]) < 7) return tues[0];
      }
    }
    return d;
  }

  // Grade starts: kept on a changeover Wednesday when within 10 days of one.
  function nearbyChangeover(d, snapDays) {
    var y0 = parts(d).y;
    for (var b = 0; b < CHANGEOVER_MONTHS.length; b++) {
      for (var y = y0 - 1; y <= y0 + 1; y++) {
        var w = firstWednesday(y, CHANGEOVER_MONTHS[b]);
        if (Math.abs(w - d) <= snapDays) return w;
      }
    }
    return null;
  }

  /* The RCoA count.
   *   start  - day number training (in this stage) began
   *   spells - [{from, wte}], wte 0 for leave that does not count
   *   years  - training years to complete from [start] (365 days each)
   * Returns { end, raw, moved, years: [start of each year], rows }.
   */
  function rcoa(start, rawSpells, years) {
    var spells = counted(rawSpells);
    var starts = [start], prev = start;
    for (var k = 1; k < years; k++) {
      var c = reach(start, spells, 365 * k);
      var floor = plusMonths(prev, 12);
      if (c < floor) c = floor;
      c = nearbyChangeover(c, 10) || c;
      for (var g = 0; wteOn(spells, c) === 0 && g < 7300; g++) c += 1;
      starts.push(c);
      prev = c;
    }
    var rows = [];
    var raw = reach(start, spells, 365 * years, rows);
    var end = snapEnd(raw);
    return { end: end, raw: raw, moved: end !== raw, starts: starts, rows: rows, total: 365 * years };
  }

  // The rows as the spreadsheets take them: each change of pattern starts a
  // row that finishes the day before the next starts; the last runs on.
  function rowsFrom(start, spells) {
    var rows = [{ from: start, wte: wteOn(spells, start) }];
    spells.forEach(function (s) { if (s.from > start) rows.push({ from: s.from, wte: s.wte }); });
    return rows;
  }

  // The day training days reach [need], counting [perDay] for each calendar
  // day (WTE x unit), for the year starts the spreadsheets do not give.
  function dayReaching(start, spells, need) {
    var rows = rowsFrom(start, spells), done = 0;
    for (var i = 0; i < rows.length; i++) {
      var w = rows[i].wte, from = rows[i].from;
      var len = i + 1 < rows.length ? rows[i + 1].from - from : Infinity;
      if (w > 0 && done + len * w >= need - 1e-9) return from + Math.ceil((need - done) / w - 1e-9);
      if (w > 0) done += len * w;
    }
    return null;
  }
  function yearStarts(start, spells, years) {
    var out = [start];
    for (var k = 1; k < years; k++) {
      var d = dayReaching(start, counted(spells), 365 * k);
      for (var g = 0; d !== null && wteOn(spells, d) === 0 && g < 7300; g++) d += 1;
      if (d !== null) out.push(d);
    }
    return out;
  }

  /* RCEM: the Emergency Medicine Training Calculator 2026 (rcem.ac.uk).
   * A finished post counts (end - start + 1) x WTE / (365/12) months - the
   * days INCLUSIVE, nothing rounded; time out counts nothing. The programme
   * is 72 months; the date is the next post's start + months still needed x
   * (1 / WTE) x 30.4 days, as the sheet's H28 has it (shown as Excel shows a
   * fractional date: the whole day). No changeover rule. */
  function rcem(start, rawSpells, years) {
    var spells = counted(rawSpells), rows = rowsFrom(start, spells);
    var total = years * 12, done = 0, log = [];
    for (var i = 0; i < rows.length - 1; i++) {
      var r = rows[i], days = rows[i + 1].from - r.from;
      var m = days * r.wte / (365 / 12);
      done += m;
      log.push({ from: r.from, to: rows[i + 1].from - 1, wte: r.wte, months: m });
    }
    var last = rows[rows.length - 1];
    var w = last.wte > 0 ? last.wte : 1, need = total - done;
    var end = need > 0 ? last.from + Math.floor(need / w * 30.4 + 1e-9) : rows[rows.length - 1].from - 1;
    log.push({ from: last.from, to: end, wte: w, months: Math.max(0, need), last: true });
    return { end: end, raw: end, moved: false, starts: yearStarts(start, spells, years), rows: log,
             total: total, unit: 'months', leaveRunsOn: last.wte === 0 };
  }

  /* RCPCH: the Guide to training progression (7 March 2025). A placement
   * counts (end - start) x WTE days - NOT inclusive, nothing rounded; a
   * non-training placement counts nothing; 365 days a year. The date is the
   * last entered end date + days still needed / WTE for the rest of training. */
  function rcpch(start, rawSpells, years) {
    var spells = counted(rawSpells), rows = rowsFrom(start, spells);
    var total = years * 365, done = 0, log = [];
    for (var i = 0; i < rows.length - 1; i++) {
      var r = rows[i], to = rows[i + 1].from - 1, d = (to - r.from) * r.wte;
      done += d;
      log.push({ from: r.from, to: to, wte: r.wte, days: d });
    }
    var last = rows[rows.length - 1];
    var w = last.wte > 0 ? last.wte : 1, need = Math.max(0, total - done);
    var end = last.from - 1 + Math.floor(need / w + 1e-9);
    log.push({ from: last.from, to: end, wte: w, days: need, last: true });
    return { end: end, raw: end, moved: false, starts: yearStarts(start, spells, years), rows: log,
             total: total, leaveRunsOn: last.wte === 0 };
  }

  /* Simple pro rata, for specialties whose college publishes no formula:
   * every calendar day counts its WTE, time out counts nothing, 365 days a
   * year; training ends on the day the total is reached. */
  function prorata(start, rawSpells, years) {
    var spells = counted(rawSpells), runsOn = false;
    // An open-ended row of time out runs on at full time, as the college
    // sheets read a blank percentage; the page says so.
    if (spells.length && spells[spells.length - 1].wte === 0) {
      runsOn = true;
      spells = spells.slice(0, -1).concat([{ from: spells[spells.length - 1].from, wte: 1 }]);
    }
    var rows = rowsFrom(start, spells);
    var total = years * 365, end = dayReaching(start, spells, total) - 1, log = [], done = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], to = i + 1 < rows.length ? rows[i + 1].from - 1 : end;
      if (r.from > end) break;
      var last = to >= end;
      if (last) to = end;
      var d = (to - r.from + 1) * r.wte;
      log.push({ from: r.from, to: to, wte: r.wte, days: last ? total - done : d, last: last && i === rows.length - 1 });
      done += d;
      if (last) break;
    }
    return { end: end, raw: end, moved: false, starts: yearStarts(start, spells, years), rows: log, total: total,
             leaveRunsOn: runsOn };
  }

  function rcoaResult(start, spells, years) {
    var r = rcoa(start, spells, years);
    var c = counted(spells), last = c[c.length - 1];
    r.leaveRunsOn = !!(last && last.wte === 0);
    return r;
  }

  var g = function (p, from, to) { var a = []; for (var i = from; i <= to; i++) a.push(p + i); return a; };
  var PRORATA_HOW = 'Each calendar day counts its working percentage and time out counts nothing, 365 days to a year. ' +
    'This college publishes no counting formula, so treat this as a simple estimate: the deanery confirms the date, usually at ARCP.';
  function other(id, label, note, stages) {
    return { id: id, group: 'Other specialties: simple pro rata', label: label, count: prorata, stages: stages || [],
             defaultStage: stages && stages.length ? 0 : -1, note: note, howText: PRORATA_HOW,
             example: { stage: stages && stages.length ? 0 : -1, start: '2025-08-06', rows: [['', 1], ['2026-08-05', 0.8]] } };
  }

  var methods = [
    { id: 'rcoa', group: 'College calculators', label: 'Anaesthetics (RCoA method)', count: rcoaResult,
      defaultStage: 1,
      stages: [
        { label: 'Core (CT1 to CT3)', years: 3, grades: g('CT', 1, 3), endLabel: 'Estimated end of core training', endShort: 'End of core' },
        { label: 'Higher (ST4 to ST7)', years: 4, grades: g('ST', 4, 7), endLabel: 'Estimated CCT date', endShort: 'CCT' }],
      note: 'Counts as the <a href="https://www.rcoa.ac.uk/cct-date-calculator" rel="noopener">RCoA CCT date calculator</a> (v4.5) does, to the day: 365 training days a year, each row of a working pattern rounded up, time out counting nothing, and a date within six days of the February or August changeover moved to the Tuesday before it. The RCoA confirms a CCT date from the start of ST4.',
      howText: 'Each row counts ROUNDUP((finish − start) × WTE) days, as the RCoA workbook does; time out counts nothing. The row in which the total is reached gives the date.',
      movedText: function (r) { return 'Moved to the changeover Tuesday (the count reached ' + iso(r.raw).split('-').reverse().join('/') + ')'; },
      example: { stage: 1, start: '2025-08-06', rows: [['', 1], ['2026-08-05', 0.8], ['2027-03-01', 0], ['2027-09-01', 0.8]] } },
    { id: 'rcem', group: 'College calculators', label: 'Emergency medicine (RCEM method)', count: rcem,
      defaultStage: 0,
      stages: [
        { label: 'Whole programme (ACCS to ST6)', years: 6, grades: ['ST1 (ACCS)', 'ST2 (ACCS)', 'ST3', 'ST4', 'ST5', 'ST6'], endLabel: 'Projected completion date', endShort: 'CCT' },
        { label: 'From ST3', years: 4, grades: g('ST', 3, 6), endLabel: 'Projected completion date', endShort: 'CCT' },
        { label: 'Higher (ST4 to ST6)', years: 3, grades: g('ST', 4, 6), endLabel: 'Projected completion date', endShort: 'CCT' }],
      note: 'Counts as the <a href="https://rcem.ac.uk/wp-content/uploads/2026/02/RCEM-Emergency-Medicine-Training-Calculator-2026.xlsx" rel="noopener">RCEM Emergency Medicine Training Calculator 2026</a> does: months of (days inclusive × WTE) ÷ (365/12), a 72-month programme, and the rest projected at 30.4 days a month. Since August 2025, from ST3 the percentage is the <a href="https://rcem.ac.uk/wp-content/uploads/2026/02/2.-Training-Hours-Defining-Full-Time-Training-as-40-Hours-v1.6.pdf" rel="noopener">average hours actually worked against 40 a week</a>, in 10% bands, not the contracted WTE.',
      howText: 'Each finished row counts (days, inclusive) × WTE ÷ (365/12) months; time out counts nothing. The date is the last row’s start + months still needed ÷ WTE × 30.4 days, as RCEM’s sheet has it. No changeover rule. The sheet gives no year starts; those shown are pro rata.',
      example: { stage: 0, start: '2024-08-07', rows: [['', 1], ['2026-08-05', 0.8], ['2027-02-03', 0], ['2027-08-04', 0.8]] } },
    { id: 'rcpch', group: 'College calculators', label: 'Paediatrics (RCPCH method)', count: rcpch,
      defaultStage: 0,
      stages: [
        { label: 'Whole programme (ST1 to ST7)', years: 7, grades: g('ST', 1, 7), endLabel: 'Indicative completion date', endShort: 'CCT' },
        { label: 'Core (ST1 to ST4)', years: 4, grades: g('ST', 1, 4), endLabel: 'Indicative end of core', endShort: 'End of core' },
        { label: 'Specialty (ST5 to ST7)', years: 3, grades: g('ST', 5, 7), endLabel: 'Indicative completion date', endShort: 'CCT' }],
      note: 'Counts as the RCPCH <a href="https://www.rcpch.ac.uk/resources/guide-training-progression" rel="noopener">guide to training progression</a> (March 2025) does: (end − start) × WTE days for each placement, 365 a year, the rest at the WTE you expect to work. RCPCH says the guide is for planning, not for predicting a completion date; less-than-full-time trainees complete 365 WTE days at each grade unless an ARCP panel agrees capability-based progression.',
      howText: 'Each finished row counts (end − start) × WTE days, as the RCPCH sheet does; time out counts nothing. The date is the last row’s day before + days still needed ÷ WTE. The sheet gives no year starts; those shown are pro rata.',
      example: { stage: 2, start: '2025-08-06', rows: [['', 1], ['2026-08-05', 0.6]] } },
    other('icm', 'Intensive care medicine',
      'FICM publishes no CCT calculator or counting formula. The <a href="https://www.ficm.ac.uk/documents/single-cct-training" rel="noopener">indicative length of ICM training</a> is seven years including core; enter the years left for the stage you are counting.'),
    other('physician', 'Physician specialties (Federation / JRCPTB)',
      'The Federation of the Royal Colleges of Physicians <a href="https://www.thefederation.uk/training/training-certification/calculating-completion-dates" rel="noopener">no longer calculates or confirms completion dates</a>; the deanery does. Enter the years of training left.'),
    other('og', 'Obstetrics and gynaecology', 'The RCOG publishes no CCT calculator. O&amp;G specialty training is <a href="https://www.gmc-uk.org/education/standards-guidance-and-curricula/curricula/obstetrics-and-gynaecology-curriculum" rel="noopener">seven years</a>.',
      [{ label: 'ST1 to ST7', years: 7, grades: g('ST', 1, 7), endLabel: 'Estimated CCT date', endShort: 'CCT' }]),
    other('surgery', 'Surgical specialties (JCST)', 'The JCST sets a provisional CCT date when a trainee enrols and <a href="https://jcst.org/irish-trainees/less-than-full-time-training/" rel="noopener">amends it for LTFT and time out</a>; it publishes no formula. Enter the years of training left.'),
    other('psych', 'Psychiatry', 'The RCPsych calculator asks for sessions a week; its method is not published. Enter the years of training left, and agree the date with your TPD.'),
    other('gp', 'General practice', 'GP training is <a href="https://www.rcgp.org.uk/your-career/qualifying-as-a-gp/cct-guidance/time-out-of-training" rel="noopener">36 months whole time equivalent</a>. Absence of 14 or more working days in a training phase triggers a review of the date; an extension is not automatic.',
      [{ label: 'GP training', years: 3, grades: ['ST1', 'ST2', 'ST3'], endLabel: 'Estimated CCT date', endShort: 'CCT' }]),
    other('generic', 'Any other specialty', 'For a specialty not listed: enter the years of training left.')
  ];

  root.AdeptCCT = {
    rcoa: rcoa, rcem: rcem, rcpch: rcpch, prorata: prorata, methods: methods,
    parse: parse, iso: iso, dn: dn, parts: parts,
    firstWednesday: firstWednesday, plusMonths: plusMonths
  };
})(typeof window !== 'undefined' ? window : globalThis);
