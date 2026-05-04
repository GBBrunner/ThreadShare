"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ isLoggedIn, userRole, requiredRole, children }) => {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in
    if (!isLoggedIn) {
      router.replace("/login");
    }
      // If a required role is specified, check if the user has that role
    if (requiredRole && userRole !== requiredRole) {
      router.replace("/403-Unauthorized"); // Redirect to an unauthorized page or any other page
    }
  }, [isLoggedIn, userRole, requiredRole, router]);

  if (!isLoggedIn) return null;
  return children;
};

export default ProtectedRoute;