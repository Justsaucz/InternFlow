import { API_BASE } from '../../utils/api';
import { useState, type AnchorHTMLAttributes, type MouseEvent } from 'react';

const api = API_BASE;
export default function FileLink({ href = '', children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const [error, setError] = useState('');
  const managed = href.startsWith('/uploads/') || (() => {
    try { const url = new URL(href); return (url.origin === new URL(api).origin && url.pathname.startsWith('/uploads/')) ||
      (import.meta.env.VITE_S3_BUCKET_NAME && url.hostname.startsWith(import.meta.env.VITE_S3_BUCKET_NAME+'.s3.') && url.hostname.endsWith('.amazonaws.com')); } catch { return false; }
  })();
  const safe = managed || /^https?:\/\//i.test(href);
  async function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!managed) return;
    event.preventDefault(); setError('');
    const preview = window.open('about:blank', '_blank');
    if (preview) preview.opener = null;
    try {
      let storedUrl = href;
      try { const url = new URL(href); if (url.origin === new URL(api).origin) storedUrl = url.pathname; } catch { /* relative upload */ }
      const response = await fetch(`${api}/api/upload/content?url=${encodeURIComponent(storedUrl)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
      });
      if (!response.ok) throw new Error('Unable to open this file. Check your access or sign in again.');
      const objectUrl = URL.createObjectURL(await response.blob());
      if (preview) preview.location.href = objectUrl;
      else { const link = document.createElement('a'); link.href = objectUrl; link.download = ''; link.click(); }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 300000);
    } catch (reason) { preview?.close(); setError(reason instanceof Error ? reason.message : 'Unable to open file.'); }
  }
  return <><a {...props} href={safe ? href : undefined} onClick={open} rel="noopener noreferrer">{children}</a>
    {error && <span role="alert" className="text-xs text-red-600">{error}</span>}</>;
}
