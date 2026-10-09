import fs from 'node:fs'; import path from 'node:path';
const root = 'node_modules/@fontsource'; const lines = [];
for (const id of fs.existsSync(root) ? fs.readdirSync(root).sort() : [])
  for (const w of ['400', '700']) if (fs.existsSync(path.join(root, id, `${w}.css`))) lines.push(`import '@fontsource/${id}/${w}.css';`);
fs.writeFileSync('src/fonts.ts', lines.join('\n') + '\nexport {};\n');
console.log(`fonts: ${lines.length} css files imported`);
