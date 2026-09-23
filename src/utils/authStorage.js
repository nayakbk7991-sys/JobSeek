const CURRENT_USER_KEY =
  "jobseekCurrentUser";

const LOGGED_IN_KEY =
  "jobseekLoggedIn";

function isValidUser(
  user
) {
  return Boolean(
    user &&
    typeof user ===
      "object" &&
    typeof user.email ===
      "string" &&
    user.email.trim() &&
    typeof user.role ===
      "string" &&
    (
      user.role ===
        "jobSeeker" ||
      user.role ===
        "recruiter"
    )
  );
}

export function getCurrentUser() {
  const storedUser =
    localStorage.getItem(
      CURRENT_USER_KEY
    );

  if (!storedUser) {
    return null;
  }

  try {
    const user =
      JSON.parse(
        storedUser
      );

    if (
      !isValidUser(user)
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return (
    localStorage.getItem(
      LOGGED_IN_KEY
    ) === "true"
  );
}

export function isAuthenticated() {
  return (
    isLoggedIn() &&
    Boolean(
      getCurrentUser()
    )
  );
}

export function loginUser(
  user
) {
  if (
    !isValidUser(user)
  ) {
    return false;
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );

  localStorage.setItem(
    LOGGED_IN_KEY,
    "true"
  );

  return true;
}

export function logoutUser() {
  localStorage.removeItem(
    CURRENT_USER_KEY
  );

  localStorage.removeItem(
    LOGGED_IN_KEY
  );
}

export function getUserRole() {
  const user =
    getCurrentUser();

  return user?.role || null;
}

export function isJobSeeker() {
  return (
    isAuthenticated() &&
    getUserRole() ===
      "jobSeeker"
  );
}

export function isRecruiter() {
  return (
    isAuthenticated() &&
    getUserRole() ===
      "recruiter"
  );
}