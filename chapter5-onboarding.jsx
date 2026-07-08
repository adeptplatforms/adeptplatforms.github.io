// Adept walkthrough — Chapter 5: "Onboarding a cohort" (66s)
/* global React */
(() => {
const { Stage, useTime, Easing, clamp } = window;
const K = window.AdeptKit;
const { C, FONT_T, WIN, CIX, CIW, Icon, Flip, kf, Sidebar, TopBar, FilmRoot, Camera, AppWindow, Cursor, Captions, TitleCard, EndCard } = K;

const CAPTIONS = [
  [6.6, 12.4, 'A new cohort starts as the spreadsheet you already have.'],
  [13.4, 19.6, 'Drop it in — every row becomes a draft invitation.'],
  [21.6, 27.8, '190 drafts, grouped by trust. Review before anything sends.'],
  [29.8, 35.4, 'One click — the whole cohort is invited.'],
  [37.8, 44.2, 'Invite-only, always. There is no public sign-up page.'],
  [46.2, 52.6, 'And Excel comes back out — grouped by trust, for the deanery.'],
];
const CAM = [
  { t: 0.0, x: 960, y: 540, z: 1 },
  { t: 6.2, x: 960, y: 540, z: 1 },
  { t: 12.8, x: 960, y: 520, z: 1.06 },
  { t: 14.4, x: 700, y: 460, z: 1.45 },
  { t: 20.0, x: 700, y: 466, z: 1.45 },
  { t: 21.8, x: 1150, y: 470, z: 1.4 },
  { t: 28.2, x: 1150, y: 476, z: 1.4 },
  { t: 30.2, x: 1420, y: 800, z: 1.55 },
  { t: 35.8, x: 1420, y: 806, z: 1.55 },
  { t: 38.0, x: 1084, y: 500, z: 1.25 },
  { t: 44.6, x: 1084, y: 506, z: 1.25 },
  { t: 46.4, x: 1084, y: 260, z: 1.4 },
  { t: 53.0, x: 1084, y: 266, z: 1.4 },
  { t: 54.8, x: 960, y: 540, z: 1.02 },
  { t: 66, x: 960, y: 540, z: 1.02 },
];
const DROP = { x: 700, y: 470 };
const SEND = { x: 1560, y: 856 };
const CURSOR = [
  { t: 13.4, x: 420, y: 780, o: 0 },
  { t: 14.0, x: 420, y: 780, o: 1 },
  { t: 16.2, x: DROP.x, y: DROP.y, o: 1 },
  { t: 18.4, x: DROP.x, y: DROP.y, o: 1 },
  { t: 19.2, x: DROP.x, y: DROP.y, o: 0 },
  { t: 29.2, x: 1300, y: 950, o: 0 },
  { t: 29.8, x: 1300, y: 950, o: 1 },
  { t: 31.4, x: SEND.x, y: SEND.y, o: 1 },
  { t: 34.4, x: SEND.x, y: SEND.y, o: 1 },
  { t: 35.2, x: SEND.x, y: SEND.y, o: 0 },
];
const CLICKS = [17.4, 32.6];

// phases: 0 empty dropzone; drag file 14-17.4; parsing 17.4-19; drafts 19+; sending 32.6; sent 33.4+
const ROWS = [
  ['A. Okafor', 'CT2', 'Caldermere General'],
  ['R. Singh', 'ST4', 'Ellerbeck Royal'],
  ['M. Doyle', 'CT1', 'Skelton Bridge'],
  ['J. Bekele', 'ST5', 'Caldermere General'],
  ['S. Patel', 'CT3', 'Harewood Vale'],
];
function OnboardScreen({ t }) {
  const parsed = t >= 19;
  const parseP = Easing.easeOutCubic(clamp((t - 19) / 0.8, 0, 1));
  const sent = t >= 33.4;
  const sentWave = (i) => Easing.easeOutCubic(clamp((t - 33.4 - i * 0.14) / 0.5, 0, 1));
  const pressSend = t >= 32.6 && t < 32.9;
  const dragP = Easing.easeInOutCubic(clamp((t - 14.6) / 2.4, 0, 1));
  const fileX = 320 + (DROP.x - WIN.x - 320) * dragP, fileY = 700 + (DROP.y - WIN.y - 700) * dragP;
  const dropHot = dragP > 0.85 && t < 17.4;
  const parsing = t >= 17.4 && t < 19;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sidebar active="Invitations" />
      <TopBar title="Invitations" right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${C.line}`, borderRadius: 8, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, color: C.navy, background: '#fff' }}><Icon name="download" size={14} color={C.navy} />Export cohort (.xlsx)</div>
        </div>
      } />
      <div style={{ position: 'absolute', left: CIX - WIN.x, top: 96, width: 420 }}>
        <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 19, color: C.ink }}>Import a cohort</div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4, lineHeight: 1.5 }}>Excel in → draft invitations out. Nothing sends until you say so.</div>
        <div style={{ marginTop: 16, height: 260, border: `2px dashed ${dropHot || parsing ? C.teal : '#C0CBDA'}`, borderRadius: 12, background: dropHot ? C.tealFill : '#FBFCFE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, transform: dropHot ? 'scale(1.015)' : 'none' }}>
          {parsing ? (
            <React.Fragment>
              <div style={{ width: 200, height: 8, borderRadius: 999, background: '#E4EAF2', overflow: 'hidden' }}>
                <div style={{ width: `${clamp((t - 17.4) / 1.4, 0, 1) * 100}%`, height: '100%', background: C.teal, borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.inkSoft }}>Reading 190 rows…</div>
            </React.Fragment>
          ) : parsed ? (
            <React.Fragment>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: C.tealFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={24} color={C.teal} sw={2.4} /></div>
              <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 16.5, color: C.ink }}>cohort-aug-2026.xlsx</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.teal }}>190 rows → 190 draft invitations</div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: '#EDF1F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="upload" size={24} color={C.inkSoft} /></div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink }}>Drop your cohort spreadsheet</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft }}>.xlsx · names, grades, trusts, LTFT</div>
            </React.Fragment>
          )}
        </div>
        <div style={{ marginTop: 16, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '12px 16px' }}>
          <span style={{ fontWeight: 700, color: C.navy }}>Invite-only.</span> Accounts exist only when a programme director creates them — direct sign-ups are rejected by the server.
        </div>
      </div>
      <div style={{ position: 'absolute', left: CIX - WIN.x + 460, top: 96, width: CIW - 460, bottom: 36, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '18px 24px', opacity: parsed ? 1 : 0.45 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: FONT_T, fontWeight: 700, fontSize: 18, color: C.ink }}>Draft invitations</div>
            <Flip from="Waiting for an import…" to={parsed ? '190 drafts · grouped by trust · 0 sent' : 'Waiting for an import…'} p={parseP} style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 18px', fontSize: 13.5, fontWeight: 600, color: C.inkSoft }}>Review all</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: parsed ? C.navy : '#8D9AAB', color: '#fff', fontFamily: FONT_T, fontWeight: 700, fontSize: 14.5, padding: '10px 22px', borderRadius: 8, transform: pressSend ? 'scale(0.95)' : 'none' }}>
              <Icon name="mail" size={15} color="#fff" />{sent ? 'Sent ✓' : 'Send all (190)'}
            </div>
          </div>
        </div>
        {parsed && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Caldermere General · 30 trainees</div>
            {ROWS.map(([n, g, tr], i) => {
              const w = sentWave(i);
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${C.line}`, borderRadius: 8, padding: '11px 16px', marginBottom: 8, opacity: Math.min(1, parseP * 1.3 - i * 0.06), background: sent && w > 0.5 ? '#F3FBF7' : '#fff' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 17, background: C.blueFill, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700 }}>{n.split(' ').map(s => s[0]).join('').replace('.', '')}</div>
                  <div style={{ width: 190, fontFamily: FONT_T, fontWeight: 700, fontSize: 15, color: C.ink }}>{n}</div>
                  <div style={{ width: 60, fontSize: 12.5, fontWeight: 700, color: C.navy }}>{g}</div>
                  <div style={{ flex: 1, fontSize: 13, color: C.inkSoft }}>{tr}</div>
                  {sent ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: w, transform: `translateX(${(1 - w) * 10}px)` }}>
                      <Icon name="check" size={14} color={C.green} sw={2.4} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.green }}>Invited</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, background: C.soft, padding: '4px 14px', borderRadius: 999 }}>Draft</div>
                  )}
                </div>
              );
            })}
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 10 }}>+ 25 more at this trust · 6 more trusts below</div>
          </div>
        )}
      </div>
      {dragP > 0.01 && t < 17.4 && (
        <div style={{ position: 'absolute', left: fileX, top: fileY, width: 190, background: '#fff', borderRadius: 10, boxShadow: '0 16px 40px rgba(19,39,63,.25)', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', transform: `rotate(${(1 - dragP) * -4}deg)`, zIndex: 30 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: C.greenFill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="doc" size={18} color={C.green} /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>cohort-aug-2026</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft }}>.xlsx · 190 rows</div>
          </div>
        </div>
      )}
    </div>
  );
}
function Film({ showCaptions }) {
  const t = useTime();
  return (
    <FilmRoot t={t}>
      <Camera t={t} cam={CAM}>
        <AppWindow><OnboardScreen t={t} /></AppWindow>
        <Cursor t={t} path={CURSOR} clicks={CLICKS} />
      </Camera>
      <Captions t={t} list={CAPTIONS} show={showCaptions} />
      <TitleCard t={t} heading="Onboarding a cohort" kicker="Product tour · Import → Send all" />
      <EndCard t={t} inAt={56} />
    </FilmRoot>
  );
}
function AdeptOnboardVideo(props) {
  const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
  return (
    <Stage width={1920} height={1080} duration={66} background="#E4EAF2" persistKey="adeptch5">
      <Film showCaptions={showCaptions} />
    </Stage>
  );
}
window.AdeptOnboardVideo = AdeptOnboardVideo;
})();
