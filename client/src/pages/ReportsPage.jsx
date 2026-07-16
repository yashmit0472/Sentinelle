import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api/api'
import ReportCard from '../components/reports/ReportCard'
import ReportFilters from '../components/reports/ReportFilters'

const threatLevelOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

const ReportsPage = () => {
  const [threatLevel, setThreatLevel] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const reportsQuery = useQuery({
    queryKey: ['reports', threatLevel, sortBy],
    queryFn: async () => {
      const response = await api.get('/reports', {
        params: {
          threatLevel: threatLevel || undefined,
        },
      })
      
      let reports = response.data.reports || []
      
      if (sortBy === 'threat') {
        reports.sort((a, b) => b.threatScore - a.threatScore)
      } else {
        reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
      
      return {
        count: response.data.count,
        reports,
      }
    },
  })

  const reports = reportsQuery.data?.reports || []

  const handleReset = () => {
    setThreatLevel('')
    setSortBy('recent')
  }

  const criticalReports = reports.filter(
    (report) => report.threatLevel === 'CRITICAL'
  )

  const highReports = reports.filter(
    (report) => report.threatLevel === 'HIGH'
  )

  const averageThreatScore =
    reports.length > 0
      ? Math.round(
          (reports.reduce((sum, r) => sum + Math.min(r.threatScore, 100), 0) /
            reports.length) *
            100
        ) / 100
      : 0

  return (
    <div className="incident-page">
      <section className="incident-hero">
        <div>
          <p className="incident-kicker">Intelligence Operations</p>
          <h1>Report Dashboard</h1>
          <p>
            Access comprehensive video analysis reports, threat assessments, and
            automated intelligence on analyzed surveillance footage.
          </p>
        </div>

        <div className="incident-hero__stats">
          <div className="incident-hero__stat">
            <span>Total Reports</span>
            <strong>{reportsQuery.data?.count || 0}</strong>
          </div>

          <div className="incident-hero__stat">
            <span>Critical Threats</span>
            <strong>{criticalReports.length}</strong>
          </div>

          <div className="incident-hero__stat">
            <span>High Priority</span>
            <strong>{highReports.length}</strong>
          </div>

          <div className="incident-hero__stat">
            <span>Avg Threat Score</span>
            <strong>{averageThreatScore}</strong>
          </div>
        </div>
      </section>

      <section className="incident-toolbar card">
        <ReportFilters
          threatLevel={threatLevel}
          sortBy={sortBy}
          onThreatLevelChange={setThreatLevel}
          onSortByChange={setSortBy}
          threatLevelOptions={threatLevelOptions}
          onReset={handleReset}
        />
      </section>

      {reportsQuery.isLoading ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>Loading intelligence database...</p>
        </div>
      ) : null}

      {reportsQuery.isError ? (
        <div className="card">
          <p style={{ color: 'var(--danger)' }}>Failed to load reports. Please try again.</p>
        </div>
      ) : null}

      {!reportsQuery.isLoading && !reportsQuery.isError && reports.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>No reports match the current filters.</p>
        </div>
      ) : null}

      <div className="incident-grid">
        {reports.map((report) => (
          <ReportCard key={report._id} report={report} />
        ))}
      </div>
    </div>
  )
}

export default ReportsPage
