const ReportFilters = ({
  threatLevel,
  sortBy,
  onThreatLevelChange,
  onSortByChange,
  threatLevelOptions,
  onReset,
}) => {
  const isActive = threatLevel !== '' || sortBy !== 'recent'

  return (
    <div className="incident-filter-grid">
      <div className="incident-control">
        <label className="incident-control__label" htmlFor="threat-level">
          Threat Level
        </label>
        <select
          id="threat-level"
          value={threatLevel}
          onChange={(e) => onThreatLevelChange(e.target.value)}
          className="incident-filter-select"
        >
          <option value="">All levels</option>
          {threatLevelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="incident-control">
        <label className="incident-control__label" htmlFor="sort-by">
          Sort By
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="incident-filter-select"
        >
          <option value="recent">Most Recent</option>
          <option value="threat">Highest Threat</option>
        </select>
      </div>

      {isActive ? (
        <button
          onClick={onReset}
          className="incident-secondary-button"
          style={{ marginTop: 'auto' }}
          title="Reset filters"
        >
          ✕ Reset
        </button>
      ) : null}
    </div>
  )
}

export default ReportFilters
