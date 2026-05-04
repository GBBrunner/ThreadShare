'use client';

export default function ListLabel({ width = 28, value, center = false, nowrap = false, className = '' }) {
    const widthClass = `w-${width}`;
    const centerClass = center ? 'text-center' : '';
    const nowrapClass = nowrap ? 'whitespace-nowrap' : '';
    return (
        <p className={`${widthClass} text-sm font-semibold ${centerClass} ${nowrapClass} ${className}`}>
            {value}
        </p>
    );
}
