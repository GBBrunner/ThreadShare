"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/useAuth";
import { motion, useScroll } from "motion/react";
// Components
import ToggleTheme from "@/app/components/ToggleTheme";
import LogOut from "@/app/components/LogOut";
import NavLink from "@/app/components/NavLink";
// React Icons
import { MdMenuOpen } from "react-icons/md";
import NewPostButton from "@/app/components/NewPostButton";

export default function Navbar({
  isOpen = true,
  onToggle,
  onScrollCollapsedChange,
}) {
  const { signed_in_user } = useAuth();
  const { scrollY } = useScroll();

  const [direction, setDirection] = useState("up");

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      const previous = scrollY.getPrevious();
      const diff = latest - previous;

      const newDir = diff > 0 ? "down" : "up";
      setDirection(newDir);
    });
  }, [scrollY]);

  useEffect(() => {
    if (typeof onScrollCollapsedChange === "function") {
      if (direction === "down") {
        onScrollCollapsedChange(true);
      }
    }
  }, [direction, onScrollCollapsedChange]);

  return (
    <>
      <motion.aside
        className="h-full w-[min(18rem,85vw)] lg:w-[12.5em] fixed bg-accent top-0 left-0 z-50 text-white content-center rounded-r-lg lg:rounded-r-none lg:rounded-tr-lg shadow-2xl lg:shadow-none"
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="relative h-full">
          {typeof onToggle === "function" && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onToggle}
              className="absolute top-3 right-3 z-60 rounded-md bg-transparent text-white p-2 transition-colors duration-300 ease-in-out"
            >
              <MdMenuOpen size={24} />
            </button>
          )}
          <nav className="h-full text-lg">
            <ul className="flex flex-col h-full space-y-4 justify-between pt-14">
              {signed_in_user ? (
                <div className="flex flex-col items-start gap-2">
                  <NavLink href="/dashboard" icon={<img src="/profile-outline.svg" alt="" width={30} height={30} />}>
                    {signed_in_user.username}'s Dashboard
                  </NavLink>
                  <NavLink href="/my-closet" icon={<img src="/tops-outline.svg" alt="" width={30} height={30} />}>
                    My Closet
                  </NavLink>
                  <NavLink href="/favorites" icon={<img src="/heart-outline.svg" alt="" width={30} height={30} />}>
                    Favorites
                  </NavLink>
                  <NavLink href="/my-comments" icon={<img src="/chat-outline.svg" alt="" width={30} height={30} />}>
                    My Comments
                  </NavLink>
                  <NewPostButton />
                </div>
              ) : (
                <div />
              )}
              <div className="flex flex-col gap-6">
                <NavLink href="/" icon={<img src="/home-outline.svg" alt="" width={30} height={30} />}>
                  Home
                </NavLink>

                {!signed_in_user && (
                  <NavLink href="/login" icon={<img src="/profile-outline.svg" alt="" width={30} height={30} />}>
                    Login
                  </NavLink>
                )}
              </div>
              <div className="mt-auto border-t-2 border-white/20 p-4 flex flex-col gap-4">
                {signed_in_user && <LogOut />}
                <ToggleTheme />
              </div>
            </ul>
          </nav>
        </div>
      </motion.aside>

    </>
  );
}
