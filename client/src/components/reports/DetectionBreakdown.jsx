const DetectionBreakdown = ({ statistics }) => {
  const objectDetections = Object.entries(statistics?.objectDetections || {})
  const textDetections = Object.entries(statistics?.textDetections || {})
  const audioDetections = Object.entries(statistics?.audioDetections || {})

  const getMaxCount = (detections) => {
    if (detections.length === 0) return 1
    return Math.max(...detections.map(([_, count]) => count))
  }

  const renderDetectionItems = (detections, title) => {
    if (detections.length === 0) {
      return null
    }

    const maxCount = getMaxCount(detections)

    return (
      <div className="report-detection-section">
        <h3 className="report-detection-section__title">{title}</h3>
        {detections.map(([name, count]) => {
          const percentage = (count / maxCount) * 100

          return (
            <div key={name} className="report-detection-item">
              <div className="report-detection-item__label">
                <span className="report-detection-item__name">{name}</span>
                <span className="report-detection-item__count">
                  {count} detection{count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="report-detection-item__bar">
                <div
                  className="report-detection-item__bar-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="report-detection-breakdown">
      {renderDetectionItems(objectDetections, 'Weapon Detection')}
      {renderDetectionItems(textDetections, 'OCR / Threat Text Detection')}
      {renderDetectionItems(audioDetections, 'Audio / Threat Speech Detection')}
      {objectDetections.length === 0 &&
        textDetections.length === 0 &&
        audioDetections.length === 0 && (
          <div className="report-detection-section">
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              No detection data available
            </p>
          </div>
        )}
    </div>
  )
}

export default DetectionBreakdown
