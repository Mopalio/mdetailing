import { NextResponse } from 'next/server';
import sitemap from '../sitemap';

export async function GET() {
  const sitemapData = sitemap();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapData.map((item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${typeof item.lastModified === 'string' ? item.lastModified : item.lastModified?.toISOString() || new Date().toISOString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>
`).join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 