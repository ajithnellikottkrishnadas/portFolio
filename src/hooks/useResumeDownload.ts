import { useCallback, useState } from 'react';

/**
 * Downloads the resume PDF. Checks that the file exists first so the button never
 * silently fails: if the file is missing, the user gets a clear message instead.
 */
export function useResumeDownload(path: string) {
  const [status, setStatus] = useState('');

  const download = useCallback(async () => {
    setStatus('Preparing resume…');
    try {
      const res = await fetch(path, { method: 'HEAD', cache: 'no-cache' });
      const type = res.headers.get('content-type') ?? '';
      if (!res.ok || type.includes('text/html')) {
        setStatus('Resume file is not published yet.');
        return;
      }
      const a = document.createElement('a');
      a.href = path;
      a.download = 'Ajith_Nellikott_Krishnadas_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStatus('');
    } catch {
      setStatus('Could not reach the resume file. Please try again or use the contact section.');
    }
  }, [path]);

  return { download, status };
}
