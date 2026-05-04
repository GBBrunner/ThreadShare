"use client"

import React, { useState } from "react";
import { useAuth } from '@/app/auth/useAuth'
import { SERVER_URL, getAuthHeaders } from '@/lib/config'
import ProtectedRoute from "@/app/components/ProtectedRoute";
import LoadingScreen from "@/app/components/LoadingScreen";

async function handleSignOut() {
  // Clear the signed-in user from localStorage to log out
  localStorage.removeItem('signed_in_user');
  localStorage.removeItem('auth_token');
  window.location.href = '/login'; // Redirect to login page after logout
}
async function handleDeleteAccount(setIsLoading) {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return;
  }
  const signed_in_user = JSON.parse(localStorage.getItem('signed_in_user'));
  if (!signed_in_user) {
    alert('No user is currently signed in.');
    return;
  }
  try {
    setIsLoading(true);
    const res = await fetch(`${SERVER_URL}/api/delete_account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username: signed_in_user.username })
    });
    setIsLoading(false);
    alert('Account deleted successfully');
    localStorage.removeItem('signed_in_user');
    localStorage.removeItem('auth_token');
    window.location.href = '/login'; // Redirect to login page after account deletion

  } catch (error) {
    setIsLoading(false);
    alert('An error occurred while deleting your account. Please try again later.');
    console.error('Error deleting account:', error);
  }
  
  
}
export default function Dashboard() {
  const { signed_in_user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <ProtectedRoute isLoggedIn={signed_in_user !== null}>
      {isLoading && <LoadingScreen />}
      <div className="headerSpace"></div>
        <div className="all-pages-style p-4">
            <h1 className="text-2xl font-bold mb-4">
              {signed_in_user
              ? `${signed_in_user.first_name ?? ''} ${signed_in_user.last_name ?? ''}`.trim()
              : ''}
            </h1>
            <h2 className="text-xl mb-4">Username: {signed_in_user?.username}</h2>
            <h2 className="text-lg mb-4">Role: {signed_in_user?.user_role}</h2>
            <h2 className="text-lg mb-4">Account Created: {signed_in_user?.created_at ? new Date(signed_in_user.created_at).toLocaleDateString() : ''}</h2>
              <h3 className ="text-sm mb-4">User ID: {signed_in_user?.user_id}</h3>
              <h3 className ="text-sm mb-4">Student ID: {signed_in_user?.student_id}</h3>
            
            <div className="flex flex-col items-start gap-2">
              <div className="flex w-72 space-x-2 mt-4 justify-start">
                <button className="bg-content-1 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1"
                onClick={ handleSignOut }
                >Log Out</button>

                <button className="bg-red-500 text-white px-4 py-1 text-sm rounded hover:bg-red-600 flex-1"
                onClick={() => handleDeleteAccount(setIsLoading)}
                >Delete Account</button>
              </div>
            </div>

        </div>
    </ProtectedRoute>
  );
}