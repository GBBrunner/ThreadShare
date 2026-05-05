"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ProtectedRoute = ({ isLoggedIn, userRole, requiredRole, children }) => {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      const normalizedUserRole = userRole?.toString().trim().toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role =>
        role.toString().trim().toLowerCase()
      );

      if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
        router.replace("/403-Unauthorized");
      }
    }
  }, [isLoggedIn, userRole, requiredRole, router]);

  if (!isLoggedIn) return null;

  return children;
};

export default ProtectedRoute;