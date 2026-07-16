const Timeline = ({ timeline }) => {
  const getSeverityClass = (severity) => {
    if (!severity) return ''
    return `report-timeline__severity--${severity.toLowerCase()}`
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="report-timeline__container">
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          No timeline events recorded
        </p>
      </div>
    )
  }

  return (
    <div className="report-timeline__container">
      {timeline.map((event, idx) => (
        <div key={idx} className="report-timeline__item">
          <div className="report-timeline__marker" />
          <div className="report-timeline__content">
            <div className="report-timeline__header">
              <span className="report-timeline__time">{event.timestamp}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {event.source && (
                  <span className="report-timeline__source">{event.source}</span>
                )}
                {event.severity && (
                  <span className={`report-timeline__severity ${getSeverityClass(event.severity)}`}>
                    {event.severity}
                  </span>
                )}
              </div>
            </div>
            {event.explanation && (
              <p className="report-timeline__text">{event.explanation}</p>
            )}
            {event.matchedTerms && event.matchedTerms.length > 0 && (
              <div className="report-timeline__terms">
                {event.matchedTerms.map((term, termIdx) => (
                  <span key={termIdx} className="report-timeline__term">
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Timeline
