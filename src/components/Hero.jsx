import "./Hero.css";

function Hero({
  keyword,
  setKeyword,
  handleSearch,
  handleClear,
  location,
  setLocation
}) {
  return (
    <section className="hero">
      <h1>Find Your Dream Job</h1>

      <p>Search for jobs by keyword and location</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Job title, skills, or keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button onClick={handleSearch}>
          Search Jobs
        </button>

        <button onClick={handleClear}>
          Clear
        </button>
      </div>
    </section>
  );
}

export default Hero;