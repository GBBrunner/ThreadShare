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
import { FaUserCircle } from "react-icons/fa";
import DashboardInfoCard from "@/app/components/DashboardInfoCard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Dashboard() {
  const { signed_in_user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ProtectedRoute isLoggedIn={signed_in_user !== null}>
      {isLoading && <LoadingScreen />}
      <ToastContainer />
      <div className="NavbarSpace "></div>
      <main className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-0em)]
      theme-gradient">
        <div className="flex w-full justify-center items-center flex-col">
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
                  ? `${signed_in_user.firstname ?? ''} ${signed_in_user.lastname ?? ''}`.trim() || signed_in_user.username
                  : 'User Profile'}
              </h1>
              <div className="h-1 w-24 bg-blue-600 dark:bg-blue-400 rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <DashboardInfoCard label="Username" value={signed_in_user?.username}/>
              <DashboardInfoCard label="Display Name" value={signed_in_user?.displayName}/>
              <DashboardInfoCard label="Email" value={signed_in_user?.email}/>
              <DashboardInfoCard label="City" value={signed_in_user?.city}/>
              <DashboardInfoCard label="Followers" value={signed_in_user?.followerCount ?? 0}/>
              <DashboardInfoCard label="Following" value={signed_in_user?.followingCount ?? 0}/>

              <CopyField
                label="User ID"
                value={signed_in_user?.id}
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
