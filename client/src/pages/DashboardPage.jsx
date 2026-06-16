import { useQuery } from '@tanstack/react-query'
import api from '../api/api'

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['video-jobs'],
    queryFn: async () => {
      const res = await api.get('/videos/jobs')
      return res.data
    },
  })

  const jobs = data?.jobs || []

  const uploadedCount = jobs.filter((job) => job.status === 'uploaded').length
  const processingCount = jobs.filter((job) => job.status === 'processing').length
  const completedCount = jobs.filter((job) => job.status === 'completed').length

  return (
    <div>
      <h1>Dashboard</h1>
      <p>System overview for uploaded surveillance footage.</p>

      <div className="stats-grid">
        <div className="card">
          <h3>Total Jobs</h3>
          <p className="stat">{isLoading ? '...' : jobs.length}</p>
        </div>

        <div className="card">
          <h3>Uploaded</h3>
          <p className="stat">{uploadedCount}</p>
        </div>

        <div className="card">
          <h3>Processing</h3>
          <p className="stat">{processingCount}</p>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <p className="stat">{completedCount}</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage