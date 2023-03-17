export const DEPLOYMENT_URL = process.env.VERCEL_DEPLOY_WEBHOOK;
export const VERCEL_API_URL = process.env['API_URL'] || 'videreproject.com';
export const DATA_DIR = 'api/data';

export const VERCEL_DOMAIN_REDIRECT = (url) => url
  .replace('://www.', '://')
  .replace('videreproject.com/api/', 'api.videreproject.com/');