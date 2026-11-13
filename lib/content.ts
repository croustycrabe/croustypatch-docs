import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { site } from './site';

export type Section = 'user' | 'tech';
export type Heading = { id: string; text: string; depth: number };
export type Doc = {
  section: Section; slug: string; title: string; description: string; order: number;
  group: string; html: string; headings: Heading[]; text: string;
};

export const SECTIONS: Record<Section, { label: string; base: string; blurb: string }> = {
  user: { label: 'User guide', base: '/docs', blurb: 'How to use every feature, step by step.' },
  tech: { label: 'Technical', base: '/technical', blurb: 'How CroustyPatch is built and why.' },
};

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

function render(md: string) {
  const headings: Heading[] = [];
  const used = new Set<string>();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading(token) {
        let id = slugify(token.text) || 'section';
        while (used.has(id)) id += '-2';
        used.add(id);
        if (token.depth === 2 || token.depth === 3) headings.push({ id, text: token.text, depth: token.depth });
        return `<h${token.depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
      },
      code(token) {
        const lang = (token.lang ?? '').split(/\s+/)[0] || 'text';
        const esc = token.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return `<div class="codeblock"><div class="code-head"><span class="code-lang">${lang}</span><button type="button" class="copy-btn" aria-label="Copy ${lang} code to the clipboard"><svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="M216 32H88a8 8 0 0 0-8 8v40H40a8 8 0 0 0-8 8v128a8 8 0 0 0 8 8h128a8 8 0 0 0 8-8v-40h40a8 8 0 0 0 8-8V40a8 8 0 0 0-8-8Zm-56 176H48V96h112Zm48-48h-32V88a8 8 0 0 0-8-8H96V48h112Z"/></svg><span class="copy-label">Copy</span></button></div><pre><code>${esc}</code></pre></div>\n`;
      },
      table(token) {
        // wrap tables so they scroll sideways on phones
        const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
        const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
      },
    },
  });
  const html = marked.parse(md, { async: false }) as string;
  return { html, headings };
}

const cache = new Map<Section, Doc[]>();

export function getDocs(section: Section): Doc[] {
  const hit = cache.get(section);
  if (hit) return hit;
  const dir = path.join(process.cwd(), 'content', section);
  const docs = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((file) => {
    const parsed = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const data = parsed.data;
    // {{owner}}, {{repoUrl}}, {{releasesUrl}}, {{issuesUrl}}, {{image}} come from lib/site.ts
    const content = parsed.content.replace(/\{\{(\w+)\}\}/g, (m, k: string) => (site as Record<string, string>)[k] ?? m);
    const { html, headings } = render(content);
    return {
      section, slug: file.replace(/\.md$/, ''), title: String(data.title), description: String(data.description ?? ''),
      order: Number(data.order ?? 99), group: String(data.group ?? ''), html, headings,
      text: content.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*`|_\[\]()-]/g, ' ').replace(/\s+/g, ' ').trim(),
    } satisfies Doc;
  }).sort((a, b) => a.order - b.order);
  cache.set(section, docs);
  return docs;
}

export const docUrl = (d: Pick<Doc, 'section' | 'slug'>) => `${SECTIONS[d.section].base}/${d.slug}/`;
