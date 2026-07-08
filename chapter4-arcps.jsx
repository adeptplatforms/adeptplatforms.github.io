// Adept walkthrough — Chapter 4: "ARCPs without the spreadsheet" (70s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, WIN, CIX, CIW, Icon, Flip, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard } = K;

const CAPTIONS = [
  [6.6, 12.6, 'Every assessment cycle, tracked from due date to outcome.'],
  [13.6, 19.0, 'Awaiting allocation — no one slips through.'],
  [20.6, 26.2, 'Assign the panel in two clicks.'],
  [28.4, 34.2, 'Record the outcome — including 7.x sub-outcomes.'],
  [36.6, 43.0, 'Outcome saved → the next ARCP date sets itself.'],
  [45.0, 51.4, 'Summary document and panel email, generated for you.'],
  [53.4, 58.8, 'ARCPs end to end — no spreadsheet, no chasing.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.2, x: 960, y: 520, z: 1.05 },
  { t: 14.6, x: 900, y: 480, z: 1.38 },
  { t: 19.2, x: 900, y: 486, z: 1.38 },
  { t: 20.8, x: 1150, y: 480, z: 1.42 },
  { t: 26.6, x: 1150, y: 486, z: 1.42 },
  { t: 28.2, x: 960, y: 560, z: 1.3 },
  { t: 35.0, x: 960, y: 566, z: 1.3 },
  { t: 36.8, x: 1084, y: 480, z: 1.36 },
  { t: 43.4, x: 1084, y: 486, z: 1.36 },
  { t: 45.2, x: 1084, y: 700, z: 1.42 },
  { t: 51.8, x: 1084, y: 706, z: 1.42 },
  { t: 53.6, x: 960, y: 540, z: 1.02 },
  { t: 70, x: 960, y: 540, z: 1.02 },
];
const CURSOR = [
  { t: 20.0, x: 1500, y: 700, o: 0 },
  { t: 20.6, x: 1500, y: 700, o: 1 },
  { t: 22.2, x: 1330, y: 465, o: 1 },
  { t: 24.6, x: 1330, y: 465, o: 1 },
  { t: 25.4, x: 1330, y: 515, o: 1 },
  { t: 27.4, x: 1330, y: 515, o: 1 },
  { t: 29.4, x: 838, y: 656, o: 1 },
  { t: 32.4, x: 838, y: 656, o: 1 },
  { t: 33.6, x: 1076, y: 656, o: 1 },
  { t: 36.0, x: 1076, y: 656, o: 1 },
  { t: 36.6, x: 1076, y: 656, o: 0 },
];
const CLICKS = [23.4, 26.2, 31.2, 35.0];

const QUEUE = [
  { n: 'J. Bekele', g: 'ST5', due: '14 Oct 2026' },
  { n: 'H. Kaur', g: 'ST4', due: '14 Oct 2026' },
  { n: 'T. Whitfield', g: 'ST7', due: '14 Oct 2026' },
];
function phase(t) {
  // 0 pre; 1 panel A; 2 panel B; 3 outcome chosen; 4 saved
  if (t < 23.4) return 0;
  if (t < 26.2) return 1;
  if (t < 31.2) return 2;
  if (t < 35.0) return 3;
  return 4;
}
function ArcpScreen({ t }) {
  const ph = phase(t);
  const savedP = Easing.easeOutCubic(clamp((t - 35.0) / 0.6, 0, 1));
  const rowW = CIW, colDate = 150, colPanel = 330, colOutcome = 330, colNext = 210;
  const header = (x, w, l) => <div style={{ position: 'absolute', left: x, width: w, fontSize: 12, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.04em' }}>{l}</div>;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar active="ARCPs" />
      <TopBar title="ARCPs" right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: C.blueFill, color: C.blue, fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 999 }}>Autumn 2026 cycle</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.inkSoft }}>panel · 14 Oct 2026</div>
        </div>
      } />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 96, display: 'flex', gap: 16 }}>
        {[['Due this cycle', '9', C.navy], ['Awaiting allocation', ph >= 2 ? '2' : '3', C.amber], ['Outcomes recorded', ph >= 4 ? '5' : '4', C.teal]].map(([l, v, col]) => (
          <div key={l} style={{ width: 250, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '14px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.03em' }}>{l}</div>
            <div style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 32, color: col, marginTop: 6, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 220, width: rowW, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '18px 24px 8px' }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink, marginBottom: 14 }}>Awaiting allocation — 14 Oct panel</div>
        <div style={{ position: 'relative', height: 22 }}>
          {header(0, 240, 'Trainee')}{header(260, colDate, 'Due')}{header(430, colPanel, 'Panel')}{header(790, colOutcome, 'Outcome')}{header(1140, colNext, 'Next ARCP')}
        </div>
        {QUEUE.map((q, i) => {
          const isHero = i === 0;
          const panelOn = isHero && ph >= 1;
          const panelBoth = isHero && ph >= 2;
          const outcomeOn = isHero && ph >= 3;
          const saved = isHero && ph >= 4;
          return (
            <div key={q.n} style={{ position: 'relative', height: 74, borderTop: `1px solid #EDF1F6`, opacity: !isHero && ph >= 4 ? 0.65 : 1 }}>
              <div style={{ position: 'absolute', left: 0, top: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: C.blueFill, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 700 }}>{q.n.split(' ').map(s => s[0]).join('').replace('.', '')}</div>
                <div>
                  <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 16, color: C.ink }}>{q.n}</div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>{q.g} · Anaesthetics</div>
                </div>
              </div>
              <div style={{ position: 'absolute', left: 260, top: 26, fontSize: 14, fontWeight: 600, color: C.ink }}>{q.due}</div>
              <div style={{ position: 'absolute', left: 430, top: 20, display: 'flex', gap: 8 }}>
                {isHero ? (
                  <React.Fragment>
                    <div style={{ border: `1.5px solid ${panelOn ? C.navy : '#C7D2DF'}`, background: panelOn ? C.navy : '#fff', color: panelOn ? '#fff' : C.inkSoft, borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, transform: t >= 23.4 && t < 23.7 ? 'scale(0.93)' : 'none' }}>Dr A. Whitby</div>
                    <div style={{ border: `1.5px solid ${panelBoth ? C.navy : '#C7D2DF'}`, background: panelBoth ? C.navy : '#fff', color: panelBoth ? '#fff' : C.inkSoft, borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, transform: t >= 26.2 && t < 26.5 ? 'scale(0.93)' : 'none' }}>Dr S. Rahman</div>
                  </React.Fragment>
                ) : <div style={{ color: C.inkSoft, fontSize: 13.5, fontWeight: 600, padding: '7px 0' }}>Assign panel…</div>}
              </div>
              <div style={{ position: 'absolute', left: 790, top: 20 }}>
                {isHero ? (
                  ph < 3 ? <div style={{ border: `1.5px dashed #C7D2DF`, borderRadius: 8, padding: '7px 18px', fontSize: 13.5, fontWeight: 600, color: C.inkSoft }}>Record outcome</div> :
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ background: C.tealFill, color: C.teal, borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, transform: t >= 31.2 && t < 31.5 ? 'scale(0.93)' : 'none' }}>Outcome 1 · satisfactory</div>
                  </div>
                ) : <span style={{ color: C.inkSoft, fontSize: 13.5 }}>—</span>}
              </div>
              <div style={{ position: 'absolute', left: 1140, top: 20 }}>
                {isHero && ph >= 4 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: savedP, transform: `translateY(${(1 - savedP) * 8}px)` }}>
                    <Icon name="check" size={15} color={C.green} sw={2.4} />
                    <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 15, color: C.ink }}>Oct 2027</span>
                    <span style={{ fontSize: 12, color: C.inkSoft }}>auto-set</span>
                  </div>
                ) : isHero && ph >= 3 ? (
                  <div style={{ background: C.navy, color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 13.5, padding: '8px 18px', borderRadius: 8, transform: t >= 35.0 && t < 35.3 ? 'scale(0.95)' : 'none' }}>Save outcome</div>
                ) : <span style={{ color: C.inkSoft, fontSize: 13.5 }}>—</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 596, width: CIW, height: 220, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '18px 24px', opacity: ph >= 4 ? 1 : 0.45 }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Generated for this outcome</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          <div style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 8, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', background: ph >= 4 ? '#fff' : C.soft }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: C.blueFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={20} color={C.blue} /></div>
            <div>
              <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 15.5, color: C.ink }}>ARCP summary — J. Bekele.pdf</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4, lineHeight: 1.5 }}>Outcome 1 · panel, placements and dates included</div>
              {ph >= 4 && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12.5, fontWeight: 700, color: C.navy }}><Icon name="download" size={13} color={C.navy} />Download</div>}
            </div>
          </div>
          <div style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 8, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', background: ph >= 4 ? '#fff' : C.soft }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: C.tealFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mail" size={20} color={C.teal} /></div>
            <div>
              <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 15.5, color: C.ink }}>Panel email — pre-addressed</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4, lineHeight: 1.5 }}>To: Dr A. Whitby, Dr S. Rahman · summary attached</div>
              {ph >= 4 && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12.5, fontWeight: 700, color: C.navy }}>Open draft</div>}
            </div>
          </div>
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
        <AppWindow><ArcpScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="ARCPs without the spreadsheet" kicker="Product tour · Assessments" />
      <EndCard t={t} inAt={60} />
    </FilmRoot>
  );
}
function AdeptArcpVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={70} background="#E4EAF2" persistKey="adeptch4">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptArcpVideo = AdeptArcpVideo;
})();
