import Link from 'next/link';
import { Doc, SECTIONS, docUrl, getDocs, Section } from '@/lib/content';

export default function DocPage({ section, doc }: { section: Section; doc: Doc }) {
  const docs = getDocs(section);
  const i = docs.findIndex((d) => d.slug === doc.slug);
  const prev = docs[i - 1];
  const next = docs[i + 1];
  const groups: { name: string; items: Doc[] }[] = [];
  for (const d of docs) {
    let g = groups.find((x) => x.name === d.group);
    if (!g) groups.push((g = { name: d.group, items: [] }));
    g.items.push(d);
  }
  return (
    <div className="doc-shell">
      <details className="side-wrap side-mobile">
        <summary>{SECTIONS[section].label}: {doc.title}</summary>
        <nav className="side" aria-label={SECTIONS[section].label}>
          {groups.map((g) => (
            <div key={g.name}>
              {g.name && <p className="side-group">{g.name}</p>}
              {g.items.map((d) => (
                <Link key={d.slug} href={docUrl(d)} aria-current={d.slug === doc.slug ? 'page' : undefined}>{d.title}</Link>
              ))}
            </div>
          ))}
        </nav>
      </details>
      <div className="side-wrap side-desktop">
        <nav className="side" aria-label={SECTIONS[section].label}>
          {groups.map((g) => (
            <div key={g.name}>
              {g.name && <p className="side-group">{g.name}</p>}
              {g.items.map((d) => (
                <Link key={d.slug} href={docUrl(d)} aria-current={d.slug === doc.slug ? 'page' : undefined}>{d.title}</Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <article className="prose">
        <p className="crumb">{SECTIONS[section].label}</p>
        <h1>{doc.title}</h1>
        {doc.description && <p className="lede">{doc.description}</p>}
        <div dangerouslySetInnerHTML={{ __html: doc.html }} />
        <nav className="pager" aria-label="Previous and next page">
          {prev ? <Link href={docUrl(prev)}><small>Previous</small>{prev.title}</Link> : <span />}
          {next ? <Link href={docUrl(next)} className="next"><small>Next</small>{next.title}</Link> : <span />}
        </nav>
      </article>
      {doc.headings.length > 0 && (
        <aside className="toc" aria-label="On this page">
          <p>On this page</p>
          {doc.headings.map((h) => (
            <a key={h.id} href={`#${h.id}`} className={h.depth === 3 ? 'sub' : ''}>{h.text}</a>
          ))}
        </aside>
      )}
    </div>
  );
}
