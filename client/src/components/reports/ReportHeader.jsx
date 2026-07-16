const formatDate = (date) => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ReportHeader = ({ report }) => {
  const job = report.job || {}

  return (
    <div className="report-header">
      <div className="report-header__top">
        <div className="report-header__info">
          <p className="report-header__label">Video Intelligence Dossier</p>
          <h1 className="report-header__title">{job.originalFileName || 'Unnamed Dossier'}</h1>
          <div className="report-header__meta">
            <div className="report-header__meta-item">
              <span className="report-header__meta-label">Generated</span>
              <span className="report-header__meta-value">
                {formatDate(report.generatedAt)}
              </span>
            </div>
            <div className="report-header__meta-item">
              <span className="report-header__meta-label">Uploaded</span>
              <span className="report-header__meta-value">
                {formatDate(job.createdAt)}
              </span>
            </div>
            <div className="report-header__meta-item">
              <span className="report-header__meta-label">Uploaded By</span>
              <span className="report-header__meta-value">
                {job.uploadedBy?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
        <div className="report-header__classification">
          🔒 INTERNAL SECURITY
        </div>
      </div>
    </div>
  )
}

export default ReportHeader
