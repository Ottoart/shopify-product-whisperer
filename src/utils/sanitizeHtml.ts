import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string, options?: any): string => {
  if (!html) return '';
  
  // Default configuration - allows basic formatting tags but removes scripts and event handlers
  const defaultConfig: any = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'button', 'iframe'],
    FORBID_ATTR: ['onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
    ADD_ATTR: ['target'],
    FORCE_BODY: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_DOM: true
  };

  const config = { ...defaultConfig, ...options };
  
  try {
    return String(DOMPurify.sanitize(html, config));
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Return plain text as fallback
    return html.replace(/<[^>]*>/g, '');
  }
};

/**
 * Creates a sanitized HTML component prop for React
 * @param html - The HTML string to sanitize
 * @returns Object suitable for dangerouslySetInnerHTML
 */
export const createSanitizedHtml = (html: string) => ({
  __html: sanitizeHtml(html)
});