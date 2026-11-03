// CloudFront can route /api and /uploads to the ALB on the same origin.
export const API_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:4000')).replace(/\/$/, '');
