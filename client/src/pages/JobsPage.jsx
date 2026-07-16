import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const JobsPage = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['video-jobs'],
    queryFn: async () => {
      const res = await api.get('/videos/jobs')
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (jobId) => {
      const response = await api.delete(`/videos/jobs/${jobId}`)
      return response.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['video-jobs'],
      })
    },
  })

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.originalFileName}" and its linked incidents, frames, and report?`
    )

    if (!confirmed) {
      return
    }

    await deleteMutation.mutateAsync(job._id)
  }

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
                  <div className="job-actions">
                    {job.status === 'completed' && (
                      <Link to={`/jobs/${job._id}/frames`}>
                        View Frames
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <button
                        type="button"
                        className="job-delete-button"
                        onClick={() => handleDelete(job)}
                        disabled={
                          deleteMutation.isPending &&
                          deleteMutation.variables === job._id
                        }
                      >
                        {deleteMutation.isPending &&
                        deleteMutation.variables === job._id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    )}
                  </div>
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
