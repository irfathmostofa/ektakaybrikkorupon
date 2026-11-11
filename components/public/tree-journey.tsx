"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { formatNumber } from "@/lib/i18n/format";

/* -------------------------------------------------------------------------- */
/*  Timeline constants                                                         */
/* -------------------------------------------------------------------------- */

/** Tree is fully grown at this share of the pinned scroll; the rest is a glowing hold. */
const END = 0.88;
/** Growth progress (0..1) where the seed stage ends and the sapling stage ends. */
const F1 = 0.26;
const F2 = 0.58;
/** Share of the pinned scroll used to show the hero info before the tree starts growing. */
const INTRO = 0.22;
/** Scene (tree, HUD, cards) starts fading in while the hero is still dissolving. */
const SCENE_IN = 0.08;
/** Scene is fully visible at this share of the pinned scroll. */
const SCENE_READY = 0.26;
/** Scroll targets (growth progress) for the stage buttons. */
const STAGE_GOALS = [0.2, 0.5, 1] as const;
/** Desktop tree offset per stage, as a share of the stage width. */
const OFFSETS = [0.2, -0.2, 0.2] as const;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number, a: number, b: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerpPoints = (g: number, pts: ReadonlyArray<readonly [number, number]>) => {
  if (g <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (g <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      return y0 + ((y1 - y0) * (g - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
};

const ease = {
  none: (t: number) => t,
  in: (t: number) => t * t,
  out: (t: number) => 1 - (1 - t) * (1 - t),
  back: (t: number) => {
    const s = 1.7;
    return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
  },
  back2: (t: number) => {
    const s = 2;
    return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
  },
};

type Track = {
  el: SVGElement;
  a: number;
  b: number;
  ease: (t: number) => number;
  apply: (el: SVGElement, v: number) => void;
  v: number;
};

const applyScale = (el: SVGElement, v: number) => {
  el.setAttribute("transform", `scale(${v})`);
  el.setAttribute("visibility", v <= 0.001 ? "hidden" : "visible");
};
const applyDraw = (el: SVGElement, v: number) => {
  el.setAttribute("stroke-dashoffset", String(1 - v));
  el.setAttribute("visibility", v <= 0.001 ? "hidden" : "visible");
};

/* -------------------------------------------------------------------------- */
/*  Static SVG art                                                             */
/* -------------------------------------------------------------------------- */

function Leaf({ x, y, r, grp }: { x: number; y: number; r: number; grp: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g data-grp={grp} transform="scale(0)" visibility="hidden">
        <g className="tj-sw" style={{ animationDelay: `${-(((x * 7 + y * 3) % 25) / 10)}s` }}>
          <circle cy={r * 0.12} r={r} fill="url(#tj-gd)" />
          <circle cx={-r * 0.5} cy={r * 0.3} r={r * 0.72} fill="url(#tj-gm)" />
          <circle cx={r * 0.52} cy={-r * 0.2} r={r * 0.68} fill="url(#tj-gm)" />
          <circle cx={r * 0.2} cy={-r * 0.5} r={r * 0.5} fill="url(#tj-gl)" />
          <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.28} fill="#dcebc0" opacity={0.75} />
        </g>
      </g>
    </g>
  );
}

function Mini({ x, h }: { x: number; h: number }) {
  return (
    <g transform={`translate(${x} 600)`}>
      <g data-grp="mini" transform="scale(0)" visibility="hidden">
        <rect x={-4} y={-h} width={8} height={h} rx={3} fill="#7b5d43" />
        <circle cx={0} cy={-h - 6} r={h * 0.42} fill="url(#tj-gm)" />
        <circle cx={h * 0.18} cy={-h - h * 0.2} r={h * 0.28} fill="url(#tj-gl)" />
      </g>
    </g>
  );
}

function Seedling({ flip }: { flip: 1 | -1 }) {
  return (
    <g transform={`translate(200 498) scale(${flip} 1) rotate(20)`}>
      <g data-grp="s1" transform="scale(0)" visibility="hidden">
        <path d="M0 0 C-3 -16 -24 -22 -34 -12 C-24 3 -8 7 0 0Z" fill="url(#tj-gm)" />
        <path
          d="M-2 -1 C-12 -6 -22 -9 -30 -11"
          stroke="#d6e8b8"
          strokeWidth={1.2}
          fill="none"
          opacity={0.7}
        />
      </g>
    </g>
  );
}

function Tuft({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 602)`}>
      <g data-grp="gr" transform="scale(0)" visibility="hidden">
        <path
          d="M0 0 q-3-14-10-20 M0 0 q1-18 3-26 M0 0 q4-12 11-18"
          stroke="#9cc585"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function Branch({ d, w, grp }: { d: string; w: number; grp: string }) {
  return (
    <path
      data-grp={grp}
      pathLength={1}
      d={d}
      fill="none"
      stroke="#7b5d43"
      strokeWidth={w}
      strokeLinecap="round"
      strokeDasharray={1}
      strokeDashoffset={1}
      visibility="hidden"
    />
  );
}

const HAND_SKIN = "#f3c4a0";
const COIN_X = 208;
const COIN_Y = 54;

function DonateHandBack() {
  return (
    <g id="tj-hand-back" data-hand="" aria-hidden="true">
      <g className="tj-hand-idle">
        <g fill={HAND_SKIN} stroke={HAND_SKIN} strokeLinecap="round" strokeLinejoin="round">
          <path d="M200 -96 L200 16" fill="none" strokeWidth={32} />
          <ellipse cx={194} cy={18} rx={24} ry={20} stroke="none" />
          <path d="M176 22 C162 32 154 48 160 66" fill="none" strokeWidth={12} />
          <path d="M188 26 C176 40 172 58 178 76" fill="none" strokeWidth={13} />
          <path d="M200 28 C192 44 192 62 198 80" fill="none" strokeWidth={13} />
        </g>
      </g>
    </g>
  );
}

function DonateHandFront() {
  return (
    <g id="tj-hand-front" data-hand="" aria-hidden="true">
      <g className="tj-hand-idle">
        <path
          d="M216 8 C234 10 246 26 238 46 C232 60 218 64 210 56"
          fill="none"
          stroke={HAND_SKIN}
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function Fruit({ x, y, gold }: { x: number; y: number; gold: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g data-grp="fr" transform="scale(0)" visibility="hidden">
        <circle
          className="tj-fglow"
          r={17}
          fill="url(#tj-fg)"
          style={{ animationDelay: `${-((x + y) % 30) / 10}s` }}
        />
        {gold ? (
          <>
            <circle r={7} fill="#e8b672" />
            <circle cx={-2} cy={-2} r={2.4} fill="#f7e3b0" />
          </>
        ) : (
          <>
            <circle r={6} fill="#f1b9c4" />
            <circle r={2.6} fill="#f8e7a8" />
          </>
        )}
      </g>
    </g>
  );
}

const SPARKS: ReadonlyArray<readonly [number, number, number]> = [
  [110, 95, 1],
  [300, 110, 1.2],
  [70, 205, 0.9],
  [335, 235, 1.1],
  [200, 8, 1.3],
  [255, 52, 0.8],
  [148, 38, 1],
  [362, 165, 0.9],
  [38, 130, 1],
  [196, 300, 0.8],
];

const TreeArt = memo(function TreeArt({ label }: { label: string }) {
  return (
    <svg viewBox="-200 0 800 600" role="img" aria-label={label} className="tj-svg">
      <defs>
        <linearGradient id="tj-bark" gradientUnits="userSpaceOnUse" x1="184" x2="216" y1="0" y2="0">
          <stop offset="0" stopColor="#5a4230" />
          <stop offset=".45" stopColor="#8d6e50" />
          <stop offset=".75" stopColor="#a58463" />
          <stop offset="1" stopColor="#5a4230" />
        </linearGradient>
        <radialGradient id="tj-gd" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#5a8a56" />
          <stop offset="1" stopColor="#3d6843" />
        </radialGradient>
        <radialGradient id="tj-gm" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#8bb877" />
          <stop offset="1" stopColor="#68995c" />
        </radialGradient>
        <radialGradient id="tj-gl" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#c2dca4" />
          <stop offset="1" stopColor="#9cc585" />
        </radialGradient>
        <radialGradient id="tj-sh">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tj-halo">
          <stop offset="0" stopColor="#fff3c4" stopOpacity=".95" />
          <stop offset=".45" stopColor="#ffe08a" stopOpacity=".45" />
          <stop offset="1" stopColor="#ffd56b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tj-fg">
          <stop offset="0" stopColor="#fff0b0" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffd56b" stopOpacity="0" />
        </radialGradient>
        <clipPath id="tj-tc">
          <rect id="tj-tr" x="150" y="600" width="100" height="0" />
        </clipPath>
      </defs>

      <ellipse cx="200" cy="602" rx="150" ry="16" fill="url(#tj-sh)" />
      <path
        d="M150 606 C165 590 185 584 200 584 C215 584 235 590 250 606Z"
        fill="#8d6e50"
        opacity={0.55}
      />
      <Tuft x={112} />
      <Tuft x={150} />
      <Tuft x={168} />
      <Tuft x={236} />
      <Tuft x={256} />
      <Tuft x={292} />
      <Mini x={-130} h={95} />
      <Mini x={-55} h={62} />
      <Mini x={445} h={85} />
      <Mini x={525} h={58} />

      <g id="tj-tg">
        {/* glow halo behind the crown, revealed in the finale */}
        <circle className="tj-halo" cx={200} cy={150} r={270} fill="url(#tj-halo)" />

        <path
          d="M178 604 C190 590 192 575 190 550 L210 550 C208 575 212 590 224 604Z"
          fill="url(#tj-bark)"
        />
        <g clipPath="url(#tj-tc)">
          <path
            d="M184 604 C190 540 192 470 191 400 C190 330 194 270 195 214 Q200 208 205 214 C206 270 210 330 209 400 C208 470 212 540 218 604Z"
            fill="url(#tj-bark)"
          />
          <path
            d="M193 590 C191 510 197 430 194 330"
            stroke="#4a3424"
            strokeWidth={1.6}
            fill="none"
            opacity={0.3}
            strokeLinecap="round"
          />
          <path
            d="M200 560 C199 480 203 400 200 300"
            stroke="#4a3424"
            strokeWidth={1.2}
            fill="none"
            opacity={0.22}
            strokeLinecap="round"
          />
          <path
            d="M208 590 C208 510 210 430 206 330"
            stroke="#d4b58c"
            strokeWidth={2}
            fill="none"
            opacity={0.3}
            strokeLinecap="round"
          />
        </g>

        <Branch grp="b1" w={9} d="M199 470 C170 440 140 430 110 400" />
        <Branch grp="b2" w={9} d="M201 430 C235 405 270 395 300 360" />
        <Branch grp="b3" w={8} d="M199 360 C165 330 150 300 130 260" />
        <Branch grp="b4" w={8} d="M200 320 C235 290 255 260 275 215" />
        <Branch grp="b56" w={6} d="M200 240 C190 210 185 190 170 160" />
        <Branch grp="b56" w={6} d="M200 230 C212 200 222 180 240 150" />

        <Seedling flip={1} />
        <Seedling flip={-1} />

        <Leaf x={110} y={400} r={26} grp="s2" />
        <Leaf x={300} y={360} r={28} grp="s2" />
        <Leaf x={200} y={372} r={22} grp="s2" />
        <Leaf x={130} y={258} r={30} grp="s2b" />
        <Leaf x={275} y={215} r={32} grp="s3" />
        <Leaf x={170} y={160} r={34} grp="s3" />
        <Leaf x={240} y={150} r={34} grp="s3" />
        <Leaf x={150} y={205} r={44} grp="s3" />
        <Leaf x={255} y={190} r={46} grp="s3" />
        <Leaf x={200} y={215} r={40} grp="s3" />
        <Leaf x={200} y={140} r={54} grp="s3" />
        <Leaf x={205} y={85} r={42} grp="s3" />

        <Fruit x={120} y={190} gold={false} />
        <Fruit x={290} y={170} gold={false} />
        <Fruit x={178} y={112} gold={false} />
        <Fruit x={232} y={92} gold={false} />
        <Fruit x={206} y={50} gold={false} />
        <Fruit x={160} y={235} gold />
        <Fruit x={262} y={238} gold />
        <Fruit x={215} y={175} gold />
        <Fruit x={142} y={150} gold />
        <Fruit x={280} y={135} gold />

        {SPARKS.map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path
              className="tj-spark"
              style={{ animationDelay: `${-i * 0.45}s` }}
              d="M0-8 L1.8-1.8 L8 0 L1.8 1.8 L0 8 L-1.8 1.8 L-8 0 L-1.8-1.8Z"
              fill="#fff6cf"
            />
          </g>
        ))}
      </g>

      <DonateHandBack />
      <g id="tj-coin">
        <circle cx={COIN_X} cy={COIN_Y} r="28" fill="url(#tj-fg)" />
        <circle cx={COIN_X} cy={COIN_Y} r="15" fill="#e6c071" stroke="#c99a45" strokeWidth={2.5} />
        <circle cx={COIN_X} cy={COIN_Y} r="10.5" fill="none" stroke="#f7e6b8" strokeWidth={1.2} opacity={0.85} />
        <text
          x={COIN_X}
          y={COIN_Y + 6}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#8a6a2a"
          fontFamily="Georgia,serif"
        >
          ৳
        </text>
      </g>
      <DonateHandFront />
    </svg>
  );
});

/* -------------------------------------------------------------------------- */
/*  Decorations                                                                */
/* -------------------------------------------------------------------------- */

const CLOUDS = [
  { top: "9%", scale: 1.1, dur: 110, delay: -20 },
  { top: "22%", scale: 0.7, dur: 150, delay: -90 },
  { top: "34%", scale: 1.3, dur: 180, delay: -140 },
  { top: "16%", scale: 0.9, dur: 130, delay: -60 },
];

const BIRDS = [
  { top: "14%", w: 28, dur: 36, delay: -5 },
  { top: "24%", w: 20, dur: 44, delay: -22 },
  { top: "9%", w: 24, dur: 40, delay: -30 },
];

const FIREFLIES = [
  [8, 62, 0], [14, 38, 1.3], [22, 74, 2.1], [30, 28, 0.6], [38, 55, 3.2],
  [46, 20, 1.8], [54, 70, 2.6], [62, 34, 0.9], [70, 60, 3.6], [78, 24, 1.5],
  [84, 72, 2.9], [90, 44, 0.3], [18, 52, 3.9], [66, 80, 1.1], [96, 62, 2.4],
] as const;

type Burst = {
  id: number;
  x: number;
  y: number;
  items: { dx: number; dy: number; rot: number; leaf: boolean; s: number }[];
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function TreeJourney({
  locale,
  dict,
  hero,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Hero content (background + text). Shown first inside the pinned stage, then fades out to reveal the tree. */
  hero?: ReactNode;
}) {
  const t = dict.treeJourney;
  const embedded = Boolean(hero);
  const heroRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLSpanElement>(null);
  const goalRef = useRef<(i: number) => void>(() => {});
  const [stage, setStage] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstId = useRef(0);
  const timers = useRef<number[]>([]);

  const hudText = useCallback(
    (g: number) => {
      if (g < F1) {
        const n = Math.max(1, Math.round(1 + (29 * g) / F1));
        return t.hudSaved.replace("{n}", formatNumber(locale, n));
      }
      if (g < F2) return t.hudTree;
      const n = Math.round((t.hudForestMax * (g - F2)) / (1 - F2));
      return t.hudForest.replace("{n}", formatNumber(locale, n));
    },
    [locale, t],
  );

  /* ---- scroll-driven growth timeline ---- */
  useEffect(() => {
    const track = trackRef.current;
    const stageEl = stageRef.current;
    const tree = treeRef.current;
    if (!track || !stageEl || !tree) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wideMq = window.matchMedia("(min-width: 900px)");
    const d1 = F1;
    const d2 = F2 - F1;
    const d3 = 1 - F2;

    const tracks: Track[] = [];
    const add = (
      grp: string,
      start: number,
      dur: number,
      stagger: number,
      fn: (t: number) => number,
      apply: Track["apply"],
    ) => {
      tree.querySelectorAll<SVGElement>(`[data-grp="${grp}"]`).forEach((el, i) => {
        const a = start + i * stagger;
        tracks.push({ el, a, b: a + dur, ease: fn, apply, v: NaN });
      });
    };

    // seed stage
    add("s1", d1 * 0.72, d1 * 0.22, d1 * 0.05, ease.back2, applyScale);
    // sapling stage
    add("gr", F1 + d2 * 0.15, d2 * 0.3, d2 * 0.04, ease.back, applyScale);
    add("b1", F1 + d2 * 0.1, d2 * 0.45, 0, ease.none, applyDraw);
    add("b2", F1 + d2 * 0.15, d2 * 0.45, 0, ease.none, applyDraw);
    add("s2", F1 + d2 * 0.45, d2 * 0.25, d2 * 0.06, ease.back, applyScale);
    add("b3", F1 + d2 * 0.6, d2 * 0.35, 0, ease.none, applyDraw);
    add("s2b", F1 + d2 * 0.85, d2 * 0.2, 0, ease.back, applyScale);
    // full tree stage
    add("b4", F2 + d3 * 0.08, d3 * 0.2, 0, ease.none, applyDraw);
    add("b56", F2 + d3 * 0.4, d3 * 0.2, d3 * 0.03, ease.none, applyDraw);
    add("s3", F2 + d3 * 0.2, d3 * 0.2, d3 * 0.04, ease.back, applyScale);
    add("fr", F2 + d3 * 0.6, d3 * 0.12, d3 * 0.02, ease.back2, applyScale);
    add("mini", F2 + d3 * 0.45, d3 * 0.2, d3 * 0.06, ease.back, applyScale);

    const trunk = tree.querySelector<SVGRectElement>("#tj-tr");
    const group = tree.querySelector<SVGGElement>("#tj-tg");
    const coin = tree.querySelector<SVGGElement>("#tj-coin");
    const hands = tree.querySelectorAll<SVGGElement>("[data-hand]");

    let topPx = 0;
    let stageW = 0;
    let wide = wideMq.matches;
    let target = 0;
    let cur = 0;
    let scrollP = 0;
    let curP = 0;
    let raf = 0;
    let lastStage = -1;
    let lastHud = "";
    let lastHeroVis = true;

    const heroEl = heroRef.current;
    const applyHero = (p: number) => {
      if (!heroEl) return;
      const o = 1 - smooth(p, 0, INTRO);
      const lift = smooth(p, 0, INTRO);
      heroEl.style.opacity = o.toFixed(3);
      heroEl.style.transform = `translate3d(0, ${(-18 * lift).toFixed(2)}px, 0) scale(${(1 - 0.035 * lift).toFixed(4)})`;
      const vis = o > 0.01;
      if (vis !== lastHeroVis) {
        lastHeroVis = vis;
        heroEl.style.visibility = vis ? "visible" : "hidden";
      }
      heroEl.style.pointerEvents = o < 0.55 ? "none" : "auto";
      stageEl.style.setProperty("--tj-intro", o.toFixed(3));
      stageEl.style.setProperty("--tj-scene", smooth(p, SCENE_IN, SCENE_READY).toFixed(3));
    };

    const readTarget = () => {
      const r = track.getBoundingClientRect();
      const sh = stageEl.offsetHeight;
      const run = r.height - sh;
      if (heroEl) {
        if (run <= 1) {
          scrollP = 0;
          target = 0;
          return;
        }
        scrollP = clamp((topPx - r.top) / run);
        target = clamp(clamp((scrollP - INTRO) / (1 - INTRO)) / END);
        return;
      }
      const lead = sh * 0.3;
      const p = clamp((topPx - r.top + lead) / (run + lead));
      target = clamp(p / END);
    };

    const render = (g: number) => {
      for (const tr of tracks) {
        const raw = (g - tr.a) / (tr.b - tr.a);
        const v = tr.ease(raw <= 0 ? 0 : raw >= 1 ? 1 : raw);
        if (v !== tr.v) {
          tr.v = v;
          tr.apply(tr.el, v);
        }
      }

      if (trunk) {
        let y: number;
        if (g < d1 * 0.3) y = 600;
        else if (g < d1) y = 600 - 106 * ease.out((g - d1 * 0.3) / (d1 * 0.7));
        else if (g < F2) y = 494 + (365 - 494) * ((g - F1) / d2);
        else y = 365 + (200 - 365) * clamp((g - F2) / (d3 * 0.55));
        trunk.setAttribute("y", y.toFixed(1));
        trunk.setAttribute("height", (600 - y).toFixed(1));
      }

      if (group) {
        const s = lerpPoints(g, [[0, 0.45], [F1, 0.55], [F2, 0.8], [1, 1]]);
        group.setAttribute("transform", `translate(200 600) scale(${s.toFixed(4)}) translate(-200 -600)`);
      }

      if (coin) {
        const fall = clamp(g / (d1 * 0.3));
        const y = (600 - COIN_Y) * ease.in(fall);
        const fade = clamp((g - d1 * 0.3) / (d1 * 0.06));
        const s = 1 - 0.8 * fade;
        const rot = -18 * (1 - fall);
        coin.setAttribute(
          "transform",
          `translate(${COIN_X} ${(COIN_Y + y).toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(3)}) translate(${-COIN_X} ${-COIN_Y})`,
        );
        coin.setAttribute("opacity", String(1 - fade));
      }

      if (hands.length) {
        const release = clamp(g / (d1 * 0.22));
        const recede = ease.in(release);
        const op = 1 - smooth(g, 0, d1 * 0.28);
        const t = `translate(0 ${(-64 * recede).toFixed(1)})`;
        const vis = op <= 0.01 ? "hidden" : "visible";
        hands.forEach((el) => {
          el.setAttribute("transform", t);
          el.setAttribute("opacity", op.toFixed(3));
          el.setAttribute("visibility", vis);
        });
      }

      if (wide) {
        const o =
          OFFSETS[0] +
          (OFFSETS[1] - OFFSETS[0]) * smooth(g, F1 - 0.07, F1 + 0.03) +
          (OFFSETS[2] - OFFSETS[1]) * smooth(g, F2 - 0.07, F2 + 0.03);
        tree.style.transform = `translate3d(calc(-50% + ${(o * stageW).toFixed(1)}px),0,0)`;
      } else {
        tree.style.transform = "translate3d(-50%,0,0)";
      }

      stageEl.style.setProperty("--tj-glow", smooth(g, F2 + d3 * 0.25, 1).toFixed(3));

      const text = hudText(g);
      if (hudRef.current && text !== lastHud) {
        lastHud = text;
        hudRef.current.textContent = text;
      }

      const s = g < F1 ? 0 : g < F2 ? 1 : 2;
      if (s !== lastStage) {
        lastStage = s;
        setStage(s);
      }
    };

    const tick = () => {
      raf = 0;
      const d = target - cur;
      cur = reduce || Math.abs(d) < 0.00025 ? target : cur + d * 0.085;
      if (heroEl) {
        const dp = scrollP - curP;
        curP = reduce || Math.abs(dp) < 0.00025 ? scrollP : curP + dp * 0.1;
        applyHero(curP);
      }
      render(cur);
      if (cur !== target || (heroEl && curP !== scrollP)) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      topPx = parseFloat(getComputedStyle(stageEl).top) || 0;
      stageW = stageEl.clientWidth;
      wide = wideMq.matches;
      readTarget();
      cur = target;
      curP = scrollP;
      if (heroEl) applyHero(curP);
      render(cur);
    };

    const onScroll = () => {
      readTarget();
      kick();
    };

    goalRef.current = (i: number) => {
      const r = track.getBoundingClientRect();
      const sh = stageEl.offsetHeight;
      const run = Math.max(1, r.height - sh);
      const p = STAGE_GOALS[i] * END;
      let top: number;
      if (heroEl) {
        top = window.scrollY + r.top - topPx + (INTRO + p * (1 - INTRO)) * run;
      } else {
        const lead = sh * 0.3;
        top = window.scrollY + r.top - topPx - lead + p * (run + lead);
      }
      window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    };

    if (heroEl) {
      heroEl.style.opacity = "1";
      heroEl.style.visibility = "visible";
      heroEl.style.pointerEvents = "auto";
      heroEl.style.transform = "none";
      lastHeroVis = true;
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(stageEl);
    window.addEventListener("orientationchange", measure);
    let retry2 = 0;
    const retry1 = window.requestAnimationFrame(() => {
      measure();
      retry2 = window.requestAnimationFrame(measure);
    });

    return () => {
      window.cancelAnimationFrame(retry1);
      window.cancelAnimationFrame(retry2);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("orientationchange", measure);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hudText]);

  /* ---- pointer parallax (mouse only) ---- */
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      stageEl.style.setProperty("--px", px.toFixed(3));
      stageEl.style.setProperty("--py", py.toFixed(3));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = stageEl.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    stageEl.addEventListener("pointermove", move);
    return () => {
      stageEl.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  /* ---- tap / keyboard sparkle burst ---- */
  const sparkle = useCallback((x: number, y: number) => {
    const id = ++burstId.current;
    const items = Array.from({ length: 14 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.5;
      const d = 46 + Math.random() * 84;
      return {
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d - 34,
        rot: Math.random() * 360,
        leaf: i % 3 !== 0,
        s: 0.7 + Math.random() * 0.8,
      };
    });
    setBursts((b) => [...b.slice(-3), { id, x, y, items }]);
    timers.current.push(
      window.setTimeout(() => setBursts((b) => b.filter((item) => item.id !== id)), 1400),
    );
    shellRef.current?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-1.8deg)" },
        { transform: "rotate(1.4deg)" },
        { transform: "rotate(-0.7deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 650, easing: "ease-out" },
    );
  }, []);

  const onTreeClick = (e: ReactMouseEvent) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const r = scene.getBoundingClientRect();
    sparkle(e.clientX - r.left, e.clientY - r.top);
  };

  const onTreeKey = (e: ReactKeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const scene = sceneRef.current;
    const shell = shellRef.current;
    if (!scene || !shell) return;
    const s = scene.getBoundingClientRect();
    const r = shell.getBoundingClientRect();
    sparkle(r.left + r.width / 2 - s.left, r.top + r.height * 0.3 - s.top);
  };

  const stages = [
    { name: t.seedName, title: t.seedTitle, body: t.seedBody },
    { name: t.saplingName, title: t.saplingTitle, body: t.saplingBody },
    { name: t.treeName, title: t.treeTitle, body: t.treeBody },
  ];

  return (
    <section
      className="tj"
      aria-labelledby={embedded ? undefined : "tj-title"}
      aria-label={embedded ? t.title : undefined}
    >
      {embedded ? null : (
        <div className="tj-intro">
          <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">{t.eyebrow}</p>
          <h2 id="tj-title" className="mt-3 font-heading text-3xl text-balance md:text-5xl">
            {t.title}
          </h2>
          <p className="tj-hint">
            <span>{t.scrollHint}</span>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>
        </div>
      )}

      <div ref={trackRef} className="tj-track">
        <div
          ref={stageRef}
          className="tj-stage"
          data-stage={stage}
          data-hero={embedded ? "" : undefined}
          style={
            embedded
              ? ({ "--tj-intro": 1, "--tj-scene": 0 } as CSSProperties)
              : undefined
          }
        >
          {hero ? (
            <div ref={heroRef} className="tj-hero" style={{ opacity: 1, visibility: "visible" }}>
              {hero}
            </div>
          ) : null}
          <div ref={sceneRef} className="tj-scene">
            <div className="tj-sun" />
            {CLOUDS.map((c, i) => (
              <i
                key={i}
                className="tj-cloud"
                style={{
                  top: c.top,
                  transform: `scale(${c.scale})`,
                  animationDuration: `${c.dur}s`,
                  animationDelay: `${c.delay}s`,
                }}
              />
            ))}
            {BIRDS.map((b, i) => (
              <svg
                key={i}
                className="tj-bird"
                viewBox="0 0 30 12"
                aria-hidden="true"
                style={{
                  top: b.top,
                  width: b.w,
                  animationDuration: `${b.dur}s`,
                  animationDelay: `${b.delay}s`,
                }}
              >
                <path d="M1 8 Q8 0 15 7 Q22 0 29 8" />
              </svg>
            ))}

            <svg className="tj-hills" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
              <path fill="var(--tj-h2)" opacity=".7" d="M0 190 C200 120 420 200 700 170 C980 140 1200 100 1440 170 V300 H0Z" />
              <path fill="var(--tj-h1)" d="M0 160 C240 90 460 150 700 140 C940 130 1140 70 1440 130 V300 H0Z" />
            </svg>

            <div className="tj-flies" aria-hidden="true">
              {FIREFLIES.map(([x, y, d], i) => (
                <b
                  key={i}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    animationDelay: `${-d}s, ${-d * 0.7}s`,
                    animationDuration: `${6 + (i % 5)}s, ${2.4 + (i % 4) * 0.5}s`,
                  }}
                />
              ))}
            </div>

            <div ref={treeRef} className="tj-tree">
              <div className="tj-rays" aria-hidden="true" />
              <div
                ref={shellRef}
                className="tj-shell"
                role="button"
                tabIndex={0}
                aria-label={t.tapLabel}
                onClick={onTreeClick}
                onKeyDown={onTreeKey}
              >
                <TreeArt label={t.treeAlt} />
              </div>
              <p className="tj-tap" aria-hidden="true">
                ✦ {t.tapHint}
              </p>
            </div>

            <div className="tj-ground" aria-hidden="true" />

            <div className="tj-burst-layer" aria-hidden="true">
              {bursts.map((b) => (
                <div key={b.id} className="tj-burst" style={{ left: b.x, top: b.y }}>
                  <span className="tj-flash" />
                  <span className="tj-plus">+৳{formatNumber(locale, 1)}</span>
                  {b.items.map((p, i) => (
                    <span
                      key={i}
                      className={p.leaf ? "tj-p tj-p-leaf" : "tj-p tj-p-gold"}
                      style={
                        {
                          "--dx": `${p.dx}px`,
                          "--dy": `${p.dy}px`,
                          "--rot": `${p.rot}deg`,
                          "--s": p.s,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="tj-top">
              <div className="tj-hud" aria-live="off">
                <span ref={hudRef}>{hudText(0)}</span>
              </div>
              <nav className="tj-chips" aria-label={t.stageNav}>
                {stages.map((s, i) => (
                  <button
                    key={s.name}
                    type="button"
                    className="tj-chip"
                    data-state={i === stage ? "on" : i < stage ? "done" : "off"}
                    aria-current={i === stage ? "step" : undefined}
                    onClick={() => goalRef.current(i)}
                  >
                    <i aria-hidden="true" />
                    {s.name}
                  </button>
                ))}
              </nav>
            </div>

          </div>

          <div className="tj-cards">
            <div className="tj-cards-inner">
              {stages.map((s, i) => (
                <article
                  key={s.name}
                  className="tj-card"
                  data-i={i}
                  data-active={i === stage}
                  aria-hidden={i !== stage}
                >
                  <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
                    {s.name}
                  </p>
                  <h3 className="mt-2 font-heading text-xl text-balance md:text-3xl">{s.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-7 text-muted-foreground md:text-base md:leading-8">
                    {s.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
