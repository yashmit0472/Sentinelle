export const severityOptions = [
  { value: '', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'closed', label: 'Closed' },
]

export const detectionSourceOptions = [
  { value: '', label: 'All sources' },
  { value: 'object', label: 'Object Detection' },
  { value: 'text', label: 'OCR Detection' },
  { value: 'audio', label: 'Audio Detection' },
  { value: 'zone', label: 'Restricted Zone' },
  { value: 'multi', label: 'Multi-source' },
  { value: 'manual', label: 'Manual' },
]

export const reviewStatusOptions = statusOptions.filter(
  (option) => option.value
)

export const formatConfidence = (confidence) => {
  if (confidence !== 0 && !confidence) {
    return 'N/A'
  }

  return `${Math.round(confidence * 100)}%`
}

export const formatIncidentLabel = (value) =>
  value
    ?.split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Unknown'
