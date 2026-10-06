// Adept walkthrough — Chapter 4: "ARCPs without the spreadsheet" (70s)
// Redrawn 7 Oct 2026 for the app's redesign. The ARCPs page (new date card,
// dates filtered by season, trainees awaiting a date), then one date's page:
// assign a panel member, record the outcome and pick the next date in the
// same dialog, then create the summary and the draft email for the panel.
// Uses the shared kit (adept-video-kit.jsx), loaded before this file.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, WIN, SB_W, TB_H, PAD, kf, Icon, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, Pill, FilterChip, SectionTitle, Avatar, TrustName, card, btnPrimary, btnOutline,
} = window.AdeptKit;

// ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
const CX = SB_W + PAD;                    // content left (272)
const CW = WIN.w - SB_W - 2 * PAD;        // content width (1404)
const film = (x, y) => ({ x: WIN.x + x, y: WIN.y + y });
const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });

// ARCPs page
const NEW_Y = 88, NEW_W = 520, NEW_H = 272;
const DATES_TITLE = 392, FILT_Y = 440, FILT_H = 150;
const DROW_Y = 610, DROW = 72;
const AW_TITLE = 870, AW_ROW_Y = 980, AW_ROW = 56;
const LIST_SCROLL = 360;
// One date's page
const DW = 960;
const HEAD_Y = 88, HEAD_H = 100;
const AT_TITLE = 220, ROW_Y = 256, ROW = 92;
const AS_TITLE = 568, AS_BTN = 636, AS_ROW_Y = 700, AS_ROW = 60;
const DATE_SCROLL = 180;
const BTN_REC = { x: CX + DW - 8 - 160, w: 160 };
const BTN_PANEL = { x: BTN_REC.x - 12 - 136, w: 136 };
// Dialogs (centred in the window)
const DLG_W = 560, DLG_X = (WIN.w - DLG_W) / 2;
const PNL_Y = 250, PNL_H = 380;
const OUT_Y = 160, OUT_H = 560;
const OPT_Y = 150, OPT_H = 36;
const NEXT_Y = 222, NEXT_H = 52;

// Film coordinates the cursor aims at (the pointer's tip sits a few px in).
const tip = (p) => ({ x: p.x - 4, y: p.y - 3 });
const T_DATE_ROW = tip(film(CX + 160, DROW_Y - LIST_SCROLL + DROW / 2));
const T_PANEL = tip(film(BTN_PANEL.x + BTN_PANEL.w / 2, ROW_Y + 46));
const T_ASSIGN = tip(film(DLG_X + DLG_W - 24 - 48, PNL_Y + 96 + 32));
const T_CLOSE = tip(film(DLG_X + DLG_W - 24 - 40, PNL_Y + PNL_H - 68 + 22));
const T_RECORD = tip(film(BTN_REC.x + BTN_REC.w / 2, ROW_Y + 46));
const T_FIELD = tip(film(DLG_X + 260, OUT_Y + 96 + 25));
const T_OPT71 = tip(film(DLG_X + 160, OUT_Y + OPT_Y + 6 * OPT_H + OPT_H / 2));
const T_OPT1 = tip(film(DLG_X + 160, OUT_Y + OPT_Y + OPT_H / 2));
const T_NEXT = tip(film(DLG_X + 200, OUT_Y + NEXT_Y + NEXT_H + NEXT_H / 2));
const T_SAVE = tip(film(DLG_X + DLG_W - 24 - 70, OUT_Y + OUT_H - 70 + 22));
const T_SUMMARY = tip(film(CX + 170, AS_BTN - DATE_SCROLL + 22));

// ── Data ─────────────────────────────────────────────────────────────────────
const DATES = [
  { d: '14 Oct 2026', season: 'Off-cycle', panel: 'Dr A. Whitby, Dr S. Rahman', n: '3' },
  { d: '9 Dec 2026', season: 'Winter', panel: 'Dr K. Osei, Dr L. Moreau', n: '7' },
  { d: '9 Jun 2027', season: 'Summer', panel: 'No panel members yet', n: '0' },
];
const AWAITING = [
  ['Amara Adeyemi', 'CT2', 'Caldermere General'],
  ['Eilis Brennan', 'CT1', 'Harewood Vale'],
  ['Lena Novak', 'ST6', 'Wharfemoor Park'],
  ['Ravi Singh', 'ST4', 'Ellerbeck Royal Infirmary'],
];
const ALLOCATED = [
  { n: 'Jonah Bekele', g: 'ST5', tr: 'Caldermere General' },
  { n: 'Harleen Kaur', g: 'ST4', tr: 'Ousegate Teaching' },
  { n: 'Tom Whitfield', g: 'ST7', tr: 'Netherfield & District' },
];
const PANEL = [
  ['Dr A. Whitby', 'Consultant · Caldermere General', false],
  ['Dr S. Rahman', 'Consultant · Skelton Bridge', true],
  ['Dr L. Moreau', 'Consultant · Harewood Vale', false],
];
const OUTCOMES = [
  '1 - Satisfactory progress', '2 - Development required', '3 - Inadequate progress',
  '4 - Released from training', '5 - Incomplete evidence', '6 - Gained CCT',
  '7.1 - OOP satisfactory', '7.2 - OOP development', '7.3 - OOP incomplete',
  '7.4 - OOP no assessment', '8 - Out of programme',
];
const NEXT_DATES = [['9 Dec 2026', 'Winter'], ['9 Jun 2027', 'Summer'], ['13 Oct 2027', 'Off-cycle']];

// ── Timeline scripts ─────────────────────────────────────────────────────────
const T = {
  openDate: 19.6, pressPanel: 22.6, assign: 24.4, close: 25.8, record: 28.4,
  field: 30.0, pick: 31.8, next: 37.4, save: 40.4, summary: 46.8,
};
const CLICKS = [T.openDate, T.pressPanel, T.assign, T.close, T.record, T.field, T.pick, T.next, T.save, T.summary];
const CAPTIONS = [
  [6.6, 12.6, 'Every ARCP date, by season, in one list.'],
  [13.6, 19.0, 'Awaiting allocation: no one slips through.'],
  [20.8, 26.4, 'Assign a panel member to each trainee.'],
  [28.6, 34.2, 'Record the outcome, including 7.x sub-outcomes.'],
  [36.4, 43.0, 'Pick the next ARCP date in the same step.'],
  [45.0, 51.4, 'The summary and the panel email, drafted for you.'],
  [53.4, 58.8, 'ARCPs end to end: no spreadsheet, no chasing.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 12.8, x: 960, y: 520, z: 1.05 },
  { t: 14.4, x: 1084, y: 590, z: 1.25 },
  { t: 19.8, x: 1084, y: 590, z: 1.25 },
  { t: 20.8, x: 1000, y: 440, z: 1.42 },
  { t: 27.4, x: 1004, y: 440, z: 1.42 },
  { t: 28.9, x: 960, y: 470, z: 1.4 },
  { t: 40.6, x: 960, y: 474, z: 1.4 },
  { t: 41.6, x: 1000, y: 440, z: 1.42 },
  { t: 44.0, x: 1000, y: 440, z: 1.42 },
  { t: 45.2, x: 1000, y: 600, z: 1.2 },
  { t: 52.0, x: 1000, y: 604, z: 1.2 },
  { t: 53.6, x: 960, y: 540, z: 1.02 },
  { t: 70, x: 960, y: 540, z: 1.02 },
];
const LIST_SCROLL_K = [{ t: 0, s: 0 }, { t: 13.4, s: 0 }, { t: 14.6, s: LIST_SCROLL }, { t: 70, s: LIST_SCROLL }];
const DATE_SCROLL_K = [{ t: 0, s: 0 }, { t: 44.0, s: 0 }, { t: 45.2, s: DATE_SCROLL }, { t: 70, s: DATE_SCROLL }];
const CURSOR = [
  { t: 14.8, x: 1300, y: 760, o: 0 },
  { t: 15.4, x: 1300, y: 760, o: 1 },
  { t: 16.6, x: 900, y: WIN.y + AW_ROW_Y - LIST_SCROLL + AW_ROW / 2, o: 1 },
  { t: 18.0, x: 900, y: WIN.y + AW_ROW_Y - LIST_SCROLL + 2 * AW_ROW + AW_ROW / 2, o: 1 },
  { t: 19.1, ...T_DATE_ROW, o: 1 },
  { t: 20.4, ...T_DATE_ROW, o: 1 },
  { t: 21.0, x: 1300, y: 640, o: 1 },
  { t: 22.2, ...T_PANEL, o: 1 },
  { t: 22.8, ...T_PANEL, o: 1 },
  { t: 23.9, ...T_ASSIGN, o: 1 },
  { t: 24.6, ...T_ASSIGN, o: 1 },
  { t: 25.4, ...T_CLOSE, o: 1 },
  { t: 26.0, ...T_CLOSE, o: 1 },
  { t: 27.8, ...T_RECORD, o: 1 },
  { t: 28.6, ...T_RECORD, o: 1 },
  { t: 29.6, ...T_FIELD, o: 1 },
  { t: 30.2, ...T_FIELD, o: 1 },
  { t: 30.9, ...T_OPT71, o: 1 },
  { t: 31.2, ...T_OPT71, o: 1 },
  { t: 31.6, ...T_OPT1, o: 1 },
  { t: 32.2, ...T_OPT1, o: 1 },
  { t: 36.4, ...T_NEXT, o: 1 },
  { t: 37.6, ...T_NEXT, o: 1 },
  { t: 39.8, ...T_SAVE, o: 1 },
  { t: 40.6, ...T_SAVE, o: 1 },
  { t: 41.4, x: T_SAVE.x + 60, y: T_SAVE.y + 60, o: 0 },
  { t: 45.2, x: 900, y: 820, o: 0 },
  { t: 45.6, x: 900, y: 820, o: 1 },
  { t: 46.4, ...T_SUMMARY, o: 1 },
  { t: 48.6, ...T_SUMMARY, o: 1 },
  { t: 49.2, x: T_SUMMARY.x + 40, y: T_SUMMARY.y + 60, o: 0 },
];

const ease = (t, a, d = 0.4) => Easing.easeOutCubic(clamp((t - a) / d, 0, 1));
const pressed = (t, c) => t >= c - 0.12 && t < c + 0.2;
const between = (t, a, b) => t >= a && t < b;

// ── Small local atoms ────────────────────────────────────────────────────────
function Scrim({ o }) {
  return <div style={{ position: 'absolute', inset: 0, background: `rgba(19,39,63,${0.32 * o})`, zIndex: 20 }} />;
}
function Dialog({ y, h, o, children }) {
  return (
    <div style={at(DLG_X, y, { width: DLG_W, height: h, zIndex: 21, opacity: o, transform: `translateY(${(1 - o) * 14}px) scale(${0.98 + 0.02 * o})`, background: '#fff', borderRadius: 12, boxShadow: '0 24px 60px rgba(19,39,63,.22)', padding: 24 })}>
      {children}
    </div>
  );
}
function Snack({ text, o }) {
  if (o <= 0.01) return null;
  return (
    <div style={at((WIN.w + SB_W) / 2 - 290, 820, { width: 580, height: 48, zIndex: 30, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, background: C.ink, color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: 15 })}>{text}</div>
  );
}
const snackO = (t, a, b) => Math.min(ease(t, a, 0.3), 1 - Easing.easeInCubic(clamp((t - b) / 0.3, 0, 1)));

// ── The ARCPs page ───────────────────────────────────────────────────────────
function FilterRow({ y, label, chips }) {
  return (
    <div style={at(16, y, { display: 'flex', alignItems: 'center', gap: 8 })}>
      <span style={{ width: 66, fontSize: 15, color: C.inkSoft }}>{label}</span>
      {chips.map((c, i) => <FilterChip key={c} text={c} on={i === 0} />)}
    </div>
  );
}
function ArcpListScreen({ t }) {
  const s = kf(LIST_SCROLL_K, t, 's');
  const hoverDate = between(t, 19.1, 20.4);
  const awHl = (i) => { const a = 16.0 + i * 0.7; const p = clamp((t - a) / 1.2, 0, 1); return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI); };
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="ARCPs" />
      <div style={{ position: 'absolute', left: 0, top: TB_H, right: 0, bottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -TB_H - s, right: 0, height: 1300 }}>
          <div style={at(CX, NEW_Y, card({ width: NEW_W, height: NEW_H, padding: 24 }))}>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>New ARCP date</div>
            <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 12 }}>Pick a date: May to Jul counts as Summer, Nov to Jan as Winter.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16 }}>
              <span style={btnOutline(false)}><Icon name="calendar" size={16} color={C.navy} />Pick date</span>
              <span style={{ fontSize: 15, color: C.ink }}>Not set</span>
            </div>
            <div style={{ marginTop: 14 }}><FilterChip text="Off-cycle" /></div>
            <div style={btnPrimary(false, { display: 'flex', width: '100%', marginTop: 16 })}>Create ARCP date</div>
          </div>
          <div style={at(CX, DATES_TITLE, { width: CW, display: 'flex', alignItems: 'center' })}>
            <SectionTitle text="ARCP dates" />
            <span style={btnOutline(false, { marginLeft: 'auto', height: 36, fontSize: 14.5, padding: '0 14px' })}>Show all</span>
          </div>
          <div style={at(CX, FILT_Y, card({ width: CW, height: FILT_H }))}>
            <FilterRow y={16} label="Season" chips={['All', 'Summer', 'Winter', 'Off-cycle']} />
            <FilterRow y={60} label="Year" chips={['All', '2026', '2027']} />
            <FilterRow y={104} label="Band" chips={['All', 'Anaesthetics (not ACCS)', 'ACCS 1 and 2', 'ACCS 3 and 4']} />
          </div>
          <div style={at(CX, DROW_Y, { width: CW, borderTop: `1px solid ${C.line}` })} />
          {DATES.map((d, i) => (
            <div key={d.d} style={at(CX, DROW_Y + i * DROW, { width: CW, height: DROW, borderBottom: `1px solid ${C.line}`, background: i === 0 && hoverDate ? 'rgba(30,58,95,.06)' : 'transparent', transform: i === 0 && pressed(t, T.openDate) ? 'scale(0.995)' : 'none' })}>
              <div style={at(16, 14, { lineHeight: 1.3 })}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{d.d}</div>
                <div style={{ fontSize: 14.5, color: C.inkSoft }}>{d.season}</div>
              </div>
              <div style={at(360, 14, { lineHeight: 1.3 })}>
                <div style={{ fontSize: 14.5, color: C.inkSoft }}>Panel members</div>
                <div style={{ fontSize: 15, color: d.n === '0' ? C.inkSoft : C.ink }}>{d.panel}</div>
              </div>
              <div style={at(820, 14, { lineHeight: 1.3 })}>
                <div style={{ fontSize: 14.5, color: C.inkSoft }}>Trainees</div>
                <div style={{ fontSize: 15, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>{d.n}</div>
              </div>
              <div style={at(CW - 30, 28)}><Icon name="next" size={16} color={C.inkSoft} /></div>
            </div>
          ))}
          <div style={at(CX, AW_TITLE, { width: CW })}><SectionTitle text="Awaiting ARCP allocation" /></div>
          <div style={at(CX, AW_TITLE + 34, { fontSize: 15, color: C.inkSoft })}>Every trainee needs an ARCP each cycle. These trainees still need a date: tap one to allocate.</div>
          <div style={at(CX, AW_TITLE + 74, { width: CW, display: 'flex', alignItems: 'baseline', gap: 12 })}>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Winter</span>
            <span style={{ fontSize: 15, color: C.warning, fontWeight: 500 }}>4 trainees need a date</span>
          </div>
          <div style={at(CX, AW_ROW_Y, { width: CW, borderTop: `1px solid ${C.line}` })} />
          {AWAITING.map(([n, g, tr], i) => (
            <div key={n} style={at(CX, AW_ROW_Y + i * AW_ROW, { width: CW, height: AW_ROW, borderBottom: `1px solid ${C.line}`, background: `rgba(30,58,95,${0.06 * awHl(i)})` })}>
              <div style={at(12, 12)}><Avatar name={n} /></div>
              <span style={at(56, 17, { fontSize: 15.5, fontWeight: 600, color: C.ink })}>{n}</span>
              <span style={at(360, 17, { fontSize: 15.5, color: C.ink })}>{g}</span>
              <div style={at(500, 17)}><TrustName name={tr} /></div>
              <div style={at(CW - 30, 20)}><Icon name="next" size={16} color={C.inkSoft} /></div>
            </div>
          ))}
        </div>
      </div>
      <TopBar title="ARCPs" />
    </div>
  );
}

// ── One ARCP date ────────────────────────────────────────────────────────────
function AllocatedRow({ r, i, t }) {
  const hero = i === 0;
  const panelO = hero ? ease(t, T.close + 0.2) : (i === 2 ? 1 : 0);
  const outO = hero ? ease(t, T.save + 0.3) : 0;
  const recPress = hero && pressed(t, T.record);
  const panelPress = hero && pressed(t, T.pressPanel);
  const y = ROW_Y + i * ROW;
  const panelName = hero ? 'Dr A. Whitby' : 'Dr S. Rahman';
  return (
    <div style={at(CX, y, { width: DW, height: ROW, borderBottom: `1px solid ${C.line}` })}>
      <div style={at(8, 16)}><Avatar name={r.n} /></div>
      <div style={at(56, 12, { lineHeight: 1.35 })}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{r.n}</div>
        <div style={{ fontSize: 14.5, color: C.inkSoft }}>{outO > 0.5 ? `${r.g} · ${r.tr} · next ARCP 9 Jun 2027` : `${r.g} · ${r.tr}`}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, height: 24 }}>
          {panelO > 0.01 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: C.success, opacity: panelO }}>
              <Icon name="check" size={13} color={C.success} sw={2.2} />{panelName}
            </span>
          )}
          {outO > 0.01 && <span style={{ opacity: outO, transform: `scale(${0.9 + 0.1 * outO})`, display: 'inline-flex' }}><Pill text="1 - Satisfactory progress" tone="success" size={13.5} /></span>}
          {panelO <= 0.01 && outO <= 0.01 && <span style={{ fontSize: 14, color: C.inkSoft }}>No panel member yet</span>}
        </div>
      </div>
      <span style={at(BTN_PANEL.x - CX, 24, btnOutline(panelPress, { width: BTN_PANEL.w, padding: 0 }))}>Assign panel</span>
      <span style={at(BTN_REC.x - CX, 24, btnOutline(recPress, { width: BTN_REC.w, padding: 0 }))}>{outO > 0.5 ? 'Edit outcome' : 'Record outcome'}</span>
    </div>
  );
}
function ArcpDateScreen({ t }) {
  const s = kf(DATE_SCROLL_K, t, 's');
  const sumO = ease(t, T.summary + 0.5);
  const sumPress = pressed(t, T.summary);
  // Panel dialog
  const pnlO = Math.min(ease(t, T.pressPanel + 0.05, 0.3), 1 - Easing.easeInCubic(clamp((t - T.close - 0.05) / 0.3, 0, 1)));
  const assigned = t >= T.assign;
  // Outcome dialog
  const outO = Math.min(ease(t, T.record + 0.05, 0.3), 1 - Easing.easeInCubic(clamp((t - T.save - 0.05) / 0.3, 0, 1)));
  const menuO = between(t, T.field, T.pick + 0.25) ? Math.min(ease(t, T.field, 0.2), 1 - clamp((t - T.pick) / 0.25, 0, 1)) : 0;
  const chosen = t >= T.pick;
  const nextOn = t >= T.next;
  const hoverOpt = t < 31.3 ? 6 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="ARCPs" />
      <div style={{ position: 'absolute', left: 0, top: TB_H, right: 0, bottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -TB_H - s, right: 0, height: 1200 }}>
          <div style={at(CX, HEAD_Y, card({ width: DW, height: HEAD_H, padding: 20 }))}>
            <div style={{ fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>14 Oct 2026</div>
            <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2 }}>Off-cycle</div>
            <div style={at(DW - 20 - 404, 27, { display: 'flex', gap: 12 })}>
              <span style={btnOutline(false, { width: 210 })}><Icon name="plus" size={16} color={C.navy} />Add trainees to ARCP</span>
              <span style={btnOutline(false, { width: 182, color: C.error, borderColor: C.error })}>Remove ARCP date</span>
            </div>
          </div>
          <div style={at(CX, AT_TITLE, { width: DW })}><SectionTitle text="Allocated trainees" right="3 trainees" /></div>
          <div style={at(CX, ROW_Y, { width: DW, borderTop: `1px solid ${C.line}` })} />
          {ALLOCATED.map((r, i) => <AllocatedRow key={r.n} r={r} i={i} t={t} />)}
          <div style={at(CX, AS_TITLE, { width: DW })}><SectionTitle text="Assessors" /></div>
          <div style={at(CX, AS_TITLE + 32, { fontSize: 15, color: C.inkSoft })}>Consultant panel for this ARCP. Guest assessors invited by email.</div>
          <div style={at(CX, AS_BTN, { display: 'flex', alignItems: 'center', gap: 20 })}>
            <span style={btnPrimary(sumPress)}><Icon name="doc" size={16} color="#fff" />Create ARCP summary and draft email</span>
            {sumO > 0.01 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, opacity: sumO, transform: `translateX(${(1 - sumO) * -10}px)`, fontSize: 15, color: C.ink }}>
                <Icon name="download" size={17} color={C.success} />ARCP summary 14 Oct 2026.docx
                <span style={{ color: C.inkSoft }}>· email drafted to 2 assessors</span>
              </span>
            )}
          </div>
          <div style={at(CX, AS_ROW_Y, { width: DW, borderTop: `1px solid ${C.line}` })} />
          {PANEL.map(([n, sub, guest], i) => (
            <div key={n} style={at(CX, AS_ROW_Y + i * AS_ROW, { width: DW, height: AS_ROW, borderBottom: `1px solid ${C.line}` })}>
              <div style={at(8, 14)}><Avatar name={n} /></div>
              <div style={at(56, 9, { lineHeight: 1.3 })}>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{n}</div>
                <div style={{ fontSize: 14.5, color: C.inkSoft }}>{sub}</div>
              </div>
              <div style={at(DW - 300, 17, { display: 'flex', alignItems: 'center', gap: 18, width: 290, justifyContent: 'flex-end' })}>
                {guest && <Pill text="Guest" tone="neutral" />}
                {i < 2 && <span style={{ fontSize: 15, color: C.inkSoft }}>Reviewing {i === 0 && assigned ? 1 : (i === 1 ? 1 : 0)}</span>}
                <span style={{ fontSize: 15, color: C.navy, fontWeight: 500 }}>Remove</span>
              </div>
            </div>
          ))}
          <div style={at(CX, AS_ROW_Y + 3 * AS_ROW + 40, { width: DW })}><SectionTitle text="Invite a guest assessor" /></div>
          <div style={at(CX, AS_ROW_Y + 3 * AS_ROW + 84, { width: DW, display: 'flex', gap: 12 })}>
            {['Name', 'Email address'].map((l) => (
              <div key={l} style={{ flex: 1, height: 48, border: `1px solid ${C.field}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, color: C.inkSoft }}>{l}</div>
            ))}
            <span style={btnOutline(false, { height: 48 })}>Add assessor</span>
          </div>
        </div>
      </div>
      <TopBar title="ARCP" back />

      {/* Assign panel member */}
      {pnlO > 0.01 && <Scrim o={pnlO} />}
      {pnlO > 0.01 && (
        <Dialog y={PNL_Y} h={PNL_H} o={pnlO}>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>Assign panel member</div>
          <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 8 }}>Tap a panel member to assign them to review Jonah Bekele.</div>
          <div style={at(24, 96, { width: DLG_W - 48, borderTop: `1px solid ${C.line}` })} />
          {PANEL.map(([n, sub], i) => {
            const on = i === 0 && assigned;
            const press = i === 0 && pressed(t, T.assign);
            return (
              <div key={n} style={at(24, 96 + i * 64, { width: DLG_W - 48, height: 64, borderBottom: `1px solid ${C.line}` })}>
                <div style={at(0, 11, { lineHeight: 1.3 })}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{n}</div>
                  <div style={{ fontSize: 14.5, color: C.inkSoft }}>{sub}</div>
                </div>
                <span style={at(DLG_W - 48 - 96, 10, on
                  ? btnPrimary(press, { width: 96, padding: 0, background: C.success, boxShadow: 'none' })
                  : btnOutline(press, { width: 96, padding: 0 }))}>
                  {on ? 'Assigned' : 'Assign'}
                </span>
              </div>
            );
          })}
          <span style={at(DLG_W - 24 - 80, PNL_H - 68, btnOutline(pressed(t, T.close), { width: 80, padding: 0, border: 'none', boxShadow: 'none' }))}>Close</span>
        </Dialog>
      )}

      {/* Record / edit ARCP outcome */}
      {outO > 0.01 && <Scrim o={outO} />}
      {outO > 0.01 && (
        <Dialog y={OUT_Y} h={OUT_H} o={outO}>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>Record / edit ARCP outcome</div>
          <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 6 }}>Jonah Bekele · ST5 · 14 Oct 2026</div>
          <div style={at(24, 96, { width: DLG_W - 48, height: 50, border: `1px solid ${menuO > 0 ? C.navy : C.field}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, color: chosen ? C.ink : C.inkSoft, transform: pressed(t, T.field) ? 'scale(0.99)' : 'none' })}>
            <span style={at(10, -10, { background: '#fff', padding: '0 4px', fontSize: 13, color: C.inkSoft })}>ARCP outcome</span>
            {chosen ? OUTCOMES[0] : 'Select outcome'}
            <span style={{ marginLeft: 'auto' }}><Icon name="down" size={16} color={C.inkSoft} /></span>
          </div>
          <div style={at(24, NEXT_Y - 52, { width: DLG_W - 48, fontSize: 14.5, color: C.inkSoft, lineHeight: 1.4 })}>Next ARCP date (optional): pick an existing date or create a new one</div>
          {NEXT_DATES.map(([d, season], i) => {
            const on = i === 1 && nextOn;
            return (
              <div key={d} style={at(24, NEXT_Y + i * NEXT_H, { width: DLG_W - 48, height: NEXT_H - 6, borderRadius: 8, border: `1px solid ${on ? C.navy : C.line}`, background: on ? C.activeTint : '#fff', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12, transform: i === 1 && pressed(t, T.next) ? 'scale(0.98)' : 'none' })}>
                <Icon name="calendar" size={16} color={on ? C.navy : C.inkSoft} />
                <span style={{ fontSize: 15.5, fontWeight: on ? 600 : 400, color: C.ink }}>{d}</span>
                <span style={{ fontSize: 14.5, color: C.inkSoft }}>{season}</span>
                {on && <span style={{ marginLeft: 'auto' }}><Icon name="check" size={16} color={C.navy} sw={2.2} /></span>}
              </div>
            );
          })}
          <span style={at(24, NEXT_Y + 3 * NEXT_H + 6, btnOutline(false, { height: 40, fontSize: 14.5 }))}><Icon name="plus" size={15} color={C.navy} />Create new ARCP date</span>
          <div style={at(24, NEXT_Y + 3 * NEXT_H + 62, { fontSize: 15, color: C.ink })}>
            <span style={{ color: C.inkSoft }}>Selected: </span>{nextOn ? '9 Jun 2027 · Summer' : 'none'}
          </div>
          <div style={at(DLG_W - 24 - 240, OUT_H - 70, { display: 'flex', gap: 10 })}>
            <span style={btnOutline(false, { width: 90, padding: 0 })}>Cancel</span>
            <span style={btnPrimary(pressed(t, T.save), { width: 140, padding: 0, opacity: chosen ? 1 : 0.5 })}>Save outcome</span>
          </div>
          {menuO > 0.01 && (
            <div style={at(24, OPT_Y, { width: DLG_W - 48, opacity: menuO, transform: `translateY(${(1 - menuO) * -6}px)`, background: '#fff', borderRadius: 8, boxShadow: '0 12px 32px rgba(19,39,63,.20)', border: `1px solid ${C.line}`, padding: '0', overflow: 'hidden', zIndex: 5 })}>
              {OUTCOMES.map((o, i) => (
                <div key={o} style={{ height: OPT_H, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: C.ink, background: i === hoverOpt ? C.hover : 'transparent', fontWeight: i === 0 && pressed(t, T.pick) ? 600 : 400 }}>{o}</div>
              ))}
            </div>
          )}
        </Dialog>
      )}

      <Snack text="Panel member assigned" o={snackO(t, T.assign + 0.1, T.assign + 2.6)} />
      <Snack text="ARCP outcome recorded" o={snackO(t, T.save + 0.3, T.save + 3.2)} />
      <Snack text="Summary downloaded: attach it to the draft email" o={snackO(t, T.summary + 0.4, T.summary + 4.4)} />
    </div>
  );
}

// ── Film ─────────────────────────────────────────────────────────────────────
function Film({ showCaptions }) {
  const t = useTime();
  const listO = t < T.openDate + 0.3 ? 1 : 1 - Easing.easeInCubic(clamp((t - T.openDate - 0.3) / 0.45, 0, 1));
  const dateO = ease(t, T.openDate + 0.45, 0.45);
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow>
          {listO > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: listO }}><ArcpListScreen t={t} /></div>}
          {dateO > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: dateO }}><ArcpDateScreen t={t} /></div>}
        </AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="ARCPs without the spreadsheet" kicker="Product tour · ARCPs" />
      <EndCard t={t} inAt={60} />
    </FilmRoot>
  );
}
function AdeptArcpVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={70} background={C.backdrop} persistKey="adeptch4">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptArcpVideo = AdeptArcpVideo;
})();
