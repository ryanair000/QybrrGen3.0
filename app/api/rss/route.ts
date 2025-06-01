import { NextResponse } from 'next/server';
import { Feed } from 'feed';
import { client } from '@/lib/sanity/client';
import { postquery } from '@/lib/sanity/groq'; // Assuming this query fetches all necessary post fields
import { urlForImage } from '@/lib/sanity/image'; // Helper to get image URLs

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Replace with your actual site URL from env or hardcode

export async function GET() {
  if (!client) {
    return new NextResponse('Sanity client not configured', { status: 500 });
  }

  const feed = new Feed({
    title: 'QybrrLabs Blog', // TODO: Your Blog Title
    description: 'Latest AI insights and SaaS strategies from QybrrLabs.', // TODO: Your Blog Description
    id: SITE_URL,
    link: SITE_URL,
    language: 'en', // optional, used only in RSS 2.0, ATOM
    image: `${SITE_URL}/logo.png`, // TODO: URL to your blog/site logo
    favicon: `${SITE_URL}/favicon.ico`, // TODO: URL to your favicon
    copyright: `All rights reserved ${new Date().getFullYear()}, QybrrLabs`, // TODO: Your Copyright
    updated: new Date(), // optional, default = new Date()
    generator: 'Next.js using Feed for Node.js', // optional, default = Feed for Node.js
    feedLinks: {
      json: `${SITE_URL}/api/rss/json`, // Example for JSON feed
      atom: `${SITE_URL}/api/rss/atom`, // Example for Atom feed
      rss2: `${SITE_URL}/api/rss`,     // This route
    },
    author: {
      name: 'QybrrLabs Team', // TODO: Your Name or Company Name
      email: 'support@qybrrlabs.blog', // TODO: Your Email
      link: SITE_URL, // TODO: Link to your author page or site
    },
  });

  try {
    const posts = await client.fetch(postquery);

    posts.forEach((post: any) => {
      const postUrl = `${SITE_URL}/blog/${post.slug?.current}`;
      let description = post.excerpt;
      // If no excerpt, try to generate a short one from the body (plain text)
      if (!description && post.body) {
        const firstTextBlock = post.body.find((block:any) => block._type === 'block' && block.children?.some((child:any) => child.text));
        if (firstTextBlock) {
          description = firstTextBlock.children.map((child:any) => child.text).join(' ').substring(0, 200) + '...';
        }
      }

      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: description || 'No summary available',
        content: post.body ? convertSanityPortableTextToHtml(post.body) : description, // Generate full HTML content if possible
        author: [
          {
            name: post.author?.name || 'QybrrLabs Team', // Fallback author name
            email: post.author?.email, // Optional: if author has an email
            link: post.author?.slug ? `${SITE_URL}/author/${post.author.slug.current}` : SITE_URL,
          },
        ],
        date: new Date(post.publishedAt || post._createdAt),
        image: post.mainImage ? urlForImage(post.mainImage)?.src : undefined,
        // You can also add categories if available and desired
        // category: post.categories?.map((cat: any) => ({ name: cat.title })) || [],
      });
    });

    return new NextResponse(feed.rss2(), {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}

// Basic helper to convert Sanity Portable Text to HTML (can be expanded or use a library)
// For a more robust solution, consider @portabletext/to-html or similar
function convertSanityPortableTextToHtml(blocks: any[]) {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter(block => block._type === 'block' && block.children)
    .map(block => {
      return block.children.map((child: any) => {
        if (child._type === 'span' || child.text) {
          let text = child.text;
          if (child.marks?.includes('strong')) text = `<strong>${text}</strong>`;
          if (child.marks?.includes('em')) text = `<em>${text}</em>`;
          if (child.marks?.includes('underline')) text = `<u>${text}</u>`;
          if (child.marks?.includes('strike-through')) text = `<del>${text}</del>`;
          // Handle links if markDefs are included in the query for body blocks
          // const linkMark = child.marks?.find((markKey: string) => block.markDefs?.find((def: any) => def._key === markKey && def._type === 'link'));
          // if (linkMark) { const linkDef = block.markDefs.find((def: any) => def._key === linkMark); return `<a href="${linkDef.href}">${text}</a>`; }
          return text;
        }
        return '';
      }).join('');
    })
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
} 