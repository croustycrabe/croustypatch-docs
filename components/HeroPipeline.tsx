'use client';
import { useEffect, useState } from 'react';

const steps = [
  ['Policy', 'security updates on web-01, patch day open', 'approved'],
  ['Restore point', 'libssl3, nginx pinned', 'saved'],
  ['Apply', 'libssl3 3.0.1 → 3.0.2', 'done'],
  ['Soak', 'tcp :443 and nginx.service, 30 min', 'healthy'],
  ['Result', 'web-01 is up to date', 'succeeded'],
] as const;

export default function HeroPipeline() {
  const [k, setK] = useState(steps.length - 1);
  const [motion, setMotion] = useState(false);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setMotion(true); setK(0);
    const t = setInterval(() => setK((x) => (x + 1) % (steps.length + 2)), 1500);
    return () => clearInterval(t);
  }, []);
  const shown = Math.min(k, steps.length - 1);
  const done = k >= steps.length - 1;
  return (
    <div className="pipe" role="img" aria-label="A patch run: policy, restore point, apply, soak, result">
      <div className="pipe-bar"><i /><i /><i /><span>task · web-01</span></div>
      <ol aria-hidden="true">
        {steps.map(([name, text, state], idx) => {
          const on = idx <= shown;
          return (
            <li key={name} className={`${on ? 'on' : ''} ${idx === shown && !done ? 'now' : ''}`}>
              <span className="pipe-dot" />
              <span className="pipe-name">{name}</span>
              <span className="pipe-text">{text}</span>
              <span className="pipe-state">{on ? (idx === shown && !done ? 'running' : state) : 'waiting'}</span>
            </li>
          );
        })}
      </ol>
      <div className="pipe-meter" aria-hidden="true"><b style={{ width: `${((shown + (motion && !done ? 0.5 : 1)) / steps.length) * 100}%` }} /></div>
    </div>
  );
}
