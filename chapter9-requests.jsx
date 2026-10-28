// Adept walkthrough — Chapter 9: "Requests, not emails" (60s)
// Drawn 28 Oct 2026. A trainee asks on their phone (a working pattern change
// with the new date shown before sending, a stage update, a meeting); the
// director's "Waiting on you" collects all three; approving the LTFT request
// updates the end of training (counted as the RCoA calculator counts); the
// trainee's inbox says so. Wording is the app's own (ltft_request_card_v1,
// exams_milestones_cards_v1, my_meetings_card_v1, waiting_on_you_v1,
// ltft_requests_review_v1, the ltftDecision notice in index.js).
// Uses the shared kit (adept-video-kit.jsx), loaded before this file.
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const {
  C, FONT, WIN, SB_W, PAD, kf, Icon, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions,
  TitleCard, EndCard, Pill, SectionTitle, QuietRow, Avatar, Flip, FilterChip, card, btnPrimary, btnOutline,
} = window.AdeptKit;

const at = (x, y, extra) => ({ position: 'absolute', left: x, top: y, ...extra });
const ease = (t, a, d = 0.45) => Easing.easeOutCubic(clamp((t - a) / d, 0, 1));
const pulseAt = (t, s, e) => (t < s || t > e ? 0 : Math.sin(clamp((t - s) / (e - s), 0, 1) * Math.PI));

// The dates: full time to Tue 6 Aug 2030; 80% from Wed 3 Feb 2027 ends Fri
// 20 Jun 2031 by the app's engine (computeGradeDates, the RCoA count).
const CCT_BEFORE = '6 Aug 2030', CCT_AFTER = '20 Jun 2031', FROM = '3 Feb 2027';
const TRAINEE = 'Tom Ashworth';

const CAPTIONS = [
  [6.6, 12.2, 'Trainees ask in the app, not by email.'],
  [12.8, 16.4, 'The new CCT date shows before they send.'],
  [18.2, 25.8, 'A stage update or a meeting is a tap too.'],
  [27.8, 33.0, 'Every request lands in one place: Waiting on you.'],
  [34.2, 41.6, 'Approve it, and the CCT date updates itself.'],
  [45.4, 51.6, 'And the trainee is told. Nothing to chase.'],
];

// ── Scene timing ────────────────────────────────────────────────────────────
const PHONE_OUT = 26.4, DESK_IN = 26.8, DESK_OUT = 43.6, PHONE_IN = 44.2;
// Phone taps.
const T_REQ = 8.4, T_80 = 10.0, T_FROM = 11.2, T_SEND = 14.4;
const T_STAGE = 18.4, T_STAGE_SEND = 20.0;
const T_MEET = 22.0, T_MEET_SEND = 24.6;
// Desktop clicks.
const T_ROW = 31.0, T_APPROVE = 35.4;

// ── The phone ───────────────────────────────────────────────────────────────
const PX = 760, PY = 120, PW = 400, PH = 840, BEZ = 12;
const SW = PW - 2 * BEZ, SP = 20, IW = SW - 2 * SP;
const HEAD = 88;                           // status bar + title bar
const SX = PX + BEZ, SY = PY + BEZ + HEAD; // where content y = 0 sits on film

// Content positions (content coordinates; the content scrolls).
const LT = 100;                            // working pattern section
const CHIP_Y = LT + 70, FROM_Y = LT + 204, PREV_Y = LT + 262, SEND_Y = LT + 366;
const EX = 540;                            // exams and milestones
const MT = 720;                            // meetings
const SCROLL = [
  { t: 0, s: 0 }, { t: 16.8, s: 0 }, { t: 17.6, s: 380 },
  { t: 20.8, s: 380 }, { t: 21.6, s: 560 }, { t: 60, s: 560 },
];
const scrollAt = (t) => kf(SCROLL, t, 's');
// A content point on film, at the scroll of time t.
const onFilm = (t, x, y) => ({ x: SX + SP + x, y: SY + y - scrollAt(t) });

const CHIPS = [['Full time', 0, 0, 92], ['90%', 100, 0, 62], ['80%', 170, 0, 62], ['70%', 240, 0, 62], ['60%', 0, 48, 62], ['50%', 70, 48, 62]];

function Phone({ title, children }) {
  return (
    <div style={{ position: 'absolute', left: PX, top: PY }}>
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
          <div style={{ position: 'absolute', left: 0, top: HEAD, width: SW, height: PH - 2 * BEZ - HEAD, overflow: 'hidden' }}>{children}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -44, textAlign: 'center', fontWeight: 600, fontSize: 19, color: C.ink }}>Trainee</div>
    </div>
  );
}
function Section({ y, text }) {
  return (
    <>
      <div style={at(SP, y, { fontSize: 17, fontWeight: 600, color: C.ink })}>{text}</div>
      <div style={at(SP, y + 32, { width: IW, height: 1, background: C.line })} />
    </>
  );
}
const pressed = (t, at0) => t >= at0 - 0.12 && t < at0 + 0.2;
const Sent = ({ y, o, text }) => (
  <div style={at(SP, y, { width: IW, height: 44, borderRadius: 8, background: C.successFill, color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14.5, fontWeight: 600, opacity: o, transform: `scale(${0.96 + 0.04 * o})` })}>
    <Icon name="check" size={17} color={C.success} sw={2.2} />{text}
  </div>
);

// The working pattern card: Request a change -> the form -> sent.
function WorkingPattern({ t }) {
  const open = t >= T_REQ + 0.2;
  const sent = t >= T_SEND + 0.2;
  const fromSet = t >= T_FROM + 0.2;
  const prev = ease(t, T_FROM + 0.5, 0.6);
  return (
    <>
      <Section y={LT} text="Working pattern" />
      {!open && (
        <>
          <div style={at(SP, LT + 48, { fontSize: 14.5, color: C.inkSoft })}>Ask to change your working pattern.</div>
          <div style={at(SP, LT + 80, btnOutline(pressed(t, T_REQ), { width: IW }))}><Icon name="edit" size={17} color={C.navy} />Request a change</div>
        </>
      )}
      {open && (
        <div style={{ opacity: ease(t, T_REQ + 0.2, 0.4) }}>
          <div style={at(SP, LT + 44, { fontSize: 14, fontWeight: 500, color: C.ink })}>Working pattern you are asking for</div>
          {CHIPS.map(([l, x, y, w]) => (
            <FilterChip key={l} text={l} on={l === '80%' ? t >= T_80 + 0.1 : (l === 'Full time' && false)} style={at(SP + x, CHIP_Y + y, { width: w, height: 40, justifyContent: 'center', fontSize: 14.5, transform: l === '80%' && pressed(t, T_80) ? 'scale(0.94)' : 'none' })} />
          ))}
          <div style={at(SP, FROM_Y - 26, { fontSize: 14, fontWeight: 500, color: C.ink })}>From</div>
          <div style={at(SP, FROM_Y, btnOutline(pressed(t, T_FROM), { width: 200, justifyContent: 'flex-start' }))}><Icon name="calendar" size={17} color={C.navy} />{fromSet ? `Wed ${FROM}` : 'Choose a start date'}</div>
          <div style={at(SP, PREV_Y, { width: IW, opacity: prev, transform: `translateY(${(1 - prev) * 8}px)` })}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>If approved, your CCT would move from {CCT_BEFORE} to {CCT_AFTER}.</div>
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.4, marginTop: 6 }}>Counted as the RCoA CCT calculator counts. Nothing changes until your programme director approves it.</div>
          </div>
          {!sent && <div style={at(SP, SEND_Y, btnPrimary(pressed(t, T_SEND), { width: IW, opacity: 0.4 + 0.6 * prev }))}>Send request</div>}
          {sent && <Sent y={SEND_Y} o={ease(t, T_SEND + 0.2)} text="Request sent to your programme director" />}
        </div>
      )}
    </>
  );
}

// Exams and milestones: a stage certificate -> Ask for a stage update?
function Exams({ t }) {
  const asked = t >= T_STAGE_SEND + 0.2;
  const row = (y, title, sub, subColor, trail, hl = 0) => (
    <div style={at(SP, y, { width: IW, height: 56, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px', background: hl > 0.01 ? `rgba(30,58,95,${0.07 * hl})` : 'transparent' })}>
      <div style={{ flex: 1, lineHeight: 1.3 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 13.5, color: subColor || C.inkSoft }}>{sub}</div>
      </div>
      {trail}
    </div>
  );
  return (
    <>
      <Section y={EX} text="Exams and milestones" />
      {row(EX + 33, 'Final FRCA', 'Passed 14 Mar 2026', C.success, <Pill text="Passed" tone="success" size={12.5} />)}
      {row(EX + 89, 'Stage 2 Certificate', asked ? 'Stage update requested, 6 Oct 2026' : 'Signed off 6 Oct 2026', asked ? C.warning : C.inkSoft,
        asked ? <Pill text="Asked" tone="warning" size={12.5} /> : <Icon name="next" size={15} color={C.inkSoft} />, pulseAt(t, T_STAGE - 0.6, T_STAGE + 0.6))}
    </>
  );
}
// The confirm dialog over the phone (screen coordinates, not scrolled).
function StageDialog({ t }) {
  const o = Math.min(ease(t, T_STAGE + 0.15, 0.35), 1 - ease(t, T_STAGE_SEND + 0.15, 0.3));
  if (o <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: SW, height: PH - 2 * BEZ - HEAD, background: `rgba(19,39,63,${0.35 * o})` }}>
      <div style={at(16, 170, card({ width: SW - 32, padding: '20px 20px 18px', boxShadow: '0 18px 40px rgba(19,39,63,.25)', opacity: o, transform: `scale(${0.96 + 0.04 * o})` }))}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>Ask for a stage update?</div>
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.45, marginTop: 8 }}>Your programme director will check your Stage 2 Certificate, dated 6 Oct 2026, and record it. Your training stage moves on when they do.</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <div style={btnOutline(false, { height: 40, padding: '0 14px' })}>Cancel</div>
          <div style={btnPrimary(pressed(t, T_STAGE_SEND), { height: 40, padding: '0 14px' })}>Send request</div>
        </div>
      </div>
    </div>
  );
}
// Meetings: Request a meeting -> what to talk about -> sent.
function Meetings({ t }) {
  const open = t >= T_MEET + 0.2;
  const sent = t >= T_MEET_SEND + 0.2;
  const typed = 'Planning my special interest year';
  const n = Math.floor(clamp((t - T_MEET - 0.6) / 1.4, 0, 1) * typed.length);
  return (
    <>
      <Section y={MT} text="Meetings" />
      <div style={at(SP, MT + 46, { fontSize: 14.5, color: C.inkSoft })}>Nothing coming up.</div>
      {!open && <div style={at(SP, MT + 80, btnOutline(pressed(t, T_MEET), { width: IW }))}><Icon name="mail" size={17} color={C.navy} />Request a meeting</div>}
      {open && (
        <div style={{ opacity: ease(t, T_MEET + 0.2, 0.4) }}>
          <div style={at(SP, MT + 80, { width: IW, height: 76, border: `1px solid ${C.field}`, borderRadius: 8, padding: '8px 12px' })}>
            <div style={{ fontSize: 12.5, color: C.inkSoft }}>What would you like to talk about? (optional)</div>
            <div style={{ fontSize: 15, color: C.ink, marginTop: 4 }}>{typed.slice(0, n)}{n < typed.length && t > T_MEET + 0.6 ? '|' : ''}</div>
          </div>
          {!sent && <div style={at(SP, MT + 170, btnPrimary(pressed(t, T_MEET_SEND), { width: IW }))}>Send request</div>}
          {sent && <Sent y={MT + 170} o={ease(t, T_MEET_SEND + 0.2)} text="Request sent to your programme director" />}
        </div>
      )}
    </>
  );
}
function ProfileScreen({ t }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: -scrollAt(t), width: SW, height: 1000 }}>
        <div style={at(SP, 16, { fontSize: 23, fontWeight: 600, color: C.ink })}>{TRAINEE}</div>
        <div style={at(SP, 52, { display: 'flex', gap: 8 })}><Pill text="ST5" size={13} /><Pill text="Full time" size={13} /><Pill text="In training" tone="success" size={13} /></div>
        <WorkingPattern t={t} />
        <Exams t={t} />
        <Meetings t={t} />
      </div>
      <StageDialog t={t} />
    </>
  );
}
// The inbox after the decision.
function InboxScreen({ t }) {
  const n1 = ease(t, PHONE_IN + 1.2, 0.5);
  const row = (y, title, body, when, unread, o) => (
    <div style={at(SP, y, { width: IW, borderBottom: `1px solid ${C.line}`, padding: '14px 4px 14px 22px', opacity: o, transform: `translateY(${(1 - o) * 10}px)`, background: unread ? 'rgba(30,58,95,.04)' : 'transparent' })}>
      {unread && <div style={{ position: 'absolute', left: 4, top: 22, width: 9, height: 9, borderRadius: 5, background: C.navy }} />}
      <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{title}</div>
      <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.4, marginTop: 4 }}>{body}</div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6 }}>{when}</div>
    </div>
  );
  const pat = ease(t, PHONE_IN + 3.0, 0.6);
  return (
    <>
      <div style={at(SP, 18, { display: 'flex', alignItems: 'baseline', width: IW })}>
        <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>Notifications</span>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: C.navy, fontWeight: 500 }}>Mark all as read</span>
      </div>
      <div style={at(SP, 50, { width: IW, height: 1, background: C.line })} />
      {row(51, 'Your working-pattern request has been approved', 'Your new working pattern is on your profile, with your updated end of training.', 'Just now · Working pattern', true, n1)}
      {row(205, 'Your meeting request', 'Your programme director has answered your request.', '10 min ago · Meetings', false, 1)}
      <div style={at(SP, 360, { fontSize: 17, fontWeight: 600, color: C.ink })}>My profile</div>
      <div style={at(SP, 392, { width: IW, height: 1, background: C.line })} />
      {[['Working pattern', <Flip key="w" from="Full time" to={`80% from ${FROM}`} p={pat} style={{ fontSize: 14.5, color: C.ink, width: 200, textAlign: 'right', whiteSpace: 'nowrap' }} />],
        ['CCT', <Flip key="c" from={CCT_BEFORE} to={CCT_AFTER} p={pat} style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, width: 200, textAlign: 'right', whiteSpace: 'nowrap' }} />]].map(([l, v], i) => (
        <div key={l} style={at(SP, 393 + i * 50, { width: IW, height: 50, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 4px', background: `rgba(30,58,95,${0.07 * pulseAt(t, PHONE_IN + 2.8, PHONE_IN + 5.4)})` })}>
          <span style={{ fontSize: 14, color: C.inkSoft }}>{l}</span>
          <span style={{ marginLeft: 'auto' }}>{v}</span>
        </div>
      ))}
    </>
  );
}
function TraineePhone({ t }) {
  const o = t < PHONE_OUT ? 1 : t < PHONE_IN ? 1 - ease(t, PHONE_OUT, 0.7) : ease(t, PHONE_IN, 0.7);
  if (o <= 0.01) return null;
  const inbox = t >= DESK_OUT;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <Phone title={inbox ? 'Inbox' : 'My profile'}>{inbox ? <InboxScreen t={t} /> : <ProfileScreen t={t} />}</Phone>
    </div>
  );
}

// ── The director's desk ─────────────────────────────────────────────────────
const CX = SB_W + PAD, LW = 700;
const W_TITLE = 96, W_Y = 132, W_ROW = 64;
const ROWS = [
  ['Meeting requests', 'Trainees waiting for your answer', 28.4],
  ['Working pattern (LTFT) requests', 'From your trainees', 28.8],
  ['Stage updates', 'Trainees asking you to record a stage certificate', 29.2],
  ['Joiners awaiting allocation', 'From your joiner log', null],
  ['Trust notices due', 'Doctors arriving within 12 weeks, no pack recorded', null],
];
const SHEET_X = WIN.w - 660, SHEET_W = 660;
const APPROVE = { x: 32, y: 424, w: 132, h: 44 };  // sheet coordinates
const ROW_F = { x: WIN.x + CX + 260, y: WIN.y + W_Y + W_ROW + 32 };
const APPROVE_F = { x: WIN.x + SHEET_X + APPROVE.x + APPROVE.w / 2, y: WIN.y + APPROVE.y + APPROVE.h / 2 };

function CountCell({ n, arrive }) {
  const grey = n === 0;
  return (
    <span style={{ fontSize: 22, fontWeight: grey ? 400 : 600, color: grey ? C.inkSoft : C.warning, fontVariantNumeric: 'tabular-nums', display: 'inline-block', transform: `scale(${1 + 0.25 * arrive})` }}>{n}</span>
  );
}
function Waiting({ t }) {
  return (
    <>
      <div style={at(CX, W_TITLE, { width: LW })}><SectionTitle text="Waiting on you" /></div>
      <div style={at(CX, W_Y, { width: LW, borderTop: `1px solid ${C.line}` })} />
      {ROWS.map(([title, sub, arrives], i) => {
        let n = arrives !== null && t >= arrives ? 1 : 0;
        if (i === 1 && t >= T_APPROVE + 0.6) n = 0;
        const arrive = arrives === null ? 0 : pulseAt(t, arrives, arrives + 0.5);
        const hl = i === 1 ? pulseAt(t, T_ROW - 0.5, T_ROW + 0.7) : 0;
        return (
          <div key={title} style={at(CX, W_Y + i * W_ROW, { width: LW })}>
            <QuietRow height={W_ROW} hl={hl} lead={<CountCell n={n} arrive={arrive} />} title={title} sub={sub} chevron />
          </div>
        );
      })}
      <div style={at(CX, 500, { width: LW })}><SectionTitle text="This rotation" right="Feb 2027" /></div>
      <div style={at(CX, 536, { width: LW, borderTop: `1px solid ${C.line}`, paddingTop: 18, display: 'flex', gap: 56 })}>
        {[['121', 'trainees in this rotation'], ['14', 'less than full time'], ['3', 'paused']].map(([v, c]) => (
          <div key={c} style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: C.ink }}>{v}</div>
            <div style={{ fontSize: 14.5, color: C.inkSoft }}>{c}</div>
          </div>
        ))}
      </div>
    </>
  );
}
function RequestSheet({ t }) {
  const o = ease(t, T_ROW + 1.2, 0.5);  // once the camera has pulled back (32.2)
  if (o <= 0.01) return null;
  const done = t >= T_APPROVE + 0.2;
  const dp = ease(t, T_APPROVE + 0.2, 0.4);
  const flip = ease(t, T_APPROVE + 1.0, 0.7);
  return (
    <div style={at(SHEET_X + (1 - o) * 80, 0, { width: SHEET_W, height: WIN.h, background: '#fff', borderLeft: `1px solid ${C.line}`, boxShadow: '-18px 0 40px rgba(19,39,63,.12)', opacity: o })}>
      <div style={at(32, 28, { fontSize: 20, fontWeight: 600, color: C.ink })}>Working pattern (LTFT) requests</div>
      <div style={at(SHEET_W - 52, 30)}><Icon name="x" size={20} color={C.inkSoft} /></div>
      <div style={at(32, 80, card({ width: SHEET_W - 64, height: 316, padding: 20 }))}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={TRAINEE} size={40} i={2} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{TRAINEE}</div>
            <div style={{ fontSize: 14, color: C.inkSoft }}>ST5 · asked 28 Oct 2026</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>{done ? <Pill text="Approved" tone="success" style={{ opacity: dp }} /> : <Pill text="Waiting" tone="warning" />}</div>
        </div>
        <div style={{ marginTop: 20, fontSize: 15, color: C.ink, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>Full time</span><Icon name="arrow" size={16} color={C.inkSoft} /><span style={{ fontWeight: 600 }}>80%</span><span style={{ color: C.inkSoft }}>from Wed {FROM}</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 14.5, color: C.inkSoft }}>End of training when asked: {CCT_BEFORE} → {CCT_AFTER}</div>
        <div style={{ marginTop: 18, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
          <div style={{ fontSize: 14, color: C.inkSoft }}>End of training</div>
          <Flip from={CCT_BEFORE} to={CCT_AFTER} p={done ? flip : 0} style={{ fontSize: 30, fontWeight: 600, color: done && flip > 0.5 ? C.navy : C.ink, marginTop: 4, height: 40 }} />
          <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 6 }}>Counted as the RCoA CCT calculator counts.</div>
        </div>
      </div>
      {!done ? (
        <div style={at(APPROVE.x, APPROVE.y, { display: 'flex', gap: 12 })}>
          <div style={btnPrimary(pressed(t, T_APPROVE), { width: APPROVE.w })}>Approve</div>
          <div style={btnOutline(false, { width: 120 })}>Discuss</div>
          <div style={btnOutline(false, { width: 120 })}>Decline</div>
        </div>
      ) : (
        <div style={at(APPROVE.x, APPROVE.y + 8, { display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, color: C.success, opacity: dp })}>
          <Icon name="check" size={18} color={C.success} sw={2.2} />Approved: the working pattern and end of training are updated.
        </div>
      )}
    </div>
  );
}
function DeskScreen({ t }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
      <Sidebar active="Dashboard" />
      <TopBar title="Dashboard" />
      <Waiting t={t} />
      <RequestSheet t={t} />
    </div>
  );
}
function Desk({ t }) {
  const o = t < DESK_IN ? 0 : t < DESK_OUT ? ease(t, DESK_IN, 0.7) : 1 - ease(t, DESK_OUT, 0.6);
  if (o <= 0.01) return null;
  return <div style={{ position: 'absolute', inset: 0, opacity: o }}><AppWindow><DeskScreen t={t} /></AppWindow></div>;
}

// ── Camera and cursor ───────────────────────────────────────────────────────
const PHONE_C = { x: PX + PW / 2, y: PY + PH / 2 };
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 7.6, x: PHONE_C.x, y: 470, z: 1.35 },
  { t: 16.6, x: PHONE_C.x, y: 476, z: 1.35 },
  { t: 17.6, x: PHONE_C.x, y: 520, z: 1.3 },
  { t: 25.8, x: PHONE_C.x, y: 526, z: 1.3 },
  { t: 27.2, x: 960, y: 540, z: 1 },
  { t: 28.0, x: 960, y: 540, z: 1 },
  { t: 29.0, x: WIN.x + CX + LW / 2, y: WIN.y + 300, z: 1.45 },
  { t: 31.4, x: WIN.x + CX + LW / 2 + 4, y: WIN.y + 304, z: 1.45 },
  { t: 32.2, x: 960, y: 540, z: 1 },
  { t: 33.2, x: WIN.x + SHEET_X + SHEET_W / 2 - 40, y: WIN.y + 290, z: 1.35 },
  { t: 41.8, x: WIN.x + SHEET_X + SHEET_W / 2 - 36, y: WIN.y + 294, z: 1.35 },
  { t: 43.4, x: 960, y: 540, z: 1 },
  { t: 44.4, x: 960, y: 540, z: 1 },
  { t: 45.4, x: PHONE_C.x, y: 420, z: 1.4 },
  { t: 51.4, x: PHONE_C.x, y: 424, z: 1.4 },
  { t: 52.6, x: 960, y: 540, z: 1 },
  { t: 60, x: 960, y: 540, z: 1 },
];
const tapPt = (tt, x, y) => onFilm(tt, x, y);
const REQ = tapPt(T_REQ, IW / 2, LT + 102);
const C80 = tapPt(T_80, 170 + 31, CHIP_Y + 20);
const CFROM = tapPt(T_FROM, 100, FROM_Y + 22);
const CSEND = tapPt(T_SEND, IW / 2, SEND_Y + 22);
const CSTAGE = tapPt(T_STAGE, IW / 2, EX + 89 + 28);
const CSTAGE_SEND = { x: SX + SW - 16 - 20 - 50, y: SY + 170 + 168 };
const CMEET = tapPt(T_MEET, IW / 2, MT + 102);
const CMEET_SEND = tapPt(T_MEET_SEND, IW / 2, MT + 192);
const pt = (t, p, o = 1) => ({ t, x: p.x - 6, y: p.y - 6, o });
const CURSOR = [
  { t: 7.6, x: REQ.x + 120, y: REQ.y + 60, o: 0 },
  { t: 7.9, x: REQ.x + 120, y: REQ.y + 60, o: 1 },
  pt(T_REQ - 0.3, REQ), pt(T_REQ + 0.4, REQ),
  pt(T_80 - 0.3, C80), pt(T_80 + 0.3, C80),
  pt(T_FROM - 0.3, CFROM), pt(T_FROM + 0.4, CFROM),
  pt(T_SEND - 0.4, CSEND), pt(T_SEND + 0.5, CSEND),
  pt(T_SEND + 1.0, CSEND, 0),
  pt(T_STAGE - 0.8, CSTAGE, 0), pt(T_STAGE - 0.4, CSTAGE), pt(T_STAGE + 0.4, CSTAGE),
  pt(T_STAGE_SEND - 0.3, CSTAGE_SEND), pt(T_STAGE_SEND + 0.4, CSTAGE_SEND),
  pt(T_STAGE_SEND + 0.9, CSTAGE_SEND, 0),
  pt(T_MEET - 0.8, CMEET, 0), pt(T_MEET - 0.4, CMEET), pt(T_MEET + 0.4, CMEET),
  pt(T_MEET_SEND - 0.4, CMEET_SEND), pt(T_MEET_SEND + 0.5, CMEET_SEND),
  pt(T_MEET_SEND + 1.0, CMEET_SEND, 0),
  { t: 29.6, x: ROW_F.x + 160, y: ROW_F.y + 120, o: 0 },
  { t: 30.0, x: ROW_F.x + 160, y: ROW_F.y + 120, o: 1 },
  pt(T_ROW - 0.2, ROW_F), pt(T_ROW + 0.5, ROW_F),
  pt(T_ROW + 1.6, APPROVE_F), pt(T_APPROVE + 0.6, APPROVE_F),
  pt(T_APPROVE + 1.2, APPROVE_F, 0),
];
const CLICKS = [T_REQ, T_80, T_FROM, T_SEND, T_STAGE, T_STAGE_SEND, T_MEET, T_MEET_SEND, T_ROW, T_APPROVE];

function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <Desk t={t} />
        <TraineePhone t={t} />
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Requests, not emails" kicker="Product tour · trainee requests" />
      <EndCard t={t} inAt={53} />
    </FilmRoot>
  );
}
function AdeptRequestsVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={60} background={C.backdrop} persistKey="adeptch9">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptRequestsVideo = AdeptRequestsVideo;
})();
