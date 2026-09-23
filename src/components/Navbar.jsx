import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  isJobSeeker,
  isRecruiter,
  logoutUser
} from "../utils/authStorage";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(
    getCurrentUser()
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function updateUser() {
      setCurrentUser(getCurrentUser());
    }

    window.addEventListener(
      "jobseekProfileUpdated",
      updateUser
    );

    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "jobseekProfileUpdated",
        updateUser
      );

      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
    setIsMenuOpen(false);
    navigate("/login");
  }

  function closeMobileMenu() {
    setIsMenuOpen(false);
  }

  const jobSeeker = isJobSeeker();
  const recruiter = isRecruiter();

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    (recruiter ? "Recruiter" : "JobSeeker");

  const userInitial =
    userName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() ||
    (recruiter ? "R" : "J");

  const profilePath = recruiter
    ? "/recruiter/profile"
    : "/profile";

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMobileMenu}
        >
          JobSeek
        </Link>

        <div className="navbar-links">

          <NavLink
            to="/"
            end
          >
            Home
          </NavLink>

          <NavLink to="/jobs">
            Jobs
          </NavLink>

          {jobSeeker && (
            <>
              <NavLink to="/applications">
                My Applications
              </NavLink>

              <NavLink to="/saved-jobs">
                Saved Jobs
              </NavLink>
            </>
          )}

          {recruiter && (
            <NavLink to="/recruiter">
              Dashboard
            </NavLink>
          )}

        </div>

        <div className="navbar-spacer"></div>

        <div className="navbar-user-area">

          <Link
            to={profilePath}
            className="navbar-user"
            onClick={closeMobileMenu}
          >
            <div className="navbar-user-avatar">
              {currentUser?.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt={`${userName} profile`}
                />
              ) : (
                <span>
                  {userInitial}
                </span>
              )}
            </div>

            <span className="navbar-user-name">
              {userName}
            </span>
          </Link>

          <button
            type="button"
            className="navbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

        <button
          type="button"
          className="navbar-menu-button"
          onClick={() =>
            setIsMenuOpen((previous) => !previous)
          }
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>

      </div>

      {isMenuOpen && (
        <div className="navbar-mobile-menu">

          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/jobs"
            onClick={closeMobileMenu}
          >
            Jobs
          </NavLink>

          {jobSeeker && (
            <>
              <NavLink
                to="/applications"
                onClick={closeMobileMenu}
              >
                My Applications
              </NavLink>

              <NavLink
                to="/saved-jobs"
                onClick={closeMobileMenu}
              >
                Saved Jobs
              </NavLink>
            </>
          )}

          {recruiter && (
            <NavLink
              to="/recruiter"
              onClick={closeMobileMenu}
            >
              Dashboard
            </NavLink>
          )}

          <NavLink
            to={profilePath}
            onClick={closeMobileMenu}
          >
            Profile
          </NavLink>

        </div>
      )}
    </nav>
  );
}

export default Navbar;