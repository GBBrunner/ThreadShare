"use client";

import { SERVER_URL, getAuthHeaders } from '@/lib/config';

export default function DeleteAccountBttn({ setIsLoading = () => {} }) {
  const signed_in_user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem('signed_in_user')) : null;
  const isDemoUser = signed_in_user && (signed_in_user.user_role === 'demo-admin' || signed_in_user.user_role === 'demo-student');

  async function handleDeleteAccount() {
    if (isDemoUser) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${SERVER_URL}/api/delete_account`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signed_in_user.username }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete account. Please try again.');
        return;
      }
      localStorage.removeItem('signed_in_user');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative group flex-1">
      <button
        type="button"
        className={`w-full px-6 py-3 rounded-xl border font-bold transition-all duration-300 ${
          isDemoUser 
            ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
            : 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500'
        }`}
        onClick={handleDeleteAccount}
        disabled={isDemoUser}
      >
        Delete Account
      </button>

      {/* Custom CSS Tooltip */}
      {isDemoUser && (
        <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          Disabled for demo users
        </span>
      )}
    </div>
  );
}