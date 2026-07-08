// Adept walkthrough — Chapter 8: "Governed by design" (58s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, WIN, CIX, CIW, Icon, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard } = K;

const CAPTIONS = [
  [6.6, 12.8, 'NHS software has to be governed, not just useful.'],
  [14.2, 20.6, 'Every account is invited — direct sign-ups are rejected.'],
  [22.6, 29.0, 'Two-factor authentication, enforced for programme staff.'],
  [31.0, 37.6, 'And every change is audited — who, what, when.'],
  [39.6, 45.4, 'Role-scoped access; UK-region hosting; delete protection.'],
  [47.0, 52.0, 'Built for NHS governance from day one.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 13.6, x: 960, y: 520, z: 1.05 },
  { t: 15.2, x: 700, y: 380, z: 1.5 },
  { t: 21.0, x: 704, y: 384, z: 1.5 },
  { t: 23.0, x: 1250, y: 380, z: 1.5 },
  { t: 29.4, x: 1254, y: 384, z: 1.5 },
  { t: 31.4, x: 1000, y: 690, z: 1.4 },
  { t: 38.0, x: 1004, y: 694, z: 1.4 },
  { t: 40.0, x: 960, y: 540, z: 1.08 },
  { t: 46.0, x: 960, y: 540, z: 1.03 },
  { t: 58, x: 960, y: 540, z: 1.03 },
];
const AUDIT = [
  ['14:32', 'Rotation allocated', 'A. Okafor → Caldermere General · Aug 2026', 'Dr E. Marsh'],
  ['14:31', 'Outcome recorded', 'J. Bekele · ARCP Outcome 1', 'Dr E. Marsh'],
  ['14:28', 'LTFT changed', 'H. Kaur · 100% → 80% · CCT recalculated', 'Dr E. Marsh'],
  ['14:21', 'Pause recorded', 'J. Bekele · parental leave · 9 months', 'Dr E. Marsh'],
  ['14:12', 'Invitation sent', '190 draft invitations · Aug 2026 cohort', 'Dr E. Marsh'],
];
function totpDigits(t) {
  const reveal = Easing.easeOutCubic(clamp((t - 24.5) / 1.6, 0, 1));
  return Math.floor(reveal * 6);
}
function SecurityScreen({ t }) {
  const denyPulse = t >= 16 && t < 20.6 ? Math.sin((t - 16) * 2.4) * 0.5 + 0.5 : 0;
  const nd = totpDigits(t);
  const rowIn = (i) => Easing.easeOutCubic(clamp((t - 32.0 - i * 0.18) / 0.5, 0, 1));
  const colW = (CIW - 24) / 2;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar active="Help & Support" />
      <TopBar title="Security & Governance" right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.tealFill, borderRadius: 999, padding: '7px 16px' }}>
          <Icon name="shield" size={15} color={C.teal} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>DTAC responses drafted</span>
        </div>
      } />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 96, width: colW, height: 300, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: C.blueFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mail" size={18} color={C.blue} /></div>
          <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Invite-only accounts</div>
        </div>
        <div style={{ marginTop: 16, border: `1px solid ${C.line}`, borderRadius: 8, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="check" size={16} color={C.green} sw={2.4} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>j.bekele@nhs.net</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft }}>invited by Dr E. Marsh · accepted</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: C.green, background: C.greenFill, padding: '3px 10px', borderRadius: 999 }}>Provisioned</div>
        </div>
        <div style={{ marginTop: 10, border: `1.5px solid rgba(220,38,38,${0.35 + 0.3 * denyPulse})`, background: `rgba(220,38,38,${0.05 + 0.04 * denyPulse})`, borderRadius: 8, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="x" size={16} color={C.red} sw={2.4} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>POST /api/signup</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft }}>direct sign-up attempt · no invitation</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 800, color: C.red, background: '#fff', border: `1px solid rgba(220,38,38,.4)`, padding: '3px 10px', borderRadius: 999 }}>403 REJECTED</div>
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 14, lineHeight: 1.5 }}>There is no public sign-up page — enforcement is server-side, not cosmetic.</div>
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x + colW + 24, top: 96, width: colW, height: 300, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: C.tealFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={18} color={C.teal} /></div>
          <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Two-factor authentication</div>
        </div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 8 }}>TOTP built in-app · enforced for every programme staff role</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'center' }}>
          {[3, 9, 4, 7, 1, 8].map((d, i) => (
            <div key={i} style={{ width: 46, height: 58, borderRadius: 8, border: `1.5px solid ${i < nd ? C.teal : C.line}`, background: i < nd ? C.tealFill : C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_T, fontWeight: 800, fontSize: 26, color: i < nd ? C.teal : 'transparent' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, justifyContent: 'center' }}>
          <div style={{ width: 130, height: 6, borderRadius: 999, background: '#E4EAF2', overflow: 'hidden' }}>
            <div style={{ width: `${(1 - ((t * 0.6) % 1)) * 100}%`, height: '100%', background: C.teal }} />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft }}>code rotates every 30s</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 424, width: CIW, height: 330, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '18px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Audit log</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft }}>9 record types · every change recorded</div>
          <div style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 600, color: C.inkSoft }}>today · 6 Jul 2026</div>
        </div>
        {AUDIT.map(([time, ev, detail, who], i) => {
          const e = rowIn(i);
          return (
            <div key={time} style={{ display: 'flex', alignItems: 'center', gap: 16, borderTop: i ? '1px solid #EDF1F6' : 'none', padding: '11px 4px', opacity: e, transform: `translateY(${(1 - e) * 10}px)` }}>
              <span style={{ width: 52, fontSize: 12.5, fontWeight: 700, color: C.inkSoft, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
              <span style={{ width: 170, fontFamily: FONT_T, fontWeight: 700, fontSize: 14, color: C.navy }}>{ev}</span>
              <span style={{ flex: 1, fontSize: 13, color: C.ink }}>{detail}</span>
              <span style={{ fontSize: 12.5, color: C.inkSoft }}>{who}</span>
              <Icon name="check" size={13} color={C.green} sw={2.4} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 782, width: CIW, display: 'flex', gap: 16 }}>
        {[['people', 'Role-scoped access', 'each role sees only what it needs'], ['shield', 'Delete protection', 'primary records cannot be hard-deleted'], ['building', 'UK-region hosting', 'London · europe-west2'], ['check', 'WCAG AA', 'contrast + 44px tap targets']].map(([ic, l, d]) => (
          <div key={l} style={{ flex: 1, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={17} color={C.navy} /></div>
            <div>
              <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 14.5, color: C.ink }}>{l}</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><SecurityScreen t={t} /></AppWindow>
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Governed by design" kicker="Product tour · Security & governance" />
      <EndCard t={t} inAt={50} />
    </FilmRoot>
  );
}
function AdeptSecurityVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={58} background="#E4EAF2" persistKey="adeptch8">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptSecurityVideo = AdeptSecurityVideo;
})();
