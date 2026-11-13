import Link from 'next/link';
import Search from './Search';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="site-header">
      <div className="bar">
        <Link href="/" className="brand" aria-label="CroustyPatch documentation, home">
          <span className="logo" aria-hidden="true">C</span><span>CroustyPatch</span>
        </Link>
        <nav aria-label="Main" className="main-nav">
          <Link href="/docs/">User guide</Link>
          <Link href="/technical/">Technical</Link>
        </nav>
        <Search />
        <ThemeToggle />
      </div>
    </header>
  );
}
