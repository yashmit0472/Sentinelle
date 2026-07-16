const AnalystNotes = ({ incidents }) => {
  const notes = incidents
    ?.flatMap((incident) => incident.reviewHistory || [])
    .filter((entry) => entry.note)
    .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))

  if (!notes || notes.length === 0) {
    return (
      <div className="report-detection-section">
        <h3 className="report-detection-section__title">Analyst Notes</h3>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 0' }}>
          No analyst notes recorded.
        </p>
      </div>
    )
  }

  return (
    <div className="report-detection-section">
      <h3 className="report-detection-section__title">Analyst Notes</h3>

      <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
        {notes.map((note, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px 16px',
              background: 'rgba(6, 17, 31, 0.56)',
              borderRadius: '12px',
              borderLeft: '3px solid rgba(82, 166, 255, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {note.user?.name || 'Unknown Analyst'}
              </p>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                {new Date(note.changedAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                color: 'var(--text)',
                lineHeight: 1.6,
                fontSize: '0.9rem',
              }}
            >
              {note.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalystNotes
