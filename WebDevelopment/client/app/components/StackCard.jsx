'use client';

import { createContext, useContext, Fragment } from 'react';
import { motion } from 'motion/react';
import { FaPlus } from 'react-icons/fa';

// Explicit classes so Tailwind doesn't purge them.
const ACCENTS = {
  blue:    { text: 'text-blue-600 dark:text-blue-400',       border: 'border-b-blue-600 dark:border-b-blue-400' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', border: 'border-b-emerald-600 dark:border-b-emerald-400' },
  indigo:  { text: 'text-indigo-600 dark:text-indigo-400',   border: 'border-b-indigo-600 dark:border-b-indigo-400' },
};

const StackCardContext = createContext(null);

export function StackCardAccent({ as: Component = 'strong', className = 'font-semibold', children }) {
  const { accentText = '' } = useContext(StackCardContext) ?? {};
  return <Component className={`${className} ${accentText}`.trim()}>{children}</Component>;
}

export default function StackCard({
  title,
  titleClassName = '',
  className = '',
  whileHover = { y: -8, transition: { duration: 0.2 } },
  accent,
  bottomBorder = true,
  icons,
  iconRow = true,
  bodyClassName = 'space-y-4 text-sm leading-relaxed opacity-90',
  children,
}) {
  const { text: accentText, border: accentBorder } = ACCENTS[accent] ?? { text: '', border: '' };

  const iconNodes = icons?.filter(Boolean) ?? [];
  const showIconRow = iconRow && iconNodes.length > 0;

  // Build a CSS grid that gives each icon equal space with auto-sized + separators.
  const gridTemplateColumns = iconNodes.length <= 1
    ? '1fr'
    : iconNodes.map(() => '1fr').join(' auto ');

  return (
    <StackCardContext.Provider value={{ accentText }}>
      <motion.div
        whileHover={whileHover}
        className={`bg-content-2 p-6 xl:p-8 rounded-4xl flex flex-col shadow-lg border border-black/5 dark:border-white/5 ${bottomBorder ? `border-b-8 ${accentBorder}` : ''} ${className}`}
      >
        {title && (
          <h2 className={`text-2xl font-bold mb-8 text-center ${titleClassName || accentText}`}>
            {title}
          </h2>
        )}

        {showIconRow && (
          <div className="grid items-center mb-10 h-20 gap-2" style={{ gridTemplateColumns }}>
            {iconNodes.map((node, i) => (
              <Fragment key={i}>
                {i > 0 && <FaPlus className="text-sm opacity-20 shrink-0" />}
                <div className="flex justify-center min-w-0">{node}</div>
              </Fragment>
            ))}
          </div>
        )}

        {children && <div className={bodyClassName}>{children}</div>}
      </motion.div>
    </StackCardContext.Provider>
  );
}