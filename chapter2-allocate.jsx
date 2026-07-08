// Adept walkthrough — Chapter 2: "Allocating trainees to trusts" (68s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, WIN, TB_H, PAD, CIX, CIW, CARD_W, Icon, Flip, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard } = K;

const SEL = { prevX: 1557, nextX: 1765, y: WIN.y + TB_H / 2 };
const ALLOC_BTN = { x: 1668, y: WIN.y + 114 };
const SHEET_TOP = 330; // window-rel
const ROW_X = 880, ROW_Y0 = 542, ROW_STEP = 74; // stage coords of available rows (checkbox)
const SHEET_BTN = { x: 1705, y: 818 }; // measured: button world center ≈ (1713,824); cursor tip = origin+(4,4)

const CAPTIONS = [
  [6.6, 12.8, 'Open a trust — its capacity for the period, in one card.'],
  [13.6, 17.2, 'Allocating takes one sheet, not a spreadsheet.'],
  [19.2, 25.6, 'Who’s already here, and who’s available.'],
  [26.4, 32.4, 'Tap to select — returners can be pre-selected.'],
  [35.4, 41.6, 'Capacity, head count and WTE update instantly.'],
  [43.5, 49.5, 'Future rotations plan the same way — change the period.'],
  [51.5, 57.2, 'Every trust, every period, correctly counted.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.4, x: 960, y: 516, z: 1.06 },
  { t: 14.8, x: 1084, y: 300, z: 1.34 },
  { t: 17.2, x: 1084, y: 306, z: 1.34 },
  { t: 18.8, x: 960, y: 660, z: 1.15 },
  { t: 32.8, x: 960, y: 666, z: 1.15 },
  { t: 35.0, x: 1092, y: 420, z: 1.4 },
  { t: 41.4, x: 1092, y: 426, z: 1.4 },
  { t: 43.2, x: 1120, y: 300, z: 1.34 },
  { t: 49.4, x: 1120, y: 306, z: 1.34 },
  { t: 51.4, x: 960, y: 540, z: 1.08 },
  { t: 57.8, x: 960, y: 540, z: 1.02 },
  { t: 68, x: 960, y: 540, z: 1.02 },
];
const CURSOR = [
  { t: 13.6, x: 1500, y: 700, o: 0 },
  { t: 14.2, x: 1500, y: 700, o: 1 },
  { t: 16.0, x: ALLOC_BTN.x, y: ALLOC_BTN.y, o: 1 },
  { t: 19.2, x: ALLOC_BTN.x, y: ALLOC_BTN.y, o: 1 },
  { t: 22.6, x: ROW_X, y: ROW_Y0, o: 1 },
  { t: 25.6, x: ROW_X, y: ROW_Y0, o: 1 },
  { t: 26.6, x: ROW_X, y: ROW_Y0 + ROW_STEP, o: 1 },
  { t: 29.8, x: ROW_X, y: ROW_Y0 + ROW_STEP, o: 1 },
  { t: 31.6, x: SHEET_BTN.x, y: SHEET_BTN.y, o: 1 },
  { t: 34.4, x: SHEET_BTN.x, y: SHEET_BTN.y, o: 1 },
  { t: 34.9, x: SHEET_BTN.x, y: SHEET_BTN.y, o: 0 },
  { t: 42.5, x: 1550, y: 650, o: 0 },
  { t: 43.0, x: 1550, y: 650, o: 1 },
  { t: 44.6, x: SEL.nextX - 8, y: SEL.y - 6, o: 1 },
  { t: 47.4, x: SEL.nextX - 8, y: SEL.y - 6, o: 1 },
  { t: 48.2, x: SEL.nextX - 8, y: SEL.y - 6, o: 0 },
];
const CLICKS = [17.0, 24.5, 27.5, 33.2, 45.0];

// Trust numbers as a function of time (switches at 34.2 allocate, 45.2 period)
function stateAt(t) {
  const states = [
    { at: -99, period: 'Aug 2026', alloc: 28, head: 30, wte: '27.4', note: 'current rotation' },
    { at: 34.2, period: 'Aug 2026', alloc: 30, head: 32, wte: '29.4', note: 'current rotation' },
    { at: 45.2, period: 'Feb 2027', alloc: 25, head: 27, wte: '24.6', note: 'planned rotation' },
  ];
  let cur = states[0], prev = states[0];
  for (const s of states) if (t >= s.at) { prev = cur; cur = s; }
  const p = Easing.easeOutCubic(clamp((t - cur.at) / 0.55, 0, 1));
  return { cur, prev, p };
}

const ALLOCATED = [
  ['H. Kaur', 'ST4', 'ltft'], ['T. Whitfield', 'ST7'], ['C. Adeyemi', 'CT2'], ['P. Iqbal', 'ST5'],
  ['E. Brennan', 'CT1'], ['D. Marsh', 'CT3'], ['J. Bekele', 'ST5', 'ltft'], ['L. Hughes', 'ST6'],
];
const AVAILABLE = [
  ['A. Okafor', 'CT2'], ['R. Singh', 'ST4'], ['M. Doyle', 'CT1'], ['S. Patel', 'CT3'], ['L. Novak', 'ST6'],
];

function StatCard({ i, label, value, sub, flip }) {
  return (
    <div style={{ position: 'absolute', left: CIX - WIN.x + i * (CARD_W + 20), top: 156, width: CARD_W, height: 108, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '14px 20px' }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.inkSoft, letterSpacing: '.02em', textTransform: 'uppercase' }}>{label}</div>
      {flip ? <Flip from={flip.from} to={flip.to} p={flip.p} style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 34, color: C.navy, marginTop: 7, lineHeight: 1 }} /> :
        <div style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 34, color: C.navy, marginTop: 7, lineHeight: 1 }}>{value}</div>}
      <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 6 }}>{sub}</div>
    </div>
  );
}
function AllocCard({ col, row, name, grade, tag, popT, t }) {
  const e = popT ? Easing.easeOutBack(clamp((t - popT) / 0.5, 0, 1)) : 1;
  if (popT && t < popT) return null;
  const w = (CIW - 3 * 16) / 4;
  return (
    <div style={{ position: 'absolute', left: CIX - WIN.x + col * (w + 16), top: 330 + row * 112, width: w, height: 96, background: '#F3FBF7', border: `1px solid rgba(16,185,129,.35)`, borderRadius: 8, padding: '13px 16px', transform: `scale(${0.8 + 0.2 * e})`, opacity: Math.min(1, e * 1.4) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 15.5, color: C.ink, flex: 1, whiteSpace: 'nowrap' }}>{name}</div>
        {tag === 'ltft' && <div style={{ background: C.tealFill, color: C.teal, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>LTFT</div>}
        {tag === 'new' && <div style={{ background: C.blueFill, color: C.blue, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>New</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, color: C.navy }}>{grade}</div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.green, alignSelf: 'center' }}>Allocated</div>
      </div>
    </div>
  );
}
function Sheet({ t }) {
  if (t < 17.2 || t > 35.2) return null;
  const y = kf([{ t: 17.3, y: WIN.h }, { t: 18.1, y: SHEET_TOP }, { t: 33.9, y: SHEET_TOP }, { t: 34.7, y: WIN.h }], t, 'y', Easing.easeInOutCubic);
  const scrim = kf([{ t: 17.3, y: 0 }, { t: 18.0, y: 0.32 }, { t: 34.0, y: 0.32 }, { t: 34.7, y: 0 }], t, 'y', Easing.linear);
  const nSel = (t >= 24.5 ? 1 : 0) + (t >= 27.5 ? 1 : 0);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(19,39,63,${scrim})` }} />
      <div style={{ position: 'absolute', left: 0, top: y, width: WIN.w, height: WIN.h - SHEET_TOP, background: '#fff', borderRadius: '16px 16px 0 0', boxShadow: '0 -12px 40px rgba(19,39,63,.18)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 21, color: C.ink }}>Allocate trainees — Aug 2026</div>
          <div style={{ marginLeft: 'auto', width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={14} color={C.inkSoft} /></div>
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 20 }}>
          <div style={{ width: '40%' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Already at this hospital (28)</div>
            {[['H. Kaur', 'ST4'], ['T. Whitfield', 'ST7'], ['C. Adeyemi', 'CT2']].map(([n, g]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F3FBF7', border: '1px solid rgba(16,185,129,.35)', borderRadius: 8, padding: '12px 16px', marginBottom: 10 }}>
                <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 15, color: C.ink, flex: 1 }}>{n}</div>
                <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, color: C.navy }}>{g}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft }}>tap to unallocate</div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>+25 more · or move a trainee to another hospital</div>
            <div style={{ display: 'inline-flex', marginTop: 14, border: `1px solid ${C.line}`, borderRadius: 8, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, color: C.navy }}>Select trainees from previous period</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 12 }}>Available trainees (12)</div>
            {AVAILABLE.map(([n, g], i) => {
              const selT = i === 0 ? 24.5 : i === 1 ? 27.5 : null;
              const sel = selT != null && t >= selT;
              const pop = selT != null ? Easing.easeOutBack(clamp((t - selT) / 0.35, 0, 1)) : 0;
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, background: sel ? C.blueFill : '#fff', border: `1px solid ${sel ? 'rgba(37,99,235,.4)' : C.line}`, borderRadius: 8, padding: '13px 16px', marginBottom: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${sel ? C.blue : '#B9C4D2'}`, background: sel ? C.blue : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${sel ? 0.9 + 0.1 * pop : 1})` }}>
                    {sel && <Icon name="check" size={13} color="#fff" sw={2.4} />}
                  </div>
                  <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 15.5, color: C.ink, flex: 1 }}>{n}</div>
                  <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 999, padding: '2px 10px', fontSize: 11.5, fontWeight: 700, color: C.navy }}>{g}</div>
                  <div style={{ fontSize: 12, color: C.inkSoft, width: 90 }}>unallocated</div>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: nSel ? C.navy : '#8D9AAB', color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 16, padding: '12px 26px', borderRadius: 8, transform: t >= 33.2 && t < 33.5 ? 'scale(0.95)' : 'none' }}>
                Allocate ({nSel})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function TrustScreen({ t }) {
  const { cur, prev, p } = stateAt(t);
  const barFrom = prev.alloc / 32, barTo = cur.alloc / 32;
  const bar = barFrom + (barTo - barFrom) * p;
  const pressAlloc = t >= 17.0 && t < 17.3;
  const pressNext = t >= 45.0 && t < 45.3;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar active="Hospital Trusts" />
      <TopBar title="Hospital Trusts" back right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #C7D2DF', background: '#FBFCFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy, fontSize: 19, fontWeight: 700 }}>‹</div>
          <div style={{ width: 150, textAlign: 'center' }}>
            <Flip from={prev.period} to={cur.period} p={p} style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.navy }} />
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 1 }}>rotation period</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #C7D2DF', background: pressNext ? 'rgba(30,58,95,.12)' : '#FBFCFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.navy, fontSize: 19, fontWeight: 700, transform: pressNext ? 'scale(0.9)' : 'none' }}>›</div>
        </div>
      } />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 92, width: CIW, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkSoft, fontSize: 15, fontWeight: 700 }}>‹</div>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 27, color: C.ink }}>Caldermere General</div>
        <div style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkSoft, fontSize: 15, fontWeight: 700 }}>›</div>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, background: C.navy, color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 15.5, padding: '11px 22px', borderRadius: 8, transform: pressAlloc ? 'scale(0.95)' : 'none' }}>
        <Icon name="plus" size={15} color="#fff" sw={2.2} />Allocate Trainees</div>
      </div>
      <StatCard i={0} label="Capacity" value="32" sub="slots this period" />
      <StatCard i={1} label="Slots allocated" flip={{ from: String(prev.alloc), to: String(cur.alloc), p }} sub={<span>of 32 · <span style={{ color: bar > 0.99 ? C.red : C.green, fontWeight: 700 }}>{Math.round(bar * 100)}% full</span></span>} />
      <StatCard i={2} label="Head count" flip={{ from: String(prev.head), to: String(cur.head), p }} sub="incl. slot shares" />
      <StatCard i={3} label="Total WTE" flip={{ from: prev.wte, to: cur.wte, p }} sub="whole-time equivalent" />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 296, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.ink }}>Trainees at this trust</span>
        <Flip from={prev.note} to={cur.note} p={p} style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }} />
      </div>
      {ALLOCATED.map(([n, g, tag], i) => <AllocCard key={n} col={i % 4} row={Math.floor(i / 4)} name={n} grade={g} tag={tag} t={t} />)}
      <AllocCard col={0} row={2} name="A. Okafor" grade="CT2" tag="new" popT={34.4} t={t} />
      <AllocCard col={1} row={2} name="R. Singh" grade="ST4" tag="new" popT={34.6} t={t} />
      {(() => { const w = (CIW - 3 * 16) / 4; const mcol = kf([{ t: 34.3, x: 0 }, { t: 34.9, x: 2 }], t, 'x'); return (
        <div style={{ position: 'absolute', left: CIX - WIN.x + mcol * (w + 16), top: 554, width: w, height: 96, border: `1.5px dashed #C9D3E0`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 600, color: C.inkSoft }}>+20 more</div>
      ); })()}
      <Sheet t={t} />
    </div>
  );
}
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><TrustScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Allocating trainees to trusts" kicker="Product tour · Rotations" />
      <EndCard t={t} inAt={58.5} />
    </FilmRoot>
  );
}
function AdeptAllocateVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={68} background="#E4EAF2" persistKey="adeptch2">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptAllocateVideo = AdeptAllocateVideo;
})();
