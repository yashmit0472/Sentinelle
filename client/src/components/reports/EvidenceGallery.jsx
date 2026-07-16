import { useState } from 'react'

const EvidenceGallery = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [loadErrors, setLoadErrors] = useState({})

  if (!incidents || incidents.length === 0) {
    return (
      <div className="report-detection-section">
        <h3 className="report-detection-section__title">Evidence Gallery</h3>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 0' }}>
          No evidence frames available.
        </p>
      </div>
    )
  }

  const handleImageError = (incidentId) => {
    setLoadErrors(prev => ({ ...prev, [incidentId]: true }))
  }

  const getFrameImageUrl = (incident) => {
    // Use frameViewPath which goes through the backend endpoint for proper CORS/auth handling
    // Falls back to frameUrl if frameViewPath is not available
    if (incident.frameViewPath) {
      // Construct full API URL for the frame endpoint
      return `/api${incident.frameViewPath}`
    }
    return incident.frameUrl || null
  }

  return (
    <div className="report-detection-section">
      <h3 className="report-detection-section__title">Evidence Gallery</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
          marginTop: '16px',
        }}
      >
        {incidents.map((incident) => {
          const frameImageUrl = getFrameImageUrl(incident)
          const hasFrameUrl = frameImageUrl && !loadErrors[incident._id]
          return (
            <button
              key={incident._id}
              onClick={() => setSelectedIncident(incident)}
              style={{
                padding: 0,
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'transparent',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{ position: 'relative', paddingBottom: '100%', background: '#000' }}>
                {hasFrameUrl ? (
                  <img
                    src={frameImageUrl}
                    alt={`Evidence ${incident.timestampLabel}`}
                    onError={() => handleImageError(incident._id)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      background: 'rgba(82, 166, 255, 0.1)',
                      color: 'var(--text-muted)',
                      fontSize: '0.7rem',
                      gap: '4px',
                    }}
                  >
                    <div>No image</div>
                    {loadErrors[incident._id] && <div style={{ fontSize: '0.6rem' }}>Failed to load</div>}
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '6px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    fontSize: '0.7rem',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  {incident.timestampLabel}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedIncident && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 50,
          }}
          onClick={() => setSelectedIncident(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedIncident.frameUrl && (
              <img
                src={selectedIncident.frameUrl}
                alt="Enlarged evidence"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                }}
              />
            )}
            <button
              onClick={() => setSelectedIncident(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              ✕ Close
            </button>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '16px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                color: '#fff',
              }}
            >
              <p style={{ margin: '0 0 8px' }}>
                <strong>{selectedIncident.timestampLabel}</strong>
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>
                {selectedIncident.explanation}
              </p>
              <p style={{ margin: '0', fontSize: '0.85rem', color: '#aaa' }}>
                Confidence: {(selectedIncident.confidence * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EvidenceGallery
