import {
  useState
} from "react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  loginUser
} from "../utils/authStorage";

import "./Login.css";

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    email,
    setEmail
  ] = useState("");

  const [
    password,
    setPassword
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    loading,
    setLoading
  ] = useState(false);

  const redirectPath =
    location.state?.from?.pathname ||
    "/";

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address."
      );

      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }

    if (
      !trimmedEmail.includes("@")
    ) {
      setError(
        "Please enter a valid email address."
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

    const matchedUser =
      users.find(
        (user) =>
          user.email
            ?.trim()
            .toLowerCase() ===
            trimmedEmail &&
          user.password ===
            password
      );

    if (!matchedUser) {
      setLoading(false);

      setError(
        "Invalid email or password."
      );

      return;
    }

    const currentUser = {
      ...matchedUser,

      email:
        matchedUser.email
          .trim()
          .toLowerCase()
    };

    const loginSuccessful =
      loginUser(
        currentUser
      );

    if (!loginSuccessful) {
      setLoading(false);

      setError(
        "Unable to complete login. Please try again."
      );

      return;
    }

    setLoading(false);

    if (
      currentUser.role ===
      "recruiter"
    ) {
      navigate(
        "/recruiter",
        {
          replace: true
        }
      );

      return;
    }

    navigate(
      redirectPath,
      {
        replace: true
      }
    );
  }

  return (
    <main className="login-page">

      <div className="login-card">

        <div className="login-header">

          <div className="login-logo">
            <span>
              ✓
            </span>

            JobSeek
          </div>

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to continue your
            JobSeek journey.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={
            handleSubmit
          }
        >

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-field">

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

          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <div className="login-footer">

          <p>
            Don't have an account?
          </p>

          <Link to="/register">
            Create an account
          </Link>

        </div>

      </div>

    </main>
  );
}

export default Login;