'use client'

import { useEffect, useState } from "react";
import { motion } from 'motion/react';


export default function ImageCarousel({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalImages = images.length;

    function handleClickDown() {
        if (currentIndex - 1 < 0) {
            setCurrentIndex(totalImages - 1);
        } else {
            setCurrentIndex(currentIndex - 1);
        }
    };
    function handleClickUp() {
        if (currentIndex + 1 > totalImages - 1) {
            setCurrentIndex(0);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return(
        <div className="imgWrap w-full h-150 overflow-hidden flex justify-center items-center relative bg-black">
            <motion.button onClick={handleClickDown} className="absolute left-5 top-1/2 font-bold text-6xl cursor-pointer text-white pb-3 px-4" initial={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.61)' }} whileHover={{ backgroundColor: 'rgba(60, 60, 60, 0.35)', color: 'rgba(255, 255, 255, 1)' }}>{'<'}</motion.button>
           <motion.img key={currentIndex} src={images[currentIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="w-full" />
            <motion.button onClick={handleClickUp} className="absolute right-5 top-1/2 font-bold text-6xl cursor-pointer text-white pb-3 px-4" initial={{ backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.61)' }} whileHover={{ backgroundColor: 'rgba(60, 60, 60, 0.35)', color: 'rgba(255, 255, 255, 1)' }}>{'>'}</motion.button>
        </div>
    )
}