import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [time, setTime] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/time`)
      .then(r => r.json())
      .then(data => setTime(data.formatted))
      .catch(() => setError('Could not reach backend'))
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚀 Launchpad Example</h1>
      <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Deployed via Launchpad — zero config, one push.
      </p>
      <div style={{ background: '#f4f4f4', borderRadius: 8, padding: '2rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: '#999', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current time from backend</p>
        {error
          ? <p style={{ color: '#c00', margin: 0 }}>{error}</p>
          : <p style={{ fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>{time ?? 'Loading…'}</p>
        }
      </div>
    </div>
  )
}
