import { useState, useEffect } from 'react';


export default function ToggleTheme() {
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        const resolved = stored === 'dark' || stored === 'light' ? stored : 'light';
        setTheme(resolved);
        document.documentElement.dataset.theme = resolved;
  }, []);

    function toggleTheme() {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
      return next;
    });
  }
    return (
        
        <button
            type="button"
            className="px-6 py-3 w-full text-lg rounded-xl font-bold bg-accent-dark text-white hover:bg-secondary transition-colors"
            onClick={toggleTheme}
            >
            Theme: {theme}
        </button>
    );

}