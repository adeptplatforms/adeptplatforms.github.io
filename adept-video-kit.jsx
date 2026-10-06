// Adept video kit — shared chrome + helpers for all walkthrough chapters.
// Load AFTER animations.jsx. Exposes window.AdeptKit.
//
// Redrawn 7 Oct 2026 for the app's redesign: a white page on a pale sidebar,
// sections divided by space and hairlines (cards only where the app has
// them), sentence-case headings, Inter never heavier than semibold (600),
// trust colours as small swatches and bars beside the name. Sizes are the
// app's own at 1440 px: the film's window draws the same 248 px sidebar.
/* global React */
(() => {
const { Easing, clamp } = window;

// The app's light theme (flutter_flow_theme.dart) plus the older names the
// chapters used, mapped onto it.
const C = {
  navy: '#1E3A5F', navyDeep: '#13273F', ink: '#161F2E', inkSoft: '#55617A',
  line: '#E1E6EE', paper: '#FFFFFF', soft: '#F1F4F8', backdrop: '#E4EAF2',
  field: '#7F8A9D', activeTint: 'rgba(30,58,95,.12)', hover: 'rgba(30,58,95,.05)',
  success: '#047857', successFill: 'rgba(4,120,87,.12)',
  warning: '#9A5B13', warningFill: 'rgba(154,91,19,.12)',
  error: '#C81E1E', errorFill: 'rgba(200,30,30,.10)',
  teal: '#0F766E', tealFill: 'rgba(15,118,110,.12)',
  amber: '#9A5B13', amberFill: 'rgba(154,91,19,.12)',
  green: '#047857', greenFill: 'rgba(4,120,87,.12)',
  red: '#C81E1E', redFill: 'rgba(200,30,30,.10)',
  blue: '#1D4ED8', blueFill: 'rgba(29,78,216,.10)',
  purple: '#6D4FB3', purpleFill: 'rgba(109,79,179,.12)',
  stage2: '#AF6005', stage3: '#04855D', paused: '#9AA5B4',
};
// Trust colours: the app's deeper palette (hospital_colors.dart), each at
// least 4.5:1 with white. A trust keeps its colour in every chapter.
const TRUST = {
  'Caldermere General': '#4F46E5',
  'Ellerbeck Royal Infirmary': '#0B8177',
  'Skelton Bridge': '#E11D48',
  'Harewood Vale': '#AF6005',
  'Wharfemoor Park': '#04855D',
  'Netherfield & District': '#027AB8',
  'Ousegate Teaching': '#7C3AED',
};
const trustColour = (name) => TRUST[name] || '#64748B';
const FONT = "'Inter', system-ui, sans-serif";
const FONT_T = "'Inter Tight', 'Inter', system-ui, sans-serif"; // the wordmark only
const WIN = { x: 110, y: 64, w: 1700, h: 952, r: 16 };
const SB_W = 248, TB_H = 64, PAD = 24;
const CIX = WIN.x + SB_W + PAD;
const CIW = WIN.x + WIN.w - PAD - CIX;
const CARD_W = (CIW - 3 * 20) / 4;

const ICONS = {
  grid: 'M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z',
  tasks: 'M3 4h9M3 9h9M3 14h6M14 3l1.5 1.5L18 2',
  people: 'M6.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12.5 9a2 2 0 100-4M2 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M12 11.5c2 .3 3.5 1.6 3.5 3.5',
  building: 'M3 15V4l6-2v13M9 15V6l6 2v7M2 15h14M6 6h.01M6 9h.01M12 10h.01M12 12h.01',
  clipboard: 'M6 3h6v2H6zM5 4H4v12h10V4h-1M7 9h4M7 12h4',
  calendar: 'M3 5h12v10H3zM3 8h12M6 3v3M12 3v3',
  door: 'M4 16V3h8v13M2 16h14M10 9h.01',
  cap: 'M1.5 7L9 3.5 16.5 7 9 10.5zM4.5 8.5v4c1.2 1.2 2.7 1.8 4.5 1.8s3.3-.6 4.5-1.8v-4M16.5 7v4',
  chart: 'M3 15V9M8 15V4M13 15v-7',
  mail: 'M2 4h14v10H2zM2 5l7 5 7-5',
  help: 'M9 16A7 7 0 109 2a7 7 0 000 14zM7 7a2 2 0 113.4 1.4c-.7.7-1.4 1-1.4 2M9 13h.01',
  back: 'M11 3L5 9l6 6',
  next: 'M7 3l6 6-6 6',
  down: 'M4 7l5 5 5-5',
  arrow: 'M3 9h12M10 4l5 5-5 5',
  search: 'M8 13A5 5 0 108 3a5 5 0 000 10zM12 12l4 4',
  plus: 'M9 3v12M3 9h12',
  check: 'M3 10l4 4 8-9',
  x: 'M4 4l10 10M14 4L4 14',
  doc: 'M5 2h6l3 3v11H5zM11 2v3h3M7 9h4M7 12h4',
  upload: 'M9 12V3m0 0L5.5 6.5M9 3l3.5 3.5M3 15h12',
  download: 'M9 3v9m0 0L5.5 8.5M9 12l3.5-3.5M3 15h12',
  shield: 'M9 2l6 2v5c0 4-2.5 6-6 7-3.5-1-6-3-6-7V4z',
  lock: 'M5 8V6a4 4 0 018 0v2M4 8h10v7H4zM9 11v2',
  menu: 'M3 5h12M3 9h12M3 13h12',
  list: 'M6 5h9M6 9h9M6 13h9M3 5h.01M3 9h.01M3 13h.01',
  tiles: 'M3 3h5v5H3zM10 3h5v5h-5zM3 10h5v5H3zM10 10h5v5h-5z',
  edit: 'M3 15l1-4 8-8 3 3-8 8zM11 4l3 3',
  filter: 'M3 4h12M5 9h8M7 14h4',
  more: 'M4 9h.01M9 9h.01M14 9h.01',
  gear: 'M9 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM9 1.8v2M9 14.2v2M1.8 9h2M14.2 9h2M3.9 3.9l1.4 1.4M12.7 12.7l1.4 1.4M3.9 14.1l1.4-1.4M12.7 5.3l1.4-1.4',
  sun: 'M9 12a3 3 0 100-6 3 3 0 000 6zM9 1.5v1.8M9 14.7v1.8M1.5 9h1.8M14.7 9h1.8',
  moon: 'M15 10.5A6.5 6.5 0 017.5 3 6.5 6.5 0 1015 10.5z',
  swap: 'M3 6h11l-3-3M15 12H4l3 3',
};
function Icon({ name, size = 18, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d={ICONS[name]} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
// The "a" tile of the logo. Semibold, like the app's wordmark.
function Tile({ size = 30, fs = 18, r = 7, inv }) {
  return <div style={{ width: size, height: size, borderRadius: r, background: inv ? '#fff' : C.navy, color: inv ? C.navy : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 600, fontSize: fs, flexShrink: 0 }}>a</div>;
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

// ── Chrome ───────────────────────────────────────────────────────────────────
const NAV = [
  ['grid', 'Dashboard'], ['people', 'Trainees'], ['building', 'Hospital trusts'],
  ['tasks', 'Tasks'], ['clipboard', 'ARCPs'], ['door', 'Meetings'], ['cap', 'Teaching'],
  ['chart', 'Summaries'], ['mail', 'Invitations'], ['help', 'Help & support'],
];
// The app's sidebar: pale panel, the page you are on in a navy tint with
// semibold text, the appearance control and who is signed in at the foot.
function Sidebar({ active, user = { initials: 'EM', name: 'Dr E. Marsh', role: 'TPD', region: 'Northdale Deanery' } }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SB_W, height: WIN.h, background: C.soft, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', padding: '24px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 0 24px' }}>
        <Tile /><span style={{ fontFamily: FONT_T, fontWeight: 600, fontSize: 24, color: C.ink, letterSpacing: '-0.01em' }}>adept</span>
        <div style={{ marginLeft: 'auto' }}><Icon name="x" size={16} color={C.inkSoft} /></div>
      </div>
      {NAV.map(([ic, label]) => {
        const on = label === active;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 42, padding: '0 14px', borderRadius: 8, marginBottom: 6, background: on ? C.activeTint : 'transparent', color: on ? C.ink : C.inkSoft, fontSize: 15.5, fontWeight: on ? 600 : 400 }}>
            <Icon name={ic} size={20} color={on ? C.navy : C.inkSoft} /><span>{label}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
        <div style={{ display: 'flex', border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', background: '#fff', height: 32 }}>
          {['gear', 'sun', 'moon'].map((ic, i) => (
            <div key={ic} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? C.activeTint : 'transparent' }}><Icon name={ic} size={14} color={i === 0 ? C.navy : C.inkSoft} /></div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px 0' }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: C.tealFill, color: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{user.initials}</div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{user.name}</div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{user.role}</div>
            {user.region && <div style={{ fontSize: 13, color: C.inkSoft }}>{user.region}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
// The page header: white, a hairline below, a 22 px semibold title.
function TopBar({ title, back, right }) {
  return (
    <div style={{ position: 'absolute', left: SB_W, top: 0, width: WIN.w - SB_W, height: TB_H, background: '#fff', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: `0 ${PAD}px`, gap: 16 }}>
      {back && <Icon name="back" size={20} color={C.ink} />}
      <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.ink }}>{title}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: C.inkSoft }}>{right}</div>
    </div>
  );
}
// Film root: backdrop + box-sizing guard + timestamp label.
function FilmRoot({ t, children, bg }) {
  return (
    <div data-screen-label={`video t=${Math.floor(t)}s`} style={{ position: 'absolute', inset: 0, background: bg || C.backdrop, fontFamily: FONT, overflow: 'hidden', boxSizing: 'border-box' }}>
      <style>{'[data-screen-label]{box-sizing:border-box}[data-screen-label] *{box-sizing:border-box}'}</style>
      {children}
    </div>
  );
}
function Camera({ t, cam, children }) {
  const cx = kf(cam, t, 'x'), cy = kf(cam, t, 'y'), z = kf(cam, t, 'z');
  return <div style={{ position: 'absolute', inset: 0, transform: `translate(${960 - cx * z}px, ${540 - cy * z}px) scale(${z})`, transformOrigin: '0 0' }}>{children}</div>;
}
// The app window: the page is white (the app's secondaryBackground).
function AppWindow({ children }) {
  return (
    <div style={{ position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r, background: '#fff', boxShadow: '0 24px 70px rgba(19,39,63,0.18), 0 4px 14px rgba(19,39,63,0.08)', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
function Cursor({ t, path, clicks = [] }) {
  const o = kf(path, t, 'o', Easing.linear);
  if (o <= 0.01) return null;
  const x = kf(path, t, 'x'), y = kf(path, t, 'y');
  let s = 1, ripple = null;
  for (const ct of clicks) {
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
function Captions({ t, list, show = true }) {
  if (!show) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 984, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
      {list.map(([a, b, text]) => {
        if (t < a - 0.5 || t > b + 0.5) return null;
        const oIn = Easing.easeOutCubic(clamp((t - a) / 0.45, 0, 1));
        const oOut = 1 - Easing.easeInCubic(clamp((t - (b - 0.35)) / 0.35, 0, 1));
        const o = Math.min(oIn, oOut);
        return (
          <div key={text} style={{ position: 'absolute', opacity: o, transform: `translateY(${(1 - oIn) * 14}px)`, background: 'rgba(15,28,46,0.92)', color: '#fff', fontFamily: FONT, fontWeight: 500, fontSize: 30, letterSpacing: '-0.01em', padding: '16px 34px', borderRadius: 999, whiteSpace: 'nowrap' }}>
            {text}
          </div>
        );
      })}
    </div>
  );
}
function TitleCard({ t, outAt = 5.7, heading, kicker }) {
  const o = t < outAt ? 1 : 1 - Easing.easeInCubic(clamp((t - outAt) / 0.7, 0, 1));
  if (o <= 0) return null;
  const e1 = Easing.easeOutCubic(clamp((t - 0.3) / 0.7, 0, 1));
  const e2 = Easing.easeOutCubic(clamp((t - 0.9) / 0.7, 0, 1));
  const e3 = Easing.easeOutCubic(clamp((t - 1.5) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy, zIndex: 80, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${1 + t * 0.004})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: e1, transform: `translateY(${(1 - e1) * 20}px)` }}>
          <Tile inv size={84} fs={50} r={20} />
          <span style={{ fontFamily: FONT_T, fontWeight: 600, fontSize: 72, color: '#fff', letterSpacing: '-0.01em' }}>adept</span>
        </div>
        <div style={{ opacity: e2, transform: `translateY(${(1 - e2) * 16}px)`, fontFamily: FONT, fontWeight: 600, fontSize: 54, color: '#fff', letterSpacing: '-0.015em', textAlign: 'center', maxWidth: 1400 }}>{heading}</div>
        <div style={{ opacity: e3, transform: `translateY(${(1 - e3) * 12}px)`, fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>{kicker}</div>
      </div>
    </div>
  );
}
function EndCard({ t, inAt }) {
  const o = Easing.easeOutCubic(clamp((t - inAt) / 0.8, 0, 1));
  if (o <= 0) return null;
  const e2 = Easing.easeOutCubic(clamp((t - inAt - 0.8) / 0.7, 0, 1));
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy, zIndex: 80, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, transform: `scale(${1 + Math.max(0, t - inAt) * 0.003})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Tile inv size={72} fs={43} r={17} />
          <span style={{ fontFamily: FONT_T, fontWeight: 600, fontSize: 62, color: '#fff', letterSpacing: '-0.01em' }}>adept</span>
        </div>
        <div style={{ opacity: e2, fontFamily: FONT, fontWeight: 500, fontSize: 36, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 1100, lineHeight: 1.3 }}>One governed platform for NHS postgraduate medical training.</div>
        <div style={{ opacity: e2, fontSize: 22, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>support@adept-platforms.com</div>
      </div>
    </div>
  );
}

// ── The redesign's building blocks (lib/flutter_flow/quiet_ui.dart) ─────────
// Use these rather than inventing a card: the app divides by space and
// hairlines, and keeps cards for a few framed panels (filters, dialogs,
// profile sections).

// A small pill. Tones: 'neutral' (grade), 'success', 'warning', 'error',
// 'teal', 'blue', 'purple'. Never uppercase, never heavier than 600.
const TONES = {
  neutral: [C.soft, C.ink, C.line], success: [C.successFill, C.success], warning: [C.warningFill, C.warning],
  error: [C.errorFill, C.error], teal: [C.tealFill, C.teal], blue: [C.blueFill, C.blue], purple: [C.purpleFill, C.purple],
};
function Pill({ text, tone = 'neutral', size = 14, style }) {
  const [bg, fg, bd] = TONES[tone] || TONES.neutral;
  return <span style={{ display: 'inline-flex', alignItems: 'center', background: bg, color: fg, border: bd ? `1px solid ${bd}` : 'none', fontSize: size, fontWeight: 500, padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap', lineHeight: 1.45, ...style }}>{text}</span>;
}
// Kept for the older chapters: a pill from raw colours, now at weight 600.
const chip = (label, bg, color, extra) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color, fontSize: 13, fontWeight: 600, padding: '3px 11px', borderRadius: 999, whiteSpace: 'nowrap', ...extra }}>{label}</div>
);
// A framed panel, where the app still has one.
const card = (extra) => ({ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, ...extra });
// Buttons: 44 px high, radius 8, semibold.
const btnPrimary = (pressed, extra) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 44, background: C.navy, color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 15, padding: '0 20px', borderRadius: 8, transform: pressed ? 'scale(0.95)' : 'none', boxShadow: '0 1px 2px rgba(19,39,63,.18)', whiteSpace: 'nowrap', ...extra });
const btnOutline = (pressed, extra) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 44, background: '#fff', color: C.navy, border: `1px solid ${C.navy}`, fontFamily: FONT, fontWeight: 500, fontSize: 15, padding: '0 18px', borderRadius: 8, transform: pressed ? 'scale(0.95)' : 'none', whiteSpace: 'nowrap', ...extra });
// A filter chip: navy fill when on, outlined when off.
function FilterChip({ text, on, style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 13px', borderRadius: 999, background: on ? C.navy : '#fff', color: on ? '#fff' : C.ink, border: `1px solid ${on ? C.navy : C.field}`, fontSize: 15, fontWeight: on ? 600 : 400, whiteSpace: 'nowrap', ...style }}>{text}</span>;
}
// Section heading: sentence case, 18 px semibold; an arrow when it opens a page.
function SectionTitle({ text, arrow, right, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      <span style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>{text}</span>
      {arrow && <Icon name="arrow" size={16} color={C.navy} />}
      {right && <span style={{ marginLeft: 'auto', fontSize: 15, color: C.inkSoft }}>{right}</span>}
    </div>
  );
}
// A row between hairlines: an optional lead (figure or icon), a title and a
// subtitle, an optional trailing part and chevron.
function QuietRow({ lead, title, sub, trail, chevron, height = 56, hl = 0, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height, padding: '0 8px', borderBottom: `1px solid ${C.line}`, background: hl > 0.01 ? `rgba(30,58,95,${0.06 * hl})` : 'transparent', ...style }}>
      {lead !== undefined && <div style={{ width: 48, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{lead}</div>}
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 14.5, color: C.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      {trail}
      {chevron && <Icon name="next" size={16} color={C.inkSoft} />}
    </div>
  );
}
// The leading count of a "Needs your attention" row (warning when non-zero),
// or a green tick when there is nothing to do.
function Count({ n, tone = 'warning', size = 22 }) {
  if (n === 0 || n === '0') {
    return <div style={{ width: 22, height: 22, borderRadius: 11, background: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={13} color="#fff" sw={2.2} /></div>;
  }
  return <span style={{ fontSize: size, fontWeight: 600, color: tone === 'warning' ? C.warning : C.ink, fontVariantNumeric: 'tabular-nums' }}>{n}</span>;
}
// A figure and its caption: "121" over "trainees in this rotation".
function Figure({ value, caption, style }) {
  return (
    <div style={{ lineHeight: 1.25, ...style }}>
      <div style={{ fontSize: 22, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 14.5, color: C.inkSoft }}>{caption}</div>
    </div>
  );
}
// A trust's colour swatch, always beside its name.
function Swatch({ name, color, size = 12 }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: 2, background: color || trustColour(name), flexShrink: 0 }} />;
}
function TrustName({ name, size = 15, weight = 400, color = C.ink }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: size, fontWeight: weight, color, whiteSpace: 'nowrap' }}><Swatch name={name} size={10} />{name}</span>;
}
// Capacity bar in the trust's own colour on a pale track.
function CapBar({ value, cap, color, width = 160 }) {
  const pct = Math.max(0, Math.min(value / cap, 1));
  return <div style={{ width, height: 6, borderRadius: 3, background: C.line, overflow: 'hidden' }}><div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 3, background: color }} /></div>;
}
// Initials avatar: a filled circle with white semibold initials.
const AVATAR = ['#1E3A5F', '#0F766E', '#1D4ED8', '#13273F', '#475569', '#0E7490'];
function Avatar({ name, size = 32, i }) {
  const initials = name.replace(/^Dr\.? /, '').split(' ').map((s) => s[0]).join('').replace('.', '').slice(0, 2);
  const k = i !== undefined ? i : [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return <div style={{ width: size, height: size, borderRadius: size / 2, background: AVATAR[k % AVATAR.length], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>{initials}</div>;
}
// A 40 x 40 square button with a 3:1 outline (period switcher, toggles).
function Square({ icon, pressed, size = 40 }) {
  return <div style={{ width: size, height: size, borderRadius: 8, border: `1px solid ${C.field}`, background: pressed ? C.activeTint : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: pressed ? 'scale(0.92)' : 'none' }}><Icon name={icon} size={18} color={C.ink} /></div>;
}
// Previous / label / next. [label] may be a node (a Flip).
function PeriodSwitcher({ label, pressPrev, pressNext, minW = 130 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Square icon="back" pressed={pressPrev} />
      <div style={{ minWidth: minW, padding: '0 10px', textAlign: 'center', fontSize: 15, fontWeight: 600, color: C.ink }}>{label}</div>
      <Square icon="next" pressed={pressNext} />
    </div>
  );
}
// The list / grid switch every list screen has.
function ViewToggle({ grid }) {
  const half = (ic, on) => <div style={{ width: 40, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.activeTint : '#fff' }}><Icon name={ic} size={17} color={on ? C.navy : C.inkSoft} /></div>;
  return <div style={{ display: 'flex', border: `1px solid ${C.field}`, borderRadius: 8, overflow: 'hidden' }}>{half('list', !grid)}{half('tiles', grid)}</div>;
}
// A tick box, as on the trainee table.
function Tick({ on, size = 18 }) {
  return <div style={{ width: size, height: size, borderRadius: 3, border: `1.5px solid ${on ? C.navy : C.field}`, background: on ? C.navy : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Icon name="check" size={12} color="#fff" sw={2.2} />}</div>;
}
// A search field (44 px, pale fill, field outline).
function SearchField({ text = 'Search trainees by name', width = 420, value }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 50, width, padding: '0 14px', border: `1px solid ${C.field}`, borderRadius: 8, background: C.soft, fontSize: 16, color: value ? C.ink : C.inkSoft }}><Icon name="search" size={18} color={C.inkSoft} />{value || text}</div>;
}

window.AdeptKit = {
  C, TRUST, trustColour, FONT, FONT_T, WIN, SB_W, TB_H, PAD, CIX, CIW, CARD_W, ICONS, Icon, Tile, Flip, kf,
  Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard,
  chip, card, btnPrimary, btnOutline, Pill, FilterChip, SectionTitle, QuietRow, Count, Figure,
  Swatch, TrustName, CapBar, Avatar, Square, PeriodSwitcher, ViewToggle, Tick, SearchField,
};
})();
