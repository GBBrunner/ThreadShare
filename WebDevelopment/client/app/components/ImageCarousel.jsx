'use client'

import { useState } from "react";
import { motion } from 'motion/react';
import { GrPrevious, GrNext } from "react-icons/gr";


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
        <div className="imgWrap all-pages-style flex-1 min-h-0 overflow-hidden flex justify-center items-center relative bg-black">
            <button onClick={handleClickDown} className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full p-2 cursor-pointer text-white/60 hover:text-white hover:bg-black/35 transition-colors">
                <GrPrevious size={32} />
            </button>
            <motion.img key={currentIndex} src={images[currentIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="w-full" />
            <button onClick={handleClickUp} className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-2 cursor-pointer text-white/60 hover:text-white hover:bg-black/35 transition-colors">
                <GrNext size={32} />
            </button>
        </div>
    )
}