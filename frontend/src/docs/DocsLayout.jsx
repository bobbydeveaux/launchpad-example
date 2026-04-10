import { useState } from 'react'
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { sections } from './content.js'
import './docs.css'

// Import all doc pages
import Overview from './pages/Overview.jsx'
import Bootstrap from './pages/Bootstrap.jsx'
import Onboarding from './pages/Onboarding.jsx'
import CustomDomains from './pages/CustomDomains.jsx'
import ApiRouting from './pages/ApiRouting.jsx'
import PrPreviews from './pages/PrPreviews.jsx'
import Sso from './pages/Sso.jsx'
import Storage from './pages/Storage.jsx'
import Secrets from './pages/Secrets.jsx'
import Database from './pages/Database.jsx'
import StackrampYaml from './pages/StackrampYaml.jsx'
import EnvVars from './pages/EnvVars.jsx'
import GithubVariables from './pages/GithubVariables.jsx'
import Dockerfile from './pages/Dockerfile.jsx'
import DeployFlow from './pages/DeployFlow.jsx'
import Troubleshooting from './pages/Troubleshooting.jsx'

const pageComponents = {
  '': Overview,
  'bootstrap': Bootstrap,
  'onboarding': Onboarding,
  'custom-domains': CustomDomains,
  'api-routing': ApiRouting,
  'pr-previews': PrPreviews,
  'sso': Sso,
  'storage': Storage,
  'secrets': Secrets,
  'database': Database,
  'stackramp-yaml': StackrampYaml,
  'env-vars': EnvVars,
  'github-variables': GithubVariables,
  'dockerfile': Dockerfile,
  'deploy-flow': DeployFlow,
  'troubleshooting': Troubleshooting,
}

function Sidebar({ open, onClose }) {
  const location = useLocation()

  return (
    <>
      {open && <div className="docs-overlay" onClick={onClose} />}
      <aside className={`docs-sidebar ${open ? 'open' : ''}`}>
        <div className="docs-sidebar-header">
          <Link to="/" className="docs-back">← stackramp.io</Link>
        </div>
        <nav className="docs-nav">
          {sections.map(section => (
            <div key={section.title} className="docs-nav-section">
              <div className="docs-nav-section-title">{section.title}</div>
              {section.pages.map(page => (
                <NavLink
                  key={page.slug}
                  to={`/docs${page.slug ? `/${page.slug}` : ''}`}
                  end={page.slug === ''}
                  className={({ isActive }) => `docs-nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {page.title}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="docs-sidebar-footer">
          <a href="https://github.com/bobbydeveaux/stackramp" target="_blank" rel="noreferrer" className="docs-nav-link external">
            GitHub →
          </a>
          <a href="https://dashboard.stackramp.io" target="_blank" rel="noreferrer" className="docs-nav-link external">
            Dashboard →
          </a>
        </div>
      </aside>
    </>
  )
}

export default function DocsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="docs-layout">
      <div className="docs-topbar">
        <button className="docs-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰ Docs
        </button>
        <Link to="/" className="docs-topbar-logo">🚀 StackRamp</Link>
      </div>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="docs-main">
        <Routes>
          {Object.entries(pageComponents).map(([slug, Component]) => (
            <Route
              key={slug}
              path={slug === '' ? '/' : slug}
              element={<Component />}
            />
          ))}
        </Routes>
      </main>
    </div>
  )
}
