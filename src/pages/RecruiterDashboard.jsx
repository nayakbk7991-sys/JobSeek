import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useLocation
} from "react-router-dom";

import {
  deleteJob,
  getStoredJobs
} from "../utils/jobStorage";

import {
  deleteApplication,
  getApplications
} from "../utils/applicationStorage";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const currentUser =
    getCurrentUser();

  const location =
    useLocation();

  const [
    refreshKey,
    setRefreshKey
  ] = useState(0);

  const [
    message,
    setMessage
  ] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }
  }, [location.state]);

  useEffect(() => {
    function handleJobsUpdated() {
      setRefreshKey(
        (value) =>
          value + 1
      );
    }

    function handleApplicationsUpdated() {
      setRefreshKey(
        (value) =>
          value + 1
      );
    }

    window.addEventListener(
      "jobseekJobsUpdated",
      handleJobsUpdated
    );

    window.addEventListener(
      "jobseekApplicationsUpdated",
      handleApplicationsUpdated
    );

    return () => {
      window.removeEventListener(
        "jobseekJobsUpdated",
        handleJobsUpdated
      );

      window.removeEventListener(
        "jobseekApplicationsUpdated",
        handleApplicationsUpdated
      );
    };
  }, []);

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
            "Unable to load your jobs."
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

  const allApplications =
    useMemo(() => {
      try {
        return getApplications();
      } catch (error) {
        logError(
          "Loading recruiter applications",
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

  const recruiterJobIds =
    useMemo(() => {
      return recruiterJobs.map(
        (job) =>
          String(
            job.id
          )
      );
    }, [
      recruiterJobs
    ]);

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

  const totalApplications =
    recruiterApplications.length;

  const appliedCount =
    recruiterApplications.filter(
      (application) =>
        application.status ===
          "Applied" ||
        !application.status
    ).length;

  const underReviewCount =
    recruiterApplications.filter(
      (application) =>
        application.status ===
        "Under Review"
    ).length;

  const shortlistedCount =
    recruiterApplications.filter(
      (application) =>
        application.status ===
        "Shortlisted"
    ).length;

  const rejectedCount =
    recruiterApplications.filter(
      (application) =>
        application.status ===
        "Rejected"
    ).length;

  const recentApplications =
    useMemo(() => {
      return [
        ...recruiterApplications
      ]
        .sort(
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

            return (
              secondDate -
              firstDate
            );
          }
        )
        .slice(
          0,
          5
        );
    }, [
      recruiterApplications
    ]);

  function getPercentage(
    count
  ) {
    if (
      totalApplications ===
      0
    ) {
      return 0;
    }

    return (
      (count /
        totalApplications) *
      100
    );
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
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function handleDeleteJob(
    jobId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this job? All applications for this job will also be removed."
      );

    if (!confirmed) {
      return;
    }

    try {
      const jobToDelete =
        allJobs.find(
          (job) =>
            String(
              job.id
            ) ===
            String(
              jobId
            )
        );

      if (!jobToDelete) {
        setMessage(
          "This job could not be found."
        );

        return;
      }

      const isOwner =
        String(
          jobToDelete.recruiterId
        ) ===
          String(
            currentUser?.id
          ) ||
        jobToDelete.recruiterEmail ===
          currentUser?.email;

      if (!isOwner) {
        setMessage(
          "You cannot delete this job."
        );

        return;
      }

      deleteJob(
        jobId
      );

      const applicationsForJob =
        allApplications.filter(
          (application) =>
            String(
              application.jobId
            ) ===
            String(
              jobId
            )
        );

      applicationsForJob.forEach(
        (application) => {
          deleteApplication(
            application.id
          );
        }
      );

      setMessage(
        "Job deleted successfully."
      );

      setRefreshKey(
        (value) =>
          value + 1
      );
    } catch (
      deleteError
    ) {
      logError(
        "Deleting recruiter job",
        deleteError
      );

      setMessage(
        getErrorMessage(
          deleteError,
          "Something went wrong while deleting the job."
        )
      );
    }
  }

  if (
    currentUser?.role !==
    "recruiter"
  ) {
    return (
      <main className="recruiter-dashboard-page">

        <div className="recruiter-dashboard-access">

          <div className="recruiter-dashboard-access-icon">
            !
          </div>

          <h1>
            Recruiter Access Required
          </h1>

          <p>
            Only recruiters can access
            the recruiter dashboard.
          </p>

          <Link to="/">
            Go to Home
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main
      className="recruiter-dashboard-page"
      key={refreshKey}
    >

      <div className="recruiter-dashboard-container">

        <section className="recruiter-dashboard-header">

          <div>

            <span className="recruiter-section-label">
              RECRUITER DASHBOARD
            </span>

            <h1>
              Welcome,{" "}
              {currentUser?.name ||
                "Recruiter"}
            </h1>

            <p>
              Manage your job postings,
              review applications and
              find the right candidates.
            </p>

          </div>

          <Link
            to="/post-job"
            className="post-job-button"
          >
            + Post a Job
          </Link>

        </section>

        {message && (
          <div className="recruiter-dashboard-message">

            <span>
              ✓
            </span>

            {message}

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

        <section className="recruiter-stats">

          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">
              💼
            </div>

            <div>

              <span className="recruiter-stat-label">
                Posted Jobs
              </span>

              <strong>
                {recruiterJobs.length}
              </strong>

            </div>

          </div>

          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">
              👥
            </div>

            <div>

              <span className="recruiter-stat-label">
                Applications
              </span>

              <strong>
                {totalApplications}
              </strong>

            </div>

          </div>

          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">
              🔎
            </div>

            <div>

              <span className="recruiter-stat-label">
                Under Review
              </span>

              <strong>
                {underReviewCount}
              </strong>

            </div>

          </div>

          <div className="recruiter-stat-card">

            <div className="recruiter-stat-icon">
              ✓
            </div>

            <div>

              <span className="recruiter-stat-label">
                Shortlisted
              </span>

              <strong>
                {shortlistedCount}
              </strong>

            </div>

          </div>

        </section>

        <section className="recruiter-overview-grid">

          <div className="recruiter-overview-card">

            <div className="recruiter-card-header">

              <div>

                <span className="recruiter-card-label">
                  APPLICATION OVERVIEW
                </span>

                <h2>
                  Candidate Pipeline
                </h2>

              </div>

              <Link
                to="/recruiter/applications"
                className="recruiter-card-link"
              >
                View Applications →
              </Link>

            </div>

            <div className="application-pipeline">

              <div className="pipeline-item">

                <div className="pipeline-top">

                  <span>
                    Applied
                  </span>

                  <strong>
                    {appliedCount}
                  </strong>

                </div>

                <div className="pipeline-bar">

                  <span
                    style={{
                      width: `${getPercentage(
                        appliedCount
                      )}%`
                    }}
                  />

                </div>

              </div>

              <div className="pipeline-item">

                <div className="pipeline-top">

                  <span>
                    Under Review
                  </span>

                  <strong>
                    {underReviewCount}
                  </strong>

                </div>

                <div className="pipeline-bar">

                  <span
                    style={{
                      width: `${getPercentage(
                        underReviewCount
                      )}%`
                    }}
                  />

                </div>

              </div>

              <div className="pipeline-item">

                <div className="pipeline-top">

                  <span>
                    Shortlisted
                  </span>

                  <strong>
                    {shortlistedCount}
                  </strong>

                </div>

                <div className="pipeline-bar">

                  <span
                    style={{
                      width: `${getPercentage(
                        shortlistedCount
                      )}%`
                    }}
                  />

                </div>

              </div>

              <div className="pipeline-item">

                <div className="pipeline-top">

                  <span>
                    Rejected
                  </span>

                  <strong>
                    {rejectedCount}
                  </strong>

                </div>

                <div className="pipeline-bar">

                  <span
                    style={{
                      width: `${getPercentage(
                        rejectedCount
                      )}%`
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          <div className="recruiter-quick-card">

            <span className="recruiter-card-label">
              QUICK ACTIONS
            </span>

            <h2>
              Manage hiring
            </h2>

            <p>
              Quickly access the tools you
              need to manage your recruitment
              process.
            </p>

            <div className="quick-action-list">

              <Link
                to="/post-job"
                className="quick-action-item"
              >

                <span>
                  +
                </span>

                <div>

                  <strong>
                    Post a New Job
                  </strong>

                  <small>
                    Create a new opportunity
                  </small>

                </div>

                <b>
                  →
                </b>

              </Link>

              <Link
                to="/recruiter/applications"
                className="quick-action-item"
              >

                <span>
                  👥
                </span>

                <div>

                  <strong>
                    Review Applications
                  </strong>

                  <small>
                    View and manage candidates
                  </small>

                </div>

                <b>
                  →
                </b>

              </Link>

              <Link
                to="/recruiter/profile"
                className="quick-action-item"
              >

                <span>
                  ⚙
                </span>

                <div>

                  <strong>
                    Company Profile
                  </strong>

                  <small>
                    Update your company details
                  </small>

                </div>

                <b>
                  →
                </b>

              </Link>

            </div>

          </div>

        </section>

        <section className="recruiter-jobs-section">

          <div className="recruiter-section-heading">

            <div>

              <span className="recruiter-card-label">
                YOUR JOB POSTINGS
              </span>

              <h2>
                Manage Jobs
              </h2>

              <p>
                View and manage the jobs you
                have posted on JobSeek.
              </p>

            </div>

            <Link
              to="/post-job"
              className="secondary-post-job-button"
            >
              + Post Job
            </Link>

          </div>

          {recruiterJobs.length ===
          0 ? (
            <div className="recruiter-empty-state">

              <div className="recruiter-empty-icon">
                💼
              </div>

              <h3>
                No jobs posted yet
              </h3>

              <p>
                Create your first job posting
                and start receiving applications.
              </p>

              <Link
                to="/post-job"
                className="post-job-button"
              >
                Post Your First Job
              </Link>

            </div>
          ) : (
            <div className="recruiter-jobs-list">

              {recruiterJobs.map(
                (job) => (
                  <article
                    className="recruiter-job-card"
                    key={job.id}
                  >

                    <div className="recruiter-job-main">

                      <div className="recruiter-job-logo">
                        {job.company
                          ?.charAt(0)
                          .toUpperCase() ||
                          "J"}
                      </div>

                      <div className="recruiter-job-info">

                        <Link
                          to={`/job/${job.id}`}
                          className="recruiter-job-title"
                        >
                          {job.title}
                        </Link>

                        <p>
                          {job.company}
                        </p>

                        <div className="recruiter-job-meta">

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

                          {(job.type ||
                            job.jobType) && (
                            <span>
                              💼{" "}
                              {job.type ||
                                job.jobType}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                    <div className="recruiter-job-stats">

                      <div>

                        <strong>
                          {
                            recruiterApplications.filter(
                              (application) =>
                                String(
                                  application.jobId
                                ) ===
                                String(
                                  job.id
                                )
                            ).length
                          }
                        </strong>

                        <span>
                          Applications
                        </span>

                      </div>

                    </div>

                    <div className="recruiter-job-actions">

                      <Link
                        to={`/job/${job.id}`}
                        className="job-action-view"
                      >
                        View
                      </Link>

                      <Link
                        to={`/edit-job/${job.id}`}
                        className="job-action-edit"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        className="job-action-delete"
                        onClick={() =>
                          handleDeleteJob(
                            job.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

        <section className="recent-applications-section">

          <div className="recruiter-section-heading">

            <div>

              <span className="recruiter-card-label">
                RECENT ACTIVITY
              </span>

              <h2>
                Recent Applications
              </h2>

              <p>
                The latest candidates who
                applied to your jobs.
              </p>

            </div>

            {recruiterApplications.length >
              0 && (
              <Link
                to="/recruiter/applications"
                className="recruiter-card-link"
              >
                View All →
              </Link>
            )}

          </div>

          {recentApplications.length ===
          0 ? (
            <div className="recent-applications-empty">

              <span>
                👥
              </span>

              <div>

                <h3>
                  No applications yet
                </h3>

                <p>
                  Applications will appear here
                  when candidates apply to your jobs.
                </p>

              </div>

            </div>
          ) : (
            <div className="recent-applications-list">

              {recentApplications.map(
                (application) => {
                  const status =
                    application.status ||
                    "Applied";

                  const statusClass =
                    status
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      );

                  return (
                    <div
                      className="recent-application-item"
                      key={
                        application.id
                      }
                    >

                      <div className="candidate-avatar">

                        {application.userName
                          ?.charAt(0)
                          .toUpperCase() ||
                          "C"}

                      </div>

                      <div className="candidate-info">

                        <strong>
                          {application.userName ||
                            "Candidate"}
                        </strong>

                        <span>
                          Applied for{" "}
                          {application.jobTitle ||
                            "Job"}
                        </span>

                      </div>

                      <span
                        className={`application-status-badge status-${statusClass}`}
                      >
                        {status}
                      </span>

                      <span className="recent-application-date">
                        {formatDate(
                          application.appliedAt ||
                            application.createdAt
                        )}
                      </span>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default RecruiterDashboard;