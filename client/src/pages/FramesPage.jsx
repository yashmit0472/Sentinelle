import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/api.js'

const formatConfidence = (confidence) => {
  if (!confidence && confidence !== 0) return 'N/A'
  return `${Math.round(confidence * 100)}%`
}

const FrameImage = ({ frame }) => {
  const [src, setSrc] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false

    const loadFrame = async () => {
      try {
        const res = await api.get(frame.viewPath, {
          responseType: 'blob',
        })

        objectUrl = URL.createObjectURL(res.data)

        if (!cancelled) {
          setSrc(objectUrl)
        }
      } catch (err) {
        if (!cancelled) {
          setError(true)
        }
      }
    }

    loadFrame()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [frame.viewPath])

  if (error) {
    return (
      <div className="card">
        <p>Failed to load frame</p>
      </div>
    )
  }

  if (!src) {
    return (
      <div className="card">
        <p>Loading frame...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <img
        src={src}
        alt={frame.frameName}
        style={{
          width: '100%',
          borderRadius: '8px',
          marginBottom: '10px',
        }}
      />

      <h3>{frame.timestampLabel || '00:00:00'}</h3>

      <p>
        <strong>Reason:</strong> {frame.explanation}
      </p>

      <p>
        <strong>Category:</strong> {frame.category}
      </p>

      <p>
        <strong>Detection:</strong> {frame.detectionSource}
      </p>

      <p>
        <strong>Severity:</strong> {frame.severity}
      </p>

      <p>
        <strong>Confidence:</strong> {formatConfidence(frame.confidence)}
      </p>

      {frame.matchedTerms?.length > 0 && (
        <p>
          <strong>Matched:</strong> {frame.matchedTerms.join(', ')}
        </p>
      )}

      <small>{frame.frameName}</small>
    </div>
  )
}

function FramesPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['frames', id],
    queryFn: async () => {
      const res = await api.get(`/videos/jobs/${id}/frames`)
      return res.data
    },
  })

  if (isLoading) return <p>Loading flagged evidence...</p>

  if (error) return <p>Failed to load flagged evidence</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Flagged Evidence</h2>
          <p>Total Flagged Frames: {data.count}</p>
        </div>

        <div className="page-actions">
          <button type="button" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <Link className="button-link" to="/jobs">
            Back to Jobs
          </Link>
        </div>
      </div>

      {data.frames.length === 0 && (
        <div className="card">
          <p>No flagged threat indicators found for this video.</p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}
      >
        {data.frames.map((frame) => (
          <FrameImage key={frame.incidentId} frame={frame} />
        ))}
      </div>
    </div>
  )
}

export default FramesPage