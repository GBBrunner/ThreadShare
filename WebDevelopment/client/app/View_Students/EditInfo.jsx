export default function EditInfo({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    field,
    formData,
    setFormData,
    wrapperClassName = '',
    className = ''

}) {
    const resolvedPlaceholder =
        placeholder ?? (typeof label === 'string' ? label : '');

    const resolvedValue =
        value ?? (field && formData ? formData[field] : '');

    const resolvedOnChange =
        onChange ??
        (setFormData && field
            ? (e) => {
                  const nextValue = e.target.value;
                  setFormData((prev) => ({ ...prev, [field]: nextValue }));
              }
            : undefined);

    return (
        <div className={`min-w-0 flex-1 ${wrapperClassName}`}> 
            {label ? (
                <p className="md:hidden text-[11px] uppercase tracking-wide text-gray-500">
                    {label}
                </p>
            ) : null}
            <input
                type={type}
                value={resolvedValue ?? ''}
                placeholder={resolvedPlaceholder}
                onChange={resolvedOnChange}
                className={`min-w-0 w-full flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 px-1 py-0.5 ${className}`}
            />
        </div>
    );
}