import { StrictMode, type CSSProperties, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

const App = lazy(() => import('./App.tsx'))

const loadingStyle: CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  background: '#1e293b',
  color: '#fbbf24',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '1.5rem',
  margin: 0,
}

/** Shows loading until App chunk is ready; surfaces load errors. */
function Bootstrap() {
  return (
    <Suspense fallback={<div style={loadingStyle}>Loading YunoBall…</div>}>
      <App />
    </Suspense>
  )
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;"><h1>Error</h1><p>Root element #root not found. Check index.html.</p></div>'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <Bootstrap />
          </AuthProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
  } catch (err) {
    rootEl.innerHTML = `<div style="padding:2rem;font-family:sans-serif;background:#0f172a;color:#f87171;min-height:100vh;"><h1>Error</h1><pre>${err instanceof Error ? err.message : String(err)}</pre></div>`
  }
}
