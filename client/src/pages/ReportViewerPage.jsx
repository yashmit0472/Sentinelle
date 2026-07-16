import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/api'
import ReportHeader from '../components/reports/ReportHeader'
import ThreatScoreCard from '../components/reports/ThreatScoreCard'
import SummaryCard from '../components/reports/SummaryCard'
import StatisticsGrid from '../components/reports/StatisticsGrid'
import DetectionBreakdown from '../components/reports/DetectionBreakdown'
import Timeline from '../components/reports/Timeline'
import IntelligenceAssessment from '../components/reports/IntelligenceAssessment'
import RecommendationPanel from '../components/reports/RecommendationPanel'
import EvidenceGallery from '../components/reports/EvidenceGallery'
import IncidentAccordion from '../components/reports/IncidentAccordion'
import AnalystNotes from '../components/reports/AnalystNotes'
import MetadataPanel from '../components/reports/MetadataPanel'
import DownloadPanel from '../components/reports/DownloadPanel'

const ReportViewerPage = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const reportQuery = useQuery({
    queryKey: ['report', jobId],
    queryFn: async () => {
      const response = await api.get(`/reports/${jobId}`)
      return response.data
    },
  })

  const incidentsQuery = useQuery({
    queryKey: ['incidents-for-report', jobId],
    queryFn: async () => {
      const response = await api.get('/incidents', {
        params: {
          latestOnly: false,
        },
      })
      // Filter incidents for this job
      const filtered = (response.data.incidents || []).filter(
        (incident) => incident.job._id === jobId
      )
      return {
        count: filtered.length,
        incidents: filtered,
      }
    },
    enabled: !!reportQuery.data,
  })

  if (reportQuery.isLoading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading intelligence dossier...</p>
      </div>
    )
  }

  if (reportQuery.isError) {
    return (
      <div style={{ padding: '32px' }}>
        <div className="card">
          <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>
            Failed to load report. Please try again.
          </p>
          <button onClick={() => navigate('/reports')}>Return to Reports</button>
        </div>
      </div>
    )
  }

  const report = reportQuery.data

  if (!report) {
    return (
      <div style={{ padding: '32px' }}>
        <div className="card">
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Report not found</p>
          <button onClick={() => navigate('/reports')}>Return to Reports</button>
        </div>
      </div>
    )
  }

  const incidents = incidentsQuery.data?.incidents || []

  return (
    <div className="report-page">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <Link
          to="/reports"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 16px',
            background: 'rgba(7, 17, 31, 0.55)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text)',
            textDecoration: 'none',
            fontSize: '0.92rem',
          }}
        >
          ← Reports
        </Link>
      </div>

      <ReportHeader report={report} />

      <div className="report-threat-overview">
        <ThreatScoreCard score={report.threatScore} level={report.threatLevel} />
        <SummaryCard
          summary={report.executiveSummary}
          statistics={report.statistics}
          threatLevel={report.threatLevel}
          incidents={incidents}
        />
      </div>

      <StatisticsGrid statistics={report.statistics} />

      {incidents.length > 0 && (
        <div className="report-detection-section">
          <h3 className="report-detection-section__title">Incident Details</h3>
          <div style={{ display: 'grid', gap: '0', marginTop: '16px' }}>
            {incidents.map((incident, idx) => (
              <IncidentAccordion key={incident._id || idx} incident={incident} />
            ))}
          </div>
        </div>
      )}

      <DetectionBreakdown statistics={report.statistics} />

      {report.timeline && report.timeline.length > 0 && (
        <div>
          <h2 style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Timeline of Events
          </h2>
          <Timeline timeline={report.timeline} />
        </div>
      )}

      {incidents.length > 0 && <EvidenceGallery incidents={incidents} />}

      <IntelligenceAssessment report={report} />

      <RecommendationPanel recommendations={report.recommendations} />

      {incidents.length > 0 && <AnalystNotes incidents={incidents} />}

      <MetadataPanel report={report} job={report.job} />

      <DownloadPanel />

      <div className="report-footer">
        <p>Report generated automatically by Sentinelle AI Surveillance System</p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
          Classification: INTERNAL SECURITY
        </p>
      </div>
    </div>
  )
}

export default ReportViewerPage
