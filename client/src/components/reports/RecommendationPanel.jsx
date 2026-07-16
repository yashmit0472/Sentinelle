const RecommendationPanel = ({ recommendations }) => {
  const defaultRecommendations = [
    'Review all critical incidents',
    'Verify weapon detections manually',
    'Preserve evidence for archival',
    'Escalate confirmed threats to authorities',
  ]

  const recList = recommendations && recommendations.length > 0 ? recommendations : defaultRecommendations

  return (
    <div className="report-recommendations">
      <h3 className="report-recommendations__title">Recommended Actions</h3>
      <div className="report-recommendation-list">
        {recList.map((rec, idx) => (
          <div key={idx} className="report-recommendation-item">
            <span className="report-recommendation-item__check">✓</span>
            <p className="report-recommendation-item__text">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecommendationPanel
