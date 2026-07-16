import { formatIncidentLabel } from './incidentConfig'

const ReviewHistoryTimeline = ({ history = [] }) => {
  if (history.length === 0) {
    return (
      <div className="incident-empty-panel">
        No review history yet. This incident is waiting for analyst action.
      </div>
    )
  }

  return (
    <div className="review-timeline">
      {history.map((item) => (
        <div key={`${item._id || item.changedAt}-${item.status}`} className="review-timeline__item">
          <div className="review-timeline__marker" />

          <div className="review-timeline__content">
            <div className="review-timeline__header">
              <strong>{formatIncidentLabel(item.status)}</strong>
              <span>{new Date(item.changedAt).toLocaleString()}</span>
            </div>

            <p>{item.note || 'No note recorded for this review step.'}</p>
            <small>{item.user?.name || item.user?.email || 'Unknown reviewer'}</small>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReviewHistoryTimeline
