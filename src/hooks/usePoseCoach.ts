import { useEffect, useRef, useState, type RefObject } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { evaluate, type Check, type Evaluation, type Pt } from "../lib/poseEngine";

export type Phase = "no-person" | "body" | "detected" | "analyzing";
export type PoseStats = { sec: number; sum: number; n: number; best: number; streak: number; chk: { p: number; n: number; bad: string }[] };
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];

let cached: Promise<PoseLandmarker> | null = null;
const load = () => (cached ??= FilesetResolver.forVisionTasks(WASM).then(async fs => {
  const make = (delegate: "GPU" | "CPU") => PoseLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "VIDEO", numPoses: 1 });
  try { return await make("GPU"); } catch { return make("CPU"); }
}));

type Opts = { videoRef: RefObject<HTMLVideoElement | null>; canvasRef: RefObject<HTMLCanvasElement | null>; slug: string; active: boolean; paused: boolean };

export function usePoseCoach(o: Opts) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [out, setOut] = useState({ phase: "no-person" as Phase, score: 0, checks: [] as Check[], cue: "", angles: { kl: 0, kr: 0, el: 0, er: 0 } });
  const stats = useRef<Record<string, PoseStats>>({});
  const live = useRef({ slug: o.slug, paused: o.paused });
  live.current = { slug: o.slug, paused: o.paused };
  const s = useRef({ phase: "no-person" as Phase, hi: 0, lo: 0, score: 0, sm: null as Pt[] | null, last: -1, prev: 0, emit: 0, ema: [] as number[], ok: [] as boolean[], cue: "", cueAt: 0 });

  useEffect(() => { Object.assign(s.current, { phase: "no-person", hi: 0, lo: 0, score: 0, ema: [], ok: [], cue: "" }); }, [o.slug]);

  useEffect(() => {
    if (!o.active) return;
    let stop = false, raf = 0, lm: PoseLandmarker | null = null;
    setError("");
    load().then(l => { if (stop) return; lm = l; setReady(true); raf = requestAnimationFrame(loop); })
      .catch(e => { cached = null; setError("The pose model could not load. Check your internet connection. " + String(e?.message ?? "").slice(0, 80)); });

    function loop() {
      if (stop) return;
      raf = requestAnimationFrame(loop);
      const v = o.videoRef.current, c = o.canvasRef.current, st = s.current;
      if (!lm || !v || !c || v.readyState < 2 || live.current.paused || v.currentTime === st.last) return;
      st.last = v.currentTime;
      const now = performance.now(), dt = Math.min((now - st.prev) / 1000, 0.2);
      st.prev = now;
      const raw = lm.detectForVideo(v, now).landmarks[0];
      const vw = v.videoWidth, vh = v.videoHeight;
      let P: Pt[] | null = null;
      if (raw) {
        const cur = raw.map(p => ({ x: p.x * vw, y: p.y * vh, v: p.visibility ?? 1 }));
        const prev = st.sm;
        st.sm = prev ? cur.map((p, i) => ({ x: prev[i].x + (p.x - prev[i].x) * 0.5, y: prev[i].y + (p.y - prev[i].y) * 0.5, v: p.v })) : cur;
        P = st.sm;
      } else st.sm = null;

      const slug = live.current.slug;
      const ev: Evaluation | null = P ? evaluate(P, slug) : null;
      if (!ev || !ev.visible) { st.phase = "no-person"; st.hi = st.lo = 0; }
      else {
        st.score += (ev.score - st.score) * 0.1;
        if (st.phase === "no-person") st.phase = "body";
        if (st.phase === "body") { st.hi = ev.score >= 0.6 ? st.hi + 1 : 0; if (st.hi >= 12) { st.phase = "detected"; st.hi = 0; } }
        else if (st.phase === "detected") { st.hi++; if (ev.score < 0.4) { st.phase = "body"; st.hi = 0; } else if (st.hi >= 25) st.phase = "analyzing"; }
        else {
          st.lo = ev.score < 0.35 ? st.lo + 1 : 0;
          if (st.lo >= 30) { st.phase = "body"; st.lo = st.hi = 0; }
          const q = (stats.current[slug] ??= { sec: 0, sum: 0, n: 0, best: 0, streak: 0, chk: [] });
          q.sec += dt; q.sum += st.score; q.n++;
          q.streak = st.score >= 0.8 ? q.streak + dt : 0; q.best = Math.max(q.best, q.streak);
          ev.checks.forEach((k, i) => { const c = (q.chk[i] ??= { p: 0, n: 0, bad: k.bad }); c.n++; if (k.ok) c.p++; else c.bad = k.bad; });
        }
      }
      // Steady feedback: a check only flips after it has been consistently different for a moment.
      const stable: Check[] = ev ? ev.checks.map((k, i) => {
        const x = k.ok ? 1 : 0;
        const e = (st.ema[i] = (st.ema[i] ?? x) * 0.92 + x * 0.08);
        if (st.ok[i] === undefined) st.ok[i] = k.ok;
        else if (e >= 0.65) st.ok[i] = true;
        else if (e <= 0.35) st.ok[i] = false;
        return { ...k, ok: st.ok[i] };
      }) : [];
      // One main cue at a time, held for at least 4 seconds unless it is fixed.
      const fail = stable.find(k => !k.ok);
      const stillBad = stable.some(k => !k.ok && k.bad === st.cue);
      if (!fail) st.cue = "";
      else if (fail.bad !== st.cue && (!stillBad || now - st.cueAt > 4000)) { st.cue = fail.bad; st.cueAt = now; }
      draw(c, v, P, ev && { ...ev, checks: stable }, st.phase === "analyzing");
      if (now - st.emit > 100) {
        st.emit = now;
        setOut({ phase: st.phase, score: Math.round(st.score * 100), checks: stable, cue: st.cue, angles: ev?.angles ?? { kl: 0, kr: 0, el: 0, er: 0 } });
      }
    }
    return () => { stop = true; cancelAnimationFrame(raf); setReady(false); s.current.sm = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [o.active]);

  return { ...out, ready, error, stats };
}

function draw(c: HTMLCanvasElement, v: HTMLVideoElement, P: Pt[] | null, ev: Evaluation | null, judge: boolean) {
  const dpr = window.devicePixelRatio || 1, cw = c.clientWidth, ch = c.clientHeight;
  if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); }
  const g = c.getContext("2d")!;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, ch);
  if (!P) return;
  const sc = Math.max(cw / v.videoWidth, ch / v.videoHeight), ox = (cw - v.videoWidth * sc) / 2, oy = (ch - v.videoHeight * sc) / 2;
  const bad = new Set<number>(); if (judge) ev?.checks.forEach(k => { if (!k.ok) k.j.forEach(i => bad.add(i)); });
  const col = (i: number) => (!judge ? "#cfb8d0" : bad.has(i) ? "#e0a35a" : "#9ecead");
  const pt = (i: number) => [P[i].x * sc + ox, P[i].y * sc + oy];
  g.lineWidth = 4; g.lineCap = "round"; g.shadowBlur = 10;
  for (const [a, b] of BONES) { g.strokeStyle = g.shadowColor = col(bad.has(a) ? a : b); g.beginPath(); g.moveTo(...(pt(a) as [number, number])); g.lineTo(...(pt(b) as [number, number])); g.stroke(); }
  g.shadowBlur = 0;
  for (let i = 11; i <= 28; i++) { if (i >= 17 && i <= 22) continue; const [x, y] = pt(i); g.fillStyle = "#fff"; g.strokeStyle = col(i); g.lineWidth = 3; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.stroke(); }
}