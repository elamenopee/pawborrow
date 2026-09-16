import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  return children;
};

export default PublicRoute;