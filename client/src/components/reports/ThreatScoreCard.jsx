import ThreatLevelBadge from './ThreatLevelBadge'

const normalizeThreatScore = (score) => {
  return Math.min(Math.max(score, 0), 100)
}

const getThreatScoreColor = (score) => {
  if (score < 30) return '#3fce8e'
  if (score < 60) return '#ffd24a'
  if (score < 80) return '#ff9b42'
  return '#ff5f57'
}

const ThreatScoreCard = ({ score, level }) => {
  const normalized = normalizeThreatScore(score)
  const percentage = (normalized / 100) * 100

  return (
    <div className="report-threat-score">
      <p className="report-threat-score__label">Overall Threat Score</p>
      <div className="report-threat-score__display">
        <span className="report-threat-score__value">{normalized}</span>
        <span className="report-threat-score__max">/ 100</span>
      </div>
      <div className="report-threat-score__bar">
        <div
          className="report-threat-score__bar-fill"
          style={{ '--threat-width': `${percentage}%` }}
        />
      </div>
      <ThreatLevelBadge level={level} />
    </div>
  )
}

export default ThreatScoreCard
