// Docs navigation structure and content
// Each section has a title and pages, each page has a slug, title, and content (JSX-compatible)

export const sections = [
  {
    title: 'Getting Started',
    pages: [
      { slug: '', title: 'Overview', description: 'What StackRamp is and how it works' },
      { slug: 'bootstrap', title: 'Platform Bootstrap', description: 'One-time operator setup' },
      { slug: 'onboarding', title: 'Onboarding an App', description: 'Two files. That\'s it.' },
    ],
  },
  {
    title: 'Features',
    pages: [
      { slug: 'custom-domains', title: 'Custom Domains', description: 'Automatic DNS and SSL' },
      { slug: 'api-routing', title: 'API Routing', description: '/api routing to Cloud Run' },
      { slug: 'pr-previews', title: 'PR Previews', description: 'Isolated preview environments' },
      { slug: 'sso', title: 'SSO via IAP', description: 'Google Identity-Aware Proxy' },
      { slug: 'storage', title: 'GCS Storage', description: 'Cloud Storage buckets' },
      { slug: 'secrets', title: 'Secrets', description: 'Secret Manager injection' },
      { slug: 'database', title: 'Database', description: 'Cloud SQL Postgres' },
    ],
  },
  {
    title: 'Reference',
    pages: [
      { slug: 'stackramp-yaml', title: 'stackramp.yaml', description: 'Config file reference' },
      { slug: 'env-vars', title: 'Environment Variables', description: 'Injected into Cloud Run' },
      { slug: 'github-variables', title: 'GitHub Variables', description: 'Platform configuration' },
      { slug: 'dockerfile', title: 'Custom Dockerfile', description: 'Bring your own Dockerfile' },
    ],
  },
  {
    title: 'Operations',
    pages: [
      { slug: 'deploy-flow', title: 'Deploy Flow', description: 'What happens on each push' },
      { slug: 'troubleshooting', title: 'Troubleshooting', description: 'Common issues and fixes' },
    ],
  },
]

// Flatten for easy lookup
export const allPages = sections.flatMap(s => s.pages)

export function findPage(slug) {
  return allPages.find(p => p.slug === slug)
}

export function findAdjacentPages(slug) {
  const idx = allPages.findIndex(p => p.slug === slug)
  return {
    prev: idx > 0 ? allPages[idx - 1] : null,
    next: idx < allPages.length - 1 ? allPages[idx + 1] : null,
  }
}
