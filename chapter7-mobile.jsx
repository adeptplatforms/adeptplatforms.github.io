// Adept walkthrough — Chapter 7: "Tutors & trainees, on mobile" (62s)
// Redrawn 7 Oct 2026 for the app's redesign: two phones in the app's phone
// layout (a white page under a 56 px bar with the menu and a semibold title,
// sections divided by hairlines, trust swatches beside trust names, the
// Meetings panel framed as in the app). Uses the shared kit.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, FONT, Icon, kf, FilmRoot, Camera, Cursor, Captions, TitleCard, EndCard,
  Pill, Swatch, Avatar, Figure, card, btnPrimary, btnOutline, trustColour,
} = window.AdeptKit;

// Two phones side by side; the camera moves between them.
const P1X = 430, P2X = 1090, PY = 120, PW = 400, PH = 840, BEZ = 12;
const SW = PW - 2 * BEZ;          // screen width (376)
const SP = 20;                    // screen side padding
const IW = SW - 2 * SP;           // inner width (336)
const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });

const CAPTIONS = [
  [6.6, 12.6, 'Not everyone lives at a desk. Tutors and trainees get mobile.'],
  [14.0, 20.4, 'A college tutor sees their trust: their trainees, nothing else.'],
  [22.4, 28.6, 'Induction handbook and clinical guidelines, on the ward.'],
  [30.6, 37.0, 'Trainees see their own path: placements, dates, ARCPs.'],
  [39.0, 45.2, 'And book a drop-in slot from their phone.'],
  [47.0, 52.6, 'Every role served: desktop for planning, mobile for the day job.'],
];
// Trainee phone: where the "Book a slot" button sits (screen coordinates).
const MEET_Y = 506, BOOK_Y = MEET_Y + 112;
const BOOK = { x: P2X + BEZ + SP + IW / 2, y: PY + BEZ + BOOK_Y + 22 };
const BOOK_T = 41.4;
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.2, x: 630, y: 440, z: 1.6 },
  { t: 20.8, x: 630, y: 446, z: 1.6 },
  { t: 22.6, x: 630, y: 680, z: 1.6 },
  { t: 29.0, x: 630, y: 686, z: 1.6 },
  { t: 30.8, x: 1290, y: 430, z: 1.6 },
  { t: 37.4, x: 1290, y: 436, z: 1.6 },
  { t: 39.2, x: 1290, y: 680, z: 1.6 },
  { t: 45.6, x: 1290, y: 686, z: 1.6 },
  { t: 47.2, x: 960, y: 540, z: 1 },
  { t: 62, x: 960, y: 540, z: 1 },
];
const TAP = [
  { t: 39.6, x: BOOK.x + 230, y: BOOK.y - 40, o: 0 },
  { t: 40.2, x: BOOK.x + 230, y: BOOK.y - 40, o: 1 },
  { t: 41.0, x: BOOK.x - 6, y: BOOK.y - 6, o: 1 },
  { t: 42.4, x: BOOK.x - 6, y: BOOK.y - 6, o: 1 },
  { t: 43.2, x: BOOK.x + 20, y: BOOK.y + 40, o: 0 },
];
const CLICKS = [BOOK_T];

// ── Pieces ───────────────────────────────────────────────────────────────────
function Phone({ x, label, title, children }) {
  return (
    <div style={{ position: 'absolute', left: x, top: PY }}>
      <div style={{ width: PW, height: PH, background: '#1B2534', borderRadius: 48, padding: BEZ, boxShadow: '0 30px 80px rgba(19,39,63,.3)' }}>
        <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 38, overflow: 'hidden', position: 'relative', fontFamily: FONT }}>
          <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', fontSize: 12.5, fontWeight: 600, color: C.ink }}>
            <span>9:41</span>
            <div style={{ width: 90, height: 20, background: '#1B2534', borderRadius: 999, position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)' }} />
            <span style={{ display: 'flex', gap: 3 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 4, height: 4, borderRadius: 2, background: C.ink }} />)}</span>
          </div>
          <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 18, padding: `0 ${SP}px`, borderBottom: `1px solid ${C.line}` }}>
            <Icon name="menu" size={22} color={C.ink} />
            <span style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>{title}</span>
          </div>
          {children}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -44, textAlign: 'center', fontWeight: 600, fontSize: 19, color: C.ink }}>{label}</div>
    </div>
  );
}
function Section({ y, text, right }) {
  return (
    <div style={at(SP, y, { width: IW, display: 'flex', alignItems: 'baseline' })}>
      <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{text}</span>
      {right && <span style={{ marginLeft: 'auto', fontSize: 14, color: C.inkSoft }}>{right}</span>}
    </div>
  );
}
function PhoneRow({ y, lead, title, tag, sub, subColor, hl = 0, h = 54 }) {
  return (
    <div style={at(SP, y, { width: IW, height: h, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px', background: hl > 0.01 ? `rgba(30,58,95,${0.06 * hl})` : 'transparent' })}>
      {lead}
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{title}</span>
          {tag && <Pill text={tag} size={12} style={{ padding: '0 7px' }} />}
        </div>
        <div style={{ fontSize: 13.5, color: subColor || C.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
      <Icon name="next" size={15} color={C.inkSoft} />
    </div>
  );
}
const pulseAt = (t, s, e) => (t < s || t > e ? 0 : Math.sin(clamp((t - s) / (e - s), 0, 1) * Math.PI));

// ── The college tutor's phone: their own trust only ──────────────────────────
const TUTOR_TRAINEES = [
  ['Jonah Bekele', 'ST5', 'LTFT 80% · ARCP 9 Dec 2026', C.teal],
  ['Harleen Kaur', 'ST4', 'LTFT 80%', C.teal],
  ['Amara Adeyemi', 'CT2', 'ARCP 14 Oct 2026'],
  ['Sanjay Patel', 'CT3', 'Completion Aug 2027'],
];
const TRUST_DOCS = [
  ['doc', 'Induction handbook', 'Updated May 2026'],
  ['clipboard', 'Clinical guidelines', '14 documents'],
  ['tasks', 'Training modules', 'What this trust offers'],
];
function TutorPhone({ t }) {
  const sq = (ic) => <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.field}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={16} color={C.ink} /></div>;
  return (
    <Phone x={P1X} label="College tutor" title="My trust">
      <div style={at(SP, 104, { display: 'flex', alignItems: 'center', gap: 10 })}>
        <Swatch name="Caldermere General" size={14} />
        <span style={{ fontSize: 21, fontWeight: 600, color: C.ink }}>Caldermere General</span>
      </div>
      <div style={at(SP, 134, { fontSize: 14, color: C.inkSoft })}>Dr P. Naylor · College tutor</div>
      <div style={at(SP, 166, { display: 'flex', alignItems: 'center', gap: 10 })}>
        {sq('back')}<span style={{ fontSize: 15, fontWeight: 600, color: C.ink, minWidth: 80, textAlign: 'center' }}>Aug 2026</span>{sq('next')}
      </div>
      <div style={at(SP, 222, { width: IW, display: 'flex', gap: 30 })}>
        <Figure value="30" caption="trainees" />
        <Figure value="5" caption="less than full time" />
        <Figure value="2" caption="paused" />
      </div>
      <Section y={290} text="Trainees" right="30" />
      <div style={at(SP, 322, { width: IW, height: 1, background: C.line })} />
      {TUTOR_TRAINEES.map(([n, g, sub, col], i) => (
        <PhoneRow key={n} y={323 + i * 54} lead={<Avatar name={n} size={32} />} title={n} tag={g} sub={sub} subColor={col} hl={pulseAt(t, 15.0 + i * 1.0, 16.6 + i * 1.0)} />
      ))}
      <Section y={560} text="This trust" />
      <div style={at(SP, 592, { width: IW, height: 1, background: C.line })} />
      {TRUST_DOCS.map(([ic, l, sub], i) => (
        <PhoneRow key={l} y={593 + i * 54} lead={<div style={{ width: 32, display: 'flex', justifyContent: 'center' }}><Icon name={ic} size={20} color={C.navy} /></div>} title={l} sub={sub} hl={pulseAt(t, 23.4 + i * 1.3, 25.4 + i * 1.3)} />
      ))}
    </Phone>
  );
}

// ── The trainee's phone: their own path, and a drop-in slot ──────────────────
// Placements as in chapter 6 (Jonah Bekele): six-month rotations from Aug 2025.
const JB = ['S', 'S', 'C', 'C', 'E', 'E', 'O', 'O', 'O', 'H', 'H'];
const TN = { C: 'Caldermere General', E: 'Ellerbeck Royal Infirmary', S: 'Skelton Bridge', H: 'Harewood Vale', O: 'Ousegate Teaching' };
const M0 = 2025.5, M1 = 2031.0, CCT = 2030.9, TODAY = 2026.77;
const MX = (yr) => (yr - M0) * IW / (M1 - M0);
function MiniTimeline({ y }) {
  const years = [2026, 2027, 2028, 2029, 2030];
  return (
    <div style={at(SP, y, { width: IW, height: 76 })}>
      {years.map((yr) => <span key={yr} style={at(MX(yr) + 2, 0, { fontSize: 12, fontWeight: 600, color: C.ink })}>{yr}</span>)}
      {years.map((yr) => <div key={`l${yr}`} style={at(MX(yr), 18, { width: 1, height: 44, background: C.line })} />)}
      {JB.map((k, i) => {
        const s = 2025.583 + i * 0.5, e = Math.min(s + 0.5, CCT);
        return <div key={i} style={at(MX(s), 30, { width: MX(e) - MX(s) - 2, height: 20, borderRadius: 3, background: trustColour(TN[k]) })} />;
      })}
      <div style={at(MX(2027.12), 28, { width: MX(2027.85) - MX(2027.12), height: 24, borderRadius: 3, background: 'repeating-linear-gradient(45deg, #E4E8EE, #E4E8EE 4px, #D3D9E1 4px, #D3D9E1 8px)' })} />
      <div style={at(MX(TODAY) - 1, 20, { width: 2, height: 42, background: C.error })} />
      <div style={at(MX(CCT) - 1, 20, { width: 2, height: 42, background: C.navy })} />
      <span style={at(MX(TODAY) - 16, 62, { fontSize: 11, color: C.error, fontWeight: 500 })}>Today</span>
      <span style={at(MX(2027.12) - 2, 62, { fontSize: 11, color: C.inkSoft })}>Paused</span>
      <span style={at(MX(CCT) - 26, 62, { fontSize: 11, color: C.navy, fontWeight: 600 })}>CCT</span>
    </div>
  );
}
function DetailRow({ y, label, value, hl }) {
  return (
    <div style={at(SP, y, { width: IW, height: 48, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 4px', background: hl > 0.01 ? `rgba(30,58,95,${0.06 * hl})` : 'transparent' })}>
      <span style={{ fontSize: 14, color: C.inkSoft }}>{label}</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.ink, whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}
function TraineePhone({ t }) {
  const booked = t >= BOOK_T + 0.25;
  const bp = Easing.easeOutCubic(clamp((t - BOOK_T - 0.25) / 0.45, 0, 1));
  const press = t >= BOOK_T - 0.12 && t < BOOK_T + 0.25;
  const trust = (n) => <React.Fragment><Swatch name={n} size={10} />{n}</React.Fragment>;
  return (
    <Phone x={P2X} label="Trainee" title="My profile">
      <div style={at(SP, 102, { fontSize: 23, fontWeight: 600, color: C.ink })}>Jonah Bekele</div>
      <div style={at(SP, 138, { display: 'flex', gap: 8 })}><Pill text="ST5" size={13} /><Pill text="LTFT 80%" tone="teal" size={13} /><Pill text="In training" tone="success" size={13} /></div>
      <Section y={182} text="My timeline" />
      <MiniTimeline y={214} />
      <div style={at(SP, 300, { width: IW, height: 1, background: C.line })} />
      <DetailRow y={301} label="Now" value={trust('Caldermere General')} hl={pulseAt(t, 31.4, 33.0)} />
      <DetailRow y={349} label="From Feb 2027" value={trust('Ellerbeck Royal Infirmary')} hl={pulseAt(t, 32.4, 34.0)} />
      <DetailRow y={397} label="Next ARCP" value="9 Dec 2026 · Winter" hl={pulseAt(t, 33.4, 35.0)} />
      <DetailRow y={445} label="CCT" value="26 Nov 2030" hl={pulseAt(t, 34.4, 36.0)} />
      <div style={at(SP, MEET_Y, card({ width: IW, height: 262, padding: 16 }))}>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Meetings</div>
        <div style={{ fontSize: 14, color: C.inkSoft, marginTop: 6, lineHeight: 1.4 }}>Open drop-in with Dr E. Marsh</div>
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.4 }}>Tue 14 Oct · 13:00–15:00 · Seminar room 2</div>
      </div>
      <div style={at(SP + 16, BOOK_Y, { width: IW - 32 })}>
        {!booked ? (
          <div style={btnPrimary(press, { width: '100%' })}><Icon name="calendar" size={18} color="#fff" />Book a slot</div>
        ) : (
          <div style={{ height: 44, width: '100%', borderRadius: 8, background: C.successFill, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 15, fontWeight: 600, opacity: bp, transform: `scale(${0.96 + 0.04 * bp})` }}>
            <Icon name="check" size={18} color={C.success} sw={2.2} />Booked · 13:20, Tue 14 Oct
          </div>
        )}
      </div>
      <div style={at(SP + 16, BOOK_Y + 56, { width: IW - 32 })}>
        <div style={btnOutline(false, { width: '100%' })}><Icon name="mail" size={18} color={C.navy} />Request a meeting</div>
      </div>
      <div style={at(SP + 16, BOOK_Y + 112, { width: IW - 32, fontSize: 13, color: C.inkSoft, opacity: booked ? bp : 0 })}>Added to your calendar; Dr Marsh can see it too.</div>
    </Phone>
  );
}

// ── Film ─────────────────────────────────────────────────────────────────────
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
      <TitleCard t={t} heading="Tutors & trainees, on mobile" kicker="Product tour · every role served" />
      <EndCard t={t} inAt={53} />
    </FilmRoot>
  );
}
function AdeptMobileVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={62} background={C.backdrop} persistKey="adeptch7">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptMobileVideo = AdeptMobileVideo;
})();
