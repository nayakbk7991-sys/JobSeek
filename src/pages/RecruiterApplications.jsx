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
  getApplications,
  updateApplication
} from "../utils/applicationStorage";

import {
  getStoredJobs
} from "../utils/jobStorage";

import {
  getResume,
  resumeExists
} from "../utils/resumeStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import LoadingSpinner from "../components/LoadingSpinner";

import "./RecruiterApplications.css";

function RecruiterApplications() {
  const currentUser =
    getCurrentUser();

  const [
    refreshKey,
    setRefreshKey
  ] = useState(0);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    message,
    setMessage
  ] = useState("");

  const [
    search,
    setSearch
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("All");

  const [
    sortBy,
    setSortBy
  ] = useState("newest");

  const [
    resumeLoadingId,
    setResumeLoadingId
  ] = useState(null);

  useEffect(() => {
    setLoading(true);

    const timer =
      window.setTimeout(() => {
        setLoading(false);
      }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshKey]);

  const allJobs =
    useMemo(() => {
      try {
        return getStoredJobs();
      } catch (error) {
        logError(
          "Loading recruiter jobs",
          error
        );

        setMessage(
          getErrorMessage(
            error,
            "Unable to load recruiter jobs."
          )
        );

        return [];
      }
    }, [refreshKey]);

  const recruiterJobs =
    useMemo(() => {
      return allJobs.filter(
        (job) =>
          String(
            job.recruiterId
          ) ===
            String(
              currentUser?.id
            ) ||
          job.recruiterEmail ===
            currentUser?.email
      );
    }, [
      allJobs,
      currentUser?.id,
      currentUser?.email
    ]);

  const recruiterJobIds =
    useMemo(() => {
      return recruiterJobs.map(
        (job) =>
          String(job.id)
      );
    }, [
      recruiterJobs
    ]);

  const allApplications =
    useMemo(() => {
      try {
        return getApplications();
      } catch (error) {
        logError(
          "Loading applications",
          error
        );

        setMessage(
          getErrorMessage(
            error,
            "Unable to load applications."
          )
        );

        return [];
      }
    }, [refreshKey]);

  const recruiterApplications =
    useMemo(() => {
      return allApplications.filter(
        (application) =>
          recruiterJobIds.includes(
            String(
              application.jobId
            )
          )
      );
    }, [
      allApplications,
      recruiterJobIds
    ]);

  const applicationsWithJobs =
    useMemo(() => {
      return recruiterApplications.map(
        (application) => {
          const job =
            recruiterJobs.find(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  application.jobId
                )
            );

          return {
            ...application,
            job
          };
        }
      );
    }, [
      recruiterApplications,
      recruiterJobs
    ]);

  const filteredApplications =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      const filtered =
        applicationsWithJobs.filter(
          (application) => {
            const candidateName =
              application.userName ||
              application.name ||
              application.applicantName ||
              "";

            const candidateEmail =
              application.userEmail ||
              application.email ||
              application.applicantEmail ||
              "";

            const jobTitle =
              application.job?.title ||
              application.jobTitle ||
              "";

            const company =
              application.job?.company ||
              application.company ||
              "";

            const location =
              application.job?.location ||
              application.location ||
              "";

            const status =
              application.status ||
              "Applied";

            const matchesSearch =
              !searchText ||
              candidateName
                .toLowerCase()
                .includes(
                  searchText
                ) ||
              candidateEmail
                .toLowerCase()
                .includes(
                  searchText
                ) ||
              jobTitle
                .toLowerCase()
                .includes(
                  searchText
                ) ||
              company
                .toLowerCase()
                .includes(
                  searchText
                ) ||
              location
                .toLowerCase()
                .includes(
                  searchText
                );

            const matchesStatus =
              statusFilter ===
                "All" ||
              status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
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
          if (
            sortBy ===
            "oldest"
          ) {
            return (
              new Date(
                first.appliedAt ||
                  first.createdAt ||
                  0
              ) -
              new Date(
                second.appliedAt ||
                  second.createdAt ||
                  0
              )
            );
          }

          if (
            sortBy ===
            "candidate"
          ) {
            const nameA =
              (
                first.userName ||
                first.name ||
                first.applicantName ||
                ""
              ).toLowerCase();

            const nameB =
              (
                second.userName ||
                second.name ||
                second.applicantName ||
                ""
              ).toLowerCase();

            return nameA.localeCompare(
              nameB
            );
          }

          return (
            new Date(
              second.appliedAt ||
                second.createdAt ||
                0
            ) -
            new Date(
              first.appliedAt ||
                first.createdAt ||
                0
            )
          );
        }
      );
    }, [
      applicationsWithJobs,
      search,
      statusFilter,
      sortBy
    ]);

  const statusCounts =
    useMemo(() => {
      return {
        all:
          recruiterApplications.length,

        applied:
          recruiterApplications.filter(
            (application) =>
              application.status ===
                "Applied" ||
              !application.status
          ).length,

        underReview:
          recruiterApplications.filter(
            (application) =>
              application.status ===
              "Under Review"
          ).length,

        shortlisted:
          recruiterApplications.filter(
            (application) =>
              application.status ===
              "Shortlisted"
          ).length,

        rejected:
          recruiterApplications.filter(
            (application) =>
              application.status ===
              "Rejected"
          ).length
      };
    }, [
      recruiterApplications
    ]);

  useEffect(() => {
    function handleApplicationsUpdated() {
      setRefreshKey(
        (value) =>
          value + 1
      );
    }

    window.addEventListener(
      "jobseekApplicationsUpdated",
      handleApplicationsUpdated
    );

    return () => {
      window.removeEventListener(
        "jobseekApplicationsUpdated",
        handleApplicationsUpdated
      );
    };
  }, []);

  function handleStatusChange(
    applicationId,
    newStatus
  ) {
    try {
      const application =
        allApplications.find(
          (item) =>
            String(
              item.id
            ) ===
            String(
              applicationId
            )
        );

      if (!application) {
        setMessage(
          "Application could not be found."
        );

        return;
      }

      const isRecruiterJob =
        recruiterJobIds.includes(
          String(
            application.jobId
          )
        );

      if (!isRecruiterJob) {
        setMessage(
          "You cannot update this application."
        );

        return;
      }

      const changedAt =
        new Date().toISOString();

      const existingHistory =
        Array.isArray(
          application.statusHistory
        )
          ? application.statusHistory
          : [];

      const updatedApplication = {
        status:
          newStatus,

        statusHistory: [
          ...existingHistory,
          {
            status:
              newStatus,
            date:
              changedAt
          }
        ],

        updatedAt:
          changedAt
      };

      const savedApplication =
        updateApplication(
          application.id,
          updatedApplication
        );

      if (!savedApplication) {
        throw new Error(
          "Unable to update application status."
        );
      }

      setMessage(
        "Application status updated successfully."
      );

      setRefreshKey(
        (value) =>
          value + 1
      );
    } catch (error) {
      logError(
        "Updating application status",
        error
      );

      setMessage(
        getErrorMessage(
          error,
          "Unable to update application status."
        )
      );
    }
  }

  async function handleViewResume(
    application
  ) {
    if (
      !application.resumeId
    ) {
      setMessage(
        "No resume is attached to this application."
      );

      return;
    }

    try {
      setResumeLoadingId(
        application.id
      );

      setMessage("");

      const exists =
        await resumeExists(
          application.resumeId
        );

      if (!exists) {
        setMessage(
          "The candidate's resume is no longer available."
        );

        return;
      }

      const file =
        await getResume(
          application.resumeId
        );

      if (!file) {
        setMessage(
          "The candidate's resume could not be opened."
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
        "Opening candidate resume",
        error
      );

      setMessage(
        getErrorMessage(
          error,
          "Something went wrong while opening the resume."
        )
      );
    } finally {
      setResumeLoadingId(
        null
      );
    }
  }

  async function handleDownloadResume(
    application
  ) {
    if (
      !application.resumeId
    ) {
      setMessage(
        "No resume is attached to this application."
      );

      return;
    }

    try {
      setResumeLoadingId(
        application.id
      );

      setMessage("");

      const exists =
        await resumeExists(
          application.resumeId
        );

      if (!exists) {
        setMessage(
          "The candidate's resume is no longer available."
        );

        return;
      }

      const file =
        await getResume(
          application.resumeId
        );

      if (!file) {
        setMessage(
          "The candidate's resume could not be downloaded."
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
        application.resumeName ||
        file.name ||
        "candidate-resume";

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
        "Downloading candidate resume",
        error
      );

      setMessage(
        getErrorMessage(
          error,
          "Something went wrong while downloading the resume."
        )
      );
    } finally {
      setResumeLoadingId(
        null
      );
    }
  }

  function getStatusClass(
    status
  ) {
    const normalized =
      (
        status ||
        "Applied"
      )
        .toLowerCase()
        .replace(
          /\s+/g,
          "-"
        );

    return `recruiter-application-status ${normalized}`;
  }

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
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  }

  function getCandidateName(
    application
  ) {
    return (
      application.userName ||
      application.name ||
      application.applicantName ||
      "Candidate"
    );
  }

  function getCandidateEmail(
    application
  ) {
    return (
      application.userEmail ||
      application.email ||
      application.applicantEmail ||
      "Email unavailable"
    );
  }

  if (
    currentUser?.role !==
    "recruiter"
  ) {
    return (
      <main className="recruiter-applications-page">
        <div className="recruiter-applications-access">
          <h1>
            Recruiter Access Required
          </h1>

          <p>
            Only recruiters can view
            applications.
          </p>

          <Link to="/">
            Go to Home
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="recruiter-applications-page">
        <LoadingSpinner
          message="Loading candidate applications..."
        />
      </main>
    );
  }

  return (
    <main className="recruiter-applications-page">
      <div className="recruiter-applications-container">

        <div className="recruiter-applications-header">

          <div>
            <span className="recruiter-applications-label">
              RECRUITER
            </span>

            <h1>
              Candidate Applications
            </h1>

            <p>
              Review candidates, access resumes
              and manage application status.
            </p>
          </div>

          <Link
            to="/recruiter"
            className="recruiter-applications-back"
          >
            ← Dashboard
          </Link>

        </div>

        {message && (
          <div className="recruiter-applications-message">

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>

          </div>
        )}

        <div className="recruiter-application-stats">

          <button
            type="button"
            className={
              statusFilter ===
              "All"
                ? "recruiter-application-stat active"
                : "recruiter-application-stat"
            }
            onClick={() =>
              setStatusFilter(
                "All"
              )
            }
          >
            <strong>
              {statusCounts.all}
            </strong>

            <span>
              All Applications
            </span>
          </button>

          <button
            type="button"
            className={
              statusFilter ===
              "Applied"
                ? "recruiter-application-stat active"
                : "recruiter-application-stat"
            }
            onClick={() =>
              setStatusFilter(
                "Applied"
              )
            }
          >
            <strong>
              {statusCounts.applied}
            </strong>

            <span>
              Applied
            </span>
          </button>

          <button
            type="button"
            className={
              statusFilter ===
              "Under Review"
                ? "recruiter-application-stat active"
                : "recruiter-application-stat"
            }
            onClick={() =>
              setStatusFilter(
                "Under Review"
              )
            }
          >
            <strong>
              {statusCounts.underReview}
            </strong>

            <span>
              Under Review
            </span>
          </button>

          <button
            type="button"
            className={
              statusFilter ===
              "Shortlisted"
                ? "recruiter-application-stat active"
                : "recruiter-application-stat"
            }
            onClick={() =>
              setStatusFilter(
                "Shortlisted"
              )
            }
          >
            <strong>
              {statusCounts.shortlisted}
            </strong>

            <span>
              Shortlisted
            </span>
          </button>

          <button
            type="button"
            className={
              statusFilter ===
              "Rejected"
                ? "recruiter-application-stat active"
                : "recruiter-application-stat"
            }
            onClick={() =>
              setStatusFilter(
                "Rejected"
              )
            }
          >
            <strong>
              {statusCounts.rejected}
            </strong>

            <span>
              Rejected
            </span>
          </button>

        </div>

        <section className="recruiter-applications-filters">

          <div className="recruiter-applications-search">

            <span>
              🔎
            </span>

            <input
              type="text"
              placeholder="Search candidate, email, job, company or location..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Statuses
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

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
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

            <option value="candidate">
              Candidate A-Z
            </option>
          </select>

        </section>

        <div className="recruiter-applications-results">
          Showing{" "}
          <strong>
            {filteredApplications.length}
          </strong>{" "}
          of{" "}
          <strong>
            {recruiterApplications.length}
          </strong>{" "}
          applications
        </div>

        {filteredApplications.length ===
        0 ? (
          <div className="recruiter-applications-empty">

            <div className="recruiter-applications-empty-icon">
              📋
            </div>

            <h2>
              No applications found
            </h2>

            <p>
              Try changing your search or
              status filter.
            </p>

            {(search ||
              statusFilter !==
                "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter(
                    "All"
                  );
                }}
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <div className="recruiter-applications-list">

            {filteredApplications.map(
              (application) => {
                const candidateName =
                  getCandidateName(
                    application
                  );

                const candidateEmail =
                  getCandidateEmail(
                    application
                  );

                const job =
                  application.job;

                const status =
                  application.status ||
                  "Applied";

                const hasResume =
                  Boolean(
                    application.resumeId
                  );

                const isResumeLoading =
                  resumeLoadingId ===
                  application.id;

                return (
                  <article
                    key={
                      application.id
                    }
                    className="recruiter-application-card"
                  >

                    <div className="recruiter-application-main">

                      <div className="recruiter-application-avatar">
                        {candidateName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="recruiter-application-content">

                        <div className="recruiter-application-top">

                          <div>
                            <h2>
                              {candidateName}
                            </h2>

                            <p>
                              {candidateEmail}
                            </p>
                          </div>

                          <span
                            className={getStatusClass(
                              status
                            )}
                          >
                            {status}
                          </span>

                        </div>

                        <div className="recruiter-application-job">

                          <strong>
                            {job?.title ||
                              application.jobTitle ||
                              "Job"}
                          </strong>

                          <span>
                            {job?.company ||
                              application.company ||
                              "Company"}
                          </span>

                          <span>
                            {job?.location ||
                              application.location ||
                              "Location"}
                          </span>

                        </div>

                        <div className="recruiter-application-meta">

                          <span>
                            Applied{" "}
                            {formatDate(
                              application.appliedAt ||
                                application.createdAt
                            )}
                          </span>

                          {application.resumeName && (
                            <span>
                              Resume:{" "}
                              {application.resumeName}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    <div className="recruiter-application-actions">

                      {hasResume ? (
                        <>
                          <button
                            type="button"
                            className="recruiter-resume-view-button"
                            onClick={() =>
                              handleViewResume(
                                application
                              )
                            }
                            disabled={
                              isResumeLoading
                            }
                          >
                            {isResumeLoading
                              ? "Opening..."
                              : "View Resume"}
                          </button>

                          <button
                            type="button"
                            className="recruiter-resume-download-button"
                            onClick={() =>
                              handleDownloadResume(
                                application
                              )
                            }
                            disabled={
                              isResumeLoading
                            }
                          >
                            {isResumeLoading
                              ? "Please wait..."
                              : "Download"}
                          </button>
                        </>
                      ) : (
                        <span className="recruiter-no-resume">
                          No Resume
                        </span>
                      )}

                      {job && (
                        <Link
                          to={`/job/${job.id}`}
                          className="recruiter-application-view-button"
                        >
                          View Job
                        </Link>
                      )}

                      <select
                        value={status}
                        onChange={(event) =>
                          handleStatusChange(
                            application.id,
                            event.target.value
                          )
                        }
                      >
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

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>
    </main>
  );
}

export default RecruiterApplications;