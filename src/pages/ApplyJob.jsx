import {
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
  saveResume
} from "../utils/resumeStorage";

import {
  getApplications,
  addApplication
} from "../utils/applicationStorage";

import {
  getStoredJobs
} from "../utils/jobStorage";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import "./ApplyJob.css";

function ApplyJob() {
  const { id } = useParams();

  const navigate = useNavigate();

  const currentUser =
    getCurrentUser();

  const [resume, setResume] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const job = useMemo(() => {
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

  const applications =
    getApplications();

  const alreadyApplied =
    applications.some(
      (application) =>
        String(application.jobId) ===
          String(id) &&
        application.userEmail ===
          currentUser?.email
    );

  function handleResumeChange(event) {
    setError("");
    setMessage("");

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      setResume(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx"
    ];

    const fileName =
      selectedFile.name.toLowerCase();

    const hasValidExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(
            extension
          )
      );

    if (
      !allowedTypes.includes(
        selectedFile.type
      ) &&
      !hasValidExtension
    ) {
      setResume(null);

      setError(
        "Please upload a PDF, DOC or DOCX file."
      );

      event.target.value = "";

      return;
    }

    const maximumFileSize =
      5 * 1024 * 1024;

    if (
      selectedFile.size >
      maximumFileSize
    ) {
      setResume(null);

      setError(
        "Resume size must be 5 MB or less."
      );

      event.target.value = "";

      return;
    }

    setResume(
      selectedFile
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!currentUser) {
      navigate(
        "/login",
        {
          state: {
            from: {
              pathname:
                `/job/${id}/apply`
            }
          }
        }
      );

      return;
    }

    if (
      currentUser.role !==
      "jobSeeker"
    ) {
      setError(
        "Only job seekers can apply for jobs."
      );

      return;
    }

    if (!job) {
      setError(
        "This job is no longer available."
      );

      return;
    }

    const latestApplications =
      getApplications();

    const hasAlreadyApplied =
      latestApplications.some(
        (application) =>
          String(
            application.jobId
          ) ===
            String(job.id) &&
          application.userEmail ===
            currentUser.email
      );

    if (hasAlreadyApplied) {
      setError(
        "You have already applied for this job."
      );

      return;
    }

    if (!resume) {
      setError(
        "Please upload your resume before applying."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const resumeId =
        await saveResume(
          resume
        );

      const applicationDate =
        new Date().toISOString();

      const newApplication = {
        id: Date.now(),

        jobId:
          job.id,

        jobTitle:
          job.title,

        company:
          job.company,

        location:
          job.location,

        salary:
          job.salary,

        experience:
          job.experience,

        jobType:
          job.type ||
          job.jobType ||
          "",

        userEmail:
          currentUser.email,

        userName:
          currentUser.name ||
          "",

        resumeId,

        resumeType:
          resume.type ||
          "",

        resumeName:
          resume.name ||
          "",

        status:
          "Applied",

        appliedAt:
          applicationDate,

        statusUpdatedAt:
          applicationDate,

        statusHistory: [
          {
            status:
              "Applied",

            date:
              applicationDate
          }
        ]
      };

      const savedApplication =
        addApplication(
          newApplication
        );

      if (!savedApplication) {
        setError(
          "Unable to save your application. Please try again."
        );

        return;
      }

      setMessage(
        "Application submitted successfully."
      );

      setTimeout(() => {
        navigate(
          "/applications"
        );
      }, 800);
    } catch (
      submissionError
    ) {
      logError(
        "Submitting job application",
        submissionError
      );

      setError(
        getErrorMessage(
          submissionError,
          "Something went wrong while submitting your application. Please try again."
        )
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  if (!job) {
    return (
      <main className="apply-job-page">
        <div className="apply-job-container">
          <div className="apply-not-found">
            <div className="apply-not-found-icon">
              🔎
            </div>

            <span className="apply-section-label">
              JOB NOT FOUND
            </span>

            <h1>
              This job is no longer available
            </h1>

            <p>
              The job may have been removed
              or may not exist.
            </p>

            <Link
              to="/jobs"
              className="apply-primary-button"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (alreadyApplied) {
    return (
      <main className="apply-job-page">
        <div className="apply-job-container">
          <Link
            to={`/job/${job.id}`}
            className="apply-back-link"
          >
            ← Back to Job
          </Link>

          <div className="already-applied-page">
            <div className="already-applied-icon">
              ✓
            </div>

            <span className="apply-section-label">
              APPLICATION STATUS
            </span>

            <h1>
              You already applied
            </h1>

            <p>
              Your application for{" "}
              <strong>
                {job.title}
              </strong>{" "}
              at{" "}
              <strong>
                {job.company}
              </strong>{" "}
              has already been submitted.
            </p>

            <div className="already-applied-actions">
              <Link
                to="/applications"
                className="apply-primary-button"
              >
                View My Applications
              </Link>

              <Link
                to={`/job/${job.id}`}
                className="apply-secondary-button"
              >
                View Job
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
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

  return (
    <main className="apply-job-page">
      <div className="apply-job-container">
        <Link
          to={`/job/${job.id}`}
          className="apply-back-link"
        >
          ← Back to Job
        </Link>

        <div className="apply-job-layout">
          <section className="apply-form-section">
            <div className="apply-form-heading">
              <span className="apply-section-label">
                APPLICATION
              </span>

              <h1>
                Apply for this position
              </h1>

              <p>
                Complete your application and
                upload your latest resume.
              </p>
            </div>

            <form
              className="apply-form"
              onSubmit={handleSubmit}
            >
              <div className="apply-form-card">
                <div className="apply-card-heading">
                  <h2>
                    Applicant Information
                  </h2>

                  <p>
                    Your account information
                    will be included with the
                    application.
                  </p>
                </div>

                <div className="applicant-info-grid">
                  <div className="applicant-info-item">
                    <span>
                      Full Name
                    </span>

                    <strong>
                      {currentUser?.name ||
                        "Not available"}
                    </strong>
                  </div>

                  <div className="applicant-info-item">
                    <span>
                      Email
                    </span>

                    <strong>
                      {currentUser?.email ||
                        "Not available"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="apply-form-card">
                <div className="apply-card-heading">
                  <h2>
                    Resume
                  </h2>

                  <p>
                    Upload the resume you want
                    employers to review.
                  </p>
                </div>

                <label
                  htmlFor="resume"
                  className="resume-upload-area"
                >
                  <span className="resume-upload-icon">
                    📄
                  </span>

                  <span className="resume-upload-title">
                    {resume
                      ? resume.name
                      : "Choose your resume"}
                  </span>

                  <span className="resume-upload-description">
                    {resume
                      ? `${(
                          resume.size /
                          1024 /
                          1024
                        ).toFixed(2)} MB`
                      : "PDF, DOC or DOCX • Maximum 5 MB"}
                  </span>

                  <span className="resume-upload-button">
                    {resume
                      ? "Choose Another File"
                      : "Select Resume"}
                  </span>

                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={
                      handleResumeChange
                    }
                  />
                </label>
              </div>

              {error && (
                <div className="apply-message apply-error">
                  {error}
                </div>
              )}

              {message && (
                <div className="apply-message apply-success">
                  {message}
                </div>
              )}

              <div className="apply-form-actions">
                <Link
                  to={`/job/${job.id}`}
                  className="apply-secondary-button"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="apply-submit-button"
                  disabled={
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Application"}
                </button>
              </div>
            </form>
          </section>

          <aside className="apply-job-sidebar">
            <div className="apply-job-summary">
              <div className="apply-company-logo">
                {companyInitial}
              </div>

              <span className="apply-section-label">
                APPLYING TO
              </span>

              <h2>
                {job.title}
              </h2>

              <p className="apply-company-name">
                {job.company}
              </p>

              <div className="apply-job-details">
                {job.location && (
                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {job.location}
                    </strong>
                  </div>
                )}

                {job.salary && (
                  <div>
                    <span>
                      Salary
                    </span>

                    <strong>
                      {job.salary}
                    </strong>
                  </div>
                )}

                {job.experience && (
                  <div>
                    <span>
                      Experience
                    </span>

                    <strong>
                      {job.experience}
                    </strong>
                  </div>
                )}

                {jobType && (
                  <div>
                    <span>
                      Job Type
                    </span>

                    <strong>
                      {jobType}
                    </strong>
                  </div>
                )}
              </div>

              <Link
                to={`/job/${job.id}`}
                className="view-job-details-link"
              >
                View Full Job Details →
              </Link>
            </div>

            <div className="apply-tips-card">
              <h3>
                Before you apply
              </h3>

              <ul>
                <li>
                  Make sure your resume is
                  up to date.
                </li>

                <li>
                  Use a professional file name
                  for your resume.
                </li>

                <li>
                  Check that your resume is
                  readable and complete.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ApplyJob;