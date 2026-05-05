'use client';

import ImageCarousel from "./components/ImageCarousel";
import { motion } from 'motion/react';
import { useTheme } from './hooks/useTheme';

import ProjectStack from "./components/ProjectStack";

export default function Home() {

  const theme = useTheme();

  return (
    <>
    <main className="bg-2 all-pages-style">
      <div className="py-12 border-b-4 all-pages-style flex justify-center items-center">
        <div className="introTestWrap h-26 bg-content-1 flex justify-center items-center py-6 px-30 rounded-lg">
          <h1 className="introTextBox text-4xl text-white font-bold pb-3 text-center">Oak City School District welcomes you to Woodland Community College</h1>
          
          </div>
      </div>
      <ImageCarousel images={['../server-side images/homepage/home-img-1.jpg', '../server-side images/homepage/home-img-2.jpg', '../server-side images/homepage/home-img-3.jpg']} />
      <div className="flex flex-col items-center all-pages-style theme-gradient">
        <ProjectStack />
      </div>
      <motion.div className="bg-2 px-8 py-15 border-b-4 border-t-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
        <div className="bg-content-2 px-8 py-2 rounded-2xl">
          <h3 className="text-3xl text-center">Woodland Community College has earned a reputation as the hidden gem of higher education, where students don’t just attend classes—they thrive. Nestled among quiet tree‑lined paths and modern learning spaces, Woodland blends small‑campus warmth with big‑campus ambition. Professors are known for remembering every student’s name, cheering on their goals, and turning even the toughest subjects into something surprisingly enjoyable. Whether it’s the vibrant student clubs, the hands‑on programs, or the campus culture that feels like a second home, Woodland Community College stands out as a place where people genuinely grow, connect, and discover what they’re capable of.</h3>
        </div>
      </motion.div>
    </main>
    </>
  )
}
