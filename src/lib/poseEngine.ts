export type Pt = { x: number; y: number; v: number };
export type Check = { ok: boolean; good: string; bad: string; j: number[] };
export type Evaluation = { visible: boolean; checks: Check[]; score: number; angles: { kl: number; kr: number; el: number; er: number } };

const D = 180 / Math.PI;
const ang = (a: Pt, b: Pt, c: Pt) => {
  const x1 = a.x - b.x, y1 = a.y - b.y, x2 = c.x - b.x, y2 = c.y - b.y;
  const cos = (x1 * x2 + y1 * y2) / ((Math.hypot(x1, y1) * Math.hypot(x2, y2)) || 1);
  return Math.acos(Math.max(-1, Math.min(1, cos))) * D;
};
const fromVertical = (a: Pt, b: Pt) => Math.atan2(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) * D;
const C = (ok: boolean, good: string, bad: string, j: number[]): Check => ({ ok, good, bad, j });
const FRONT = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
const SIDES = [[11, 13, 15, 23, 25, 27], [12, 14, 16, 24, 26, 28]];

/** Rule-based pose checks on 2D landmarks in video-pixel coordinates (MediaPipe 33-point model). */
export function evaluate(P: Pt[], slug: string): Evaluation {
  const a = (i: number, j: number, k: number) => ang(P[i], P[j], P[k]);
  const kl = a(23, 25, 27), kr = a(24, 26, 28), el = a(11, 13, 15), er = a(12, 14, 16), sl = a(13, 11, 23), sr = a(14, 12, 24);
  const angles = { kl: Math.round(kl), kr: Math.round(kr), el: Math.round(el), er: Math.round(er) };
  const sw = Math.hypot(P[11].x - P[12].x, P[11].y - P[12].y) || 1;
  const sM = { x: (P[11].x + P[12].x) / 2, y: (P[11].y + P[12].y) / 2, v: 1 };
  const hM = { x: (P[23].x + P[24].x) / 2, y: (P[23].y + P[24].y) / 2, v: 1 };
  const lean = fromVertical(sM, hM);
  const ankle = Math.abs(P[27].x - P[28].x) / sw;
  const wrists = Math.hypot(P[15].x - P[16].x, P[15].y - P[16].y) / sw;
  const fk = Math.min(kl, kr), bk = Math.max(kl, kr);
  const fj = kl < kr ? [25] : [26], bj = kl < kr ? [26] : [25];
  const up = P[15].y < P[11].y && P[16].y < P[12].y;
  const armsOut = sl >= 72 && sl <= 108 && sr >= 72 && sr <= 108;
  const kneeMsg = fk < 80 ? "Front knee is too deep — ease up toward 90°" : "Bend your front knee deeper toward 90°";
  let checks: Check[] = [];
  let visible = FRONT.every(i => P[i].v >= 0.4);

  switch (slug) {
    case "tadasana":
      checks = [
        C(fk >= 165, "Legs are strong and straight", "Straighten your knees gently", [25, 26]),
        C(Math.max(sl, sr) <= 35, "Arms are relaxed beside you", "Let your arms hang by your sides", [13, 14]),
        C(lean <= 7, "Spine is tall and centred", "Stack your shoulders over your hips", [11, 12, 23, 24]),
        C(ankle <= 1.1, "Feet are grounded together", "Bring your feet closer together", [27, 28]),
      ]; break;
    case "vrikshasana":
      checks = [
        C(bk >= 165, "Standing leg is steady and straight", "Press down and straighten your standing leg", bj),
        C(fk <= 115, "Lifted leg is well placed", "Lift your foot higher, to calf or thigh", fj),
        C(wrists <= 0.45, "Palms are together at your heart", "Bring your palms together", [15, 16]),
        C(lean <= 8, "Torso is upright", "Keep your torso upright over your hips", [11, 12, 23, 24]),
      ]; break;
    case "trikonasana":
      checks = [
        C(fk >= 160, "Both legs are long and straight", "Straighten both legs", [25, 26]),
        C(ankle >= 1.6, "Stance is nicely wide", "Widen your stance", [27, 28]),
        C(fromVertical(P[15], P[16]) <= 25, "Arms form one long line", "Stack your arms, top hand to the sky", [15, 16]),
        C(lean >= 20, "Lovely side extension", "Reach further over your front leg", [11, 12, 23, 24]),
        C(Math.min(el, er) >= 155, "Arms are fully extended", "Extend through your elbows", [13, 14]),
      ]; break;
    case "warrior1":
      checks = [
        C(fk >= 80 && fk <= 115, "Front knee alignment is good", kneeMsg, fj),
        C(bk >= 160, "Back leg is fully extended", "Straighten your back leg", bj),
        C(up && Math.min(el, er) >= 155, "Arms are reaching overhead", "Reach both arms straight overhead", [13, 14, 15, 16]),
        C(lean <= 12, "Torso is lifted and steady", "Lift your chest and stay upright", [11, 12, 23, 24]),
        C(ankle >= 1.2, "Stance has good length", "Step your feet further apart", [27, 28]),
      ]; break;
    case "warrior2":
      checks = [
        C(fk >= 80 && fk <= 112, "Front knee alignment is good", kneeMsg, fj),
        C(bk >= 165, "Back leg is fully extended", "Straighten your back leg", bj),
        C(armsOut, "Arms are level with shoulders", (sl + sr) / 2 < 90 ? "Lift your arms to shoulder height" : "Lower your arms to shoulder height", [13, 14]),
        C(Math.min(el, er) >= 158, "Elbows are fully extended", "Extend your elbows, reach through fingertips", [13, 14]),
        C(lean <= 12, "Torso is upright over your hips", "Stay tall, don't lean over the front leg", [11, 12, 23, 24]),
        C(ankle >= 1.5, "Stance is wide and grounded", "Widen your stance", [27, 28]),
      ]; break;
    case "bhujangasana": {
      const idx = SIDES[SIDES[0].reduce((s, i) => s + P[i].v, 0) >= SIDES[1].reduce((s, i) => s + P[i].v, 0) ? 0 : 1];
      const [s, e, w, h, k, n] = idx;
      visible = idx.every(i => P[i].v >= 0.4);
      const lift = Math.atan2(P[h].y - P[s].y, Math.abs(P[s].x - P[h].x)) * D;
      checks = [
        C(lift >= 15 && lift <= 60, "Chest is lifted nicely", lift < 15 ? "Lift your chest higher" : "Lower your chest slightly to protect your back", [s, h]),
        C(ang(P[s], P[e], P[w]) >= 125, "Arms are supporting you well", "Press into your palms and lengthen your arms", [e, w]),
        C(ang(P[h], P[k], P[n]) >= 160, "Legs are long and straight", "Keep your legs long and straight", [k, n]),
      ]; break;
    }
  }
  const score = checks.length ? checks.filter(c => c.ok).length / checks.length : 0;
  return { visible, checks, score, angles };
}

/** Short labels for each check (same order as the checks above), used in the result summary. */
export const CHECK_NAMES: Record<string, string[]> = {
  tadasana: ["Leg straightness", "Arm position", "Spine alignment", "Foot placement"],
  vrikshasana: ["Standing leg", "Lifted leg", "Hands at heart", "Torso upright"],
  trikonasana: ["Leg straightness", "Stance width", "Arm line", "Side extension", "Arm extension"],
  warrior1: ["Front knee", "Back leg", "Arms overhead", "Torso lift", "Stance length"],
  warrior2: ["Front knee", "Back leg", "Arm height", "Elbow extension", "Torso upright", "Stance width"],
  bhujangasana: ["Chest lift", "Arm support", "Leg extension"],
};
