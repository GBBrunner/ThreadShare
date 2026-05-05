import React from 'react';
import { FaCopy, FaIdBadge } from "react-icons/fa";
import { toast } from 'react-toastify';

/**
 * A reusable field component that displays a label, icon, and value
 * with a hover-to-show copy button.
 */
export default function CopyField({ 
  label, 
  value, 
  icon: Icon = FaIdBadge, 
  isMono = true,
  className = "" 
}) {
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success('Copied!', {
      position: "bottom-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "colored",
    });
  };

  return (
    <div className={`bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 group relative ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-wider">
          {Icon && <Icon />} {label}
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 hover:bg-blue-600/10 rounded-lg transition-colors text-blue-600 dark:text-blue-400 group-hover:opacity-100 opacity-0 md:opacity-0 focus:opacity-100 cursor-pointer"
          title={`Copy ${label}`}
        >
          <FaCopy size={14} />
        </button>
      </div>
      <p className={`text-lg opacity-80 break-all pr-8 ${isMono ? 'font-mono' : 'font-semibold'}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}
