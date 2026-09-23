import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  getJobById,
  updateJob
} from "../utils/jobStorage";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import LoadingSpinner from "../components/LoadingSpinner";

import "./EditJob.css";

function EditJob() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const [
    title,
    setTitle
  ] = useState("");

  const [
    company,
    setCompany
  ] = useState("");

  const [
    location,
    setLocation
  ] = useState("");

  const [
    salary,
    setSalary
  ] = useState("");

  const [
    experience,
    setExperience
  ] = useState("");

  const [
    jobType,
    setJobType
  ] = useState("Full Time");

  const [
    description,
    setDescription
  ] = useState("");

  const [
    skills,
    setSkills
  ] = useState("");

  const [
    requirements,
    setRequirements
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const [
    isSaving,
    setIsSaving
  ] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  function loadJob() {
    setError("");
    setIsLoading(true);

    try {
      if (
        currentUser?.role !==
        "recruiter"
      ) {
        setError(
          "Only recruiters can edit jobs."
        );

        return;
      }

      const job =
        getJobById(id);

      if (!job) {
        setError(
          "This job could not be found."
        );

        return;
      }

      const isOwner =
        String(
          job.recruiterId
        ) ===
          String(
            currentUser?.id
          ) ||
        job.recruiterEmail ===
          currentUser?.email;

      if (!isOwner) {
        setError(
          "You do not have permission to edit this job."
        );

        return;
      }

      setTitle(
        job.title || ""
      );

      setCompany(
        job.company || ""
      );

      setLocation(
        job.location || ""
      );

      setSalary(
        job.salary || ""
      );

      setExperience(
        job.experience || ""
      );

      setJobType(
        job.type ||
          job.jobType ||
          "Full Time"
      );

      setDescription(
        job.description || ""
      );

      setSkills(
        Array.isArray(
          job.skills
        )
          ? job.skills.join(
              ", "
            )
          : ""
      );

      setRequirements(
        Array.isArray(
          job.requirements
        )
          ? job.requirements.join(
              "\n"
            )
          : ""
      );
    } catch (loadError) {
      logError(
        "Loading job for editing",
        loadError
      );

      setError(
        getErrorMessage(
          loadError,
          "Something went wrong while loading this job."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");

    if (
      !title.trim() ||
      !company.trim() ||
      !location.trim() ||
      !salary.trim() ||
      !experience.trim() ||
      !description.trim() ||
      !skills.trim() ||
      !requirements.trim()
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }

    if (
      currentUser?.role !==
      "recruiter"
    ) {
      setError(
        "Only recruiters can edit jobs."
      );

      return;
    }

    try {
      setIsSaving(true);

      const existingJob =
        getJobById(id);

      if (!existingJob) {
        setError(
          "This job could not be found."
        );

        return;
      }

      const isOwner =
        String(
          existingJob.recruiterId
        ) ===
          String(
            currentUser?.id
          ) ||
        existingJob.recruiterEmail ===
          currentUser?.email;

      if (!isOwner) {
        setError(
          "You do not have permission to edit this job."
        );

        return;
      }

      const updatedJob = {
        title:
          title.trim(),

        company:
          company.trim(),

        location:
          location.trim(),

        salary:
          salary.trim(),

        experience:
          experience.trim(),

        type:
          jobType,

        description:
          description.trim(),

        skills:
          skills
            .split(",")
            .map(
              (skill) =>
                skill.trim()
            )
            .filter(
              (skill) =>
                skill
            ),

        requirements:
          requirements
            .split("\n")
            .map(
              (requirement) =>
                requirement.trim()
            )
            .filter(
              (requirement) =>
                requirement
            ),

        updatedAt:
          new Date().toISOString()
      };

      const savedJob =
        updateJob(
          id,
          updatedJob
        );

      if (!savedJob) {
        throw new Error(
          "Unable to update the job."
        );
      }

      navigate(
        "/recruiter",
        {
          state: {
            message:
              "Job updated successfully."
          }
        }
      );
    } catch (
      saveError
    ) {
      logError(
        "Updating job",
        saveError
      );

      setError(
        getErrorMessage(
          saveError,
          "Something went wrong while updating the job. Please try again."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="edit-job-page">
        <div className="edit-job-container">
          <LoadingSpinner
            message="Loading job details..."
          />
        </div>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="edit-job-page">
        <div className="edit-job-container">

          <Link
            to="/recruiter"
            className="edit-job-back-link"
          >
            ← Back to Dashboard
          </Link>

          <div className="edit-job-error-state">

            <div className="edit-job-error-icon">
              !
            </div>

            <span className="edit-job-section-label">
              EDIT JOB
            </span>

            <h1>
              Unable to edit this job
            </h1>

            <p>
              {error}
            </p>

            <Link
              to="/recruiter"
              className="edit-job-primary-button"
            >
              Back to Dashboard
            </Link>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="edit-job-page">

      <div className="edit-job-container">

        <Link
          to="/recruiter"
          className="edit-job-back-link"
        >
          ← Back to Dashboard
        </Link>

        <div className="edit-job-header">

          <div>

            <span className="edit-job-section-label">
              RECRUITER
            </span>

            <h1>
              Edit Job
            </h1>

            <p>
              Update your job posting and
              keep the information current
              for candidates.
            </p>

          </div>

        </div>

        <form
          className="edit-job-form"
          onSubmit={handleSubmit}
        >

          <section className="edit-job-card">

            <div className="edit-job-card-heading">

              <span className="edit-job-card-number">
                01
              </span>

              <div>

                <h2>
                  Job Information
                </h2>

                <p>
                  Update the basic details
                  about the position.
                </p>

              </div>

            </div>

            <div className="edit-job-grid">

              <div className="edit-job-field">

                <label htmlFor="edit-job-title">
                  Job Title
                  <span>*</span>
                </label>

                <input
                  id="edit-job-title"
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="edit-job-field">

                <label htmlFor="edit-company">
                  Company
                  <span>*</span>
                </label>

                <input
                  id="edit-company"
                  type="text"
                  placeholder="e.g. Tech Solutions"
                  value={company}
                  onChange={(event) =>
                    setCompany(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="edit-job-field">

                <label htmlFor="edit-location">
                  Location
                  <span>*</span>
                </label>

                <input
                  id="edit-location"
                  type="text"
                  placeholder="e.g. Pune, Maharashtra"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="edit-job-field">

                <label htmlFor="edit-salary">
                  Salary
                  <span>*</span>
                </label>

                <input
                  id="edit-salary"
                  type="text"
                  placeholder="e.g. ₹4–7 LPA"
                  value={salary}
                  onChange={(event) =>
                    setSalary(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="edit-job-field">

                <label htmlFor="edit-experience">
                  Experience
                  <span>*</span>
                </label>

                <input
                  id="edit-experience"
                  type="text"
                  placeholder="e.g. 0–2 Years"
                  value={experience}
                  onChange={(event) =>
                    setExperience(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="edit-job-field">

                <label htmlFor="edit-job-type">
                  Job Type
                  <span>*</span>
                </label>

                <select
                  id="edit-job-type"
                  value={jobType}
                  onChange={(event) =>
                    setJobType(
                      event.target.value
                    )
                  }
                >
                  <option value="Full Time">
                    Full Time
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                  <option value="Contract">
                    Contract
                  </option>
                </select>

              </div>

            </div>

          </section>

          <section className="edit-job-card">

            <div className="edit-job-card-heading">

              <span className="edit-job-card-number">
                02
              </span>

              <div>

                <h2>
                  Job Description
                </h2>

                <p>
                  Update the role description
                  and responsibilities.
                </p>

              </div>

            </div>

            <div className="edit-job-field">

              <label htmlFor="edit-description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="edit-description"
                rows="8"
                placeholder="Describe the role, responsibilities and what the candidate will be working on..."
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />

              <small>
                Keep the description clear
                and relevant to the position.
              </small>

            </div>

          </section>

          <section className="edit-job-card">

            <div className="edit-job-card-heading">

              <span className="edit-job-card-number">
                03
              </span>

              <div>

                <h2>
                  Skills & Requirements
                </h2>

                <p>
                  Update the skills and
                  qualifications candidates
                  should have.
                </p>

              </div>

            </div>

            <div className="edit-job-field">

              <label htmlFor="edit-skills">
                Required Skills
                <span>*</span>
              </label>

              <input
                id="edit-skills"
                type="text"
                placeholder="React, JavaScript, HTML, CSS"
                value={skills}
                onChange={(event) =>
                  setSkills(
                    event.target.value
                  )
                }
              />

              <small>
                Separate each skill with a comma.
              </small>

            </div>

            <div className="edit-job-field">

              <label htmlFor="edit-requirements">
                Requirements
                <span>*</span>
              </label>

              <textarea
                id="edit-requirements"
                rows="7"
                placeholder={`B.Tech in Computer Science
Good knowledge of JavaScript
Strong communication skills`}
                value={requirements}
                onChange={(event) =>
                  setRequirements(
                    event.target.value
                  )
                }
              />

              <small>
                Enter each requirement on a
                separate line.
              </small>

            </div>

          </section>

          {error && (
            <div className="edit-job-error-message">

              <span>
                !
              </span>

              {error}

            </div>
          )}

          <div className="edit-job-actions">

            <Link
              to="/recruiter"
              className="edit-job-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="edit-job-save-button"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default EditJob;