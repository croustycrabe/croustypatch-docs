'use client';
import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/content';

export default function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? '');
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const update = () => {
      // the last heading that has crossed the line just under the sticky header
      let cur = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= 110) cur = el.id;
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = els[els.length - 1].id;
      setActive(cur);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [headings]);
  return (
    <aside className="toc" aria-label="On this page">
      <p>On this page</p>
      {headings.map((h) => (
        <a key={h.id} href={`#${h.id}`} className={`${h.depth === 3 ? 'sub' : ''} ${active === h.id ? 'on' : ''}`} aria-current={active === h.id ? 'location' : undefined}>{h.text}</a>
      ))}
    </aside>
  );
}
