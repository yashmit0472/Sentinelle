const DownloadPanel = () => {
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadJSON = () => {
    // Stub implementation
    alert('JSON export will be implemented in a future release.')
  }

  const handleDownloadPDF = () => {
    // Stub implementation
    alert('PDF export will be implemented in a future release.')
  }

  return (
    <div className="report-detection-section">
      <h3 className="report-detection-section__title">Download & Export</h3>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '16px',
        }}
      >
        <button
          onClick={handlePrint}
          style={{
            padding: '12px 16px',
            background: 'rgba(82, 166, 255, 0.2)',
            border: '1px solid rgba(82, 166, 255, 0.4)',
            borderRadius: '12px',
            color: '#83c4ff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(82, 166, 255, 0.3)'
            e.target.style.borderColor = 'rgba(82, 166, 255, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(82, 166, 255, 0.2)'
            e.target.style.borderColor = 'rgba(82, 166, 255, 0.4)'
          }}
        >
          🖨️ Print Report
        </button>

        <button
          onClick={handleDownloadJSON}
          style={{
            padding: '12px 16px',
            background: 'rgba(82, 166, 255, 0.2)',
            border: '1px solid rgba(82, 166, 255, 0.4)',
            borderRadius: '12px',
            color: '#83c4ff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            opacity: 0.6,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(82, 166, 255, 0.3)'
            e.target.style.borderColor = 'rgba(82, 166, 255, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(82, 166, 255, 0.2)'
            e.target.style.borderColor = 'rgba(82, 166, 255, 0.4)'
          }}
          disabled
        >
          📄 Export JSON
        </button>

        <button
          onClick={handleDownloadPDF}
          style={{
            padding: '12px 16px',
            background: 'rgba(82, 166, 255, 0.2)',
            border: '1px solid rgba(82, 166, 255, 0.4)',
            borderRadius: '12px',
            color: '#83c4ff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            opacity: 0.6,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(82, 166, 255, 0.3)'
            e.target.style.borderColor = 'rgba(82, 166, 255, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(82, 166, 255, 0.2)'
            e.target.style.borderColor = 'rgba(82, 166, 255, 0.4)'
          }}
          disabled
        >
          📕 Download PDF
        </button>
      </div>

      <p
        style={{
          margin: '12px 0 0',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        PDF and JSON export features are coming in a future release.
      </p>
    </div>
  )
}

export default DownloadPanel
