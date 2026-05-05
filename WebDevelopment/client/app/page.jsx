'use client';

import ImageCarousel from "./components/ImageCarousel";
import { motion } from 'motion/react';
import { useTheme } from './hooks/useTheme';
export default function Home() {

  const theme = useTheme();

  return (
    <>
    <main className="bg-2 all-pages-style flex flex-col h-screen">
      <div className="py-12 border-b-4 all-pages-style flex justify-center items-center">
        <img src={theme === 'light' ? '/Shirt.png' : '/Shirt.png'} alt="Logo" className="w-32 h-32 mr-20 rotate-20" />
        <div className="introTestWrap h-26 bg-content-1 flex justify-center items-center py-6 px-60 rounded-lg">
          <h1 className="introTextBox text-4xl text-white font-bold pb-3 text-center">ThreadShare</h1>
          
          </div>
      </div>
      <ImageCarousel images={['/img-carousel/cat1.jpg', '/img-carousel/cat2.jpg', '/img-carousel/cat3.jpg']} />
      <div className="flex flex-col items-center all-pages-style theme-gradient">
      </div>
    </main>
    </>
  )
}
