import { Link } from 'react-router-dom'

const getThreatLevelColor = (level) => {
  const colors = {
    LOW: '#3fce8e',
    MEDIUM: '#ffd24a',
    HIGH: '#ff9b42',
    CRITICAL: '#ff5f57',
  }
  return colors[level] || '#6b7280'
}

const normalizeThreatScore = (score) => {
  return Math.min(Math.max(score, 0), 100)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ReportCard = ({ report }) => {
  const job = report.job || {}
  const flaggedFrames = report.statistics?.flaggedFrames || 0
  const totalFrames = report.statistics?.totalFrames || 0
  const threatScore = normalizeThreatScore(report.threatScore)

  return (
    <Link
      to={`/reports/${job._id}`}
      className="incident-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
    >
      <div className="incident-card__header">
        <div>
          <h3>{job.originalFileName || 'Unnamed Video'}</h3>
          <p className="incident-card__meta">
            {formatDate(report.createdAt)}
          </p>
        </div>
        <div
          className="incident-card__threat"
          style={{
            backgroundColor: getThreatLevelColor(report.threatLevel),
            padding: '8px 14px',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {report.threatLevel}
        </div>
      </div>

      <div className="incident-card__body">
        <p className="incident-card__description">
          {report.executiveSummary}
        </p>

        <div className="incident-card__stats">
          <div className="stat">
            <span className="stat-label">Threat Score</span>
            <span className="stat-value">
              {threatScore} / 100
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Flagged Frames</span>
            <span className="stat-value">
              {flaggedFrames} / {totalFrames}
            </span>
          </div>
        </div>

        {report.recommendations && report.recommendations.length > 0 ? (
          <div className="incident-card__tags">
            {report.recommendations.slice(0, 2).map((rec, idx) => (
              <span key={idx} className="incident-term-chip">
                {rec}
              </span>
            ))}
            {report.recommendations.length > 2 ? (
              <span className="incident-term-chip">
                +{report.recommendations.length - 2}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="incident-card__footer">
        <p className="incident-card__uploader">
          Uploaded by {job.uploadedBy?.name || 'Unknown'}
        </p>
        <div
          style={{
            display: 'inline-flex',
            padding: '8px 12px',
            fontSize: '0.85rem',
            marginTop: '8px',
            background: 'rgba(82, 166, 255, 0.2)',
            borderRadius: '6px',
            border: '1px solid rgba(82, 166, 255, 0.4)',
            color: 'var(--text)',
          }}
        >
          View Dossier →
        </div>
      </div>
    </Link>
  )
}

export default ReportCard
