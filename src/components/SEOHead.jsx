import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "Tanaka - Professional Property Management System in Tanzania",
  description = "Transform your property management in Tanzania with Tanaka. Streamline rent collection, tenant management, lease tracking, and financial reporting. Start your free trial today!",
  keywords = "property management, Tanzania, rent collection, tenant management, lease management, property software, real estate management, rental property, property dashboard, TZS payments",
  image = "/og-image.png",
  url = "",
  type = "website",
  author = "Tanaka Property Management",
  canonical,
  noindex = false,
  structuredData
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://tanaka.co.tz";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Tanaka Property Management" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@TanakaTanzania" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  author: PropTypes.string,
  canonical: PropTypes.string,
  noindex: PropTypes.bool,
  structuredData: PropTypes.object,
};

export default SEOHead;