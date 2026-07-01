import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/api.js'

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
    <div>
      <img
        src={src}
        alt={frame.frameName}
        style={{
          width: '100%',
          borderRadius: '8px',
        }}
      />
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

  if (isLoading) return <p>Loading frames...</p>

  if (error) return <p>Failed to load frames</p>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Extracted Frames</h2>
          <p>Total Frames: {data.count}</p>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {data.frames.map((frame) => (
          <FrameImage key={frame.name} frame={frame} />
        ))}
      </div>
    </div>
  )
}

export default FramesPage