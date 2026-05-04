import type { Metadata } from 'next';
import ContactExperience from '@/components/ContactExperience';

export const metadata: Metadata = {
  title: 'Contact — Power Zone',
  description:
    'Talk to Power Zone about diesel generators, BESS, and energy solutions for your project.',
};

export default function ContactPage() {
  return <ContactExperience />;
}
