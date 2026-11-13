'use client';
import { useEffect, useState } from 'react';

// One delegated listener for every copy button rendered in the article HTML.
export default function CodeCopy() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const timers = new WeakMap<Element, number>();
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.copy-btn');
      if (!btn) return;
      const code = btn.closest('.codeblock')?.querySelector('code')?.textContent ?? '';
      let ok = true;
      try { await navigator.clipboard.writeText(code); }
      catch {
        const ta = document.createElement('textarea');
        ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        ok = document.execCommand('copy'); ta.remove();
      }
      const label = btn.querySelector('.copy-label');
      if (label) label.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      btn.dataset.state = ok ? 'copied' : 'failed';
      setMsg(ok ? 'Copied to the clipboard' : 'Copy failed');
      window.clearTimeout(timers.get(btn));
      timers.set(btn, window.setTimeout(() => {
        if (label) label.textContent = 'Copy';
        delete btn.dataset.state; setMsg('');
      }, 2000));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return <span className="sr-only" role="status" aria-live="polite">{msg}</span>;
}
