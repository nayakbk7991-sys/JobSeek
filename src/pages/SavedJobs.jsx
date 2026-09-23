import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link
} from "react-router-dom";

import jobs from "../data/jobs";

import {
  getStoredJobs
} from "../utils/jobStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import "./SavedJobs.css";

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

    if (
      !Array.isArray(
        parsedSavedJobs
      )
    ) {
      return [];
    }

    return parsedSavedJobs;
  } catch (storageError) {
    logError(
      "Reading saved jobs",
      storageError
    );

    return [];
  }
}

function saveSavedJobIds(
  savedJobIds
) {
  if (
    !Array.isArray(
      savedJobIds
    )
  ) {
    return false;
  }

  localStorage.setItem(
    SAVED_JOBS_KEY,
    JSON.stringify(
      savedJobIds
    )
  );

  window.dispatchEvent(
    new Event(
      "jobseekSavedJobsUpdated"
    )
  );

  return true;
}

function SavedJobs() {
  const [
    savedJobIds,
    setSavedJobIds
  ] = useState(
    getSavedJobIds
  );

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {
    function handleSavedJobsUpdate() {
      setSavedJobIds(
        getSavedJobIds()
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
  }, []);

  const allJobs = useMemo(() => {
    const postedJobs =
      getStoredJobs();

    const combinedJobs = [
      ...jobs,
      ...postedJobs
    ];

    const uniqueJobs = [];

    combinedJobs.forEach(
      (job) => {
        const alreadyExists =
          uniqueJobs.some(
            (existingJob) =>
              String(existingJob.id) ===
              String(job.id)
          );

        if (!alreadyExists) {
          uniqueJobs.push(job);
        }
      }
    );

    return uniqueJobs;
  }, []);

  const savedJobs = useMemo(() => {
    return allJobs.filter(
      (job) =>
        savedJobIds.some(
          (savedId) =>
            String(savedId) ===
            String(job.id)
        )
    );
  }, [
    allJobs,
    savedJobIds
  ]);

  function handleRemove(
    jobId
  ) {
    setError("");

    try {
      const updatedSavedJobs =
        savedJobIds.filter(
          (savedId) =>
            String(savedId) !==
            String(jobId)
        );

      const saved =
        saveSavedJobIds(
          updatedSavedJobs
        );

      if (!saved) {
        throw new Error(
          "Unable to update saved jobs."
        );
      }

      setSavedJobIds(
        updatedSavedJobs
      );
    } catch (storageError) {
      logError(
        "Removing saved job",
        storageError
      );

      setError(
        getErrorMessage(
          storageError,
          "Unable to remove this saved job."
        )
      );
    }
  }

  return (
    <main className="saved-jobs-page">
      <div className="saved-jobs-container">
        <div className="saved-jobs-header">
          <div>
            <span className="saved-jobs-label">
              JOB COLLECTION
            </span>

            <h1>
              Saved Jobs
            </h1>

            <p>
              Jobs you saved for later
            </p>
          </div>

          <span className="saved-jobs-count">
            {savedJobs.length} Saved
          </span>
        </div>

        {error && (
          <div className="saved-jobs-error">
            {error}
          </div>
        )}

        {savedJobs.length === 0 ? (
          <div className="saved-jobs-empty">
            <div className="saved-jobs-empty-icon">
              ♡
            </div>

            <h2>
              No saved jobs yet
            </h2>

            <p>
              Save interesting jobs and
              come back to them later.
            </p>

            <Link
              to="/jobs"
              className="browse-jobs-button"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="saved-jobs-list">
            {savedJobs.map(
              (job) => (
                <article
                  className="saved-job-card"
                  key={String(job.id)}
                >
                  <div className="saved-job-main">
                    <div className="saved-job-logo">
                      {job.company
                        ?.charAt(0)
                        .toUpperCase() ||
                        "J"}
                    </div>

                    <div className="saved-job-info">
                      <h2>
                        {job.title}
                      </h2>

                      <p className="saved-job-company">
                        {job.company}
                      </p>

                      <div className="saved-job-details">
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

                        {job.experience && (
                          <span>
                            🧑‍💻{" "}
                            {job.experience}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="saved-job-actions">
                    <Link
                      to={`/job/${job.id}`}
                      className="view-saved-job-button"
                    >
                      View Job
                    </Link>

                    <Link
                      to={`/job/${job.id}/apply`}
                      className="apply-saved-job-button"
                    >
                      Apply Now
                    </Link>

                    <button
                      type="button"
                      className="remove-saved-job-button"
                      onClick={() =>
                        handleRemove(
                          job.id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default SavedJobs;