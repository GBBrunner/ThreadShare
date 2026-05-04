import { motion } from 'motion/react';

export default function LoadingScreen() {
    const letters = "Loading".split("");

    const letterVariants = {
        animate: (i) => ({
            y: [0, -4, 0],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.06,
                ease: "easeInOut",
            },
        }),
    };

    const dotVariants = {
        animate: (i) => ({
            y: [0, -8, 0, 0],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center h-screen w-screen bg-black/30">
            
            {/* Partial Gradient Spinner */}
            <div className="relative flex items-center justify-center animate-spin">
                <div 
                    className="h-36 w-36 rounded-full"
                    style={{
                        background: "linear-gradient(to right, #3b82f6, #10b981)", 
                        mask: `
                            radial-gradient(farthest-side, transparent calc(100% - 12px), black calc(100% - 11px)),
                            conic-gradient(black 0deg, black 180deg, transparent 270deg)
                        `,
                        WebkitMask: `
                            radial-gradient(farthest-side, transparent calc(100% - 12px), black calc(100% - 11px)),
                            conic-gradient(black 0deg, black 180deg, transparent 270deg)
                        `,
                        maskComposite: "intersect",
                        WebkitMaskComposite: "source-in"
                    }}
                />
            </div>
            
            {/* Added font-bold and tracking-wide for extra "punch" */}
            <h1 className="text-4xl absolute font-bold text-white flex items-baseline tracking-wide">
                <div className="flex">
                    {letters.map((char, i) => (
                        <motion.span
                            key={i}
                            custom={i}
                            variants={letterVariants}
                            animate="animate"
                            className="inline-block font-bold" // Explicitly bold
                            style={{ whiteSpace: 'pre' }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                <div className="flex ml-1">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            custom={i}
                            variants={dotVariants}
                            animate="animate"
                            className="inline-block font-bold" // Dots are now bold too
                        >
                            .
                        </motion.span>
                    ))}
                </div>
            </h1>
        </div>
    );
}