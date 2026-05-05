'use client';

export default function ListLabel({ width = 28, value, center = false, nowrap = false, className = '', widthClass = '' }) {
    const centerClass = center ? 'text-center' : '';
    const nowrapClass = nowrap ? 'whitespace-nowrap' : '';

    // Tailwind can't reliably generate `w-${width}` dynamic classes.
    // This keeps the label widths aligned with the fixed-width course columns.
    const widthRem = width / 4; // Tailwind spacing unit: 1 = 0.25rem
    const style = widthClass
        ? undefined
        : {
              width: `${widthRem}rem`,
              minWidth: `${widthRem}rem`,
              flex: '0 0 auto',
          };

    return (
        <p style={style} className={`text-sm font-semibold ${centerClass} ${nowrapClass} ${widthClass} ${className}`}>
            {value}
        </p>
    );
}
