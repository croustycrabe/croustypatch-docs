import type { Metadata } from 'next';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'What the CroustyPatch project is working on next.',
};

interface Item { title: string; text: string; tag?: string }

const next: Item[] = [
  { title: 'A native UI for the app center', text: 'The desktop app center runs on Tauri and a web view today. A native interface remains the goal; an earlier attempt was set aside until the toolkit and the packaging are ready.' },
  { title: 'More Linux distributions', text: 'Hosts running apt (Debian, Ubuntu) and pacman (Arch) are covered today. Next: the Red Hat family with dnf (Fedora, RHEL, Rocky, AlmaLinux) and other distributions after that.' },
  { title: 'ARM64 builds', text: 'The server image and the agent are built for amd64. ARM64 (aarch64) builds will follow, so that boards and ARM servers can be managed alongside the rest of the fleet.' },
  { title: 'FreeBSD', text: 'FreeBSD support was removed from the current release so that it can be rebuilt properly: package backend, service integration and quarantine rules.' },
];
function Lane({ title, items, cls }: { title: string; items: Item[]; cls: string }) {
  return (
    <section className={`roadmap-lane ${cls}`}>
      <h2>{title}</h2>
      <ul className="roadmap-list">
        {items.map((i) => (
          <li key={i.title} className="roadmap-item">
            <span className="roadmap-dot" aria-hidden="true" />
            <h3>{i.title}</h3>
            <p>{i.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Roadmap() {
  return (
    <div className="page">
      <div className="prose">
        <p className="crumb">Project</p>
        <h1>Roadmap</h1>
        <p>What we are working on next. The order is a direction, not a schedule, and it moves with what people need.
          Ideas and requests are welcome in the <a href={site.issuesUrl} rel="noopener">issue tracker</a>.</p>
        <Lane title="Next" items={next} cls="next" />
        <p className="muted" style={{ marginTop: '2rem' }}>What has already shipped is listed in the <a href={`${site.repoUrl}/blob/main/CHANGELOG.md`} rel="noopener">changelog</a>.</p>
      </div>
    </div>
  );
}
