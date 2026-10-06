// Adept walkthrough — Chapter 2: "Allocating trainees to trusts" (68s)
// Scene code for the animations.jsx engine. Exposes window.AdeptAllocateVideo.
// Redrawn 7 Oct 2026 for the app's redesign: the trust page is a banner in the
// trust's colour, Manage allocations full width beside it, a period switcher
// over roster tiles sorted by surname, and the Trust details panel (Capacity,
// Slots allocated, Head count, Total WTE). Uses the shared kit.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, WIN, SB_W, TB_H, PAD, kf, Flip, Icon, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, Pill, SectionTitle, Avatar, Square, PeriodSwitcher, ViewToggle, Tick, card,
  btnPrimary, btnOutline, trustColour,
} = window.AdeptKit;

// ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
const CX = SB_W + PAD;                    // content left (272)
const CW = WIN.w - SB_W - 2 * PAD;        // content width (1404)
const RW = 320;                           // right column (actions + panels)
const RX = CX + CW - RW;                  // 1356
const LW = CW - RW - 24;                  // left column (1060)
const BAN_Y = 88, BAN_H = 92;
const SW_Y = 276;                         // period switcher row
const TILE_Y = 336, TILE_H = 128, TILE_STEP = 140, COLS = 5, TGAP = 13;
const TILE_W = (LW - (COLS - 1) * TGAP) / COLS;
const SHEET_TOP = 330;
const SH_PAD = 28, SH_LW = Math.round((WIN.w - 2 * SH_PAD) * 0.4), SH_GAP = 32;
const SH_RX = SH_PAD + SH_LW + SH_GAP;    // right list x inside the sheet
const SH_RW = WIN.w - SH_PAD - SH_RX;
const LIST_Y = SHEET_TOP + 182, SROW = 56;
const TRUST = 'Caldermere General';

// Film coordinates the cursor aims at (the arrow's tip is ~6,4 into the icon).
const tip = (x, y) => ({ x: WIN.x + x - 6, y: WIN.y + y - 4 });
const MANAGE = tip(RX + RW / 2, BAN_Y + 22);
const TICK0 = tip(SH_RX + 21, LIST_Y + SROW / 2);
const TICK1 = tip(SH_RX + 21, LIST_Y + SROW + SROW / 2);
const ALLOC = tip(WIN.w - SH_PAD - 68, LIST_Y + 5 * SROW + 42);
const NEXT = tip(CX + 40 + 130 + 20, SW_Y + 20);

// ── Data ─────────────────────────────────────────────────────────────────────
// Roster for Aug 2026, sorted by surname (the app's order). wte < 1 is LTFT.
const AUG = [
  ['Chidi Adeyemi', 'CT2'], ['Jonah Bekele', 'ST5', 0.8], ['Eilis Brennan', 'CT1'], ['Nadia Carter', 'ST4'],
  ['Owen Dale', 'CT3'], ['Grace Ellison', 'ST6'], ['Farah Fenwick', 'CT1'], ['Lucy Hughes', 'ST6'],
  ['Pervez Iqbal', 'ST5'], ['Harleen Kaur', 'ST4', 0.6], ['Isaac Lowe', 'CT2'], ['David Marsh', 'CT3'],
  ['Priya Nair', 'ST7'], ['Ben Oduya', 'CT1'], ['Sam Pearce', 'ST5'], ['Ruth Quinn', 'CT2'],
  ['Amir Rahman', 'ST4'], ['Holly Shaw', 'CT1'], ['Ella Thornton', 'ST6'], ['Tom Whitfield', 'ST7'],
];
const NEW = { 'Ada Okafor': ['Ada Okafor', 'CT2'], 'Ravi Singh': ['Ravi Singh', 'ST4', 0.6] };
const surname = (n) => n.split(' ').slice(-1)[0];
const AUG_AFTER = [...AUG, NEW['Ada Okafor'], NEW['Ravi Singh']].sort((a, b) => surname(a[0]).localeCompare(surname(b[0])));
const FEB = [
  ['Zara Ahmed', 'CT1'], ['Jonah Bekele', 'ST6', 0.8], ['Eilis Brennan', 'CT1'], ['Nadia Carter', 'ST4'],
  ['Grace Ellison', 'ST6'], ['Farah Fenwick', 'CT2'], ['Lucy Hughes', 'ST7'], ['Harleen Kaur', 'ST4', 0.6],
  ['Isaac Lowe', 'CT2'], ['Ada Okafor', 'CT2'], ['Sam Pearce', 'ST5'], ['Ruth Quinn', 'CT2'],
  ['Amir Rahman', 'ST5'], ['Holly Shaw', 'CT1'], ['Ravi Singh', 'ST4', 0.6], ['Ella Thornton', 'ST6'],
  ['Kit Vaughan', 'CT1'], ['Nia Williams', 'ST4'], ['Leo Young', 'CT1'], ['Mei Zhang', 'ST5'],
];
const ALREADY = [['Chidi Adeyemi', 'CT2'], ['Jonah Bekele', 'ST5', 0.8], ['Eilis Brennan', 'CT1']];
const AVAILABLE = [['Ada Okafor', 'CT2'], ['Ravi Singh', 'ST4', 0.6], ['Michael Doyle', 'CT1'], ['Sanjay Patel', 'CT3'], ['Lena Novak', 'ST6']];

// ── Timeline scripts ─────────────────────────────────────────────────────────
const SEL0 = 24.5, SEL1 = 27.5, ALLOC_AT = 33.2, CLOSE_AT = 34.2, NEXT_AT = 45.0, SWITCH_AT = 45.2;
const CLICKS = [17.0, SEL0, SEL1, ALLOC_AT, NEXT_AT];
const CAPTIONS = [
  [6.6, 12.8, 'Open a trust — its roster and capacity for the period.'],
  [13.6, 17.2, 'Allocating takes one sheet, not a spreadsheet.'],
  [19.2, 25.6, 'Who’s already here, and who’s available.'],
  [26.4, 32.4, 'Tap to select — an LTFT trainee counts at their WTE.'],
  [35.4, 41.6, 'Capacity, head count and WTE update instantly.'],
  [43.5, 49.5, 'Future rotations plan the same way — change the period.'],
  [51.5, 57.2, 'Every trust, every period, correctly counted.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.4, x: 960, y: 520, z: 1.05 },
  { t: 14.8, x: 1290, y: 330, z: 1.34 },
  { t: 17.2, x: 1290, y: 334, z: 1.34 },
  { t: 18.8, x: 960, y: 690, z: 1.12 },
  { t: 32.8, x: 960, y: 694, z: 1.12 },
  { t: 35.0, x: 1084, y: 596, z: 1.2 },
  { t: 41.4, x: 1084, y: 600, z: 1.2 },
  { t: 43.2, x: 1000, y: 520, z: 1.22 },
  { t: 49.4, x: 1004, y: 524, z: 1.22 },
  { t: 51.4, x: 960, y: 540, z: 1.04 },
  { t: 57.8, x: 960, y: 540, z: 1.02 },
  { t: 68, x: 960, y: 540, z: 1.02 },
];
const CURSOR = [
  { t: 13.6, x: 1500, y: 700, o: 0 },
  { t: 14.2, x: 1500, y: 700, o: 1 },
  { t: 16.0, x: MANAGE.x, y: MANAGE.y, o: 1 },
  { t: 19.2, x: MANAGE.x, y: MANAGE.y, o: 1 },
  { t: 22.6, x: TICK0.x, y: TICK0.y, o: 1 },
  { t: 25.6, x: TICK0.x, y: TICK0.y, o: 1 },
  { t: 26.6, x: TICK1.x, y: TICK1.y, o: 1 },
  { t: 29.8, x: TICK1.x, y: TICK1.y, o: 1 },
  { t: 31.6, x: ALLOC.x, y: ALLOC.y, o: 1 },
  { t: 34.4, x: ALLOC.x, y: ALLOC.y, o: 1 },
  { t: 34.9, x: ALLOC.x, y: ALLOC.y, o: 0 },
  { t: 42.5, x: 900, y: 640, o: 0 },
  { t: 43.0, x: 900, y: 640, o: 1 },
  { t: 44.6, x: NEXT.x, y: NEXT.y, o: 1 },
  { t: 47.4, x: NEXT.x, y: NEXT.y, o: 1 },
  { t: 48.2, x: NEXT.x, y: NEXT.y, o: 0 },
];

// The trust's figures: before allocating, after it, then the next period.
function stateAt(t) {
  const states = [
    { at: -99, period: 'Aug 2026', alloc: '28', head: '30', wte: '27.4' },
    { at: CLOSE_AT, period: 'Aug 2026', alloc: '30', head: '32', wte: '29.0' },
    { at: SWITCH_AT, period: 'Feb 2027', alloc: '25', head: '27', wte: '24.6' },
  ];
  let cur = states[0], prev = states[0];
  for (const s of states) if (t >= s.at) { prev = cur; cur = s; }
  const p = Easing.easeOutCubic(clamp((t - cur.at) / 0.55, 0, 1));
  return { cur, prev, p };
}
const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });
const pct = (w) => `${Math.round(w * 100)}%`;

// ── Trust page ───────────────────────────────────────────────────────────────
function Tile({ tr, x, y, o = 1, s = 1, hl = 0 }) {
  const [name, grade, wte] = tr;
  return (
    <div style={at(x, y, { width: TILE_W, height: TILE_H, border: `1px solid ${hl > 0.01 ? C.success : C.line}`, borderRadius: 8, background: hl > 0.01 ? `rgba(4,120,87,${0.08 * hl})` : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, opacity: o, transform: `scale(${s})` })}>
      <Avatar name={name} size={48} />
      <div style={{ fontSize: 15, color: C.ink, marginTop: 8, whiteSpace: 'nowrap' }}>{name}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        <Pill text={grade} size={13.5} />
        {wte && <Pill text={pct(wte)} tone="teal" size={13.5} />}
      </div>
    </div>
  );
}
function Roster({ t }) {
  const posOf = (i) => ({ x: CX + (i % COLS) * (TILE_W + TGAP), y: TILE_Y + Math.floor(i / COLS) * TILE_STEP });
  // Aug: the two new trainees slot in by surname once the sheet closes.
  const m = Easing.easeInOutCubic(clamp((t - CLOSE_AT - 0.1) / 0.7, 0, 1));
  const xf = Easing.easeInOutCubic(clamp((t - SWITCH_AT) / 0.6, 0, 1));
  const glow = t >= CLOSE_AT && t < 41 ? Math.min(1, (41 - t) / 1.5) : 0;
  const aug = AUG_AFTER.map((tr) => {
    const after = AUG_AFTER.indexOf(tr);
    const before = AUG.indexOf(tr);
    const isNew = before < 0;
    if (isNew && t < CLOSE_AT) return null;
    const a = posOf(isNew ? after : before), b = posOf(after);
    const e = isNew ? Easing.easeOutBack(clamp((t - CLOSE_AT - 0.5) / 0.5, 0, 1)) : 1;
    return <Tile key={tr[0]} tr={tr} x={a.x + (b.x - a.x) * m} y={a.y + (b.y - a.y) * m} o={(isNew ? Math.min(1, e * 1.5) : 1) * (1 - xf)} s={isNew ? 0.85 + 0.15 * e : 1} hl={isNew ? glow : 0} />;
  });
  const feb = xf > 0.01 ? FEB.map((tr, i) => { const p = posOf(i); return <Tile key={`f${tr[0]}`} tr={tr} x={p.x} y={p.y + (1 - xf) * 10} o={xf} />; }) : null;
  return <>{aug}{feb}</>;
}
function DetailsPanel({ t }) {
  const { cur, prev, p } = stateAt(t);
  const pulse = t >= CLOSE_AT && t < 41.4 ? Math.max(0, Math.sin((t - CLOSE_AT) * 2.4)) : 0;
  const fig = (label, from, to, i) => (
    <div style={at(24 + (i % 2) * 136, 132 + Math.floor(i / 2) * 68, { lineHeight: 1.2 })}>
      <div style={{ fontSize: 15, color: C.inkSoft }}>{label}</div>
      <Flip from={from} to={to} p={p} style={{ fontSize: 28, fontWeight: 500, color: C.navy, fontVariantNumeric: 'tabular-nums', marginTop: 2, transform: from !== to && pulse > 0 ? `scale(${1 + 0.05 * pulse})` : 'none', transformOrigin: 'left center' }} />
    </div>
  );
  return (
    <div style={at(RX, SW_Y, card({ width: RW, height: 330 }))}>
      <div style={at(24, 26, { fontSize: 17, fontWeight: 600, color: C.ink })}>Trust details</div>
      <div style={at(RW - 146, 10, { display: 'flex', alignItems: 'center', gap: 8, height: 32, padding: '0 12px', borderRadius: 8, background: C.soft, fontSize: 15, color: C.ink })}><Icon name="edit" size={14} color={C.ink} />Edit capacity</div>
      <div style={at(24, 62, { width: RW - 48, borderTop: `1px solid ${C.line}` })} />
      <div style={at(24, 78, { display: 'flex', width: RW - 48, fontSize: 15 })}><span style={{ color: C.inkSoft }}>College tutors</span><span style={{ marginLeft: 'auto', color: C.ink }}>Dr R. Lowe</span></div>
      <div style={at(24, 112, { width: RW - 48, borderTop: `1px solid ${C.line}` })} />
      {fig('Capacity', '32', '32', 0)}
      {fig('Slots allocated', prev.alloc, cur.alloc, 1)}
      {fig('Head count', prev.head, cur.head, 2)}
      {fig('Total WTE', prev.wte, cur.wte, 3)}
      <div style={at(24, 268, { width: RW - 48, borderTop: `1px solid ${C.line}`, paddingTop: 10, fontSize: 13.5, lineHeight: 1.35, color: C.inkSoft })}>Slot shares count by your region’s rule, so slots can differ from head count.</div>
    </div>
  );
}
function TrustScreen({ t }) {
  const { cur, prev, p } = stateAt(t);
  const pressManage = t >= 17.0 && t < 17.3;
  const pressNext = t >= NEXT_AT && t < NEXT_AT + 0.25;
  const col = trustColour(TRUST);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="Hospital trusts" />
      <div style={{ position: 'absolute', left: 0, top: TB_H, right: 0, bottom: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: -TB_H, right: 0, height: 1200 }}>
          {/* Trust banner, tinted in the trust's own colour */}
          <div style={at(CX, BAN_Y, { width: LW, height: BAN_H, borderRadius: 8, border: `1px solid ${col}66`, background: `${col}0F` })}>
            <div style={at(16, 24)}><Square icon="back" size={44} /></div>
            <div style={at(LW - 60, 24)}><Square icon="next" size={44} /></div>
            <div style={{ position: 'absolute', left: 80, right: 80, top: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 500, color: C.ink }}>{TRUST}</div>
              <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 4 }}>Caldermere General Hospital, St Bede’s Wing</div>
            </div>
          </div>
          {/* Actions: Manage allocations on its own row */}
          <div style={at(RX, BAN_Y, btnPrimary(pressManage, { width: RW }))}><Icon name="people" size={18} color="#fff" />Manage allocations</div>
          <div style={at(RX, BAN_Y + 52, btnOutline(false, { width: RW }))}><Icon name="plus" size={16} color={C.navy} />Add visiting trainee</div>
          <div style={at(RX, BAN_Y + 104, btnOutline(false, { width: (RW - 8) / 2 }))}><Icon name="edit" size={16} color={C.navy} />Edit trust</div>
          <div style={at(RX + (RW + 8) / 2, BAN_Y + 104, btnOutline(false, { width: (RW - 8) / 2 }))}><Icon name="x" size={16} color={C.navy} />Delete trust</div>
          {/* Period switcher and the list / grid toggle */}
          <div style={at(CX, SW_Y)}>
            <PeriodSwitcher label={<Flip from={prev.period} to={cur.period} p={p} style={{ fontSize: 18, fontWeight: 500 }} />} pressNext={pressNext} minW={130} />
          </div>
          <div style={at(CX + LW - 82, SW_Y + 1)}><ViewToggle grid /></div>
          <Roster t={t} />
          <DetailsPanel t={t} />
          <div style={at(RX, SW_Y + 346, card({ width: RW, height: 132, padding: '22px 24px' }))}>
            <SectionTitle text="Modules offered" style={{ fontSize: 17 }} />
            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 12, paddingTop: 10, fontSize: 15, color: C.inkSoft, lineHeight: 1.35 }}>Cardiac, neuro, obstetrics, paediatrics and regional.</div>
          </div>
          <div style={at(RX, SW_Y + 494, card({ width: RW, height: 108, padding: '22px 24px' }))}>
            <SectionTitle text="Special interest areas" />
            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 12, paddingTop: 10, fontSize: 15, color: C.ink }}>Regional anaesthesia</div>
          </div>
        </div>
      </div>
      <TopBar title="Hospital detail" back />
      <Sheet t={t} />
    </div>
  );
}

// ── The allocation sheet ─────────────────────────────────────────────────────
function SheetRow({ tr, x, y, w, lead, trail, hl = 0 }) {
  const [name, grade, wte] = tr;
  return (
    <div style={at(x, y, { width: w, height: SROW, display: 'flex', alignItems: 'center', gap: 14, padding: '0 10px', borderBottom: `1px solid ${C.line}`, background: hl > 0.01 ? `rgba(30,58,95,${0.07 * hl})` : 'transparent' })}>
      {lead}
      <Avatar name={name} />
      <span style={{ fontSize: 15.5, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{name}</span>
      <Pill text={grade} size={13.5} />
      {wte && <Pill text={`LTFT ${pct(wte)}`} tone="teal" size={13.5} />}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>{trail}</div>
    </div>
  );
}
function Sheet({ t }) {
  if (t < 17.2 || t > 35.2) return null;
  const y = kf([{ t: 17.3, y: WIN.h }, { t: 18.1, y: SHEET_TOP }, { t: 33.9, y: SHEET_TOP }, { t: 34.7, y: WIN.h }], t, 'y');
  const scrim = kf([{ t: 17.3, y: 0 }, { t: 18.0, y: 0.32 }, { t: 34.0, y: 0.32 }, { t: 34.7, y: 0 }], t, 'y', Easing.linear);
  const n = (t >= SEL0 ? 1 : 0) + (t >= SEL1 ? 1 : 0);
  const selWte = ['', '1.0', '1.6'][n];
  const pressAlloc = t >= ALLOC_AT && t < ALLOC_AT + 0.3;
  const off = y - SHEET_TOP; // children are laid out as if the sheet were open
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(19,39,63,${scrim})` }} />
      <div style={{ position: 'absolute', left: 0, top: off, width: WIN.w, height: WIN.h }}>
        <div style={at(0, SHEET_TOP, { width: WIN.w, height: WIN.h - SHEET_TOP, background: '#fff', borderRadius: '16px 16px 0 0', boxShadow: '0 -12px 40px rgba(19,39,63,.18)' })} />
        <div style={at(SH_PAD, SHEET_TOP + 22, { lineHeight: 1.3 })}>
          <div style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>Update allocations</div>
          <div style={{ fontSize: 15, color: C.inkSoft }}>{TRUST} · Aug 2026</div>
        </div>
        <div style={at(WIN.w - SH_PAD - 40, SHEET_TOP + 24)}><Square icon="x" /></div>
        <div style={at(0, SHEET_TOP + 84, { width: WIN.w, height: 48, background: C.soft, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 28, padding: `0 ${SH_PAD}px`, fontSize: 15, color: C.inkSoft })}>
          <span><b style={{ fontWeight: 600, color: C.ink, fontSize: 17 }}>28</b> allocated · <b style={{ fontWeight: 600, color: C.ink, fontSize: 17 }}>27.4</b> WTE</span>
          {n > 0 && <span style={{ color: C.navy }}>+<b style={{ fontWeight: 600, fontSize: 17 }}>{n}</b> selected · <b style={{ fontWeight: 600, fontSize: 17 }}>{selWte}</b> WTE</span>}
        </div>
        <div style={at(SH_PAD, LIST_Y - 32, { fontSize: 15, fontWeight: 500, color: C.inkSoft })}>Already at this trust (28)</div>
        <div style={at(SH_PAD, LIST_Y, { width: SH_LW, borderTop: `1px solid ${C.line}` })} />
        {ALREADY.map((tr, i) => <SheetRow key={tr[0]} tr={tr} x={SH_PAD} y={LIST_Y + i * SROW} w={SH_LW} trail={<Icon name="more" size={20} color={C.inkSoft} sw={2.4} />} />)}
        <div style={at(SH_PAD + 10, LIST_Y + 3 * SROW + 14, { fontSize: 15, color: C.inkSoft })}>and 25 more</div>
        <div style={at(SH_PAD, LIST_Y + 3 * SROW + 52, btnOutline(false))}><Icon name="swap" size={16} color={C.navy} />Transfer trainees from previous period</div>
        <div style={at(SH_RX, LIST_Y - 32, { fontSize: 15, fontWeight: 500, color: C.inkSoft })}>Available trainees (12)</div>
        <div style={at(SH_RX, LIST_Y, { width: SH_RW, borderTop: `1px solid ${C.line}` })} />
        {AVAILABLE.map((tr, i) => {
          const selT = i === 0 ? SEL0 : i === 1 ? SEL1 : null;
          const sel = selT != null && t >= selT;
          const pop = sel ? Easing.easeOutBack(clamp((t - selT) / 0.35, 0, 1)) : 1;
          return (
            <SheetRow key={tr[0]} tr={tr} x={SH_RX} y={LIST_Y + i * SROW} w={SH_RW} hl={sel ? 1 : 0}
              lead={<div style={{ transform: `scale(${0.85 + 0.15 * pop})` }}><Tick on={sel} size={20} /></div>}
              trail={<span style={{ fontSize: 15, color: C.inkSoft }}>Unallocated</span>} />
          );
        })}
        <div style={at(WIN.w - SH_PAD - 246, LIST_Y + 5 * SROW + 20, { display: 'flex', gap: 10 })}>
          <div style={btnOutline(false, { width: 100 })}>Cancel</div>
          <div style={btnPrimary(pressAlloc, { width: 136, background: n ? C.navy : C.field })}>Allocate ({n})</div>
        </div>
      </div>
    </div>
  );
}

// ── Film ─────────────────────────────────────────────────────────────────────
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><TrustScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Allocating trainees to trusts" kicker="Product tour · allocations" />
      <EndCard t={t} inAt={58.5} />
    </FilmRoot>
  );
}
function AdeptAllocateVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={68} background={C.backdrop} persistKey="adeptch2">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptAllocateVideo = AdeptAllocateVideo;
})();
