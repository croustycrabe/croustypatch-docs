import Link from 'next/link';
import { Doc, Section, docUrl, getDocs } from '@/lib/content';

export default function SideNav({ section, current }: { section: Section; current: string }) {
  const groups: { name: string; items: Doc[] }[] = [];
  for (const d of getDocs(section)) {
    let g = groups.find((x) => x.name === d.group);
    if (!g) groups.push((g = { name: d.group, items: [] }));
    g.items.push(d);
  }
  return (
    <nav className="side" aria-label={section === 'user' ? 'User guide' : 'Technical documentation'}>
      {groups.map((g) => (
        <details key={g.name} open={g.items.some((d) => d.slug === current)} className="side-group">
          <summary>{g.name}</summary>
          <ul>
            {g.items.map((d) => (
              <li key={d.slug}>
                <Link href={docUrl(d)} aria-current={d.slug === current ? 'page' : undefined}>{d.title}</Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  );
}
