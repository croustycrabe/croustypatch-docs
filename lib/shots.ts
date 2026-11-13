import fs from 'node:fs';
import path from 'node:path';

export type Slide = { name: string; title: string; caption: string; light: string; dark: string; w: number; h: number };

// Reads public/shots/manifest.json: [{file, title, caption, theme}], files named <name>-light.webp / <name>-dark.webp
export function getSlides(opts: { phone?: boolean } = {}): Slide[] {
  const dir = path.join(process.cwd(), 'public', 'shots');
  let list: { file: string; title: string; caption: string; theme: string; width?: number; height?: number }[] = [];
  try { list = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')); } catch { return []; }
  const byName = new Map<string, Slide>();
  for (const it of list) {
    const m = /^(.*)-(light|dark)\.webp$/.exec(it.file);
    if (!m || !fs.existsSync(path.join(dir, it.file))) continue;
    const s = byName.get(m[1]) ?? { name: m[1], title: it.title, caption: it.caption, light: '', dark: '', w: it.width ?? 1440, h: it.height ?? 900 };
    if (m[2] === 'light') s.light = `/shots/${it.file}`; else s.dark = `/shots/${it.file}`;
    byName.set(m[1], s);
  }
  return [...byName.values()].filter((s) => (s.light || s.dark) && s.name.endsWith('-phone') === !!opts.phone).map((s) => ({ ...s, light: s.light || s.dark, dark: s.dark || s.light }));
}
