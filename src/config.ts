// Use Vercel proxy to avoid mixed content issues (HTTPS page calling HTTP API)
// export const API_BASE_URL = '/api';
export const API_BASE_URL = 'http://84.201.180.219:80'; // Direct HTTP (blocked by browser on HTTPS)
// export const API_BASE_URL = 'http://172.20.10.6:5050' // Local dev


export const QR_ENCRYPTION_KEY = 'onec_key_example'