// Adept walkthrough — Chapter 10: "Code of Practice notices" (60s)
// Drawn 28 Oct 2026 from the app's Reports page, Notice periods section
// (reports_notice_sections.dart): the changeover's 12, 8 and 6-week
// deadlines, the "Due now" queue, recording a trust's arrivals pack as sent,
// the trust table with its dated marks, and the Export menu.
// Uses the shared kit (adept-video-kit.jsx), loaded before this file.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, WIN, SB_W, PAD, Icon, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, Pill, SectionTitle, TrustName, PeriodSwitcher, Flip, card, btnPrimary, btnOutline,
} = window.AdeptKit;

// ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
const CX = SB_W + PAD;                    // content left (272)
const CW = WIN.w - SB_W - 2 * PAD;        // content width (1404)
const TITLE_Y = 84, INTRO_Y = 120;
const LINE_Y = 190;
const DUE = { x: CX, y: 306, w: 780, h: 330 };
const RIGHT_X = CX + 812, RIGHT_W = CW - 812;
const TR_TITLE = 652, TR_HEAD = 680, TR_Y = 716, TR_ROW = 42;
const EXPORT = { x: CX + CW - 230 - 12 - 124, y: 70, w: 124, h: 44 };
const PDF = { x: CX + CW - 230, y: 70, w: 230, h: 44 };
// The pack row's buttons inside the Due now card (window coordinates).
const RECORD = { x: DUE.x + DUE.w - 20 - 186, y: DUE.y + 268, w: 186, h: 40 };
const DOWNLOAD = { x: RECORD.x - 10 - 166, y: RECORD.y, w: 166, h: 40 };
// The confirm dialog, centred in the window.
const DLG = { w: 600, h: 232 };
DLG.x = (WIN.w - DLG.w) / 2 + SB_W / 2;
DLG.y = 318;
const OK = { w: 168, h: 44 };
OK.x = DLG.x + DLG.w - 24 - OK.w;
OK.y = DLG.y + DLG.h - 24 - OK.h;
const film = (r) => ({ x: WIN.x + r.x + r.w / 2, y: WIN.y + r.y + r.h / 2 });
const RECORD_F = film(RECORD), OK_F = film(OK), EXPORT_F = film(EXPORT);

const CAPTIONS = [
  [6.6, 12.4, 'Every changeover has three Code of Practice deadlines.'],
  [13.0, 19.2, "12 weeks to tell the doctor and the trust where they're going."],
  [19.8, 25.4, '8 weeks for the work schedule and pay, 6 for the rota.'],
  [26.4, 32.6, "Due now: who hasn't been told, and which trusts."],
  [33.4, 39.6, 'Send the trust its arrivals pack, and record it.'],
  [40.6, 46.4, 'Every date is kept: who was told, and when.'],
  [47.4, 53.0, 'The record a quality visit asks for, in one export.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 7.6, x: 937, y: 555, z: 1.1 },
  { t: 25.4, x: 939, y: 555, z: 1.1 },
  { t: 26.6, x: 772, y: 538, z: 1.45 },
  { t: 39.8, x: 776, y: 540, z: 1.45 },
  { t: 40.9, x: 960, y: 598, z: 1.06 },
  { t: 46.6, x: 960, y: 600, z: 1.06 },
  { t: 47.6, x: 1072, y: 479, z: 1.3 },
  { t: 53.2, x: 1074, y: 479, z: 1.3 },
  { t: 54.2, x: 960, y: 540, z: 1.03 },
  { t: 60, x: 960, y: 540, z: 1.03 },
];
const T_RECORD = 34.8, T_OK = 37.8, T_EXPORT = 48.6;
const CLICKS = [T_RECORD, T_OK, T_EXPORT];
const CURSOR = [
  { t: 33.2, x: 980, y: 720, o: 0 },
  { t: 33.6, x: 980, y: 720, o: 1 },
  { t: 34.5, x: RECORD_F.x - 6, y: RECORD_F.y - 6, o: 1 },
  { t: 35.4, x: RECORD_F.x - 6, y: RECORD_F.y - 6, o: 1 },
  { t: 37.4, x: OK_F.x - 6, y: OK_F.y - 6, o: 1 },
  { t: 38.4, x: OK_F.x - 6, y: OK_F.y - 6, o: 1 },
  { t: 39.0, x: OK_F.x + 30, y: OK_F.y + 40, o: 0 },
  { t: 47.2, x: 1240, y: 300, o: 0 },
  { t: 47.6, x: 1240, y: 300, o: 1 },
  { t: 48.3, x: EXPORT_F.x - 6, y: EXPORT_F.y - 6, o: 1 },
  { t: 49.6, x: EXPORT_F.x - 6, y: EXPORT_F.y - 6, o: 1 },
  { t: 50.6, x: EXPORT_F.x + 60, y: EXPORT_F.y + 62, o: 1 },
  { t: 52.6, x: EXPORT_F.x + 60, y: EXPORT_F.y + 62, o: 1 },
  { t: 53.0, x: EXPORT_F.x + 60, y: EXPORT_F.y + 62, o: 0 },
];
const press = (t, at) => t >= at - 0.12 && t < at + 0.15;
const ease = (t, a, d = 0.4) => Easing.easeOutCubic(clamp((t - a) / d, 0, 1));
const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });
const RECORDED = 38.4;   // the pack is recorded (dialog confirmed)

// ── Data (fictional) ─────────────────────────────────────────────────────────
// Today is Wed 11 Nov 2026: exactly 12 weeks before the 3 Feb 2027 changeover.
const MARKS = [
  { k: '12 weeks', d: 'Wed 11 Nov 2026', who: 'Trainee told, trust given the details', duty: 'Deanery', on: [13.0, 19.4], today: true },
  { k: '8 weeks', d: 'Wed 9 Dec 2026', who: 'Work schedule and pay', duty: 'Trust duty', on: [19.8, 25.6] },
  { k: '6 weeks', d: 'Wed 23 Dec 2026', who: 'Rota', duty: 'Trust duty', on: [19.8, 25.6] },
  { k: 'Changeover', d: 'Wed 3 Feb 2027', who: 'Doctors start', duty: 'Feb 2027 rotation' },
];
const UNTOLD = [
  ['Amara Osei', 'Skelton Bridge'],
  ['Tomasz Nowak', 'Caldermere General'],
  ['Lena Hart', 'Wharfemoor Park'],
];
// [trust, arriving, first arrival, told (date or null), told rag before/after]
const TRUSTS = [
  ['Caldermere General', 9, '4 Nov 2026'],
  ['Ellerbeck Royal Infirmary', 8, '21 Oct 2026'],
  ['Skelton Bridge', 7, '28 Oct 2026'],
  ['Harewood Vale', 4, null],
  ['Wharfemoor Park', 6, '6 Nov 2026'],
];
const BARS = [['On time', 41, C.success], ['Late', 0, C.warning], ['Very late', 0, C.error], ['No record', 0, C.inkSoft], ['Not yet due', 3, C.inkSoft]];
const MENU = [
  'Notice period summary Feb 2027 (.xlsx)',
  'Notice period summary Feb 2027 (.csv)',
  'Trust notices Feb 2027 (.xlsx)',
  'Trust notices Feb 2027 (.csv)',
  'Trainee notices Feb 2027 (.xlsx)',
  'Trainee notices Feb 2027 (.csv)',
];

// A RAG mark as the app draws it: an icon, a word, never colour alone.
function Rag({ kind, detail }) {
  const [ic, col, word] = {
    green: ['check', C.success, 'On time'],
    pending: ['calendar', C.inkSoft, 'Not yet due'],
    unknown: ['help', C.inkSoft, 'No record'],
  }[kind];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14.5, color: col, whiteSpace: 'nowrap' }}>
      <Icon name={ic} size={15} color={col} sw={2} />{detail ? `${detail} · ${word}` : word}
    </span>
  );
}

// ── Header: section title, Export, PDF, intro ────────────────────────────────
function Header({ t }) {
  return (
    <>
      <div style={at(CX, TITLE_Y, { width: 700 })}><SectionTitle text="Notice periods" /></div>
      <div style={at(EXPORT.x, EXPORT.y, btnOutline(press(t, T_EXPORT), { width: EXPORT.w }))}><Icon name="download" size={17} color={C.navy} />Export</div>
      <div style={at(PDF.x, PDF.y, btnOutline(false, { width: PDF.w }))}>Export summary (PDF)</div>
      <div style={at(CX, INTRO_Y, { width: CW - 400, fontSize: 14.5, color: C.inkSoft, lineHeight: 1.45 })}>
        Were trainees and trusts told 12 weeks before the Feb 2027 changeover (3 Feb 2027)? "No record" means no date in adept, not late.
      </div>
    </>
  );
}

// ── The changeover and its deadlines ─────────────────────────────────────────
function Strip({ t }) {
  const x0 = CX + 150, x1 = CX + CW - 150;
  const step = (x1 - x0) / (MARKS.length - 1);
  const drawn = ease(t, 6.8, 1.6);
  return (
    <>
      <div style={at(x0, LINE_Y, { width: (x1 - x0) * drawn, height: 2, background: C.line })} />
      {MARKS.map((m, i) => {
        const x = x0 + i * step;
        const show = ease(t, 7.0 + i * 0.35, 0.5);
        const hot = m.on && t >= m.on[0] && t < m.on[1] ? ease(t, m.on[0], 0.4) * (1 - ease(t, m.on[1] - 0.3, 0.3)) : 0;
        const end = i === MARKS.length - 1;
        const dot = end ? C.navy : hot > 0.01 ? C.warning : C.navy;
        return (
          <div key={m.k} style={{ opacity: show }}>
            {m.today && <div style={at(x - 30, LINE_Y - 34, { width: 60, textAlign: 'center' })}><Pill text="Today" tone="blue" size={13} /></div>}
            <div style={at(x - 8 - 3 * hot, LINE_Y - 7 - 3 * hot, { width: 16 + 6 * hot, height: 16 + 6 * hot, borderRadius: 999, background: end ? C.navy : '#fff', border: `3px solid ${dot}` })} />
            <div style={at(x - 150, LINE_Y + 20, { width: 300, textAlign: 'center', lineHeight: 1.35, padding: '6px 8px', borderRadius: 8, background: hot > 0.01 ? `rgba(154,91,19,${0.1 * hot})` : 'transparent' })}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{m.k} · {m.d}</div>
              <div style={{ fontSize: 14.5, color: C.ink }}>{m.who}</div>
              <div style={{ fontSize: 14, color: C.inkSoft }}>{m.duty}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── Due now ──────────────────────────────────────────────────────────────────
function DueNow({ t }) {
  const gone = ease(t, RECORDED, 0.5);
  const hlTrainees = t >= 26.6 && t < 32.8 ? ease(t, 26.8) * (1 - ease(t, 32.4, 0.3)) : 0;
  return (
    <div style={at(DUE.x, DUE.y, card({ width: DUE.w, height: DUE.h }))}>
      <div style={at(20, 16, { fontSize: 17, fontWeight: 600, color: C.ink })}>Due now</div>
      <div style={at(20, 44, { width: DUE.w - 40, fontSize: 14, color: C.inkSoft, lineHeight: 1.45 })}>
        Placements starting in the next 12 weeks with no told date, and trusts with doctors arriving in that time and no pack recorded. Earliest deadline: 11 Nov 2026.
      </div>
      <div style={at(20, 104, { fontSize: 15, fontWeight: 600, color: C.ink })}>Trainees with no told date (3)</div>
      {UNTOLD.map(([n, tr], i) => (
        <div key={n} style={at(12, 132 + i * 32, { width: DUE.w - 24, height: 30, padding: '0 8px', borderRadius: 6, display: 'flex', alignItems: 'center', background: hlTrainees > 0 ? `rgba(30,58,95,${0.06 * hlTrainees})` : 'transparent' })}>
          <span style={{ fontSize: 14.5, color: C.ink, whiteSpace: 'nowrap' }}>{n} · {tr} · starts 3 Feb 2027 (84 days)</span>
        </div>
      ))}
      <div style={at(20, 240, { fontSize: 15, fontWeight: 600, color: C.ink })}>
        <Flip from="Trusts with no pack recorded (1)" to="Trusts with no pack recorded (0)" p={ease(t, RECORDED + 0.2)} />
      </div>
      <div style={{ opacity: 1 - gone }}>
        <div style={at(20, 270, { lineHeight: 1.35 })}>
          <TrustName name="Harewood Vale" size={14.5} weight={500} />
          <div style={{ fontSize: 14, color: C.inkSoft }}>4 arriving 3 Feb 2027 · due 11 Nov 2026</div>
        </div>
        <div style={at(DOWNLOAD.x - DUE.x, DOWNLOAD.y - DUE.y, btnOutline(false, { width: DOWNLOAD.w, height: DOWNLOAD.h, fontSize: 14.5 }))}><Icon name="download" size={16} color={C.navy} />Download pack</div>
        <div style={at(RECORD.x - DUE.x, RECORD.y - DUE.y, btnOutline(press(t, T_RECORD), { width: RECORD.w, height: RECORD.h, fontSize: 14.5 }))}>Record pack sent…</div>
      </div>
      <div style={at(20, 274, { fontSize: 14, color: C.inkSoft, opacity: ease(t, RECORDED + 0.4) })}>None.</div>
    </div>
  );
}

// ── Figures and the chart ────────────────────────────────────────────────────
function Figures({ t }) {
  const flip = ease(t, RECORDED + 0.3);
  const fig = (value, caption, x) => (
    <div style={at(x, DUE.y, { lineHeight: 1.25 })}>
      <div style={{ fontSize: 24, fontWeight: 500, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 14.5, color: C.inkSoft }}>{caption}</div>
    </div>
  );
  const max = 44, bw = RIGHT_W - 150;
  return (
    <>
      {fig('41 of 44', 'trainees told 12+ weeks ahead', RIGHT_X)}
      {fig(<Flip from="4 of 5" to="5 of 5" p={flip} />, 'trusts told 12+ weeks ahead', RIGHT_X + 300)}
      <div style={at(RIGHT_X, DUE.y + 92, { fontSize: 15, fontWeight: 600, color: C.ink })}>Trainees told, Feb 2027</div>
      {BARS.map(([l, n, col], i) => {
        const g = ease(t, 7.6 + i * 0.15, 0.8);
        return (
          <div key={l} style={at(RIGHT_X, DUE.y + 128 + i * 38, { width: RIGHT_W, height: 28, display: 'flex', alignItems: 'center' })}>
            <span style={{ width: 110, fontSize: 14.5, color: C.ink }}>{l}</span>
            <div style={{ width: (bw * n / max) * g, height: 18, borderRadius: 4, background: col, opacity: n ? 0.9 : 0 }} />
            <span style={{ marginLeft: 10, fontSize: 14.5, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
          </div>
        );
      })}
    </>
  );
}

// ── Trusts table ─────────────────────────────────────────────────────────────
function TrustTable({ t }) {
  const cols = { trust: 8, arr: 300, first: 410, told: 560, sched: 860, rota: 1150 };
  const flip = ease(t, RECORDED + 0.2);
  const hl = t >= 40.6 && t < 46.6 ? ease(t, 40.8) * (1 - ease(t, 46.2, 0.3)) : 0;
  return (
    <>
      <div style={at(CX, TR_TITLE, { fontSize: 15, fontWeight: 600, color: C.ink })}>Trusts</div>
      <div style={at(CX, TR_HEAD, { width: CW, height: TR_Y - TR_HEAD, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, fontSize: 14, color: C.inkSoft })}>
        {[['Trust', cols.trust], ['Arriving', cols.arr], ['First arrival', cols.first], ['Trust told (12 weeks; deanery)', cols.told], ['Work schedule (8 weeks; trust duty)', cols.sched], ['Rota (6 weeks; trust duty)', cols.rota]].map(([h, x]) => <span key={h} style={at(x, 9, { whiteSpace: 'nowrap' })}>{h}</span>)}
      </div>
      {TRUSTS.map(([name, n, told], i) => {
        const hv = name === 'Harewood Vale';
        return (
          <div key={name} style={at(CX, TR_Y + i * TR_ROW, { width: CW, height: TR_ROW, borderBottom: `1px solid ${C.line}`, background: hv && hl > 0 ? `rgba(4,120,87,${0.08 * hl})` : 'transparent' })}>
            <span style={at(cols.trust, 11)}><TrustName name={name} size={15} /></span>
            <span style={at(cols.arr, 11, { fontSize: 15, color: C.ink, fontVariantNumeric: 'tabular-nums' })}>{n}</span>
            <span style={at(cols.first, 11, { fontSize: 15, color: C.ink })}>3 Feb 2027</span>
            <span style={at(cols.told, 11)}>
              {told ? <Rag kind="green" detail={told} />
                : <Flip from={<Rag kind="pending" />} to={<Rag kind="green" detail="11 Nov 2026" />} p={flip} />}
            </span>
            <span style={at(cols.sched, 11)}><Rag kind="pending" /></span>
            <span style={at(cols.rota, 11)}><Rag kind="pending" /></span>
          </div>
        );
      })}
    </>
  );
}

// ── The confirm dialog, the toast and the export menu ────────────────────────
function Dialog({ t }) {
  const o = ease(t, T_RECORD + 0.1, 0.3) * (1 - ease(t, RECORDED - 0.3, 0.3));
  if (o <= 0.01) return null;
  return (
    <>
      <div style={at(0, 0, { width: WIN.w, height: WIN.h, background: `rgba(15,28,46,${0.32 * o})` })} />
      <div style={at(DLG.x, DLG.y, card({ width: DLG.w, height: DLG.h, padding: '22px 24px', opacity: o, transform: `scale(${0.97 + 0.03 * o})`, boxShadow: '0 18px 50px rgba(19,39,63,.25)' }))}>
        <div style={{ fontSize: 19, fontWeight: 600, color: C.ink }}>Record the pack as sent today?</div>
        <div style={{ fontSize: 15, color: C.inkSoft, lineHeight: 1.5, marginTop: 10 }}>
          This records that Harewood Vale was given the details of the higher doctors arriving for Feb 2027 today. Download and send the pack first. If a pack was already recorded, the first date is kept and this is noted as a re-send.
        </div>
      </div>
      <div style={at(OK.x - 110, OK.y + 12, { fontSize: 15, fontWeight: 600, color: C.navy, opacity: o })}>Cancel</div>
      <div style={at(OK.x, OK.y, btnPrimary(press(t, T_OK), { width: OK.w, opacity: o }))}>Record as sent</div>
    </>
  );
}
function Toast({ t }) {
  const o = ease(t, RECORDED + 0.1, 0.3) * (1 - ease(t, 41.6, 0.4));
  if (o <= 0.01) return null;
  return (
    <div style={at(SB_W + (WIN.w - SB_W) / 2 - 120, WIN.h - 84 + (1 - o) * 12, { width: 240, height: 48, borderRadius: 8, background: C.ink, color: '#fff', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o })}>Saved.</div>
  );
}
function Menu({ t }) {
  const o = ease(t, T_EXPORT + 0.15, 0.25) * (1 - ease(t, 53.2, 0.3));
  if (o <= 0.01) return null;
  const hover = t >= 50.4 ? 0 : -1;
  return (
    <div style={at(EXPORT.x, EXPORT.y + EXPORT.h + 6, card({ width: 340, padding: '6px 0', opacity: o, boxShadow: '0 12px 32px rgba(19,39,63,.18)', transform: `translateY(${(1 - o) * -6}px)` }))}>
      {MENU.map((m, i) => (
        <div key={m} style={{ height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 15, color: C.ink, background: i === hover ? C.hover : 'transparent', whiteSpace: 'nowrap' }}>{m}</div>
      ))}
    </div>
  );
}

function NoticesScreen({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="Reports" />
      <TopBar title="Reports" right={<PeriodSwitcher label="Feb 2027" />} />
      <Header t={t} />
      <Strip t={t} />
      <DueNow t={t} />
      <Figures t={t} />
      <TrustTable t={t} />
      <Toast t={t} />
      <Dialog t={t} />
      <Menu t={t} />
    </div>
  );
}

function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><NoticesScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Code of Practice notices" kicker="Product tour · notice periods" />
      <EndCard t={t} inAt={54} />
    </FilmRoot>
  );
}
function AdeptNoticesVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={60} background={C.backdrop} persistKey="adeptch10">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptNoticesVideo = AdeptNoticesVideo;
})();
