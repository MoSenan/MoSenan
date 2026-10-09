const { app, BrowserWindow } = require('electron');
const fs = require('fs'); const path = require('path');
const TABS = ['studio', 'social', 'portrait', 'type', 'layout', 'retouch', 'teacher', 'help', 'status'];
const wait = ms => new Promise(r => setTimeout(r, ms));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1440, height: 860, show: true, backgroundColor: '#0e1013' });
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  const out = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(out, { recursive: true });
  const demo = { b: { text: 'بورتريه طبيعي بالموبايل لمدرس رياضيات، دقن مهذبة، إضاءة نافذة ناعمة', ratio: '4:5', model: 'generic', platform: 'Instagram feed post (common size 1080x1350px)', kind: 'Social media post image', goal: 'student registration', style: 'modern educational design', background: 'modern classroom', pose: 'standing confidently, relaxed shoulders', expression: 'subtle smile', camera: 'eye-level', framing: 'waist-up', lens: '85mm portrait lens, f/1.8 creamy background blur', lighting: 'soft window light', clothing: 'navy two-piece suit, white shirt', identityLock: true, retouch: 'light', exactText: ['أ. محمد عادل', 'Mathematics'] } };
  await win.webContents.executeJavaScript(`localStorage.setItem('pf.v2', ${JSON.stringify(JSON.stringify(demo))})`);
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  await wait(1500);
  for (const t of TABS) {
    await win.webContents.executeJavaScript(`document.querySelector('[data-tab="${t}"]').click()`);
    await wait(900);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(out, `${TABS.indexOf(t) + 1}-${t}.png`), img.toPNG());
  }
  app.quit();
});
