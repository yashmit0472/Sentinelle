import { useEffect, useState } from 'react'
import api from '../../api/api'
import { formatConfidence, formatIncidentLabel } from './incidentConfig'

const formatBoundingBox = (bbox = []) => {
  if (bbox.length < 4) {
    return null
  }

  const [x1, y1, x2, y2] = bbox.map((value) => Math.round(value))
  const width = Math.max(0, x2 - x1)
  const height = Math.max(0, y2 - y1)

  return {
    x1,
    y1,
    x2,
    y2,
    width,
    height,
  }
}

const EvidencePreview = ({ incident, compact = false }) => {
  const [src, setSrc] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false

    const loadFrame = async () => {
      if (
        !incident?.evidence?.frameViewPath &&
        !incident?.frameViewPath
      ) {
        return
      }

      try {
        const response = await api.get(incident.evidence?.frameViewPath || incident.frameViewPath, {
          responseType: 'blob',
        })

        objectUrl = URL.createObjectURL(response.data)

        if (!cancelled) {
          setSrc(objectUrl)
          setError(false)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(true)
        }
      }
    }

    loadFrame()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [
    incident?.evidence?.frameViewPath,
    incident?.frameViewPath,
  ])

  const detections = incident?.evidence?.boundingBoxes || incident?.detections || []

  return (
    <section className={`evidence-preview ${compact ? 'evidence-preview--compact' : ''}`}>
      <div className="evidence-preview__media">
        {src ? (
          <img
            src={src}
            alt={incident?.evidence?.frameName || incident?.frameName || 'Incident frame'}
          />
        ) : (
          <div className="evidence-preview__placeholder">
            {error ? 'Frame preview unavailable' : 'Loading frame preview...'}
          </div>
        )}
      </div>

      <div className="evidence-preview__details">
        <div className="incident-card__badges">
          <span className="incident-signal">{incident?.timestampLabel || '00:00:00'}</span>
          <span className="incident-signal">
            {formatIncidentLabel(incident?.detectionSource)}
          </span>
          <span className="incident-signal">
            {formatConfidence(incident?.confidence)}
          </span>
        </div>

        <div className="incident-detail-list">
          {detections.length > 0 ? (
            detections.map((detection, index) => {
              const region = formatBoundingBox(detection.bbox)

              return (
                <div key={`${detection.label || 'bbox'}-${index}`} className="incident-detail-list__item">
                <strong>{detection.label || 'Object'}</strong>
                <span>{formatConfidence(detection.confidence)}</span>
                <small>
                  {region
                    ? `Region ${region.x1},${region.y1} to ${region.x2},${region.y2} (${region.width}x${region.height}px)`
                    : 'Bounding box unavailable'}
                </small>
              </div>
              )
            })
          ) : (
            <div className="incident-detail-list__empty">
              No bounding box data available for this incident.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default EvidencePreview
