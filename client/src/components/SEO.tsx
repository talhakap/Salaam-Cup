import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  noindex?: boolean;
}

const SITE_NAME = "Salaam Cup";
const DEFAULT_DESCRIPTION = "Salaam Cup is the Greater Toronto Area's premier Muslim community sports tournament. Join competitive ball hockey, basketball, soccer, and softball tournaments across Toronto, Mississauga, and the GTA.";
const DEFAULT_OG_IMAGE = "/images/hero-landing.png";
const SITE_URL = "https://salaamcup.com";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Toronto & GTA Muslim Community Sports Tournaments`;
  const defaultKeywords = "Salaam Cup, Toronto sports tournament, GTA Muslim sports, ball hockey Toronto, basketball tournament Mississauga, soccer tournament GTA, softball Toronto, Muslim community sports, Greater Toronto Area tournaments, youth sports Toronto";
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={`${SITE_URL}${canonical}`} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonical && <meta property="og:url" content={`${SITE_URL}${canonical}`} />}
      <meta property="og:locale" content="en_CA" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`} />

      <meta name="geo.region" content="CA-ON" />
      <meta name="geo.placename" content="Toronto" />
    </Helmet>
  );
}
