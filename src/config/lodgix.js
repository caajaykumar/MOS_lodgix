const LODGIX_CONFIG = {
  API_BASE_URL: 'https://www.lodgix.com/public-api/v2',
  // Prefer secure server-side secret; fallback to public variable if needed for client-only fetches
  getApiKey: () => process.env.LODGIX_API_KEY || process.env.NEXT_PUBLIC_LODGIX_API_KEY || '',
  getHeaders: () => ({
    'Authorization': `Token ${LODGIX_CONFIG.getApiKey()}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  })
};

export default LODGIX_CONFIG;
