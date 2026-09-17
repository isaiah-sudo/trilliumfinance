import { redirect } from 'next/navigation';

export default async function LegacyArticleReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/dashboard/news/${resolvedParams.id}`);
}
