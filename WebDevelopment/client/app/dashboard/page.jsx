"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/useAuth";
import LogOut from "@/app/components/LogOut";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import LoadingScreen from "@/app/components/LoadingScreen";
import CopyField from "@/app/components/CopyField";
import { motion } from "motion/react";
import { FaUserCircle, FaPencilAlt } from "react-icons/fa";
import DashboardInfoCard from "@/app/components/DashboardInfoCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchWithAuth, SERVER_URL } from "@/lib/config";

const VISIBILITY_OPTIONS = [
  { value: "publicProfile", label: "Public" },
  { value: "privateProfile", label: "Private" },
  { value: "friendsOnly", label: "Friends Only" },
];

const TEXT_FIELDS = [
  { name: "firstname", label: "First Name" },
  { name: "lastname", label: "Last Name" },
  { name: "displayName", label: "Display Name" },
  { name: "username", label: "Username" },
  { name: "email", label: "Email", type: "email" },
  { name: "city", label: "City" },
  { name: "styleInterests", label: "Style Interests" },
  { name: "favoriteBrands", label: "Favorite Brands" },
];

function buildFormData(user) {
  return {
    firstname: user?.firstname ?? "",
    lastname: user?.lastname ?? "",
    displayName: user?.displayName ?? "",
    bio: user?.bio ?? "",
    city: user?.city ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    visibility: user?.visibility ?? "publicProfile",
    styleInterests: user?.styleInterests ?? "",
    favoriteBrands: user?.favoriteBrands ?? "",
  };
}

export default function Dashboard() {
  const { signed_in_user, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(buildFormData(signed_in_user));
  }, [signed_in_user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`${SERVER_URL}/api/update_user_info`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to update profile.");
        return;
      }
      const currentToken = localStorage.getItem("auth_token");
      signIn(data.user, currentToken);
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    setFormData(buildFormData(signed_in_user));
    setEditing(false);
  }

  return (
    <ProtectedRoute isLoggedIn={signed_in_user !== null}>
      {isLoading && <LoadingScreen />}
      <ToastContainer />
      <div className="NavbarSpace"></div>
      <main className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-0em)] theme-gradient">
        <div className="flex w-full justify-center items-center flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-content-2 p-8 xl:p-10 rounded-4xl flex flex-col shadow-2xl border border-black/5 dark:border-white/5 border-b-8 border-b-accent dark:border-b-accent-dark max-w-2xl w-full"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center justify-center w-full mb-4">
                <div className="flex-1"></div>
                <div className="flex flex-col items-center">
                  <FaUserCircle className="text-7xl mb-4 text-accent dark:text-accent-dark" />
                </div>
                <div className="flex-1 flex justify-end gap-6">
                  <div className="flex flex-col items-center">
                    <p className="text-2xl font-bold text-accent dark:text-accent-dark">
                      {signed_in_user?.followerCount ?? 0}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-dark">
                      Followers
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-2xl font-bold text-accent dark:text-accent-dark">
                      {signed_in_user?.followingCount ?? 0}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-dark">
                      Following
                    </p>
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-black text-center uppercase tracking-tight overflow-hidden">
                {signed_in_user
                  ? `${signed_in_user.firstname ?? ""} ${
                      signed_in_user.lastname ?? ""
                    }`.trim() || signed_in_user.username
                  : "User Profile"}
              </h1>
              <div className="h-1 w-32 bg-secondary dark:bg-secondary-dark rounded-full mt-2"></div>
            </div>

            {/* Info view */}
            {!editing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <DashboardInfoCard
                  label="Username"
                  value={signed_in_user?.username}
                />
                <DashboardInfoCard
                  label="Display Name"
                  value={signed_in_user?.displayName}
                />
                <DashboardInfoCard
                  label="Email"
                  value={signed_in_user?.email}
                />
                <DashboardInfoCard label="City" value={signed_in_user?.city} />
                <DashboardInfoCard
                  label="Visibility"
                  value={
                    VISIBILITY_OPTIONS.find(
                      (opt) => opt.value === signed_in_user?.visibility
                    )?.label || "Public"
                  }
                />

                <div className="md:col-span-3">
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex font-extrabold font-items-center gap-3 mb-3 text-accent dark:text-accent-dark uppercase text-xs tracking-wider">
                      Style Interests
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(signed_in_user?.styleInterests) && signed_in_user.styleInterests.length > 0 ? (
                        signed_in_user.styleInterests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="font-bold bg-secondary text-foreground px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-base font-semibold opacity-90">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-3 text-accent dark:text-accent-dark font-extrabold uppercase text-xs tracking-wider">
                      Favorite Brands
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(signed_in_user?.favoriteBrands) && signed_in_user.favoriteBrands.length > 0 ? (
                        signed_in_user.favoriteBrands.map((brand, idx) => (
                          <span
                            key={idx}
                            className="font-bold bg-secondary text-foreground px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {brand}
                          </span>
                        ))
                      ) : (
                        <p className="text-base font-semibold opacity-90">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-dark">
                    Bio
                  </label>
                  <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-base break-words whitespace-pre-wrap overflow-hidden">
                    {signed_in_user?.bio || "No bio provided"}
                  </div>
                </div>
              </div>
            )}

            {/* Edit form */}
            {editing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {TEXT_FIELDS.map(({ name, label, type = "text" }) => (
                  <div key={name} className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-dark">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name] ?? ""}
                      onChange={handleChange}
                      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-dark">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio ?? ""}
                    onChange={handleChange}
                    rows={3}
                    className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-dark">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility ?? "publicProfile"}
                    onChange={handleChange}
                    className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/10 dark:border-white/10">
              {!editing ? (
                <>
                  <div className="flex-1">
                    <LogOut />
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="w-full px-6 py-3 rounded-xl font-bold bg-secondary text-foreground hover:bg-secondary-light transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPencilAlt size={14} /> Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full px-6 py-3 rounded-xl font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="w-full px-6 py-3 rounded-xl font-bold bg-secondary text-foreground hover:bg-secondary-light transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
