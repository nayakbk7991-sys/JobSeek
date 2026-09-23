import {
  useEffect,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  getResume,
  saveResume,
  deleteResume
} from "../utils/resumeStorage";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import LoadingSpinner from "../components/LoadingSpinner";

import "./Profile.css";

function Profile() {
  const [
    currentUser,
    setCurrentUser
  ] = useState(null);

  const [
    name,
    setName
  ] = useState("");

  const [
    email,
    setEmail
  ] = useState("");

  const [
    phone,
    setPhone
  ] = useState("");

  const [
    location,
    setLocation
  ] = useState("");

  const [
    bio,
    setBio
  ] = useState("");

  const [
    skills,
    setSkills
  ] = useState("");

  const [
    profileImage,
    setProfileImage
  ] = useState("");

  const [
    resumeId,
    setResumeId
  ] = useState("");

  const [
    resumeName,
    setResumeName
  ] = useState("");

  const [
    resumeFile,
    setResumeFile
  ] = useState(null);

  const [
    resumeLoading,
    setResumeLoading
  ] = useState(false);

  const [
    pageLoading,
    setPageLoading
  ] = useState(true);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    imageMessage,
    setImageMessage
  ] = useState("");

  const [
    resumeMessage,
    setResumeMessage
  ] = useState("");

  const [
    profileMessage,
    setProfileMessage
  ] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setPageLoading(true);

      const user =
        getCurrentUser();

      if (!user) {
        return;
      }

      setCurrentUser(user);

      setName(
        user.name || ""
      );

      setEmail(
        user.email || ""
      );

      setPhone(
        user.phone || ""
      );

      setLocation(
        user.location || ""
      );

      setBio(
        user.bio || ""
      );

      setSkills(
        user.skills || ""
      );

      setProfileImage(
        user.profileImage || ""
      );

      setResumeId(
        user.resumeId || ""
      );

      setResumeName(
        user.resumeName || ""
      );

      if (user.resumeId) {
        await loadResume(
          user.resumeId,
          user.resumeName
        );
      }
    } catch (error) {
      logError(
        "Unable to load profile.",
        error
      );

      setProfileMessage(
        getErrorMessage(
          error,
          "Unable to load profile."
        )
      );
    } finally {
      setPageLoading(false);
    }
  }

  async function loadResume(
    storedResumeId,
    storedResumeName
  ) {
    try {
      setResumeLoading(true);

      const file =
        await getResume(
          storedResumeId
        );

      if (file) {
        setResumeId(
          storedResumeId
        );

        setResumeName(
          storedResumeName ||
          file.name ||
          "Resume"
        );
      }
    } catch (error) {
      logError(
        "Unable to load resume.",
        error
      );

      setResumeMessage(
        getErrorMessage(
          error,
          "Unable to load resume."
        )
      );
    } finally {
      setResumeLoading(false);
    }
  }

  function handleProfileImageChange(
    event
  ) {
    setImageMessage("");

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      event.target.value = "";

      setImageMessage(
        "Please select a JPG, JPEG, PNG, or WEBP image."
      );

      return;
    }

    const maxSize =
      2 * 1024 * 1024;

    if (file.size > maxSize) {
      event.target.value = "";

      setImageMessage(
        "Profile image must be 2 MB or smaller."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      setProfileImage(
        reader.result
      );

      setImageMessage(
        "Profile image selected. Click Save Changes to keep it."
      );
    };

    reader.onerror = () => {
      setImageMessage(
        "Unable to read the selected image."
      );
    };

    reader.readAsDataURL(file);
  }

  function handleRemoveProfileImage() {
    setProfileImage("");

    const input =
      document.getElementById(
        "profile-image"
      );

    if (input) {
      input.value = "";
    }

    setImageMessage(
      "Profile image removed. Click Save Changes to confirm."
    );
  }

  async function handleResumeUpload() {
    if (!resumeFile) {
      setResumeMessage(
        "Please choose a resume file first."
      );

      return;
    }

    try {
      setResumeLoading(true);
      setResumeMessage("");

      const newResumeId =
        await saveResume(
          resumeFile
        );

      if (!newResumeId) {
        throw new Error(
          "Unable to save resume."
        );
      }

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

      const updatedUsers =
        users.map(
          (user) => {
            if (
              user.email ===
              currentUser?.email
            ) {
              return {
                ...user,
                resumeId:
                  newResumeId,
                resumeName:
                  resumeFile.name
              };
            }

            return user;
          }
        );

      localStorage.setItem(
        "jobseekUsers",
        JSON.stringify(
          updatedUsers
        )
      );

      const updatedCurrentUser = {
        ...currentUser,
        resumeId:
          newResumeId,
        resumeName:
          resumeFile.name
      };

      localStorage.setItem(
        "jobseekCurrentUser",
        JSON.stringify(
          updatedCurrentUser
        )
      );

      setCurrentUser(
        updatedCurrentUser
      );

      setResumeId(
        newResumeId
      );

      setResumeName(
        resumeFile.name
      );

      setResumeFile(null);

      const input =
        document.getElementById(
          "profile-resume"
        );

      if (input) {
        input.value = "";
      }

      setResumeMessage(
        "Resume uploaded successfully."
      );
    } catch (error) {
      logError(
        "Unable to upload resume.",
        error
      );

      setResumeMessage(
        getErrorMessage(
          error,
          "Unable to upload resume."
        )
      );
    } finally {
      setResumeLoading(false);
    }
  }

  function handleResumeChange(
    event
  ) {
    setResumeMessage("");

    const file =
      event.target.files?.[0];

    if (!file) {
      setResumeFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const fileName =
      file.name.toLowerCase();

    const hasValidExtension =
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx");

    if (
      !allowedTypes.includes(
        file.type
      ) &&
      !hasValidExtension
    ) {
      setResumeFile(null);

      event.target.value = "";

      setResumeMessage(
        "Please select a PDF, DOC, or DOCX file."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setResumeFile(null);

      event.target.value = "";

      setResumeMessage(
        "Resume must be 5 MB or smaller."
      );

      return;
    }

    setResumeFile(file);

    setResumeMessage(
      `Selected: ${file.name}`
    );
  }

  async function handleViewResume() {
    try {
      if (!resumeId) {
        setResumeMessage(
          "No resume is available."
        );

        return;
      }

      const file =
        await getResume(
          resumeId
        );

      if (!file) {
        setResumeMessage(
          "Resume could not be found."
        );

        return;
      }

      const fileUrl =
        URL.createObjectURL(
          file
        );

      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          fileUrl
        );
      }, 60000);
    } catch (error) {
      logError(
        "Unable to view resume.",
        error
      );

      setResumeMessage(
        getErrorMessage(
          error,
          "Unable to view resume."
        )
      );
    }
  }

  async function handleDownloadResume() {
    try {
      if (!resumeId) {
        setResumeMessage(
          "No resume is available."
        );

        return;
      }

      const file =
        await getResume(
          resumeId
        );

      if (!file) {
        setResumeMessage(
          "Resume could not be found."
        );

        return;
      }

      const fileUrl =
        URL.createObjectURL(
          file
        );

      const link =
        document.createElement(
          "a"
        );

      link.href =
        fileUrl;

      link.download =
        resumeName ||
        file.name ||
        "resume";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          fileUrl
        );
      }, 60000);
    } catch (error) {
      logError(
        "Unable to download resume.",
        error
      );

      setResumeMessage(
        getErrorMessage(
          error,
          "Unable to download resume."
        )
      );
    }
  }

  async function handleDeleteResume() {
    if (!resumeId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete your resume?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setResumeLoading(true);
      setResumeMessage("");

      await deleteResume(
        resumeId
      );

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

      const updatedUsers =
        users.map(
          (user) => {
            if (
              user.email ===
              currentUser?.email
            ) {
              const updatedUser = {
                ...user
              };

              delete updatedUser.resumeId;
              delete updatedUser.resumeName;

              return updatedUser;
            }

            return user;
          }
        );

      localStorage.setItem(
        "jobseekUsers",
        JSON.stringify(
          updatedUsers
        )
      );

      const updatedCurrentUser = {
        ...currentUser
      };

      delete updatedCurrentUser.resumeId;
      delete updatedCurrentUser.resumeName;

      localStorage.setItem(
        "jobseekCurrentUser",
        JSON.stringify(
          updatedCurrentUser
        )
      );

      setCurrentUser(
        updatedCurrentUser
      );

      setResumeId("");
      setResumeName("");
      setResumeFile(null);

      setResumeMessage(
        "Resume deleted successfully."
      );
    } catch (error) {
      logError(
        "Unable to delete resume.",
        error
      );

      setResumeMessage(
        getErrorMessage(
          error,
          "Unable to delete resume."
        )
      );
    } finally {
      setResumeLoading(false);
    }
  }

  async function handleProfileSave(
    event
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setProfileMessage("");

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

      const updatedUsers =
        users.map(
          (user) => {
            if (
              user.email ===
              currentUser?.email
            ) {
              return {
                ...user,
                name:
                  name.trim(),
                phone:
                  phone.trim(),
                location:
                  location.trim(),
                bio:
                  bio.trim(),
                skills:
                  skills.trim(),
                profileImage,
                resumeId,
                resumeName
              };
            }

            return user;
          }
        );

      localStorage.setItem(
        "jobseekUsers",
        JSON.stringify(
          updatedUsers
        )
      );

      const updatedCurrentUser = {
        ...currentUser,
        name:
          name.trim(),
        phone:
          phone.trim(),
        location:
          location.trim(),
        bio:
          bio.trim(),
        skills:
          skills.trim(),
        profileImage,
        resumeId,
        resumeName
      };

      localStorage.setItem(
        "jobseekCurrentUser",
        JSON.stringify(
          updatedCurrentUser
        )
      );

      window.dispatchEvent(
        new Event("jobseekProfileUpdated")
      );

      setCurrentUser(
        updatedCurrentUser
      );

      setProfileMessage(
        "Profile updated successfully."
      );

      setImageMessage("");
    } catch (error) {
      logError(
        "Unable to save profile.",
        error
      );

      setProfileMessage(
        getErrorMessage(
          error,
          "Unable to save profile."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (!currentUser) {
      return;
    }

    setName(
      currentUser.name || ""
    );

    setEmail(
      currentUser.email || ""
    );

    setPhone(
      currentUser.phone || ""
    );

    setLocation(
      currentUser.location || ""
    );

    setBio(
      currentUser.bio || ""
    );

    setSkills(
      currentUser.skills || ""
    );

    setProfileImage(
      currentUser.profileImage || ""
    );

    setResumeId(
      currentUser.resumeId || ""
    );

    setResumeName(
      currentUser.resumeName || ""
    );

    setResumeFile(null);

    setImageMessage("");
    setProfileMessage("");
    setResumeMessage("");

    const imageInput =
      document.getElementById(
        "profile-image"
      );

    if (imageInput) {
      imageInput.value = "";
    }

    const resumeInput =
      document.getElementById(
        "profile-resume"
      );

    if (resumeInput) {
      resumeInput.value = "";
    }
  }

  if (pageLoading) {
    return (
      <LoadingSpinner
        message="Loading profile..."
      />
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">
              My Profile
            </p>

            <h1>
              Profile
            </h1>

            <p>
              Manage your personal
              information and resume.
            </p>
          </div>
        </div>

        <div className="profile-layout">

          <aside className="profile-sidebar">

            <div className="profile-avatar">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                />
              ) : (
                name
                  ? name
                      .charAt(0)
                      .toUpperCase()
                  : "U"
              )}
            </div>

            <h2>
              {name || "Job Seeker"}
            </h2>

            <p>
              {email}
            </p>

            <nav className="profile-navigation">

              <Link
                to="/profile"
                className="profile-navigation-link active"
              >
                Profile
              </Link>

              <Link
                to="/applications"
                className="profile-navigation-link"
              >
                My Applications
              </Link>

              <Link
                to="/saved-jobs"
                className="profile-navigation-link"
              >
                Saved Jobs
              </Link>

            </nav>

          </aside>

          <section className="profile-content">

            <form
              className="profile-form"
              onSubmit={
                handleProfileSave
              }
            >

              <div className="profile-section">

                <div className="profile-section-header">

                  <h2>
                    Profile Image
                  </h2>

                  <p>
                    Upload a professional
                    profile image up to 2 MB.
                  </p>

                </div>

                <div className="profile-image-section">

                  <div className="profile-image-preview">

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile preview"
                      />
                    ) : (
                      <span>
                        {name
                          ? name
                              .charAt(0)
                              .toUpperCase()
                          : "U"}
                      </span>
                    )}

                  </div>

                  <div className="profile-image-controls">

                    <label
                      htmlFor="profile-image"
                      className="profile-file-label"
                    >
                      Choose Image
                    </label>

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleProfileImageChange
                      }
                    />

                    {profileImage && (
                      <button
                        type="button"
                        className="profile-danger-button"
                        onClick={
                          handleRemoveProfileImage
                        }
                      >
                        Remove Image
                      </button>
                    )}

                    <p className="profile-image-help">
                      JPG, JPEG, PNG, or WEBP.
                      Maximum size 2 MB.
                    </p>

                    {imageMessage && (
                      <p className="profile-image-message">
                        {imageMessage}
                      </p>
                    )}

                  </div>

                </div>

              </div>

              <div className="profile-section">

                <div className="profile-section-header">

                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Keep your profile
                    information up to date.
                  </p>

                </div>

                <div className="profile-form-grid">

                  <div className="profile-field">

                    <label htmlFor="profile-name">
                      Full Name
                    </label>

                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value
                        )
                      }
                      placeholder="Enter your full name"
                    />

                  </div>

                  <div className="profile-field">

                    <label htmlFor="profile-email">
                      Email Address
                    </label>

                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      disabled
                    />

                  </div>

                  <div className="profile-field">

                    <label htmlFor="profile-phone">
                      Phone Number
                    </label>

                    <input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      placeholder="Enter your phone number"
                    />

                  </div>

                  <div className="profile-field">

                    <label htmlFor="profile-location">
                      Location
                    </label>

                    <input
                      id="profile-location"
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(
                          event.target.value
                        )
                      }
                      placeholder="Enter your location"
                    />

                  </div>

                </div>

              </div>

              <div className="profile-section">

                <div className="profile-section-header">

                  <h2>
                    Professional Information
                  </h2>

                  <p>
                    Add information that
                    helps recruiters understand
                    your profile.
                  </p>

                </div>

                <div className="profile-field">

                  <label htmlFor="profile-skills">
                    Skills
                  </label>

                  <input
                    id="profile-skills"
                    type="text"
                    value={skills}
                    onChange={(event) =>
                      setSkills(
                        event.target.value
                      )
                    }
                    placeholder="React, JavaScript, HTML, CSS"
                  />

                </div>

                <div className="profile-field">

                  <label htmlFor="profile-bio">
                    About You
                  </label>

                  <textarea
                    id="profile-bio"
                    rows="6"
                    value={bio}
                    onChange={(event) =>
                      setBio(
                        event.target.value
                      )
                    }
                    placeholder="Tell recruiters about yourself"
                  />

                </div>

              </div>

              <div className="profile-section">

                <div className="profile-section-header">

                  <h2>
                    Resume
                  </h2>

                  <p>
                    Upload a PDF, DOC, or DOCX
                    resume up to 5 MB.
                  </p>

                </div>

                {resumeLoading ? (
                  <LoadingSpinner
                    message="Processing resume..."
                  />
                ) : (
                  <>

                    {resumeName && (
                      <div className="profile-current-resume">

                        <div>

                          <strong>
                            Current Resume
                          </strong>

                          <p>
                            {resumeName}
                          </p>

                        </div>

                        <div className="profile-resume-actions">

                          <button
                            type="button"
                            className="profile-secondary-button"
                            onClick={
                              handleViewResume
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="profile-secondary-button"
                            onClick={
                              handleDownloadResume
                            }
                          >
                            Download
                          </button>

                          <button
                            type="button"
                            className="profile-danger-button"
                            onClick={
                              handleDeleteResume
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    )}

                    <div className="profile-resume-upload">

                      <label
                        htmlFor="profile-resume"
                        className="profile-file-label"
                      >
                        Choose File
                      </label>

                      <input
                        id="profile-resume"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={
                          handleResumeChange
                        }
                      />

                      {resumeFile && (
                        <p className="profile-selected-file">
                          Selected:{" "}
                          {resumeFile.name}
                        </p>
                      )}

                      <button
                        type="button"
                        className="profile-primary-button"
                        onClick={
                          handleResumeUpload
                        }
                      >
                        Upload Resume
                      </button>

                    </div>

                  </>
                )}

                {resumeMessage && (
                  <div className="profile-resume-message">
                    {resumeMessage}
                  </div>
                )}

              </div>

              {profileMessage && (
                <div className="profile-message">
                  {profileMessage}
                </div>
              )}

              <div className="profile-form-actions">

                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={
                    handleCancel
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>
    </main>
  );
}

export default Profile;