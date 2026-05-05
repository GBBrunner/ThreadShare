"use client"

import React, { useEffect, useState } from "react";
import { useAuth } from '@/app/auth/useAuth'
// Components
import LogOut from "@/app/components/LogOut";
import DeleteAccountBttn from "@/app/components/DeleteAccountBttn";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import LoadingScreen from "@/app/components/LoadingScreen";
import CopyField from "@/app/components/CopyField";
import { motion } from 'motion/react';
import { FaUserCircle, FaShieldAlt, FaCalendarAlt } from "react-icons/fa";
import DashboardInfoCard from "@/app/components/DashboardInfoCard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Dashboard() {
  const { signed_in_user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isDemoUser = signed_in_user && (signed_in_user.user_role === 'demo-admin' || signed_in_user.user_role === 'demo-student');
  return (
    <ProtectedRoute isLoggedIn={signed_in_user !== null}>
      {isLoading && <LoadingScreen />}
      <ToastContainer />
      <div className="NavbarSpace "></div>
      <main className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-0em)] 
      theme-gradient">
        <div className="flex w-full justify-center items-center flex-col">
          {isDemoUser && (
            <div className="mb-6 flex items-center justify-center w-full">
              <span className="bg-gray-100/80 text-gray-700 px-4 py-2 rounded shadow text-base">All data in this project is test data, none of it reflects real data.</span>
            </div>
          )}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-content-2 p-8 xl:p-10 rounded-4xl flex flex-col shadow-2xl border border-black/5 dark:border-white/5 border-b-8 border-b-blue-600 dark:border-b-blue-400 max-w-2xl w-full"
          >
            <div className="flex flex-col items-center mb-8">
              <FaUserCircle className="text-7xl mb-4 text-blue-600 dark:text-blue-400" />
              <h1 className="text-4xl font-black text-center uppercase tracking-tight">
                {signed_in_user
                  ? `${signed_in_user.first_name ?? ''} ${signed_in_user.last_name ?? ''}`.trim()
                  : 'User Profile'}
              </h1>
              <div className="h-1 w-24 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <DashboardInfoCard label="Username" value={signed_in_user?.username}/>
              <DashboardInfoCard label="Role" value={signed_in_user?.user_role}/>

              <CopyField 
                label="User ID" 
                value={signed_in_user?.user_id} 
              />

              <CopyField 
                label="Student ID" 
                value={signed_in_user?.student_id} 
              />

              <DashboardInfoCard
                icon={<FaCalendarAlt />}
                label="Account Created"
                value={signed_in_user?.created_at
                  ? new Date(signed_in_user.created_at).toLocaleLongDateString?.() || new Date(signed_in_user.created_at).toLocaleDateString()
                  : 'N/A'}
                className="md:col-span-2"
              />
            </div>


            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/10 dark:border-white/10">
              <div className="flex flex-1 gap-4">
                <div className="flex-1">
                  <LogOut/>
                </div>
                <div className="flex-1">
                  <DeleteAccountBttn setIsLoading={setIsLoading} />
                </div>
              </div>
            </div>
            <div className="text-center mt-6 text-sm opacity-80">
              <p>Note: Deleting your account is irreversible. All your data will be permanently removed.</p>
            </div>
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
