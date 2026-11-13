import { getChannels, getCategories } from '@/lib/channels';
import HomeClient from './HomeClient';

export const revalidate = 60; // Revalidate every 60s

export default function HomePage() {
  const channels = getChannels();
  const categories = getCategories();

  return <HomeClient channels={channels} categories={categories} />;
}

