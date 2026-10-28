// Compiled from chapter8-security.jsx by scripts/site/site_compile_videos.js - edit the .jsx, not this.
// Adept walkthrough — Chapter 8: "Governed by design" (58s)
// Redrawn 7 Oct 2026 for the app's redesign: a white page in sections
// divided by space and hairlines; invitations as rows, the two-factor code as
// a framed sign-in panel, the audit log as a table, the safeguards as a row.
// Uses the shared kit (adept-video-kit.jsx), loaded before this file.
/* global React */
(() => {
  const {
    Stage,
    useTime,
    Easing,
    clamp
  } = window;
  const {
    C,
    WIN,
    SB_W,
    TB_H,
    PAD,
    kf,
    Icon,
    Sidebar,
    TopBar,
    FilmRoot,
    Camera,
    AppWindow,
    Cursor,
    Captions,
    TitleCard,
    EndCard,
    Pill,
    SectionTitle,
    QuietRow,
    Avatar,
    Swatch,
    card,
    btnPrimary
  } = window.AdeptKit;

  // ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
  const CX = SB_W + PAD; // content left (272)
  const CW = WIN.w - SB_W - 2 * PAD; // content width (1404)
  const GAP = 32;
  const COL = (CW - GAP) / 2; // 686
  const RX = CX + COL + GAP; // right column left (990)
  const TOP_TITLE = 96,
    TOP_Y = 132,
    INV_ROW = 64;
  const CARD_H = 262;
  const AU_TITLE = 432,
    AU_HEAD = 468,
    AU_Y = 508,
    AU_ROW = 52;
  const SG_Y = 800;
  // The Verify button inside the sign-in panel (window coordinates).
  const VERIFY = {
    x: RX + 24,
    y: TOP_Y + 168,
    w: COL - 48,
    h: 44
  };
  const VERIFY_F = {
    x: WIN.x + VERIFY.x + VERIFY.w / 2,
    y: WIN.y + VERIFY.y + VERIFY.h / 2
  };
  const CAPTIONS = [[6.6, 12.8, 'NHS software has to be governed, not just useful.'], [14.2, 20.6, 'Every account is invited — direct sign-ups are rejected.'], [22.6, 29.0, 'Two-factor authentication on every account.'], [31.0, 37.6, 'And every change is audited — who, what, when.'], [39.6, 45.4, 'Role-scoped access, UK and EU hosting, point-in-time recovery.'], [47.0, 52.0, 'Built for NHS governance from day one.']];
  const CAM = [{
    t: 0.0,
    x: 960,
    y: 540,
    z: 1
  }, {
    t: 6.2,
    x: 960,
    y: 540,
    z: 1
  }, {
    t: 13.6,
    x: 960,
    y: 520,
    z: 1.05
  }, {
    t: 15.2,
    x: 730,
    y: 330,
    z: 1.5
  }, {
    t: 21.0,
    x: 734,
    y: 334,
    z: 1.5
  }, {
    t: 23.0,
    x: 1430,
    y: 330,
    z: 1.5
  }, {
    t: 29.4,
    x: 1434,
    y: 334,
    z: 1.5
  }, {
    t: 31.4,
    x: 1084,
    y: 676,
    z: 1.36
  }, {
    t: 38.0,
    x: 1084,
    y: 680,
    z: 1.36
  }, {
    t: 40.0,
    x: 1084,
    y: 620,
    z: 1.1
  }, {
    t: 46.0,
    x: 1084,
    y: 610,
    z: 1.08
  }, {
    t: 47.6,
    x: 960,
    y: 540,
    z: 1.03
  }, {
    t: 58,
    x: 960,
    y: 540,
    z: 1.03
  }];
  const CLICKS = [27.4];
  const CURSOR = [{
    t: 23.6,
    x: 1500,
    y: 470,
    o: 0
  }, {
    t: 24.2,
    x: 1500,
    y: 470,
    o: 1
  }, {
    t: 26.6,
    x: VERIFY_F.x - 6,
    y: VERIFY_F.y - 6,
    o: 1
  }, {
    t: 28.6,
    x: VERIFY_F.x - 6,
    y: VERIFY_F.y - 6,
    o: 1
  }, {
    t: 29.2,
    x: VERIFY_F.x + 10,
    y: VERIFY_F.y + 30,
    o: 0
  }];

  // ── Data ─────────────────────────────────────────────────────────────────────
  const INVITES = [{
    name: 'Jonah Bekele',
    email: 'j.bekele@nhs.net',
    sub: 'Invited by Dr E. Marsh · accepted'
  }, {
    name: 'Harleen Kaur',
    email: 'h.kaur@nhs.net',
    sub: 'Invited by Dr E. Marsh · accepted'
  }];
  const AUDIT = [['14:32', 'Rotation allocated', /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "A. Okafor \u2192 ", /*#__PURE__*/React.createElement(Swatch, {
    name: "Caldermere General",
    size: 10
  }), "Caldermere General \xB7 Aug 2026")], ['14:31', 'Outcome recorded', 'J. Bekele · ARCP outcome 1'], ['14:28', 'LTFT changed', 'H. Kaur · 100% → 80% · CCT recalculated'], ['14:21', 'Pause recorded', 'J. Bekele · parental leave · 9 months'], ['14:12', 'Invitation sent', '190 draft invitations · Aug 2026 cohort']];
  const SAFEGUARDS = [['people', 'Role-scoped access', 'Each role sees only what it needs'], ['shield', 'Point-in-time recovery', '7 days of restore, plus weekly backups'], ['building', 'UK and EU hosting', 'Database in the EU · files and functions in London'], ['check', 'WCAG AA', 'Contrast and 44 px tap targets']];
  const CODE = [3, 9, 4, 7, 1, 8];
  const at = (x, y, extra) => ({
    position: 'absolute',
    left: x,
    top: y,
    ...extra
  });

  // ── Invite-only accounts ─────────────────────────────────────────────────────
  function Invites({
    t
  }) {
    const pulse = t >= 16 && t < 20.6 ? Math.sin((t - 16) * 2.4) * 0.5 + 0.5 : 0;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: at(CX, TOP_TITLE, {
        width: COL
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "Invite-only accounts",
      right: "No public sign-up page"
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TOP_Y, {
        width: COL,
        borderTop: `1px solid ${C.line}`
      })
    }), INVITES.map((iv, i) => /*#__PURE__*/React.createElement("div", {
      key: iv.email,
      style: at(CX, TOP_Y + i * INV_ROW, {
        width: COL
      })
    }, /*#__PURE__*/React.createElement(QuietRow, {
      height: INV_ROW,
      lead: /*#__PURE__*/React.createElement(Avatar, {
        name: iv.name
      }),
      title: iv.email,
      sub: iv.sub,
      trail: /*#__PURE__*/React.createElement(Pill, {
        text: "Joined",
        tone: "success"
      })
    }))), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TOP_Y + 2 * INV_ROW, {
        width: COL,
        background: pulse > 0 ? `rgba(200,30,30,${0.08 * pulse})` : 'transparent'
      })
    }, /*#__PURE__*/React.createElement(QuietRow, {
      height: INV_ROW,
      lead: /*#__PURE__*/React.createElement("div", {
        style: {
          width: 32,
          height: 32,
          borderRadius: 16,
          border: `1.5px solid ${C.error}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "x",
        size: 14,
        color: C.error,
        sw: 2.2
      })),
      title: "Direct sign-up attempt",
      sub: "No invitation \xB7 refused by the server",
      trail: /*#__PURE__*/React.createElement(Pill, {
        text: "Rejected",
        tone: "error",
        style: {
          transform: `scale(${1 + 0.06 * pulse})`
        }
      })
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX + 8, TOP_Y + 3 * INV_ROW + 20, {
        width: COL - 16,
        fontSize: 14.5,
        color: C.inkSoft,
        lineHeight: 1.45
      })
    }, "Enforcement is server-side, not cosmetic: an account exists only once an invitation is accepted."));
  }

  // ── Two-factor sign-in panel ─────────────────────────────────────────────────
  function TwoFactor({
    t
  }) {
    const nd = Math.floor(Easing.easeOutCubic(clamp((t - 24.5) / 1.6, 0, 1)) * 6);
    const pressed = t >= 27.3 && t < 27.55;
    const done = Easing.easeOutCubic(clamp((t - 27.6) / 0.4, 0, 1));
    const left = 1 - t * 0.6 % 1;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: at(RX, TOP_TITLE, {
        width: COL
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "Two-factor authentication",
      right: "Required on every account"
    })), /*#__PURE__*/React.createElement("div", {
      style: at(RX, TOP_Y, card({
        width: COL,
        height: CARD_H,
        padding: '20px 24px'
      }))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 600,
        color: C.ink
      }
    }, "Enter your sign-in code"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14.5,
        color: C.inkSoft,
        marginTop: 4
      }
    }, "The 6-digit code from your authenticator app"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        marginTop: 18
      }
    }, CODE.map((d, i) => {
      const focus = i === nd && nd < 6 && t >= 24 && t < 27.4;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          width: 52,
          height: 60,
          borderRadius: 8,
          border: focus ? `2px solid ${C.navy}` : `1px solid ${C.field}`,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 500,
          color: C.ink,
          fontVariantNumeric: 'tabular-nums'
        }
      }, i < nd ? d : '');
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        alignSelf: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 120,
        height: 6,
        borderRadius: 3,
        background: C.line,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${left * 100}%`,
        height: '100%',
        borderRadius: 3,
        background: C.navy
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: C.inkSoft
      }
    }, "Code changes every 30 s")))), /*#__PURE__*/React.createElement("div", {
      style: at(VERIFY.x, VERIFY.y, btnPrimary(pressed, {
        width: VERIFY.w
      }))
    }, "Verify"), /*#__PURE__*/React.createElement("div", {
      style: at(RX + 24, VERIFY.y + VERIFY.h + 14, {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 14.5,
        color: C.success,
        fontWeight: 500,
        opacity: done
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16,
      color: C.success,
      sw: 2.2
    }), "Code accepted \xB7 signed in"));
  }

  // ── Audit log ────────────────────────────────────────────────────────────────
  function AuditLog({
    t
  }) {
    const cols = {
      time: 8,
      change: 96,
      detail: 330,
      who: 1180
    };
    const rowIn = i => Easing.easeOutCubic(clamp((t - 32.0 - i * 0.18) / 0.5, 0, 1));
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: at(CX, AU_TITLE, {
        width: CW
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "Audit log",
      arrow: true,
      right: "9 record types \xB7 every change recorded \xB7 today, 6 Jul 2026"
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, AU_HEAD, {
        width: CW,
        height: AU_Y - AU_HEAD,
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        fontSize: 14.5,
        color: C.inkSoft
      })
    }, [['Time', cols.time], ['Change', cols.change], ['Details', cols.detail], ['By', cols.who]].map(([h, x]) => /*#__PURE__*/React.createElement("span", {
      key: h,
      style: at(x, 10)
    }, h))), AUDIT.map(([time, ev, detail], i) => {
      const e = rowIn(i);
      return /*#__PURE__*/React.createElement("div", {
        key: time,
        style: at(CX, AU_Y + i * AU_ROW, {
          width: CW,
          height: AU_ROW,
          borderBottom: `1px solid ${C.line}`,
          opacity: e,
          transform: `translateY(${(1 - e) * 10}px)`
        })
      }, /*#__PURE__*/React.createElement("span", {
        style: at(cols.time, 15, {
          fontSize: 15,
          color: C.inkSoft,
          fontVariantNumeric: 'tabular-nums'
        })
      }, time), /*#__PURE__*/React.createElement("span", {
        style: at(cols.change, 15, {
          fontSize: 15,
          fontWeight: 600,
          color: C.ink
        })
      }, ev), /*#__PURE__*/React.createElement("span", {
        style: at(cols.detail, 15, {
          fontSize: 15,
          color: C.ink,
          whiteSpace: 'nowrap'
        })
      }, detail), /*#__PURE__*/React.createElement("div", {
        style: at(cols.who, 10, {
          display: 'flex',
          alignItems: 'center',
          gap: 10
        })
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: "Dr E. Marsh",
        size: 32,
        i: 1
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 15,
          color: C.ink
        }
      }, "Dr E. Marsh")));
    }));
  }

  // ── Safeguards ───────────────────────────────────────────────────────────────
  function Safeguards({
    t
  }) {
    const w = CW / 4;
    return /*#__PURE__*/React.createElement("div", {
      style: at(CX, SG_Y, {
        width: CW,
        display: 'flex',
        borderTop: `1px solid ${C.line}`,
        paddingTop: 20
      })
    }, SAFEGUARDS.map(([ic, l, d], i) => {
      const e = Easing.easeOutCubic(clamp((t - 39.8 - i * 0.25) / 0.5, 0, 1));
      return /*#__PURE__*/React.createElement("div", {
        key: l,
        style: {
          width: w,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          padding: i ? '0 0 0 20px' : '0 20px 0 8px',
          borderLeft: i ? `1px solid ${C.line}` : 'none',
          opacity: 0.35 + 0.65 * e
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 2
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: ic,
        size: 20,
        color: C.navy
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          lineHeight: 1.35
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 15,
          fontWeight: 600,
          color: C.ink
        }
      }, l), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14.5,
          color: C.inkSoft
        }
      }, d)));
    }));
  }
  function SecurityScreen({
    t
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: '#fff'
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      active: "Help & support"
    }), /*#__PURE__*/React.createElement(TopBar, {
      title: "Security and governance",
      right: /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "shield",
        size: 16,
        color: C.inkSoft
      }), "DTAC responses drafted")
    }), /*#__PURE__*/React.createElement(Invites, {
      t: t
    }), /*#__PURE__*/React.createElement(TwoFactor, {
      t: t
    }), /*#__PURE__*/React.createElement(AuditLog, {
      t: t
    }), /*#__PURE__*/React.createElement(Safeguards, {
      t: t
    }));
  }
  function Film({
    showCaptions
  }) {
    const t = useTime();
    return /*#__PURE__*/React.createElement(FilmRoot, {
      t: t
    }, /*#__PURE__*/React.createElement(Camera, {
      t: t,
      cam: CAM
    }, /*#__PURE__*/React.createElement(AppWindow, null, /*#__PURE__*/React.createElement(SecurityScreen, {
      t: t
    })), /*#__PURE__*/React.createElement(Cursor, {
      t: t,
      path: CURSOR,
      clicks: CLICKS
    })), /*#__PURE__*/React.createElement(Captions, {
      t: t,
      list: CAPTIONS,
      show: showCaptions
    }), /*#__PURE__*/React.createElement(TitleCard, {
      t: t,
      heading: "Governed by design",
      kicker: "Product tour \xB7 security and governance"
    }), /*#__PURE__*/React.createElement(EndCard, {
      t: t,
      inAt: 50
    }));
  }
  function AdeptSecurityVideo(props) {
    const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
    return /*#__PURE__*/React.createElement(Stage, {
      width: 1920,
      height: 1080,
      duration: 58,
      background: C.backdrop,
      persistKey: "adeptch8"
    }, /*#__PURE__*/React.createElement(Film, {
      showCaptions: showCaptions
    }));
  }
  window.AdeptSecurityVideo = AdeptSecurityVideo;
})();
