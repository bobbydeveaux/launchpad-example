export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚀 Launchpad Example</h1>
      <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Deployed via Launchpad — zero config, one push.
      </p>
      <div style={{ background: '#f4f4f4', borderRadius: 8, padding: '1.5rem', textAlign: 'left' }}>
        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <strong>launchpad.yaml</strong> → push → done.
        </p>
      </div>
    </div>
  )
}
