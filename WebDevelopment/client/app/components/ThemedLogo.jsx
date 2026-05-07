'use client';

import { useTheme } from '../hooks/useTheme';

export default function ThemedLogo() {
  const theme = useTheme();
  return (
    <div className="introTestWrap bg-secondary flex justify-center items-center py-6 px rounded-lg" style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
      <img src={theme === 'light' ? '/TS-icon-tan.png' : '/TS-icon-teal.png'} alt="Logo" className="block md:hidden w-[40%] mr-20" />
      <img src={theme === 'light' ? '/borrow-the-look-light.png' : '/borrow-the-look-dark.png'} alt="Logo" className="hidden md:block w-[40%] mr-20" />
    </div>
  );
}
