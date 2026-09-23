import {
  Navigate,
  useLocation
} from "react-router-dom";

import {
  getCurrentUser,
  isAuthenticated,
  logoutUser
} from "../utils/authStorage";

function ProtectedRoute({
  children
}) {
  const location =
    useLocation();

  const currentUser =
    getCurrentUser();

  const authenticated =
    isAuthenticated();

  const hasValidUser =
    currentUser &&
    currentUser.email &&
    currentUser.role;

  if (
    !authenticated ||
    !hasValidUser
  ) {
    logoutUser();

    return (
      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;