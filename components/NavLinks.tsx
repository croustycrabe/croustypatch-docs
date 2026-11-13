'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const path = usePathname() ?? '';
  const items = [['/docs/', 'docs'], ['/technical/', 'technical']] as const;
  return (
    <nav aria-label="Main" className="main-nav">
      {items.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path.startsWith(href.slice(0, -1)) ? 'page' : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
