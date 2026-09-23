const APPLICATIONS_KEY =
  "applications";

function normalizeApplications(
  applications
) {
  if (
    !Array.isArray(
      applications
    )
  ) {
    return [];
  }

  return applications.filter(
    (application) =>
      application &&
      typeof application ===
        "object" &&
      application.id !==
        undefined
  );
}

export function getApplications() {
  const storedApplications =
    localStorage.getItem(
      APPLICATIONS_KEY
    );

  if (!storedApplications) {
    return [];
  }

  try {
    const parsedApplications =
      JSON.parse(
        storedApplications
      );

    return normalizeApplications(
      parsedApplications
    );
  } catch {
    return [];
  }
}

export function saveApplications(
  applications
) {
  const validApplications =
    normalizeApplications(
      applications
    );

  localStorage.setItem(
    APPLICATIONS_KEY,
    JSON.stringify(
      validApplications
    )
  );

  window.dispatchEvent(
    new Event(
      "jobseekApplicationsUpdated"
    )
  );
}

export function addApplication(
  application
) {
  if (
    !application ||
    typeof application !==
      "object" ||
    application.id ===
      undefined
  ) {
    return null;
  }

  const existingApplications =
    getApplications();

  const updatedApplications = [
    ...existingApplications,
    application
  ];

  saveApplications(
    updatedApplications
  );

  return application;
}

export function updateApplication(
  applicationId,
  updatedApplication
) {
  const existingApplications =
    getApplications();

  const updatedApplications =
    existingApplications.map(
      (application) =>
        String(
          application.id
        ) ===
        String(
          applicationId
        )
          ? {
              ...application,
              ...updatedApplication
            }
          : application
    );

  saveApplications(
    updatedApplications
  );

  return (
    updatedApplications.find(
      (application) =>
        String(
          application.id
        ) ===
        String(
          applicationId
        )
    ) || null
  );
}

export function deleteApplication(
  applicationId
) {
  const existingApplications =
    getApplications();

  const updatedApplications =
    existingApplications.filter(
      (application) =>
        String(
          application.id
        ) !==
        String(
          applicationId
        )
    );

  saveApplications(
    updatedApplications
  );

  return updatedApplications;
}

export function getApplicationById(
  applicationId
) {
  const existingApplications =
    getApplications();

  return (
    existingApplications.find(
      (application) =>
        String(
          application.id
        ) ===
        String(
          applicationId
        )
    ) || null
  );
}