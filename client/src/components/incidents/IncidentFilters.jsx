const IncidentFilters = ({
  severity,
  status,
  source,
  onSeverityChange,
  onStatusChange,
  onSourceChange,
  severityOptions,
  statusOptions,
  sourceOptions,
  onReset,
}) => {
  return (
    <div className="incident-filter-grid">
      <label className="incident-control">
        <span className="incident-control__label">Severity</span>
        <select
          value={severity}
          onChange={(event) => onSeverityChange(event.target.value)}
        >
          {severityOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="incident-control">
        <span className="incident-control__label">Status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="incident-control">
        <span className="incident-control__label">Detection source</span>
        <select
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
        >
          {sourceOptions.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="incident-secondary-button"
        onClick={onReset}
      >
        Reset filters
      </button>
    </div>
  )
}

export default IncidentFilters
