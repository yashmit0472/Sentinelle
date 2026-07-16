const IntelligenceAssessment = ({ report }) => {
  const generateObservations = () => {
    const observations = []
    const stats = report.statistics || {}
    const timeline = report.timeline || []

    // Observation 1: Weapon detections
    const weaponCount = Object.values(stats.objectDetections || {}).reduce((a, b) => a + b, 0)
    if (weaponCount > 0) {
      const weaponTypes = Object.keys(stats.objectDetections || {})
      observations.push(
        `Firearm or weapon detections occurred throughout the surveillance period, with ${weaponTypes.join(', ')} identified.`
      )
    }

    // Observation 2: Threat text
    const textCount = Object.values(stats.textDetections || {}).reduce((a, b) => a + b, 0)
    if (textCount > 0) {
      observations.push(
        `OCR analysis detected threat keywords in text, indicating potential verbal or written threats within the video.`
      )
    }

    // Observation 3: Audio detections
    const audioCount = Object.values(stats.audioDetections || {}).reduce((a, b) => a + b, 0)
    if (audioCount > 0) {
      observations.push(
        `Threat speech patterns were detected in the audio, correlating with visual threats and escalating risk assessment.`
      )
    }

    // Observation 4: Multiple indicators
    const totalDetections = weaponCount + textCount + audioCount
    if (totalDetections > 1) {
      observations.push(
        `Multiple threat indicators converge, increasing overall confidence in threat assessment and requiring escalated response.`
      )
    }

    // Observation 5: Flagged frames
    const flaggedFrames = stats.flaggedFrames || 0
    if (flaggedFrames > 0) {
      const totalFrames = stats.totalFrames || 1
      const percentage = Math.round((flaggedFrames / totalFrames) * 100)
      observations.push(
        `${percentage}% of analyzed frames contained threat indicators, suggesting sustained or repeated hostile activity.`
      )
    }

    if (observations.length === 0) {
      observations.push(`Analysis of surveillance footage completed with ${stats.totalFrames || 0} frames processed.`)
    }

    return observations
  }

  const observations = generateObservations()

  return (
    <div className="report-intelligence">
      <h3 className="report-intelligence__title">AI Intelligence Assessment</h3>
      {observations.map((obs, idx) => (
        <div key={idx} className="report-intelligence__obs">
          <span className="report-intelligence__obs-icon">●</span>
          <p className="report-intelligence__obs-text">{obs}</p>
        </div>
      ))}
    </div>
  )
}

export default IntelligenceAssessment
