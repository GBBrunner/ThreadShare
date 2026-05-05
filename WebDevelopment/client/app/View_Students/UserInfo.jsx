export default function UserInfo({ value, label, className = '', valueClassName = '', width }) {
    // If a fixed width (numeric) is provided, use inline styles to mirror ListLabel behavior.
    const hasWidth = typeof width === 'number';
    const style = hasWidth ? {
        width: `${width / 4}rem`,
        minWidth: `${width / 4}rem`,
        flex: '0 0 auto',
    } : undefined;

    return (
        <div style={style} className={`${hasWidth ? '' : 'min-w-0 flex-1'} ${className}`}>
            {label ? (
                <p className="md:hidden text-[11px] uppercase tracking-wide text-gray-500">
                    {label}
                </p>
            ) : null}
            <p className={`text-sm wrap-break-word ${valueClassName}`}>{value}</p>
        </div>
    );
}