import { useEffect, useMemo, useState } from 'react';
import { build, variations, RATIOS, type Brief, type Model } from './engine/engine.ts';
const T = {
  en: { brief: 'Creative brief', gen: 'Generated prompt', neg: 'Negative prompt', score: 'Quality score', conf: 'Conflicts', copy: 'Copy', vars: 'Variations', id: 'Preserve identity', none: 'None' },
  ar: { brief: 'وصف الفكرة', gen: 'البرومبت الناتج', neg: 'البرومبت السلبي', score: 'تقييم الجودة', conf: 'التعارضات', copy: 'نسخ', vars: 'نسخ بديلة', id: 'الحفاظ على الهوية', none: 'لا يوجد' },
};
const KEY = 'pf.brief.v1';
const init: Brief = { text: '', ratio: '4:5', model: 'generic' };
const css = `*{box-sizing:border-box}body{margin:0;background:#15171a;color:#e8e6e1;font-family:'Segoe UI',Tahoma,sans-serif}
.app{display:grid;grid-template-columns:420px 1fr;gap:16px;padding:16px;height:100vh}.pane{background:#1d2024;border:1px solid #2c3036;border-radius:10px;padding:16px;overflow:auto}
h1{font-size:18px;margin:0 0 12px}h2{font-size:13px;margin:16px 0 6px;color:#c9a96a;text-transform:uppercase;letter-spacing:.06em}
input,select,textarea{width:100%;background:#15171a;color:inherit;border:1px solid #333840;border-radius:6px;padding:8px;margin-bottom:8px;font:inherit}textarea{min-height:110px}
button{background:#c9a96a;color:#15171a;border:0;border-radius:6px;padding:8px 14px;font-weight:600;cursor:pointer}pre{white-space:pre-wrap;background:#15171a;border-radius:6px;padding:12px;line-height:1.5}
.warn{border-inline-start:3px solid #d9625b;padding:6px 10px;margin:6px 0;background:#2a1f1f}.bar{display:flex;justify-content:space-between;align-items:center}`;
export function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [b, setB] = useState<Brief>(() => { try { return { ...init, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return init; } });
  const t = T[lang];
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* storage unavailable */ } }, [b]);
  useEffect(() => { document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; }, [lang]);
  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setB(p => ({ ...p, [k]: v }));
  const r = useMemo(() => build(b), [b]);
  const vs = useMemo(() => (b.text.trim() ? variations(b) : []), [b]);
  const f = (k: keyof Brief, ph: string) => <input placeholder={ph} value={(b[k] as string) ?? ''} onChange={e => set(k, e.target.value as never)} />;
  return (<><style>{css}</style><div className="app">
    <div className="pane"><div className="bar"><h1>PromptForge Studio</h1><button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>{lang === 'en' ? 'عربي' : 'EN'}</button></div>
      <h2>{t.brief}</h2><textarea value={b.text} onChange={e => set('text', e.target.value)} />
      <select value={b.model} onChange={e => set('model', e.target.value as Model)}>{['generic', 'midjourney', 'openai', 'sd'].map(m => <option key={m}>{m}</option>)}</select>
      <select value={b.ratio} onChange={e => set('ratio', e.target.value)}>{RATIOS.map(x => <option key={x}>{x}</option>)}</select>
      {f('subject', 'Subject')}{f('clothing', 'Clothing')}{f('pose', 'Pose')}{f('expression', 'Expression')}{f('camera', 'Camera angle')}{f('framing', 'Framing')}{f('lens', 'Lens')}{f('lighting', 'Lighting')}{f('background', 'Background')}{f('composition', 'Composition')}
      <input placeholder="Exact text (separate with |)" value={(b.exactText ?? []).join('|')} onChange={e => set('exactText', e.target.value.split('|').filter(Boolean))} />
      <label><input type="checkbox" style={{ width: 'auto' }} checked={!!b.identityLock} onChange={e => set('identityLock', e.target.checked)} /> {t.id}</label>
      <select value={b.retouch ?? ''} onChange={e => set('retouch', (e.target.value || undefined) as Brief['retouch'])}><option value="">Retouch: {t.none}</option><option>light</option><option>moderate</option><option>strong</option></select>
    </div>
    <div className="pane"><h2>{t.score}: {r.score.total}/100</h2><small>{r.score.tips.join(' · ')}</small>
      <h2>{t.conf}</h2>{r.conflicts.length ? r.conflicts.map(c => <div className="warn" key={c.id}><b>{c.message}</b><br />{c.fix}</div>) : <small>{t.none}</small>}
      <div className="bar"><h2>{t.gen}</h2><button onClick={() => navigator.clipboard.writeText(r.prompt)}>{t.copy}</button></div><pre dir="auto">{r.prompt}</pre>
      {r.negative && <><h2>{t.neg}</h2><pre>{r.negative}</pre></>}
      {r.notes.map(n => <small key={n}>{n}<br /></small>)}
      {vs.length > 0 && <><h2>{t.vars}</h2>{vs.map(v => <details key={v.name}><summary>{v.name}</summary><pre dir="auto">{v.result.prompt}</pre></details>)}</>}
    </div></div></>);
}
