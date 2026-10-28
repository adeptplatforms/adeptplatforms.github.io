// Adept walkthrough — Chapter 11: "Your trust's view" (60s)
// Written 28 Oct 2026. The college tutor's own pages, as the app draws them
// (college_tutor_dashboard_page): Home with its to-do list, Rotation changes,
// Modules (curriculum modules by stage and the special interest areas), a
// trainee's placement, and the induction handbook, published.
// Uses the shared kit (adept-video-kit.jsx), loaded before this file.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, WIN, SB_W, TB_H, PAD, kf, Icon, Tile, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, Pill, SectionTitle, QuietRow, Figure, Avatar, Swatch, Tick, card, btnPrimary, btnOutline,
} = window.AdeptKit;

// ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
const CX = SB_W + PAD;                    // content left (272)
const CW = WIN.w - SB_W - 2 * PAD;        // content width (1404)
const GAP = 32;
const COL = (CW - GAP) / 2;               // 686
const RX = CX + COL + GAP;                // right column left (990)
const TOP = TB_H + 32;                    // first line of a page (96)
const TRUST_NAME = 'Ellerbeck Royal Infirmary';
const NEXT = 'Feb 2027';
const film = (x, y) => ({ x: WIN.x + x, y: WIN.y + y });

// The tutor's sidebar (tpd_sidebar_animated.dart, _tutorItems).
const NAV = [
  ['grid', 'Home'], ['people', 'Trainees'], ['chart', 'Progress'], ['swap', 'Rotation changes'],
  ['cap', 'Modules'], ['calendar', 'Teaching'], ['doc', 'Induction handbook'],
  ['help', 'Help & support'], ['more', 'About'],
];
const NAV_Y = (i) => 24 + 30 + 24 + i * 48 + 21;   // the centre of item i
const navAt = (label) => film(SB_W / 2, NAV_Y(NAV.findIndex(([, l]) => l === label)));

// Which page is showing, and when (cross-faded over 0.4 s).
const SECTIONS = [
  ['Home', 0], ['Rotation changes', 15.0], ['Modules', 24.4], ['Trainees', 36.4], ['Induction handbook', 44.6],
];
const sectionAt = (t) => SECTIONS.reduce((s, [n, a]) => (t >= a ? n : s), 'Home');
const sectionO = (t, name) => {
  const i = SECTIONS.findIndex(([n]) => n === name);
  const a = SECTIONS[i][1], b = i + 1 < SECTIONS.length ? SECTIONS[i + 1][1] : 999;
  const inn = i === 0 ? 1 : Easing.easeOutCubic(clamp((t - a) / 0.4, 0, 1));
  const out = 1 - Easing.easeInCubic(clamp((t - b + 0.2) / 0.2, 0, 1));
  return Math.min(inn, out);
};

// Click targets (window coordinates).
const TODO_Y = TOP + 200;                             // first to-do row
const TODO1 = film(CX + 360, TODO_Y + 28);
const PUBLISH = { x: CX + CW - 140, y: TOP + 8, w: 140, h: 44 };
const PUBLISH_F = film(PUBLISH.x + PUBLISH.w / 2, PUBLISH.y + PUBLISH.h / 2);

const CAPTIONS = [
  [6.6, 13.2, 'A college tutor sees their own trust: who is here, and what is due.'],
  [15.6, 22.8, 'Arrivals and leavers, as soon as the director finalises the rotation.'],
  [24.9, 30.2, 'Tick the modules your trust offers at each stage.'],
  [30.6, 35.8, 'And the special interest areas stage 3 trainees can choose.'],
  [37.0, 43.4, 'Each trainee: placement, working pattern, modules and SIAs.'],
  [45.2, 52.0, 'Publish the induction handbook trainees read before they start.'],
];

// ── Data (fictional) ─────────────────────────────────────────────────────────
const TODOS = [
  ['swap', '5 trainees arriving and 4 leaving in Feb 2027', 'ink'],
  ['doc', 'Induction handbook has changes trainees cannot see yet: publish them', 'warning'],
  ['cap', '2 trainees have no modules chosen for this placement', 'warning'],
  ['calendar', 'Work schedules for Feb 2027: due by 9 Dec 2026 (8 weeks before the changeover, a trust duty); issue date not recorded', 'warning'],
];
// Rows as the app's _personList draws them: grade · email.
const ARRIVING = [
  ['Jonah Bekele', 'ST5 · j.bekele@nhs.example'],
  ['Priya Raman', 'CT2 · p.raman@nhs.example'],
  ['Tomasz Nowicki', 'ST4 · t.nowicki@nhs.example'],
  ['Grace Adeyemi', 'ST6 · g.adeyemi@nhs.example'],
  ['Leo Hartmann', 'CT1 · l.hartmann@nhs.example'],
];
const LEAVING = [
  ['Amara Okafor', 'ST7 · a.okafor@nhs.example'],
  ['Felix Ward', 'CT3 · f.ward@nhs.example'],
  ['Maya Choudhury', 'ST5 · m.choudhury@nhs.example'],
  ['Ruth Ellison', 'ST4 · r.ellison@nhs.example'],
];
const MODULES = [
  'General anaesthesia', 'Obstetrics CCC', 'Paediatrics CCC', 'Pain', 'Perioperative medicine',
  'Regional', 'Sedation', 'Transfer', 'Trauma and resuscitation',
];
// Ticked per stage (1 is core).
const OFFERED = {
  'General anaesthesia': [1, 1, 0], 'Obstetrics CCC': [0, 1, 1], 'Paediatrics CCC': [0, 1, 0],
  Pain: [1, 1, 1], 'Perioperative medicine': [0, 1, 1], Regional: [1, 1, 1], Sedation: [1, 0, 0],
  Transfer: [1, 1, 0], 'Trauma and resuscitation': [0, 1, 1],
};
const SIAS = [
  'Cardiac', 'Difficult airway', 'ENT/Head & neck', 'Education', 'Intensive care medicine', 'Major trauma',
  'Management & leadership', 'Neuro', 'Obstetric', 'Ophthalmic', 'Paediatric', 'Pain medicine',
  'Perioperative medicine', 'Pre-hospital & retrieval', 'Regional', 'Research/Academic', 'Thoracic', 'Vascular',
];
const SIA_ON = new Set(['Cardiac', 'Education', 'Major trauma', 'Obstetric', 'Pain medicine', 'Perioperative medicine']);
const SIA_TICK = 'Regional';
const SIA_TICK_AT = 32.4;
const TRAINEE = 'Hannah Okonjo';
const DETAILS = [
  ['Placement', `${TRUST_NAME} · Main site`],
  ['Dates', '5 Aug 2026 to 2 Feb 2027'],
  ['Grade', 'ST6'],
  ['Training programme', 'Anaesthetics'],
  ['Working pattern this rotation', 'Less than full time (80%)'],
  ['CCT date', '1 Aug 2028'],
  ['Modules', 'Obstetrics CCC, Regional'],
  ['Special interest areas', 'Regional, Pain medicine'],
];
const CONTACTS = [
  ['College tutor', 'Dr S. Lindqvist', 'Ext. 4410'],
  ['Rota coordinator', 'Kerry Bates', 'Ext. 4212'],
  ['Education centre', 'Postgraduate office', 'Ext. 4007'],
];
const CHECKLIST = [
  ['Collect your ID badge from security', true],
  ['Complete the trust e-learning', true],
  ['Theatre and ICU orientation, first Wednesday', false],
];

const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });

// ── Chrome: the tutor's sidebar (the kit's look, the tutor's items) ─────────
function TutorSidebar({ active }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SB_W, height: WIN.h, background: C.soft, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', padding: '24px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 0 24px' }}>
        <Tile /><span style={{ fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif", fontWeight: 600, fontSize: 24, color: C.ink, letterSpacing: '-0.01em' }}>adept</span>
      </div>
      {NAV.map(([ic, label]) => {
        const on = label === active;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 42, padding: '0 14px', borderRadius: 8, marginBottom: 6, background: on ? C.activeTint : 'transparent', color: on ? C.ink : C.inkSoft, fontSize: 15.5, fontWeight: on ? 600 : 400 }}>
            <Icon name={ic} size={20} color={on ? C.navy : C.inkSoft} /><span>{label}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 'auto', borderTop: `1px solid ${C.line}`, paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: C.tealFill, color: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>SL</div>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Dr S. Lindqvist</div>
          <div style={{ fontSize: 13, color: C.inkSoft }}>College tutor</div>
        </div>
      </div>
    </div>
  );
}

// ── Home ─────────────────────────────────────────────────────────────────────
function Home({ t }) {
  const hl = t >= 12.6 && t < 15 ? Easing.easeOutCubic(clamp((t - 12.6) / 0.4, 0, 1)) : 0;
  return (
    <>
      <div style={at(CX, TOP, { display: 'flex', alignItems: 'center', gap: 12 })}>
        <Swatch name={TRUST_NAME} size={16} />
        <span style={{ fontSize: 28, fontWeight: 600, color: C.ink }}>{TRUST_NAME}</span>
      </div>
      <div style={at(CX, TOP + 56, { display: 'flex', gap: 48 })}>
        <Figure value="18" caption="trainees here this rotation" />
        <Figure value="5" caption={`arriving in ${NEXT}`} />
        <Figure value="4" caption="leaving" />
      </div>
      <div style={at(CX, TOP + 160, { width: CW })}><SectionTitle text="To do" /></div>
      <div style={at(CX, TODO_Y, { width: CW, borderTop: `1px solid ${C.line}` })}>
        {TODOS.map(([ic, text, tone], i) => (
          <QuietRow key={text} height={56} hl={i === 0 ? hl : 0}
            lead={<Icon name={ic} size={20} color={tone === 'warning' ? C.warning : C.navy} />}
            title={text} chevron />
        ))}
      </div>
      <div style={at(CX, TODO_Y + 4 * 56 + 40, { width: COL })}>
        <SectionTitle text={`Notice for ${NEXT}`} />
        <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 6, marginBottom: 8 }}>When your trust issued work schedules (due 8 weeks before) and rotas (6 weeks).</div>
        <QuietRow height={56} title="Work schedules" sub="Not recorded" trail={<span style={btnOutline(false, { height: 40 })}>Record date</span>} style={{ borderTop: `1px solid ${C.line}` }} />
        <QuietRow height={56} title="Rotas" sub="Not recorded" trail={<span style={btnOutline(false, { height: 40 })}>Record date</span>} />
      </div>
    </>
  );
}

// ── Rotation changes ─────────────────────────────────────────────────────────
function PersonList({ t, rows, from }) {
  return (
    <div style={{ borderTop: `1px solid ${C.line}` }}>
      {rows.map(([name, sub], i) => {
        const e = Easing.easeOutCubic(clamp((t - from - i * 0.15) / 0.45, 0, 1));
        return (
          <div key={name} style={{ opacity: e, transform: `translateY(${(1 - e) * 8}px)` }}>
            <QuietRow height={60} lead={<Avatar name={name} size={34} />} title={name} sub={sub} chevron />
          </div>
        );
      })}
    </div>
  );
}
const RC_W = 900;                         // the list's width
function RotationChanges({ t }) {
  return (
    <>
      <div style={at(CX, TOP, { fontSize: 15, color: C.inkSoft })}>Arriving and leaving in {NEXT}.</div>
      {/* One column, Arriving above Leaving, as the app lays it out. */}
      <div style={at(CX, TOP + 40, { width: RC_W })}>
        <SectionTitle text={`Arriving (${ARRIVING.length})`} right={<span style={btnOutline(false, { height: 40 })}><Icon name="mail" size={16} color={C.navy} />Email arrivals</span>} />
        <div style={{ height: 8 }} />
        <PersonList t={t} rows={ARRIVING} from={14.8} />
        <div style={{ height: 24 }} />
        <SectionTitle text={`Leaving (${LEAVING.length})`} right={<span style={btnOutline(false, { height: 40 })}><Icon name="mail" size={16} color={C.navy} />Email leavers</span>} />
        <div style={{ height: 8 }} />
        <PersonList t={t} rows={LEAVING} from={14.8} />
      </div>
    </>
  );
}

// ── Modules ──────────────────────────────────────────────────────────────────
const MOD_ROW = 44, STAGE_W = 96;
const SIA_W = 200, SIA_H = 44, SIA_GAP = 10, SIA_COLS = 3;
const SIA_LEFT = RX + 24, SIA_TOP = TOP + 112;
const siaPos = (i) => ({ x: SIA_LEFT + (i % SIA_COLS) * (SIA_W + SIA_GAP), y: SIA_TOP + Math.floor(i / SIA_COLS) * (SIA_H + SIA_GAP) });
const REGIONAL_P = siaPos(SIAS.indexOf(SIA_TICK));
const REGIONAL_F = film(REGIONAL_P.x + 22, REGIONAL_P.y + SIA_H / 2);
function Modules({ t }) {
  const sweep = (i) => Easing.easeOutCubic(clamp((t - 25.2 - i * 0.12) / 0.4, 0, 1));
  return (
    <>
      <div style={at(CX, TOP, card({ width: COL, padding: '20px 24px' }))}>
        <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Curriculum modules by stage</div>
        <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 4 }}>What trainees placed here can choose, and how many each may take.</div>
        <div style={{ display: 'flex', height: 40, alignItems: 'center', marginTop: 14, borderBottom: `1px solid ${C.line}`, fontSize: 14.5, color: C.inkSoft }}>
          <span style={{ flex: 1 }}>Module</span>
          {[1, 2, 3].map((s) => <span key={s} style={{ width: STAGE_W, textAlign: 'center' }}>Stage {s}</span>)}
        </div>
        {MODULES.map((m, i) => (
          <div key={m} style={{ display: 'flex', height: MOD_ROW, alignItems: 'center', borderBottom: `1px solid ${C.line}` }}>
            <span style={{ flex: 1, fontSize: 15, color: C.ink }}>{m}</span>
            {OFFERED[m].map((on, s) => (
              <div key={s} style={{ width: STAGE_W, display: 'flex', justifyContent: 'center' }}><Tick on={on === 1 && sweep(i) > 0.5} /></div>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>Modules per trainee</span>
          <span style={btnOutline(false, { height: 36, padding: '0 12px' })}>Fewer</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.ink, width: 20, textAlign: 'center' }}>3</span>
          <span style={btnOutline(false, { height: 36, padding: '0 12px' })}>More</span>
        </div>
        <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 8 }}>A trainee may choose up to 3 of the modules above.</div>
      </div>
      <div style={at(RX, TOP, card({ width: COL, height: 112 + 6 * (SIA_H + SIA_GAP) + 14 }))}>
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Special interest areas</div>
          <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 4, lineHeight: 1.4 }}>Tick the special interest areas this trust can deliver. Stage 3 trainees choose from these.</div>
        </div>
      </div>
      {SIAS.map((s, i) => {
        const p = siaPos(i);
        const on = SIA_ON.has(s) || (s === SIA_TICK && t >= SIA_TICK_AT);
        const pulse = s === SIA_TICK && t >= SIA_TICK_AT && t < SIA_TICK_AT + 1.2 ? 1 - (t - SIA_TICK_AT) / 1.2 : 0;
        return (
          <div key={s} style={at(p.x, p.y, { width: SIA_W, height: SIA_H, border: `1px solid ${on ? C.navy : C.line}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: pulse > 0 ? `rgba(30,58,95,${0.08 * pulse})` : '#fff' })}>
            <Tick on={on} />
            <span style={{ fontSize: 14.5, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
          </div>
        );
      })}
    </>
  );
}

// ── A trainee ────────────────────────────────────────────────────────────────
function Trainee({ t }) {
  return (
    <>
      <div style={at(CX, TOP, card({ width: 860, padding: '20px 24px' }))}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: `1px solid ${C.line}` }}>
          <Avatar name={TRAINEE} size={52} i={2} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>{TRAINEE}</div>
            <div style={{ fontSize: 14.5, color: C.inkSoft }}>h.okonjo@nhs.net</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><Pill text="ST6" /><Pill text="LTFT 80%" tone="teal" /></div>
        </div>
        {DETAILS.map(([k, v], i) => {
          const glow = (k === 'Modules' || k === 'Special interest areas') && t >= 40.2 ? Easing.easeOutCubic(clamp((t - 40.2) / 0.5, 0, 1)) : 0;
          return (
            <div key={k} style={{ display: 'flex', minHeight: 52, alignItems: 'center', borderBottom: i < DETAILS.length - 1 ? `1px solid ${C.line}` : 'none', background: glow ? `rgba(30,58,95,${0.06 * glow})` : 'transparent', padding: '0 8px' }}>
              <span style={{ width: 280, fontSize: 15, color: C.inkSoft }}>{k}</span>
              <span style={{ fontSize: 15, color: C.ink, fontWeight: glow ? 600 : 400 }}>{v}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Induction handbook ───────────────────────────────────────────────────────
const PUB_AT = 48.8;
function Handbook({ t }) {
  const published = t >= PUB_AT + 0.3;
  const pressed = t >= PUB_AT - 0.1 && t < PUB_AT + 0.2;
  const toast = Easing.easeOutCubic(clamp((t - PUB_AT - 0.4) / 0.4, 0, 1)) * (1 - Easing.easeInCubic(clamp((t - 53) / 0.4, 0, 1)));
  const sec = (title, icon, body, x, y, w) => (
    <div style={at(x, y, card({ width: w, padding: '18px 22px' }))}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Icon name={icon} size={18} color={C.navy} /><span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{title}</span>
      </div>
      {body}
    </div>
  );
  return (
    <>
      <div style={at(CX, TOP + 12, { display: 'flex', alignItems: 'center', gap: 12 })}>
        <span style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>Handbook</span>
        {published ? <Pill text="Published" tone="success" /> : <Pill text="Draft: not published yet" tone="warning" />}
      </div>
      <div style={at(PUBLISH.x, PUBLISH.y, btnPrimary(pressed, { width: PUBLISH.w }))}>Publish</div>
      {sec('Key contacts', 'people', (
        <div>
          {CONTACTS.map(([role, name, ph], i) => (
            <div key={role} style={{ display: 'flex', height: 44, alignItems: 'center', borderTop: `1px solid ${C.line}`, fontSize: 15 }}>
              <span style={{ width: 200, color: C.inkSoft }}>{role}</span>
              <span style={{ flex: 1, color: C.ink }}>{name}</span>
              <span style={{ color: C.ink }}>{ph}</span>
            </div>
          ))}
        </div>
      ), CX, TOP + 72, COL)}
      {sec('Checklist', 'check', (
        <div>
          {CHECKLIST.map(([item, done]) => (
            <div key={item} style={{ display: 'flex', height: 44, alignItems: 'center', gap: 12, borderTop: `1px solid ${C.line}`, fontSize: 15, color: C.ink }}>
              <Tick on={done} />{item}
            </div>
          ))}
        </div>
      ), RX, TOP + 72, COL)}
      {sec('Induction notes', 'doc', (
        <div style={{ fontSize: 15, color: C.ink, lineHeight: 1.5 }}>
          Your first day starts at 08:00 in the education centre, level 2. Parking permits are issued by the
          estates office; theatre scrubs are in the department changing rooms.
        </div>
      ), CX, TOP + 330, COL)}
      {sec('Clinical guidelines', 'shield', (
        <div>
          {['Difficult airway trolley and guideline', 'Obstetric anaesthesia handbook', 'Major haemorrhage protocol'].map((g) => (
            <div key={g} style={{ display: 'flex', height: 44, alignItems: 'center', gap: 10, borderTop: `1px solid ${C.line}`, fontSize: 15, color: C.navy }}>
              <Icon name="doc" size={16} color={C.navy} />{g}
            </div>
          ))}
        </div>
      ), RX, TOP + 330, COL)}
      <div style={at(CX + CW / 2 - 330, WIN.h - 96, { width: 660, opacity: toast, transform: `translateY(${(1 - toast) * 12}px)`, background: C.navyDeep, color: '#fff', borderRadius: 8, padding: '14px 20px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(19,39,63,.25)' })}>
        <Icon name="check" size={16} color="#fff" sw={2.2} />Handbook published: trainees allocated to your trust can now see it.
      </div>
    </>
  );
}

const TITLES = {
  Home: 'Home', 'Rotation changes': 'Rotation changes', Modules: 'Modules', Trainees: TRAINEE, 'Induction handbook': 'Induction handbook',
};
function TrustScreen({ t }) {
  const s = sectionAt(t);
  const layer = (name, el) => {
    const o = sectionO(t, name);
    return o > 0.01 ? <div key={name} style={{ position: 'absolute', inset: 0, opacity: o }}>{el}</div> : null;
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <TutorSidebar active={s} />
      <TopBar title={TITLES[s]} back={s === 'Trainees'} right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Swatch name={TRUST_NAME} size={10} />{TRUST_NAME} · Aug 2026 rotation</span>} />
      {layer('Home', <Home t={t} />)}
      {layer('Rotation changes', <RotationChanges t={t} />)}
      {layer('Modules', <Modules t={t} />)}
      {layer('Trainees', <Trainee t={t} />)}
      {layer('Induction handbook', <Handbook t={t} />)}
    </div>
  );
}

// ── Camera and cursor (film coordinates) ─────────────────────────────────────
const CLICKS = [13.4, 23.8, SIA_TICK_AT, 35.8, 44.0, PUB_AT];
const TRAINEES_NAV = navAt('Trainees'), MODULES_NAV = navAt('Modules'), HB_NAV = navAt('Induction handbook');
const CURSOR = [
  { t: 10.6, x: 1300, y: 700, o: 0 },
  { t: 11.2, x: 1300, y: 700, o: 1 },
  { t: 13.0, x: TODO1.x, y: TODO1.y, o: 1 },
  { t: 14.0, x: TODO1.x, y: TODO1.y, o: 1 },
  { t: 14.6, x: TODO1.x + 40, y: TODO1.y + 60, o: 0 },
  { t: 21.6, x: 700, y: 700, o: 0 },
  { t: 22.0, x: 700, y: 700, o: 1 },
  { t: 23.4, x: MODULES_NAV.x, y: MODULES_NAV.y, o: 1 },
  { t: 24.2, x: MODULES_NAV.x, y: MODULES_NAV.y, o: 1 },
  { t: 26.0, x: REGIONAL_F.x - 120, y: REGIONAL_F.y + 120, o: 1 },
  { t: 31.8, x: REGIONAL_F.x, y: REGIONAL_F.y, o: 1 },
  { t: 33.4, x: REGIONAL_F.x, y: REGIONAL_F.y, o: 1 },
  { t: 35.4, x: TRAINEES_NAV.x, y: TRAINEES_NAV.y, o: 1 },
  { t: 36.2, x: TRAINEES_NAV.x, y: TRAINEES_NAV.y, o: 1 },
  { t: 36.8, x: TRAINEES_NAV.x + 60, y: TRAINEES_NAV.y + 40, o: 0 },
  { t: 42.6, x: 700, y: 800, o: 0 },
  { t: 43.0, x: 700, y: 800, o: 1 },
  { t: 43.8, x: HB_NAV.x, y: HB_NAV.y, o: 1 },
  { t: 44.6, x: HB_NAV.x, y: HB_NAV.y, o: 1 },
  { t: 48.4, x: PUBLISH_F.x, y: PUBLISH_F.y, o: 1 },
  { t: 49.6, x: PUBLISH_F.x, y: PUBLISH_F.y, o: 1 },
  { t: 50.2, x: PUBLISH_F.x + 30, y: PUBLISH_F.y + 50, o: 0 },
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 8.0, x: 960, y: 470, z: 1.1 },
  { t: 14.6, x: 960, y: 470, z: 1.1 },
  { t: 15.6, x: 960, y: 520, z: 1.06 },
  { t: 22.6, x: 960, y: 520, z: 1.06 },
  { t: 24.6, x: 960, y: 540, z: 1 },
  { t: 26.0, x: 960, y: 520, z: 1.06 },
  { t: 30.0, x: 960, y: 520, z: 1.06 },
  { t: 31.2, x: 1430, y: 420, z: 1.3 },
  { t: 34.6, x: 1430, y: 420, z: 1.3 },
  { t: 36.4, x: 960, y: 540, z: 1 },
  { t: 37.6, x: 900, y: 430, z: 1.3 },
  { t: 43.0, x: 900, y: 450, z: 1.3 },
  { t: 44.6, x: 960, y: 540, z: 1 },
  { t: 52.0, x: 960, y: 540, z: 1 },
  { t: 60, x: 960, y: 540, z: 1 },
];

function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><TrustScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Your trust's view" kicker="Product tour · for college tutors" />
      <EndCard t={t} inAt={53.4} />
    </FilmRoot>
  );
}
function AdeptTrustVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={60} background={C.backdrop} persistKey="adeptch11">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptTrustVideo = AdeptTrustVideo;
})();
