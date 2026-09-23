import { Link } from "react-router-dom";

import "./FeaturedJobs.css";

function FeaturedJobs({ jobs }) {
  return (
    <section className="featured-jobs">

      <div className="featured-header">
        <div>
          <h2>Featured Jobs</h2>
          <p>{jobs.length} jobs found</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <p className="no-jobs">
          No jobs found. Try another keyword or location.
        </p>
      ) : (
        <div className="job-list">

          {jobs.map((job) => (
            <Link
              to={`/job/${job.id}`}
              className="job-card"
              key={job.id}
            >

              <div className="company-logo">
                {job.company.charAt(0)}
              </div>

              <div className="job-card-content">

                <h3>{job.title}</h3>

                <p className="company-name">
                  {job.company}
                </p>

                <div className="job-info">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                  <span>💼 {job.experience}</span>
                </div>

                <div className="job-skills">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="skill-tag"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <span className="view-job">
                  View Job →
                </span>

              </div>

            </Link>
          ))}

        </div>
      )}

    </section>
  );
}

export default FeaturedJobs;