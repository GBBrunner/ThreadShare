import React from "react";
import { FaShieldAlt } from "react-icons/fa";

export default function DashboardInfoCard({ icon = <FaShieldAlt />, label, value, className = "" }) {
  return (
    <div className={`bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 ${className}`}>
      <div className="flex items-center gap-3 mb-1 text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-wider">
        {icon} {label}
      </div>
      <p className="text-xl font-semibold opacity-90">{value}</p>
    </div>
  );
}
