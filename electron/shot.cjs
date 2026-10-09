const { app, BrowserWindow } = require('electron');
const fs = require('fs'); const path = require('path');
const TABS = ['studio', 'portrait', 'type', 'layout', 'retouch', 'teacher', 'help', 'status'];
const wait = ms => new Promise(r => setTimeout(r, ms));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1440, height: 860, show: true, backgroundColor: '#0e1013' });
  await win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  const out = path.join(__dirname, '..', 'screenshots'); fs.mkdirSync(out, { recursive: true });
  await win.webContents.executeJavaScript(`(()=>{const t=document.querySelector('textarea');const s=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;s.call(t,'بورتريه طبيعي بالموبايل لمدرس رياضيات، دقن مهذبة، إضاءة نافذة ناعمة');t.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await wait(800);
  for (const t of TABS) {
    await win.webContents.executeJavaScript(`document.querySelector('[data-tab="${t}"]').click()`);
    await wait(900);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(out, `${TABS.indexOf(t) + 1}-${t}.png`), img.toPNG());
  }
  app.quit();
});
