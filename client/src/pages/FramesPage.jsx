import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/api.js'

function FramesPage() {
  const { id } = useParams()

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
      <h2>Extracted Frames</h2>

      <p>Total Frames: {data.count}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {data.frames.map((frame) => (
          <div key={frame.name}>
            <img
              src={frame.url}
              alt={frame.name}
              style={{
                width: '100%',
                borderRadius: '8px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FramesPage