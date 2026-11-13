'use client';
import { useEffect, useRef, useState } from 'react';

type Item = { url: string; title: string; section: string; description: string; headings: { id: string; text: string }[]; text: string };
type Hit = { url: string; title: string; section: string; snippet: string; score: number };

function search(items: Item[], q: string): Hit[] {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const hits: Hit[] = [];
  for (const it of items) {
    const title = it.title.toLowerCase();
    const body = it.text.toLowerCase();
    let score = 0;
    let ok = true;
    for (const t of terms) {
      let s = 0;
      if (title.includes(t)) s += 10;
      if (it.headings.some((h) => h.text.toLowerCase().includes(t))) s += 5;
      if (it.description.toLowerCase().includes(t)) s += 3;
      if (body.includes(t)) s += 1;
      if (!s) { ok = false; break; }
      score += s;
    }
    if (!ok) continue;
    const heading = it.headings.find((h) => terms.every((t) => h.text.toLowerCase().includes(t)));
    const i = body.indexOf(terms[0]);
    const snippet = i >= 0 ? (i > 40 ? '…' : '') + it.text.slice(Math.max(0, i - 40), i + 110) + '…' : it.description;
    hits.push({ url: it.url + (heading ? `#${heading.id}` : ''), title: it.title, section: it.section, snippet, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}

export default function Search() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  const load = () => {
    if (items) return;
    fetch('/search-index.json').then((r) => r.json()).then(setItems).catch(() => setItems([]));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName))) {
        e.preventDefault(); ref.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('click', onClick); };
  }, []);

  const hits = items ? search(items, q) : [];
  const go = (u: string) => { window.location.href = u; };

  return (
    <div className="search" ref={box}>
      <input
        ref={ref} type="search" value={q} placeholder="Search the docs  ( / )" aria-label="Search the documentation"
        role="combobox" aria-expanded={open && q.length > 0} aria-controls="search-results" autoComplete="off"
        onFocus={() => { load(); setOpen(true); }}
        onChange={(e) => { setQ(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter' && hits[active]) go(hits[active].url);
          else if (e.key === 'Escape') { setOpen(false); ref.current?.blur(); }
        }}
      />
      {open && q.trim() && (
        <ul id="search-results" className="search-results" role="listbox">
          {hits.length === 0 && <li className="empty">{items ? 'No result.' : 'Loading…'}</li>}
          {hits.map((h, i) => (
            <li key={h.url} role="option" aria-selected={i === active}>
              <a href={h.url} className={i === active ? 'on' : ''} onMouseEnter={() => setActive(i)}>
                <span className="hit-sec">{h.section}</span>
                <strong>{h.title}</strong>
                <span className="hit-snip">{h.snippet}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
