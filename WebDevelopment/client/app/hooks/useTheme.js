import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Set initial value
    setTheme(document.documentElement.dataset.theme ?? 'light');

    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme ?? 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
