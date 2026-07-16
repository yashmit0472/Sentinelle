const ThreatLevelBadge = ({ level }) => {
  return (
    <span className={`report-threat-badge report-threat-badge--${level?.toLowerCase()}`}>
      {level}
    </span>
  )
}

export default ThreatLevelBadge
