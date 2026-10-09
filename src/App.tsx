import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { build, variations, RATIOS, type Brief, type Model, type Retouch } from './engine/engine.ts';
import { POSES, EXPRESSIONS, ANGLES, FRAMINGS, LENSES, LIGHTS, BACKGROUNDS, STYLES, RETOUCH_TASKS, PRESERVE, FONTS, type Opt } from './data/options.ts';
import { harmony, HARMONIES, type Harmony } from './data/color.ts';
import { Icon, type IconName } from './Icon.tsx';

type Lang = 'en' | 'ar';
type Tab = 'studio' | 'portrait' | 'type' | 'layout' | 'retouch' | 'teacher' | 'help' | 'status';
const TABS: { id: Tab; icon: IconName; en: string; ar: string }[] = [
  { id: 'studio', icon: 'studio', en: 'Prompt Studio', ar: 'استوديو البرومبت' },
  { id: 'portrait', icon: 'portrait', en: 'Portrait & Camera', ar: 'البورتريه والكاميرا' },
  { id: 'type', icon: 'type', en: 'Typography', ar: 'الخطوط' },
  { id: 'layout', icon: 'layout', en: 'Layout & Color', ar: 'التكوين والألوان' },
  { id: 'retouch', icon: 'retouch', en: 'Retouching', ar: 'الريتاتش' },
  { id: 'teacher', icon: 'teacher', en: 'Teacher Poster', ar: 'بوستر المدرس' },
  { id: 'help', icon: 'help', en: 'How to use', ar: 'طريقة الاستخدام' },
  { id: 'status', icon: 'status', en: 'Status', ar: 'حالة البرنامج' },
];
interface Ty { font: string; weight: string; size: number; spacing: number; align: 'left' | 'center' | 'right'; color: string; shadow: boolean; sample: string; sub: string; cta: string }
interface Tp { name: string; subject: string; grade: string; center: string; cta: string; contact: string; price: string }
const TY0: Ty = { font: 'cairo', weight: '900', size: 56, spacing: 0, align: 'center', color: '#f3e3b8', shadow: true, sample: 'أ. محمد عادل', sub: 'Mathematics • الثانوية العامة', cta: 'احجز الآن' };
const TP0: Tp = { name: '', subject: '', grade: '', center: '', cta: '', contact: '', price: '' };
const B0: Brief = { text: '', ratio: '4:5', model: 'generic' };
const KEY = 'pf.v2';
const load = <T,>(k: string, d: T): T => { try { return { ...d, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}')[k] ?? {}) }; } catch { return d; } };

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="f"><span>{label}</span>{children}</label>; }
function Chips({ items, value, onPick, lang }: { items: Opt[]; value?: string; onPick: (v: string | undefined) => void; lang: Lang }) {
  return <div className="chips">{items.map(i => <button key={i.en} className={'chip' + (value === i.en ? ' on' : '')} onClick={() => onPick(value === i.en ? undefined : i.en)}>{lang === 'ar' ? i.ar : i.en}</button>)}</div>;
}
function AngleDiagram({ deg }: { deg: number }) {
  const r = (deg * Math.PI) / 180, cx = 60 + 46 * Math.cos(r), cy = 46 - 40 * Math.sin(r);
  return <svg viewBox="0 0 120 92" width="150" role="img" aria-label="camera elevation"><circle cx="60" cy="46" r="11" fill="#c9a96a" /><path d="M36 84c0-14 10-22 24-22s24 8 24 22z" fill="#6f6249" /><line x1="60" y1="46" x2={cx} y2={cy} stroke="#8d95a1" strokeDasharray="3 3" /><g transform={`translate(${cx} ${cy}) rotate(${-deg})`}><rect x="-9" y="-6" width="18" height="12" rx="3" fill="#e9e6df" /><circle r="3.5" fill="#15171a" /></g></svg>;
}
function LayoutPreview({ ratio, place, text }: { ratio: string; place: 'left' | 'center' | 'right'; text: boolean }) {
  const [a, c] = ratio.split(':').map(Number), H = 300, W = Math.round((H * (a || 1)) / (c || 1)), m = Math.round(W * 0.06);
  const sx = place === 'left' ? W * 0.3 : place === 'right' ? W * 0.7 : W / 2;
  const tz = place === 'center' ? { x: m, y: m, w: W - 2 * m, h: H * 0.2 } : { x: place === 'left' ? W * 0.55 : m, y: H * 0.18, w: W * 0.4 - m / 2, h: H * 0.5 };
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxHeight: 340, background: '#1a1d23', borderRadius: 10 }} role="img" aria-label="layout preview">
    {[1, 2].map(i => <g key={i} stroke="#2e343d" strokeDasharray="4 4"><line x1={(W * i) / 3} y1="0" x2={(W * i) / 3} y2={H} /><line x1="0" y1={(H * i) / 3} x2={W} y2={(H * i) / 3} /></g>)}
    <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke="#3a4250" strokeDasharray="2 3" />
    <ellipse cx={sx} cy={H * (place === 'center' ? 0.5 : 0.42)} rx={W * 0.1} ry={H * 0.1} fill="#c9a96a" /><path d={`M${sx - W * 0.17} ${H}C${sx - W * 0.17} ${H * 0.72} ${sx + W * 0.17} ${H * 0.72} ${sx + W * 0.17} ${H}z`} fill="#6f6249" />
    {text && <rect x={tz.x} y={tz.y} width={tz.w} height={tz.h} rx="6" fill="#58b89433" stroke="#58b894" />}
    <rect x={W / 2 - W * 0.12} y={H - m - 16} width={W * 0.24} height="16" rx="8" fill="#c9a96a" opacity=".85" /><rect x={W - m - 26} y={m + 2} width="22" height="14" rx="3" fill="#8d95a1" />
  </svg>;
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
  const [toast, setToast] = useState('');
  const ar = lang === 'ar', tr = (e: string, a: string) => (ar ? a : e);
  useEffect(() => { document.documentElement.dir = ar ? 'rtl' : 'ltr'; document.documentElement.lang = lang; }, [ar, lang]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ b, ty, tp })); } catch { /* storage unavailable */ } }, [b, ty, tp]);
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setB(p => ({ ...p, [k]: v }));
  const font = FONTS.find(f => f.id === ty.font) ?? FONTS[0];
  const typography = `${font.en} (${font.cat}), weight ${ty.weight}, ${ty.align}-aligned, letter-spacing ${ty.spacing}px, clear headline > subhead > CTA hierarchy, text color ${ty.color}${ty.shadow ? ', soft shadow for legibility' : ''}`;
  const full = useMemo<Brief>(() => ({ ...b, typography: tab === 'studio' && !b.typography && !b.exactText?.length ? undefined : typography }), [b, typography, tab]);
  const r = useMemo(() => build(full), [full]);
  const vs = useMemo(() => (b.text.trim() ? variations(full) : []), [b, full]);
  const toggle = (k: 'retouchTasks' | 'preserve', v: string) => setB(p => { const cur = p[k] ?? []; return { ...p, [k]: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] }; });
  const copy = (t: string) => { void navigator.clipboard.writeText(t).then(() => { setToast(tr('Copied', 'تم النسخ')); setTimeout(() => setToast(''), 1500); }).catch(() => setToast(tr('Copy failed', 'فشل النسخ'))); };
  const txt = (k: 'subject' | 'clothing' | 'background' | 'composition', label: string, ph = '') => <Field label={label}><input type="text" placeholder={ph} value={b[k] ?? ''} onChange={e => set(k, e.target.value)} /></Field>;
  const palette = harmony(base, harm);
  const angle = ANGLES.find(a => a.en === b.camera);
  const applyTeacher = () => setB(p => ({ ...p, exactText: [tp.name, tp.subject, tp.grade, tp.center, tp.cta, tp.contact, tp.price].map(x => x.trim()).filter(Boolean), subject: tp.name.trim() ? `teacher portrait of ${tp.name.trim()}` : p.subject, style: p.style ?? 'modern educational design', text: p.text || 'Educational advertisement poster for a teacher' }));
  const ring = 2 * Math.PI * 34;

  const panels: Record<Tab, ReactNode> = {
    studio: <>
      <h1>{tr('Prompt Studio', 'استوديو البرومبت')}</h1><p className="sub">{tr('Describe your idea in Arabic or English. Your wording is never rewritten.', 'اكتب فكرتك بالعربي أو الإنجليزي. كلامك لا يتم تغييره.')}</p>
      <textarea aria-label="brief" value={b.text} onChange={e => set('text', e.target.value)} placeholder={tr('e.g. natural smartphone portrait, groomed beard, soft window light', 'مثال: بورتريه طبيعي بالموبايل بدقن مهذبة وإضاءة نافذة ناعمة')} />
      <div className="grid2" style={{ marginTop: 12 }}>
        <Field label={tr('Target model', 'النموذج المستهدف')}><select value={b.model} onChange={e => set('model', e.target.value as Model)}><option value="generic">Generic / Gemini</option><option value="openai">ChatGPT / OpenAI</option><option value="midjourney">Midjourney</option><option value="sd">Stable Diffusion / FLUX</option></select></Field>
        <Field label={tr('Format', 'المقاس')}><select value={b.ratio} onChange={e => set('ratio', e.target.value)}>{RATIOS.map(x => <option key={x}>{x}</option>)}</select></Field>
        <Field label={tr('Platform / type', 'المنصة / النوع')}><select value={b.platform ?? ''} onChange={e => set('platform', e.target.value || undefined)}><option value="">—</option>{['Instagram feed post', 'Instagram story', 'Instagram cover', 'YouTube thumbnail', 'Facebook post', 'LinkedIn graphic', 'Teacher poster'].map(x => <option key={x}>{x}</option>)}</select></Field>
        {txt('subject', tr('Main subject', 'الموضوع الرئيسي'))}
      </div>
      <h2>{tr('Creative direction', 'الاتجاه الإبداعي')}</h2><Chips items={STYLES} value={b.style} onPick={v => set('style', v)} lang={lang} />
      <h2>{tr('Background', 'الخلفية')}</h2><Chips items={BACKGROUNDS} value={b.background} onPick={v => set('background', v)} lang={lang} />
      <h2>{tr('Exact text in the image', 'النص المكتوب داخل الصورة')}</h2>
      <input type="text" dir="auto" placeholder={tr('Separate lines with |', 'افصل الأسطر بعلامة |')} value={(b.exactText ?? []).join(' | ')} onChange={e => set('exactText', e.target.value.split('|').map(x => x.trim()).filter(Boolean))} />
      <Field label={tr('Things to exclude (comma separated)', 'أشياء لا تريدها (مفصولة بفاصلة)')}><input type="text" value={(b.exclude ?? []).join(', ')} onChange={e => set('exclude', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} /></Field>
    </>,
    portrait: <>
      <h1>{tr('Portrait & Camera', 'البورتريه والكاميرا')}</h1><p className="sub">{tr('Click a chip to select, click again to clear.', 'اضغط للاختيار، واضغط مرة أخرى للإلغاء.')}</p>
      {txt('clothing', tr('Exact outfit', 'اللبس بالتفصيل'), tr('e.g. navy two-piece suit, white shirt, no tie', 'مثال: بدلة كحلي، قميص أبيض، بدون كرافتة'))}
      <label className="chk"><input type="checkbox" checked={!!b.identityLock} onChange={e => set('identityLock', e.target.checked)} />{tr('Identity preservation lock (needs a reference image in your AI tool)', 'قفل الحفاظ على الهوية (يحتاج صورة مرجعية في أداة الذكاء الاصطناعي)')}</label>
      <h2>{tr('Pose', 'الوضعية')}</h2><Chips items={POSES} value={b.pose} onPick={v => set('pose', v)} lang={lang} />
      <h2>{tr('Expression', 'تعبير الوجه')}</h2><Chips items={EXPRESSIONS} value={b.expression} onPick={v => set('expression', v)} lang={lang} />
      <h2>{tr('Camera angle', 'زاوية الكاميرا')}</h2><div className="row" style={{ alignItems: 'flex-start' }}><div style={{ flex: 1 }}><Chips items={ANGLES} value={b.camera} onPick={v => set('camera', v)} lang={lang} /></div><div className="card"><AngleDiagram deg={angle?.deg ?? 0} /><small className="tag">{tr('camera elevation', 'ارتفاع الكاميرا')}</small></div></div>
      <h2>{tr('Framing', 'حجم اللقطة')}</h2><Chips items={FRAMINGS} value={b.framing} onPick={v => set('framing', v)} lang={lang} />
      <h2>{tr('Lens & depth of field', 'العدسة وعمق المجال')}</h2><Chips items={LENSES} value={b.lens} onPick={v => set('lens', v)} lang={lang} />
      <h2>{tr('Lighting', 'الإضاءة')}</h2><Chips items={LIGHTS} value={b.lighting} onPick={v => set('lighting', v)} lang={lang} />
    </>,
    type: <>
      <h1>{tr('Typography Studio', 'استوديو الخطوط')}</h1><p className="sub">{tr('Real bundled fonts. The preview shows the style; AI models may not reproduce a font exactly.', 'خطوط حقيقية مدمجة. المعاينة توضّح الأسلوب، وقد لا تطابقه نماذج الذكاء الاصطناعي حرفياً.')}</p>
      <div className="fonts">{FONTS.map(f => <button key={f.id} className={'fc' + (ty.font === f.id ? ' on' : '')} onClick={() => setTy({ ...ty, font: f.id })}><span className="g" style={{ fontFamily: `${f.css}, sans-serif` }}>{f.arabic ? 'أبجد هوز 123' : 'Aa Typography'}</span><b>{ar ? f.ar : f.en}</b><small>{f.cat}</small></button>)}</div>
      <h2>{tr('Live preview', 'معاينة حية')}</h2>
      <div className="pv" style={{ fontFamily: `${font.css}, 'Cairo', sans-serif`, textAlign: ty.align }}>
        <div dir="auto" style={{ fontSize: ty.size, fontWeight: Number(ty.weight), letterSpacing: ty.spacing, color: ty.color, lineHeight: 1.2, textShadow: ty.shadow ? '0 3px 14px #000a' : 'none' }}>{ty.sample}</div>
        <div dir="auto" style={{ fontSize: ty.size * 0.34, opacity: 0.85, margin: '8px 0 14px' }}>{ty.sub}</div>
        <span dir="auto" style={{ display: 'inline-block', background: '#c9a96a', color: '#15171a', padding: '6px 18px', borderRadius: 999, fontSize: ty.size * 0.26, fontWeight: 700 }}>{ty.cta}</span>
      </div>
      <div className="grid2" style={{ marginTop: 12 }}>
        <Field label={tr('Headline', 'العنوان')}><input type="text" dir="auto" value={ty.sample} onChange={e => setTy({ ...ty, sample: e.target.value })} /></Field>
        <Field label={tr('Subheadline', 'العنوان الفرعي')}><input type="text" dir="auto" value={ty.sub} onChange={e => setTy({ ...ty, sub: e.target.value })} /></Field>
        <Field label={tr('Call to action', 'زر الدعوة')}><input type="text" dir="auto" value={ty.cta} onChange={e => setTy({ ...ty, cta: e.target.value })} /></Field>
        <Field label={tr('Weight', 'السُمك')}><select value={ty.weight} onChange={e => setTy({ ...ty, weight: e.target.value })}><option value="400">Regular</option><option value="700">Bold</option><option value="900">Black</option></select></Field>
        <Field label={`${tr('Size', 'الحجم')} ${ty.size}`}><input type="range" min="24" max="90" value={ty.size} onChange={e => setTy({ ...ty, size: Number(e.target.value) })} /></Field>
        <Field label={`${tr('Letter spacing', 'تباعد الحروف')} ${ty.spacing}`}><input type="range" min="-2" max="12" value={ty.spacing} onChange={e => setTy({ ...ty, spacing: Number(e.target.value) })} /></Field>
        <Field label={tr('Alignment', 'المحاذاة')}><select value={ty.align} onChange={e => setTy({ ...ty, align: e.target.value as Ty['align'] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></Field>
        <Field label={tr('Color', 'اللون')}><input type="color" value={ty.color} onChange={e => setTy({ ...ty, color: e.target.value })} style={{ width: '100%', height: 38 }} /></Field>
      </div>
      <label className="chk"><input type="checkbox" checked={ty.shadow} onChange={e => setTy({ ...ty, shadow: e.target.checked })} />{tr('Soft shadow for legibility', 'ظل ناعم لوضوح القراءة')}</label>
      <div className="row" style={{ marginTop: 10 }}><button className="btn" onClick={() => { set('typography', typography); set('exactText', [ty.sample, ty.sub, ty.cta].filter(Boolean)); }}><Icon name="check" />{tr('Use in prompt (with this text)', 'استخدم في البرومبت (بهذا النص)')}</button><button className="btn g" onClick={() => set('typography', undefined)}>{tr('Remove', 'إزالة')}</button></div>
    </>,
    layout: <>
      <h1>{tr('Layout & Color', 'التكوين والألوان')}</h1><p className="sub">{tr('Live preview for the selected format.', 'معاينة حية للمقاس المختار.')}</p>
      <div className="grid2"><div className="card"><LayoutPreview ratio={b.ratio} place={place} text={!!b.exactText?.length || !!b.typography} /><small className="tag">{b.ratio} • {tr('green = text-safe zone', 'الأخضر = مساحة النص')}</small></div>
        <div><Field label={tr('Format', 'المقاس')}><select value={b.ratio} onChange={e => set('ratio', e.target.value)}>{RATIOS.map(x => <option key={x}>{x}</option>)}</select></Field>
          <h2>{tr('Subject placement', 'مكان الشخص')}</h2><div className="chips">{(['left', 'center', 'right'] as const).map(p => <button key={p} className={'chip' + (place === p ? ' on' : '')} onClick={() => { setPlace(p); set('composition', p === 'center' ? 'centered hero subject, text-safe headline area above the subject, clear safe margins' : `subject on the ${p} third, large clean text-safe area on the ${p === 'left' ? 'right' : 'left'}, clear safe margins`); }}>{p === 'left' ? tr('Left', 'يسار') : p === 'right' ? tr('Right', 'يمين') : tr('Center', 'وسط')}</button>)}</div>
          {txt('composition', tr('Composition (editable)', 'التكوين (قابل للتعديل)'))}</div></div>
      <h2>{tr('Color palette', 'لوحة الألوان')}</h2>
      <div className="grid2"><Field label={tr('Base color', 'اللون الأساسي')}><input type="color" value={base} onChange={e => setBase(e.target.value)} style={{ width: '100%', height: 38 }} /></Field><Field label={tr('Harmony', 'نوع التناسق')}><select value={harm} onChange={e => setHarm(e.target.value as Harmony)}>{HARMONIES.map(h => <option key={h}>{h}</option>)}</select></Field></div>
      <div className="sw">{palette.map(c => <b key={c} style={{ background: c }}>{c}</b>)}</div>
      <div className="row" style={{ marginTop: 10 }}><button className="btn" onClick={() => set('palette', palette)}><Icon name="check" />{tr('Use palette', 'استخدم اللوحة')}</button>{b.palette && <button className="btn g" onClick={() => set('palette', undefined)}>{tr('Clear', 'مسح')}</button>}</div>
    </>,
    retouch: <>
      <h1>{tr('Retouching Prompt', 'برومبت الريتاتش')}</h1><p className="sub">{tr('Builds retouching instructions only. It does not edit images.', 'ينشئ تعليمات ريتاتش فقط، ولا يعدّل الصور فعلياً.')}</p>
      <h2>{tr('Intensity', 'القوة')}</h2><div className="chips">{(['light', 'moderate', 'strong'] as Retouch[]).map(x => <button key={x} className={'chip' + (b.retouch === x ? ' on' : '')} onClick={() => set('retouch', b.retouch === x ? undefined : x)}>{x === 'light' ? tr('Light', 'خفيف') : x === 'moderate' ? tr('Moderate', 'متوسط') : tr('Strong', 'قوي')}</button>)}</div>
      <h2>{tr('Tasks', 'المهام')}</h2><div className="chips">{RETOUCH_TASKS.map(t => <button key={t.en} className={'chip' + (b.retouchTasks?.includes(t.en) ? ' on' : '')} onClick={() => toggle('retouchTasks', t.en)}>{ar ? t.ar : t.en}</button>)}</div>
      <h2>{tr('Preserve unchanged', 'يجب الحفاظ عليه')}</h2><div className="chips">{PRESERVE.map(t => <button key={t.en} className={'chip' + (b.preserve?.includes(t.en) ? ' on' : '')} onClick={() => toggle('preserve', t.en)}>{ar ? t.ar : t.en}</button>)}</div>
    </>,
    teacher: <>
      <h1>{tr('Teacher Poster Studio', 'استوديو بوستر المدرس')}</h1><p className="sub">{tr('Only the details you enter appear in the prompt. Nothing is invented.', 'يظهر في البرومبت ما تكتبه فقط، ولا يتم اختراع أي معلومة.')}</p>
      <div className="grid2">{([['name', 'Teacher name', 'اسم المدرس'], ['subject', 'Subject', 'المادة'], ['grade', 'Grade / level', 'الصف'], ['center', 'Center name', 'اسم السنتر'], ['cta', 'Call to action', 'دعوة للتسجيل'], ['contact', 'Contact', 'التواصل'], ['price', 'Price (optional)', 'السعر (اختياري)']] as const).map(([k, e, a]) => <Field key={k} label={tr(e, a)}><input type="text" dir="auto" value={tp[k]} onChange={ev => setTp({ ...tp, [k]: ev.target.value })} /></Field>)}</div>
      <button className="btn" onClick={applyTeacher}><Icon name="check" />{tr('Apply to prompt', 'طبّق على البرومبت')}</button>
    </>,
    help: <>
      <h1>{tr('How to use', 'طريقة الاستخدام')}</h1>
      <ol style={{ lineHeight: 2 }}>{(ar ? ['اكتب فكرتك في استوديو البرومبت واختر النموذج والمقاس.', 'من البورتريه والكاميرا اختر الوضعية والتعبير والزاوية والعدسة والإضاءة واكتب اللبس بالتفصيل.', 'من الخطوط اختر الخط واكتب النص بالظبط واضغط "استخدم في البرومبت".', 'من التكوين اختر مكان الشخص والألوان.', 'راجع التقييم والتعارضات على اليمين، ثم اضغط نسخ والصق البرومبت في ChatGPT أو Gemini أو Midjourney.', 'للهوية: ارفع صورتك المرجعية في أداة الذكاء الاصطناعي نفسها، فالبرومبت وحده لا يضمن تطابق الوجه.'] : ['Write your idea in Prompt Studio and pick model and format.', 'In Portrait & Camera choose pose, expression, angle, lens, lighting, and describe the outfit.', 'In Typography choose a font, type the exact text, press "Use in prompt".', 'In Layout & Color pick subject placement and palette.', 'Check the score and conflicts on the right, press Copy, paste into ChatGPT, Gemini or Midjourney.', 'For identity: upload your reference photo inside the AI tool itself; a prompt alone cannot guarantee the same face.']).map(x => <li key={x}>{x}</li>)}</ol>
    </>,
    status: <>
      <h1>{tr('Honest status (v0.2)', 'حالة البرنامج بصراحة (v0.2)')}</h1>
      <h2>{tr('Working', 'شغال')}</h2><p>{tr('Prompt engine (offline), conflicts, score, negatives, model formats, variations, portrait/camera, typography with real fonts, layout preview, palettes, retouch prompt, teacher poster, EN/AR with RTL, autosave.', 'محرك البرومبت (بدون إنترنت)، كشف التعارض، التقييم، السلبي، تنسيق النماذج، النسخ البديلة، البورتريه والكاميرا، الخطوط الحقيقية، معاينة التكوين، الألوان، الريتاتش، بوستر المدرس، عربي/إنجليزي، حفظ تلقائي.')}</p>
      <h2>{tr('Not built yet', 'لسه ما اتعملش')}</h2><p>{tr('Video storyboard, Instagram inspiration library, reference image analysis, AI providers/API keys and direct generation, prompt history/versions, project export/import, light theme, installer icon.', 'ستوريبورد الفيديو، مكتبة إلهام الإنستجرام، تحليل الصور المرجعية، ربط مزودي الذكاء الاصطناعي وتوليد الصور مباشرة، سجل وإصدارات البرومبتات، تصدير/استيراد المشاريع، الوضع الفاتح، أيقونة المثبّت.')}</p>
    </>,
  };

  return <div className="shell">
    <nav className="side" aria-label="modules"><div className="logo"><i>PF</i><span>PromptForge<br /><small style={{ color: 'var(--mu)', fontWeight: 400 }}>Studio</small></span></div>
      {TABS.map(t => <button key={t.id} data-tab={t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}><Icon name={t.icon} />{ar ? t.ar : t.en}</button>)}
      <div style={{ flex: 1 }} /><button className="tab" onClick={() => setLang(ar ? 'en' : 'ar')}>{ar ? 'English' : 'العربية'}</button></nav>
    <main className="main">{panels[tab]}</main>
    <aside className="out" aria-label="output">
      <div className="row"><div className="row" style={{ gap: 12 }}><svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="#272c35" strokeWidth="7" /><circle cx="40" cy="40" r="34" fill="none" stroke={r.score.total >= 70 ? '#58b894' : '#c9a96a'} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(ring * r.score.total) / 100} ${ring}`} transform="rotate(-90 40 40)" /><text x="40" y="46" textAnchor="middle" fill="#e9e6df" fontSize="20" fontWeight="700">{r.score.total}</text></svg><div><b>{tr('Quality score', 'تقييم الجودة')}</b><br /><small style={{ color: 'var(--mu)' }}>{r.score.tips.slice(0, 3).join(' · ').replace(/Improve: /g, '')}</small></div></div></div>
      {r.conflicts.map(c => <div className="warn" key={c.id}><Icon name="alert" /><div><b>{c.message}</b><br />{c.fix}</div></div>)}
      {!r.conflicts.length && <p className="ok"><Icon name="check" /> {tr('No conflicts detected', 'لا توجد تعارضات')}</p>}
      <div className="row"><h2>{tr('Prompt', 'البرومبت')}</h2><button className="btn" onClick={() => copy(r.prompt)} disabled={!b.text.trim()}><Icon name="copy" />{tr('Copy', 'نسخ')}</button></div>
      <pre dir="auto">{b.text.trim() ? r.prompt : tr('Write your idea to start.', 'اكتب فكرتك لتبدأ.')}</pre>
      {r.negative && <><div className="row"><h2>{tr('Negative prompt', 'البرومبت السلبي')}</h2><button className="btn g" onClick={() => copy(r.negative)}><Icon name="copy" />{tr('Copy', 'نسخ')}</button></div><pre>{r.negative}</pre></>}
      {r.notes.map(n => <p key={n} className="tag">{n}</p>)}
      {vs.length > 0 && <><h2>{tr('Creative variations', 'اتجاهات إبداعية')}</h2>{vs.map(v => <details key={v.name} style={{ marginBottom: 6 }}><summary>{v.name}</summary><pre dir="auto">{v.result.prompt}</pre><button className="btn g" onClick={() => copy(v.result.prompt)}><Icon name="copy" />{tr('Copy', 'نسخ')}</button></details>)}</>}
    </aside>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
