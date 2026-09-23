const JOBS_KEY =
  "jobseekJobs";

function normalizeJobs(
  jobs
) {
  if (
    !Array.isArray(jobs)
  ) {
    return [];
  }

  return jobs.filter(
    (job) =>
      job &&
      typeof job ===
        "object" &&
      job.id !== undefined
  );
}

export function getStoredJobs() {
  const storedJobs =
    localStorage.getItem(
      JOBS_KEY
    );

  if (!storedJobs) {
    return [];
  }

  try {
    const parsedJobs =
      JSON.parse(
        storedJobs
      );

    return normalizeJobs(
      parsedJobs
    );
  } catch {
    return [];
  }
}

export function saveJobs(
  jobs
) {
  const validJobs =
    normalizeJobs(
      jobs
    );

  localStorage.setItem(
    JOBS_KEY,
    JSON.stringify(
      validJobs
    )
  );

  window.dispatchEvent(
    new Event(
      "jobseekJobsUpdated"
    )
  );
}

export function addJob(
  job
) {
  if (
    !job ||
    typeof job !==
      "object" ||
    job.id === undefined
  ) {
    return null;
  }

  const existingJobs =
    getStoredJobs();

  const updatedJobs = [
    ...existingJobs,
    job
  ];

  saveJobs(
    updatedJobs
  );

  return job;
}

export function updateJob(
  jobId,
  updatedJob
) {
  const existingJobs =
    getStoredJobs();

  const updatedJobs =
    existingJobs.map(
      (job) =>
        String(job.id) ===
        String(jobId)
          ? {
              ...job,
              ...updatedJob
            }
          : job
    );

  saveJobs(
    updatedJobs
  );

  return updatedJobs.find(
    (job) =>
      String(job.id) ===
      String(jobId)
  ) || null;
}

export function deleteJob(
  jobId
) {
  const existingJobs =
    getStoredJobs();

  const updatedJobs =
    existingJobs.filter(
      (job) =>
        String(job.id) !==
        String(jobId)
    );

  saveJobs(
    updatedJobs
  );

  return updatedJobs;
}

export function getJobById(
  jobId
) {
  const existingJobs =
    getStoredJobs();

  return (
    existingJobs.find(
      (job) =>
        String(job.id) ===
        String(jobId)
    ) || null
  );
}