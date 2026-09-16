import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type PublicRouteProps = {
  children: ReactNode;
};

const PublicRoute = ({
  children,
}: PublicRouteProps) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
};

export default PublicRoute;