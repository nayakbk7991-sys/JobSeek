import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Link,
  useSearchParams
} from "react-router-dom";

import jobs from "../data/jobs";

import JobCard from "../components/JobCard";

import {
  getStoredJobs
} from "../utils/jobStorage";

import "./Jobs.css";

function getMinimumSalary(
  salaryText
) {
  if (!salaryText) {
    return 0;
  }

  const match =
    salaryText.match(
      /₹(\d+(?:\.\d+)?)/
    );

  if (!match) {
    return 0;
  }

  const value =
    Number(match[1]);

  if (
    salaryText
      .toLowerCase()
      .includes("k/month")
  ) {
    return (
      (value * 12) / 100
    );
  }

  return value;
}

function normalizeText(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
}

function normalizeJobType(
  value
) {
  return normalizeText(
    value
  )
    .replace(
      /[-_]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    );
}

function getExperienceRange(
  experienceText
) {
  const value =
    normalizeText(
      experienceText
    );

  if (
    value ===
    "fresher"
  ) {
    return {
      min: 0,
      max: 0
    };
  }

  if (
    value.includes("+")
  ) {
    const number =
      Number(
        value.match(
          /\d+/
        )?.[0] || 0
      );

    return {
      min: number,
      max: Infinity
    };
  }

  const numbers =
    value.match(
      /\d+/g
    );

  if (
    !numbers ||
    numbers.length < 2
  ) {
    return null;
  }

  return {
    min: Number(
      numbers[0]
    ),
    max: Number(
      numbers[1]
    )
  };
}

function matchesExperienceFilter(
  jobExperience,
  selectedExperience
) {
  if (
    !selectedExperience
  ) {
    return true;
  }

  const jobRange =
    getExperienceRange(
      jobExperience
    );

  const filterRange =
    getExperienceRange(
      selectedExperience
    );

  if (
    !jobRange ||
    !filterRange
  ) {
    return (
      normalizeText(
        jobExperience
      ) ===
      normalizeText(
        selectedExperience
      )
    );
  }

  return (
    jobRange.max >=
      filterRange.min &&
    jobRange.min <=
      filterRange.max
  );
}

function getJobDate(
  job
) {
  const dateValue =
    job.postedAt ||
    job.createdAt;

  if (!dateValue) {
    return null;
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
    return null;
  }

  return date;
}

function matchesPostedDate(
  job,
  postedWithin
) {
  if (!postedWithin) {
    return true;
  }

  const jobDate =
    getJobDate(job);

  if (!jobDate) {
    return false;
  }

  const now =
    new Date();

  const difference =
    now.getTime() -
    jobDate.getTime();

  const differenceInDays =
    difference /
    (1000 * 60 * 60 * 24);

  return (
    differenceInDays <=
      Number(postedWithin) &&
    differenceInDays >=
      0
  );
}

function Jobs() {
  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const [
    keyword,
    setKeyword
  ] = useState(
    searchParams.get(
      "keyword"
    ) || ""
  );

  const [
    location,
    setLocation
  ] = useState(
    searchParams.get(
      "location"
    ) || ""
  );

  const [
    showLocationSuggestions,
    setShowLocationSuggestions
  ] = useState(false);

  const [
    selectedLocationIndex,
    setSelectedLocationIndex
  ] = useState(-1);

  const [
    jobType,
    setJobType
  ] = useState(
    searchParams.get(
      "type"
    ) || ""
  );

  const [
    experience,
    setExperience
  ] = useState(
    searchParams.get(
      "experience"
    ) || ""
  );

  const [
    salary,
    setSalary
  ] = useState(
    searchParams.get(
      "salary"
    ) || ""
  );

  const [
    postedWithin,
    setPostedWithin
  ] = useState(
    searchParams.get(
      "posted"
    ) || ""
  );

  const [
    sortBy,
    setSortBy
  ] = useState(
    searchParams.get(
      "sort"
    ) || ""
  );

  const [
    postedJobs,
    setPostedJobs
  ] = useState([]);

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  function loadPostedJobs() {
    try {
      setIsLoading(true);

      const storedJobs =
        getStoredJobs();

      setPostedJobs(
        storedJobs
      );
    } catch {
      setPostedJobs([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPostedJobs();

    function handleJobsUpdated() {
      loadPostedJobs();
    }

    window.addEventListener(
      "jobseekJobsUpdated",
      handleJobsUpdated
    );

    return () => {
      window.removeEventListener(
        "jobseekJobsUpdated",
        handleJobsUpdated
      );
    };
  }, []);

  const allJobs = useMemo(
    () => [
      ...jobs,
      ...postedJobs
    ],
    [postedJobs]
  );

  const locationOptions =
    useMemo(() => {
      const locations =
        allJobs
          .map(
            (job) =>
              job.location
          )
          .filter(Boolean);

      return [
        ...new Set(
          locations
        )
      ].sort();
    }, [allJobs]);

  const filteredLocationOptions =
    useMemo(() => {
      const searchValue =
        normalizeText(
          location
        );

      if (!searchValue) {
        return locationOptions;
      }

      return locationOptions.filter(
        (item) =>
          normalizeText(
            item
          ).includes(
            searchValue
          )
      );
    }, [
      location,
      locationOptions
    ]);

  const filteredJobs =
    useMemo(() => {
      const searchValue =
        normalizeText(
          keyword
        );

      const selectedLocation =
        normalizeText(
          location
        );

      const result =
        allJobs.filter(
          (job) => {
            const searchableText =
              [
                job.title,
                job.company,
                job.location,
                job.description,
                ...(Array.isArray(
                  job.skills
                )
                  ? job.skills
                  : []),
                ...(Array.isArray(
                  job.requirements
                )
                  ? job.requirements
                  : []),
                job.experience,
                job.type ||
                  job.jobType
              ]
                .filter(Boolean)
                .join(" ");

            const matchesKeyword =
              !searchValue ||
              normalizeText(
                searchableText
              ).includes(
                searchValue
              );

            const matchesLocation =
              !selectedLocation ||
              normalizeText(
                job.location
              ).includes(
                selectedLocation
              );

            const matchesJobType =
              !jobType ||
              normalizeJobType(
                job.type ||
                  job.jobType
              ) ===
                normalizeJobType(
                  jobType
                );

            const matchesExperience =
              matchesExperienceFilter(
                job.experience,
                experience
              );

            const matchesSalary =
              !salary ||
              getMinimumSalary(
                job.salary
              ) >=
                Number(salary);

            const matchesDate =
              matchesPostedDate(
                job,
                postedWithin
              );

            return (
              matchesKeyword &&
              matchesLocation &&
              matchesJobType &&
              matchesExperience &&
              matchesSalary &&
              matchesDate
            );
          }
        );

      if (
        sortBy ===
        "newest"
      ) {
        return [
          ...result
        ].sort(
          (a, b) => {
            const dateA =
              getJobDate(a);

            const dateB =
              getJobDate(b);

            if (
              !dateA &&
              !dateB
            ) {
              return 0;
            }

            if (!dateA) {
              return 1;
            }

            if (!dateB) {
              return -1;
            }

            return (
              dateB.getTime() -
              dateA.getTime()
            );
          }
        );
      }

      if (
        sortBy ===
        "salary-low"
      ) {
        return [
          ...result
        ].sort(
          (a, b) =>
            getMinimumSalary(
              a.salary
            ) -
            getMinimumSalary(
              b.salary
            )
        );
      }

      if (
        sortBy ===
        "salary-high"
      ) {
        return [
          ...result
        ].sort(
          (a, b) =>
            getMinimumSalary(
              b.salary
            ) -
            getMinimumSalary(
              a.salary
            )
        );
      }

      if (
        sortBy ===
        "title"
      ) {
        return [
          ...result
        ].sort(
          (a, b) =>
            String(
              a.title || ""
            ).localeCompare(
              String(
                b.title || ""
              )
            )
        );
      }

      return result;
    }, [
      allJobs,
      keyword,
      location,
      jobType,
      experience,
      salary,
      postedWithin,
      sortBy
    ]);

  function updateSearchParams(
    values
  ) {
    const params =
      new URLSearchParams(
        searchParams
      );

    Object.entries(
      values
    ).forEach(
      ([
        key,
        value
      ]) => {
        if (
          value ===
            undefined ||
          value ===
            null ||
          value === ""
        ) {
          params.delete(
            key
          );
        } else {
          params.set(
            key,
            value
          );
        }
      }
    );

    setSearchParams(
      params
    );
  }

  function handleSearch(
    event
  ) {
    event.preventDefault();

    updateSearchParams({
      keyword:
        keyword.trim(),
      location:
        location.trim(),
      type: jobType,
      experience,
      salary,
      posted:
        postedWithin,
      sort: sortBy
    });

    setShowLocationSuggestions(
      false
    );
  }

  function handleLocationChange(
    value
  ) {
    setLocation(
      value
    );

    setSelectedLocationIndex(
      -1
    );

    setShowLocationSuggestions(
      true
    );
  }

  function handleLocationKeyDown(
    event
  ) {
    if (
      !showLocationSuggestions ||
      filteredLocationOptions.length ===
        0
    ) {
      if (
        event.key ===
        "Enter"
      ) {
        return;
      }

      return;
    }

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      setSelectedLocationIndex(
        (current) =>
          current <
          filteredLocationOptions.length -
            1
            ? current + 1
            : 0
      );
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      setSelectedLocationIndex(
        (current) =>
          current > 0
            ? current - 1
            : filteredLocationOptions.length -
              1
      );
    }

    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      const selected =
        filteredLocationOptions[
          selectedLocationIndex
        ];

      if (selected) {
        setLocation(
          selected
        );
      }

      setShowLocationSuggestions(
        false
      );

      setSelectedLocationIndex(
        -1
      );
    }

    if (
      event.key ===
      "Escape"
    ) {
      setShowLocationSuggestions(
        false
      );

      setSelectedLocationIndex(
        -1
      );
    }
  }

  function handleLocationSelect(
    selectedLocation
  ) {
    setLocation(
      selectedLocation
    );

    setShowLocationSuggestions(
      false
    );

    setSelectedLocationIndex(
      -1
    );
  }

  function handleClearFilters() {
    setKeyword("");
    setLocation("");
    setJobType("");
    setExperience("");
    setSalary("");
    setPostedWithin("");
    setSortBy("");

    setSearchParams(
      {}
    );

    setShowLocationSuggestions(
      false
    );
  }

  function removeFilter(
    filterName
  ) {
    const params =
      new URLSearchParams(
        searchParams
      );

    params.delete(
      filterName
    );

    setSearchParams(
      params
    );

    if (
      filterName ===
      "keyword"
    ) {
      setKeyword("");
    }

    if (
      filterName ===
      "location"
    ) {
      setLocation("");
    }

    if (
      filterName ===
      "type"
    ) {
      setJobType("");
    }

    if (
      filterName ===
      "experience"
    ) {
      setExperience("");
    }

    if (
      filterName ===
      "salary"
    ) {
      setSalary("");
    }

    if (
      filterName ===
      "posted"
    ) {
      setPostedWithin("");
    }

    if (
      filterName ===
      "sort"
    ) {
      setSortBy("");
    }
  }

  return (
    <main className="jobs-page">

      <div className="jobs-container">

        <section className="jobs-header">

          <div>

            <h1>
              Find Jobs
            </h1>

            <p>
              Search and filter
              jobs that match
              your skills and
              career goals.
            </p>

          </div>

        </section>

        <section className="jobs-search-card">

          <form
            className="jobs-search-form"
            onSubmit={
              handleSearch
            }
          >

            <div className="jobs-search-field">

              <label>
                Keyword
              </label>

              <input
                type="text"
                value={
                  keyword
                }
                onChange={
                  (event) =>
                    setKeyword(
                      event.target
                        .value
                    )
                }
                placeholder="Job title, skills or company"
              />

            </div>

            <div className="jobs-search-field jobs-location-field">

              <label>
                Location
              </label>

              <input
                type="text"
                value={
                  location
                }
                onChange={
                  (event) =>
                    handleLocationChange(
                      event.target
                        .value
                    )
                }
                onFocus={() =>
                  setShowLocationSuggestions(
                    true
                  )
                }
                onKeyDown={
                  handleLocationKeyDown
                }
                placeholder="City or location"
                autoComplete="off"
              />

              {showLocationSuggestions &&
                filteredLocationOptions.length >
                  0 && (
                  <div className="jobs-location-suggestions">

                    {filteredLocationOptions.map(
                      (
                        item,
                        index
                      ) => (
                        <button
                          key={
                            item
                          }
                          type="button"
                          className={
                            index ===
                            selectedLocationIndex
                              ? "jobs-location-option selected"
                              : "jobs-location-option"
                          }
                          onMouseDown={
                            (
                              event
                            ) =>
                              event.preventDefault()
                          }
                          onClick={() =>
                            handleLocationSelect(
                              item
                            )
                          }
                        >
                          {
                            item
                          }
                        </button>
                      )
                    )}

                  </div>
                )}

            </div>

            <button
              type="submit"
              className="jobs-search-button"
            >
              Search Jobs
            </button>

          </form>

        </section>

        {(keyword.trim() ||
          location.trim() ||
          jobType ||
          experience ||
          salary ||
          postedWithin ||
          sortBy) && (
          <section className="jobs-active-filters">

            <div className="jobs-active-filters-header">

              <strong>
                Active Filters
              </strong>

              <button
                type="button"
                onClick={
                  handleClearFilters
                }
              >
                Clear All
              </button>

            </div>

            <div className="jobs-active-filter-list">

              {keyword.trim() && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "keyword"
                    )
                  }
                >
                  Keyword:{" "}
                  {keyword}

                  <span>
                    ×
                  </span>
                </button>
              )}

              {location.trim() && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "location"
                    )
                  }
                >
                  Location:{" "}
                  {location}

                  <span>
                    ×
                  </span>
                </button>
              )}

              {jobType && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "type"
                    )
                  }
                >
                  {jobType}

                  <span>
                    ×
                  </span>
                </button>
              )}

              {experience && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "experience"
                    )
                  }
                >
                  {experience}

                  <span>
                    ×
                  </span>
                </button>
              )}

              {salary && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "salary"
                    )
                  }
                >
                  ₹{salary} LPA+

                  <span>
                    ×
                  </span>
                </button>
              )}

              {postedWithin && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "posted"
                    )
                  }
                >
                  {postedWithin ===
                  "1"
                    ? "Today"
                    : `Last ${postedWithin} Days`}

                  <span>
                    ×
                  </span>
                </button>
              )}

              {sortBy && (
                <button
                  type="button"
                  className="jobs-filter-chip"
                  onClick={() =>
                    removeFilter(
                      "sort"
                    )
                  }
                >
                  {sortBy ===
                  "newest"
                    ? "Newest"
                    : sortBy ===
                      "salary-low"
                    ? "Salary: Low to High"
                    : sortBy ===
                      "salary-high"
                    ? "Salary: High to Low"
                    : "Job Title: A to Z"}

                  <span>
                    ×
                  </span>
                </button>
              )}

            </div>

          </section>
        )}

        <section className="jobs-filter-section">

          <div className="jobs-filter-header">

            <div>

              <h2>
                Filter Jobs
              </h2>

              <p>
                Refine your search
                to find relevant
                opportunities.
              </p>

            </div>

            <button
              type="button"
              className="jobs-clear-button"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>

          </div>

          <div className="jobs-filter-grid">

            <div className="jobs-filter-field">

              <label>
                Job Type
              </label>

              <select
                value={
                  jobType
                }
                onChange={
                  (event) => {
                    const value =
                      event.target
                        .value;

                    setJobType(
                      value
                    );

                    updateSearchParams({
                      type: value
                    });
                  }
                }
              >
                <option value="">
                  All Job Types
                </option>

                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>

              </select>

            </div>

            <div className="jobs-filter-field">

              <label>
                Experience
              </label>

              <select
                value={
                  experience
                }
                onChange={
                  (event) => {
                    const value =
                      event.target
                        .value;

                    setExperience(
                      value
                    );

                    updateSearchParams({
                      experience:
                        value
                    });
                  }
                }
              >
                <option value="">
                  All Experience
                </option>

                <option value="Fresher">
                  Fresher
                </option>

                <option value="0–1">
                  0–1 years
                </option>

                <option value="0–2">
                  0–2 years
                </option>

                <option value="1–3">
                  1–3 years
                </option>

                <option value="3–5">
                  3–5 years
                </option>

                <option value="5+">
                  5+ years
                </option>

              </select>

            </div>

            <div className="jobs-filter-field">

              <label>
                Minimum Salary
              </label>

              <select
                value={
                  salary
                }
                onChange={
                  (event) => {
                    const value =
                      event.target
                        .value;

                    setSalary(
                      value
                    );

                    updateSearchParams({
                      salary: value
                    });
                  }
                }
              >
                <option value="">
                  Any Salary
                </option>

                <option value="3">
                  ₹3 LPA+
                </option>

                <option value="4">
                  ₹4 LPA+
                </option>

                <option value="5">
                  ₹5 LPA+
                </option>

                <option value="6">
                  ₹6 LPA+
                </option>

                <option value="8">
                  ₹8 LPA+
                </option>

                <option value="10">
                  ₹10 LPA+
                </option>

              </select>

            </div>

            <div className="jobs-filter-field">

              <label>
                Date Posted
              </label>

              <select
                value={
                  postedWithin
                }
                onChange={
                  (event) => {
                    const value =
                      event.target
                        .value;

                    setPostedWithin(
                      value
                    );

                    updateSearchParams({
                      posted:
                        value
                    });
                  }
                }
              >
                <option value="">
                  Any Time
                </option>

                <option value="1">
                  Today
                </option>

                <option value="3">
                  Last 3 Days
                </option>

                <option value="7">
                  Last 7 Days
                </option>

                <option value="30">
                  Last 30 Days
                </option>

              </select>

            </div>

            <div className="jobs-filter-field">

              <label>
                Sort By
              </label>

              <select
                value={
                  sortBy
                }
                onChange={
                  (event) => {
                    const value =
                      event.target
                        .value;

                    setSortBy(
                      value
                    );

                    updateSearchParams({
                      sort: value
                    });
                  }
                }
              >
                <option value="">
                  Recommended
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="salary-low">
                  Salary: Low to High
                </option>

                <option value="salary-high">
                  Salary: High to Low
                </option>

                <option value="title">
                  Job Title: A to Z
                </option>

              </select>

            </div>

          </div>

        </section>

        <section className="jobs-results-section">

          <div className="jobs-results-header">

            <div>

              <h2>
                Available Jobs
              </h2>

              {!isLoading && (
                <p>
                  {filteredJobs.length}{" "}
                  {filteredJobs.length ===
                  1
                    ? "job"
                    : "jobs"}{" "}
                  found
                </p>
              )}

            </div>

          </div>

          {isLoading ? (
            <div className="jobs-loading-state">

              <div className="jobs-loading-spinner"></div>

              <h3>
                Loading jobs...
              </h3>

              <p>
                Please wait while we
                load available
                opportunities.
              </p>

            </div>
          ) : filteredJobs.length >
            0 ? (
            <div className="jobs-list">

              {filteredJobs.map(
                (job) => (
                  <JobCard
                    key={`${job.id}-${job.recruiterId || "static"}`}
                    job={job}
                  />
                )
              )}

            </div>
          ) : (
            <div className="jobs-empty-state">

              <div className="jobs-empty-icon">
                🔍
              </div>

              <h3>
                No jobs found
              </h3>

              <p>
                Try changing your
                search keyword or
                removing some
                filters.
              </p>

              <button
                type="button"
                onClick={
                  handleClearFilters
                }
              >
                Clear All Filters
              </button>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default Jobs;