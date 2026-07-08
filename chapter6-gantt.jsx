// Adept walkthrough — Chapter 6: "Reports & the cohort gantt" (64s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, WIN, CIX, CIW, Icon, Flip, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard } = K;

const CAPTIONS = [
  [6.6, 12.8, 'The whole cohort on one timeline.'],
  [14.0, 20.2, 'Pauses, LTFT and CCT markers — visible at a glance.'],
  [22.0, 28.4, 'Filter to a stage, a trust, or a status.'],
  [30.4, 36.8, 'Spot the gaps before they become problems.'],
  [38.8, 45.2, 'And export it — Excel out, grouped by trust.'],
  [47.0, 52.8, 'One source of truth, for the TPD and the deanery.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.4, x: 960, y: 520, z: 1.05 },
  { t: 15.0, x: 1000, y: 430, z: 1.4 },
  { t: 20.6, x: 1004, y: 434, z: 1.4 },
  { t: 22.2, x: 900, y: 260, z: 1.45 },
  { t: 28.8, x: 904, y: 264, z: 1.45 },
  { t: 30.8, x: 1100, y: 620, z: 1.5 },
  { t: 37.2, x: 1104, y: 624, z: 1.5 },
  { t: 39.2, x: 1500, y: 200, z: 1.55 },
  { t: 45.6, x: 1504, y: 204, z: 1.55 },
  { t: 47.4, x: 960, y: 540, z: 1.02 },
  { t: 64, x: 960, y: 540, z: 1.02 },
];
const CURSOR = [
  { t: 21.4, x: 700, y: 700, o: 0 },
  { t: 22.0, x: 700, y: 700, o: 1 },
  { t: 23.6, x: 838, y: 175, o: 1 },
  { t: 25.8, x: 838, y: 175, o: 1 },
  { t: 26.6, x: 838, y: 175, o: 0 },
  { t: 38.2, x: 1300, y: 400, o: 0 },
  { t: 38.8, x: 1300, y: 400, o: 1 },
  { t: 40.4, x: 1698, y: 175, o: 1 },
  { t: 42.8, x: 1698, y: 175, o: 1 },
  { t: 43.6, x: 1698, y: 175, o: 0 },
];
const CLICKS = [24.8, 41.6];

const Y0 = 2025.5, Y1 = 2032, GX = 250;
const ROWS = [
  { n: 'A. Okafor', g: 'CT2', segs: [[2025.6, 2028.1, C.navy]], cct: 2028.1 },
  { n: 'J. Bekele', g: 'ST5', segs: [[2025.6, 2026.9, C.stage2], [2027.65, 2030.4, C.stage3]], pause: [2026.9, 2027.65], cct: 2030.4, ltft: true },
  { n: 'H. Kaur', g: 'ST4', segs: [[2025.6, 2029.6, C.stage2]], cct: 2029.6, ltft: true },
  { n: 'R. Singh', g: 'ST4', segs: [[2025.6, 2029.1, C.stage2]], cct: 2029.1 },
  { n: 'M. Doyle', g: 'CT1', segs: [[2025.6, 2028.6, C.navy]], cct: 2028.6 },
  { n: 'T. Whitfield', g: 'ST7', segs: [[2025.6, 2027.1, C.stage3]], cct: 2027.1 },
  { n: 'L. Novak', g: 'ST6', segs: [[2025.6, 2026.4, C.stage3]], gap: [2026.4, 2027.1], segs2: [[2027.1, 2028.4, C.stage3]], cct: 2028.4 },
  { n: 'S. Patel', g: 'CT3', segs: [[2025.6, 2027.9, C.navy]], cct: 2027.9 },
];
function GanttScreen({ t }) {
  const GW = CIW - GX - 40;
  const PX = GW / (Y1 - Y0);
  const X = (yr) => GX + (yr - Y0) * PX;
  const filterOn = t >= 24.8;
  const fp = Easing.easeOutCubic(clamp((t - 24.8) / 0.6, 0, 1));
  const visible = (r) => !filterOn || r.g.startsWith('ST');
  const pressExp = t >= 41.6 && t < 41.9;
  const exported = t >= 42.2;
  const ep = Easing.easeOutCubic(clamp((t - 42.2) / 0.6, 0, 1));
  const gapPulse = t >= 30.4 && t < 36.8 ? Math.sin((t - 30.4) * 2.2) * 0.5 + 0.5 : 0;
  const years = []; for (let y = 2026; y <= 2031; y++) years.push(y);
  let shown = 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar active="Summaries" />
      <TopBar title="Summaries — Cohort timeline" right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${exported ? C.teal : C.line}`, background: exported ? C.tealFill : '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13.5, fontWeight: 700, color: exported ? C.teal : C.navy, transform: pressExp ? 'scale(0.95)' : 'none' }}>
            {exported ? <Icon name="check" size={14} color={C.teal} sw={2.4} /> : <Icon name="download" size={14} color={C.navy} />}
            {exported ? 'cohort-by-trust.xlsx' : 'Export (.xlsx)'}
          </div>
        </div>
      } />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 90, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.04em', marginRight: 6 }}>Filters</div>
        {['All grades', 'ST only', 'Paused', 'LTFT'].map((f, i) => {
          const on = i === 1 && filterOn;
          return <div key={f} style={{ border: `1.5px solid ${on ? C.navy : C.line}`, background: on ? C.navy : '#fff', color: on ? '#fff' : C.inkSoft, borderRadius: 999, padding: '8px 18px', fontSize: 13.5, fontWeight: 700, transform: i === 1 && t >= 24.8 && t < 25.1 ? 'scale(0.93)' : 'none' }}>{f}</div>;
        })}
        <Flip from="190 trainees" to={filterOn ? '104 trainees' : '190 trainees'} p={fp} style={{ marginLeft: 10, fontSize: 13.5, fontWeight: 600, color: C.inkSoft }} />
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 148, width: CIW, bottom: 30, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '16px 20px' }}>
        <div style={{ position: 'relative', height: 24 }}>
          {years.map(y => <div key={y} style={{ position: 'absolute', left: X(y) - 34, fontSize: 12, fontWeight: 600, color: C.inkSoft }}>Aug {y}</div>)}
        </div>
        <div style={{ position: 'relative' }}>
          {years.map(y => <div key={y} style={{ position: 'absolute', left: X(y) - 20, top: 0, bottom: -640, width: 1, background: '#EDF1F6' }} />)}
          {ROWS.map((r, i) => {
            const vis = visible(r);
            const rowO = vis ? 1 : 1 - fp;
            if (!vis && rowO < 0.02) return null;
            const yy = (vis ? shown++ : shown) * 76;
            const drawSeg = ([s, e, col], key) => (
              <div key={key} style={{ position: 'absolute', left: X(s) - 20, top: yy + 34, width: X(e) - X(s), height: 30, background: col, borderRadius: 5, opacity: 0.92 }} />
            );
            return (
              <div key={r.n} style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: rowO }}>
                <div style={{ position: 'absolute', left: 0, top: yy + 34, width: 220, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 14.5, color: C.ink, width: 110 }}>{r.n}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: C.navy, background: C.soft, border: `1px solid ${C.line}`, borderRadius: 999, padding: '2px 9px' }}>{r.g}</div>
                  {r.ltft && <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, background: C.tealFill, borderRadius: 999, padding: '2px 8px' }}>LTFT</div>}
                </div>
                {r.segs.map((s, j) => drawSeg(s, 'a' + j))}
                {r.segs2 && r.segs2.map((s, j) => drawSeg(s, 'b' + j))}
                {r.pause && (
                  <div style={{ position: 'absolute', left: X(r.pause[0]) - 20, top: yy + 34, width: X(r.pause[1]) - X(r.pause[0]), height: 30, background: `repeating-linear-gradient(45deg, ${C.paused}, ${C.paused} 7px, #8894A4 7px, #8894A4 14px)`, borderRadius: 5 }} />
                )}
                {r.gap && (
                  <div style={{ position: 'absolute', left: X(r.gap[0]) - 20, top: yy + 34, width: X(r.gap[1]) - X(r.gap[0]), height: 30, border: `2px dashed ${C.red}`, borderRadius: 5, background: `rgba(220,38,38,${0.06 + 0.1 * gapPulse})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.red, letterSpacing: '.03em' }}>NO PLACEMENT</span>
                  </div>
                )}
                <div style={{ position: 'absolute', left: X(r.cct) - 27, top: yy + 36, width: 13, height: 13, background: C.navy, transform: 'rotate(45deg)', borderRadius: 2.5, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(19,39,63,.3)' }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 20, bottom: 14, display: 'flex', gap: 18, alignItems: 'center', fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 10, background: C.navy, borderRadius: 3 }} />Core</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 10, background: C.stage2, borderRadius: 3 }} />ST4–5</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 10, background: C.stage3, borderRadius: 3 }} />ST6–7</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 22, height: 10, background: `repeating-linear-gradient(45deg, ${C.paused}, ${C.paused} 5px, #8894A4 5px, #8894A4 10px)`, borderRadius: 3 }} />Paused</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 11, height: 11, background: C.navy, transform: 'rotate(45deg)', borderRadius: 2 }} />CCT</span>
          <span style={{ marginLeft: 10, opacity: exported ? ep : 0, color: C.teal, fontWeight: 700 }}>Exported — grouped by trust ✓</span>
        </div>
      </div>
    </div>
  );
}
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><GanttScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Reports & the cohort gantt" kicker="Product tour · The whole programme" />
      <EndCard t={t} inAt={54} />
    </FilmRoot>
  );
}
function AdeptGanttVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={64} background="#E4EAF2" persistKey="adeptch6">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptGanttVideo = AdeptGanttVideo;
})();
