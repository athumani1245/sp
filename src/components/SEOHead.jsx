import { useEffect } from 'react';
import PropTypes from 'prop-types';

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

  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Function to update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Function to update or create link tags
    const updateLinkTag = (rel, href) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Update primary meta tags
    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    
    // Update robots meta tag
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      // Remove noindex if it exists
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta && robotsMeta.content.includes('noindex')) {
        robotsMeta.remove();
      }
    }
    
    // Update canonical link
    updateLinkTag('canonical', canonicalUrl);
    
    // Update Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImageUrl, true);
    updateMetaTag('og:site_name', 'Tanaka Property Management', true);
    
    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', fullImageUrl, true);
    updateMetaTag('twitter:creator', '@TanakaTanzania');
    
    // Update structured data
    if (structuredData) {
      // Remove existing structured data script
      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo-component]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Add new structured data script
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-component', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, author, canonical, noindex, type, fullUrl, fullImageUrl, canonicalUrl, structuredData]);

  // This component doesn't render anything visible
  return null;
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