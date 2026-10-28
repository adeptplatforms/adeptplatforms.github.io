// Compiled from chapter3-profile.jsx by scripts/site/site_compile_videos.js - edit the .jsx, not this.
// Adept walkthrough — Chapter 3: "The trainee profile" (74s)
// Scene code for the animations.jsx engine. Exposes window.AdeptProfileVideo.
// Redrawn 7 Oct 2026 for the app's redesign: name, grade and status pills and
// the three actions first; the placement timeline (trust-coloured placements
// on the Feb/Aug cycle, grade starts, Today and CCT lines); then Rotations and
// Exams and milestones (left) beside Trainee details, Training status and
// LTFT & CCT (right). The page scrolls to the cards and back to the timeline.
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
    Flip,
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
    Swatch,
    Avatar,
    Tick,
    card,
    btnPrimary,
    btnOutline,
    trustColour
  } = window.AdeptKit;

  // ── Layout (window coordinates on the page, before scrolling) ───────────────
  const CX = SB_W + PAD; // 272
  const CW = WIN.w - SB_W - 2 * PAD; // 1404
  const LW = Math.round((CW - 24) * 3 / 5); // left column 828
  const RX = CX + LW + 24,
    RW = CW - LW - 24; // right column 1124, 552
  const TL_Y = 167,
    TL_H = 200;
  const COL_Y = TL_Y + TL_H + 24; // 391
  const ROT_H = 262,
    EX_Y = COL_Y + ROT_H + 24;
  const DET_H = 436,
    ST_Y = COL_Y + DET_H + 24,
    ST_H = 200,
    LT_Y = ST_Y + ST_H + 24,
    LT_H = 300;
  const DOWN = 520; // scroll that brings the right-hand cards into view
  const DLG = {
    x: CX + (CW - 480) / 2,
    y: 250,
    w: 480,
    h: 360
  };

  // Film coordinates the cursor aims at (arrow tip ~6,4 into the icon).
  const tip = (x, y) => ({
    x: WIN.x + x - 6,
    y: WIN.y + y - 4
  });
  const EDIT_LTFT = tip(RX + 206 + 82, LT_Y + 34 - DOWN);
  const SAVE = tip(RX + RW - 24 - 42, LT_Y + 206 - DOWN);
  const ADD_PAUSE = tip(RX + 24 + 68, ST_Y + 116 - DOWN);
  const CONFIRM = tip(DLG.x + DLG.w - 24 - 75, DLG.y + DLG.h - 40);

  // ── Timeline maths: an 80% spell from Aug 2026, then 9 months' parental leave
  // from Nov 2026. Grade starts and the CCT move; placements stay on the cycle.
  const LTFT_AT = 2026.6,
    PAUSE_AT = 2026.85,
    PAUSE_LEN = 0.75,
    CCT0 = 2028.6,
    TODAY = 2026.55;
  const SAVE_AT = 20.2,
    PAUSE_SAVED = 36.8; // when the cards change
  const TL1 = 23.6,
    TL2 = 39.4; // when the timeline redraws (on screen)
  function transforms(t) {
    const p1 = Easing.easeInOutCubic(clamp((t - TL1) / 1.2, 0, 1));
    const p2 = Easing.easeInOutCubic(clamp((t - TL2) / 1.5, 0, 1));
    const k1 = 1 + 0.25 * p1;
    const T = yr => {
      const a = yr <= LTFT_AT ? yr : LTFT_AT + (yr - LTFT_AT) * k1;
      return a <= PAUSE_AT ? a : a + PAUSE_LEN * p2;
    };
    return {
      T,
      p1,
      p2
    };
  }
  const GRADES = [[2021.6, 'CT1'], [2022.6, 'CT2'], [2023.6, 'CT3'], [2024.6, 'ST4'], [2025.6, 'ST5'], [2026.6, 'ST6'], [2027.6, 'ST7']];
  // Placements, Aug and Feb, from Aug 2021; after the last one, "Needs placement".
  const PLACED = ['Skelton Bridge', 'Skelton Bridge', 'Harewood Vale', 'Harewood Vale', 'Wharfemoor Park', 'Wharfemoor Park', 'Ousegate Teaching', 'Ousegate Teaching', 'Netherfield & District', 'Ellerbeck Royal Infirmary', 'Caldermere General'];
  const GX = 24,
    GW = CW - 48,
    Y0 = 2021.4,
    Y1 = 2030.4,
    PX = GW / (Y1 - Y0);
  const X = yr => GX + (yr - Y0) * PX;
  const CCT_DATES = ['1 Aug 2028', '6 Feb 2029', '9 Nov 2029'];
  function cctFlip(t, a, b) {
    const states = [{
      at: -99,
      v: CCT_DATES[0]
    }, {
      at: a,
      v: CCT_DATES[1]
    }, {
      at: b,
      v: CCT_DATES[2]
    }];
    let cur = states[0],
      prev = states[0];
    for (const s of states) if (t >= s.at) {
      prev = cur;
      cur = s;
    }
    return {
      from: prev.v,
      to: cur.v,
      p: Easing.easeOutCubic(clamp((t - cur.at) / 0.6, 0, 1))
    };
  }

  // ── Scripts ──────────────────────────────────────────────────────────────────
  const CAPTIONS = [[6.6, 13.0, 'One profile: the placement timeline first, then the detail.'], [14.6, 19.6, 'Add a dated 80% spell — less than full time from August…'], [21.8, 28.2, '…and the completion date recalculates itself.'], [30.2, 34.6, 'Now record parental leave — nine months from November.'], [39.6, 47.2, 'Every later stage — and the CCT — shifts by the pause.'], [50.2, 55.6, 'The trainee returns exactly where they left off.'], [57.8, 63.6, 'The domain’s hardest arithmetic, built in.']];
  const SCROLL = [{
    t: 0,
    s: 0
  }, {
    t: 13.9,
    s: 0
  }, {
    t: 15.1,
    s: DOWN
  }, {
    t: 21.6,
    s: DOWN
  }, {
    t: 22.8,
    s: 0
  }, {
    t: 29.0,
    s: 0
  }, {
    t: 30.2,
    s: DOWN
  }, {
    t: 37.6,
    s: DOWN
  }, {
    t: 38.8,
    s: 0
  }, {
    t: 74,
    s: 0
  }];
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
    z: 1.03
  }, {
    t: 15.2,
    x: 1360,
    y: 760,
    z: 1.5
  }, {
    t: 21.4,
    x: 1360,
    y: 764,
    z: 1.5
  }, {
    t: 23.0,
    x: 1084,
    y: 340,
    z: 1.3
  }, {
    t: 28.8,
    x: 1084,
    y: 344,
    z: 1.3
  }, {
    t: 30.4,
    x: 1250,
    y: 500,
    z: 1.35
  }, {
    t: 37.4,
    x: 1250,
    y: 504,
    z: 1.35
  }, {
    t: 39.0,
    x: 1084,
    y: 340,
    z: 1.3
  }, {
    t: 48.6,
    x: 1084,
    y: 344,
    z: 1.3
  }, {
    t: 50.0,
    x: 1330,
    y: 340,
    z: 1.85
  }, {
    t: 56.2,
    x: 1334,
    y: 344,
    z: 1.85
  }, {
    t: 58.2,
    x: 960,
    y: 540,
    z: 1.03
  }, {
    t: 66.0,
    x: 960,
    y: 536,
    z: 1.05
  }, {
    t: 74,
    x: 960,
    y: 536,
    z: 1.05
  }];
  const CURSOR = [{
    t: 13.8,
    x: 1400,
    y: 820,
    o: 0
  }, {
    t: 14.4,
    x: 1400,
    y: 820,
    o: 1
  }, {
    t: 16.0,
    x: EDIT_LTFT.x,
    y: EDIT_LTFT.y,
    o: 1
  }, {
    t: 16.9,
    x: EDIT_LTFT.x,
    y: EDIT_LTFT.y,
    o: 1
  }, {
    t: 18.6,
    x: SAVE.x,
    y: SAVE.y,
    o: 1
  }, {
    t: 21.0,
    x: SAVE.x,
    y: SAVE.y,
    o: 1
  }, {
    t: 21.6,
    x: SAVE.x,
    y: SAVE.y,
    o: 0
  }, {
    t: 29.8,
    x: 1500,
    y: 760,
    o: 0
  }, {
    t: 30.4,
    x: 1500,
    y: 760,
    o: 1
  }, {
    t: 32.0,
    x: ADD_PAUSE.x,
    y: ADD_PAUSE.y,
    o: 1
  }, {
    t: 34.2,
    x: ADD_PAUSE.x,
    y: ADD_PAUSE.y,
    o: 1
  }, {
    t: 35.6,
    x: CONFIRM.x,
    y: CONFIRM.y,
    o: 1
  }, {
    t: 36.9,
    x: CONFIRM.x,
    y: CONFIRM.y,
    o: 1
  }, {
    t: 37.4,
    x: CONFIRM.x,
    y: CONFIRM.y,
    o: 0
  }];
  const CLICKS = [16.4, 20.0, 33.2, 36.5];
  const at = (x, y, extra) => ({
    position: 'absolute',
    left: x,
    top: y,
    ...extra
  });
  const short = n => n.split(' ')[0];

  // ── The placement timeline ───────────────────────────────────────────────────
  function Timeline({
    t
  }) {
    const {
      T,
      p2
    } = transforms(t);
    const cct = T(CCT0);
    const flag = cctFlip(t, TL1, TL2);
    const years = [];
    for (let y = 2022; y <= 2030; y++) years.push(y);
    const bars = [];
    for (let k = 0;; k++) {
      const s = 2021.6 + 0.5 * k;
      if (s >= cct || k > 30) break;
      const e = Math.min(s + 0.5, cct);
      const trust = PLACED[k];
      const o = trust ? 1 : clamp((cct - s) / 0.12, 0, 1);
      bars.push(/*#__PURE__*/React.createElement("div", {
        key: k,
        style: at(X(s) + 1, 92, {
          width: X(e) - X(s) - 2,
          height: 44,
          borderRadius: 4,
          opacity: o,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          padding: '0 6px',
          display: 'flex',
          alignItems: 'center',
          fontSize: 12.5,
          fontWeight: 500,
          ...(trust ? {
            background: trustColour(trust),
            color: '#fff'
          } : {
            background: C.warningFill,
            color: C.warning,
            border: '1px solid rgba(154,91,19,.35)'
          })
        })
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, trust ? short(trust) : 'Needs placement')));
    }
    const pw = PAUSE_LEN * PX * p2;
    return /*#__PURE__*/React.createElement("div", {
      style: at(CX, TL_Y, card({
        width: CW,
        height: TL_H
      }))
    }, /*#__PURE__*/React.createElement("div", {
      style: at(24, 12, {
        display: 'flex',
        gap: 28,
        fontSize: 13.5,
        color: C.inkSoft
      })
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, "Colour by ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.ink
      }
    }, "Hospital trust"), /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 12,
      color: C.ink
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, "Zoom ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.ink
      }
    }, "Fit all"), /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 12,
      color: C.ink
    }))), years.map(y => /*#__PURE__*/React.createElement("div", {
      key: y
    }, /*#__PURE__*/React.createElement("div", {
      style: at(X(y), 58, {
        width: 1,
        height: 92,
        background: C.line
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: at(X(y) + 6, 38, {
        fontSize: 13.5,
        color: C.ink
      })
    }, y))), GRADES.map(([s, g]) => {
      const x = X(T(s));
      return /*#__PURE__*/React.createElement("div", {
        key: g
      }, /*#__PURE__*/React.createElement("div", {
        style: at(x, 62, {
          width: 1,
          height: 26,
          background: C.inkSoft
        })
      }), /*#__PURE__*/React.createElement("div", {
        style: at(x + 4, 64, {
          fontSize: 12,
          fontWeight: 500,
          color: C.inkSoft
        })
      }, g));
    }), bars, p2 > 0.02 && /*#__PURE__*/React.createElement("div", {
      style: at(X(PAUSE_AT), 88, {
        width: pw,
        height: 52,
        borderRadius: 4,
        background: `repeating-linear-gradient(45deg, ${C.paused}, ${C.paused} 7px, #7E8A9B 7px, #7E8A9B 14px)`,
        border: '2px solid #fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      })
    }, p2 > 0.8 ? 'Parental leave' : ''), p2 > 0.9 && /*#__PURE__*/React.createElement("div", {
      style: at(X(PAUSE_AT + PAUSE_LEN) - 60, 150, {
        width: 120,
        textAlign: 'center',
        fontSize: 12.5,
        color: C.inkSoft,
        opacity: (p2 - 0.9) * 10
      })
    }, "Returns 4 Aug 2027"), /*#__PURE__*/React.createElement("div", {
      style: at(X(TODAY), 30, {
        width: 2,
        height: 124,
        background: C.error
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: at(X(TODAY) - 20, 14, {
        background: C.error,
        color: '#fff',
        fontSize: 11.5,
        fontWeight: 600,
        padding: '1px 6px',
        borderRadius: 3
      })
    }, "Today"), /*#__PURE__*/React.createElement("div", {
      style: at(X(cct) - 1, 30, {
        width: 2,
        height: 124,
        background: C.navy
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: at(X(cct) - 132, 12, {
        width: 132,
        display: 'flex',
        justifyContent: 'flex-end'
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4,
        background: C.navy,
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        padding: '2px 7px',
        borderRadius: 3,
        whiteSpace: 'nowrap'
      }
    }, "CCT ", /*#__PURE__*/React.createElement(Flip, {
      from: flag.from,
      to: flag.to,
      p: flag.p,
      style: {}
    }))));
  }

  // ── The cards ────────────────────────────────────────────────────────────────
  const cardTitle = (text, extra) => /*#__PURE__*/React.createElement("div", {
    style: at(24, 22, {
      fontSize: 17,
      fontWeight: 600,
      color: C.ink,
      ...extra
    })
  }, text);
  const hair = (y, w) => /*#__PURE__*/React.createElement("div", {
    style: at(24, y, {
      width: w - 48,
      borderTop: `1px solid ${C.line}`
    })
  });
  function Rotations() {
    const row = (y, trust, sub, pill, cur) => /*#__PURE__*/React.createElement("div", {
      style: at(24, y, {
        width: LW - 48,
        height: 76,
        borderRadius: 8,
        border: `1px solid ${cur ? C.success : C.line}`,
        background: cur ? C.successFill : C.soft,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px'
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        lineHeight: 1.4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 16,
        fontWeight: 500,
        color: C.ink
      }
    }, /*#__PURE__*/React.createElement(Swatch, {
      name: trust,
      size: 10
    }), trust), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        color: C.inkSoft
      }
    }, sub)), /*#__PURE__*/React.createElement(Pill, {
      text: pill,
      tone: cur ? 'success' : 'neutral'
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "next",
      size: 16,
      color: C.inkSoft
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: at(CX, COL_Y, card({
        width: LW,
        height: ROT_H
      }))
    }, cardTitle('Rotations'), hair(60, LW), row(76, 'Caldermere General', 'Aug 2026 – Feb 2027 · ST6', 'upcoming'), row(166, 'Ellerbeck Royal Infirmary', 'Feb 2026 – Aug 2026 · ST5', 'current', true));
  }
  function Exams() {
    const item = (x, y, title, sub, done) => /*#__PURE__*/React.createElement("div", {
      style: at(x, y, {
        display: 'flex',
        gap: 12,
        width: 340
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginTop: 2,
        border: done ? 'none' : `1.5px solid ${C.field}`,
        background: done ? C.success : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, done && /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12,
      color: "#fff",
      sw: 2.2
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        lineHeight: 1.35
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        color: C.ink
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: done ? C.success : C.inkSoft
      }
    }, sub)));
    const half = (LW - 48) / 2;
    return /*#__PURE__*/React.createElement("div", {
      style: at(CX, EX_Y, card({
        width: LW,
        height: 340
      }))
    }, cardTitle('Exams and milestones'), /*#__PURE__*/React.createElement("div", {
      style: at(24, 46, {
        fontSize: 15,
        color: C.inkSoft
      })
    }, "6 of 11 achieved"), /*#__PURE__*/React.createElement("div", {
      style: at(LW - 24 - 80, 20, {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 14px',
        borderRadius: 8,
        background: C.soft,
        fontSize: 15,
        color: C.ink
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 14,
      color: C.ink
    }), "Edit"), hair(80, LW), /*#__PURE__*/React.createElement("div", {
      style: at(24, 96, {
        fontSize: 16,
        fontWeight: 500,
        color: C.ink
      })
    }, "Exams"), /*#__PURE__*/React.createElement("div", {
      style: at(24 + half, 96, {
        fontSize: 16,
        fontWeight: 500,
        color: C.ink
      })
    }, "Milestones"), item(24, 132, 'FRCA Primary Written', 'Passed Mar 2023', true), item(24, 184, 'FRCA Primary OSCE / SOE', 'Passed Oct 2023', true), item(24, 236, 'FRCA Final Written', 'Passed Sep 2025', true), item(24, 288, 'FRCA Final SOE', 'Not yet achieved', false), item(24 + half, 132, 'Initial Assessment of Competence', 'Achieved Feb 2022', true), item(24 + half, 184, 'IAC in Obstetric Anaesthesia', 'Achieved Aug 2022', true), item(24 + half, 236, 'Stage 1 certificate', 'Achieved Aug 2024', true), item(24 + half, 288, 'Stage 2 certificate', 'Not yet achieved', false));
  }
  function Details() {
    const rows = [['Change history', /*#__PURE__*/React.createElement("div", {
      style: btnOutline(false, {
        height: 34,
        fontSize: 14,
        padding: '0 12px'
      })
    }, "Load history")], ['GMC number', '7612345'], ['Email', /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.navy,
        textDecoration: 'underline'
      }
    }, "j.bekele@nhs.example")], ['Region', 'Northdale Deanery'], ['Post number', 'NDL/ANA/0412'], ['Training programme', 'Anaesthetics'], ['Training start', '4 Aug 2021']];
    return /*#__PURE__*/React.createElement("div", {
      style: at(RX, COL_Y, card({
        width: RW,
        height: DET_H
      }))
    }, cardTitle('Trainee details'), rows.map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: at(24, 62 + i * 52, {
        width: RW - 48,
        height: 52,
        borderTop: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'center',
        fontSize: 15
      })
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.inkSoft
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        color: C.ink
      }
    }, v))));
  }
  function TrainingStatus({
    t
  }) {
    const done = t >= PAUSE_SAVED;
    const e = Easing.easeOutCubic(clamp((t - PAUSE_SAVED) / 0.5, 0, 1));
    const press = t >= 33.2 && t < 33.45;
    return /*#__PURE__*/React.createElement("div", {
      style: at(RX, ST_Y, card({
        width: RW,
        height: ST_H
      }))
    }, cardTitle('Training status'), /*#__PURE__*/React.createElement("div", {
      style: at(170, 23)
    }, /*#__PURE__*/React.createElement(Pill, {
      text: "Active",
      tone: "success"
    })), /*#__PURE__*/React.createElement("div", {
      style: at(24, 60, {
        fontSize: 15,
        color: C.inkSoft
      })
    }, "The end of training is pushed back while paused."), /*#__PURE__*/React.createElement("div", {
      style: at(24, 96, btnOutline(press, {
        height: 40
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 16,
      color: C.navy
    }), "Add pause"), done && /*#__PURE__*/React.createElement("div", {
      style: at(24, 150, {
        width: RW - 48,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 15,
        color: C.ink,
        opacity: e,
        transform: `translateY(${(1 - e) * 8}px)`
      })
    }, /*#__PURE__*/React.createElement(Pill, {
      text: "Scheduled",
      tone: "warning"
    }), "Parental leave \xB7 1 Nov 2026 \u2013 3 Aug 2027"));
  }
  function LtftCard({
    t
  }) {
    const edit = t >= 16.5 && t < SAVE_AT;
    const saved = t >= SAVE_AT;
    const row2 = Easing.easeOutCubic(clamp((t - 17.0) / 0.5, 0, 1));
    const cct = cctFlip(t, SAVE_AT, PAUSE_SAVED);
    const pressEdit = t >= 16.4 && t < 16.65;
    const pressSave = t >= 20.0 && t < 20.25;
    const field = (w, text, on) => /*#__PURE__*/React.createElement("div", {
      style: {
        width: w,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        borderRadius: 8,
        border: `1px solid ${on ? C.teal : C.field}`,
        background: on ? C.tealFill : '#fff',
        fontSize: 15,
        color: C.ink
      }
    }, text);
    const view = (y, from, wte, ltft, o = 1) => /*#__PURE__*/React.createElement("div", {
      style: at(24, y, {
        width: RW - 48,
        height: 44,
        borderBottom: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 15,
        opacity: o
      })
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.ink
      }
    }, from), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontWeight: 600,
        color: C.ink,
        fontVariantNumeric: 'tabular-nums'
      }
    }, wte), ltft ? /*#__PURE__*/React.createElement(Pill, {
      text: "LTFT",
      tone: "teal"
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 70,
        color: C.inkSoft,
        whiteSpace: 'nowrap'
      }
    }, "Full time"));
    return /*#__PURE__*/React.createElement("div", {
      style: at(RX, LT_Y, card({
        width: RW,
        height: LT_H
      }))
    }, cardTitle('LTFT & CCT'), !edit && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: at(206, 18, btnOutline(pressEdit, {
        height: 32,
        fontSize: 14,
        padding: '0 12px',
        width: 164
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 14,
      color: C.navy
    }), "Edit LTFT status"), /*#__PURE__*/React.createElement("div", {
      style: at(378, 18, btnOutline(false, {
        height: 32,
        fontSize: 14,
        padding: '0 12px',
        width: 150
      }))
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 14,
      color: C.navy
    }), "Edit end date")), /*#__PURE__*/React.createElement("div", {
      style: at(24, 62, {
        fontSize: 14,
        color: C.inkSoft
      })
    }, "Working pattern"), !edit && !saved && view(84, 'From 4 Aug 2021', '100%', false), saved && view(84, '4 Aug 2021 – 4 Aug 2026', '100%', false), saved && view(128, 'From 5 Aug 2026', '80%', true), edit && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: at(24, 86, {
        display: 'flex',
        gap: 10
      })
    }, field(200, '4 Aug 2021'), field(120, /*#__PURE__*/React.createElement(React.Fragment, null, "100%", /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 12,
      color: C.ink
    }))))), /*#__PURE__*/React.createElement("div", {
      style: at(24, 134, {
        display: 'flex',
        gap: 10,
        opacity: row2,
        transform: `translateY(${(1 - row2) * 8}px)`
      })
    }, field(200, '5 Aug 2026', true), field(120, /*#__PURE__*/React.createElement(React.Fragment, null, "80%", /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 12,
      color: C.ink
    }))), true)), /*#__PURE__*/React.createElement("div", {
      style: at(24, 196, {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 15,
        fontWeight: 500,
        color: C.navy
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14,
      color: C.navy
    }), "Add a spell"), /*#__PURE__*/React.createElement("div", {
      style: at(RW - 24 - 84 - 10 - 96, 186, {
        display: 'flex',
        gap: 10
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: btnOutline(false, {
        height: 40,
        width: 96
      })
    }, "Cancel"), /*#__PURE__*/React.createElement("div", {
      style: btnPrimary(pressSave, {
        height: 40,
        width: 84
      })
    }, "Save"))), /*#__PURE__*/React.createElement("div", {
      style: at(24, 238, {
        width: RW - 48,
        borderTop: `1px solid ${C.line}`,
        paddingTop: 14,
        display: 'flex',
        alignItems: 'baseline'
      })
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        color: C.inkSoft
      }
    }, "CCT date"), /*#__PURE__*/React.createElement(Flip, {
      from: cct.from,
      to: cct.to,
      p: cct.p,
      style: {
        marginLeft: 'auto',
        fontSize: 22,
        fontWeight: 600,
        color: C.ink,
        fontVariantNumeric: 'tabular-nums'
      }
    })));
  }
  function PauseDialog({
    t
  }) {
    if (t < 33.3 || t > 37.1) return null;
    const oIn = Easing.easeOutCubic(clamp((t - 33.3) / 0.35, 0, 1));
    const oOut = 1 - Easing.easeInCubic(clamp((t - 36.7) / 0.4, 0, 1));
    const o = Math.min(oIn, oOut);
    const press = t >= 36.5 && t < 36.75;
    const field = (label, value, w) => /*#__PURE__*/React.createElement("div", {
      style: {
        width: w
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: C.inkSoft,
        marginBottom: 6
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        borderRadius: 8,
        border: `1px solid ${C.field}`,
        fontSize: 15.5,
        color: C.ink
      }
    }, value));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: `rgba(19,39,63,${0.3 * o})`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: at(DLG.x, DLG.y, {
        width: DLG.w,
        height: DLG.h,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(19,39,63,.3)',
        padding: '22px 24px',
        opacity: o,
        transform: `scale(${0.94 + 0.06 * oIn})`
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 600,
        color: C.ink
      }
    }, "Add pause"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16
      }
    }, field('Reason', /*#__PURE__*/React.createElement(React.Fragment, null, "Parental leave", /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 14,
      color: C.ink
    }))), DLG.w - 48)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        marginTop: 14
      }
    }, field('Start date', '1 Nov 2026', (DLG.w - 60) / 2), field('End date', '3 Aug 2027', (DLG.w - 60) / 2)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: C.inkSoft,
        marginTop: 12,
        lineHeight: 1.35
      }
    }, "Training pauses from this date \u2014 pick a future date to schedule the pause in advance."), /*#__PURE__*/React.createElement("div", {
      style: at(DLG.w - 24 - 150 - 10 - 100, DLG.h - 62, {
        display: 'flex',
        gap: 10
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: btnOutline(false, {
        width: 100
      })
    }, "Cancel"), /*#__PURE__*/React.createElement("div", {
      style: btnPrimary(press, {
        width: 150
      })
    }, "Confirm pause"))));
  }
  function ProfileScreen({
    t
  }) {
    const scroll = kf(SCROLL, t, 's');
    const ltft = Easing.easeOutCubic(clamp((t - SAVE_AT - 0.2) / 0.5, 0, 1));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: '#fff'
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      active: "Trainees"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        top: TB_H,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        top: -TB_H - scroll,
        right: 0,
        height: 1500
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: at(CX, 92)
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Jonah Bekele",
      size: 48
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX + 62, 84, {
        fontSize: 28,
        fontWeight: 600,
        color: C.ink
      })
    }, "Jonah Bekele"), /*#__PURE__*/React.createElement("div", {
      style: at(CX + 62, 126, {
        display: 'flex',
        gap: 8
      })
    }, /*#__PURE__*/React.createElement(Pill, {
      text: "ST5"
    }), /*#__PURE__*/React.createElement(Pill, {
      text: "Active",
      tone: "success"
    }), ltft > 0 && /*#__PURE__*/React.createElement(Pill, {
      text: "LTFT 80%",
      tone: "teal",
      style: {
        opacity: ltft
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX + CW - 180 - 8 - 100 - 8 - 132, 97, {
        display: 'flex',
        gap: 8
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: btnOutline(false, {
        width: 132
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "edit",
      size: 16,
      color: C.navy
    }), "Edit details"), /*#__PURE__*/React.createElement("div", {
      style: btnOutline(false, {
        width: 100
      })
    }, "More", /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 14,
      color: C.navy
    })), /*#__PURE__*/React.createElement("div", {
      style: btnPrimary(false, {
        width: 180
      })
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 16,
      color: "#fff"
    }), "Manage allocations")), /*#__PURE__*/React.createElement(Timeline, {
      t: t
    }), /*#__PURE__*/React.createElement(Rotations, null), /*#__PURE__*/React.createElement(Exams, null), /*#__PURE__*/React.createElement(Details, null), /*#__PURE__*/React.createElement(TrainingStatus, {
      t: t
    }), /*#__PURE__*/React.createElement(LtftCard, {
      t: t
    }))), /*#__PURE__*/React.createElement(TopBar, {
      title: "Trainee",
      back: true
    }), /*#__PURE__*/React.createElement(PauseDialog, {
      t: t
    }));
  }

  // ── Film ─────────────────────────────────────────────────────────────────────
  function Film({
    showCaptions
  }) {
    const t = useTime();
    return /*#__PURE__*/React.createElement(FilmRoot, {
      t: t
    }, /*#__PURE__*/React.createElement(Camera, {
      t: t,
      cam: CAM
    }, /*#__PURE__*/React.createElement(AppWindow, null, /*#__PURE__*/React.createElement(ProfileScreen, {
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
      heading: "The trainee profile",
      kicker: "Product tour \xB7 LTFT, leave and the completion date"
    }), /*#__PURE__*/React.createElement(EndCard, {
      t: t,
      inAt: 65
    }));
  }
  function AdeptProfileVideo(props) {
    const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
    return /*#__PURE__*/React.createElement(Stage, {
      width: 1920,
      height: 1080,
      duration: 74,
      background: C.backdrop,
      persistKey: "adeptch3"
    }, /*#__PURE__*/React.createElement(Film, {
      showCaptions: showCaptions
    }));
  }
  window.AdeptProfileVideo = AdeptProfileVideo;
})();
