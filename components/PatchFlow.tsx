'use client';
import { useEffect, useRef, useState } from 'react';

const steps = [
  { t: 'Decide', d: 'The policy engine rates contextual risk (CVSS, exploitation, exposure) and stability risk, then picks auto-deploy, approval or block. The reasoning is stored on the task.',
    log: ['policy      prod-security (priority 10)', 'contextual  Critical  (CVSS 9.8, exploited)', 'stability   Low', 'decision    REQUIRE_APPROVAL', 'planned     next patch day, 02:00 Europe/Paris'] },
  { t: 'Prepare', d: 'On the patch day the server signs a command for that one agent. The agent checks it, then builds a restore point and refuses to go on if a package cannot be restored.',
    log: ['verify      signature ok · nonce unseen · agent matches', 'preflight   agent is not sandboxed', 'restore     libssl3=3.0.1 nginx=1.24 pinned', 'restore     all packages restorable'] },
  { t: 'Apply and soak', d: 'The update runs with fixed arguments, no shell. Then health probes watch the machine for the soak time you set.',
    log: ['apply       apt-get install libssl3 nginx', 'soak        tcp 127.0.0.1:443        ok', 'soak        systemd nginx.service    ok', 'soak        http /health → 200       ok'] },
  { t: 'Roll back by itself', d: 'Two failed checks in a row of the same probe restore the restore point. If even that fails, the host is isolated and its evidence frozen.',
    log: ['probe       http /health → 502       FAIL', 'probe       http /health → 502       FAIL', 'rollback    restoring libssl3=3.0.1 nginx=1.24', 'rollback    probes pass again · task rolled back'] },
  { t: 'Tell people', d: 'Every step is audited in a hash-chained log, and the event goes to e-mail, a signed webhook, ntfy or Gotify.',
    log: ['audit       task.rolled_back  (hash 9f3c…)', 'notify      ops-mail      sent', 'notify      ntfy:infra    sent'] },
];

export default function PatchFlow() {
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) setCur(Number((e.target as HTMLElement).dataset.k));
    }, { rootMargin: '-45% 0px -45% 0px' });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div className="pflow">
      <ol className="pflow-steps">
        {steps.map((s, k) => (
          <li key={s.t} data-k={k} ref={(el) => { refs.current[k] = el; }} className={k === cur ? 'on' : ''}>
            <span className="pflow-n">{String(k + 1).padStart(2, '0')}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
      <div className="pflow-sticky">
        <div className="pipe">
          <div className="pipe-bar"><i /><i /><i /><span>agent log</span></div>
          <pre aria-live="polite" key={cur}>{steps[cur].log.map((l, k) => (
            <span key={l} className={`logline ${/FAIL/.test(l) ? 'bad' : ''}`} style={{ ['--d' as string]: `${k * 90}ms` }}>{l + '\n'}</span>
          ))}</pre>
        </div>
      </div>
    </div>
  );
}
