import { Link } from 'react-router-dom'
import IncidentSeverityBadge from './IncidentSeverityBadge'
import IncidentStatusBadge from './IncidentStatusBadge'
import {
  formatConfidence,
  formatIncidentLabel,
} from './incidentConfig'

const IncidentCard = ({ incident, onReview }) => {
  return (
    <article className="incident-card">
      <div className="incident-card__header">
        <div className="incident-card__badges">
          <IncidentSeverityBadge severity={incident.severity} />
          <IncidentStatusBadge status={incident.reviewStatus} />
        </div>

        <div className="incident-card__timestamp">
          {incident.timestampLabel || '00:00:00'}
        </div>
      </div>

      <div className="incident-card__body">
        <div className="incident-card__meta">
          <span>{formatIncidentLabel(incident.detectionSource)}</span>
          <span>{formatConfidence(incident.confidence)}</span>
        </div>

        <h3>{incident.job?.originalFileName || 'Unnamed evidence clip'}</h3>
        <p>{incident.explanation}</p>

        <div className="incident-term-list">
          {incident.matchedTerms?.length > 0 ? (
            incident.matchedTerms.map((term) => (
              <span key={`${incident._id}-${term}`} className="incident-term-chip">
                {term}
              </span>
            ))
          ) : (
            <span className="incident-term-chip incident-term-chip--muted">
              No matched terms
            </span>
          )}
        </div>
      </div>

      <div className="incident-card__footer">
        <Link className="incident-secondary-button incident-link-button" to={`/incidents/${incident._id}`}>
          Investigate
        </Link>

        <button type="button" onClick={() => onReview(incident)}>
          Review
        </button>
      </div>
    </article>
  )
}

export default IncidentCard
