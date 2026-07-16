const SummaryCard = ({ summary, statistics, threatLevel, incidents }) => {
  const flaggedFrames = statistics?.flaggedFrames || 0
  const totalFrames = statistics?.totalFrames || 0
  const processedFrames = statistics?.processedFrames || totalFrames

  const criticalIncidents = incidents?.filter((i) => i.severity === 'critical')?.length || 0

  return (
    <div className="report-threat-summary">
      <h3 className="report-threat-summary__title">Executive Summary</h3>
      <p className="report-threat-summary__text">{summary}</p>
      <div className="report-threat-summary__highlights">
        <div className="report-threat-summary__highlight">
          <p className="report-threat-summary__highlight-label">Frames Analyzed</p>
          <span className="report-threat-summary__highlight-value">
            {processedFrames}
          </span>
        </div>
        <div className="report-threat-summary__highlight">
          <p className="report-threat-summary__highlight-label">Flagged Frames</p>
          <span className="report-threat-summary__highlight-value">
            {flaggedFrames}
          </span>
        </div>
        <div className="report-threat-summary__highlight">
          <p className="report-threat-summary__highlight-label">Incidents Found</p>
          <span className="report-threat-summary__highlight-value">
            {incidents?.length || 0}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SummaryCard
