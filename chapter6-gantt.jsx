// Adept walkthrough — Chapter 6: "Reports & the cohort gantt" (64s)
// Redrawn 7 Oct 2026 for the app's redesign: the Summaries page with its
// Placements tab, rotation switcher, one primary "Export spreadsheet" button,
// a framed filters panel of chip rows, and the gantt with placements in trust
// colours (the trust's name on the bar). Uses the shared kit.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, WIN, SB_W, TB_H, PAD, kf, Flip, Icon, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, FilterChip, Avatar, PeriodSwitcher, btnPrimary, btnOutline, trustColour,
} = window.AdeptKit;

// ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
const CX = SB_W + PAD;                    // content left (272)
const CW = WIN.w - SB_W - 2 * PAD;        // content width (1404)
const SW_Y = TB_H + 24;                   // rotation row top (88)
const PANEL_Y = 156, PANEL_H = 16 + 8 * 42 + 8; // filters panel (8 chip rows)
const ROW_H = 42, LABEL_W = 84;
const CHIP0 = CX + 16 + LABEL_W;          // first chip's left edge
const NAME_W = 230;                       // trainee column
const GX0 = CX + NAME_W, GX1 = CX + CW;   // gantt drawing area
const Y0 = 2025.5, Y1 = 2031.5;
const X = (yr) => GX0 + (yr - Y0) * (GX1 - GX0) / (Y1 - Y0);
const R_H = 42;                           // gantt row height
const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });

// Chip widths are fixed so the cursor can aim at a chip.
const chipW = (s) => Math.round(s.length * 8.4 + 30);
const chipXs = (list) => { let x = CHIP0; return list.map((s) => { const r = x; x += chipW(s) + 8; return r; }); };
const FILTERS = [
  ['Grade', ['All', 'CT1', 'CT2', 'CT3', 'ST4', 'ST5', 'ST6', 'ST7']],
  ['Trust', ['All', 'Caldermere General', 'Ellerbeck Royal Infirmary', 'Skelton Bridge', 'Harewood Vale', 'Wharfemoor Park']],
  ['Type', ['All', 'Core', 'ACCS']],
  ['LTFT', ['All', 'LTFT', 'Full time']],
  ['Status', ['All', 'Active', 'Paused', 'Unallocated']],
  ['Kind', ['All', 'Supernumerary', 'Academic']],
  ['ARCP', ['All', 'Winter', 'Summer', 'Off-cycle']],
  ['Finished', ['Hide completed', 'Show completed']],
];
const STATUS_ROW = 4;
const chipCentre = (row, i) => {
  const xs = chipXs(FILTERS[row][1]);
  return { x: WIN.x + xs[i] + chipW(FILTERS[row][1][i]) / 2, y: WIN.y + PANEL_Y + 12 + row * ROW_H + ROW_H / 2 };
};
// Header controls (right-aligned on the rotation row).
const FILT_W = 96, EXP_W = 258;
const FILT_X = CX + CW - FILT_W, EXP_X = FILT_X - 16 - EXP_W;
const FILTERS_BTN = { x: WIN.x + FILT_X + FILT_W / 2, y: WIN.y + SW_Y + 22 };
const EXPORT_BTN = { x: WIN.x + EXP_X + EXP_W / 2, y: WIN.y + SW_Y + 22 };
const UNALLOC = chipCentre(STATUS_ROW, 3);
const ALL_ST = chipCentre(STATUS_ROW, 0);

// ── Data: the cohort, by surname ─────────────────────────────────────────────
// p0 = first rotation (0 = Aug 2025, each step six months); trusts in order,
// null = no placement. end = CCT (higher) or completion (core).
const T = { C: 'Caldermere General', E: 'Ellerbeck Royal Infirmary', S: 'Skelton Bridge', H: 'Harewood Vale', W: 'Wharfemoor Park', N: 'Netherfield & District', O: 'Ousegate Teaching' };
const seq = (s) => [...s].map((c) => (c === '_' ? null : T[c]));
const ROWS = [
  { n: 'Amara Adeyemi', g: 'CT2', p0: 0, tr: seq('CEHHWW'), grades: [[0, 'CT1'], [2, 'CT2'], [4, 'CT3']], end: 2028.58 },
  { n: 'Jonah Bekele', g: 'ST5', ltft: 'LTFT 80%', p0: 0, tr: seq('SSCCEEOOOHH'), grades: [[0, 'ST4'], [2, 'ST5'], [5, 'ST6'], [8, 'ST7']], pause: [2027.12, 2027.85], end: 2030.9 },
  { n: 'Eilis Brennan', g: 'CT1', p0: 2, tr: seq('_WWNNCC'), grades: [[2, 'CT1'], [4, 'CT2'], [6, 'CT3']], end: 2029.58 },
  { n: 'Michael Doyle', g: 'CT1', p0: 2, tr: seq('WWNNCC'), grades: [[2, 'CT1'], [4, 'CT2'], [6, 'CT3']], end: 2029.58 },
  { n: 'Lucy Fenwick', g: 'ST4', p0: 2, tr: seq('_SHHWWEE'), grades: [[2, 'ST4'], [4, 'ST5'], [6, 'ST6']], end: 2030.58 },
  { n: 'Pervez Iqbal', g: 'ST5', p0: 0, tr: seq('OO_EESSCC'), grades: [[0, 'ST4'], [2, 'ST5'], [4, 'ST6'], [6, 'ST7']], end: 2030.08 },
  { n: 'Harleen Kaur', g: 'ST4', ltft: 'LTFT 80%', p0: 2, tr: seq('HHCCNNNEE'), grades: [[2, 'ST4'], [5, 'ST5'], [7, 'ST6']], end: 2030.5 },
  { n: 'Grace Lindqvist', g: 'ST6', p0: 0, tr: seq('NNWWOOE'), grades: [[0, 'ST5'], [2, 'ST6'], [4, 'ST7']], end: 2029.08 },
  { n: 'David Marsh', g: 'CT3', p0: 0, tr: seq('NN_W'), grades: [[0, 'CT2'], [2, 'CT3']], end: 2027.58 },
  { n: 'Lena Novak', g: 'ST6', p0: 0, tr: seq('EE_OOC'), grades: [[0, 'ST5'], [2, 'ST6'], [4, 'ST7']], end: 2028.58 },
  { n: 'Ada Okafor', g: 'CT2', p0: 0, tr: seq('CC_SHH'), grades: [[0, 'CT1'], [2, 'CT2'], [4, 'CT3']], end: 2028.58 },
  { n: 'Sanjay Patel', g: 'CT3', p0: 0, tr: seq('WOCC'), grades: [[0, 'CT2'], [2, 'CT3']], end: 2027.58 },
  { n: 'Owen Rhodes', g: 'CT1', p0: 2, tr: seq('EESSOO'), grades: [[2, 'CT1'], [4, 'CT2'], [6, 'CT3']], end: 2029.58 },
  { n: 'Ravi Singh', g: 'ST4', p0: 2, tr: seq('EEWWOOSS'), grades: [[2, 'ST4'], [4, 'ST5'], [6, 'ST6'], [8, 'ST7']], end: 2030.58 },
  { n: 'Tom Whitfield', g: 'ST7', p0: 0, tr: seq('HHNN'), grades: [[0, 'ST6'], [2, 'ST7']], end: 2027.58 },
  { n: 'Tariq Yusuf', g: 'ST5', p0: 0, tr: seq('CC_NNOOWW'), grades: [[0, 'ST4'], [2, 'ST5'], [4, 'ST6'], [6, 'ST7']], end: 2030.08 },
];
const isCore = (r) => r.g.startsWith('CT');
const hasGap = (r) => r.tr.some((x) => x === null);
const rotStart = (i) => 2025.583 + i * 0.5;
const TODAY = 2026.77;

// ── Timeline scripts ─────────────────────────────────────────────────────────
const CAPTIONS = [
  [6.6, 12.8, 'The whole cohort on one timeline.'],
  [14.0, 20.2, 'Pauses, LTFT and CCT dates, at a glance.'],
  [22.0, 28.4, 'Filter to a grade, a trust or a status.'],
  [30.4, 36.8, 'Spot the gaps before they become problems.'],
  [38.8, 45.2, 'And export it: one Excel spreadsheet.'],
  [47.0, 52.8, 'One source of truth, for the TPD and the deanery.'],
];
const OPEN_T = 23.0, FILTER_T = 24.8, RESET_T = 38.0, EXPORT_T = 41.6;
const CLICKS = [OPEN_T, FILTER_T, RESET_T, EXPORT_T];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.4, x: 960, y: 530, z: 1.04 },
  { t: 15.0, x: 1084, y: 466, z: 1.36 },
  { t: 20.6, x: 1084, y: 470, z: 1.36 },
  { t: 22.2, x: 1084, y: 466, z: 1.36 },
  { t: 28.8, x: 1084, y: 470, z: 1.36 },
  { t: 30.6, x: 1084, y: 680, z: 1.32 },
  { t: 36.6, x: 1084, y: 684, z: 1.32 },
  { t: 37.6, x: 1084, y: 466, z: 1.36 },
  { t: 42.4, x: 1084, y: 466, z: 1.36 },
  { t: 43.4, x: 1000, y: 580, z: 1.04 },
  { t: 46.2, x: 1000, y: 580, z: 1.04 },
  { t: 47.6, x: 960, y: 540, z: 1.0 },
  { t: 64, x: 960, y: 540, z: 1.0 },
];
const CURSOR = [
  { t: 21.4, x: 1300, y: 640, o: 0 },
  { t: 21.9, x: 1300, y: 640, o: 1 },
  { t: 22.7, x: FILTERS_BTN.x - 6, y: FILTERS_BTN.y - 6, o: 1 },
  { t: 23.4, x: FILTERS_BTN.x - 6, y: FILTERS_BTN.y - 6, o: 1 },
  { t: 24.5, x: UNALLOC.x - 6, y: UNALLOC.y - 6, o: 1 },
  { t: 26.0, x: UNALLOC.x - 6, y: UNALLOC.y - 6, o: 1 },
  { t: 26.6, x: UNALLOC.x - 6, y: UNALLOC.y + 30, o: 0 },
  { t: 36.8, x: 900, y: 560, o: 0 },
  { t: 37.1, x: 900, y: 560, o: 1 },
  { t: 37.8, x: ALL_ST.x - 6, y: ALL_ST.y - 6, o: 1 },
  { t: 38.6, x: ALL_ST.x - 6, y: ALL_ST.y - 6, o: 1 },
  { t: 41.2, x: EXPORT_BTN.x - 6, y: EXPORT_BTN.y - 6, o: 1 },
  { t: 42.4, x: EXPORT_BTN.x - 6, y: EXPORT_BTN.y - 6, o: 1 },
  { t: 43.0, x: EXPORT_BTN.x - 6, y: EXPORT_BTN.y + 30, o: 0 },
];

// ── Pieces ───────────────────────────────────────────────────────────────────
function TabButton({ text, on }) {
  return <div style={{ display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 16px', borderRadius: 8, background: on ? C.navy : '#fff', color: on ? '#fff' : C.ink, border: `1px solid ${on ? C.navy : C.field}`, fontSize: 15, fontWeight: on ? 600 : 500 }}>{text}</div>;
}
function FiltersPanel({ status, pressAt, t, h }) {
  return (
    <div style={at(CX, PANEL_Y, { width: CW, height: h, overflow: 'hidden', border: h > 1 ? `1px solid ${C.line}` : 'none', borderRadius: 8, background: '#fff' })}>
      {FILTERS.map(([label, chips], r) => {
        const xs = chipXs(chips);
        return (
          <div key={label} style={at(0, 12 + r * ROW_H, { width: CW, height: ROW_H })}>
            <span style={at(16, 11, { fontSize: 15, color: C.inkSoft })}>{label}</span>
            {chips.map((c, i) => {
              let on = i === 0;
              if (r === STATUS_ROW) on = status === 'unalloc' ? i === 3 : i === 0;
              const pressed = r === STATUS_ROW && pressAt.some((p) => t >= p.t && t < p.t + 0.25 && p.i === i);
              return <FilterChip key={c} text={c} on={on} style={{ position: 'absolute', left: xs[i] - CX, top: 5, width: chipW(c), justifyContent: 'center', transform: pressed ? 'scale(0.93)' : 'none' }} />;
            })}
            {r === 0 && (
              <div style={at(CW - 300, 1, { width: 280, height: 40, borderRadius: 8, background: C.soft, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', fontSize: 15, color: C.inkSoft })}>
                <Icon name="search" size={16} color={C.inkSoft} />Search by name
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function MonthRuler() {
  const years = []; for (let y = 2026; y <= 2031; y++) years.push(y);
  const months = 'JFMAMJJASOND';
  const marks = [];
  for (let m = Math.ceil(Y0 * 12); m < Y1 * 12; m++) {
    const yr = m / 12, letter = months[m % 12];
    marks.push(<span key={m} style={at(X(yr) - GX0 + 2, 22, { fontSize: 10.5, color: m % 12 === 7 ? C.ink : C.inkSoft, fontWeight: m % 12 === 7 ? 600 : 400 })}>{letter}</span>);
  }
  return (
    <React.Fragment>
      {years.map((y) => <span key={y} style={at(X(y) - GX0 + 2, 2, { fontSize: 14, fontWeight: 600, color: C.ink })}>{y}</span>)}
      {marks}
    </React.Fragment>
  );
}
function GanttRow({ r, y, o, gapPulse }) {
  const bars = [];
  r.tr.forEach((trust, k) => {
    const i = r.p0 + k, s = rotStart(i), e = Math.min(rotStart(i + 1), r.end);
    if (s >= r.end) return;
    const x = X(s) - GX0, w = X(e) - X(s) - 3;
    if (trust === null) {
      bars.push(
        <div key={k} style={at(x, 15, { width: w, height: 24, borderRadius: 4, border: `1.5px dashed ${C.error}`, background: `rgba(200,30,30,${0.06 + 0.12 * gapPulse})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 500, color: C.error, whiteSpace: 'nowrap' })}>No placement</div>,
      );
    } else {
      bars.push(
        <div key={k} style={at(x, 15, { width: w, height: 24, borderRadius: 4, background: trustColour(trust), color: '#fff', fontSize: 12, fontWeight: 500, padding: '0 6px', lineHeight: '24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' })}>{trust}</div>,
      );
    }
  });
  const endX = X(r.end) - GX0;
  return (
    <div style={at(CX, y, { width: CW, height: R_H, opacity: o, borderBottom: `1px solid ${C.line}` })}>
      <div style={at(4, 6)}><Avatar name={r.n} size={28} /></div>
      <div style={at(42, 4, { lineHeight: 1.25 })}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{r.n}</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, whiteSpace: 'nowrap' }}>{r.g}{r.ltft && <span style={{ color: C.teal, fontWeight: 500 }}> · {r.ltft}</span>}</div>
      </div>
      <div style={at(NAME_W - 1, 0, { width: 1, height: R_H, background: C.line })} />
      <div style={at(NAME_W, 0, { width: GX1 - GX0, height: R_H, overflow: 'hidden' })}>
        <div style={at(endX, 0, { width: GX1 - GX0 - endX, height: R_H, background: C.soft })} />
        {r.grades.map(([i, g]) => {
          const gx = X(rotStart(i)) - GX0;
          return <React.Fragment key={g}><div style={at(gx, 1, { width: 1, height: 13, background: C.inkSoft })} /><span style={at(gx + 3, 0, { fontSize: 10, color: C.inkSoft })}>{g}</span></React.Fragment>;
        })}
        {bars}
        {r.pause && (
          <div style={at(X(r.pause[0]) - GX0, 13, { width: X(r.pause[1]) - X(r.pause[0]), height: 28, borderRadius: 4, background: `repeating-linear-gradient(45deg, #E4E8EE, #E4E8EE 6px, #D3D9E1 6px, #D3D9E1 12px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: C.inkSoft })}>Paused</div>
        )}
        <div style={at(endX - 1, 1, { width: 2, height: R_H - 2, background: C.navy })} />
        <span style={at(endX + 5, 0, { fontSize: 10, fontWeight: 600, color: C.navy })}>{isCore(r) ? 'Completion' : 'CCT'}</span>
      </div>
    </div>
  );
}

// ── The Summaries page ───────────────────────────────────────────────────────
function SummariesScreen({ t }) {
  const open = Easing.easeInOutCubic(clamp((t - OPEN_T) / 0.6, 0, 1));
  const panelH = PANEL_H * open;
  const status = t >= FILTER_T && t < RESET_T ? 'unalloc' : 'all';
  const fp = t < RESET_T
    ? Easing.easeInOutCubic(clamp((t - FILTER_T) / 0.7, 0, 1))
    : 1 - Easing.easeInOutCubic(clamp((t - RESET_T) / 0.7, 0, 1));
  const pressFilters = t >= OPEN_T - 0.05 && t < OPEN_T + 0.2;
  const pressExport = t >= EXPORT_T - 0.05 && t < EXPORT_T + 0.2;
  const snack = Math.min(Easing.easeOutCubic(clamp((t - EXPORT_T - 0.5) / 0.4, 0, 1)), 1 - Easing.easeInCubic(clamp((t - 50.5) / 0.5, 0, 1)));
  const gapPulse = t >= 30.4 && t < 36.8 ? Math.sin((t - 30.4) * 2.4) * 0.5 + 0.5 : 0;
  const top = PANEL_Y + (panelH > 0 ? panelH + 16 : 0);
  const LEG_Y = top, HEAD_Y = top + 34, ROWS_Y = top + 34 + 44;
  const total = Math.round(190 + (7 - 190) * fp);
  let gi = 0;
  const legendItem = (sw, text) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>{sw}{text}</span>;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="Summaries" />
      <div style={{ position: 'absolute', left: 0, top: TB_H, right: 0, bottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -TB_H, right: 0, height: WIN.h }}>
          {/* Rotation row */}
          <div style={at(CX, SW_Y + 2, { display: 'flex', alignItems: 'center', gap: 20 })}>
            <span style={{ fontSize: 15, color: C.inkSoft }}>Rotation</span>
            <PeriodSwitcher label="Aug 2026" minW={96} />
          </div>
          <div style={at(EXP_X, SW_Y, btnPrimary(pressExport, { width: EXP_W }))}><Icon name="download" size={18} color="#fff" />Export spreadsheet (.xlsx)</div>
          <div style={at(FILT_X, SW_Y, { width: FILT_W, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, color: C.ink, borderRadius: 8, background: pressFilters ? C.activeTint : 'transparent' })}>
            <Icon name="filter" size={16} color={C.inkSoft} />Filters<div style={{ transform: `rotate(${180 * open}deg)` }}><Icon name="down" size={14} color={C.inkSoft} /></div>
          </div>
          {panelH > 1 && <FiltersPanel status={status} t={t} h={panelH} pressAt={[{ t: FILTER_T, i: 3 }, { t: RESET_T, i: 0 }]} />}
          {/* Legend and gantt controls */}
          <div style={at(CX, LEG_Y, { width: CW, height: 28, display: 'flex', alignItems: 'center', gap: 22, fontSize: 13.5, color: C.inkSoft })}>
            {legendItem(<span style={{ width: 18, height: 12, borderRadius: 2, background: 'repeating-linear-gradient(45deg, #E4E8EE, #E4E8EE 3px, #D3D9E1 3px, #D3D9E1 6px)' }} />, 'Paused')}
            {legendItem(<span style={{ width: 18, height: 12, borderRadius: 2, border: `1.5px dashed ${C.error}` }} />, 'No placement')}
            {legendItem(<span style={{ width: 2, height: 14, background: C.navy }} />, 'CCT or completion')}
            {legendItem(<span style={{ width: 2, height: 14, background: C.error }} />, 'Today')}
            <span style={{ color: C.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{total} trainees</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Colour by <span style={{ color: C.ink }}>Hospital trust</span><Icon name="down" size={13} color={C.inkSoft} /></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Zoom <span style={{ color: C.ink }}>Fit all</span><Icon name="down" size={13} color={C.inkSoft} /></span>
          </div>
          <div style={at(CX, HEAD_Y, { width: CW, height: 44, borderBottom: `1px solid ${C.line}` })}>
            <span style={at(4, 14, { fontSize: 13.5, color: C.inkSoft })}>Trainee</span>
            <div style={at(NAME_W - 1, 0, { width: 1, height: 44, background: C.line })} />
            <div style={at(NAME_W, 0, { width: GX1 - GX0, height: 44 })}><MonthRuler /></div>
          </div>
          <div style={at(X(TODAY) - 1, HEAD_Y, { width: 2, height: WIN.h - HEAD_Y, background: C.error, opacity: 0.85 })} />
          {ROWS.map((r, i) => {
            const keep = hasGap(r);
            const target = keep ? gi++ : i;
            const idx = keep ? i + (target - i) * fp : i;
            const o = keep ? 1 : 1 - fp;
            if (o < 0.02) return null;
            const y = ROWS_Y + idx * R_H;
            if (y > WIN.h) return null;
            return <GanttRow key={r.n} r={r} y={y} o={o} gapPulse={keep ? gapPulse : 0} />;
          })}
          {/* Today */}
          <span style={at(X(TODAY) - 22, HEAD_Y - 2, { fontSize: 10.5, fontWeight: 600, color: '#fff', background: C.error, borderRadius: 3, padding: '0 5px' })}>Today</span>
        </div>
      </div>
      <TopBar title="Summaries" right={<div style={{ display: 'flex', gap: 8 }}><TabButton text="Placements" on /><TabButton text="Trainee summary" /><TabButton text="Progress" /></div>} />
      {snack > 0.01 && (
        <div style={at(SB_W + (WIN.w - SB_W) / 2 - 290, 856, { width: 580, height: 52, opacity: snack, transform: `translateY(${(1 - snack) * 16}px)`, background: C.ink, color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', fontSize: 15, boxShadow: '0 6px 20px rgba(19,39,63,.25)' })}>
          <Icon name="check" size={18} color="#6EE7B7" sw={2.2} />
          <span>Exported 190 trainees to cohort-aug-2026.xlsx</span>
        </div>
      )}
    </div>
  );
}

// ── Film ─────────────────────────────────────────────────────────────────────
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><SummariesScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Reports & the cohort gantt" kicker="Product tour · the whole programme" />
      <EndCard t={t} inAt={54} />
    </FilmRoot>
  );
}
function AdeptGanttVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={64} background={C.backdrop} persistKey="adeptch6">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptGanttVideo = AdeptGanttVideo;
})();
