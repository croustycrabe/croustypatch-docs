import type { Metadata, Viewport } from 'next';
import '@fontsource/rubik-one/400.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@fontsource/roboto-mono/700.css';
import './tokens.css';
import './globals.css';
import './brand.css';
import { site } from '@/lib/site';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: { default: 'CroustyPatch: patch management and automated remediation', template: '%s · CroustyPatch docs' },
  description: 'Documentation of CroustyPatch, the patch-management and automated-remediation platform by Croustylab.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

const themeScript = `document.documentElement.classList.add('js');try{var t=localStorage.getItem('cpdocs.theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <a href="#main" className="skip">skip to the content</a>
        <Header />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <p><img className="foot-logo" src="/brand/crab-logo-mono-cream.svg" alt="" width="30" height="20" />CroustyPatch is a Croustylab project by Croustycrabe. This documentation describes the released product. <a href={site.repoUrl}>Source on GitHub</a> · <a href={site.releasesUrl}>Releases</a> · <a href="/roadmap/">Roadmap</a></p>
        </footer>
      </body>
    </html>
  );
}
