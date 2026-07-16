const MetadataPanel = ({ report, job }) => {
  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const generatedTime = formatDate(report.generatedAt)
  const uploadedTime = formatDate(job?.createdAt)
  const completedTime = formatDate(job?.completedAt)

  const processingDuration =
    job?.completedAt && job?.createdAt
      ? Math.round((new Date(job.completedAt) - new Date(job.createdAt)) / 1000) + 's'
      : '-'

  return (
    <div className="report-detection-section">
      <h3 className="report-detection-section__title">Report Metadata</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '16px',
        }}
      >
        <div style={{ padding: '12px', background: 'rgba(6, 17, 31, 0.56)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Job ID
          </p>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text)' }}>
            {job?._id || '-'}
          </p>
        </div>

        <div style={{ padding: '12px', background: 'rgba(6, 17, 31, 0.56)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Generated
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
            {generatedTime}
          </p>
        </div>

        <div style={{ padding: '12px', background: 'rgba(6, 17, 31, 0.56)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Uploaded
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
            {uploadedTime}
          </p>
        </div>

        <div style={{ padding: '12px', background: 'rgba(6, 17, 31, 0.56)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Processing Duration
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
            {processingDuration}
          </p>
        </div>

        <div style={{ padding: '12px', background: 'rgba(6, 17, 31, 0.56)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Report Version
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
            1.0
          </p>
        </div>

        <div style={{ padding: '12px', background: 'rgba(6, 17, 31, 0.56)', borderRadius: '12px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Status
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)', textTransform: 'capitalize' }}>
            {job?.status || '-'}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(82, 166, 255, 0.08)', borderRadius: '12px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          AI Modules Used
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 10px', background: 'rgba(82, 166, 255, 0.2)', borderRadius: '6px', fontSize: '0.8rem', color: '#83c4ff' }}>
            Object Detection
          </span>
          <span style={{ padding: '4px 10px', background: 'rgba(82, 166, 255, 0.2)', borderRadius: '6px', fontSize: '0.8rem', color: '#83c4ff' }}>
            OCR Analysis
          </span>
          <span style={{ padding: '4px 10px', background: 'rgba(82, 166, 255, 0.2)', borderRadius: '6px', fontSize: '0.8rem', color: '#83c4ff' }}>
            Audio Detection
          </span>
        </div>
      </div>
    </div>
  )
}

export default MetadataPanel
