const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const L0 = 'M30 52L23 88M30 52L37 88';
interface PoseDef { arms: string; legs: string; tilt?: number; head?: number; props?: string }
const POSE_DEF: PoseDef[] = [
  { arms: 'M20 25L15 47M40 25L45 47', legs: L0 },
  { arms: 'M20 25L16 45M40 25L44 45', legs: 'M30 52H52V80M30 52H50', props: 'M26 57H56M54 57V88' },
  { arms: 'M20 25L15 47M40 25L45 47', legs: L0, tilt: 14 },
  { arms: 'M20 25L27 40L41 36M40 25L33 40L19 36', legs: L0 },
  { arms: 'M20 25L15 47M40 25L47 38L39 47', legs: L0 },
  { arms: 'M20 25L21 42L33 42M40 25L39 42L27 42', legs: L0, props: 'M23 36H37V46H23z' },
  { arms: 'M20 25L16 45M40 25L54 14', legs: L0, props: 'M52 6H66V42H52z' },
  { arms: 'M20 25L21 42L33 40M40 25L39 42L27 40', legs: L0, props: 'M21 33L37 37L34 47L18 43z' },
  { arms: 'M20 25L27 45M40 25L34 43', legs: 'M30 52L19 86M30 52L43 82' },
  { arms: 'M22 25L17 47M38 25L43 47', legs: L0, head: 4 },
  { arms: 'M20 25L15 47M40 25L45 47', legs: L0, head: -4, props: 'M44 8L52 12' },
  { arms: 'M20 25L16 45M40 25L54 29L62 22', legs: L0 },
  { arms: 'M20 25L10 17M40 25L53 31', legs: 'M30 52L17 86M30 52L45 82', tilt: -9 },
];
export function PoseArt({ i }: { i: number }) {
  const d = POSE_DEF[i] ?? POSE_DEF[0];
  return <svg viewBox="0 0 70 92" width="62" height="82" {...S}><g transform={`rotate(${d.tilt ?? 0} 30 52)`}><circle cx={30 + (d.head ?? 0)} cy="13" r="7" fill="currentColor" stroke="none" /><path d={`M30 20V52M20 25H40${d.arms}`} /></g><path d={d.legs} />{d.props && <path d={d.props} stroke="#c9a96a" />}</svg>;
}
type Eye = 'dot' | 'big' | 'side' | 'closed';
const EX: { m: string; br: number[]; e: Eye }[] = [
  { m: 'M21 39Q30 47 39 39', br: [21, 20, 20, 21], e: 'dot' }, { m: 'M24 40Q30 43 36 40', br: [21, 20, 20, 21], e: 'dot' },
  { m: 'M23 40Q31 45 38 38', br: [19, 18, 18, 19], e: 'dot' }, { m: 'M23 41H37', br: [21, 22, 22, 21], e: 'dot' },
  { m: 'M24 42Q30 39 36 42', br: [17, 16, 20, 21], e: 'dot' }, { m: 'M20 38Q30 49 40 38', br: [20, 19, 19, 20], e: 'dot' },
  { m: 'M24 41H36', br: [19, 22, 22, 19], e: 'dot' }, { m: 'M30 38a4 5 0 1 0 .1 0', br: [16, 15, 15, 16], e: 'big' },
  { m: 'M24 42Q30 39 36 42', br: [19, 23, 23, 19], e: 'dot' }, { m: 'M25 41Q30 43 35 41', br: [20, 19, 19, 20], e: 'closed' },
  { m: 'M24 41Q30 43 36 41', br: [20, 19, 19, 20], e: 'side' },
];
export function ExprArt({ i }: { i: number }) {
  const d = EX[i] ?? EX[0], b = d.br, ex = d.e === 'side' ? 2.5 : 0, r = d.e === 'big' ? 3.4 : 2.2;
  return <svg viewBox="0 0 60 60" width="70" height="70" {...S} strokeWidth={2.4}><circle cx="30" cy="30" r="21" />
    <path d={`M19 ${b[0]}L26 ${b[1]}M34 ${b[2]}L41 ${b[3]}`} />
    {d.e === 'closed' ? <path d="M20 28Q23 31 26 28M34 28Q37 31 40 28" /> : <><circle cx={23 + ex} cy="28" r={r} fill="currentColor" stroke="none" /><circle cx={37 + ex} cy="28" r={r} fill="currentColor" stroke="none" /></>}
    <path d={d.m} /></svg>;
}
interface LDef { a: number; w: number }
const LIGHT_DEF: LDef[][] = [[{ a: 70, w: 16 }], [{ a: 40, w: 18 }], [{ a: 45, w: 6 }], [{ a: 0, w: 8 }], [{ a: 30, w: 8 }], [{ a: 150, w: 6 }, { a: -40, w: 14 }], [{ a: 100, w: 20 }], [{ a: 0, w: 12 }, { a: 90, w: 12 }, { a: -90, w: 12 }, { a: 180, w: 12 }], [{ a: 85, w: 5 }], [{ a: 45, w: 9 }, { a: -50, w: 14 }, { a: 160, w: 6 }]];
export function LightArt({ i }: { i: number }) {
  return <svg viewBox="0 0 100 100" width="84" height="84"><circle cx="50" cy="48" r="34" fill="none" stroke="#2e343d" />
    {(LIGHT_DEF[i] ?? LIGHT_DEF[0]).map((l, k) => { const r = (l.a * Math.PI) / 180, lx = 50 + 34 * Math.sin(r), ly = 48 + 34 * Math.cos(r), nx = Math.cos(r), ny = -Math.sin(r), w = 9 + l.w;
      return <g key={k}><path d={`M${lx} ${ly}L${50 + nx * w} ${48 + ny * w}L${50 - nx * w} ${48 - ny * w}z`} fill="#c9a96a" opacity=".3" /><circle cx={lx} cy={ly} r="4.5" fill="#c9a96a" /></g>; })}
    <circle cx="50" cy="48" r="9" fill="#e9e6df" /><rect x="44" y="91" width="12" height="7" rx="2" fill="#8d95a1" /></svg>;
}
const CROPS = [[0, 0.14], [0, 0.2], [0, 0.3], [0, 0.42], [0, 0.55], [0, 0.78], [0, 1], [0, 1]];
export function FrameArt({ i }: { i: number }) {
  const [a, z] = CROPS[i] ?? CROPS[0];
  return <svg viewBox="0 0 60 100" width="50" height="84"><circle cx="30" cy="10" r="6" fill="#6f6249" /><path d="M18 22H42L40 60L36 98H24L20 60z" fill="#6f6249" /><rect x="6" y={2 + a * 94} width="48" height={Math.max(8, (z - a) * 94)} fill="#c9a96a22" stroke="#c9a96a" strokeWidth="2" strokeDasharray="4 3" rx="2" /></svg>;
}
export const GRAD: Record<string, string> = {
  'clean seamless studio backdrop': 'linear-gradient(160deg,#dcd8cf,#8e8a80)', 'modern classroom': 'linear-gradient(160deg,#2f5d50,#7a5a3a)', 'modern office': 'linear-gradient(160deg,#cfd8e3,#6b7b8f)',
  'abstract geometric background': 'conic-gradient(from 45deg,#2f6fed,#c9a96a,#15171a,#2f6fed)', 'premium gradient background': 'linear-gradient(160deg,#1b1f3a,#c9a96a)', 'luxury interior': 'linear-gradient(160deg,#3b2a1a,#c9a96a)',
  'urban street, shallow depth': 'linear-gradient(160deg,#2a2f3a,#e07a3f)', 'scientific lab environment': 'linear-gradient(160deg,#0e3b3a,#9be7e1)',
  'minimalist editorial': 'linear-gradient(160deg,#f1eee8,#c9c2b5)', 'premium luxury advertising': 'linear-gradient(160deg,#0e0e10,#b8964f)', 'cinematic portraiture': 'linear-gradient(160deg,#14202b,#d98c4a)',
  'modern educational design': 'linear-gradient(160deg,#1d3a6b,#f5c84c)', 'bold typography-led design': 'linear-gradient(160deg,#e63946,#111)', 'natural lifestyle photography': 'linear-gradient(160deg,#a8c3a0,#f0e2c8)',
  'futuristic technology design': 'linear-gradient(160deg,#0b1020,#34d1f0)', 'corporate branding': 'linear-gradient(160deg,#12355b,#9fb8d8)',
};
