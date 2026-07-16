import { formatIncidentLabel } from './incidentConfig'

const IncidentSeverityBadge = ({ severity }) => {
  return (
    <span
      className={`incident-badge incident-badge--severity incident-badge--severity-${severity || 'unknown'}`}
    >
      {formatIncidentLabel(severity)}
    </span>
  )
}

export default IncidentSeverityBadge
