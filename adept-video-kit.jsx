// Adept video kit — shared chrome + helpers for all walkthrough chapters.
// Load AFTER animations.jsx. Exposes window.AdeptKit.
/* global React */
(() => {
const { Easing, clamp } = window;

const C = {
  navy: '#1E3A5F', navyDeep: '#13273F', ink: '#161F2E', inkSoft: '#55617A',
  line: '#E1E6EE', paper: '#FFFFFF', soft: '#F1F4F8', backdrop: '#E4EAF2',
  teal: '#0E8F82', tealFill: 'rgba(14,143,130,.12)',
  amber: '#C9812E', amberFill: 'rgba(201,129,46,.14)',
  green: '#10B981', greenFill: 'rgba(16,185,129,.13)',
  red: '#DC2626', redFill: 'rgba(220,38,38,.10)',
  blue: '#2563EB', blueFill: 'rgba(37,99,235,.10)',
  purple: '#7A5CC0', purpleFill: 'rgba(122,92,192,.13)',
  stage2: '#F59E0B', stage3: '#10B981', paused: '#9AA5B4',
};
const FONT = "'Inter', system-ui, sans-serif";
const FONT_T = "'Inter Tight', 'Inter', system-ui, sans-serif";
const WIN = { x: 110, y: 64, w: 1700, h: 952, r: 16 };
const SB_W = 248, TB_H = 64, PAD = 28;
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
  chart: 'M3 15V9M8 15V4M13 15v-7',
  mail: 'M2 4h14v10H2zM2 5l7 5 7-5',
  help: 'M9 16A7 7 0 109 2a7 7 0 000 14zM7 7a2 2 0 113.4 1.4c-.7.7-1.4 1-1.4 2M9 13h.01',
  back: 'M11 3L5 9l6 6',
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
};
function Icon({ name, size = 18, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d={ICONS[name]} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Tile({ size = 34, fs = 20, r = 9, inv }) {
  return <div style={{ width: size, height: size, borderRadius: r, background: inv ? '#fff' : C.navy, color: inv ? C.navy : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 800, fontSize: fs, flexShrink: 0 }}>a</div>;
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

const NAV = [
  ['grid', 'Dashboard'], ['tasks', 'Outstanding Tasks'], ['people', 'Trainees'],
  ['building', 'Hospital Trusts'], ['clipboard', 'ARCPs'], ['calendar', 'Drop-in Sessions'],
  ['chart', 'Summaries'], ['mail', 'Invitations'], ['help', 'Help & Support'],
];
function Sidebar({ active }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SB_W, height: WIN.h, background: '#fff', borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', padding: '22px 14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px 20px' }}>
        <Tile /><span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 24, color: C.ink }}>adept</span>
      </div>
      {NAV.map(([ic, label]) => {
        const on = label === active;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 2, background: on ? C.navy : 'transparent', color: on ? '#fff' : C.inkSoft, fontSize: 15.5, fontWeight: on ? 600 : 500 }}>
            <Icon name={ic} color={on ? '#fff' : C.inkSoft} /><span>{label}</span>
          </div>
        );
      })}
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
function AppWindow({ children }) {
  return (
    <div style={{ position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r, background: C.soft, boxShadow: '0 24px 70px rgba(19,39,63,0.18), 0 4px 14px rgba(19,39,63,0.08)', overflow: 'hidden' }}>
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
          <div key={text} style={{ position: 'absolute', opacity: o, transform: `translateY(${(1 - oIn) * 14}px)`, background: 'rgba(15,28,46,0.92)', color: '#fff', fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: '-0.01em', padding: '16px 34px', borderRadius: 999, whiteSpace: 'nowrap' }}>
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
          <Tile inv size={84} fs={48} r={21} />
          <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 72, color: '#fff', letterSpacing: '-0.01em' }}>adept</span>
        </div>
        <div style={{ opacity: e2, transform: `translateY(${(1 - e2) * 16}px)`, fontFamily: FONT_T, fontWeight: 700, fontSize: 54, color: '#fff', letterSpacing: '-0.01em', textAlign: 'center', maxWidth: 1400 }}>{heading}</div>
        <div style={{ opacity: e3, transform: `translateY(${(1 - e3) * 12}px)`, fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '.12em', textTransform: 'uppercase' }}>{kicker}</div>
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
          <Tile inv size={72} fs={42} r={18} />
          <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 62, color: '#fff', letterSpacing: '-0.01em' }}>adept</span>
        </div>
        <div style={{ opacity: e2, fontFamily: FONT_T, fontWeight: 600, fontSize: 36, color: 'rgba(255,255,255,0.88)', textAlign: 'center', maxWidth: 1100, lineHeight: 1.3 }}>One governed platform for NHS postgraduate medical training.</div>
        <div style={{ opacity: e2, fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>support@adept-platforms.com</div>
      </div>
    </div>
  );
}
const chip = (label, bg, color, extra) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color, fontSize: 12.5, fontWeight: 700, padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap', ...extra }}>{label}</div>
);
const card = (extra) => ({ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, ...extra });
const btnPrimary = (pressed, extra) => ({ display: 'inline-flex', alignItems: 'center', gap: 10, background: C.navy, color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 15.5, padding: '11px 22px', borderRadius: 8, transform: pressed ? 'scale(0.95)' : 'none', boxShadow: '0 1px 3px rgba(19,39,63,.2)', ...extra });

window.AdeptKit = { C, FONT, FONT_T, WIN, SB_W, TB_H, PAD, CIX, CIW, CARD_W, ICONS, Icon, Tile, Flip, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard, chip, card, btnPrimary };
})();
