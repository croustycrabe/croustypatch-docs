import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';

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
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
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
