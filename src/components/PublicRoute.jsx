import {
  Navigate
} from "react-router-dom";

import {
  getCurrentUser,
  isAuthenticated,
  logoutUser
} from "../utils/authStorage";

function PublicRoute({
  children
}) {
  const currentUser =
    getCurrentUser();

  const authenticated =
    isAuthenticated();

  const hasValidUser =
    currentUser &&
    currentUser.email &&
    currentUser.role;

  if (
    authenticated &&
    hasValidUser
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

  if (
    !authenticated &&
    (
      localStorage.getItem(
        "jobseekLoggedIn"
      ) === "true" ||
      localStorage.getItem(
        "jobseekCurrentUser"
      )
    )
  ) {
    logoutUser();
  }

  return children;
}

export default PublicRoute;