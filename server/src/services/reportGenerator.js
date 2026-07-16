const buildThreatScore = (incidents) => {
  let score = 0

  incidents.forEach((incident) => {
    switch (incident.severity) {
      case 'critical':
        score += 10
        break
      case 'high':
        score += 5
        break
      case 'medium':
        score += 3
        break
      case 'low':
        score += 1
        break
      default:
        break
    }
  })

  return score
}

const buildThreatLevel = (score) => {
  if (score >= 70) return 'CRITICAL'
  if (score >= 40) return 'HIGH'
  if (score >= 20) return 'MEDIUM'
  return 'LOW'
}

const countMatchedTerms = (incidents) => {
  const counts = {}

  incidents.forEach((incident) => {
    incident.matchedTerms.forEach((term) => {
      counts[term] = (counts[term] || 0) + 1
    })
  })

  return counts
}

const buildTimeline = (incidents) => {
  return incidents
    .sort((a, b) => a.timestampSeconds - b.timestampSeconds)
    .map((incident) => ({
      timestamp: incident.timestampLabel,
      timestampSeconds: incident.timestampSeconds,
      source: incident.detectionSource,
      severity: incident.severity,
      matchedTerms: incident.matchedTerms,
      explanation: incident.explanation,
    }))
}

const buildExecutiveSummary = (
  job,
  incidents,
  threatLevel
) => {
  return `
The uploaded surveillance video "${job.originalFileName}" was analysed using
offline object detection, OCR text recognition and speech analysis.

${job.processedFrames} frames were analysed.

${incidents.length} security incidents were detected.

Overall threat assessment: ${threatLevel}.

Manual analyst verification is recommended before operational action.
`.trim()
}

module.exports = {
  buildThreatScore,
  buildThreatLevel,
  buildTimeline,
  buildExecutiveSummary,
  countMatchedTerms,
}