import 'dotenv/config';

export const production = process.env.NODE_ENV === 'production';
const secret = process.env.JWT_SECRET;
if (production && (!secret || secret.length < 32 || /super_secret|change_this|your_|replace|example/i.test(secret))) {
  throw new Error('Production requires a unique JWT_SECRET of at least 32 characters.');
}
if (production && !process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in production.');
export const jwtSecret = secret || 'super_secret_jwt_key';
export const allowedOrigins = (process.env.CORS_ORIGIN || (production ? '' : 'http://localhost:3000,http://127.0.0.1:3000'))
  .split(',').map(value => value.trim()).filter(Boolean);
if (production && (!allowedOrigins.length || allowedOrigins.some(origin => {
  try { const url = new URL(origin); return url.origin !== origin || (url.protocol !== 'https:' &&
    !(process.env.ALLOW_HTTP_ORIGINS === 'true' && url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))); }
  catch { return true; }
}))) throw new Error('CORS_ORIGIN must contain explicit HTTPS frontend origins in production.');
export const storageMode = process.env.STORAGE_MODE || (process.env.S3_BUCKET_NAME ? 's3' : 'local');
if (!['s3', 'local'].includes(storageMode)) throw new Error('STORAGE_MODE must be local or s3.');
if (storageMode === 's3' && !process.env.S3_BUCKET_NAME) throw new Error('S3_BUCKET_NAME is required for S3 storage.');
if (production && storageMode !== 's3' && process.env.ALLOW_LOCAL_STORAGE !== 'true') {
  throw new Error('Production requires S3 storage. ALLOW_LOCAL_STORAGE=true is for local container checks only.');
}
