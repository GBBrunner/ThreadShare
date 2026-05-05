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
            
            <div className="flex flex-col items-center justify-center gap-4">
                {/* Spinner + overlayed Loading text */}
                <div className="relative flex items-center justify-center">
                    <div 
                        className="h-36 w-36 rounded-full animate-spin"
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

                    <h1 className="text-4xl absolute inset-0 flex items-center justify-center font-bold text-white tracking-wide">
                        <div className="flex">
                            {letters.map((char, i) => (
                                <motion.span
                                    key={i}
                                    custom={i}
                                    variants={letterVariants}
                                    animate="animate"
                                    className="inline-block font-bold"
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
                                    className="inline-block font-bold"
                                >
                                    .
                                </motion.span>
                            ))}
                        </div>
                    </h1>
                </div>

                <div className="text-center text-white">
                    <h3>Please note that application may need a cold start</h3>
                    <h3>Thank you for your patience!</h3>
                </div>
            </div>
        </div>
    );
}