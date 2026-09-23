import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  loginUser
} from "../utils/authStorage";

import "./Register.css";

function Register() {
  const navigate =
    useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [role, setRole] =
    useState("jobSeeker");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedName) {
      setError(
        "Please enter your name."
      );

      return;
    }

    if (
      trimmedName.length <
      2
    ) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (
      !trimmedEmail.includes(
        "@"
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    if (!password) {
      setError(
        "Please create a password."
      );

      return;
    }

    if (
      password.length <
      6
    ) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (
      role !==
        "jobSeeker" &&
      role !==
        "recruiter"
    ) {
      setError(
        "Please select a valid account type."
      );

      return;
    }

    setLoading(true);

    const storedUsers =
      localStorage.getItem(
        "jobseekUsers"
      );

    let users = [];

    try {
      users = storedUsers
        ? JSON.parse(
            storedUsers
          )
        : [];
    } catch {
      users = [];
    }

    if (!Array.isArray(users)) {
      users = [];
    }

    const existingUser =
      users.find(
        (user) =>
          user.email
            ?.trim()
            .toLowerCase() ===
          trimmedEmail
      );

    if (existingUser) {
      setLoading(false);

      setError(
        "An account with this email already exists."
      );

      return;
    }

    const newUser = {
      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`,

      name:
        trimmedName,

      email:
        trimmedEmail,

      password:
        password,

      role:
        role,

      createdAt:
        new Date().toISOString()
    };

    const updatedUsers = [
      ...users,
      newUser
    ];

    localStorage.setItem(
      "jobseekUsers",
      JSON.stringify(
        updatedUsers
      )
    );

    const loginSuccessful =
      loginUser(
        newUser
      );

    if (!loginSuccessful) {
      setLoading(false);

      setError(
        "Account was created, but login could not be completed."
      );

      return;
    }

    setLoading(false);

    if (
      role ===
      "recruiter"
    ) {
      navigate(
        "/recruiter",
        {
          replace: true
        }
      );
    } else {
      navigate(
        "/",
        {
          replace: true
        }
      );
    }
  }

  return (
    <main className="register-page">

      <div className="register-card">

        <div className="register-header">

          <div className="register-logo">
            <span>✓</span>
            JobSeek
          </div>

          <h1>
            Create Your Account
          </h1>

          <p>
            Join JobSeek and start
            your journey.
          </p>

        </div>

        <form
          className="register-form"
          onSubmit={
            handleSubmit
          }
        >

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <div className="register-field">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              autoComplete="name"
              disabled={loading}
            />

          </div>

          <div className="register-field">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              disabled={loading}
            />

          </div>

          <div className="register-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              disabled={loading}
            />

          </div>

          <div className="register-field">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              disabled={loading}
            />

          </div>

          <div className="register-field">

            <label htmlFor="role">
              Account Type
            </label>

            <select
              id="role"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value
                )
              }
              disabled={loading}
            >

              <option value="jobSeeker">
                Job Seeker
              </option>

              <option value="recruiter">
                Recruiter
              </option>

            </select>

          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="register-footer">

          <p>
            Already have an account?
          </p>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Register;