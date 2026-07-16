import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import EvidencePreview from '../components/incidents/EvidencePreview'
import IncidentReviewModal from '../components/incidents/IncidentReviewModal'
import IncidentSeverityBadge from '../components/incidents/IncidentSeverityBadge'
import IncidentStatusBadge from '../components/incidents/IncidentStatusBadge'
import ReviewHistoryTimeline from '../components/incidents/ReviewHistoryTimeline'
import {
  formatConfidence,
  formatIncidentLabel,
} from '../components/incidents/incidentConfig'

const formatBoundingBox = (bbox = []) => {
  if (bbox.length < 4) {
    return 'Bounding box unavailable'
  }

  const [x1, y1, x2, y2] = bbox.map((value) => Math.round(value))
  const width = Math.max(0, x2 - x1)
  const height = Math.max(0, y2 - y1)

  return `Region ${x1},${y1} to ${x2},${y2} (${width}x${height}px)`
}

const IncidentDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [note, setNote] = useState('')

  const incidentQuery = useQuery({
    queryKey: ['incident', id],
    queryFn: async () => {
      const response = await api.get(`/incidents/${id}`)
      return response.data
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.patch(`/incidents/${id}/status`, payload)
      return response.data
    },
    onSuccess: async () => {
      setReviewOpen(false)
      await queryClient.invalidateQueries({
        queryKey: ['incident', id],
      })
      await queryClient.invalidateQueries({
        queryKey: ['incidents'],
      })
    },
  })

  const noteMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.patch(`/incidents/${id}/note`, payload)
      return response.data
    },
    onSuccess: async () => {
      setNote('')
      await queryClient.invalidateQueries({
        queryKey: ['incident', id],
      })
      await queryClient.invalidateQueries({
        queryKey: ['incidents'],
      })
    },
  })

  const incident = incidentQuery.data
  const canReview = ['admin', 'analyst'].includes(user?.role)

  if (incidentQuery.isLoading) {
    return <div className="card">Loading incident investigation...</div>
  }

  if (incidentQuery.isError || !incident) {
    return (
      <div className="card">
        Failed to load the requested incident. Return to the investigation queue
        and try again.
      </div>
    )
  }

  return (
    <div className="incident-page">
      <section className="page-header incident-page-header">
        <div>
          <p className="incident-kicker">Incident Investigation</p>
          <h1>{incident.video?.originalFileName || 'Threat evidence package'}</h1>
          <p>
            Timeline position {incident.timestampLabel || '00:00:00'} from{' '}
            {incident.source?.name || 'unassigned source'}.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="incident-secondary-button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <Link className="incident-secondary-button incident-link-button" to="/incidents">
            Incident queue
          </Link>

          {canReview ? (
            <button type="button" onClick={() => setReviewOpen(true)}>
              Review incident
            </button>
          ) : null}
        </div>
      </section>

      <section className="incident-detail-grid">
        <div className="incident-detail-main">
          <div className="card">
            <div className="incident-card__badges">
              <IncidentSeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.reviewStatus} />
              <span className="incident-signal">
                {formatConfidence(incident.confidence)}
              </span>
            </div>

            <p className="incident-summary">{incident.explanation}</p>

            <EvidencePreview incident={incident} />
          </div>

          <div className="card">
            <h2>Threat context</h2>

            <div className="incident-info-grid">
              <div className="incident-info-row">
                <span>Detection source</span>
                <strong>{formatIncidentLabel(incident.detectionSource)}</strong>
              </div>
              <div className="incident-info-row">
                <span>Category</span>
                <strong>{formatIncidentLabel(incident.category)}</strong>
              </div>
              <div className="incident-info-row">
                <span>Timestamp</span>
                <strong>{incident.timestampLabel || '00:00:00'}</strong>
              </div>
              <div className="incident-info-row">
                <span>Recommendation</span>
                <strong>{incident.recommendedAction}</strong>
              </div>
            </div>

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

          <div className="incident-panel-grid">
            <div className="card">
              <h2>Detected objects</h2>
              {(incident.detections || []).length > 0 ? (
                <div className="incident-detail-list">
                  {incident.detections.map((detection, index) => (
                    <div
                      key={`${detection.label || 'detection'}-${index}`}
                      className="incident-detail-list__item"
                    >
                      <strong>{detection.label || 'Unlabeled object'}</strong>
                      <span>{formatConfidence(detection.confidence)}</span>
                      <small>{formatBoundingBox(detection.bbox || [])}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="incident-empty-panel">No object detections attached.</div>
              )}
            </div>

            <div className="card">
              <h2>OCR text</h2>
              <p className="incident-text-block">
                {incident.ocrText || 'No OCR text was detected for this incident.'}
              </p>
            </div>

            <div className="card">
              <h2>Audio transcript</h2>
              <p className="incident-text-block">
                {incident.transcriptText || 'No audio transcript was captured for this incident.'}
              </p>
            </div>

            <div className="card">
              <h2>Linked video</h2>
              <div className="incident-info-grid">
                <div className="incident-info-row">
                  <span>Video file</span>
                  <strong>{incident.video?.originalFileName || 'Unavailable'}</strong>
                </div>
                <div className="incident-info-row">
                  <span>Processing state</span>
                  <strong>{formatIncidentLabel(incident.video?.status)}</strong>
                </div>
              </div>

              {incident.video?.videoUrl ? (
                <video className="incident-video-player" controls src={incident.video.videoUrl} />
              ) : (
                <div className="incident-empty-panel">
                  Secure video stream unavailable for this incident.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="incident-detail-sidebar">
          <div className="card">
            <h2>Analyst notes</h2>

            {canReview ? (
              <form
                className="incident-note-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  noteMutation.mutate({
                    note,
                  })
                }}
              >
                <textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add investigation notes, correlation details, or operational guidance."
                />

                <button type="submit" disabled={noteMutation.isPending || !note.trim()}>
                  {noteMutation.isPending ? 'Saving...' : 'Add note'}
                </button>
              </form>
            ) : null}

            {(incident.analystNotes || []).length > 0 ? (
              <div className="incident-note-list">
                {incident.analystNotes.map((entry) => (
                  <div key={entry._id} className="incident-note-entry">
                    <p>{entry.note}</p>
                    <small>
                      {entry.user?.name || entry.user?.email || 'Unknown analyst'} ·{' '}
                      {new Date(entry.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="incident-empty-panel">No analyst notes added yet.</div>
            )}
          </div>

          <div className="card">
            <h2>Review history</h2>
            <ReviewHistoryTimeline history={incident.reviewHistory} />
          </div>
        </aside>
      </section>

      <IncidentReviewModal
        incident={incident}
        open={reviewOpen}
        submitting={reviewMutation.isPending}
        onClose={() => setReviewOpen(false)}
        onSubmit={(payload) => reviewMutation.mutateAsync(payload)}
      />
    </div>
  )
}

export default IncidentDetailsPage
