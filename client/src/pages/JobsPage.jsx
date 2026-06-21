import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/api'

const JobsPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['video-jobs'],
    queryFn: async () => {
      const res = await api.get('/videos/jobs')
      return res.data
    },
  })

  if (isLoading) {
    return <p>Loading jobs...</p>
  }

  if (error) {
    return <p>Failed to load jobs</p>
  }

  return (
    <div>
      <h1>Video Jobs</h1>
      <p>Uploaded videos and their processing status.</p>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Size</th>
              <th>Uploaded At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.originalFileName}</td>
                <td>
                  <span className={`badge ${job.status}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job.progress}%</td>
                <td>{(job.size / (1024 * 1024)).toFixed(2)} MB</td>
                <td>{new Date(job.createdAt).toLocaleString()}</td>

                <td>
                    {job.status === 'completed' && (
                      <Link to={`/jobs/${job._id}/frames`}>
                        View Frames
                      </Link>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.jobs.length === 0 && <p>No video jobs yet.</p>}
      </div>
    </div>
  )
}

export default JobsPage