const IncidentSearch = ({ value, onChange }) => {
  return (
    <label className="incident-search">
      <span className="incident-control__label">Search intelligence</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Explanation, OCR, transcript, terms..."
      />
    </label>
  )
}

export default IncidentSearch
