// Adept — "Your programme at a glance" (Dashboard walkthrough, 75s, 1920x1080)
// Scene code for the animations.jsx engine. Exposes window.AdeptDashboardVideo.
/* global React */
(() => {
const { Stage, useTime, Easing, interpolate, clamp } = window;

// ── Brand ────────────────────────────────────────────────────────────────────
const C = {
  navy: '#1E3A5F', navyDeep: '#13273F', ink: '#161F2E', inkSoft: '#55617A',
  line: '#E1E6EE', paper: '#FFFFFF', soft: '#F1F4F8', backdrop: '#E4EAF2',
  teal: '#0E8F82', tealFill: 'rgba(14,143,130,.12)',
  amber: '#C9812E', amberFill: 'rgba(201,129,46,.14)',
  green: '#10B981', greenFill: 'rgba(16,185,129,.13)',
  red: '#DC2626', redFill: 'rgba(220,38,38,.10)',
  blue: '#2563EB', blueFill: 'rgba(37,99,235,.10)',
};
const FONT = "'Inter', system-ui, sans-serif";
const FONT_T = "'Inter Tight', 'Inter', system-ui, sans-serif";

// ── Layout constants (single source of truth for UI + camera + cursor) ──────
const WIN = { x: 110, y: 64, w: 1700, h: 952, r: 16 };
const SB_W = 248, TB_H = 64, PAD = 28;
const CX0 = WIN.x + SB_W;                 // content left edge (358)
const CIX = CX0 + PAD;                    // content inner x (386)
const CIW = WIN.x + WIN.w - PAD - CIX;    // content inner width (1396)
const CARD_W = (CIW - 3 * 20) / 4;        // 334
const METRIC_Y = WIN.y + TB_H + PAD;      // 156
const METRIC_H = 118;
const TRUST_HEAD_Y = METRIC_Y + METRIC_H + 34;
const TRUST_Y = TRUST_HEAD_Y + 46;        // row 1 top
const TRUST_H = 126;
const ARCP_HEAD_Y = TRUST_Y + 2 * TRUST_H + 20 + 34;
const ARCP_Y = ARCP_HEAD_Y + 46;
const ARCP_H = 148;
const ARCP_W = (CIW - 2 * 24) / 3;
const SEL = { prevX: 1557, labelX: 1661, nextX: 1765, y: WIN.y + TB_H / 2 }; // topbar right
const metricCX = (i) => CIX + i * (CARD_W + 20) + CARD_W / 2;
const trustXY = (i) => ({ x: CIX + (i % 4) * (CARD_W + 20), y: TRUST_Y + Math.floor(i / 4) * (TRUST_H + 20) });

// ── Data ─────────────────────────────────────────────────────────────────────
const METRICS = [
  { label: 'Total trainees', sub: 'in programme', aug: '190', feb: '190' },
  { label: 'Unallocated', sub: 'need a placement', aug: '12', feb: '27', accent: C.amber },
  { label: 'LTFT', sub: 'less than full time', aug: '18%', feb: '17%' },
  { label: 'Total WTE', sub: 'whole-time equivalent', aug: '176.4', feb: '175.8' },
];
const TRUSTS = [
  { name: 'Caldermere General', cap: 32, aug: 30, feb: 28 },
  { name: 'Ellerbeck Royal Infirmary', cap: 30, aug: 28, feb: 27 },
  { name: 'Skelton Bridge', cap: 24, aug: 26, feb: 20 },
  { name: 'Harewood Vale', cap: 20, aug: 18, feb: 16 },
  { name: 'Wharfemoor Park', cap: 28, aug: 26, feb: 25 },
  { name: 'Netherfield & District', cap: 26, aug: 24, feb: 22 },
  { name: 'Ousegate Teaching', cap: 30, aug: 26, feb: 25 },
];
const ARCPS = [
  { date: '14 Oct 2026', season: 'Autumn', names: ['J. Bekele', 'H. Kaur', 'T. Whitfield'], more: 6 },
  { date: '9 Dec 2026', season: 'Winter', names: ['A. Okafor', 'S. Patel', 'C. Adeyemi'], more: 4 },
  { date: '10 Feb 2027', season: 'Interim', names: ['R. Singh', 'M. Doyle'], more: 3 },
];
const UNALLOC = [
  ['A. Okafor', 'CT2'], ['R. Singh', 'ST4'], ['M. Doyle', 'CT1'], ['J. Bekele', 'ST5'],
  ['S. Patel', 'CT3'], ['L. Novak', 'ST6'], ['H. Kaur', 'ST4'], ['C. Adeyemi', 'CT2'],
  ['T. Whitfield', 'ST7'], ['E. Brennan', 'CT1'], ['P. Iqbal', 'ST5'], ['D. Marsh', 'CT3'],
];
const NAV = [
  ['grid', 'Dashboard', true], ['tasks', 'Outstanding Tasks'], ['people', 'Trainees'],
  ['building', 'Hospital Trusts'], ['clipboard', 'ARCPs'], ['calendar', 'Drop-in Sessions'],
  ['chart', 'Summaries'], ['mail', 'Invitations'], ['help', 'Help & Support'],
];

// ── Timeline scripts ─────────────────────────────────────────────────────────
const SWITCHES = [
  { t: 18.2, from: 'aug', to: 'feb' },
  { t: 23.5, from: 'feb', to: 'aug' },
];
const CLICKS = [18.2, 23.5, 35.8];
const CAPTIONS = [
  [6.8, 13.4, 'Every trainee, trust and date — one dashboard.'],
  [15.0, 25.8, 'Pick a rotation period — the whole page follows.'],
  [28.0, 34.4, 'Four live numbers: trainees, gaps, LTFT and WTE.'],
  [38.2, 45.8, 'Unallocated → the trainees who still need a placement.'],
  [48.6, 54.9, 'Live capacity for every hospital trust.'],
  [55.6, 59.4, 'Over capacity flags itself.'],
  [61.6, 67.2, 'Upcoming ARCPs, with every allocated trainee.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.6, x: 960, y: 516, z: 1.06 },
  { t: 15.8, x: 1084, y: 300, z: 1.32 },
  { t: 26.4, x: 1084, y: 306, z: 1.32 },
  { t: 28.4, x: 1088, y: 300, z: 1.36 },
  { t: 35.9, x: 1086, y: 296, z: 1.36 },
  { t: 36.8, x: 960, y: 400, z: 1.25 },
  { t: 38.2, x: 960, y: 430, z: 1.13 },
  { t: 46.6, x: 950, y: 460, z: 1.15 },
  { t: 48.0, x: 1084, y: 470, z: 1.3 },
  { t: 49.6, x: 1084, y: 490, z: 1.36 },
  { t: 54.6, x: 1084, y: 496, z: 1.36 },
  { t: 56.4, x: 1261, y: 430, z: 1.82 },
  { t: 59.6, x: 1261, y: 436, z: 1.82 },
  { t: 61.6, x: 1084, y: 700, z: 1.34 },
  { t: 67.4, x: 1084, y: 706, z: 1.34 },
  { t: 69.9, x: 960, y: 540, z: 1 },
  { t: 75, x: 960, y: 540, z: 1 },
];
const CURSOR = [
  { t: 13.9, x: 1520, y: 660, o: 0 },
  { t: 14.5, x: 1520, y: 660, o: 1 },
  { t: 17.0, x: SEL.nextX - 8, y: SEL.y - 6, o: 1 },
  { t: 20.9, x: SEL.nextX - 8, y: SEL.y - 6, o: 1 },
  { t: 22.8, x: SEL.prevX - 8, y: SEL.y - 6, o: 1 },
  { t: 26.2, x: SEL.prevX - 8, y: SEL.y - 6, o: 1 },
  { t: 28.8, x: 1310, y: 172, o: 1 },
  { t: 32.6, x: 1310, y: 172, o: 1 },
  { t: 34.8, x: metricCX(1), y: METRIC_Y + 60, o: 1 },
  { t: 36.8, x: metricCX(1), y: METRIC_Y + 60, o: 1 },
  { t: 37.3, x: metricCX(1), y: METRIC_Y + 112, o: 0 },
  { t: 38.8, x: 620, y: 520, o: 0 },
  { t: 39.4, x: 620, y: 520, o: 1 },
  { t: 41.6, x: 907, y: 310, o: 1 },
  { t: 45.6, x: 928, y: 318, o: 1 },
  { t: 46.5, x: 928, y: 318, o: 0 },
];

function kf(list, t, key, ease = Easing.easeInOutCubic) {
  if (t <= list[0].t) return list[0][key];
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i], b = list[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = b.t === a.t ? 1 : (t - a.t) / (b.t - a.t);
      return a[key] + (b[key] - a[key]) * ease(p);
    }
  }
  return list[list.length - 1][key];
}
function periodAt(t) {
  let from = 'aug', to = 'aug', last = -99;
  for (const s of SWITCHES) if (t >= s.t) { from = s.from; to = s.to; last = s.t; }
  const p = Easing.easeOutCubic(clamp((t - last) / 0.55, 0, 1));
  return { from, to, p, label: to === 'aug' ? 'Aug 2026' : 'Feb 2027', fromLabel: from === 'aug' ? 'Aug 2026' : 'Feb 2027' };
}

// ── Small UI atoms ───────────────────────────────────────────────────────────
const ICONS = {
  grid: 'M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z',
  tasks: 'M3 4h9M3 9h9M3 14h6M14 3l1.5 1.5L18 2',
  people: 'M6.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12.5 9a2 2 0 100-4M2 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M12 11.5c2 .3 3.5 1.6 3.5 3.5',
  building: 'M3 15V4l6-2v13M9 15V6l6 2v7M2 15h14M6 6h.01M6 9h.01M12 10h.01M12 12h.01',
  clipboard: 'M6 3h6v2H6zM5 4H4v12h10V4h-1M7 9h4M7 12h4',
  calendar: 'M3 5h12v10H3zM3 8h12M6 3v3M12 3v3',
  chart: 'M3 15V9M8 15V4M13 15v-7',
  mail: 'M2 4h14v10H2zM2 5l7 5 7-5',
  help: 'M9 16A7 7 0 109 2a7 7 0 000 14zM7 7a2 2 0 113.4 1.4c-.7.7-1.4 1-1.4 2M9 13h.01',
  back: 'M11 3L5 9l6 6',
  search: 'M8 13A5 5 0 108 3a5 5 0 000 10zM12 12l4 4',
};
function Icon({ name, size = 18, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d={ICONS[name]} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Tile({ size = 34, fs = 20, r = 9 }) {
  return <div style={{ width: size, height: size, borderRadius: r, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 800, fontSize: fs }}>a</div>;
}
function Flip({ from, to, p, style }) {
  if (from === to || p >= 1) return <div style={style}>{to}</div>;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ opacity: 1 - p, transform: `translateY(${-10 * p}px)` }}>{from}</div>
      <div style={{ position: 'absolute', inset: 0, opacity: p, transform: `translateY(${10 * (1 - p)}px)` }}>{to}</div>
    </div>
  );
}

// ── App chrome ───────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SB_W, height: WIN.h, background: '#fff', borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', padding: '22px 14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 20px' }}>
        <Tile /><span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 24, color: C.ink }}>adept</span>
      </div>
      {NAV.map(([ic, label, active]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 2, background: active ? C.navy : 'transparent', color: active ? '#fff' : C.inkSoft, fontSize: 15.5, fontWeight: active ? 600 : 500 }}>
          <Icon name={ic} color={active ? '#fff' : C.inkSoft} /><span>{label}</span>
        </div>
      ))}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px 0', borderTop: `1px solid ${C.line}` }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: C.tealFill, color: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>EM</div>
        <div><div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>Dr E. Marsh</div><div style={{ fontSize: 12, color: C.inkSoft }}>Programme Director</div></div>
      </div>
    </div>
  );
}
function TopBar({ title, back, right }) {
  return (
    <div style={{ position: 'absolute', left: SB_W, top: 0, width: WIN.w - SB_W, height: TB_H, background: '#fff', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: `0 ${PAD}px`, gap: 14 }}>
      {back && <Icon name="back" color={C.inkSoft} />}
      <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 22, color: C.ink }}>{title}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>{right}</div>
    </div>
  );
}
function PeriodSelector({ period, pressNext, pressPrev }) {
  const btn = (pressed) => ({ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #C7D2DF', background: pressed ? 'rgba(30,58,95,.12)' : '#FBFCFE', boxShadow: '0 1px 2px rgba(22,31,46,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy, fontSize: 19, fontWeight: 700, transform: pressed ? 'scale(0.9)' : 'none' });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={btn(pressPrev)}>‹</div>
      <div style={{ width: 150, textAlign: 'center' }}>
        <Flip from={period.fromLabel} to={period.label} p={period.p} style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.navy }} />
        <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 1 }}>rotation period</div>
      </div>
      <div style={btn(pressNext)}>›</div>
    </div>
  );
}

// ── Dashboard screen ─────────────────────────────────────────────────────────
function MetricCard({ i, m, period, hl, hover, press }) {
  const x = CIX - WIN.x + i * (CARD_W + 20), y = METRIC_Y - WIN.y;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: CARD_W, height: METRIC_H, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '16px 20px', boxShadow: hl > 0.02 ? `0 0 0 ${2.5 * hl}px rgba(30,58,95,${0.55 * hl})` : (hover ? '0 8px 22px rgba(22,31,46,0.10)' : '0 1px 2px rgba(22,31,46,0.04)'), transform: `translateY(${hover ? -3 : 0}px) scale(${press ? 0.975 : 1})` }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, letterSpacing: '.02em', textTransform: 'uppercase' }}>{m.label}</div>
      <Flip from={m[period.from]} to={m[period.to]} p={period.p} style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 38, color: m.accent || C.navy, marginTop: 8, lineHeight: 1 }} />
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 7 }}>{m.sub}</div>
    </div>
  );
}
function TrustCard({ i, tr, period, redPulse }) {
  const { x, y } = trustXY(i);
  const from = tr[period.from], to = tr[period.to];
  const val = from + (to - from) * period.p;
  const pct = Math.min(val / tr.cap, 1);
  const over = to > tr.cap;
  const overFrom = from > tr.cap;
  const badgeOp = over ? period.p : (overFrom ? 1 - period.p : 0);
  const pulse = over ? 1 + 0.05 * redPulse : 1;
  return (
    <div style={{ position: 'absolute', left: x - WIN.x, top: y - WIN.y, width: CARD_W, height: TRUST_H, background: '#fff', border: `1px solid ${over && badgeOp > 0.5 ? 'rgba(220,38,38,.45)' : C.line}`, borderRadius: 8, padding: '15px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 16, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{tr.name}</div>
        <div style={{ opacity: badgeOp, transform: `scale(${pulse})`, background: C.redFill, color: C.red, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>Over capacity</div>
      </div>
      <div style={{ marginTop: 14, height: 9, borderRadius: 999, background: C.soft, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 999, background: over && badgeOp > 0.5 ? C.red : C.green }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: C.inkSoft, fontWeight: 600 }}>
        <Flip from={`${from} / ${tr.cap} allocated`} to={`${to} / ${tr.cap} allocated`} p={period.p} style={{}} />
        <span>{tr.cap} slots</span>
      </div>
    </div>
  );
}
function ArcpCard({ i, a }) {
  const x = CIX - WIN.x + i * (ARCP_W + 24), y = ARCP_Y - WIN.y;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: ARCP_W, height: ARCP_H, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '15px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 17, color: C.ink }}>{a.date}</div>
        <div style={{ background: C.blueFill, color: C.blue, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{a.season}</div>
      </div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>ARCP panel · allocated trainees</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {a.names.map(n => <div key={n} style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600, color: C.ink }}>{n}</div>)}
        <div style={{ background: C.tealFill, borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, color: C.teal }}>+{a.more} more</div>
      </div>
    </div>
  );
}
function SectionHead({ y, text, right }) {
  return (
    <div style={{ position: 'absolute', left: CIX - WIN.x, top: y - WIN.y, width: CIW, display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.ink }}>{text}</span>
      <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>{right}</span>
    </div>
  );
}
function DashboardScreen({ t, period }) {
  const hlFor = (i) => { const s = 28.2 + i * 1.05; const p = clamp((t - s) / 1.0, 0, 1); return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI); };
  const hoverUn = t >= 34.6 && t < 36.6;
  const pressUn = t >= 35.8 && t < 36.1;
  const pressNext = t >= 18.2 && t < 18.45;
  const pressPrev = t >= 23.5 && t < 23.75;
  const redPulse = t >= 55 && t <= 59.4 ? Math.sin((t - 55) * 2.4) * 0.5 + 0.5 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar />
      <TopBar title="Dashboard" right={<PeriodSelector period={period} pressNext={pressNext} pressPrev={pressPrev} />} />
      {METRICS.map((m, i) => <MetricCard key={m.label} i={i} m={m} period={period} hl={hlFor(i)} hover={i === 1 && hoverUn} press={i === 1 && pressUn} />)}
      <SectionHead y={TRUST_HEAD_Y} text="Hospital trusts" right={`capacity for ${period.label}`} />
      {TRUSTS.map((tr, i) => <TrustCard key={tr.name} i={i} tr={tr} period={period} redPulse={redPulse} />)}
      <SectionHead y={ARCP_HEAD_Y} text="Upcoming ARCPs" right="next three panel dates" />
      {ARCPS.map((a, i) => <ArcpCard key={a.date} i={i} a={a} />)}
    </div>
  );
}

// ── Trainees screen (pre-filtered) ───────────────────────────────────────────
function TraineesScreen({ t, enterT }) {
  const chip = (label, active, ic) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: active ? C.navy : '#fff', color: active ? '#fff' : C.inkSoft, border: `1px solid ${active ? C.navy : C.line}`, borderRadius: 999, padding: '9px 18px', fontSize: 14, fontWeight: 600 }}>
      {ic && <Icon name={ic} size={15} color={active ? '#fff' : C.inkSoft} />}{label}{active && <span style={{ opacity: .7, marginLeft: 2 }}>×</span>}
    </div>
  );
  const gy = METRIC_Y - WIN.y + 66;
  const cardW = (CIW - 3 * 20) / 4, cardH = 170;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar />
      <TopBar title="Trainees" back right={<div style={{ fontSize: 14, fontWeight: 600, color: C.inkSoft }}>12 of 190 shown</div>} />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: METRIC_Y - WIN.y, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '9px 16px', width: 300, color: C.inkSoft, fontSize: 14 }}>
          <Icon name="search" size={15} color={C.inkSoft} />Search trainees…
        </div>
        {chip('Unallocated', true)}{chip('Aug 2026', false, 'calendar')}{chip('All grades')}
      </div>
      {UNALLOC.map(([name, grade], i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const d = clamp((t - enterT - 0.25 - i * 0.05) / 0.4, 0, 1);
        const e = Easing.easeOutCubic(d);
        const initials = name.split(' ').map(s => s[0]).join('').replace('.', '');
        return (
          <div key={name} style={{ position: 'absolute', left: CIX - WIN.x + col * (cardW + 20), top: gy + row * (cardH + 20), width: cardW, height: cardH, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '16px 20px', opacity: e, transform: `translateY(${(1 - e) * 14}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: C.blueFill, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{initials}</div>
              <div>
                <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 16, color: C.ink }}>{name}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>Anaesthetics</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
              <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 999, padding: '4px 12px', fontSize: 12.5, fontWeight: 700, color: C.navy }}>{grade}</div>
              <div style={{ background: C.amberFill, borderRadius: 999, padding: '4px 12px', fontSize: 12.5, fontWeight: 700, color: C.amber }}>No placement</div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: C.inkSoft }}>Aug 2026 rotation · awaiting allocation</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Overlays ─────────────────────────────────────────────────────────────────
function Cursor({ t }) {
  const o = kf(CURSOR, t, 'o', Easing.linear);
  if (o <= 0.01) return null;
  const x = kf(CURSOR, t, 'x'), y = kf(CURSOR, t, 'y');
  let s = 1, ripple = null;
  for (const ct of CLICKS) {
    const p = (t - ct) / 0.55;
    if (t >= ct - 0.12 && t < ct) s = 0.88;
    if (p >= 0 && p <= 1) {
      const e = Easing.easeOutCubic(p);
      ripple = <div style={{ position: 'absolute', left: -26 * e, top: -26 * e, width: 52 * e, height: 52 * e, borderRadius: '50%', border: `2.5px solid ${C.navy}`, opacity: 1 - p }} />;
    }
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, zIndex: 40 }}>
      {ripple}
      <svg width="30" height="30" viewBox="0 0 24 24" style={{ transform: `scale(${s})`, transformOrigin: '4px 4px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
        <path d="M5 3l14 8-6.5 1.5L9 19z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function Caption({ t, show }) {
  if (!show) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 984, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
      {CAPTIONS.map(([a, b, text]) => {
        if (t < a - 0.5 || t > b + 0.5) return null;
        const oIn = Easing.easeOutCubic(clamp((t - a) / 0.45, 0, 1));
        const oOut = 1 - Easing.easeInCubic(clamp((t - (b - 0.35)) / 0.35, 0, 1));
        const o = Math.min(oIn, oOut);
        return (
          <div key={text} style={{ position: 'absolute', opacity: o, transform: `translateY(${(1 - oIn) * 14}px)`, background: 'rgba(15,28,46,0.92)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: '-0.01em', padding: '16px 34px', borderRadius: 999, whiteSpace: 'nowrap' }}>
            {text}
          </div>
        );
      })}
    </div>
  );
}
function TitleCard({ t }) {
  const o = t < 5.7 ? 1 : 1 - Easing.easeInCubic(clamp((t - 5.7) / 0.7, 0, 1));
  if (o <= 0) return null;
  const e1 = Easing.easeOutCubic(clamp((t - 0.3) / 0.7, 0, 1));
  const e2 = Easing.easeOutCubic(clamp((t - 0.9) / 0.7, 0, 1));
  const e3 = Easing.easeOutCubic(clamp((t - 1.5) / 0.7, 0, 1));
  const drift = 1 + t * 0.004;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy, zIndex: 80, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${drift})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: e1, transform: `translateY(${(1 - e1) * 20}px)` }}>
          <div style={{ width: 84, height: 84, borderRadius: 21, background: '#fff', color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 800, fontSize: 48 }}>a</div>
          <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 72, color: '#fff', letterSpacing: '-0.01em' }}>adept</span>
        </div>
        <div style={{ opacity: e2, transform: `translateY(${(1 - e2) * 16}px)`, fontFamily: FONT_T, fontWeight: 700, fontSize: 54, color: '#fff', letterSpacing: '-0.01em' }}>Your programme at a glance</div>
        <div style={{ opacity: e3, transform: `translateY(${(1 - e3) * 12}px)`, fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Product tour · The dashboard</div>
      </div>
    </div>
  );
}
function EndCard({ t }) {
  const o = Easing.easeOutCubic(clamp((t - 70.2) / 0.8, 0, 1));
  if (o <= 0) return null;
  const e2 = Easing.easeOutCubic(clamp((t - 71.0) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy, zIndex: 80, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, transform: `scale(${1 + (t - 70) * 0.003})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: '#fff', color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 800, fontSize: 42 }}>a</div>
          <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 62, color: '#fff', letterSpacing: '-0.01em' }}>adept</span>
        </div>
        <div style={{ opacity: e2, fontFamily: FONT_T, fontWeight: 600, fontSize: 36, color: 'rgba(255,255,255,0.88)', textAlign: 'center', maxWidth: 1100, lineHeight: 1.3 }}>One governed platform for NHS postgraduate medical training.</div>
        <div style={{ opacity: e2, fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>support@adept-platforms.com</div>
      </div>
    </div>
  );
}

// ── Film ─────────────────────────────────────────────────────────────────────
function Film({ showCaptions }) {
  const t = useTime();
  const period = periodAt(t);
  const cx = kf(CAM, t, 'x'), cy = kf(CAM, t, 'y'), z = kf(CAM, t, 'z');
  // screen phases
  const dash1O = t < 36.2 ? 1 : 1 - Easing.easeInCubic(clamp((t - 36.2) / 0.5, 0, 1));
  const trainO = Math.min(
    Easing.easeOutCubic(clamp((t - 36.5) / 0.5, 0, 1)),
    1 - Easing.easeInCubic(clamp((t - 47.0) / 0.5, 0, 1))
  );
  const dash2O = Easing.easeOutCubic(clamp((t - 47.3) / 0.5, 0, 1));
  const showDash = dash1O > 0.01 || dash2O > 0.01;
  const dashO = Math.max(dash1O, dash2O);
  return (
    <div data-screen-label={`video t=${Math.floor(t)}s`} style={{ position: 'absolute', inset: 0, background: C.backdrop, fontFamily: FONT, overflow: 'hidden', boxSizing: 'border-box' }}>
      <style>{'[data-screen-label]{box-sizing:border-box}[data-screen-label] *{box-sizing:border-box}'}</style>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${960 - cx * z}px, ${540 - cy * z}px) scale(${z})`, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r, background: C.soft, boxShadow: '0 24px 70px rgba(19,39,63,0.18), 0 4px 14px rgba(19,39,63,0.08)', overflow: 'hidden' }}>
          {showDash && <div style={{ position: 'absolute', inset: 0, opacity: dashO }}><DashboardScreen t={t} period={period} /></div>}
          {trainO > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: trainO }}><TraineesScreen t={t} enterT={36.5} /></div>}
        </div>
        <Cursor t={t} />
      </div>
      <Caption t={t} show={showCaptions} />
      <TitleCard t={t} />
      <EndCard t={t} />
    </div>
  );
}

function AdeptDashboardVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={75} background={C.backdrop} persistKey="adeptdash">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}

window.AdeptDashboardVideo = AdeptDashboardVideo;
})();
