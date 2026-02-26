import LandingPage from '../components/LandingPage/LandinPage';
import { Metadata } from 'next';
import en from '@/dictionaries/en.json'
import fr from '@/dictionaries/fr.json'
import ar from '@/dictionaries/ar.json'

const dictionaries = { en, fr, ar };

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params;
  
  const t = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    keywords: t.metaKeywords,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
    },
  };
}

export default function Home() {
  return <LandingPage />;
}