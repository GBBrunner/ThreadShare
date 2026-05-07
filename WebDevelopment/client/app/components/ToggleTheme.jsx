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
            className="flex items-center justify-center p-2 rounded-xl bg-accent-dark text-white hover:bg-secondary transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            >
            <img 
                src={theme === 'dark' ? '/dark-mode-outline.svg' : '/light-mode-outline.svg'} 
                alt={`${theme} mode`}
                className="w-6 h-6"
            />
        </button>
    );

}