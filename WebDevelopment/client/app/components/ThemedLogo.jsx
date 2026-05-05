'use client';

import { useTheme } from '../hooks/useTheme';

export default function ThemedLogo() {
  const theme = useTheme();
  return (
    <img src={theme === 'light' ? '/Shirt.png' : '/Shirt.png'} alt="Logo" className="w-32 h-32 mr-20 rotate-20" />
  );
}
