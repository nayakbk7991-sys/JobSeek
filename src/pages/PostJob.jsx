import {
  useState
} from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  addJob
} from "../utils/jobStorage";

import {
  getCurrentUser
} from "../utils/authStorage";

import {
  getErrorMessage,
  logError
} from "../utils/errorHandler";

import "./PostJob.css";

function PostJob() {
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
    isSubmitting,
    setIsSubmitting
  ] = useState(false);

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
        "Only recruiters can post jobs."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const now =
        new Date().toISOString();

      const newJob = {
        id: Date.now(),

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

        recruiterId:
          currentUser.id ||
          null,

        recruiterEmail:
          currentUser.email,

        postedAt:
          now,

        createdAt:
          now,

        updatedAt:
          now
      };

      const savedJob =
        addJob(newJob);

      if (!savedJob) {
        throw new Error(
          "Unable to save the job posting."
        );
      }

      navigate(
        "/recruiter",
        {
          state: {
            message:
              "Job posted successfully."
          }
        }
      );
    } catch (
      submissionError
    ) {
      logError(
        "Posting job",
        submissionError
      );

      setError(
        getErrorMessage(
          submissionError,
          "Something went wrong while posting the job. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="post-job-page">

      <div className="post-job-container">

        <Link
          to="/recruiter"
          className="post-job-back-link"
        >
          ← Back to Dashboard
        </Link>

        <div className="post-job-header">
          <div>

            <span className="post-job-section-label">
              RECRUITER
            </span>

            <h1>
              Post a New Job
            </h1>

            <p>
              Create a detailed job posting
              to attract qualified candidates.
            </p>

          </div>
        </div>

        <form
          className="post-job-form"
          onSubmit={handleSubmit}
        >

          <section className="post-job-card">

            <div className="post-job-card-heading">

              <span className="post-job-card-number">
                01
              </span>

              <div>
                <h2>
                  Job Information
                </h2>

                <p>
                  Provide the basic details
                  about the position.
                </p>
              </div>

            </div>

            <div className="post-job-grid">

              <div className="post-job-field">

                <label htmlFor="job-title">
                  Job Title
                  <span>*</span>
                </label>

                <input
                  id="job-title"
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

              <div className="post-job-field">

                <label htmlFor="company">
                  Company
                  <span>*</span>
                </label>

                <input
                  id="company"
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

              <div className="post-job-field">

                <label htmlFor="location">
                  Location
                  <span>*</span>
                </label>

                <input
                  id="location"
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

              <div className="post-job-field">

                <label htmlFor="salary">
                  Salary
                  <span>*</span>
                </label>

                <input
                  id="salary"
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

              <div className="post-job-field">

                <label htmlFor="experience">
                  Experience
                  <span>*</span>
                </label>

                <input
                  id="experience"
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

              <div className="post-job-field">

                <label htmlFor="job-type">
                  Job Type
                  <span>*</span>
                </label>

                <select
                  id="job-type"
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

          <section className="post-job-card">

            <div className="post-job-card-heading">

              <span className="post-job-card-number">
                02
              </span>

              <div>
                <h2>
                  Job Description
                </h2>

                <p>
                  Explain the role and what
                  the successful candidate
                  will work on.
                </p>
              </div>

            </div>

            <div className="post-job-field">

              <label htmlFor="description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="description"
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
                Give candidates a clear
                understanding of the position.
              </small>

            </div>

          </section>

          <section className="post-job-card">

            <div className="post-job-card-heading">

              <span className="post-job-card-number">
                03
              </span>

              <div>
                <h2>
                  Skills & Requirements
                </h2>

                <p>
                  Specify the skills and
                  qualifications candidates
                  should have.
                </p>
              </div>

            </div>

            <div className="post-job-field">

              <label htmlFor="skills">
                Required Skills
                <span>*</span>
              </label>

              <input
                id="skills"
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

            <div className="post-job-field">

              <label htmlFor="requirements">
                Requirements
                <span>*</span>
              </label>

              <textarea
                id="requirements"
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
            <div className="post-job-error">

              <span>
                !
              </span>

              {error}

            </div>
          )}

          <div className="post-job-actions">

            <Link
              to="/recruiter"
              className="post-job-cancel-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="post-job-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Posting Job..."
                : "Post Job"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default PostJob;