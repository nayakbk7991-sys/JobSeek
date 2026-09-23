import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  getCurrentUser,
  isRecruiter
} from "../utils/authStorage";

import {
  getStoredJobs
} from "../utils/jobStorage";

import "./Home.css";

function Home() {
  const [
    currentUser,
    setCurrentUser
  ] = useState(
    getCurrentUser()
  );

  const [
    jobs,
    setJobs
  ] = useState(
    getStoredJobs()
  );

  const [
    keyword,
    setKeyword
  ] = useState("");

  const [
    location,
    setLocation
  ] = useState("");

  const [
    searchKeyword,
    setSearchKeyword
  ] = useState("");

  const [
    imageError,
    setImageError
  ] = useState("");

  useEffect(() => {
    function updateUser() {
      setCurrentUser(
        getCurrentUser()
      );
    }

    function updateJobs() {
      setJobs(
        getStoredJobs()
      );
    }

    window.addEventListener(
      "jobseekProfileUpdated",
      updateUser
    );

    window.addEventListener(
      "jobseekJobsUpdated",
      updateJobs
    );

    return () => {
      window.removeEventListener(
        "jobseekProfileUpdated",
        updateUser
      );

      window.removeEventListener(
        "jobseekJobsUpdated",
        updateJobs
      );
    };
  }, []);

  const userName =
    currentUser?.name ||
    "User";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();

  const userLocation =
    currentUser?.location ||
    "Add your location";

  const recruiter =
    isRecruiter();

  const skills =
    typeof currentUser?.skills === "string"
      ? currentUser.skills
          .split(",")
          .map(
            (skill) =>
              skill.trim()
          )
          .filter(Boolean)
      : Array.isArray(
          currentUser?.skills
        )
      ? currentUser.skills
      : [];

  const profileFields = [
    currentUser?.name,
    currentUser?.email,
    currentUser?.phone,
    currentUser?.location,
    currentUser?.bio,
    skills.length > 0
      ? "skills"
      : ""
  ];

  const completedProfileFields =
    profileFields.filter(
      Boolean
    ).length;

  const profileComplete =
    completedProfileFields ===
    profileFields.length;

  const profilePercentage =
    Math.round(
      (
        completedProfileFields /
        profileFields.length
      ) * 100
    );

  const filteredJobs =
    useMemo(() => {
      const keywordValue =
        searchKeyword
          .trim()
          .toLowerCase();

      const locationValue =
        location
          .trim()
          .toLowerCase();

      if (
        !keywordValue &&
        !locationValue
      ) {
        return jobs.slice(
          0,
          6
        );
      }

      return jobs
        .filter(
          (job) => {
            const searchableText = [
              job.title,
              job.company,
              job.location,
              ...(Array.isArray(
                job.skills
              )
                ? job.skills
                : [])
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            const matchesKeyword =
              !keywordValue ||
              searchableText.includes(
                keywordValue
              );

            const matchesLocation =
              !locationValue ||
              String(
                job.location || ""
              )
                .toLowerCase()
                .includes(
                  locationValue
                );

            return (
              matchesKeyword &&
              matchesLocation
            );
          }
        )
        .slice(
          0,
          6
        );
    }, [
      jobs,
      searchKeyword,
      location
    ]);

  function handleSearch(event) {
    event.preventDefault();

    setSearchKeyword(
      keyword
    );
  }

  function handleClearSearch() {
    setKeyword("");
    setLocation("");
    setSearchKeyword("");
  }

  function handleProfileImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setImageError(
        "Please select a valid image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setImageError(
        "Image must be smaller than 2 MB."
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const imageData =
        reader.result;

      const user =
        getCurrentUser();

      if (!user) {
        return;
      }

      const updatedUser = {
        ...user,
        profileImage:
          imageData
      };

      localStorage.setItem(
        "jobseekCurrentUser",
        JSON.stringify(
          updatedUser
        )
      );

      setCurrentUser(
        updatedUser
      );

      window.dispatchEvent(
        new Event(
          "jobseekProfileUpdated"
        )
      );
    };

    reader.onerror = () => {
      setImageError(
        "Unable to read the image."
      );
    };

    reader.readAsDataURL(
      file
    );

    event.target.value = "";
  }

  function handleRemoveProfileImage() {
    const user =
      getCurrentUser();

    if (!user) {
      return;
    }

    const updatedUser = {
      ...user
    };

    delete updatedUser.profileImage;

    localStorage.setItem(
      "jobseekCurrentUser",
      JSON.stringify(
        updatedUser
      )
    );

    setCurrentUser(
      updatedUser
    );

    window.dispatchEvent(
      new Event(
        "jobseekProfileUpdated"
      )
    );

    setImageError("");
  }

  const categories = [
    {
      title: "Frontend Development",
      count: "120+ Jobs",
      icon: "💻"
    },
    {
      title: "Backend Development",
      count: "90+ Jobs",
      icon: "⚙️"
    },
    {
      title: "Full Stack Development",
      count: "150+ Jobs",
      icon: "🧩"
    },
    {
      title: "UI/UX Design",
      count: "70+ Jobs",
      icon: "🎨"
    },
    {
      title: "Data & Analytics",
      count: "80+ Jobs",
      icon: "📊"
    },
    {
      title: "Mobile Development",
      count: "60+ Jobs",
      icon: "📱"
    }
  ];

  return (
    <main className="home-page">

      <section className="hero-section">

        <div className="hero-container">

          <div className="hero-layout">

            <aside className="home-left-column">

              <div className="home-card profile-card">

                <div className="profile-cover">
                </div>

                <div className="profile-body">

                  <div className="profile-avatar-wrapper">

                    <div className="profile-avatar">

                      {currentUser?.profileImage ? (
                        <img
                          src={
                            currentUser.profileImage
                          }
                          alt={`${userName} profile`}
                        />
                      ) : (
                        <span>
                          {userInitial}
                        </span>
                      )}

                    </div>

                    <label
                      htmlFor="home-profile-image"
                      className="profile-image-edit-button"
                      title="Change profile picture"
                    >
                      ✎
                    </label>

                    <input
                      id="home-profile-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleProfileImageChange
                      }
                      hidden
                    />

                  </div>

                  <h2>
                    {userName}
                  </h2>

                  <p className="profile-role">
                    {recruiter
                      ? "Recruiter"
                      : "Job Seeker"}
                  </p>

                  <p className="profile-location">
                    📍{" "}
                    {userLocation}
                  </p>

                  {currentUser?.email && (
                    <p className="profile-email">
                      {currentUser.email}
                    </p>
                  )}

                  {imageError && (
                    <p className="profile-image-error">
                      {imageError}
                    </p>
                  )}

                  {currentUser?.profileImage && (
                    <button
                      type="button"
                      className="profile-remove-image"
                      onClick={
                        handleRemoveProfileImage
                      }
                    >
                      Remove photo
                    </button>
                  )}

                </div>

                {!recruiter && (
                  <div className="profile-links">

                    <Link to="/profile">

                      <span>
                        Profile
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>

                    <Link to="/applications">

                      <span>
                        My Applications
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>

                    <Link to="/saved-jobs">

                      <span>
                        Saved Jobs
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>

                  </div>
                )}

                {recruiter && (
                  <div className="profile-links">

                    <Link to="/recruiter/profile">

                      <span>
                        Profile
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>

                    <Link to="/recruiter">

                      <span>
                        Dashboard
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>

                    <Link to="/post-job">

                      <span>
                        Post a Job
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>

                  </div>
                )}

              </div>

            </aside>

            <div className="hero-main-content">

              <div className="hero-content">

                <span className="hero-eyebrow">

                  {recruiter
                    ? "FIND GREAT TALENT"
                    : "FIND YOUR NEXT OPPORTUNITY"}

                </span>

                <h1>

                  {recruiter ? (
                    <>
                      Find the right

                      <span>
                        talent
                      </span>
                    </>
                  ) : (
                    <>
                      Find your

                      <span>
                        dream job
                      </span>
                    </>
                  )}

                </h1>

                <p>

                  {recruiter
                    ? "Connect with skilled professionals and build your ideal team."
                    : "Discover opportunities that match your skills, experience, and career goals."}

                </p>

                <form
                  className="hero-search"
                  onSubmit={
                    handleSearch
                  }
                >

                  <div className="search-field">

                    <span className="search-icon">
                      🔍
                    </span>

                    <input
                      type="text"
                      value={
                        keyword
                      }
                      onChange={
                        (event) =>
                          setKeyword(
                            event.target.value
                          )
                      }
                      placeholder="Job title, skills or company"
                    />

                  </div>

                  <div className="search-field">

                    <span className="search-icon">
                      📍
                    </span>

                    <input
                      type="text"
                      value={
                        location
                      }
                      onChange={
                        (event) =>
                          setLocation(
                            event.target.value
                          )
                      }
                      placeholder="Location"
                    />

                  </div>

                  <button
                    type="submit"
                    className="hero-search-button"
                  >
                    Search Jobs
                  </button>

                </form>

                {(searchKeyword ||
                  location) && (
                  <div className="search-result-info">

                    <span>

                      Showing results for

                      {searchKeyword &&
                        ` "${searchKeyword}"`}

                      {location &&
                        ` in ${location}`}

                    </span>

                    <button
                      type="button"
                      onClick={
                        handleClearSearch
                      }
                    >
                      Clear
                    </button>

                  </div>
                )}

                <div className="hero-stats">

                  <div>

                    <strong>
                      10K+
                    </strong>

                    <span>
                      Active Jobs
                    </span>

                  </div>

                  <div>

                    <strong>
                      5K+
                    </strong>

                    <span>
                      Companies
                    </span>

                  </div>

                  <div>

                    <strong>
                      20K+
                    </strong>

                    <span>
                      Job Seekers
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <aside className="hero-right-column">

              <div className="hero-sidebar-card">

                <span className="home-eyebrow">
                  PROFILE
                </span>

                <h3>
                  Complete your profile
                </h3>

                <div className="profile-progress">

                  <div className="progress-info">

                    <span>
                      Profile completion
                    </span>

                    <strong>
                      {profileComplete
                        ? "100%"
                        : "Incomplete"}
                    </strong>

                  </div>

                  <div className="progress-track">

                    <span
                      className={
                        profileComplete
                          ? "progress-fill complete"
                          : "progress-fill"
                      }
                      style={{
                        width: `${profilePercentage}%`
                      }}
                    >
                    </span>

                  </div>

                </div>

                <Link
                  to={
                    recruiter
                      ? "/recruiter/profile"
                      : "/profile"
                  }
                  className="sidebar-link"
                >
                  Update Profile →
                </Link>

              </div>

              <div className="hero-sidebar-card">

                <span className="home-eyebrow">
                  QUICK ACCESS
                </span>

                <div className="quick-links">

                  <Link to="/jobs">

                    <span>
                      🔍 Search Jobs
                    </span>

                    <strong>
                      →
                    </strong>

                  </Link>

                  {!recruiter && (
                    <Link to="/saved-jobs">

                      <span>
                        ♡ Saved Jobs
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>
                  )}

                  {!recruiter && (
                    <Link to="/applications">

                      <span>
                        ✓ Applications
                      </span>

                      <strong>
                        →
                      </strong>

                    </Link>
                  )}

                  <Link
                    to={
                      recruiter
                        ? "/recruiter/profile"
                        : "/profile"
                    }
                  >

                    <span>
                      ● My Profile
                    </span>

                    <strong>
                      →
                    </strong>

                  </Link>

                </div>

              </div>

              <div className="hero-sidebar-card">

                <span className="home-eyebrow">
                  YOUR SKILLS
                </span>

                {skills.length > 0 ? (
                  <div className="skill-list">

                    {skills.map(
                      (skill) => (
                        <span
                          key={
                            skill
                          }
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="sidebar-description">
                    Add your skills to your
                    profile so recruiters can
                    understand your professional
                    strengths.
                  </p>
                )}

                <Link
                  to={
                    recruiter
                      ? "/recruiter/profile"
                      : "/profile"
                  }
                  className="sidebar-link"
                >
                  Manage Skills →
                </Link>

              </div>

            </aside>

          </div>

        </div>

      </section>

      <section className="jobs-section">

        <div className="home-container">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                OPPORTUNITIES
              </span>

              <h2>
                {searchKeyword ||
                location
                  ? "Search Results"
                  : "Latest Jobs"}
              </h2>

              <p>
                {searchKeyword ||
                location
                  ? "Jobs matching your search criteria."
                  : "Explore the latest opportunities from companies hiring now."}
              </p>

            </div>

            <Link
              to="/jobs"
              className="section-link"
            >
              View All Jobs →
            </Link>

          </div>

          {filteredJobs.length > 0 ? (

            <div className="jobs-grid">

              {filteredJobs.map(
                (job) => (
                  <Link
                    key={job.id}
                    to={`/job/${job.id}`}
                    className="job-card"
                  >

                    <div className="job-card-top">

                      <div className="job-company-logo">

                        {String(
                          job.company ||
                          "C"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div className="job-card-title-area">

                        <h3>
                          {job.title}
                        </h3>

                        <p>
                          {job.company ||
                            "Company"}
                        </p>

                      </div>

                    </div>

                    <div className="job-meta">

                      {job.location && (
                        <span>
                          📍{" "}
                          {job.location}
                        </span>
                      )}

                      {job.salary && (
                        <span>
                          💰{" "}
                          {job.salary}
                        </span>
                      )}

                    </div>

                    {Array.isArray(
                      job.skills
                    ) &&
                      job.skills.length > 0 && (
                        <div className="job-skills">

                          {job.skills
                            .slice(
                              0,
                              3
                            )
                            .map(
                              (skill) => (
                                <span
                                  key={
                                    skill
                                  }
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>
                      )}

                    <div className="job-card-footer">

                      <span>
                        View Details
                      </span>

                      <strong>
                        →
                      </strong>

                    </div>

                  </Link>
                )
              )}

            </div>

          ) : (

            <div className="empty-jobs">

              <div className="empty-jobs-icon">
                🔍
              </div>

              <h3>
                No jobs found
              </h3>

              <p>
                Try changing your search
                keywords or location.
              </p>

              <button
                type="button"
                onClick={
                  handleClearSearch
                }
              >
                Clear Search
              </button>

            </div>

          )}

        </div>

      </section>

      <section className="categories-section">

        <div className="home-container">

          <div className="section-header centered">

            <div>

              <span className="section-eyebrow">
                EXPLORE
              </span>

              <h2>
                Explore Job Categories
              </h2>

              <p>
                Find opportunities across
                popular career fields.
              </p>

            </div>

          </div>

          <div className="categories-grid">

            {categories.map(
              (category) => (
                <Link
                  key={
                    category.title
                  }
                  to="/jobs"
                  className="category-card"
                >

                  <div className="category-icon">
                    {category.icon}
                  </div>

                  <div>

                    <h3>
                      {category.title}
                    </h3>

                    <p>
                      {category.count}
                    </p>

                  </div>

                  <strong>
                    →
                  </strong>

                </Link>
              )
            )}

          </div>

        </div>

      </section>

      <section className="features-section">

        <div className="home-container">

          <div className="section-header centered">

            <div>

              <span className="section-eyebrow">
                WHY JOBSEEK
              </span>

              <h2>
                Everything You Need
              </h2>

              <p>
                A simple platform designed to
                make your job search easier.
              </p>

            </div>

          </div>

          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-icon">
                🔎
              </div>

              <h3>
                Smart Job Search
              </h3>

              <p>
                Search jobs by title, skills,
                company, and location.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-icon">
                💾
              </div>

              <h3>
                Save Jobs
              </h3>

              <p>
                Keep interesting opportunities
                saved so you can apply later.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-icon">
                📋
              </div>

              <h3>
                Track Applications
              </h3>

              <p>
                Monitor your applications and
                follow their status.
              </p>

            </div>

            <div className="feature-card">

              <div className="feature-icon">
                👤
              </div>

              <h3>
                Professional Profile
              </h3>

              <p>
                Build a profile that presents
                your skills and experience.
              </p>

            </div>

          </div>

        </div>

      </section>

      <section className="steps-section">

        <div className="home-container">

          <div className="section-header centered">

            <div>

              <span className="section-eyebrow">
                HOW IT WORKS
              </span>

              <h2>
                Find Your Next Job
                in Three Steps
              </h2>

            </div>

          </div>

          <div className="steps-grid">

            <div className="step-card">

              <span className="step-number">
                01
              </span>

              <div className="step-icon">
                👤
              </div>

              <h3>
                Create Your Profile
              </h3>

              <p>
                Add your professional
                information, skills, and resume.
              </p>

            </div>

            <div className="step-card">

              <span className="step-number">
                02
              </span>

              <div className="step-icon">
                🔍
              </div>

              <h3>
                Search for Jobs
              </h3>

              <p>
                Discover jobs that match your
                skills and career goals.
              </p>

            </div>

            <div className="step-card">

              <span className="step-number">
                03
              </span>

              <div className="step-icon">
                🚀
              </div>

              <h3>
                Apply and Track
              </h3>

              <p>
                Apply to suitable positions and
                track your applications.
              </p>

            </div>

          </div>

        </div>

      </section>

      <section className="recruiter-section">

        <div className="home-container">

          <div className="recruiter-banner">

            <div>

              <span className="section-eyebrow">
                FOR EMPLOYERS
              </span>

              <h2>
                Find the people who
                move your business forward.
              </h2>

              <p>
                Post jobs, discover candidates,
                and manage applications from one
                place.
              </p>

            </div>

            <Link
              to={
                recruiter
                  ? "/post-job"
                  : "/register"
              }
              className="recruiter-button"
            >
              {recruiter
                ? "Post a Job"
                : "Get Started"}
            </Link>

          </div>

        </div>

      </section>

      <section className="final-cta-section">

        <div className="home-container">

          <div className="final-cta">

            <span className="section-eyebrow">
              YOUR NEXT STEP
            </span>

            <h2>
              Ready to find your next
              opportunity?
            </h2>

            <p>
              Explore jobs and take the next
              step in your career.
            </p>

            <Link
              to="/jobs"
              className="final-cta-button"
            >
              Explore Jobs →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;