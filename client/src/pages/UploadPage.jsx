import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/api'

const UploadPage = () => {
  const [video, setVideo] = useState(null)
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append('video', video)

      const res = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return res.data
    },

    onSuccess: (data) => {
      setMessage(`Uploaded successfully. Job ID: ${data.job.id}`)
      setVideo(null)
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] })
    },

    onError: (error) => {
      setMessage(error.response?.data?.message || 'Upload failed')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!video) {
      setMessage('Please select a video file')
      return
    }

    uploadMutation.mutate()
  }

  return (
    <div>
      <h1>Upload Video</h1>
      <p>Upload surveillance footage for AI processing.</p>

      <form className="card" onSubmit={handleSubmit}>
        <label>Select video file</label>

        <input
          type="file"
          accept="video/mp4,video/x-matroska,video/x-msvideo,video/quicktime"
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <button disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? 'Uploading...' : 'Upload Video'}
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  )
}

export default UploadPage