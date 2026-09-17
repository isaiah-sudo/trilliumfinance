import { redirect } from 'next/navigation';

export default function LegacyNewsCatalogPage() {
  redirect('/dashboard/news/catalog');
}
