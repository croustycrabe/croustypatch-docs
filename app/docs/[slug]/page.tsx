import { notFound } from 'next/navigation';
import DocPage from '@/components/DocPage';
import { getDocs } from '@/lib/content';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() { return getDocs('user').map((d) => ({ slug: d.slug })); }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getDocs('user').find((d) => d.slug === slug);
  return { title: doc?.title, description: doc?.description };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const doc = getDocs('user').find((d) => d.slug === slug);
  if (!doc) notFound();
  return <DocPage section="user" doc={doc} />;
}
