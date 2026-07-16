const StatisticsGrid = ({ statistics }) => {
  const stats = [
    {
      label: 'Frames Analysed',
      value: statistics?.totalFrames || 0,
    },
    {
      label: 'Flagged Frames',
      value: statistics?.flaggedFrames || 0,
    },
    {
      label: 'Processed Frames',
      value: statistics?.processedFrames || 0,
    },
  ]

  return (
    <div className="report-statistics">
      {stats.map((stat) => (
        <div key={stat.label} className="report-stat-card">
          <p className="report-stat-card__label">{stat.label}</p>
          <p className="report-stat-card__value">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default StatisticsGrid
