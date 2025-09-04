// src/Router/AuthGuard.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { all_routes } from "../Router/all_routes"; // adjust path if needed

const useIsAuthed = () => {
  const userId = useSelector((s) => s.user?.userId);

  let persistedUserId = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) persistedUserId = JSON.parse(raw)?.userId ?? null;
    } catch (e) {
      // Intentionally ignore JSON/localStorage errors and fall back to Redux
      persistedUserId = null;
    }
  }

  return Boolean(userId || persistedUserId);
};

export function RequireAuth() {
  const isAuthed = useIsAuthed();
  const location = useLocation();

  return isAuthed ? (
    <Outlet />
  ) : (
    <Navigate to={all_routes.signinthree} replace state={{ from: location }} />
  );
}

export function GuestOnly() {
  const isAuthed = useIsAuthed();
  const location = useLocation();

  if (!isAuthed) return <Outlet />;

  const backTo = location.state?.from?.pathname || all_routes.newdashboard || "/";
  return <Navigate to={backTo} replace />
}
