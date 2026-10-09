export type Retouch = 'light' | 'moderate' | 'strong';
export type Model = 'generic' | 'midjourney' | 'openai' | 'sd';
export interface Brief {
  text: string; ratio: string; platform?: string; subject?: string; clothing?: string;
  pose?: string; expression?: string; camera?: string; framing?: string; lens?: string;
  lighting?: string; background?: string; style?: string; composition?: string;
  palette?: string[]; exactText?: string[]; exclude?: string[];
  identityLock?: boolean; retouch?: Retouch; model: Model;
  typography?: string; kind?: string; goal?: string; retouchTasks?: string[]; preserve?: string[];
}
export interface Conflict { id: string; severity: 'high' | 'low'; message: string; fix: string }
export interface Result {
  sections: Record<string, string>; prompt: string; negative: string;
  conflicts: Conflict[]; score: { total: number; parts: Record<string, number>; tips: string[] };
  assumptions: string[]; notes: string[];
}
export const RATIOS = ['1:1', '4:5', '3:4', '9:16', '16:9', '3:2'];
export const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
const clean = (s?: string) => (s ?? '').trim();

export function detectConflicts(b: Brief): Conflict[] {
  const c: Conflict[] = [];
  const f = clean(b.framing).toLowerCase(), p = clean(b.pose).toLowerCase();
  if (/close/.test(f) && /(walking|full[- ]body|standing)/.test(p))
    c.push({ id: 'framing-pose', severity: 'high', message: 'Close framing conflicts with a full-body pose.', fix: 'Use waist-up/three-quarter framing or choose a seated/head-and-shoulders pose.' });
  if (b.identityLock && b.retouch === 'strong')
    c.push({ id: 'identity-retouch', severity: 'high', message: 'Strong retouching can alter facial identity.', fix: 'Lower retouch to moderate, or limit strong edits to lighting, color and background.' });
  if ((b.exactText?.length ?? 0) > 0 && b.ratio === '9:16' && !b.composition)
    c.push({ id: 'text-zone', severity: 'low', message: 'Exact text with no text zone defined in a tall format.', fix: 'Pick a composition that reserves a text-safe area.' });
  if (/dark/.test(clean(b.lighting).toLowerCase()) && /dark|black/.test(clean(b.background).toLowerCase()))
    c.push({ id: 'separation', severity: 'low', message: 'Dark lighting on a dark background may merge the subject.', fix: 'Add rim light or a lighter backdrop.' });
  if (!/^\d+:\d+$/.test(b.ratio))
    c.push({ id: 'ratio', severity: 'high', message: `Invalid aspect ratio "${b.ratio}".`, fix: 'Use W:H such as 4:5.' });
  return c;
}

export function negativeFor(b: Brief): string[] {
  const n = ['watermark', 'unwanted logos', 'misspelled or extra text'];
  if (b.subject || b.pose) n.push('distorted hands', 'extra fingers', 'incorrect anatomy');
  if (b.identityLock || b.retouch) n.push('plastic or waxy skin', 'changed facial identity', 'over-sharpened halos');
  if (clean(b.clothing)) n.push('altered clothing details');
  n.push(...(b.exclude ?? []).map(clean).filter(Boolean));
  return [...new Set(n)];
}

export function build(b: Brief): Result {
  const assumptions: string[] = [], notes: string[] = [];
  const s: Record<string, string> = {};
  const brief = clean(b.text);
  s['Creative brief'] = hasArabic(brief) ? `Original brief (verbatim, Arabic preserved): ${brief}` : brief;
  if (hasArabic(brief)) notes.push('Arabic brief kept verbatim. Translation needs an AI provider; local mode never rewrites your wording.');
  if (clean(b.kind)) s['Design type'] = clean(b.kind);
  if (clean(b.goal)) s['Objective'] = clean(b.goal);
  if (clean(b.subject)) s['Main subject'] = clean(b.subject);
  if (b.identityLock) s['Identity constraints'] = "Preserve the reference subject's recognizable facial structure and identity as far as the model supports; do not alter face proportions, hairstyle or beard unless stated.";
  if (clean(b.clothing)) s['Clothing'] = clean(b.clothing);
  if (clean(b.pose)) s['Pose'] = clean(b.pose);
  if (clean(b.expression)) s['Facial expression'] = clean(b.expression);
  const cam = [b.camera, b.framing, b.lens].map(clean).filter(Boolean).join(', ');
  if (cam) s['Camera'] = cam; else assumptions.push('No camera set: model default.');
  if (clean(b.lighting)) s['Lighting'] = clean(b.lighting); else assumptions.push('No lighting set: model default.');
  if (clean(b.background)) s['Background'] = clean(b.background);
  if (clean(b.composition)) s['Composition'] = clean(b.composition);
  if (clean(b.style)) s['Style'] = clean(b.style);
  if (b.palette?.length) s['Color palette'] = b.palette.join(', ');
  if (clean(b.typography)) s['Typography'] = clean(b.typography);
  if (b.exactText?.length) s['Exact text'] = 'Render this text exactly, character for character, add no other words: ' + b.exactText.map(t => `"${t}"`).join(' | ');
  if (b.retouch) s['Retouching'] = `${b.retouch} natural retouch; keep realistic skin texture and pores, no smoothing.`
    + (b.retouchTasks?.length ? ` Tasks: ${b.retouchTasks.join(', ')}.` : '') + (b.preserve?.length ? ` Preserve unchanged: ${b.preserve.join(', ')}.` : '');
  const negs = negativeFor(b);
  let prompt: string, negative = negs.join(', ');
  const body = Object.entries(s);
  if (b.model === 'midjourney') {
    prompt = body.map(([, v]) => v).join(', ') + ` --ar ${b.ratio} --no ${negs.join(', ')}`; negative = '';
    notes.push('Midjourney: negatives sent via --no; exact-text rendering is unreliable.');
  } else if (b.model === 'openai') {
    prompt = body.map(([k, v]) => `${k}: ${v}.`).join('\n') + `\nAspect ratio ${b.ratio}${b.platform ? ` for ${b.platform}` : ''}.\nAvoid: ${negs.join(', ')}.`; negative = '';
    notes.push('OpenAI-style: no negative field, exclusions written inline.');
  } else if (b.model === 'sd') {
    prompt = body.map(([, v]) => v).join(', ') + `, ${b.ratio} aspect`;
  } else prompt = body.map(([k, v]) => `## ${k}\n${v}`).join('\n\n') + `\n\n## Aspect ratio\n${b.ratio}${b.platform ? ` for ${b.platform}` : ''}`;
  const conflicts = detectConflicts(b);
  return { sections: s, prompt, negative, conflicts, score: score(b, conflicts), assumptions, notes };
}

export function score(b: Brief, conflicts: Conflict[]) {
  const has = (...v: (string | undefined)[]) => v.every(x => clean(x).length > 0) ? 100 : v.some(x => clean(x)) ? 50 : 0;
  const parts: Record<string, number> = {
    'Intent clarity': Math.min(100, Math.round(clean(b.text).length * 2)),
    'Subject': has(b.subject, b.clothing),
    'Camera & framing': has(b.camera, b.framing, b.lens),
    'Lighting': has(b.lighting),
    'Composition': has(b.composition, b.background),
    'Text accuracy': (b.exactText?.length ?? 0) ? 100 : 60,
    'Color': b.palette?.length ? 100 : 40,
    'Conflict-free': Math.max(0, 100 - conflicts.reduce((a, c) => a + (c.severity === 'high' ? 40 : 15), 0)),
  };
  const total = Math.round(Object.values(parts).reduce((a, v) => a + v, 0) / Object.keys(parts).length);
  return { total, parts, tips: Object.entries(parts).filter(([, v]) => v < 100).map(([k]) => `Improve: ${k}`) };
}

const DIRECTIONS: Record<string, Partial<Brief>> = {
  'Premium advertising': { style: 'premium luxury advertising photography', lighting: 'large diffused key light with subtle rim light', composition: 'clean negative space, product-led hierarchy' },
  'Minimal editorial': { style: 'minimalist editorial design', lighting: 'soft window light', composition: 'asymmetrical editorial grid, generous whitespace' },
  'Cinematic': { style: 'cinematic photorealism', lighting: 'moody directional light, gentle contrast', composition: 'full-bleed cinematic framing' },
};
export function variations(b: Brief, names = Object.keys(DIRECTIONS)) {
  const locked = { exactText: b.exactText, clothing: b.clothing, identityLock: b.identityLock, subject: b.subject, text: b.text, ratio: b.ratio, model: b.model };
  return names.filter(n => DIRECTIONS[n]).map(n => ({ name: n, result: build({ ...b, ...DIRECTIONS[n], ...locked }) }));
}
