import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../contexts/LanguageContext';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://vegederm229.vercel.app';
const SITE_NAME = 'VEGEDERM';
const DEFAULT_DESC_FR = "Cosmétiques biologiques naturels conçus au Canada. Beurre de karité, soins pour enfants, exfoliants et plus. Testé dermatologiquement, sans parabènes.";
const DEFAULT_DESC_EN = "Natural organic cosmetics made in Canada. Shea butter, kids range, exfoliants and more. Dermatologist tested, no parabens.";
const OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export default function SEO({ title, description, path = '/', lang, type = 'website', image, product }) {
  const { language } = useLanguage();
  const l = lang || language;
  const t = l === 'en' ? 'en' : 'fr';
  const titleTemplate = `${title ? `${title} | ${SITE_NAME}` : SITE_NAME}`;
  const desc = description || (t === 'en' ? DEFAULT_DESC_EN : DEFAULT_DESC_FR);
  const url = `${BASE_URL}${path}`;
  const ogImg = image || OG_IMAGE;

  const jsonLdProduct = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'CAD',
      availability: product.inStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews || 1
    } : undefined
  } : null;

  return (
    <>
      <Helmet>
        <title>{titleTemplate}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />

        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={titleTemplate} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={ogImg} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content={t === 'en' ? 'en_CA' : 'fr_CA'} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={titleTemplate} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={ogImg} />

        <meta name="robots" content="index, follow" />
        <meta name="author" content={SITE_NAME} />
        <meta name="theme-color" content="#1d4e38" />

        {jsonLdProduct ? (
          <script type="application/ld+json">
            {JSON.stringify(jsonLdProduct)}
          </script>
        ) : type === 'website' && (
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_NAME,
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              description: t === 'en' ? 'Natural organic cosmetics made in Canada. Dermatologist tested, no parabens.' : 'Cosmétiques biologiques naturels conçus au Canada. Testés dermatologiquement, sans parabènes.',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Rue de la Nature',
                addressLocality: 'Montréal',
                addressRegion: 'QC',
                postalCode: 'H2X 1A1',
                addressCountry: 'CA'
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'zoumcosmo@gmail.com',
                telephone: '+1-514-264-5963',
                contactType: 'customer service'
              },
              sameAs: [
                'https://facebook.com/vegederm',
                'https://instagram.com/vegederm',
                'https://tiktok.com/@vegederm'
              ]
            })}
          </script>
        )}
      </Helmet>
    </>
  );
}
