import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogArticle from '@/components/BlogArticle';
import { POSTS, POSTS_BY_SLUG } from '@/data/blog';

type RouteParams = { slug: string };

export function generateStaticParams(): RouteParams[] {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS_BY_SLUG[slug];
  if (!post) {
    return { title: 'Article not found — Power Zone' };
  }
  return {
    title: `${post.title} — Power Zone`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const post = POSTS_BY_SLUG[slug];
  if (!post) notFound();

  // Up to 3 related posts from the same category, excluding the current one.
  const related = POSTS.filter(
    (p) => p.category === post.category && p.slug !== post.slug,
  ).slice(0, 3);

  return <BlogArticle post={post} related={related} />;
}
