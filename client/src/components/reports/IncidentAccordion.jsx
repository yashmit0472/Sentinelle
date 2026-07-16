import { useState } from 'react'

const IncidentAccordion = ({ incident }) => {
  const [expanded, setExpanded] = useState(false)

  if (!incident) return null

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '8px',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'rgba(6, 17, 31, 0.56)',
          border: 'none',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text)',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600 }}>
            {incident.timestampLabel}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {incident.explanation?.substring(0, 60)}...
          </p>
        </div>
        <span
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
            marginLeft: '12px',
          }}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '16px', background: 'rgba(2, 8, 20, 0.5)' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Explanation
              </p>
              <p style={{ margin: 0, color: 'var(--text)', lineHeight: 1.6 }}>
                {incident.explanation}
              </p>
            </div>

            {incident.matchedTerms && incident.matchedTerms.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Matched Terms
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {incident.matchedTerms.map((term, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(82, 166, 255, 0.12)',
                        border: '1px solid rgba(82, 166, 255, 0.22)',
                        color: '#83c4ff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {incident.ocrText && (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  OCR Text
                </p>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.9rem' }}>
                  {incident.ocrText}
                </p>
              </div>
            )}

            {incident.transcriptText && (
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Transcript
                </p>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.9rem' }}>
                  {incident.transcriptText}
                </p>
              </div>
            )}

            {incident.detections && incident.detections.length > 0 && (
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Detections
                </p>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {incident.detections.map((det, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(82, 166, 255, 0.08)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                      }}
                    >
                      <p style={{ margin: '0 0 2px' }}>
                        <strong>{det.label}</strong>
                        {' - '}
                        {(det.confidence * 100).toFixed(0)}% confidence
                      </p>
                      {det.bbox && det.bbox.length === 4 && (
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Region: {det.bbox.map(Math.round).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incident.recommendedAction && (
              <div style={{ padding: '10px 12px', background: 'rgba(63, 206, 142, 0.1)', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: '#a8f0c8' }}>
                  Recommended Action
                </p>
                <p style={{ margin: 0, color: 'var(--text)', fontSize: '0.9rem' }}>
                  {incident.recommendedAction}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default IncidentAccordion
