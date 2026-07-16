import { useEffect, useState } from 'react'
import { reviewStatusOptions } from './incidentConfig'

const IncidentReviewModal = ({
  incident,
  open,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState('under_review')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!incident) {
      return
    }

    setStatus(incident.reviewStatus || 'under_review')
    setNote(incident.reviewNote || '')
  }, [incident])

  if (!open || !incident) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({
      status,
      note,
    })
  }

  return (
    <div className="incident-modal-backdrop" onClick={onClose}>
      <div
        className="incident-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="incident-modal__header">
          <div>
            <p className="incident-kicker">Analyst Review</p>
            <h3>Update incident status</h3>
          </div>

          <button
            type="button"
            className="incident-icon-button"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <form className="incident-modal__form" onSubmit={handleSubmit}>
          <label className="incident-control">
            <span className="incident-control__label">Review decision</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {reviewStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="incident-control">
            <span className="incident-control__label">Review note</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Explain the review outcome, evidence confidence, and next action."
              rows={5}
            />
          </label>

          <div className="incident-modal__actions">
            <button
              type="button"
              className="incident-secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default IncidentReviewModal
