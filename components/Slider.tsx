'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Shot from './Shot';
import type { Slide } from '@/lib/shots';

/* Scroll-snap carousel: native swipe and momentum, arrows, dots, keyboard (←/→/Home/End), reduced-motion aware. */
export default function Slider({ slides }: { slides: Slide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const target = useRef(0);
  const n = slides.length;

  const go = useCallback((to: number) => {
    const el = track.current;
    if (!el) return;
    const k = Math.max(0, Math.min(n - 1, to));
    target.current = k;
    const slide = el.children[k] as HTMLElement;
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft - (el.clientWidth - slide.clientWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
  }, [n]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0, dist = Infinity;
        Array.from(el.children).forEach((c, k) => {
          const e = c as HTMLElement;
          const d = Math.abs(e.offsetLeft - el.offsetLeft + e.clientWidth / 2 - mid);
          if (d < dist) { dist = d; best = k; }
        });
        target.current = best;
        setI(best);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(target.current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(target.current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
  };
  if (!n) return null;

  return (
    <section className="slider" aria-roledescription="carousel" aria-label="Product screenshots">
      <div className="slider-track" ref={track} tabIndex={0} onKeyDown={onKey} role="group" aria-label="Slides, use the arrow keys to browse">
        {slides.map((s, k) => (
          <figure key={s.name} className={`slide ${k === i ? 'is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${k + 1} of ${n}: ${s.title}`}>
            <div className="slide-frame">
              <div className="slide-bar" aria-hidden="true"><i /><i /><i /></div>
              <Shot light={s.light} dark={s.dark} alt={`${s.title}: ${s.caption}`} w={s.w} h={s.h} eager={k === 0} />
            </div>
            <figcaption><strong>{s.title}</strong><span>{s.caption}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="slider-controls">
        <button type="button" className="icon-btn" onClick={() => go(target.current - 1)} disabled={i === 0} aria-label="Previous screenshot">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="dots" role="tablist" aria-label="Choose a screenshot">
          {slides.map((s, k) => (
            <button key={s.name} type="button" role="tab" aria-selected={k === i} aria-label={`${k + 1}: ${s.title}`} className={k === i ? 'on' : ''} onClick={() => go(k)} />
          ))}
        </div>
        <button type="button" className="icon-btn" onClick={() => go(target.current + 1)} disabled={i === n - 1} aria-label="Next screenshot">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{`Slide ${i + 1} of ${n}: ${slides[i].title}`}</p>
    </section>
  );
}
