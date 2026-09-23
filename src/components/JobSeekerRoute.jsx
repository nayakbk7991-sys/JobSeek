import {
  Navigate,
  useLocation
} from "react-router-dom";

import {
  getCurrentUser,
  isAuthenticated
} from "../utils/authStorage";

function JobSeekerRoute({
  children
}) {
  const location =
    useLocation();

  const currentUser =
    getCurrentUser();

  const authenticated =
    isAuthenticated();

  if (!authenticated) {
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
    currentUser?.role !==
    "jobSeeker"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

export default JobSeekerRoute;