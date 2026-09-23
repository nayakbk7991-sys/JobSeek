import {
  Link
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {
  getCurrentUser
} from "../utils/authStorage";

import "./JobCard.css";

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

function JobCard({
  job
}) {
  const currentUser =
    getCurrentUser();

  const isJobSeeker =
    currentUser?.role ===
    "jobSeeker";

  const [
    isSaved,
    setIsSaved
  ] = useState(() => {
    const savedJobs =
      getSavedJobIds();

    return savedJobs.some(
      (savedId) =>
        String(savedId) ===
        String(job?.id)
    );
  });

  useEffect(() => {
    function handleSavedJobsUpdate() {
      const savedJobs =
        getSavedJobIds();

      setIsSaved(
        savedJobs.some(
          (savedId) =>
            String(savedId) ===
            String(job?.id)
        )
      );
    }

    window.addEventListener(
      "jobseekSavedJobsUpdated",
      handleSavedJobsUpdate
    );

    return () => {
      window.removeEventListener(
        "jobseekSavedJobsUpdated",
        handleSavedJobsUpdate
      );
    };
  }, [job?.id]);

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

    const updatedSavedJobs =
      alreadySaved
        ? savedJobs.filter(
            (savedId) =>
              String(savedId) !==
              String(job.id)
          )
        : [
            ...savedJobs,
            job.id
          ];

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

  if (!job) {
    return null;
  }

  const jobType =
    job.type ||
    job.jobType ||
    "";

  const companyInitial =
    job.company
      ?.charAt(0)
      .toUpperCase() ||
    "J";

  const skills =
    Array.isArray(
      job.skills
    )
      ? job.skills
      : [];

  return (
    <article className="job-card">
      <div className="job-card-main">
        <div className="job-card-company-logo">
          {companyInitial}
        </div>

        <div className="job-card-content">
          <div className="job-card-header">
            <div>
              <h3>
                <Link
                  to={`/job/${job.id}`}
                  className="job-card-title"
                >
                  {job.title}
                </Link>
              </h3>

              <p className="job-card-company">
                {job.company}
              </p>
            </div>

            {isJobSeeker && (
              <button
                type="button"
                className={
                  isSaved
                    ? "job-card-save-button saved"
                    : "job-card-save-button"
                }
                onClick={
                  handleSaveJob
                }
                aria-label={
                  isSaved
                    ? "Remove saved job"
                    : "Save job"
                }
                title={
                  isSaved
                    ? "Remove saved job"
                    : "Save job"
                }
              >
                {isSaved
                  ? "♥"
                  : "♡"}
              </button>
            )}
          </div>

          <div className="job-card-meta">
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

          {job.description && (
            <p className="job-card-description">
              {job.description}
            </p>
          )}

          {skills.length > 0 && (
            <div className="job-card-skills">
              {skills
                .slice(0, 5)
                .map(
                  (
                    skill,
                    index
                  ) => (
                    <span
                      className="job-card-skill"
                      key={`${skill}-${index}`}
                    >
                      {skill}
                    </span>
                  )
                )}

              {skills.length > 5 && (
                <span className="job-card-more-skills">
                  +{skills.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="job-card-actions">
        <Link
          to={`/job/${job.id}`}
          className="job-card-view-button"
        >
          View Details
        </Link>

        {isJobSeeker && (
          <Link
            to={`/job/${job.id}/apply`}
            className="job-card-apply-button"
          >
            Apply Now
          </Link>
        )}
      </div>
    </article>
  );
}

export default JobCard;