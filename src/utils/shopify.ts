export const normalizeDomain = (domainOrUrl: string) => {
  if (!domainOrUrl) return '';
  const trimmed = domainOrUrl.trim();
  const noProto = trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return noProto.toLowerCase();
};

export const getShopifyAdminProductUrl = (domainOrUrl: string, handle: string) => {
  const domain = normalizeDomain(domainOrUrl);
  if (!domain || !handle) return null;
  const storeName = domain.replace('.myshopify.com', '').split('/')[0];
  if (!storeName) return null;
  return `https://admin.shopify.com/store/${storeName}/products/${handle}`;
};

export const getPublicProductUrl = (domainOrUrl: string, handle: string) => {
  const domain = normalizeDomain(domainOrUrl);
  if (!domain || !handle) return null;
  return `https://${domain}/products/${handle}`;
};
