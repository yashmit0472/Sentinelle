import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/api'
import IncidentCard from '../components/incidents/IncidentCard'
import IncidentFilters from '../components/incidents/IncidentFilters'
import IncidentReviewModal from '../components/incidents/IncidentReviewModal'
import IncidentSearch from '../components/incidents/IncidentSearch'
import {
  detectionSourceOptions,
  severityOptions,
  statusOptions,
} from '../components/incidents/incidentConfig'

const IncidentsPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [activeIncident, setActiveIncident] = useState(null)

  const incidentsQuery = useQuery({
    queryKey: ['incidents', search, severity, status, source],
    queryFn: async () => {
      const response = await api.get('/incidents', {
        params: {
          latestOnly: true,
          search: search || undefined,
          severity: severity || undefined,
          status: status || undefined,
          source: source || undefined,
        },
      })

      return response.data
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ incidentId, payload }) => {
      const response = await api.patch(`/incidents/${incidentId}/status`, payload)
      return response.data
    },
    onSuccess: async (_, variables) => {
      setActiveIncident(null)
      await queryClient.invalidateQueries({
        queryKey: ['incidents'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['incident', variables.incidentId],
      })
    },
  })

  const incidents = incidentsQuery.data?.incidents || []

  const handleReset = () => {
    setSearch('')
    setSeverity('')
    setStatus('')
    setSource('')
  }

  return (
    <div className="incident-page">
      <section className="incident-hero">
        <div>
          <p className="incident-kicker">Incident Command</p>
          <h1>Threat investigation queue</h1>
          <p>
            Review incidents from the latest uploaded video, triage evidence,
            and move validated threats into the right operational status.
          </p>
        </div>

        <div className="incident-hero__stats">
          <div className="incident-hero__stat">
            <span>Visible incidents</span>
            <strong>{incidentsQuery.data?.count || 0}</strong>
          </div>

          <div className="incident-hero__stat">
            <span>Critical open</span>
            <strong>
              {
                incidents.filter(
                  (incident) =>
                    incident.severity === 'critical' &&
                    !['dismissed', 'closed'].includes(incident.reviewStatus)
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="incident-toolbar card">
        {incidentsQuery.data?.scope?.mode === 'latest_job' ? (
          <div className="incident-scope-banner">
            Showing incidents for the latest upload:
            {' '}
            <strong>
              {incidentsQuery.data.scope.videoName || 'Newest video job'}
            </strong>
          </div>
        ) : null}

        <IncidentSearch value={search} onChange={setSearch} />

        <IncidentFilters
          severity={severity}
          status={status}
          source={source}
          onSeverityChange={setSeverity}
          onStatusChange={setStatus}
          onSourceChange={setSource}
          severityOptions={severityOptions}
          statusOptions={statusOptions}
          sourceOptions={detectionSourceOptions}
          onReset={handleReset}
        />
      </section>

      {incidentsQuery.isLoading ? (
        <div className="incident-empty-state card">
          Loading incident intelligence...
        </div>
      ) : null}

      {incidentsQuery.isError ? (
        <div className="incident-empty-state card">
          Failed to load incidents. Please retry from the command center.
        </div>
      ) : null}

      {!incidentsQuery.isLoading && !incidentsQuery.isError && incidents.length === 0 ? (
        <div className="incident-empty-state card">
          No incidents match the current filters.
        </div>
      ) : null}

      <div className="incident-grid">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident._id}
            incident={incident}
            onReview={setActiveIncident}
          />
        ))}
      </div>

      <IncidentReviewModal
        incident={activeIncident}
        open={Boolean(activeIncident)}
        submitting={reviewMutation.isPending}
        onClose={() => setActiveIncident(null)}
        onSubmit={(payload) =>
          reviewMutation.mutateAsync({
            incidentId: activeIncident._id,
            payload,
          })
        }
      />
    </div>
  )
}

export default IncidentsPage
