// Adept walkthrough — Chapter 7: "College tutors & trainees, on mobile" (62s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, Icon, Tile, kf, FilmRoot, Camera, Cursor, Captions, TitleCard, EndCard } = K;

const CAPTIONS = [
  [6.6, 12.6, 'Not everyone lives at a desk. Tutors and trainees get mobile.'],
  [14.0, 20.4, 'A college tutor sees their trust — their trainees, nothing else.'],
  [22.4, 28.6, 'Induction handbook and clinical guidelines, on the ward.'],
  [30.6, 37.0, 'Trainees see their own path — placements, dates, ARCPs.'],
  [39.0, 45.2, 'And book a drop-in session in three taps.'],
  [47.0, 52.6, 'Every role served — desktop for planning, mobile for the day job.'],
];
// two phones side by side; camera moves between them
const P1X = 430, P2X = 1090, PY = 120, PW = 400, PH = 840, SCR = 32;
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.2, x: 630, y: 480, z: 1.7 },
  { t: 20.8, x: 630, y: 486, z: 1.7 },
  { t: 22.6, x: 630, y: 660, z: 1.75 },
  { t: 29.0, x: 630, y: 666, z: 1.75 },
  { t: 30.8, x: 1290, y: 420, z: 1.7 },
  { t: 37.4, x: 1290, y: 426, z: 1.7 },
  { t: 39.2, x: 1290, y: 680, z: 1.75 },
  { t: 45.6, x: 1290, y: 686, z: 1.75 },
  { t: 47.2, x: 960, y: 540, z: 1 },
  { t: 62, x: 960, y: 540, z: 1 },
];
const TAP = [
  { t: 39.6, x: P2X + 200, y: 812, o: 0 },
  { t: 40.2, x: P2X + 200, y: 812, o: 1 },
  { t: 42.4, x: P2X + 200, y: 812, o: 1 },
  { t: 43.2, x: P2X + 200, y: 812, o: 0 },
];
const CLICKS = [41.4];

function Phone({ x, label, children }) {
  return (
    <div style={{ position: 'absolute', left: x, top: PY }}>
      <div style={{ width: PW, height: PH, background: '#1B2534', borderRadius: 48, padding: 12, boxShadow: '0 30px 80px rgba(19,39,63,.3)' }}>
        <div style={{ width: '100%', height: '100%', background: C.soft, borderRadius: 38, overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: SCR, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontSize: 12, fontWeight: 700, color: C.ink }}>
            <span>9:41</span>
            <div style={{ width: 90, height: 20, background: '#1B2534', borderRadius: 999, margin: '0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} />
            <span>●●●</span>
          </div>
          {children}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -44, textAlign: 'center', fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.ink }}>{label}</div>
    </div>
  );
}
function TutorPhone({ t }) {
  return (
    <Phone x={P1X} label="College tutor — mobile">
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tile size={30} fs={17} r={8} />
          <div>
            <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 16, color: C.ink }}>Caldermere General</div>
            <div style={{ fontSize: 11, color: C.inkSoft }}>Dr P. Naylor · College Tutor</div>
          </div>
          <div style={{ marginLeft: 'auto' }}><Icon name="menu" size={20} color={C.inkSoft} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {[['My trainees', '30', C.navy], ['LTFT', '5', C.teal], ['Paused', '2', C.amber]].map(([l, v, col]) => (
            <div key={l} style={{ flex: 1, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 22, color: col }}>{v}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkSoft, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.04em', margin: '16px 0 8px' }}>My trainees</div>
        {[['J. Bekele', 'ST5 · 80% LTFT', 'teal'], ['H. Kaur', 'ST4 · ARCP 14 Oct', null], ['C. Adeyemi', 'CT2', null]].map(([n, meta, tag]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: C.blueFill, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700 }}>{n.split(' ').map(s => s[0]).join('').replace('.', '')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 13.5, color: C.ink }}>{n}</div>
              <div style={{ fontSize: 10.5, color: tag === 'teal' ? C.teal : C.inkSoft, fontWeight: tag ? 700 : 500 }}>{meta}</div>
            </div>
            <span style={{ color: C.inkSoft, fontSize: 16 }}>›</span>
          </div>
        ))}
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.04em', margin: '14px 0 8px' }}>This trust</div>
        {[['doc', 'Induction handbook', 'updated May 2026'], ['clipboard', 'Clinical guidelines', '14 documents'], ['tasks', 'Training modules', '3 due this month']].map(([ic, l, meta]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '11px 12px', marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={16} color={C.navy} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 13.5, color: C.ink }}>{l}</div>
              <div style={{ fontSize: 10.5, color: C.inkSoft }}>{meta}</div>
            </div>
            <span style={{ color: C.inkSoft, fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>
    </Phone>
  );
}
function TraineePhone({ t }) {
  const booked = t >= 41.4;
  const bp = Easing.easeOutBack(clamp((t - 41.4) / 0.5, 0, 1));
  return (
    <Phone x={P2X} label="Trainee — self-service">
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: C.blueFill, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700 }}>JB</div>
          <div>
            <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 16, color: C.ink }}>J. Bekele</div>
            <div style={{ fontSize: 11, color: C.inkSoft }}>ST5 · Anaesthetics · 80% LTFT</div>
          </div>
          <div style={{ marginLeft: 'auto' }}><Icon name="menu" size={20} color={C.inkSoft} /></div>
        </div>
        <div style={{ background: C.navy, borderRadius: 12, padding: '14px 16px', marginTop: 14, color: '#fff' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.65 }}>My CCT</div>
          <div style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 26, marginTop: 4 }}>Nov 2029</div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 3 }}>includes 80% LTFT + 9 mo parental leave</div>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.04em', margin: '14px 0 8px' }}>My path</div>
        <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px' }}>
          {[['Now', 'Caldermere General · ST5', true], ['Feb 2027', 'Parental leave · returns Nov 2027', false], ['Nov 2027', 'Ellerbeck Royal · ST6', false]].map(([d, l, on], i) => (
            <div key={d} style={{ display: 'flex', gap: 10, paddingBottom: i < 2 ? 12 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: on ? C.teal : '#C7D2DF', marginTop: 3 }} />
                {i < 2 && <div style={{ width: 2, flex: 1, background: '#E4EAF2', marginTop: 2 }} />}
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: on ? C.teal : C.inkSoft, textTransform: 'uppercase', letterSpacing: '.03em' }}>{d}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, marginTop: 1 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase' }}>Next ARCP</div>
            <div style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 17, color: C.navy, marginTop: 3 }}>14 Oct 2026</div>
          </div>
          <div style={{ flex: 1, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase' }}>Exams</div>
            <div style={{ fontFamily: FONT_T, fontWeight: 800, fontSize: 17, color: C.navy, marginTop: 3 }}>Final FRCA ✓</div>
          </div>
        </div>
        <div style={{ marginTop: 14, background: booked ? C.tealFill : C.navy, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transform: `scale(${booked ? 0.97 + 0.03 * bp : (t >= 41.4 - 0.15 && t < 41.4 ? 0.96 : 1)})` }}>
          {booked ? (
            <React.Fragment>
              <Icon name="check" size={16} color={C.teal} sw={2.4} />
              <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 14.5, color: C.teal }}>Drop-in booked — Tue 14 Jul, 13:00</span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Icon name="calendar" size={16} color="#fff" />
              <span style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 14.5, color: '#fff' }}>Book a drop-in session</span>
            </React.Fragment>
          )}
        </div>
      </div>
    </Phone>
  );
}
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <TutorPhone t={t} />
        <TraineePhone t={t} />
        <Cursor t={t} path={TAP} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Tutors & trainees, on mobile" kicker="Product tour · Every role served" />
      <EndCard t={t} inAt={53} />
    </FilmRoot>
  );
}
function AdeptMobileVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={62} background="#E4EAF2" persistKey="adeptch7">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptMobileVideo = AdeptMobileVideo;
})();
