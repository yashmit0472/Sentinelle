import { formatIncidentLabel } from './incidentConfig'

const IncidentStatusBadge = ({ status }) => {
  return (
    <span
      className={`incident-badge incident-badge--status incident-badge--status-${status || 'unknown'}`}
    >
      {formatIncidentLabel(status)}
    </span>
  )
}

export default IncidentStatusBadge
