import type { Metadata } from 'next';
import BlogIndex from '@/components/BlogIndex';

export const metadata: Metadata = {
  title: 'Blog — Power Zone',
  description:
    'Field notes on diesel generators, hybrid solar inverters, and energy systems — written for operators, engineers, and homeowners across Pakistan.',
};

export default function BlogPage() {
  return <BlogIndex />;
}
