import { Navigate, Outlet } from "react-router-dom";
import { useAuth, useProfile } from "@repo/api";

export default function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading} = useProfile();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (profile?.role !== "admin" || !profile.is_active) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}