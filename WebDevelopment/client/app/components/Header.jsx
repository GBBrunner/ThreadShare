"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {usePathname} from "next/navigation";
import { useAuth } from '@/app/auth/useAuth'
import { motion, useMotionValue, useScroll } from 'motion/react';
// React Icons
import { FaHome, FaRegUserCircle } from "react-icons/fa";
import { BsPersonFillAdd } from "react-icons/bs";
import { TiFolderAdd } from "react-icons/ti";
import { MdOutlineClass } from "react-icons/md";
import { PiStudentBold } from "react-icons/pi";


export default function Header() {
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


  const animateUp = {
    rotateX: -90,
  }
  const animateDown = {
    rotateX: 0,
  }

  return (
    <motion.header style={{ transformOrigin: "top" }} className="w-full h-[6.5em] fixed bg-content-2 top-0 z-50 text-white p-4 content-center" animate={direction === "up" ? animateDown : animateUp} transition={{ duration: 0.3, ease: "easeInOut"}}>
      <nav>
        <ul className="flex space-x-4 justify-between">
          <div className="flex space-x-5">
            
            <Link href="/" className="hover:underline flex items-center"><FaHome className="inline text-3xl mr-2" />
              Student Registration App
            </Link>
            {signed_in_user && signed_in_user.user_role === "admin" && (
              <>
                <Link href='/Register-Student' className="hover:underline flex items-center"><BsPersonFillAdd className="inline text-3xl mr-2" /> 
                  Register Student
                </Link>
                <Link href="/Add_Course" className="hover:underline flex items-center">
                  <TiFolderAdd className="inline text-3xl mr-2" />
                  Add a Course
                </Link>
                <Link href="/View_Students" className="hover:underline flex items-center">
                  <PiStudentBold className="inline text-3xl mr-2" />
                  View Students
                </Link>
              </>
            )}
            {signed_in_user && signed_in_user.user_role === "student" && (
              <>
                <Link href="/Enroll" className="hover:underline flex items-center">
                  <TiFolderAdd className="inline text-3xl mr-2" /> 
                  Enroll in Courses
                </Link>
                <Link href="/My_Courses" className="hover:underline flex items-center">
                  <MdOutlineClass className="inline text-3xl mr-2" />
                  My Courses
                </Link>
              </>
            )}
          </div>
            {signed_in_user ? (
                <Link href="/dashboard" className="hover:underline flex items-center"><FaRegUserCircle className="inline text-3xl mr-2" />
                  {signed_in_user.username}'s Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <span>
                    <Link href="/login" className="hover:underline flex items-center"><FaRegUserCircle className="inline text-3xl mr-2" />
                      Login
                    </Link>
                  </span>
                  <span>|</span>
                  <span>
                    <Link href="/signup" className="hover:underline flex items-center">
                      Sign Up
                    </Link>
                  </span>
                </div>
            )}
        </ul>
      </nav>
    </motion.header>
  );
}