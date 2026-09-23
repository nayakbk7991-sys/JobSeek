import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import jobs from "../data/jobs";

import {
  getStoredJobs
} from "../utils/jobStorage";

import {
  getApplications
} from "../utils/applicationStorage";

import {
  getCurrentUser
} from "../utils/authStorage";

import "./JobDetails.css";

const SAVED_JOBS_KEY =
  "jobseekSavedJobs";

function getSavedJobIds() {
  const storedSavedJobs =
    localStorage.getItem(
      SAVED_JOBS_KEY
    );

  if (!storedSavedJobs) {
    return [];
  }

  try {
    const parsedSavedJobs =
      JSON.parse(
        storedSavedJobs
      );

    return Array.isArray(
      parsedSavedJobs
    )
      ? parsedSavedJobs
      : [];
  } catch {
    return [];
  }
}

function JobDetails() {
  const {
    id
  } = useParams();

  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const isJobSeeker =
    currentUser?.role ===
    "jobSeeker";

  const [
    isSaved,
    setIsSaved
  ] = useState(false);

  const [
    applications,
    setApplications
  ] = useState([]);

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const job =
    useMemo(() => {
      const staticJob =
        jobs.find(
          (item) =>
            String(item.id) ===
            String(id)
        );

      const postedJobs =
        getStoredJobs();

      const postedJob =
        postedJobs.find(
          (item) =>
            String(item.id) ===
            String(id)
        );

      return (
        postedJob ||
        staticJob ||
        null
      );
    }, [id]);

  useEffect(() => {
    setIsLoading(true);

    const timer =
      setTimeout(() => {
        setIsLoading(false);
      }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [id]);

  useEffect(() => {
    if (!job) {
      return;
    }

    const savedJobs =
      getSavedJobIds();

    setIsSaved(
      savedJobs.some(
        (savedId) =>
          String(savedId) ===
          String(job.id)
      )
    );
  }, [job]);

  useEffect(() => {
    function loadApplications() {
      const storedApplications =
        getApplications();

      setApplications(
        storedApplications
      );
    }

    loadApplications();

    window.addEventListener(
      "jobseekApplicationsUpdated",
      loadApplications
    );

    return () => {
      window.removeEventListener(
        "jobseekApplicationsUpdated",
        loadApplications
      );
    };
  }, []);

  const alreadyApplied =
    isJobSeeker &&
    applications.some(
      (application) =>
        String(
          application.jobId
        ) ===
          String(job?.id) &&
        application.userEmail ===
          currentUser?.email
    );

  function handleSaveJob() {
    if (
      !isJobSeeker ||
      !job
    ) {
      return;
    }

    const savedJobs =
      getSavedJobIds();

    const alreadySaved =
      savedJobs.some(
        (savedId) =>
          String(savedId) ===
          String(job.id)
      );

    let updatedSavedJobs;

    if (alreadySaved) {
      updatedSavedJobs =
        savedJobs.filter(
          (savedId) =>
            String(savedId) !==
            String(job.id)
        );
    } else {
      updatedSavedJobs = [
        ...savedJobs,
        job.id
      ];
    }

    localStorage.setItem(
      SAVED_JOBS_KEY,
      JSON.stringify(
        updatedSavedJobs
      )
    );

    setIsSaved(
      !alreadySaved
    );

    window.dispatchEvent(
      new Event(
        "jobseekSavedJobsUpdated"
      )
    );
  }

  function getPostedDate() {
    const dateValue =
      job?.postedAt ||
      job?.createdAt;

    if (!dateValue) {
      return "";
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
      return "";
    }

    const difference =
      Date.now() -
      date.getTime();

    if (difference < 0) {
      return "";
    }

    const minutes =
      Math.floor(
        difference /
          (1000 * 60)
      );

    if (minutes < 60) {
      return `${Math.max(
        minutes,
        1
      )} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} ${
        hours === 1
          ? "hour"
          : "hours"
      } ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 30) {
      return `${days} ${
        days === 1
          ? "day"
          : "days"
      } ago`;
    }

    const months =
      Math.floor(
        days / 30
      );

    return `${months} ${
      months === 1
        ? "month"
        : "months"
    } ago`;
  }

  if (isLoading) {
    return (
      <main className="job-details-page">

        <div className="job-details-container">

          <div className="job-details-loading-state">

            <div className="job-details-loading-spinner"></div>

            <h1>
              Loading job...
            </h1>

            <p>
              Please wait while we
              load the job details.
            </p>

          </div>

        </div>

      </main>
    );
  }

  if (!job) {
    return (
      <main className="job-details-page">

        <div className="job-details-container">

          <div className="job-details-not-found">

            <div className="job-details-not-found-icon">
              🔍
            </div>

            <h1>
              Job Not Found
            </h1>

            <p>
              The job you are
              looking for may have
              been removed or is no
              longer available.
            </p>

            <Link
              to="/jobs"
              className="job-details-primary-button"
            >
              Browse Jobs
            </Link>

          </div>

        </div>

      </main>
    );
  }

  const jobType =
    job.type ||
    job.jobType ||
    "";

  const skills =
    Array.isArray(
      job.skills
    )
      ? job.skills
      : [];

  const requirements =
    Array.isArray(
      job.requirements
    )
      ? job.requirements
      : [];

  const postedDate =
    getPostedDate();

  const companyInitial =
    job.company
      ?.charAt(0)
      .toUpperCase() ||
    "J";

  return (
    <main className="job-details-page">

      <div className="job-details-container">

        <button
          type="button"
          className="job-details-back"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <section className="job-details-hero">

          <div className="job-details-company-logo">
            {companyInitial}
          </div>

          <div className="job-details-hero-content">

            <div className="job-details-title-row">

              <div>

                <h1>
                  {job.title}
                </h1>

                <p className="job-details-company">
                  {job.company}
                </p>

              </div>

              {postedDate && (
                <span className="job-details-posted">
                  {postedDate}
                </span>
              )}

            </div>

            <div className="job-details-meta">

              {job.location && (
                <span>
                  📍 {job.location}
                </span>
              )}

              {job.salary && (
                <span>
                  💰 {job.salary}
                </span>
              )}

              {job.experience && (
                <span>
                  💼 {job.experience}
                </span>
              )}

              {jobType && (
                <span>
                  🕒 {jobType}
                </span>
              )}

            </div>

          </div>

        </section>

        <div className="job-details-layout">

          <div className="job-details-main">

            <section className="job-details-section">

              <h2>
                Job Description
              </h2>

              <div className="job-details-text">

                {job.description ? (
                  <p>
                    {job.description}
                  </p>
                ) : (
                  <p>
                    No job description
                    has been provided.
                  </p>
                )}

              </div>

            </section>

            {skills.length >
              0 && (
              <section className="job-details-section">

                <h2>
                  Required Skills
                </h2>

                <div className="job-details-skills">

                  {skills.map(
                    (
                      skill,
                      index
                    ) => (
                      <span
                        key={`${skill}-${index}`}
                        className="job-details-skill"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </section>
            )}

            {requirements.length >
              0 && (
              <section className="job-details-section">

                <h2>
                  Requirements
                </h2>

                <ul className="job-details-requirements">

                  {requirements.map(
                    (
                      requirement,
                      index
                    ) => (
                      <li
                        key={`${requirement}-${index}`}
                      >

                        <span>
                          ✓
                        </span>

                        <p>
                          {requirement}
                        </p>

                      </li>
                    )
                  )}

                </ul>

              </section>
            )}

          </div>

          <aside className="job-details-sidebar">

            <section className="job-details-action-card">

              <h2>
                Interested in this job?
              </h2>

              {isJobSeeker ? (
                <>
                  {alreadyApplied ? (
                    <Link
                      to="/applications"
                      className="job-details-applied-button"
                    >
                      Application Submitted
                    </Link>
                  ) : (
                    <Link
                      to={`/job/${job.id}/apply`}
                      className="job-details-apply-button"
                    >
                      Apply Now
                    </Link>
                  )}

                  <button
                    type="button"
                    className={
                      isSaved
                        ? "job-details-save-button saved"
                        : "job-details-save-button"
                    }
                    onClick={
                      handleSaveJob
                    }
                  >
                    {isSaved
                      ? "♥  Saved Job"
                      : "♡  Save Job"}
                  </button>
                </>
              ) : (
                <p className="job-details-role-message">
                  Job applications are
                  available for job
                  seekers.
                </p>
              )}

            </section>

            <section className="job-details-summary-card">

              <h2>
                Job Overview
              </h2>

              {job.location && (
                <div className="job-overview-item">

                  <span className="job-overview-icon">
                    📍
                  </span>

                  <div>

                    <small>
                      Location
                    </small>

                    <strong>
                      {job.location}
                    </strong>

                  </div>

                </div>
              )}

              {job.salary && (
                <div className="job-overview-item">

                  <span className="job-overview-icon">
                    💰
                  </span>

                  <div>

                    <small>
                      Salary
                    </small>

                    <strong>
                      {job.salary}
                    </strong>

                  </div>

                </div>
              )}

              {job.experience && (
                <div className="job-overview-item">

                  <span className="job-overview-icon">
                    💼
                  </span>

                  <div>

                    <small>
                      Experience
                    </small>

                    <strong>
                      {job.experience}
                    </strong>

                  </div>

                </div>
              )}

              {jobType && (
                <div className="job-overview-item">

                  <span className="job-overview-icon">
                    🕒
                  </span>

                  <div>

                    <small>
                      Job Type
                    </small>

                    <strong>
                      {jobType}
                    </strong>

                  </div>

                </div>
              )}

              {postedDate && (
                <div className="job-overview-item">

                  <span className="job-overview-icon">
                    📅
                  </span>

                  <div>

                    <small>
                      Posted
                    </small>

                    <strong>
                      {postedDate}
                    </strong>

                  </div>

                </div>
              )}

            </section>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default JobDetails;