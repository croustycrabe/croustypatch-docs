/* A product screenshot that follows the theme: both files are in the page, CSS shows the right one. */
export default function Shot({ light, dark, alt, w = 1440, h = 900, eager = false }: { light: string; dark: string; alt: string; w?: number; h?: number; eager?: boolean }) {
  const loading = eager ? 'eager' : 'lazy';
  return (
    <span className="shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="shot-light" src={light} alt={alt} width={w} height={h} loading={loading} decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="shot-dark" src={dark} alt="" aria-hidden="true" width={w} height={h} loading={loading} decoding="async" />
    </span>
  );
}
