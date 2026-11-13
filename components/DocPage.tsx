import Link from 'next/link';
import { Doc, SECTIONS, docUrl, getDocs, Section } from '@/lib/content';
import SideNav from './SideNav';
import Toc from './Toc';
import CodeCopy from './CodeCopy';

export default function DocPage({ section, doc }: { section: Section; doc: Doc }) {
  const docs = getDocs(section);
  const i = docs.findIndex((d) => d.slug === doc.slug);
  const prev = docs[i - 1];
  const next = docs[i + 1];
  return (
    <div className="doc-shell">
      <details className="side-mobile">
        <summary><span>Menu</span><strong>{doc.title}</strong></summary>
        <SideNav section={section} current={doc.slug} />
      </details>
      <div className="side-desktop"><SideNav section={section} current={doc.slug} /></div>
      <article className="prose">
        <p className="crumb">{SECTIONS[section].label}{doc.group ? ` / ${doc.group}` : ''}</p>
        <h1>{doc.title}</h1>
        {doc.description && <p className="lede">{doc.description}</p>}
        <div dangerouslySetInnerHTML={{ __html: doc.html }} />
        <CodeCopy />
        <nav className="pager" aria-label="Previous and next page">
          {prev ? <Link href={docUrl(prev)}><small>← Previous</small>{prev.title}</Link> : <span />}
          {next ? <Link href={docUrl(next)} className="next"><small>Next →</small>{next.title}</Link> : <span />}
        </nav>
      </article>
      {doc.headings.length > 0 ? <Toc headings={doc.headings} /> : <div />}
    </div>
  );
}
