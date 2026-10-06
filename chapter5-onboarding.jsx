// Adept walkthrough — Chapter 5: "Onboarding a cohort" (66s)
// Redrawn 7 Oct 2026 for the app's redesign. The Invitations page: import the
// rotation grid (.xlsx), check the import preview, the new trainees wait as
// draft invitations under Pending, then "Send all". Last, the Summaries page
// exports the cohort back to Excel, grouped by trust.
// Uses the shared kit (adept-video-kit.jsx), loaded before this file.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, WIN, SB_W, TB_H, PAD, kf, Icon, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, Pill, FilterChip, Avatar, Swatch, PeriodSwitcher, card, btnPrimary, btnOutline, trustColour,
} = window.AdeptKit;

// ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
const CX = SB_W + PAD;                    // content left (272)
const CW = WIN.w - SB_W - 2 * PAD;        // content width (1404)
const COL = (CW - 24) / 2;                // 690
const RX = CX + COL + 24;                 // right card left (986)
const film = (x, y) => ({ x: WIN.x + x, y: WIN.y + y });
const tip = (p) => ({ x: p.x - 4, y: p.y - 3 });
const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });

const CARD_Y = 88;
const IMPORT_Y = CARD_Y + 110;
const PEND_ROW_Y = 196, PEND_ROW = 64;
const SEND = { x: RX + COL - 24 - 116, w: 116 };
const RESEND = { x: SEND.x - 12 - 170, w: 170 };
// Import preview dialog
const PV = { x: 85, y: 70, w: 1530, h: 780 };
const PV_IMPORT = { x: PV.x + PV.w - 24 - 160, y: PV.y + PV.h - 68, w: 160 };
// Summaries page
const EXPORT = { x: CX + CW - 96 - 16 - 250, y: 88, w: 250 };

const T_IMPORT = tip(film(CX + COL / 2, IMPORT_Y + 22));
const T_PV_IMPORT = tip(film(PV_IMPORT.x + PV_IMPORT.w / 2, PV_IMPORT.y + 22));
const T_SEND = tip(film(SEND.x + SEND.w / 2, CARD_Y + 16 + 22));
const T_EXPORT = tip(film(EXPORT.x + EXPORT.w / 2, EXPORT.y + 22));

// ── Data ─────────────────────────────────────────────────────────────────────
const DRAFTS = [
  ['Amara Adeyemi', 'CT2'], ['Jonah Bekele', 'ST5'], ['Eilis Brennan', 'CT1'], ['Michael Doyle', 'CT1'],
  ['Harleen Kaur', 'ST4'], ['Sanjay Patel', 'CT3'], ['Ravi Singh', 'ST4'],
];
const email = (n) => `${n.toLowerCase().replace(' ', '.')}@nhs.example`;
const WOULD = [
  ['190', 'new trainees'], ['0', 'trainees updated'], ['190', 'placements'], ['2', 'slot shares'],
  ['0', 'notes'], ['4', 'unfilled posts', true], ['190', 'new starters', true],
];
const COLUMNS = [
  ['Trust', 'Trust'], ['Site', 'Site'], ['National Post Number', 'Post number'], ['Trainee name', 'Name'],
  ['Email', 'Email'], ['Grade', 'Grade'], ['GMC', 'GMC number'], ['Placement start', 'Start'],
  ['Placement end', 'End'], ['WTE', 'Whole-time equivalent'], ['CCT', 'CCT date'],
];
const SHEET = [
  ['Caldermere General', [['Adeyemi, Amara', 'CT2', '1.0'], ['Bekele, Jonah', 'ST5', '0.8'], ['Okafor, Ada', 'CT2', '1.0']]],
  ['Ellerbeck Royal Infirmary', [['Singh, Ravi', 'ST4', '1.0'], ['Novak, Lena', 'ST6', '0.6']]],
  ['Skelton Bridge', [['Doyle, Michael', 'CT1', '1.0'], ['Iqbal, Pervez', 'ST5', '1.0']]],
  ['Harewood Vale', [['Brennan, Eilis', 'CT1', '1.0']]],
];
const GANTT = [
  ['Amara Adeyemi', 'CT2', ['Caldermere General', 'Harewood Vale']],
  ['Jonah Bekele', 'ST5', ['Caldermere General', 'Ousegate Teaching']],
  ['Eilis Brennan', 'CT1', ['Harewood Vale', 'Skelton Bridge']],
  ['Michael Doyle', 'CT1', ['Skelton Bridge', 'Wharfemoor Park']],
  ['Pervez Iqbal', 'ST5', ['Skelton Bridge', 'Netherfield & District']],
  ['Harleen Kaur', 'ST4', ['Ousegate Teaching', 'Ellerbeck Royal Infirmary']],
  ['Lena Novak', 'ST6', ['Ellerbeck Royal Infirmary', 'Caldermere General']],
  ['Ada Okafor', 'CT2', ['Caldermere General', 'Wharfemoor Park']],
  ['Sanjay Patel', 'CT3', ['Netherfield & District', 'Harewood Vale']],
];

// ── Timeline scripts ─────────────────────────────────────────────────────────
const T = { import: 15.2, preview: 17.0, confirm: 20.2, send: 31.4, toSummaries: 45.0, export: 47.6 };
const CLICKS = [T.import, T.confirm, T.send, T.export];
const CAPTIONS = [
  [6.6, 12.4, 'A new cohort starts as the spreadsheet you already have.'],
  [13.4, 19.6, 'Import it and check the preview before anything saves.'],
  [21.6, 27.8, 'Each new trainee waits as a draft. Nothing is sent yet.'],
  [29.8, 35.4, 'One click and the whole cohort is invited.'],
  [37.8, 44.2, 'Invite-only, always. There is no public sign-up page.'],
  [46.2, 52.6, 'And Excel comes back out, grouped by trust.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 12.4, x: 960, y: 520, z: 1.05 },
  { t: 13.8, x: 800, y: 380, z: 1.4 },
  { t: 16.6, x: 800, y: 384, z: 1.4 },
  { t: 17.4, x: 960, y: 500, z: 1.08 },
  { t: 20.4, x: 960, y: 500, z: 1.08 },
  { t: 21.6, x: 1250, y: 470, z: 1.25 },
  { t: 36.0, x: 1250, y: 474, z: 1.25 },
  { t: 37.8, x: 960, y: 530, z: 1.04 },
  { t: 44.4, x: 960, y: 530, z: 1.04 },
  { t: 45.6, x: 1100, y: 400, z: 1.25 },
  { t: 53.4, x: 1100, y: 404, z: 1.25 },
  { t: 54.8, x: 960, y: 540, z: 1.02 },
  { t: 66, x: 960, y: 540, z: 1.02 },
];
const CURSOR = [
  { t: 13.4, x: 760, y: 560, o: 0 },
  { t: 13.9, x: 760, y: 560, o: 1 },
  { t: 14.8, ...T_IMPORT, o: 1 },
  { t: 15.4, ...T_IMPORT, o: 1 },
  { t: 17.4, x: 1300, y: 640, o: 1 },
  { t: 19.4, ...T_PV_IMPORT, o: 1 },
  { t: 20.4, ...T_PV_IMPORT, o: 1 },
  { t: 21.0, x: T_PV_IMPORT.x + 40, y: T_PV_IMPORT.y + 40, o: 0 },
  { t: 28.8, x: 1500, y: 560, o: 0 },
  { t: 29.4, x: 1500, y: 560, o: 1 },
  { t: 30.8, ...T_SEND, o: 1 },
  { t: 32.6, ...T_SEND, o: 1 },
  { t: 33.4, x: T_SEND.x - 30, y: T_SEND.y + 70, o: 0 },
  { t: 45.8, x: 1200, y: 520, o: 0 },
  { t: 46.3, x: 1200, y: 520, o: 1 },
  { t: 47.2, ...T_EXPORT, o: 1 },
  { t: 48.4, ...T_EXPORT, o: 1 },
  { t: 49.0, x: T_EXPORT.x + 30, y: T_EXPORT.y + 60, o: 0 },
];

const ease = (t, a, d = 0.4) => Easing.easeOutCubic(clamp((t - a) / d, 0, 1));
const pressed = (t, c) => t >= c - 0.12 && t < c + 0.2;
const fadeWindow = (t, a, b, d = 0.3) => Math.min(ease(t, a, d), 1 - Easing.easeInCubic(clamp((t - b) / d, 0, 1)));

// ── Small local atoms ────────────────────────────────────────────────────────
const label = (text) => <div style={{ fontSize: 15, color: C.inkSoft, marginBottom: 8 }}>{text}</div>;
function Field({ text, dropdown, hint }) {
  return (
    <div style={{ height: 48, border: `1px solid ${C.field}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, color: hint ? C.inkSoft : C.ink }}>
      {text}{dropdown && <span style={{ marginLeft: 'auto' }}><Icon name="down" size={16} color={C.ink} /></span>}
    </div>
  );
}
function CountChip({ text, n, on }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 32, padding: '0 13px', borderRadius: 999, border: `1px solid ${on ? C.navy : C.line}`, background: on ? C.activeTint : '#fff', fontSize: 15, color: C.ink, whiteSpace: 'nowrap' }}>{text}<span style={{ color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>{n}</span></span>;
}
function Scrim({ o }) {
  return <div style={{ position: 'absolute', inset: 0, background: `rgba(19,39,63,${0.32 * o})`, zIndex: 20 }} />;
}

// ── Invitations ──────────────────────────────────────────────────────────────
function PendingRow({ n, g, i, t }) {
  const inP = ease(t, T.confirm + 0.5 + i * 0.08, 0.45);
  const sentP = ease(t, T.send + 0.35 + i * 0.12, 0.35);
  const sent = sentP > 0.5;
  return (
    <div style={at(24, PEND_ROW_Y + i * PEND_ROW, { width: COL - 48, height: PEND_ROW, borderBottom: `1px solid ${C.line}`, opacity: inP, transform: `translateY(${(1 - inP) * 10}px)` })}>
      <div style={at(0, 16)}><Avatar name={n} /></div>
      <div style={at(46, 11, { lineHeight: 1.3 })}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink }}>{n}<span style={{ fontWeight: 400, color: C.inkSoft }}>{`  ·  ${g}`}</span></div>
        <div style={{ fontSize: 14, color: C.inkSoft }}>{email(n)}</div>
      </div>
      <div style={at(COL - 48 - 330, 18, { width: 330, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 18 })}>
        <span style={{ transform: `scale(${sent ? 0.9 + 0.1 * sentP : 1})`, display: 'inline-flex' }}>
          {sent ? <Pill text="Sent" tone="success" /> : <Pill text="Draft" tone="warning" />}
        </span>
        <span style={{ width: 118, textAlign: 'right', fontSize: 15, fontWeight: 500, color: C.navy }}>{sent ? 'Resend' : 'Send invitation'}</span>
        <span style={{ fontSize: 15, fontWeight: 500, color: C.inkSoft }}>Delete</span>
      </div>
    </div>
  );
}
function InvitationsScreen({ t }) {
  const has = t >= T.confirm + 0.3;
  const hasP = ease(t, T.confirm + 0.3, 0.4);
  const loadO = fadeWindow(t, T.import + 0.15, T.preview - 0.2, 0.2);
  const pvO = fadeWindow(t, T.preview, T.confirm + 0.05, 0.35);
  const spin = (t * 360) % 360;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="Invitations" />
      <TopBar title="Invitations" />
      {/* Issue invitation */}
      <div style={at(CX, CARD_Y, card({ width: COL, height: 900, padding: 24 }))}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>Issue invitation</div>
        <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 10, lineHeight: 1.45 }}>Periods come from the Placement Start/End dates in the sheet: one placement per person per rotation period.</div>
        <div style={at(24, IMPORT_Y - CARD_Y, btnOutline(pressed(t, T.import), { width: COL - 48 }))}><Icon name="upload" size={17} color={C.navy} />Import trainees (.xlsx)</div>
        <div style={at(24, 172, { width: COL - 48, fontSize: 14.5, color: C.inkSoft, lineHeight: 1.45 })}>Import the HEE rotation grid as it is. Columns are matched by their headings, in any order: trust, site, National Post Number, trainee name, email, grade, GMC, placement start and end, WTE, CCT. You see a preview first and nothing is saved until you confirm. Nobody is emailed.</div>
        <div style={at(24, 278, { width: COL - 48, borderTop: `1px solid ${C.line}` })} />
        <div style={at(24, 296, { width: COL - 48 })}>
          {label('Invite type')}
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={btnPrimary(false, { height: 34, fontSize: 15, padding: '0 14px', boxShadow: 'none' })}>Trainee</span>
            <span style={btnOutline(false, { height: 34, fontSize: 15, padding: '0 14px', borderColor: C.line, color: C.ink })}>College tutor</span>
            <span style={btnOutline(false, { height: 34, fontSize: 15, padding: '0 14px', borderColor: C.line, color: C.ink })}>TPD</span>
          </div>
          <div style={{ height: 22 }} />
          {label('Name')}<Field text="Name" hint />
          <div style={{ height: 18 }} />
          {label('Email address')}<Field text="Email" hint />
          <div style={{ height: 18 }} />
          {label('Trainee type')}<Field text="New starter" dropdown />
          <div style={{ height: 18 }} />
          {label('Specialty')}<Field text="Anaesthetics" dropdown />
        </div>
      </div>
      {/* Pending */}
      <div style={at(RX, CARD_Y, card({ width: COL, height: has ? 196 + 7 * PEND_ROW + 60 : 200, padding: 24 }))}>
        <div style={{ display: 'flex', alignItems: 'center', height: 44, marginTop: -8 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>Pending</span>
        </div>
        {has && (
          <div style={at(RESEND.x - RX, 16, { display: 'flex', gap: 12, opacity: hasP })}>
            <span style={btnOutline(false, { width: RESEND.w, padding: 0 })}>Resend pending</span>
            <span style={btnPrimary(pressed(t, T.send), { width: SEND.w, padding: 0 })}>Send all</span>
          </div>
        )}
        <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 4 }}>
          {!has ? 'No pending invitations.' : (t < T.send + 0.6 ? '190 drafts, not sent yet.' : '190 invitations sent. Waiting for them to join.')}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <CountChip text="TPD" n="0" /><CountChip text="College Tutor" n="0" /><CountChip text="Trainee" n={has ? '190' : '0'} on={has} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <span style={{ fontSize: 15, color: C.inkSoft, width: 60 }}>Region</span>
          {has && <FilterChip text="All" on />}
          {has && <FilterChip text="Northdale Deanery" />}
        </div>
        {has && <div style={at(24, PEND_ROW_Y, { width: COL - 48, borderTop: `1px solid ${C.line}` })} />}
        {has && DRAFTS.map(([n, g], i) => <PendingRow key={n} n={n} g={g} i={i} t={t} />)}
        {has && <div style={at(24, PEND_ROW_Y + 7 * PEND_ROW + 18, { fontSize: 15, color: C.inkSoft, opacity: ease(t, T.confirm + 1.2) })}>183 more</div>}
      </div>

      {/* Reading imported file… */}
      {loadO > 0.01 && <Scrim o={loadO} />}
      {loadO > 0.01 && (
        <div style={at((WIN.w - 360) / 2, 400, { width: 360, height: 96, zIndex: 21, opacity: loadO, background: '#fff', borderRadius: 12, boxShadow: '0 24px 60px rgba(19,39,63,.22)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px' })}>
          <div style={{ width: 26, height: 26, borderRadius: 13, border: `3px solid ${C.line}`, borderTopColor: C.navy, transform: `rotate(${spin}deg)` }} />
          <span style={{ fontSize: 16, color: C.ink }}>Reading imported file…</span>
        </div>
      )}

      {/* Import preview */}
      {pvO > 0.01 && <Scrim o={pvO} />}
      {pvO > 0.01 && (
        <div style={at(PV.x, PV.y, { width: PV.w, height: PV.h, zIndex: 22, opacity: pvO, transform: `translateY(${(1 - pvO) * 14}px)`, background: '#fff', borderRadius: 12, boxShadow: '0 24px 60px rgba(19,39,63,.22)', padding: '20px 24px' })}>
          <div style={{ fontSize: 22, fontWeight: 600, color: C.ink }}>Import preview</div>
          <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 6 }}>cohort-aug-2026.xlsx · Nothing has been changed. This is what importing the file would do.</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginTop: 22 }}>Would write</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {WOULD.map(([v, cap, soft], i) => {
              const e = ease(t, T.preview + 0.3 + i * 0.07, 0.35);
              return (
                <div key={cap} style={card({ width: 168, padding: '12px 16px', opacity: e, transform: `translateY(${(1 - e) * 8}px)` })}>
                  <div style={{ fontSize: 24, fontWeight: 500, color: soft ? C.inkSoft : C.ink, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
                  <div style={{ fontSize: 14.5, color: C.inkSoft }}>{cap}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 24 }}>
            <div style={{ flex: 5 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Columns</div>
              <div style={{ display: 'flex', fontSize: 14, color: C.inkSoft, height: 30, alignItems: 'center', borderBottom: `1px solid ${C.line}` }}>
                <span style={{ width: 230 }}>Heading in the sheet</span><span>Read as</span>
              </div>
              {COLUMNS.map(([h, f]) => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', height: 33, borderBottom: `1px solid ${C.line}`, fontSize: 15, color: C.ink }}>
                  <span style={{ width: 230 }}>{h}</span><span style={{ color: C.inkSoft }}>{f}</span>
                  <span style={{ marginLeft: 'auto' }}><Icon name="check" size={15} color={C.success} sw={2.2} /></span>
                </div>
              ))}
            </div>
            <div style={{ flex: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Needs attention</div>
              <div style={{ borderTop: `1px solid ${C.line}`, padding: '12px 0', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>4 unfilled posts</div>
                <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2 }}>Skipped: no placement is created for them.</div>
              </div>
              <div style={{ padding: '12px 0', fontSize: 15, color: C.inkSoft }}>Every other row has a trust, a period and a person.</div>
            </div>
          </div>
          <div style={at(PV_IMPORT.x - PV.x - 12 - 96, PV_IMPORT.y - PV.y, { display: 'flex', gap: 12 })}>
            <span style={btnOutline(false, { width: 96, padding: 0 })}>Cancel</span>
            <span style={btnPrimary(pressed(t, T.confirm), { width: PV_IMPORT.w, padding: 0 })}>Import this file</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Summaries: export to Excel ───────────────────────────────────────────────
function SummariesScreen({ t }) {
  const sheetO = ease(t, T.export + 0.6, 0.5);
  const GX = CX + 200, GW = CW - 200, G_Y = 470, G_ROW = 44;
  const years = ['2025', '2026', '2027', '2028'];
  const seg = (txt, on) => (on
    ? <span style={btnPrimary(false, { height: 36, fontSize: 15, padding: '0 16px', boxShadow: 'none' })}>{txt}</span>
    : <span style={btnOutline(false, { height: 36, fontSize: 15, padding: '0 16px' })}>{txt}</span>);
  const chipRow = (y, l, chips) => (
    <div style={at(16, y, { display: 'flex', alignItems: 'center', gap: 8 })}>
      <span style={{ width: 70, fontSize: 15, color: C.inkSoft }}>{l}</span>
      {chips.map((c, i) => <FilterChip key={c} text={c} on={i === 0} />)}
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="Summaries" />
      <TopBar title="Summaries" right={<div style={{ display: 'flex', gap: 8 }}>{seg('Placements', true)}{seg('Trainee summary')}{seg('Progress')}</div>} />
      <div style={at(CX, 88, { display: 'flex', alignItems: 'center', gap: 16, height: 44 })}>
        <span style={{ fontSize: 15, color: C.inkSoft }}>Rotation</span>
        <PeriodSwitcher label="Aug 2026" minW={110} />
      </div>
      <span style={at(EXPORT.x, EXPORT.y, btnPrimary(pressed(t, T.export), { width: EXPORT.w, padding: 0 }))}><Icon name="download" size={17} color="#fff" />Export spreadsheet (.xlsx)</span>
      <span style={at(EXPORT.x + EXPORT.w + 16, 100, { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: C.ink })}><Icon name="filter" size={16} color={C.ink} />Filters</span>
      <div style={at(CX, 156, card({ width: CW, height: 268 }))}>
        {chipRow(16, 'Grade', ['All', 'CT1', 'CT2', 'CT3', 'ST4', 'ST5', 'ST6', 'ST7'])}
        {chipRow(66, 'Trust', ['All', 'Caldermere General', 'Ellerbeck Royal Infirmary', 'Skelton Bridge', 'Harewood Vale'])}
        {chipRow(116, 'Type', ['All', 'Core', 'ACCS'])}
        {chipRow(166, 'LTFT', ['All', 'LTFT', 'Full time'])}
        {chipRow(216, 'Status', ['All', 'Active', 'Paused', 'Unallocated'])}
      </div>
      <div style={at(CX, G_Y - 34, { width: 190, fontSize: 14, color: C.inkSoft })}>Trainee</div>
      {years.map((y, i) => <span key={y} style={at(GX + i * (GW / 4) + 8, G_Y - 34, { fontSize: 14, color: C.inkSoft })}>{y}</span>)}
      <div style={at(CX, G_Y, { width: CW, borderTop: `1px solid ${C.line}` })} />
      {years.map((y, i) => <div key={y} style={at(GX + i * (GW / 4), G_Y - 40, { height: 40 + GANTT.length * G_ROW, borderLeft: `1px solid ${C.line}` })} />)}
      {GANTT.map(([n, g, trusts], r) => (
        <div key={n} style={at(CX, G_Y + r * G_ROW, { width: CW, height: G_ROW, borderBottom: `1px solid ${C.line}` })}>
          <div style={at(0, 8)}><Avatar name={n} size={28} /></div>
          <div style={at(36, 5, { lineHeight: 1.2 })}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{n}</div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{g}</div>
          </div>
          {trusts.map((tr, k) => {
            const x0 = 200 + (GW / 4) * (1.58 + k * 0.5 + (r % 3) * 0.02), w = (GW / 4) * 0.48;
            return <div key={k} style={at(x0, 8, { width: w, height: 28, borderRadius: 4, background: trustColour(tr), color: '#fff', fontSize: 13, fontWeight: 500, padding: '0 8px', display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap' })}>{tr}</div>;
          })}
        </div>
      ))}
      <div style={at(GX + (GW / 4) * 1.56, G_Y - 40, { height: 40 + GANTT.length * G_ROW, borderLeft: `2px solid ${C.error}` })} />

      {/* The exported workbook, as it opens */}
      {sheetO > 0.01 && (
        <div style={at(EXPORT.x - 470, 152, { width: 800, zIndex: 25, opacity: sheetO, transform: `translateY(${(1 - sheetO) * 16}px)`, background: '#fff', borderRadius: 10, boxShadow: '0 24px 60px rgba(19,39,63,.26)', border: `1px solid ${C.line}`, overflow: 'hidden' })}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 16px', background: C.soft, borderBottom: `1px solid ${C.line}`, fontSize: 15, color: C.ink }}>
            <Icon name="doc" size={17} color={C.success} />Anaesthetics Higher - Aug 2026.xlsx
            <span style={{ marginLeft: 'auto', color: C.inkSoft, fontSize: 14 }}>Downloaded</span>
          </div>
          <div style={{ padding: '10px 16px 14px', fontSize: 14 }}>
            <div style={{ fontWeight: 600, color: C.ink, padding: '4px 0 8px' }}>Anaesthetics Higher - 2026</div>
            <div style={{ display: 'flex', color: C.inkSoft, borderBottom: `1px solid ${C.line}`, height: 28, alignItems: 'center' }}>
              <span style={{ width: 240 }}>Trust</span><span style={{ width: 200, paddingLeft: 10 }}>Trainee</span><span style={{ width: 80 }}>Grade</span><span style={{ width: 70 }}>WTE</span><span>Period</span>
            </div>
            {SHEET.map(([tr, rows], b) => (
              <div key={tr} style={{ display: 'flex', borderBottom: `1px solid ${C.line}`, opacity: ease(t, T.export + 0.9 + b * 0.25, 0.35) }}>
                <div style={{ width: 240, display: 'flex', alignItems: 'center', gap: 8, color: C.ink, borderRight: `1px solid ${C.line}`, paddingRight: 8 }}><Swatch name={tr} size={10} />{tr}</div>
                <div style={{ flex: 1 }}>
                  {rows.map(([n, g, w], k) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', height: 28, paddingLeft: 10, color: C.ink, borderTop: k ? `1px solid ${C.line}` : 'none' }}>
                      <span style={{ width: 190 }}>{n}</span><span style={{ width: 80 }}>{g}</span><span style={{ width: 70, fontVariantNumeric: 'tabular-nums' }}>{w}</span><span style={{ color: C.inkSoft }}>Aug 26 - Feb 27</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Film ─────────────────────────────────────────────────────────────────────
function Film({ showCaptions }) {
  const t = useTime();
  const invO = t < T.toSummaries - 0.3 ? 1 : 1 - Easing.easeInCubic(clamp((t - T.toSummaries + 0.3) / 0.45, 0, 1));
  const sumO = ease(t, T.toSummaries, 0.45);
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow>
          {invO > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: invO }}><InvitationsScreen t={t} /></div>}
          {sumO > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: sumO }}><SummariesScreen t={t} /></div>}
        </AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Onboarding a cohort" kicker="Product tour · import, then send all" />
      <EndCard t={t} inAt={56} />
    </FilmRoot>
  );
}
function AdeptOnboardVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={66} background={C.backdrop} persistKey="adeptch5">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptOnboardVideo = AdeptOnboardVideo;
})();
