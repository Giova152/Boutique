import { products as localProducts } from '../data/products';

const BASE_URL = 'https://vegederm229.vercel.app';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/boutique', priority: '0.9', changefreq: 'weekly' },
  { path: '/a-propos', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/cgv', priority: '0.5', changefreq: 'yearly' },
  { path: '/confidentialite', priority: '0.5', changefreq: 'yearly' },
  { path: '/mentions-legales', priority: '0.5', changefreq: 'yearly' },
  { path: '/cart', priority: '0.8', changefreq: 'weekly' },
  { path: '/wishlist', priority: '0.6', changefreq: 'weekly' },
  { path: '/login', priority: '0.6', changefreq: 'monthly' },
];

const productRoutes = localProducts.map(p => ({
  path: `/boutique/${p.id}`,
  priority: '0.8',
  changefreq: 'weekly'
}));

const allRoutes = [...staticRoutes, ...productRoutes];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

export default sitemap;
