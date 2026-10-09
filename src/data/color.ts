export const HARMONIES = ['complementary', 'analogous', 'triadic', 'split-complementary', 'monochromatic'] as const;
export type Harmony = (typeof HARMONIES)[number];
function toHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s * 100, l * 100];
}
function toHex(h: number, s: number, l: number): string {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => { const k = (n + h / 30) % 12; const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
export function harmony(base: string, type: Harmony): string[] {
  const [h, s, l] = toHsl(base);
  if (type === 'monochromatic') return [20, 35, 50, 65, 85].map(x => toHex(h, s, x));
  const off: Record<string, number[]> = { complementary: [0, 180], analogous: [-30, 0, 30], triadic: [0, 120, 240], 'split-complementary': [0, 150, 210] };
  return [...off[type].map(d => toHex((h + d + 360) % 360, s, l)), '#F5F2EA', '#15171A'];
}
