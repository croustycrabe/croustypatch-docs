'use client';
import { useEffect, useRef } from 'react';

/* A short muted product clip. It plays by itself only when the visitor has not asked for reduced motion,
   and only while visible; the native controls are always there. */
export default function ProductVideo({ webm, mp4, poster, label }: { webm?: string; mp4?: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }
    }, { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <div className="vid">
      <div className="slide-bar" aria-hidden="true"><i /><i /><i /></div>
      <video ref={ref} muted playsInline loop controls preload="metadata" poster={poster} aria-label={label} width={1280} height={800}>
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
        <p>Your browser cannot play this video.</p>
      </video>
    </div>
  );
}
