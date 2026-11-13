'use client';
import { useEffect, useRef, type ReactNode } from 'react';

/* Fades and lifts its children in once, when they scroll into view. Content stays visible without JS. */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: { children: ReactNode; delay?: number; as?: 'div' | 'section' | 'li'; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('in'); return; }
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const T = Tag as 'div';
  return <T ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${className}`} style={{ ['--d' as string]: `${delay}ms` }}>{children}</T>;
}
