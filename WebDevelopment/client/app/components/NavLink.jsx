"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavLink({
  href,
  icon,
  children,
  className = ""
}) {
  const pathname = usePathname();
  const selected = pathname === href;

  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`group block w-full ${className}`.trim()}
    >
      <div 
        className={`flex items-start gap-4 px-4 py-3 rounded-[2rem] transition-colors duration-200 
          ${selected ? "bg-white/20" : "bg-transparent"}`}
      >
        {icon && (
          <span className="shrink-0 text-3xl mt-0.5 opacity-90">
            {icon}
          </span>
        )}
        
        <div className="flex flex-col items-start">
          {/* 'inline' allows the background/underline to wrap with the text.
            We use a linear-gradient background to simulate a 'hugging' underline.
          */}
          <span 
            className={`text-lg font-medium leading-[1.2] transition-all duration-300
              inline
              bg-gradient-to-r from-white to-white
              bg-no-repeat
              bg-bottom
              pb-1
              ${selected 
                ? "bg-[length:0%_2px]" 
                : "bg-[length:0%_2px] group-hover:bg-[length:100%_2px]"
              }
            `}
          >
            {children}
          </span>
        </div>
      </div>
    </Link>
  );
}