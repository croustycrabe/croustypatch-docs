import Link from 'next/link';

const features = [
  ['Patch without fear', 'Every patch starts with a restore point and is watched by health probes afterwards. Two failed probes in a row roll it back by itself.'],
  ['Rules you can read', 'A deterministic policy engine decides auto-deploy, approval or block from CVSS, exposure, criticality and stability. Every decision keeps its reasoning.'],
  ['Patch days, not patch panic', 'Weekly or monthly maintenance windows with time zones, rings that stagger hosts, and deadlines so nothing runs late.'],
  ['Servers, laptops and containers', 'Linux (apt, pacman) and FreeBSD (pkg) hosts, Docker Compose images with newer-tag suggestions, and an eco mode for laptops on battery.'],
  ['Locked down by design', 'TLS 1.3 only, one RSA identity per agent, server-signed commands, Argon2id, RBAC and a hash-chained audit log.'],
  ['Everything is notified', 'E-mail, signed webhooks, ntfy and Gotify, daily digests and scheduled fleet reports.'],
  ['An app center for users', 'A terminal and a desktop app center let people install the tools an admin approved, and update their own machine.'],
  ['AI, with a leash', 'Any OpenAI-compatible model can assess contextual risk, but it can lower a rating by one level at most. An MCP server lets assistants read the fleet and request patches that wait for a human.'],
] as const;

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="page">
          <p className="eyebrow">[ Croustylab ]</p>
          <h1>Patch management that is safe to leave on.</h1>
          <p className="lede">
            CroustyPatch keeps a fleet of Linux and FreeBSD machines up to date. It decides what to patch and when,
            applies it, checks that the machine still works, and puts everything back if it does not. Built for
            enterprises and home labs.
          </p>
          <div className="cta">
            <Link href="/docs/quickstart/" className="btn primary">Quickstart</Link>
            <Link href="/docs/" className="btn">User guide</Link>
            <Link href="/technical/" className="btn">How it works</Link>
          </div>
        </div>
      </section>

      <section className="page">
        <h2 className="section-title">What it does</h2>
        <div className="cards">
          {features.map(([t, d]) => (
            <div key={t} className="card static"><strong>{t}</strong><span>{d}</span></div>
          ))}
        </div>
      </section>

      <section className="page">
        <h2 className="section-title">How it fits together</h2>
        <div className="flow" role="img" aria-label="Agents on each host connect to the server, which serves the web interface and stores everything in PostgreSQL">
          <div><b>Agent</b><span>Rust, runs as root on each host. Inventory, patching, rollback, quarantine.</span></div>
          <i aria-hidden="true">⇄ TLS 1.3</i>
          <div><b>Server</b><span>Rust. API, WebSocket gateway, policy engine, scheduler, audit log.</span></div>
          <i aria-hidden="true">⇄</i>
          <div><b>PostgreSQL</b><span>Inventory, policies, tasks, encrypted secrets, audit chain.</span></div>
        </div>
        <p className="muted">The web interface is a static Next.js export served by the server itself, so there is a single thing to deploy.</p>
      </section>

      <section className="page">
        <h2 className="section-title">Start here</h2>
        <div className="cards two">
          <Link href="/docs/" className="card"><strong>User documentation</strong><span>A quickstart, then every feature explained: hosts, policies, Docker, the app center, notifications, reports and more.</span></Link>
          <Link href="/technical/" className="card"><strong>Technical documentation</strong><span>The architecture: wire protocol, security model, policy engine, patch pipeline and the design choices behind them.</span></Link>
        </div>
      </section>
    </>
  );
}
