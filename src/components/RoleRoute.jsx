import {
  Navigate,
  useLocation
} from "react-router-dom";

import {
  getCurrentUser,
  isAuthenticated,
  logoutUser
} from "../utils/authStorage";

function RoleRoute({
  children,
  allowedRole
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

  if (
    currentUser.role !==
    allowedRole
  ) {
    if (
      currentUser.role ===
      "recruiter"
    ) {
      return (
        <Navigate
          to="/recruiter"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default RoleRoute;