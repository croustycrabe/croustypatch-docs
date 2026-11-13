import Link from 'next/link';
import { Section, SECTIONS, docUrl, getDocs } from '@/lib/content';

export default function SectionIndex({ section }: { section: Section }) {
  const docs = getDocs(section);
  return (
    <div className="page">
      <p className="crumb">Documentation</p>
      <h1>{SECTIONS[section].label}</h1>
      <p className="lede">{SECTIONS[section].blurb}</p>
      <div className="cards">
        {docs.map((d) => (
          <Link key={d.slug} href={docUrl(d)} className="card">
            <strong>{d.title}</strong>
            <span>{d.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
