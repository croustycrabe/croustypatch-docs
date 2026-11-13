'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Shot from './Shot';
import type { Slide } from '@/lib/shots';

export type Feature = { id: string; label: string; title: string; text: string; points: string[]; href: string; shot?: string };

export default function FeatureTabs({ features, shots }: { features: Feature[]; shots: Slide[] }) {
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent) => {
    let k = cur;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = (cur + 1) % features.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = (cur - 1 + features.length) % features.length;
    else if (e.key === 'Home') k = 0;
    else if (e.key === 'End') k = features.length - 1;
    else return;
    e.preventDefault(); setCur(k); refs.current[k]?.focus();
  };
  const f = features[cur];
  const shot = shots.find((s) => s.name === f.shot);
  return (
    <div className="ftabs">
      <div className="ftabs-list" role="tablist" aria-label="Features" onKeyDown={onKey}>
        {features.map((x, k) => (
          <button key={x.id} ref={(el) => { refs.current[k] = el; }} role="tab" id={`tab-${x.id}`} aria-selected={k === cur} aria-controls={`panel-${x.id}`} tabIndex={k === cur ? 0 : -1} className={k === cur ? 'on' : ''} onClick={() => setCur(k)}>{x.label}</button>
        ))}
      </div>
      <div className="ftabs-panel" role="tabpanel" id={`panel-${f.id}`} aria-labelledby={`tab-${f.id}`} key={f.id}>
        <div className="ftabs-text">
          <h3>{f.title}</h3>
          <p>{f.text}</p>
          <ul>{f.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <Link href={f.href} className="btn">Read the guide</Link>
        </div>
        <div className="ftabs-shot">
          {shot ? <Shot light={shot.light} dark={shot.dark} alt={`${shot.title}: ${shot.caption}`} w={shot.w} h={shot.h} /> : <div className="shot-empty" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
