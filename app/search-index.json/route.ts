import { getDocs, docUrl } from '@/lib/content';

export const dynamic = 'force-static';

export function GET() {
  const items = (['user', 'tech'] as const).flatMap((s) =>
    getDocs(s).map((d) => ({
      url: docUrl(d), title: d.title, section: s === 'user' ? 'User guide' : 'Technical',
      description: d.description, headings: d.headings.map((h) => ({ id: h.id, text: h.text })), text: d.text,
    })),
  );
  return Response.json(items);
}
