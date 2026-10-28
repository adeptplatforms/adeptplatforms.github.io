// Compiled from dashboard-video.jsx by scripts/site/site_compile_videos.js - edit the .jsx, not this.
// Adept — "Your programme at a glance" (Dashboard walkthrough, 75s, 1920x1080)
// Scene code for the animations.jsx engine. Exposes window.AdeptDashboardVideo.
// Redrawn 7 Oct 2026 for the app's redesign: "Needs your attention" first,
// three figures, trusts as rows in their own colours, then tasks and ARCPs.
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
    FilterChip,
    SectionTitle,
    QuietRow,
    Count,
    Figure,
    Swatch,
    CapBar,
    Avatar,
    PeriodSwitcher,
    ViewToggle,
    Tick,
    SearchField,
    trustColour
  } = window.AdeptKit;

  // ── Layout (window coordinates; film = window + WIN.x / WIN.y) ──────────────
  const CX = SB_W + PAD; // content left (272)
  const CW = WIN.w - SB_W - 2 * PAD; // content width (1404)
  const SW_Y = TB_H + 24; // period switcher top (88)
  const ATT_TITLE = 158,
    ATT_Y = 190,
    ROW = 56;
  const FIG_Y = 392;
  const TR_TITLE = 474,
    TR_Y = 510;
  const TK_TITLE = 950,
    TK_Y = 986,
    TK_ROW = 52;
  const AR_TITLE = 1290,
    AR_Y = 1326;
  const SCROLL_TO = 560;
  // Film coordinates the cursor aims at.
  const PREV = {
    x: WIN.x + CX + 20,
    y: WIN.y + SW_Y + 20
  };
  const NEXT = {
    x: WIN.x + CX + 40 + 150 + 20,
    y: WIN.y + SW_Y + 20
  };
  const UNALLOC_ROW = {
    x: WIN.x + CX + 320,
    y: WIN.y + ATT_Y + ROW / 2
  };

  // ── Data ─────────────────────────────────────────────────────────────────────
  const P = {
    aug: 'Aug 2026',
    feb: 'Feb 2027'
  };
  const ATTENTION = [{
    key: 'un',
    aug: 12,
    feb: 27,
    title: 'Unallocated this rotation',
    sub: p => `Trainees needing a placement for ${P[p]}`
  }, {
    key: 'over',
    aug: 1,
    feb: 0,
    title: 'Trust over capacity',
    titleNone: 'No trust over capacity',
    sub: p => p === 'aug' ? 'Skelton Bridge by 2' : 'Every trust within capacity'
  }, {
    key: 'cct',
    aug: 3,
    feb: 5,
    neutral: true,
    title: 'CCTs this period',
    sub: () => 'Complete training this period'
  }];
  const FIGURES = [{
    aug: '190',
    feb: '190',
    caption: 'trainees in this rotation'
  }, {
    aug: '18%',
    feb: '17%',
    caption: 'train less than full time'
  }, {
    aug: '176.4',
    feb: '175.8',
    caption: 'whole-time equivalents'
  }];
  const TRUSTS = [{
    name: 'Caldermere General',
    cap: 32,
    aug: 30,
    feb: 28
  }, {
    name: 'Ellerbeck Royal Infirmary',
    cap: 30,
    aug: 28,
    feb: 27
  }, {
    name: 'Skelton Bridge',
    cap: 24,
    aug: 26,
    feb: 20
  }, {
    name: 'Harewood Vale',
    cap: 20,
    aug: 18,
    feb: 16
  }, {
    name: 'Wharfemoor Park',
    cap: 28,
    aug: 26,
    feb: 25
  }, {
    name: 'Netherfield & District',
    cap: 26,
    aug: 24,
    feb: 22
  }, {
    name: 'Ousegate Teaching',
    cap: 30,
    aug: 26,
    feb: 25
  }];
  const TASKS_L = [['Finalise next rotation', 'Feb 2027', 'not'], ['Awaiting allocation', 'Aug 2026', 12], ['Awaiting allocation', 'Feb 2027', 27], ['ARCP date needed', 'Trainees without a next ARCP', 9], ['Training start date missing', 'Trainees', 0]];
  const TASKS_R = [['CCT date to confirm', 'Trainees', 4], ['Sites not added', 'Trusts', 0], ['Capacity not set', 'Trusts', 0], ['SIAs not recorded', 'Trusts', 2], ['Modules offered not set', 'Trusts', 0]];
  const ARCPS = [['14 Oct 2026', '3 booked: Jonah Bekele, Harleen Kaur, Tom Whitfield', 'Off-cycle'], ['9 Dec 2026', '4 booked: Ada Okafor, Sanjay Patel, Amara Adeyemi, Ravi Singh', 'Winter'], ['9 Jun 2027', 'No trainees booked yet', 'Summer']];
  const UNALLOC = [['Amara Adeyemi', 'CT2'], ['Jonah Bekele', 'ST5'], ['Eilis Brennan', 'CT1'], ['Michael Doyle', 'CT1'], ['Pervez Iqbal', 'ST5'], ['Harleen Kaur', 'ST4'], ['David Marsh', 'CT3'], ['Lena Novak', 'ST6'], ['Ada Okafor', 'CT2'], ['Sanjay Patel', 'CT3'], ['Ravi Singh', 'ST4'], ['Tom Whitfield', 'ST7']];

  // ── Timeline scripts ─────────────────────────────────────────────────────────
  const SWITCHES = [{
    t: 18.2,
    from: 'aug',
    to: 'feb'
  }, {
    t: 23.5,
    from: 'feb',
    to: 'aug'
  }];
  const CLICKS = [18.2, 23.5, 35.8];
  const CAPTIONS = [[6.8, 13.4, 'Every trainee, trust and date on one dashboard.'], [15.0, 25.8, 'Pick a rotation and the whole page follows.'], [28.0, 34.4, 'What needs your attention comes first.'], [38.2, 45.8, 'Unallocated opens the trainees still needing a place.'], [48.6, 54.9, 'Every trust’s capacity, in its own colour.'], [55.6, 59.4, 'Over capacity flags itself.'], [61.6, 67.2, 'Then your tasks and the next ARCP panels.']];
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
    t: 15.8,
    x: 1084,
    y: 340,
    z: 1.36
  }, {
    t: 26.4,
    x: 1084,
    y: 346,
    z: 1.36
  }, {
    t: 28.4,
    x: 1084,
    y: 330,
    z: 1.4
  }, {
    t: 35.9,
    x: 1084,
    y: 330,
    z: 1.4
  }, {
    t: 36.8,
    x: 960,
    y: 420,
    z: 1.22
  }, {
    t: 38.2,
    x: 960,
    y: 450,
    z: 1.12
  }, {
    t: 46.6,
    x: 960,
    y: 470,
    z: 1.12
  }, {
    t: 48.0,
    x: 1084,
    y: 700,
    z: 1.32
  }, {
    t: 49.6,
    x: 1084,
    y: 716,
    z: 1.34
  }, {
    t: 54.6,
    x: 1084,
    y: 720,
    z: 1.34
  }, {
    t: 56.4,
    x: 1084,
    y: WIN.y + TR_Y + 2 * ROW + ROW / 2,
    z: 1.36
  }, {
    t: 59.6,
    x: 1084,
    y: WIN.y + TR_Y + 2 * ROW + ROW / 2 + 4,
    z: 1.36
  }, {
    t: 61.6,
    x: 1084,
    y: 700,
    z: 1.3
  }, {
    t: 67.4,
    x: 1084,
    y: 706,
    z: 1.3
  }, {
    t: 69.9,
    x: 960,
    y: 540,
    z: 1
  }, {
    t: 75,
    x: 960,
    y: 540,
    z: 1
  }];
  // The page scrolls down to Tasks and ARCPs, as it would in the app.
  const SCROLL = [{
    t: 0,
    s: 0
  }, {
    t: 59.8,
    s: 0
  }, {
    t: 61.4,
    s: SCROLL_TO
  }, {
    t: 75,
    s: SCROLL_TO
  }];
  const CURSOR = [{
    t: 13.9,
    x: 900,
    y: 640,
    o: 0
  }, {
    t: 14.5,
    x: 900,
    y: 640,
    o: 1
  }, {
    t: 17.0,
    x: NEXT.x - 6,
    y: NEXT.y - 6,
    o: 1
  }, {
    t: 20.9,
    x: NEXT.x - 6,
    y: NEXT.y - 6,
    o: 1
  }, {
    t: 22.8,
    x: PREV.x - 6,
    y: PREV.y - 6,
    o: 1
  }, {
    t: 26.2,
    x: PREV.x - 6,
    y: PREV.y - 6,
    o: 1
  }, {
    t: 28.8,
    x: 1240,
    y: 330,
    o: 1
  }, {
    t: 32.6,
    x: 1240,
    y: 330,
    o: 1
  }, {
    t: 34.8,
    x: UNALLOC_ROW.x,
    y: UNALLOC_ROW.y,
    o: 1
  }, {
    t: 36.8,
    x: UNALLOC_ROW.x,
    y: UNALLOC_ROW.y,
    o: 1
  }, {
    t: 37.3,
    x: UNALLOC_ROW.x,
    y: UNALLOC_ROW.y + 40,
    o: 0
  }, {
    t: 38.8,
    x: 700,
    y: 640,
    o: 0
  }, {
    t: 39.4,
    x: 700,
    y: 640,
    o: 1
  }, {
    t: 41.6,
    x: 960,
    y: WIN.y + 340 + 3 * 53 + 26,
    o: 1
  }, {
    t: 45.6,
    x: 975,
    y: WIN.y + 340 + 3 * 53 + 30,
    o: 1
  }, {
    t: 46.5,
    x: 975,
    y: WIN.y + 340 + 3 * 53 + 30,
    o: 0
  }];
  function periodAt(t) {
    let from = 'aug',
      to = 'aug',
      last = -99;
    for (const s of SWITCHES) if (t >= s.t) {
      from = s.from;
      to = s.to;
      last = s.t;
    }
    const p = Easing.easeOutCubic(clamp((t - last) / 0.55, 0, 1));
    return {
      from,
      to,
      p,
      label: P[to],
      fromLabel: P[from]
    };
  }
  const at = (x, y, extra) => ({
    position: 'absolute',
    left: x,
    top: y,
    ...extra
  });

  // ── Dashboard ────────────────────────────────────────────────────────────────
  function AttentionRow({
    a,
    i,
    period,
    hl,
    hover,
    press
  }) {
    const n = a[period.to],
      nFrom = a[period.from];
    const lead = v => a.neutral ? /*#__PURE__*/React.createElement(Count, {
      n: v,
      tone: "neutral"
    }) : /*#__PURE__*/React.createElement(Count, {
      n: v
    });
    const title = n === 0 && a.titleNone ? a.titleNone : a.title;
    return /*#__PURE__*/React.createElement("div", {
      style: at(CX, ATT_Y + i * ROW, {
        width: CW,
        transform: press ? 'scale(0.99)' : 'none',
        transformOrigin: 'left center'
      })
    }, /*#__PURE__*/React.createElement(QuietRow, {
      hl: Math.max(hl, hover ? 1 : 0),
      lead: /*#__PURE__*/React.createElement(Flip, {
        from: lead(nFrom),
        to: lead(n),
        p: period.p,
        style: {}
      }),
      title: title,
      sub: /*#__PURE__*/React.createElement(Flip, {
        from: a.sub(period.from),
        to: a.sub(period.to),
        p: period.p,
        style: {}
      }),
      chevron: true
    }));
  }
  function TrustRow({
    tr,
    i,
    period,
    pulse
  }) {
    const from = tr[period.from],
      to = tr[period.to];
    const val = from + (to - from) * period.p;
    const over = to > tr.cap;
    const left = tr.cap - to;
    const sub = left >= 0 ? `${left} free` : `${-left} over capacity`;
    const subFrom = tr.cap - from >= 0 ? `${tr.cap - from} free` : `${from - tr.cap} over capacity`;
    return /*#__PURE__*/React.createElement("div", {
      style: at(CX, TR_Y + i * ROW, {
        width: CW,
        background: over && pulse > 0 ? `rgba(200,30,30,${0.07 * pulse})` : 'transparent'
      })
    }, /*#__PURE__*/React.createElement(QuietRow, {
      lead: /*#__PURE__*/React.createElement(Swatch, {
        name: tr.name
      }),
      title: tr.name,
      sub: /*#__PURE__*/React.createElement(Flip, {
        from: subFrom,
        to: sub,
        p: period.p,
        style: {}
      }),
      trail: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 28
        }
      }, /*#__PURE__*/React.createElement(CapBar, {
        value: val,
        cap: tr.cap,
        color: trustColour(tr.name)
      }), /*#__PURE__*/React.createElement(Flip, {
        from: `${from} of ${tr.cap}`,
        to: `${to} of ${tr.cap}`,
        p: period.p,
        style: {
          width: 80,
          textAlign: 'right',
          fontSize: 15.5,
          fontWeight: over ? 600 : 400,
          color: over ? C.error : C.ink,
          fontVariantNumeric: 'tabular-nums',
          transform: `scale(${over ? 1 + 0.06 * pulse : 1})`,
          transformOrigin: 'right center'
        }
      }))
    }));
  }
  function TaskRow({
    x,
    y,
    w,
    row
  }) {
    const [title, sub, v] = row;
    const trail = v === 'not' ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: C.warning,
        fontSize: 15,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more",
      size: 18,
      color: C.warning,
      sw: 2.4
    }), "Not finalised") : v === 0 ? /*#__PURE__*/React.createElement(Count, {
      n: 0
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15.5,
        color: C.ink,
        fontVariantNumeric: 'tabular-nums'
      }
    }, v);
    return /*#__PURE__*/React.createElement("div", {
      style: at(x, y, {
        width: w
      })
    }, /*#__PURE__*/React.createElement(QuietRow, {
      title: title,
      sub: sub,
      trail: trail,
      height: TK_ROW,
      style: {
        padding: '0 8px'
      }
    }));
  }
  function DashboardScreen({
    t,
    period
  }) {
    const hlFor = i => {
      const s = 28.4 + i * 1.6;
      const p = clamp((t - s) / 1.4, 0, 1);
      return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI);
    };
    const hoverUn = t >= 34.6 && t < 36.6;
    const pressUn = t >= 35.8 && t < 36.1;
    const pressNext = t >= 18.2 && t < 18.45;
    const pressPrev = t >= 23.5 && t < 23.75;
    const pulse = t >= 55.6 && t <= 59.4 ? Math.sin((t - 55.6) * 2.6) * 0.5 + 0.5 : 0;
    const scroll = kf(SCROLL, t, 's');
    const colW = (CW - 32) / 2;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: '#fff'
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      active: "Dashboard"
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
        height: 1600
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: at(CX, SW_Y)
    }, /*#__PURE__*/React.createElement(PeriodSwitcher, {
      label: /*#__PURE__*/React.createElement(Flip, {
        from: `${period.fromLabel} rotation`,
        to: `${period.label} rotation`,
        p: period.p,
        style: {}
      }),
      pressPrev: pressPrev,
      pressNext: pressNext
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, ATT_TITLE, {
        width: CW
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "Needs your attention"
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, ATT_Y, {
        width: CW,
        borderTop: `1px solid ${C.line}`
      })
    }), ATTENTION.map((a, i) => /*#__PURE__*/React.createElement(AttentionRow, {
      key: a.key,
      a: a,
      i: i,
      period: period,
      hl: hlFor(i),
      hover: i === 0 && hoverUn,
      press: i === 0 && pressUn
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX + 2, FIG_Y, {
        display: 'flex',
        gap: 52
      })
    }, FIGURES.map(f => /*#__PURE__*/React.createElement(Figure, {
      key: f.caption,
      caption: f.caption,
      value: /*#__PURE__*/React.createElement(Flip, {
        from: f[period.from],
        to: f[period.to],
        p: period.p,
        style: {}
      })
    }))), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TR_TITLE, {
        width: CW
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "Hospital trusts",
      arrow: true
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TR_Y, {
        width: CW,
        borderTop: `1px solid ${C.line}`
      })
    }), TRUSTS.map((tr, i) => /*#__PURE__*/React.createElement(TrustRow, {
      key: tr.name,
      tr: tr,
      i: i,
      period: period,
      pulse: pulse
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TK_TITLE, {
        width: CW
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "Tasks",
      arrow: true,
      right: "54 open"
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TK_Y, {
        width: colW,
        borderTop: `1px solid ${C.line}`
      })
    }), /*#__PURE__*/React.createElement("div", {
      style: at(CX + colW + 32, TK_Y, {
        width: colW,
        borderTop: `1px solid ${C.line}`
      })
    }), TASKS_L.map((r, i) => /*#__PURE__*/React.createElement(TaskRow, {
      key: `l${i}`,
      x: CX,
      y: TK_Y + i * TK_ROW,
      w: colW,
      row: r
    })), TASKS_R.map((r, i) => /*#__PURE__*/React.createElement(TaskRow, {
      key: `r${i}`,
      x: CX + colW + 32,
      y: TK_Y + i * TK_ROW,
      w: colW,
      row: r
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, AR_TITLE, {
        width: CW
      })
    }, /*#__PURE__*/React.createElement(SectionTitle, {
      text: "ARCPs",
      arrow: true
    })), /*#__PURE__*/React.createElement("div", {
      style: at(CX, AR_Y, {
        width: CW,
        borderTop: `1px solid ${C.line}`
      })
    }), ARCPS.map(([d, sub, season], i) => /*#__PURE__*/React.createElement("div", {
      key: d,
      style: at(CX, AR_Y + i * ROW, {
        width: CW
      })
    }, /*#__PURE__*/React.createElement(QuietRow, {
      title: d,
      sub: sub,
      trail: /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 15,
          color: C.inkSoft
        }
      }, season)
    }))))), /*#__PURE__*/React.createElement(TopBar, {
      title: "Dashboard",
      right: /*#__PURE__*/React.createElement("span", null, "Northdale Deanery \xB7 Anaesthetics")
    }));
  }

  // ── Trainees, filtered to the unallocated ────────────────────────────────────
  function TraineesScreen({
    t,
    enterT
  }) {
    const TBL = 300,
      HEAD = 40,
      R = 53;
    const cols = {
      tick: 12,
      name: 48,
      grade: 360,
      trust: 500,
      notes: 800
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: '#fff'
      }
    }, /*#__PURE__*/React.createElement(Sidebar, {
      active: "Trainees"
    }), /*#__PURE__*/React.createElement(TopBar, {
      title: "Trainees",
      right: /*#__PURE__*/React.createElement("span", null, "12 of 190 shown")
    }), /*#__PURE__*/React.createElement("div", {
      style: at(CX, SW_Y, {
        width: CW,
        display: 'flex',
        alignItems: 'center',
        gap: 14
      })
    }, /*#__PURE__*/React.createElement(SearchField, {
      width: 420
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        color: C.inkSoft
      }
    }, "Sort by"), /*#__PURE__*/React.createElement(FilterChip, {
      text: "Surname",
      on: true
    }), /*#__PURE__*/React.createElement(FilterChip, {
      text: "Grade"
    }), /*#__PURE__*/React.createElement(FilterChip, {
      text: "Hospital"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(PeriodSwitcher, {
      label: "Aug 2026",
      minW: 110
    }), /*#__PURE__*/React.createElement(ViewToggle, null))), /*#__PURE__*/React.createElement("div", {
      style: at(CX, 156, {
        width: CW,
        height: 116,
        border: `1px solid ${C.line}`,
        borderRadius: 8,
        padding: '14px 18px'
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 15,
        color: C.inkSoft
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "filter",
      size: 16,
      color: C.inkSoft
    }), "Filters", /*#__PURE__*/React.createElement(Icon, {
      name: "down",
      size: 14,
      color: C.inkSoft
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        color: C.navy,
        fontWeight: 500
      }
    }, "Clear filters")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 70,
        fontSize: 15,
        color: C.inkSoft
      }
    }, "Status"), /*#__PURE__*/React.createElement(FilterChip, {
      text: "All"
    }), /*#__PURE__*/React.createElement(FilterChip, {
      text: "Active"
    }), /*#__PURE__*/React.createElement(FilterChip, {
      text: "Paused"
    }), /*#__PURE__*/React.createElement(FilterChip, {
      text: "Unallocated",
      on: true
    }))), /*#__PURE__*/React.createElement("div", {
      style: at(CX, TBL, {
        width: CW,
        height: HEAD,
        borderBottom: `1px solid ${C.line}`,
        fontSize: 15,
        color: C.inkSoft
      })
    }, [['Name', cols.name], ['Grade', cols.grade], ['Trust this rotation', cols.trust], ['Notes', cols.notes]].map(([h, x]) => /*#__PURE__*/React.createElement("span", {
      key: h,
      style: {
        position: 'absolute',
        left: x,
        top: 10
      }
    }, h))), UNALLOC.map(([name, grade], i) => {
      const e = Easing.easeOutCubic(clamp((t - enterT - 0.2 - i * 0.05) / 0.4, 0, 1));
      return /*#__PURE__*/React.createElement("div", {
        key: name,
        style: at(CX, TBL + HEAD + i * R, {
          width: CW,
          height: R,
          borderBottom: `1px solid ${C.line}`,
          opacity: e,
          transform: `translateY(${(1 - e) * 10}px)`
        })
      }, /*#__PURE__*/React.createElement("div", {
        style: at(cols.tick, 17)
      }, /*#__PURE__*/React.createElement(Tick, null)), /*#__PURE__*/React.createElement("div", {
        style: at(cols.name - 4, 10)
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: name
      })), /*#__PURE__*/React.createElement("span", {
        style: at(cols.name + 38, 15, {
          fontSize: 15.5,
          fontWeight: 600,
          color: C.ink
        })
      }, name), /*#__PURE__*/React.createElement("span", {
        style: at(cols.grade, 15, {
          fontSize: 15.5,
          color: C.ink
        })
      }, grade), /*#__PURE__*/React.createElement("span", {
        style: at(cols.trust, 15, {
          fontSize: 15.5,
          color: C.inkSoft
        })
      }, "No placement"), (i === 5 || i === 10) && /*#__PURE__*/React.createElement("div", {
        style: at(cols.notes, 13)
      }, /*#__PURE__*/React.createElement(Pill, {
        text: "LTFT 80%",
        tone: "teal"
      })));
    }));
  }

  // ── Film ─────────────────────────────────────────────────────────────────────
  function Film({
    showCaptions
  }) {
    const t = useTime();
    const period = periodAt(t);
    const dash1O = t < 36.2 ? 1 : 1 - Easing.easeInCubic(clamp((t - 36.2) / 0.5, 0, 1));
    const trainO = Math.min(Easing.easeOutCubic(clamp((t - 36.5) / 0.5, 0, 1)), 1 - Easing.easeInCubic(clamp((t - 47.0) / 0.5, 0, 1)));
    const dash2O = Easing.easeOutCubic(clamp((t - 47.3) / 0.5, 0, 1));
    const dashO = Math.max(dash1O, dash2O);
    return /*#__PURE__*/React.createElement(FilmRoot, {
      t: t
    }, /*#__PURE__*/React.createElement(Camera, {
      t: t,
      cam: CAM
    }, /*#__PURE__*/React.createElement(AppWindow, null, dashO > 0.01 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: dashO
      }
    }, /*#__PURE__*/React.createElement(DashboardScreen, {
      t: t,
      period: period
    })), trainO > 0.01 && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: trainO
      }
    }, /*#__PURE__*/React.createElement(TraineesScreen, {
      t: t,
      enterT: 36.5
    }))), /*#__PURE__*/React.createElement(Cursor, {
      t: t,
      path: CURSOR,
      clicks: CLICKS
    })), /*#__PURE__*/React.createElement(Captions, {
      t: t,
      list: CAPTIONS,
      show: showCaptions
    }), /*#__PURE__*/React.createElement(TitleCard, {
      t: t,
      heading: "Your programme at a glance",
      kicker: "Product tour \xB7 the dashboard"
    }), /*#__PURE__*/React.createElement(EndCard, {
      t: t,
      inAt: 70.2
    }));
  }
  function AdeptDashboardVideo(props) {
    const showCaptions = !(props.showCaptions === false || props.showCaptions === 'false');
    return /*#__PURE__*/React.createElement(Stage, {
      width: 1920,
      height: 1080,
      duration: 75,
      background: C.backdrop,
      persistKey: "adeptdash"
    }, /*#__PURE__*/React.createElement(Film, {
      showCaptions: showCaptions
    }));
  }
  window.AdeptDashboardVideo = AdeptDashboardVideo;
})();
