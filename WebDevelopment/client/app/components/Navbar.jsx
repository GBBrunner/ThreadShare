"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from '@/app/auth/useAuth'
import { motion, useScroll } from 'motion/react';
// Components
import ToggleTheme from '@/app/components/ToggleTheme';
import LogOut from "@/app/components/LogOut";
import NavLink from "@/app/components/NavLink";
// React Icons
import { FaHome, FaRegUserCircle } from "react-icons/fa";
import { BsPersonFillAdd } from         "react-icons/bs";
import { TiFolderAdd } from             "react-icons/ti";
import { MdOutlineClass } from          "react-icons/md";
import { PiStudentBold } from           "react-icons/pi";
import { MdMenuOpen } from 'react-icons/md';

export default function Navbar({ isOpen = true, onToggle, onScrollCollapsedChange }) {
  const { signed_in_user } = useAuth();
  const { scrollY } = useScroll();

  const [direction, setDirection] = useState("up")

  useEffect(() => {
  return scrollY.on("change", (latest) => {
    const previous = scrollY.getPrevious();
    const diff = latest - previous;

    const newDir = diff > 0 ? "down" : "up";
    setDirection(newDir);
  });
}, [scrollY]);

  useEffect(() => {
    if (typeof onScrollCollapsedChange === 'function') {
      if (direction === 'down') {
        onScrollCollapsedChange(true);
      }
    }
  }, [direction, onScrollCollapsedChange]);

  return (
    <motion.aside
      className="h-full w-[min(18rem,85vw)] lg:w-[12.5em] fixed bg-emerald-800 top-0 left-0 z-50 text-white content-center rounded-r-lg lg:rounded-r-none lg:rounded-tr-lg shadow-2xl lg:shadow-none"
      animate={{
        x: isOpen ? 0 : "-100%",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="relative h-full">
        {typeof onToggle === 'function' && (
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
              <NavLink href="/dashboard" icon={<FaRegUserCircle />}>
                {signed_in_user.username}'s Dashboard
              </NavLink>
            ) : (
              <div />
            )}
            <div className="flex flex-col gap-6">
             
            <NavLink href="/" icon={<FaHome />}>Home</NavLink>

            {!signed_in_user && (
              <>
                <div className="flex items-center gap-2">
                  <FaRegUserCircle className="text-3xl" />
                  <div className="flex flex-col gap-1">
                    <NavLink href="/signup" pill>
                      Sign Up
                    </NavLink>
                    <NavLink href="/login" pill>
                      Login
                    </NavLink>
                  </div>
                </div>
              </>
            )}
            {signed_in_user && (signed_in_user.user_role === "admin" || signed_in_user.user_role === "demo-admin") && (
              <>
                <NavLink href="/Register-Student" icon={<BsPersonFillAdd />}>
                  Register Student
                </NavLink>
                <NavLink href="/Add_Course" icon={<TiFolderAdd />}>
                  Add a Course
                </NavLink>
                <NavLink href="/View_Students" icon={<PiStudentBold />}>
                  View Students
                </NavLink>
              </>
            )}
            {signed_in_user && (signed_in_user.user_role === "student" || signed_in_user.user_role === "demo-student") && (
              <>
                <NavLink href="/Enroll" icon={<TiFolderAdd />}>
                  Enroll in Courses
                </NavLink>
                <NavLink href="/My_Courses" icon={<MdOutlineClass />}>
                  My Courses
                </NavLink>
              </>
            )}
          </div>
            <div className="mt-auto border-t-2 border-emerald-700/50 p-4 flex flex-col gap-4">
              {signed_in_user && (
                  <LogOut />
              )}
                <ToggleTheme/>
            </div>
      
          </ul>
        </nav>
      </div>
    </motion.aside>
  );
}