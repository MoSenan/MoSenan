import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { build, variations, type Brief, type Model, type Retouch } from './engine/engine.ts';
import { POSES, EXPRESSIONS, ANGLES, FRAMINGS, LENSES, LIGHTS, BACKGROUNDS, STYLES, RETOUCH_TASKS, PRESERVE, type Opt } from './data/options.ts';
import { FONTS, FCATS } from './data/fonts.ts';
import { PLATFORMS, KINDS, GOALS, COMPS, TEACH } from './data/social.ts';
import { harmony, HARMONIES, type Harmony } from './data/color.ts';
import { Icon, type IconName } from './Icon.tsx';
import { PoseArt, ExprArt, LightArt, FrameArt, GRAD } from './Visuals.tsx';

type Lang = 'en' | 'ar';
type Tab = 'studio' | 'social' | 'portrait' | 'type' | 'layout' | 'retouch' | 'teacher' | 'help' | 'status';
const TABS: { id: Tab; icon: IconName; en: string; ar: string; de: string; da: string }[] = [
  { id: 'studio', icon: 'studio', en: 'Prompt Studio', ar: 'استوديو البرومبت', de: 'Write your idea and pick the target AI model.', da: 'اكتب فكرتك واختار النموذج اللي هتستخدمه.' },
  { id: 'social', icon: 'social', en: 'Social Media', ar: 'سوشيال ميديا', de: 'Pick the platform, size and ad goal.', da: 'اختار المنصة والمقاس وهدف الإعلان.' },
  { id: 'portrait', icon: 'portrait', en: 'Portrait & Camera', ar: 'البورتريه والكاميرا', de: 'Pose, expression, camera, lens and light.', da: 'الوضعية والتعبير والكاميرا والعدسة والإضاءة.' },
  { id: 'type', icon: 'type', en: 'Typography', ar: 'الخطوط', de: '43 real fonts with live preview.', da: '43 خط حقيقي مع معاينة حية.' },
  { id: 'layout', icon: 'layout', en: 'Layout & Color', ar: 'التكوين والألوان', de: 'Where the subject and text go, plus colors.', da: 'مكان الشخص والنص والألوان.' },
  { id: 'retouch', icon: 'retouch', en: 'Retouching', ar: 'الريتاتش', de: 'Retouch instructions that keep the real face.', da: 'تعليمات ريتاتش تحافظ على الوجه الحقيقي.' },
  { id: 'teacher', icon: 'teacher', en: 'Teacher Poster', ar: 'بوستر المدرس', de: 'Teacher ad built only from your facts.', da: 'إعلان المدرس من البيانات اللي تكتبها بس.' },
  { id: 'help', icon: 'help', en: 'How to use', ar: 'إزاي تستخدمه', de: 'Six easy steps.', da: 'ست خطوات سهلة.' },
  { id: 'status', icon: 'status', en: 'Status', ar: 'حالة البرنامج', de: 'What works and what is next.', da: 'إيه اللي شغال وإيه اللي جاي.' },
];
interface Ty { font: string; weight: string; size: number; spacing: number; align: 'left' | 'center' | 'right'; color: string; shadow: boolean; sample: string; sub: string; cta: string }
interface Tp { name: string; subject: string; grade: string; center: string; cta: string; contact: string; price: string }
const TY0: Ty = { font: 'Cairo', weight: '700', size: 54, spacing: 0, align: 'center', color: '#f3e3b8', shadow: true, sample: 'أ. محمد عادل', sub: 'Mathematics • الثانوية العامة', cta: 'احجز الآن' };
const TP0: Tp = { name: '', subject: '', grade: '', center: '', cta: '', contact: '', price: '' };
const B0: Brief = { text: '', ratio: '4:5', model: 'generic' };
const KEY = 'pf.v2';
const load = <T,>(k: string, d: T): T => { try { return { ...d, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}')[k] ?? {}) }; } catch { return d; } };
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="f"><span>{label}</span>{children}</label>; }
function Tip({ children }: { children: ReactNode }) { return <div className="tip"><Icon name="help" /><div>{children}</div></div>; }
function Gal({ items, value, onPick, lang, art, cols = 4 }: { items: Opt[]; value?: string; onPick: (v: string | undefined) => void; lang: Lang; art: (i: number, o: Opt) => ReactNode; cols?: number }) {
  return <div className="gal" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>{items.map((it, i) => <button key={it.en} className={'gc' + (value === it.en ? ' on' : '')} onClick={() => onPick(value === it.en ? undefined : it.en)}><div className="art">{art(i, it)}</div><span>{lang === 'ar' ? it.ar : it.en}</span></button>)}</div>;
}
function Swatch({ g }: { g: string }) { return <div className="sw2" style={{ background: g }} />; }
function AngleDiagram({ deg }: { deg: number }) {
  const r = (deg * Math.PI) / 180, cx = 60 + 46 * Math.cos(r), cy = 46 - 40 * Math.sin(r);
  return <svg viewBox="0 0 120 92" width="150" role="img" aria-label="camera elevation"><circle cx="60" cy="46" r="11" fill="#c9a96a" /><path d="M36 84c0-14 10-22 24-22s24 8 24 22z" fill="#6f6249" /><line x1="60" y1="46" x2={cx} y2={cy} stroke="#8d95a1" strokeDasharray="3 3" /><g transform={`translate(${cx} ${cy}) rotate(${-deg})`}><rect x="-9" y="-6" width="18" height="12" rx="3" fill="#e9e6df" /><circle r="3.5" fill="#15171a" /></g></svg>;
}
function LayoutPreview({ ratio, place, text, h = 300 }: { ratio: string; place: 'left' | 'center' | 'right'; text: boolean; h?: number }) {
  const [a, c] = ratio.split(':').map(Number), H = h, W = Math.round((H * (a || 1)) / (c || 1)), m = Math.round(W * 0.06);
  const sx = place === 'left' ? W * 0.3 : place === 'right' ? W * 0.7 : W / 2;
  const tz = place === 'center' ? { x: m, y: m, w: W - 2 * m, h: H * 0.2 } : { x: place === 'left' ? W * 0.55 : m, y: H * 0.18, w: W * 0.4 - m / 2, h: H * 0.5 };
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: h + 40, background: '#1a1d23', borderRadius: 10 }} role="img" aria-label="layout preview">
    {[1, 2].map(i => <g key={i} stroke="#2e343d" strokeDasharray="4 4"><line x1={(W * i) / 3} y1="0" x2={(W * i) / 3} y2={H} /><line x1="0" y1={(H * i) / 3} x2={W} y2={(H * i) / 3} /></g>)}
    <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke="#3a4250" strokeDasharray="2 3" />
    <ellipse cx={sx} cy={H * (place === 'center' ? 0.5 : 0.42)} rx={W * 0.1} ry={H * 0.1} fill="#c9a96a" /><path d={`M${sx - W * 0.17} ${H}C${sx - W * 0.17} ${H * 0.72} ${sx + W * 0.17} ${H * 0.72} ${sx + W * 0.17} ${H}z`} fill="#6f6249" />
    {text && <rect x={tz.x} y={tz.y} width={tz.w} height={tz.h} rx="6" fill="#58b89433" stroke="#58b894" />}
    <rect x={W / 2 - W * 0.12} y={H - m - 16} width={W * 0.24} height="16" rx="8" fill="#c9a96a" opacity=".85" /><rect x={W - m - 26} y={m + 2} width="22" height="14" rx="3" fill="#8d95a1" />
  </svg>;
}
function HierDiagram() {
  return <svg viewBox="0 0 220 90" width="100%" style={{ maxWidth: 300 }} role="img" aria-label="hierarchy"><rect x="10" y="8" width="170" height="20" rx="4" fill="#c9a96a" /><text x="190" y="23" fill="#8d95a1" fontSize="10">H1</text><rect x="10" y="38" width="120" height="11" rx="3" fill="#8d95a1" /><text x="140" y="47" fill="#8d95a1" fontSize="10">H2</text><rect x="10" y="62" width="64" height="18" rx="9" fill="#58b894" /><text x="84" y="75" fill="#8d95a1" fontSize="10">CTA</text></svg>;
}

export function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [tab, setTab] = useState<Tab>('studio');
  const [b, setB] = useState<Brief>(() => load('b', B0));
  const [ty, setTy] = useState<Ty>(() => load('ty', TY0));
  const [tp, setTp] = useState<Tp>(() => load('tp', TP0));
  const [place, setPlace] = useState<'left' | 'center' | 'right'>('right');
  const [base, setBase] = useState('#2f6fed');
  const [harm, setHarm] = useState<Harmony>('complementary');
  const [fcat, setFcat] = useState('all');
  const [fq, setFq] = useState('');
  const [plat, setPlat] = useState('');
  const [toast, setToast] = useState('');
  const ar = lang === 'ar', tr = (e: string, a: string) => (ar ? a : e);
  useEffect(() => { document.documentElement.dir = ar ? 'rtl' : 'ltr'; document.documentElement.lang = lang; }, [ar, lang]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ b, ty, tp })); } catch { /* storage unavailable */ } }, [b, ty, tp]);
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setB(p => ({ ...p, [k]: v }));
  const font = FONTS.find(f => f.css === ty.font) ?? FONTS[0];
  const typography = `${font.css} typeface, weight ${ty.weight}, ${ty.align}-aligned, letter-spacing ${ty.spacing}px, clear headline > subhead > CTA hierarchy, text color ${ty.color}${ty.shadow ? ', soft shadow for legibility' : ''}`;
  const r = useMemo(() => build(b), [b]);
  const vs = useMemo(() => (b.text.trim() ? variations(b) : []), [b]);
  const toggle = (k: 'retouchTasks' | 'preserve', v: string) => setB(p => { const cur = p[k] ?? []; return { ...p, [k]: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] }; });
  const copy = (t: string) => { void navigator.clipboard.writeText(t).then(() => { setToast(tr('Copied', 'تم النسخ')); setTimeout(() => setToast(''), 1500); }).catch(() => setToast(tr('Copy failed', 'النسخ فشل'))); };
  const palette = harmony(base, harm);
  const angle = ANGLES.find(a => a.en === b.camera);
  const cur = TABS.find(t => t.id === tab) ?? TABS[0];
  const ratios = [...new Set([b.ratio, '1:1', '4:5', '3:4', '9:16', '16:9', '3:2'])];
  const pickPlat = (id: string) => { const p = PLATFORMS.find(x => x.id === id); if (!p) return; const g = gcd(p.w, p.h); setPlat(id); setB(q => ({ ...q, ratio: `${p.w / g}:${p.h / g}`, platform: `${p.en} (common size ${p.w}x${p.h}px)`, kind: p.kind })); };
  const applyTeacher = () => setB(p => ({ ...p, exactText: [tp.name, tp.subject, tp.grade, tp.center, tp.cta, tp.contact, tp.price].map(x => x.trim()).filter(Boolean), subject: tp.name.trim() ? `teacher portrait of ${tp.name.trim()}` : p.subject, style: p.style ?? 'modern educational design', text: p.text || 'Educational advertisement poster for a teacher' }));
  const txt = (k: 'subject' | 'clothing' | 'background' | 'composition', label: string, ph = '') => <Field label={label}><input type="text" dir="auto" placeholder={ph} value={b[k] ?? ''} onChange={e => set(k, e.target.value)} /></Field>;
  const ring = 2 * Math.PI * 34;
  const fl = FONTS.filter(f => (fcat === 'all' || f.group === fcat) && (!fq || f.css.toLowerCase().includes(fq.toLowerCase()) || f.ar.includes(fq)));

  const panels: Record<Tab, ReactNode> = {
    studio: <>
      <Tip>{tr('Write in Arabic or English. Your words are kept exactly as you wrote them.', 'اكتب بالعربي أو الإنجليزي براحتك. كلامك بيتحفظ زي ما هو من غير ما يتغير.')}</Tip>
      <textarea aria-label="brief" value={b.text} onChange={e => set('text', e.target.value)} placeholder={tr('e.g. natural smartphone portrait, groomed beard, soft window light', 'مثال: بورتريه طبيعي بالموبايل بدقن مهذبة وإضاءة نافذة ناعمة')} />
      <div className="grid2" style={{ marginTop: 12 }}>
        <Field label={tr('Which AI will you use?', 'هتستخدم أنهي ذكاء اصطناعي؟')}><select value={b.model} onChange={e => set('model', e.target.value as Model)}><option value="generic">Gemini / Generic</option><option value="openai">ChatGPT / OpenAI</option><option value="midjourney">Midjourney</option><option value="sd">Stable Diffusion / FLUX</option></select></Field>
        <Field label={tr('Format', 'المقاس')}><select value={b.ratio} onChange={e => set('ratio', e.target.value)}>{ratios.map(x => <option key={x}>{x}</option>)}</select></Field>
      </div>
      {txt('subject', tr('Main subject', 'الموضوع الرئيسي'))}
      <h2>{tr('Creative direction', 'الاتجاه الإبداعي')}</h2><Gal items={STYLES} value={b.style} onPick={v => set('style', v)} lang={lang} art={(_, o) => <Swatch g={GRAD[o.en] ?? '#333'} />} />
      <h2>{tr('Background', 'الخلفية')}</h2><Gal items={BACKGROUNDS} value={b.background} onPick={v => set('background', v)} lang={lang} art={(_, o) => <Swatch g={GRAD[o.en] ?? '#333'} />} />
      <h2>{tr('Exact text inside the image', 'النص اللي هيتكتب جوه الصورة')}</h2>
      <input type="text" dir="auto" placeholder={tr('Separate lines with |', 'افصل بين الأسطر بعلامة |')} value={(b.exactText ?? []).join(' | ')} onChange={e => set('exactText', e.target.value.split('|').map(x => x.trim()).filter(Boolean))} />
      <Field label={tr('Things you do NOT want (comma separated)', 'حاجات مش عايزها (بينهم فاصلة)')}><input type="text" dir="auto" value={(b.exclude ?? []).join(', ')} onChange={e => set('exclude', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} /></Field>
    </>,
    social: <>
      <Tip>{tr('Sizes are common presets, double-check them on the platform. Picking one sets the format for you.', 'المقاسات دي شائعة، اتأكد منها من المنصة نفسها. اختيارك بيظبط المقاس لوحده.')}</Tip>
      <div className="pgrid">{PLATFORMS.map(p => <button key={p.id} className={'pc' + (plat === p.id ? ' on' : '')} onClick={() => pickPlat(p.id)}><i style={{ width: Math.round(34 * Math.min(1, p.w / p.h)) + 8, height: Math.round(34 * Math.min(1, p.h / p.w)) + 8 }} /><span><b>{ar ? p.ar : p.en}</b><small>{p.w}×{p.h}px</small></span></button>)}</div>
      <h2>{tr('Design type', 'نوع التصميم')}</h2><div className="chips">{KINDS.map(k => <button key={k.en} className={'chip' + (b.kind === k.en ? ' on' : '')} onClick={() => set('kind', b.kind === k.en ? undefined : k.en)}>{ar ? k.ar : k.en}</button>)}</div>
      <h2>{tr('Ad goal', 'هدف الإعلان')}</h2><div className="chips">{GOALS.map(k => <button key={k.en} className={'chip' + (b.goal === k.en ? ' on' : '')} onClick={() => set('goal', b.goal === k.en ? undefined : k.en)}>{ar ? k.ar : k.en}</button>)}</div>
      <h2>{tr('Layout ideas for this format', 'أفكار تكوين للمقاس ده')}</h2>
      <div className="pgrid">{COMPS.map(c => <button key={c.en} className={'gc' + (b.composition === c.desc ? ' on' : '')} onClick={() => { setPlace(c.place); set('composition', c.desc); }}><div className="art"><LayoutPreview ratio={b.ratio} place={c.place} text={c.text} h={110} /></div><span>{ar ? c.ar : c.en}</span></button>)}</div>
    </>,
    portrait: <>
      <Tip>{tr('Tap a card to choose, tap again to clear. Each card shows what you will get.', 'دوس على الكارت عشان تختار، ودوس تاني عشان تلغي. كل كارت فيه رسمة توضّح الاختيار.')}</Tip>
      {txt('clothing', tr('Exact outfit', 'اللبس بالتفصيل'), tr('e.g. navy two-piece suit, white shirt, no tie', 'مثال: بدلة كحلي، قميص أبيض، من غير كرافتة'))}
      <label className="chk"><input type="checkbox" checked={!!b.identityLock} onChange={e => set('identityLock', e.target.checked)} />{tr('Keep my real face (upload your photo inside the AI tool too)', 'احتفظ بملامح وشي الحقيقية (وارفع صورتك في أداة الذكاء الاصطناعي كمان)')}</label>
      <h2>{tr('Pose', 'الوضعية')}</h2><Gal items={POSES} value={b.pose} onPick={v => set('pose', v)} lang={lang} art={i => <PoseArt i={i} />} cols={5} />
      <h2>{tr('Expression', 'تعبير الوجه')}</h2><Gal items={EXPRESSIONS} value={b.expression} onPick={v => set('expression', v)} lang={lang} art={i => <ExprArt i={i} />} cols={6} />
      <h2>{tr('Camera angle', 'زاوية الكاميرا')}</h2><div className="row" style={{ alignItems: 'flex-start' }}><div style={{ flex: 1 }}><div className="chips">{ANGLES.map(a => <button key={a.en} className={'chip' + (b.camera === a.en ? ' on' : '')} onClick={() => set('camera', b.camera === a.en ? undefined : a.en)}>{ar ? a.ar : a.en}</button>)}</div></div><div className="card"><AngleDiagram deg={angle?.deg ?? 0} /></div></div>
      <h2>{tr('Framing', 'حجم اللقطة')}</h2><Gal items={FRAMINGS} value={b.framing} onPick={v => set('framing', v)} lang={lang} art={i => <FrameArt i={i} />} cols={8} />
      <h2>{tr('Lens', 'العدسة')}</h2><div className="chips">{LENSES.map(a => <button key={a.en} className={'chip' + (b.lens === a.en ? ' on' : '')} onClick={() => set('lens', b.lens === a.en ? undefined : a.en)}>{ar ? a.ar : a.en}</button>)}</div>
      <h2>{tr('Lighting (top view: gold dot = light, white = subject)', 'الإضاءة (منظر من فوق: النقطة الدهبية = الضوء، البيضا = الشخص)')}</h2><Gal items={LIGHTS} value={b.lighting} onPick={v => set('lighting', v)} lang={lang} art={i => <LightArt i={i} />} cols={5} />
    </>,
    type: <>
      <Tip>{tr('These are real fonts. AI models may not copy a font exactly, so for perfect text add it yourself afterwards.', 'دي خطوط حقيقية. نماذج الذكاء الاصطناعي ممكن متنسخش الخط بالظبط، فلو عايز كتابة مضبوطة ١٠٠٪ ضيفها بنفسك بعد التصميم.')}</Tip>
      <div className="chips">{Object.entries(FCATS).map(([k, v]) => <button key={k} className={'chip' + (fcat === k ? ' on' : '')} onClick={() => setFcat(k)}>{ar ? v.ar : v.en}</button>)}</div>
      <input type="text" dir="auto" style={{ margin: '10px 0' }} placeholder={tr('Search fonts…', 'دوّر على خط…')} value={fq} onChange={e => setFq(e.target.value)} />
      <div className="fonts3" style={{ maxHeight: 330, overflow: 'auto' }}>{fl.map(f => <button key={f.css} className={'fc' + (ty.font === f.css ? ' on' : '')} onClick={() => setTy({ ...ty, font: f.css })}><span className="g" dir="auto" style={{ fontFamily: `'${f.css}', sans-serif` }}>{f.arabic ? 'خط عربي جميل' : 'Typography'}</span><b>{ar ? f.ar : f.css}</b><small>{FCATS[f.group]?.[lang]}</small></button>)}</div>
      <h2>{tr('Live preview', 'معاينة حية')}</h2>
      <div className="pv" style={{ fontFamily: `'${font.css}', 'Cairo', sans-serif`, textAlign: ty.align }}>
        <div dir="auto" style={{ fontSize: ty.size, fontWeight: Number(ty.weight), letterSpacing: ty.spacing, color: ty.color, lineHeight: 1.25, textShadow: ty.shadow ? '0 3px 14px #000a' : 'none' }}>{ty.sample}</div>
        <div dir="auto" style={{ fontSize: ty.size * 0.34, opacity: 0.85, margin: '8px 0 14px' }}>{ty.sub}</div>
        <span dir="auto" style={{ display: 'inline-block', background: '#c9a96a', color: '#15171a', padding: '6px 18px', borderRadius: 999, fontSize: ty.size * 0.26, fontWeight: 700 }}>{ty.cta}</span>
      </div>
      <div className="grid2" style={{ marginTop: 12 }}>
        <Field label={tr('Headline', 'العنوان')}><input type="text" dir="auto" value={ty.sample} onChange={e => setTy({ ...ty, sample: e.target.value })} /></Field>
        <Field label={tr('Subheadline', 'العنوان الفرعي')}><input type="text" dir="auto" value={ty.sub} onChange={e => setTy({ ...ty, sub: e.target.value })} /></Field>
        <Field label={tr('Call to action', 'زرار الدعوة')}><input type="text" dir="auto" value={ty.cta} onChange={e => setTy({ ...ty, cta: e.target.value })} /></Field>
        <Field label={tr('Weight', 'السُمك')}><select value={ty.weight} onChange={e => setTy({ ...ty, weight: e.target.value })}><option value="400">Regular</option><option value="700">Bold</option></select></Field>
        <Field label={`${tr('Size', 'الحجم')} ${ty.size}`}><input type="range" min="24" max="90" value={ty.size} onChange={e => setTy({ ...ty, size: Number(e.target.value) })} /></Field>
        <Field label={`${tr('Letter spacing', 'تباعد الحروف')} ${ty.spacing}`}><input type="range" min="-2" max="12" value={ty.spacing} onChange={e => setTy({ ...ty, spacing: Number(e.target.value) })} /></Field>
        <Field label={tr('Alignment', 'المحاذاة')}><select value={ty.align} onChange={e => setTy({ ...ty, align: e.target.value as Ty['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
        <Field label={tr('Color', 'اللون')}><input type="color" value={ty.color} onChange={e => setTy({ ...ty, color: e.target.value })} style={{ width: '100%', height: 38 }} /></Field>
      </div>
      <div className="row"><label className="chk"><input type="checkbox" checked={ty.shadow} onChange={e => setTy({ ...ty, shadow: e.target.checked })} />{tr('Soft shadow', 'ظل ناعم')}</label><HierDiagram /></div>
      <div className="row" style={{ marginTop: 10 }}><button className="btn" onClick={() => setB(p => ({ ...p, typography, exactText: [ty.sample, ty.sub, ty.cta].filter(Boolean) }))}><Icon name="check" />{tr('Use in prompt', 'استخدمه في البرومبت')}</button><button className="btn g" onClick={() => set('typography', undefined)}>{tr('Remove', 'شيله')}</button></div>
    </>,
    layout: <>
      <Tip>{tr('Green = where text can go safely. Dashed lines = thirds.', 'الأخضر = مكان آمن للنص. الخطوط المتقطعة = تقسيم الأثلاث.')}</Tip>
      <div className="grid2"><div className="card"><LayoutPreview ratio={b.ratio} place={place} text={!!b.exactText?.length || !!b.typography} /><small className="tag">{b.ratio}</small></div>
        <div><Field label={tr('Format', 'المقاس')}><select value={b.ratio} onChange={e => set('ratio', e.target.value)}>{ratios.map(x => <option key={x}>{x}</option>)}</select></Field>
          <h2>{tr('Subject placement', 'مكان الشخص')}</h2><div className="chips">{(['left', 'center', 'right'] as const).map(p => <button key={p} className={'chip' + (place === p ? ' on' : '')} onClick={() => { setPlace(p); set('composition', p === 'center' ? 'centered hero subject, text-safe headline area above the subject, clear safe margins' : `subject on the ${p} third, large clean text-safe area on the ${p === 'left' ? 'right' : 'left'}, clear safe margins`); }}>{p === 'left' ? tr('Left', 'شمال') : p === 'right' ? tr('Right', 'يمين') : tr('Center', 'نص')}</button>)}</div>
          {txt('composition', tr('Composition (you can edit)', 'التكوين (تقدر تعدّله)'))}</div></div>
      <h2>{tr('Color palette', 'لوحة الألوان')}</h2>
      <div className="grid2"><Field label={tr('Base color', 'اللون الأساسي')}><input type="color" value={base} onChange={e => setBase(e.target.value)} style={{ width: '100%', height: 38 }} /></Field><Field label={tr('Harmony', 'نوع التناسق')}><select value={harm} onChange={e => setHarm(e.target.value as Harmony)}>{HARMONIES.map(h => <option key={h}>{h}</option>)}</select></Field></div>
      <div className="sw">{palette.map(c => <b key={c} style={{ background: c }}>{c}</b>)}</div>
      <div className="row" style={{ marginTop: 10 }}><button className="btn" onClick={() => set('palette', palette)}><Icon name="check" />{tr('Use palette', 'استخدم اللوحة')}</button>{b.palette && <button className="btn g" onClick={() => set('palette', undefined)}>{tr('Clear', 'امسح')}</button>}</div>
    </>,
    retouch: <>
      <Tip>{tr('This only writes retouch instructions for the AI. It does not edit your photo.', 'ده بيكتب تعليمات ريتاتش للذكاء الاصطناعي بس، مش بيعدّل صورتك بنفسه.')}</Tip>
      <h2>{tr('Strength', 'القوة')}</h2><div className="pgrid">{([['light', 'Light', 'خفيف', 'Tiny clean-up, nothing visible', 'تنضيف بسيط ومش باين'], ['moderate', 'Moderate', 'متوسط', 'Clean, natural, polished', 'نضيف وطبيعي ومصقول'], ['strong', 'Strong', 'قوي', 'Studio-level, keep texture', 'مستوى استوديو مع الحفاظ على الملمس']] as const).map(([k, e, a, de, da]) => <button key={k} className={'pc' + (b.retouch === k ? ' on' : '')} onClick={() => set('retouch', b.retouch === k ? undefined : (k as Retouch))}><span><b>{ar ? a : e}</b><small>{ar ? da : de}</small></span></button>)}</div>
      <h2>{tr('What to improve', 'إيه اللي يتحسّن')}</h2><div className="chips">{RETOUCH_TASKS.map(t => <button key={t.en} className={'chip' + (b.retouchTasks?.includes(t.en) ? ' on' : '')} onClick={() => toggle('retouchTasks', t.en)}>{ar ? t.ar : t.en}</button>)}</div>
      <h2>{tr('Must stay unchanged', 'لازم يفضل زي ما هو')}</h2><div className="chips">{PRESERVE.map(t => <button key={t.en} className={'chip' + (b.preserve?.includes(t.en) ? ' on' : '')} onClick={() => toggle('preserve', t.en)}>{ar ? t.ar : t.en}</button>)}</div>
    </>,
    teacher: <>
      <Tip>{tr('Only what you type appears in the prompt. Nothing is invented.', 'اللي بتكتبه بس هو اللي بيظهر في البرومبت. مفيش حاجة بتتألف.')}</Tip>
      <h2>{tr('Subject look & colors', 'شكل المادة وألوانها')}</h2><div className="pgrid">{TEACH.map(s => <button key={s.en} className="pc" onClick={() => setB(p => ({ ...p, background: s.motif, palette: s.pal, style: 'modern educational design' }))}><span className="sw" style={{ width: 70 }}>{s.pal.slice(0, 3).map(c => <b key={c} style={{ background: c, height: 30, padding: 0 }} />)}</span><span><b>{ar ? s.ar : s.en}</b><small>{tr('tap to apply', 'دوس للتطبيق')}</small></span></button>)}</div>
      <h2>{tr('Poster details', 'بيانات البوستر')}</h2>
      <div className="grid2">{([['name', 'Teacher name', 'اسم المدرس'], ['subject', 'Subject', 'المادة'], ['grade', 'Grade / level', 'الصف'], ['center', 'Center name', 'اسم السنتر'], ['cta', 'Call to action', 'دعوة للتسجيل'], ['contact', 'Contact', 'التواصل'], ['price', 'Price (optional)', 'السعر (اختياري)']] as const).map(([k, e, a]) => <Field key={k} label={tr(e, a)}><input type="text" dir="auto" value={tp[k]} onChange={ev => setTp({ ...tp, [k]: ev.target.value })} /></Field>)}</div>
      <button className="btn" onClick={applyTeacher}><Icon name="check" />{tr('Apply to prompt', 'طبّقها على البرومبت')}</button>
    </>,
    help: <ol style={{ lineHeight: 2.1 }}>{(ar ? ['اكتب فكرتك في استوديو البرومبت واختار الذكاء الاصطناعي اللي هتستخدمه.', 'من سوشيال ميديا اختار المنصة (المقاس بيتظبط لوحده) وهدف الإعلان.', 'من البورتريه والكاميرا اختار الوضعية والتعبير والزاوية والإضاءة واكتب اللبس بالتفصيل.', 'من الخطوط اختار الخط واكتب النص بالظبط وادوس "استخدمه في البرومبت".', 'بص على التقييم والتعارضات على اليمين، وبعدين دوس نسخ والصق في ChatGPT أو Gemini أو Midjourney.', 'لو عايز وشك بالظبط: ارفع صورتك في أداة الذكاء الاصطناعي نفسها، البرومبت لوحده مش بيضمن تطابق الوجه.'] : ['Write your idea and pick your AI.', 'Social Media: pick the platform (format sets itself) and goal.', 'Portrait & Camera: pose, expression, angle, light, and the exact outfit.', 'Typography: pick a font, type the exact text, press "Use in prompt".', 'Check score and conflicts on the right, press Copy, paste in ChatGPT, Gemini or Midjourney.', 'For your exact face: upload your photo inside the AI tool; a prompt alone cannot guarantee it.']).map(x => <li key={x}>{x}</li>)}</ol>,
    status: <>
      <h2>{tr('Working', 'شغال')}</h2><p>{tr('Offline prompt engine, conflicts, score, negatives, model formats, variations, illustrated portrait/camera, 43 fonts, social platforms and layouts, palettes, retouch, teacher poster, Arabic/English with RTL, autosave.', 'محرك البرومبت بدون إنترنت، التعارضات، التقييم، السلبي، تنسيق النماذج، النسخ البديلة، البورتريه والكاميرا برسومات، 43 خط، منصات السوشيال والتكوينات، الألوان، الريتاتش، بوستر المدرس، عربي/إنجليزي، حفظ تلقائي.')}</p>
      <h2>{tr('Not built yet', 'لسه ما اتعملش')}</h2><p>{tr('Video storyboard, Instagram inspiration library, reference image analysis, AI providers and API keys, prompt history, project export/import, light theme, installer icon.', 'ستوريبورد الفيديو، مكتبة إلهام الإنستجرام، تحليل الصور المرجعية، ربط الـ API، سجل البرومبتات، تصدير/استيراد المشاريع، الوضع الفاتح، أيقونة المثبّت.')}</p>
    </>,
  };

  return <div className="shell">
    <nav className="side" aria-label="modules"><div className="logo"><i>PF</i><span>PromptForge<br /><small style={{ color: 'var(--mu)', fontWeight: 400 }}>Studio</small></span></div>
      {TABS.map(t => <button key={t.id} data-tab={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}><Icon name={t.icon} />{ar ? t.ar : t.en}</button>)}
      <div style={{ flex: 1 }} /><button className="tab" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'English' : 'العربية'}</button></nav>
    <main className="main"><div className="hero"><div className="ic"><Icon name={cur.icon} size={24} /></div><div><h1>{ar ? cur.ar : cur.en}</h1><p>{ar ? cur.da : cur.de}</p></div></div>{panels[tab]}</main>
    <aside className="out" aria-label="output">
      <div className="row" style={{ justifyContent: 'flex-start', gap: 12 }}><svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#272c35" strokeWidth="7" /><circle cx="40" cy="40" r="34" fill="none" stroke={r.score.total >= 70 ? '#58b894' : '#c9a96a'} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(ring * r.score.total) / 100} ${ring}`} transform="rotate(-90 40 40)" /><text x="40" y="46" textAnchor="middle" fill="#e9e6df" fontSize="20" fontWeight="700">{r.score.total}</text></svg><div><b>{tr('Quality score', 'تقييم الجودة')}</b><br /><small style={{ color: 'var(--mu)' }}>{r.score.tips.slice(0, 3).join(' · ').replace(/Improve: /g, '')}</small></div></div>
      {r.conflicts.map(c => <div className="warn" key={c.id}><Icon name="alert" /><div><b>{c.message}</b><br />{c.fix}</div></div>)}
      {!r.conflicts.length && <p className="ok"><Icon name="check" /> {tr('No conflicts detected', 'مفيش تعارضات')}</p>}
      <div className="row"><h2>{tr('Prompt', 'البرومبت')}</h2><button className="btn" onClick={() => copy(r.prompt)} disabled={!b.text.trim()}><Icon name="copy" />{tr('Copy', 'نسخ')}</button></div>
      <pre dir="auto">{b.text.trim() ? r.prompt : tr('Write your idea to start.', 'اكتب فكرتك عشان تبدأ.')}</pre>
      {r.negative && <><div className="row"><h2>{tr('Negative prompt', 'البرومبت السلبي')}</h2><button className="btn g" onClick={() => copy(r.negative)}><Icon name="copy" />{tr('Copy', 'نسخ')}</button></div><pre>{r.negative}</pre></>}
      {r.notes.map(n => <p key={n} className="tag">{n}</p>)}
      {vs.length > 0 && <><h2>{tr('Creative variations', 'اتجاهات إبداعية')}</h2>{vs.map(v => <details key={v.name} style={{ marginBottom: 6 }}><summary>{v.name}</summary><pre dir="auto">{v.result.prompt}</pre><button className="btn g" onClick={() => copy(v.result.prompt)}><Icon name="copy" />{tr('Copy', 'نسخ')}</button></details>)}</>}
    </aside>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
