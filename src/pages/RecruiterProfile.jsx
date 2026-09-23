import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import "./RecruiterProfile.css";

function RecruiterProfile() {
  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const [
    name,
    setName
  ] = useState(
    currentUser?.name || ""
  );

  const [
    email
  ] = useState(
    currentUser?.email || ""
  );

  const [
    phone,
    setPhone
  ] = useState(
    currentUser?.phone || ""
  );

  const [
    companyName,
    setCompanyName
  ] = useState(
    currentUser?.companyName || ""
  );

  const [
    companyLocation,
    setCompanyLocation
  ] = useState(
    currentUser?.companyLocation || ""
  );

  const [
    website,
    setWebsite
  ] = useState(
    currentUser?.website || ""
  );

  const [
    industry,
    setIndustry
  ] = useState(
    currentUser?.industry || ""
  );

  const [
    companySize,
    setCompanySize
  ] = useState(
    currentUser?.companySize || ""
  );

  const [
    companyDescription,
    setCompanyDescription
  ] = useState(
    currentUser?.companyDescription || ""
  );

  const [
    success,
    setSuccess
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    isSaving,
    setIsSaving
  ] = useState(false);

  function handleSave(
    event
  ) {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!name.trim()) {
      setError(
        "Recruiter name is required."
      );

      return;
    }

    if (!companyName.trim()) {
      setError(
        "Company name is required."
      );

      return;
    }

    if (
      currentUser?.role !==
      "recruiter"
    ) {
      setError(
        "Only recruiters can update this profile."
      );

      return;
    }

    try {
      setIsSaving(true);

      const updatedUser = {
        ...currentUser,

        name:
          name.trim(),

        phone:
          phone.trim(),

        companyName:
          companyName.trim(),

        companyLocation:
          companyLocation.trim(),

        website:
          website.trim(),

        industry:
          industry.trim(),

        companySize:
          companySize.trim(),

        companyDescription:
          companyDescription.trim()
      };

      const storedUsers =
        localStorage.getItem(
          "jobseekUsers"
        );

      const users =
        storedUsers
          ? JSON.parse(
              storedUsers
            )
          : [];

      if (!Array.isArray(users)) {
        throw new Error(
          "User data is invalid."
        );
      }

      const updatedUsers =
        users.map(
          (user) =>
            String(user.id) ===
            String(currentUser.id)
              ? updatedUser
              : user
        );

      localStorage.setItem(
        "jobseekUsers",
        JSON.stringify(
          updatedUsers
        )
      );

      localStorage.setItem(
        "jobseekCurrentUser",
        JSON.stringify(
          updatedUser
        )
      );

      setSuccess(
        "Recruiter profile updated successfully."
      );
    } catch (
      saveError
    ) {
      logError(
        "Updating recruiter profile",
        saveError
      );

      setError(
        getErrorMessage(
          saveError,
          "Something went wrong while updating your profile."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    navigate(
      "/recruiter"
    );
  }

  if (
    currentUser?.role !==
    "recruiter"
  ) {
    return (
      <main className="recruiter-profile-page">

        <div className="recruiter-profile-access">

          <div className="recruiter-profile-access-icon">
            !
          </div>

          <h1>
            Recruiter Access Required
          </h1>

          <p>
            Only recruiters can access
            this profile.
          </p>

          <Link
            to="/"
            className="recruiter-profile-back-link"
          >
            Go to Home
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="recruiter-profile-page">

      <div className="recruiter-profile-container">

        <aside className="recruiter-profile-sidebar">

          <div className="recruiter-profile-avatar">
            {name
              ? name
                  .charAt(0)
                  .toUpperCase()
              : "R"}
          </div>

          <h2>
            {name || "Recruiter"}
          </h2>

          <p>
            {email}
          </p>

          <span className="recruiter-profile-role">
            Recruiter
          </span>

          <nav className="recruiter-profile-navigation">

            <a href="#personal">
              Personal Information
            </a>

            <a href="#company">
              Company Information
            </a>

            <a href="#about">
              About Company
            </a>

          </nav>

        </aside>

        <main className="recruiter-profile-content">

          <div className="recruiter-profile-header">

            <div>

              <span className="recruiter-profile-section-label">
                RECRUITER
              </span>

              <h1>
                Recruiter Profile
              </h1>

              <p>
                Manage your recruiter and
                company information.
              </p>

            </div>

            <Link
              to="/recruiter"
              className="recruiter-profile-back-link"
            >
              ← Back to Dashboard
            </Link>

          </div>

          {success && (
            <div className="recruiter-profile-success">
              {success}
            </div>
          )}

          {error && (
            <div className="recruiter-profile-error">
              {error}
            </div>
          )}

          <form
            className="recruiter-profile-form"
            onSubmit={handleSave}
          >

            <section
              className="recruiter-profile-section"
              id="personal"
            >

              <div className="recruiter-profile-section-heading">

                <span className="recruiter-profile-section-number">
                  01
                </span>

                <div>

                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Update your recruiter
                    contact information.
                  </p>

                </div>

              </div>

              <div className="recruiter-profile-grid">

                <div className="recruiter-profile-field">

                  <label htmlFor="recruiter-name">
                    Recruiter Name
                  </label>

                  <input
                    id="recruiter-name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your name"
                  />

                </div>

                <div className="recruiter-profile-field">

                  <label htmlFor="recruiter-email">
                    Email Address
                  </label>

                  <input
                    id="recruiter-email"
                    type="email"
                    value={email}
                    readOnly
                  />

                  <small>
                    Email cannot be changed here.
                  </small>

                </div>

                <div className="recruiter-profile-field">

                  <label htmlFor="recruiter-phone">
                    Phone Number
                  </label>

                  <input
                    id="recruiter-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                  />

                </div>

              </div>

            </section>

            <section
              className="recruiter-profile-section"
              id="company"
            >

              <div className="recruiter-profile-section-heading">

                <span className="recruiter-profile-section-number">
                  02
                </span>

                <div>

                  <h2>
                    Company Information
                  </h2>

                  <p>
                    Provide information about
                    the company you represent.
                  </p>

                </div>

              </div>

              <div className="recruiter-profile-grid">

                <div className="recruiter-profile-field">

                  <label htmlFor="company-name">
                    Company Name
                  </label>

                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(
                        event.target.value
                      )
                    }
                    placeholder="Enter company name"
                  />

                </div>

                <div className="recruiter-profile-field">

                  <label htmlFor="company-location">
                    Company Location
                  </label>

                  <input
                    id="company-location"
                    type="text"
                    value={companyLocation}
                    onChange={(event) =>
                      setCompanyLocation(
                        event.target.value
                      )
                    }
                    placeholder="City, State"
                  />

                </div>

                <div className="recruiter-profile-field">

                  <label htmlFor="industry">
                    Industry
                  </label>

                  <input
                    id="industry"
                    type="text"
                    value={industry}
                    onChange={(event) =>
                      setIndustry(
                        event.target.value
                      )
                    }
                    placeholder="Information Technology"
                  />

                </div>

                <div className="recruiter-profile-field">

                  <label htmlFor="company-size">
                    Company Size
                  </label>

                  <select
                    id="company-size"
                    value={companySize}
                    onChange={(event) =>
                      setCompanySize(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select company size
                    </option>

                    <option value="1-10 employees">
                      1-10 employees
                    </option>

                    <option value="11-50 employees">
                      11-50 employees
                    </option>

                    <option value="51-200 employees">
                      51-200 employees
                    </option>

                    <option value="201-500 employees">
                      201-500 employees
                    </option>

                    <option value="501-1000 employees">
                      501-1000 employees
                    </option>

                    <option value="1000+ employees">
                      1000+ employees
                    </option>

                  </select>

                </div>

                <div className="recruiter-profile-field recruiter-profile-full-width">

                  <label htmlFor="company-website">
                    Company Website
                  </label>

                  <input
                    id="company-website"
                    type="url"
                    value={website}
                    onChange={(event) =>
                      setWebsite(
                        event.target.value
                      )
                    }
                    placeholder="https://example.com"
                  />

                </div>

              </div>

            </section>

            <section
              className="recruiter-profile-section"
              id="about"
            >

              <div className="recruiter-profile-section-heading">

                <span className="recruiter-profile-section-number">
                  03
                </span>

                <div>

                  <h2>
                    About Company
                  </h2>

                  <p>
                    Add a short description
                    of your company.
                  </p>

                </div>

              </div>

              <div className="recruiter-profile-field">

                <label htmlFor="company-description">
                  Company Description
                </label>

                <textarea
                  id="company-description"
                  value={
                    companyDescription
                  }
                  onChange={(event) =>
                    setCompanyDescription(
                      event.target.value
                    )
                  }
                  placeholder="Tell candidates about your company..."
                  rows="7"
                />

              </div>

            </section>

            <div className="recruiter-profile-form-actions">

              <button
                type="button"
                className="recruiter-profile-cancel-button"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="recruiter-profile-save-button"
                disabled={isSaving}
              >
                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </main>

      </div>

    </main>
  );
}

export default RecruiterProfile;