import Link from 'next/link';
import { getSlides } from '@/lib/shots';
import Slider from '@/components/Slider';
import Reveal from '@/components/Reveal';
import FeatureTabs, { Feature } from '@/components/FeatureTabs';
import Shot from '@/components/Shot';
import HeroPipeline from '@/components/HeroPipeline';
import PatchFlow from '@/components/PatchFlow';

const features: Feature[] = [
  { id: 'patching', label: 'Patching', title: 'Patch without fear', shot: 'dashboard',
    text: 'Every patch starts with a restore point and is watched by health probes afterwards. Two failed probes in a row roll it back by itself.',
    points: ['apt, pacman and FreeBSD pkg', 'Restore points and automatic rollback', 'Quarantine and frozen evidence if even the rollback fails'], href: '/technical/patch-pipeline/' },
  { id: 'policies', label: 'Policies', title: 'Rules you can read', shot: 'policies',
    text: 'A deterministic engine turns CVSS, exposure, criticality and stability into auto-deploy, approval or block, and keeps its reasoning on every task.',
    points: ['Patch days weekly or monthly, with time zones', 'Rings that stagger hosts', 'Waivers with two approvals'], href: '/docs/policies/' },
  { id: 'docker', label: 'Docker', title: 'Containers, kept current', shot: 'docker',
    text: 'See every container image across your hosts, update the ones that moved and move to a newer tag with a compose-file edit that can be undone.',
    points: ['Digest and newer-tag checks against the registry', 'Compose services only, health checked', 'Database majors are never applied blindly'], href: '/docs/docker/' },
  { id: 'app-center', label: 'App center', title: 'Self-service for people', shot: 'app-center',
    text: 'Publish a catalog of approved applications. People install, remove and update from a terminal or desktop app, without root.',
    points: ['Filters for installed and needing an update', 'Packages or vetted commands', 'Everything audited by local account'], href: '/docs/app-center/' },
  { id: 'notify', label: 'Notifications', title: 'Told when it matters', shot: 'notifications',
    text: 'E-mail, signed webhooks, ntfy and Gotify. Immediate alerts, daily digests and scheduled fleet reports.',
    points: ['Rules by event, severity and group', 'Reports even when nothing happened', 'Delivery history with retries'], href: '/docs/notifications/' },
];

const cards = [
  ['Patch days, not patch panic', 'Maintenance windows with deadlines, so a host that was offline never patches late.'],
  ['Servers, laptops and containers', 'Linux and FreeBSD, an eco mode for laptops on battery, and Docker Compose images.'],
  ['Locked down by design', 'TLS 1.3 only, one RSA identity per agent, server-signed commands, Argon2id and a hash-chained audit log.'],
  ['AI, with a leash', 'An OpenAI-compatible model can rate risk but lower it by one level at most. An MCP server lets assistants request patches that wait for a human.'],
] as const;

export default function Home() {
  const slides = getSlides();
  const phone = getSlides({ phone: true })[0];
  return (
    <>
      <section className="hero">
        <div className="page hero-grid">
          <div>
            <p className="eyebrow rise" style={{ ['--d' as string]: '0ms' }}>[ Croustylab ]</p>
            <h1 className="rise" style={{ ['--d' as string]: '80ms' }}>Patch management that is safe to leave on.</h1>
            <p className="lede rise" style={{ ['--d' as string]: '180ms' }}>
              CroustyPatch keeps a fleet of Linux and FreeBSD machines up to date. It decides what to patch and when,
              applies it, checks that the machine still works, and puts everything back if it does not.
            </p>
            <div className="cta rise" style={{ ['--d' as string]: '280ms' }}>
              <Link href="/docs/quickstart/" className="btn primary">Get started</Link>
              <Link href="/docs/policies/" className="btn">Read the docs</Link>
              <Link href="/technical/architecture/" className="btn">How it works</Link>
            </div>
          </div>
          <div className="rise" style={{ ['--d' as string]: '240ms' }}><HeroPipeline /></div>
        </div>
      </section>

      {slides.length > 0 && (
        <section className="page" aria-labelledby="see-it">
          <Reveal>
            <p className="eyebrow">01 · THE INTERFACE</p>
            <h2 className="section-title" id="see-it">See it at work</h2>
            <p className="lede narrow">Real screens of the web interface, with demo data. Swipe, use the arrows or the keyboard.</p>
          </Reveal>
          <Reveal delay={80}><Slider slides={slides} /></Reveal>
        </section>
      )}

      <section className="page" aria-labelledby="what">
        <Reveal>
          <p className="eyebrow">02 · FEATURES</p>
          <h2 className="section-title" id="what">What it does</h2>
        </Reveal>
        <Reveal delay={80}><FeatureTabs features={features} shots={slides} /></Reveal>
      </section>

      <section className="page" aria-labelledby="flow">
        <Reveal>
          <p className="eyebrow">03 · THE PIPELINE</p>
          <h2 className="section-title" id="flow">What happens to a patch</h2>
        </Reveal>
        <PatchFlow />
      </section>

      {phone && (
        <section className="page phone-sec" aria-labelledby="phone">
          <Reveal className="phone-text">
            <p className="eyebrow">04 · EVERY SCREEN</p>
            <h2 className="section-title" id="phone">In your pocket, too</h2>
            <p className="lede">The interface folds to a drawer on phones and keeps every action, so you can approve a patch from the train.</p>
          </Reveal>
          <Reveal delay={100} className="phone-shot"><Shot light={phone.light} dark={phone.dark} alt={`${phone.title}: ${phone.caption}`} w={phone.w} h={phone.h} /></Reveal>
        </section>
      )}

      <section className="page" aria-labelledby="more">
        <Reveal><p className="eyebrow">05 · AND ALSO</p><h2 className="section-title" id="more">Built to be trusted</h2></Reveal>
        <div className="cards">
          {cards.map(([t, d], k) => (
            <Reveal key={t} delay={k * 80} className="card static"><strong>{t}</strong><span>{d}</span></Reveal>
          ))}
        </div>
      </section>

      <section className="page" aria-labelledby="fit">
        <Reveal><p className="eyebrow">06 · ARCHITECTURE</p><h2 className="section-title" id="fit">How it fits together</h2></Reveal>
        <Reveal delay={80}>
          <div className="flow" role="img" aria-label="Agents on each host connect to the server, which serves the web interface and stores everything in PostgreSQL">
            <div><b>Agent</b><span>Rust, runs as root on each host. Inventory, patching, rollback, quarantine.</span></div>
            <i aria-hidden="true">⇄ TLS 1.3</i>
            <div><b>Server</b><span>Rust. API, WebSocket gateway, policy engine, scheduler, audit log.</span></div>
            <i aria-hidden="true">⇄</i>
            <div><b>PostgreSQL</b><span>Inventory, policies, tasks, encrypted secrets, audit chain.</span></div>
          </div>
          <p className="muted">The web interface is a static Next.js export served by the server itself, so there is a single thing to deploy.</p>
        </Reveal>
      </section>

      <section className="page cta-band">
        <Reveal>
          <h2 className="section-title">Ready to try it?</h2>
          <div className="cta">
            <Link href="/docs/quickstart/" className="btn primary">Get started</Link>
            <Link href="/docs/install/" className="btn">Install the server</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
