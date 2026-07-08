// Adept walkthrough — Chapter 3: "The trainee profile" (74s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, WIN, CIX, CIW, Icon, Flip, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard } = K;

const CAPTIONS = [
  [6.6, 13.0, 'One profile: placements, dates and status — the whole story.'],
  [14.2, 19.2, 'Switch someone to 80% less-than-full-time…'],
  [21.8, 28.2, '…and the certification date recalculates itself.'],
  [30.2, 34.6, 'Now record parental leave — nine months from November.'],
  [39.6, 47.2, 'Every later stage — and the CCT — shifts by the pause.'],
  [50.2, 55.6, 'The trainee returns exactly where they left off.'],
  [57.8, 63.6, 'The domain’s hardest arithmetic, built in.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.6, x: 960, y: 516, z: 1.05 },
  { t: 15.2, x: 740, y: 690, z: 1.6 },
  { t: 21.0, x: 740, y: 696, z: 1.6 },
  { t: 22.6, x: 1000, y: 430, z: 1.45 },
  { t: 29.2, x: 1004, y: 434, z: 1.45 },
  { t: 30.6, x: 1230, y: 690, z: 1.55 },
  { t: 33.4, x: 1230, y: 694, z: 1.55 },
  { t: 34.6, x: 1120, y: 600, z: 1.5 },
  { t: 37.4, x: 1120, y: 604, z: 1.5 },
  { t: 38.8, x: 1020, y: 430, z: 1.45 },
  { t: 48.6, x: 1024, y: 434, z: 1.45 },
  { t: 50.0, x: 780, y: 200, z: 1.7 },
  { t: 56.2, x: 784, y: 204, z: 1.7 },
  { t: 58.2, x: 960, y: 540, z: 1.03 },
  { t: 66.0, x: 960, y: 536, z: 1.05 },
  { t: 74, x: 960, y: 536, z: 1.05 },
];
const CURSOR = [
  { t: 13.8, x: 1400, y: 760, o: 0 },
  { t: 14.4, x: 1400, y: 760, o: 1 },
  { t: 16.4, x: 590, y: 688, o: 1 },
  { t: 21.0, x: 590, y: 688, o: 1 },
  { t: 21.8, x: 590, y: 688, o: 0 },
  { t: 29.8, x: 1500, y: 800, o: 0 },
  { t: 30.4, x: 1500, y: 800, o: 1 },
  { t: 32.0, x: 1217, y: 718, o: 1 },
  { t: 33.8, x: 1217, y: 718, o: 1 },
  { t: 35.4, x: 1240, y: 660, o: 1 },
  { t: 37.2, x: 1240, y: 660, o: 1 },
  { t: 37.8, x: 1240, y: 660, o: 0 },
];
const CLICKS = [20, 33.2, 36.5];

// timeline math: LTFT stretch at t=20, 9-month pause inserted at t=36.8
const TODAY = 2026.5, PAUSE_AT = 2026.9, PAUSE_LEN = 0.75, CCT0 = 2028.6;
function transforms(t) {
  const p1 = Easing.easeInOutCubic(clamp((t - 20) / 1.0, 0, 1));
  const p2 = Easing.easeInOutCubic(clamp((t - 36.8) / 1.5, 0, 1));
  const k1 = 1 + 0.25 * p1;
  const T = (yr) => {
    const a = yr <= TODAY ? yr : TODAY + (yr - TODAY) * k1;
    return a <= PAUSE_AT ? a : a + PAUSE_LEN * p2;
  };
  return { T, p1, p2 };
}
const SEGS = [
  { s: 2021.6, e: 2022.6, l: 'CT1', c: C.navy },
  { s: 2022.6, e: 2023.6, l: 'CT2', c: C.navy },
  { s: 2023.6, e: 2024.6, l: 'CT3', c: C.navy },
  { s: 2024.6, e: 2025.6, l: 'ST4', c: C.stage2 },
  { s: 2025.6, e: 2026.6, l: 'ST5', c: C.stage2 },
  { s: 2026.6, e: 2027.6, l: 'ST6', c: C.stage3 },
  { s: 2027.6, e: 2028.6, l: 'ST7', c: C.stage3 },
];
const GX = 24, GW = CIW - 48, Y0 = 2021, Y1 = 2031, PX = GW / (Y1 - Y0);
const X = (yr) => GX + (yr - Y0) * PX;

function cctState(t) {
  const states = [
    { at: -99, v: 'Aug 2028' }, { at: 20, v: 'Feb 2029' }, { at: 36.8, v: 'Nov 2029' },
  ];
  let cur = states[0], prev = states[0];
  for (const s of states) if (t >= s.at) { prev = cur; cur = s; }
  const p = Easing.easeOutCubic(clamp((t - cur.at) / 0.6, 0, 1));
  return { from: prev.v, to: cur.v, p };
}

function Gantt({ t }) {
  const { T, p2 } = transforms(t);
  const cct = cctState(t);
  const years = []; for (let y = Y0; y <= Y1; y++) years.push(y);
  return (
    <div style={{ position: 'absolute', left: CIX - WIN.x, top: 208, width: CIW, height: 300, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '20px 0 0' }}>
      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Placement timeline</span>
        <span style={{ fontSize: 12.5, color: C.inkSoft }}>proportional · Aug/Feb rotations</span>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 62, right: 0, bottom: 0 }}>
        {years.map(y => (
          <div key={y} style={{ position: 'absolute', left: X(y), top: 0, bottom: 0 }}>
            <div style={{ position: 'absolute', left: 0, top: 22, bottom: 34, width: 1, background: '#EDF1F6' }} />
            <div style={{ position: 'absolute', left: -14, top: 0, fontSize: 11.5, fontWeight: 600, color: C.inkSoft }}>{y}</div>
          </div>
        ))}
        {SEGS.map(sg => {
          const x0 = X(T(sg.s)), x1 = X(T(sg.e));
          return (
            <div key={sg.l} style={{ position: 'absolute', left: x0, top: 72, width: x1 - x0, height: 54, background: sg.c, borderRadius: 6, border: '2px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 14 }}>
              {(x1 - x0) > 46 ? sg.l : ''}
            </div>
          );
        })}
        {p2 > 0.02 && (
          <div style={{ position: 'absolute', left: X(PAUSE_AT), top: 72, width: X(PAUSE_AT + PAUSE_LEN * p2) - X(PAUSE_AT), height: 54, background: `repeating-linear-gradient(45deg, ${C.paused}, ${C.paused} 8px, #8894A4 8px, #8894A4 16px)`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {p2 > 0.7 ? '9 mo leave' : ''}
          </div>
        )}
        <div style={{ position: 'absolute', left: X(TODAY), top: 58, bottom: 40, width: 0, borderLeft: `2px dashed ${C.inkSoft}` }} />
        <div style={{ position: 'absolute', left: X(TODAY) - 18, top: 40, fontSize: 11.5, fontWeight: 700, color: C.inkSoft }}>today</div>
        <div style={{ position: 'absolute', left: X(T(CCT0)) - 9, top: 90, width: 18, height: 18, background: C.navy, transform: 'rotate(45deg)', borderRadius: 3, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(19,39,63,.3)' }} />
        <div style={{ position: 'absolute', left: X(T(CCT0)) - 60, top: 140, width: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.03em' }}>CCT</div>
          <Flip from={cct.from} to={cct.to} p={cct.p} style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 16, color: C.navy }} />
        </div>
      </div>
    </div>
  );
}
function LtftCard({ t }) {
  const sel80 = t >= 20;
  const press = t >= 20 && t < 20.3;
  const cct = cctState(t);
  const w = Math.round(CIW * 0.48);
  const chipS = (on, pr) => ({ width: 112, height: 44, borderRadius: 8, border: `1.5px solid ${on ? C.teal : '#C7D2DF'}`, background: on ? C.tealFill : '#fff', color: on ? C.teal : C.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 700, fontSize: 16, transform: pr ? 'scale(0.93)' : 'none' });
  return (
    <div style={{ position: 'absolute', left: CIX - WIN.x, top: 532, width: w, height: 240, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '20px 24px' }}>
      <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>LTFT &amp; CCT</div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>working percentage · banked full-time-equivalent model</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={chipS(!sel80)}>100%</div>
        <div style={chipS(sel80, press)}>80%</div>
        <div style={chipS(false)}>60%</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.03em' }}>Adjusted CCT</span>
        <Flip from={cct.from} to={cct.to} p={cct.p} style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 26, color: C.navy }} />
      </div>
    </div>
  );
}
function StatusCard({ t }) {
  const paused = t >= 36.8;
  const p = Easing.easeOutCubic(clamp((t - 36.8) / 0.6, 0, 1));
  const pressRec = t >= 33.2 && t < 33.5;
  const w = Math.round(CIW * 0.48);
  return (
    <div style={{ position: 'absolute', left: CIX - WIN.x + w + 24, top: 532, width: CIW - w - 24, height: 240, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Training status</span>
        <Flip from={'Active'} to={paused ? 'Paused' : 'Active'} p={paused ? p : 1} style={{ background: paused ? C.amberFill : C.greenFill, color: paused ? C.amber : C.green, fontSize: 12.5, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }} />
      </div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>pauses release placements and shift every later date</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.navy, color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 14.5, padding: '11px 20px', borderRadius: 8, transform: pressRec ? 'scale(0.95)' : 'none' }}>
          <Icon name="calendar" size={15} color="#fff" />Record parental leave
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>sickness · OOP · parental</div>
      </div>
      {paused && (
        <div style={{ marginTop: 18, background: C.amberFill, borderRadius: 8, padding: '12px 16px', fontSize: 13.5, fontWeight: 600, color: C.amber, opacity: p }}>
          Parental leave · 1 Nov 2026 · 9 months — placement released, returns at the point they left
        </div>
      )}
    </div>
  );
}
function Popover({ t }) {
  if (t < 33.4 || t > 37.1) return null;
  const oIn = Easing.easeOutBack(clamp((t - 33.4) / 0.4, 0, 1));
  const oOut = 1 - Easing.easeInCubic(clamp((t - 36.7) / 0.4, 0, 1));
  const pressC = t >= 36.5 && t < 36.75;
  return (
    <div style={{ position: 'absolute', inset: 0, background: `rgba(19,39,63,${0.28 * Math.min(oIn, oOut)})` }}>
      <div style={{ position: 'absolute', left: WIN.w / 2 - 230 + 40, top: 380, width: 460, background: '#fff', borderRadius: 12, boxShadow: '0 20px 60px rgba(19,39,63,.3)', padding: '24px 26px', opacity: Math.min(oIn, oOut), transform: `scale(${0.9 + 0.1 * oIn})` }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.ink }}>Record parental leave</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Start date</div>
            <div style={{ border: `1.5px solid ${C.line}`, borderRadius: 8, padding: '10px 14px', fontSize: 15, fontWeight: 600, color: C.ink }}>1 Nov 2026</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Duration</div>
            <div style={{ border: `1.5px solid ${C.line}`, borderRadius: 8, padding: '10px 14px', fontSize: 15, fontWeight: 600, color: C.ink }}>9 months</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <div style={{ padding: '10px 18px', borderRadius: 8, fontSize: 14.5, fontWeight: 600, color: C.inkSoft, border: `1px solid ${C.line}` }}>Cancel</div>
          <div style={{ padding: '10px 22px', borderRadius: 8, fontSize: 14.5, fontWeight: 700, color: '#fff', background: C.navy, fontFamily: FONT_T, transform: pressC ? 'scale(0.95)' : 'none' }}>Confirm</div>
        </div>
      </div>
    </div>
  );
}
function ProfileScreen({ t }) {
  const sel80 = t >= 20.3;
  const paused = t >= 36.8;
  const pulse = t >= 50 && t < 55.6 ? Math.sin((t - 50) * 2.2) * 0.5 + 0.5 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar active="Trainees" />
      <TopBar title="Trainees" back right={<div style={{ fontSize: 14, fontWeight: 600, color: C.inkSoft }}>Profile 42 of 190</div>} />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 92, width: CIW, height: 96, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: C.blueFill, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 700 }}>JB</div>
        <div>
          <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 23, color: C.ink }}>J. Bekele</div>
          <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>Anaesthetics · Caldermere General · Aug 2026</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <div style={{ background: C.soft, border: `1px solid ${C.line}`, borderRadius: 999, padding: '6px 16px', fontSize: 13.5, fontWeight: 700, color: C.navy }}>ST5</div>
          <Flip from="100% · full time" to={sel80 ? '80% LTFT' : '100% · full time'} p={sel80 ? Easing.easeOutCubic(clamp((t - 20.3) / 0.5, 0, 1)) : 1} style={{ background: C.tealFill, borderRadius: 999, padding: '6px 16px', fontSize: 13.5, fontWeight: 700, color: C.teal }} />
          <div style={{ background: paused ? C.amberFill : C.greenFill, borderRadius: 999, padding: '6px 16px', fontSize: 13.5, fontWeight: 700, color: paused ? C.amber : C.green, boxShadow: pulse > 0.02 ? `0 0 0 ${4 * pulse}px rgba(201,129,46,.25)` : 'none' }}>{paused ? 'Paused' : 'Active'}</div>
        </div>
      </div>
      <Gantt t={t} />
      <LtftCard t={t} />
      <StatusCard t={t} />
      <Popover t={t} />
    </div>
  );
}
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><ProfileScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="The trainee profile" kicker="Product tour · LTFT, leave & CCT dates" />
      <EndCard t={t} inAt={65} />
    </FilmRoot>
  );
}
function AdeptProfileVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={74} background="#E4EAF2" persistKey="adeptch3">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptProfileVideo = AdeptProfileVideo;
})();
