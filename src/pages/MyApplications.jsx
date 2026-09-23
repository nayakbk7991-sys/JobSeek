import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getApplications
} from "../utils/applicationStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import LoadingSpinner from "../components/LoadingSpinner";

import "./MyApplications.css";

function MyApplications() {
  const currentUser =
    getCurrentUser();

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [keyword, setKeyword] =
    useState("");

  const [status, setStatus] =
    useState("All");

  const [sortOrder, setSortOrder] =
    useState("newest");

  const [message, setMessage] =
    useState("");

  function loadApplications() {
    try {
      setLoading(true);

      const storedApplications =
        getApplications();

      const userApplications =
        storedApplications.filter(
          (application) =>
            application.userEmail ===
            currentUser?.email
        );

      setApplications(
        userApplications
      );

      setMessage("");

      setLoading(false);
    } catch (error) {
      logError(
        "Loading applications",
        error
      );

      setApplications([]);

      setMessage(
        getErrorMessage(
          error,
          "Unable to load your applications."
        )
      );

      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();

    function handleApplicationsUpdate() {
      loadApplications();
    }

    window.addEventListener(
      "jobseekApplicationsUpdated",
      handleApplicationsUpdate
    );

    return () => {
      window.removeEventListener(
        "jobseekApplicationsUpdated",
        handleApplicationsUpdate
      );
    };
  }, [
    currentUser?.email
  ]);

  const statusCounts =
    useMemo(() => {
      return {
        all:
          applications.length,

        applied:
          applications.filter(
            (application) =>
              application.status ===
              "Applied"
          ).length,

        underReview:
          applications.filter(
            (application) =>
              application.status ===
              "Under Review"
          ).length,

        shortlisted:
          applications.filter(
            (application) =>
              application.status ===
              "Shortlisted"
          ).length,

        rejected:
          applications.filter(
            (application) =>
              application.status ===
              "Rejected"
          ).length
      };
    }, [
      applications
    ]);

  const filteredApplications =
    useMemo(() => {
      const searchText =
        keyword
          .trim()
          .toLowerCase();

      const filtered =
        applications.filter(
          (application) => {
            const matchesStatus =
              status === "All" ||
              application.status ===
                status;

            if (!matchesStatus) {
              return false;
            }

            if (!searchText) {
              return true;
            }

            const searchableText = [
              application.jobTitle,
              application.company,
              application.location,
              application.salary,
              application.jobType,
              application.status
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
              searchText
            );
          }
        );

      return [
        ...filtered
      ].sort(
        (
          first,
          second
        ) => {
          const firstDate =
            new Date(
              first.appliedAt ||
                first.createdAt ||
                0
            ).getTime();

          const secondDate =
            new Date(
              second.appliedAt ||
                second.createdAt ||
                0
            ).getTime();

          if (
            sortOrder ===
            "oldest"
          ) {
            return (
              firstDate -
              secondDate
            );
          }

          return (
            secondDate -
            firstDate
          );
        }
      );
    }, [
      applications,
      keyword,
      status,
      sortOrder
    ]);

  function formatDate(
    dateValue
  ) {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date =
      new Date(
        dateValue
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function getStatusClass(
    applicationStatus
  ) {
    if (
      applicationStatus ===
      "Shortlisted"
    ) {
      return "application-status shortlisted";
    }

    if (
      applicationStatus ===
      "Under Review"
    ) {
      return "application-status review";
    }

    if (
      applicationStatus ===
      "Rejected"
    ) {
      return "application-status rejected";
    }

    return "application-status applied";
  }

  function clearFilters() {
    setKeyword("");
    setStatus("All");
    setSortOrder("newest");
  }

  function handleViewApplication() {
    setMessage("");
  }

  if (
    !currentUser ||
    currentUser.role !==
      "jobSeeker"
  ) {
    return (
      <main className="my-applications-page">

        <div className="my-applications-container">

          <div className="applications-access-message">

            <div className="applications-empty-icon">
              🔒
            </div>

            <h1>
              Access Restricted
            </h1>

            <p>
              Only job seekers can
              view their applications.
            </p>

            <Link
              to="/"
              className="applications-primary-button"
            >
              Go Home
            </Link>

          </div>

        </div>

      </main>
    );
  }

  if (loading) {
    return (
      <main className="my-applications-page">

        <LoadingSpinner
          message="Loading your applications..."
        />

      </main>
    );
  }

  return (
    <main className="my-applications-page">

      <div className="my-applications-container">

        <div className="my-applications-header">

          <div>

            <span className="applications-section-label">
              JOB SEEKER
            </span>

            <h1>
              My Applications
            </h1>

            <p>
              Track the applications
              you have submitted and
              monitor their progress.
            </p>

          </div>

          <Link
            to="/jobs"
            className="applications-primary-button"
          >
            Find More Jobs
          </Link>

        </div>

        <section className="application-stats">

          <div className="application-stat-card">

            <span className="application-stat-icon">
              📋
            </span>

            <div>

              <strong>
                {statusCounts.all}
              </strong>

              <span>
                Total Applications
              </span>

            </div>

          </div>

          <div className="application-stat-card">

            <span className="application-stat-icon">
              📤
            </span>

            <div>

              <strong>
                {statusCounts.applied}
              </strong>

              <span>
                Applied
              </span>

            </div>

          </div>

          <div className="application-stat-card">

            <span className="application-stat-icon">
              👀
            </span>

            <div>

              <strong>
                {statusCounts.underReview}
              </strong>

              <span>
                Under Review
              </span>

            </div>

          </div>

          <div className="application-stat-card">

            <span className="application-stat-icon">
              ⭐
            </span>

            <div>

              <strong>
                {statusCounts.shortlisted}
              </strong>

              <span>
                Shortlisted
              </span>

            </div>

          </div>

          <div className="application-stat-card">

            <span className="application-stat-icon">
              ✕
            </span>

            <div>

              <strong>
                {statusCounts.rejected}
              </strong>

              <span>
                Rejected
              </span>

            </div>

          </div>

        </section>

        {message && (
          <div className="applications-message">
            {message}
          </div>
        )}

        <section className="applications-filter-section">

          <div className="applications-filter-header">

            <div>

              <h2>
                Application History
              </h2>

              <p>
                {filteredApplications.length}{" "}
                {filteredApplications.length ===
                1
                  ? "application"
                  : "applications"}{" "}
                found
              </p>

            </div>

            <button
              type="button"
              className="applications-clear-button"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>

          <div className="applications-filter-grid">

            <div className="applications-search-field">

              <label htmlFor="application-search">
                Search
              </label>

              <input
                id="application-search"
                type="text"
                value={keyword}
                onChange={(event) =>
                  setKeyword(
                    event.target.value
                  )
                }
                placeholder="Search job, company or location"
              />

            </div>

            <div className="applications-filter-field">

              <label htmlFor="application-status">
                Status
              </label>

              <select
                id="application-status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
              >

                <option value="All">
                  All
                </option>

                <option value="Applied">
                  Applied
                </option>

                <option value="Under Review">
                  Under Review
                </option>

                <option value="Shortlisted">
                  Shortlisted
                </option>

                <option value="Rejected">
                  Rejected
                </option>

              </select>

            </div>

            <div className="applications-filter-field">

              <label htmlFor="application-sort">
                Sort
              </label>

              <select
                id="application-sort"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(
                    event.target.value
                  )
                }
              >

                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

              </select>

            </div>

          </div>

        </section>

        {filteredApplications.length >
        0 ? (
          <section className="applications-list">

            {filteredApplications.map(
              (application) => (
                <article
                  key={
                    application.id
                  }
                  className="application-card"
                >

                  <div className="application-card-header">

                    <div className="application-company-logo">
                      {application.company
                        ?.charAt(0)
                        .toUpperCase() ||
                        "J"}
                    </div>

                    <div className="application-card-title">

                      <h3>
                        {application.jobTitle ||
                          "Untitled Job"}
                      </h3>

                      <p>
                        {application.company ||
                          "Company unavailable"}
                      </p>

                    </div>

                    <span
                      className={getStatusClass(
                        application.status
                      )}
                    >
                      {application.status ||
                        "Applied"}
                    </span>

                  </div>

                  <div className="application-card-details">

                    {application.location && (
                      <span>
                        📍{" "}
                        {application.location}
                      </span>
                    )}

                    {application.salary && (
                      <span>
                        💰{" "}
                        {application.salary}
                      </span>
                    )}

                    {application.jobType && (
                      <span>
                        🕒{" "}
                        {application.jobType}
                      </span>
                    )}

                    <span>
                      📅 Applied{" "}
                      {formatDate(
                        application.appliedAt
                      )}
                    </span>

                  </div>

                  <div className="application-card-footer">

                    <div className="application-progress">

                      <span
                        className={
                          application.status ===
                          "Rejected"
                            ? "progress-step completed"
                            : "progress-step active"
                        }
                      >
                        Applied
                      </span>

                      <span
                        className={
                          application.status ===
                            "Under Review" ||
                          application.status ===
                            "Shortlisted"
                            ? "progress-step active"
                            : "progress-step"
                        }
                      >
                        Under Review
                      </span>

                      <span
                        className={
                          application.status ===
                          "Shortlisted"
                            ? "progress-step active"
                            : "progress-step"
                        }
                      >
                        Shortlisted
                      </span>

                    </div>

                    <Link
                      to={`/job/${application.jobId}`}
                      className="application-view-button"
                      onClick={
                        handleViewApplication
                      }
                    >
                      View Job
                    </Link>

                  </div>

                </article>
              )
            )}

          </section>
        ) : (
          <section className="applications-empty-state">

            <div className="applications-empty-icon">
              {applications.length ===
              0
                ? "📭"
                : "🔍"}
            </div>

            <h2>
              {applications.length ===
              0
                ? "No Applications Yet"
                : "No Applications Found"}
            </h2>

            <p>
              {applications.length ===
              0
                ? "You haven't applied for any jobs yet. Explore available jobs and submit your first application."
                : "Try changing your search or status filter to find your applications."}
            </p>

            {applications.length ===
            0 ? (
              <Link
                to="/jobs"
                className="applications-primary-button"
              >
                Browse Jobs
              </Link>
            ) : (
              <button
                type="button"
                className="applications-primary-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}

          </section>
        )}

      </div>

    </main>
  );
}

export default MyApplications;