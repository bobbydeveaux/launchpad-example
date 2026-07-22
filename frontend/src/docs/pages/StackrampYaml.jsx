import DocPage, { Code, Table } from '../DocPage.jsx'

export default function StackrampYaml() {
  return (
    <DocPage slug="stackramp-yaml">
      <p>
        The <code>stackramp.yaml</code> file lives at the root of your repo and describes
        your app. Only <code>name</code> is required.
      </p>

      <h2>Full reference</h2>
      <Code>{`name: my-app                  # required — lowercase slug

frontend:
  framework: react            # react | vue | next | static | none
  dir: frontend               # source directory (default: frontend)
  node_version: "20"          # or use .nvmrc in frontend dir
  sso: false                  # serve behind Google IAP

backend:
  language: python            # python | go | node | rust | none
  dir: backend                # source directory (default: backend)
  port: 8080                  # listen port (default: 8080)
  memory: 512Mi               # Cloud Run memory (default: 512Mi)
  cpu: "1"                    # Cloud Run CPU (default: 1)
  min_instances: 0            # min warm instances (default: 0)
  access: iap                 # iap | machine | public | internal (v2)
  sso: false                  # deprecated sugar for access: iap

backends:                     # optional — extra services, each with its own access posture
  - name: ingest              # deploys as {app}-ingest-{env}
    language: go
    dir: backend              # same dir as backend: ⇒ one build, two services
    access: machine
    allowed_service_accounts:
      - caller@project.iam.gserviceaccount.com

mcp:                          # deprecated sugar — a machine backend on dir mcp (see MCP Servers)
  language: go                # go | python | node | rust
  dir: mcp                    # source directory (default: mcp)
  public: false               # open endpoint for MCP OAuth discovery
  allowed_service_accounts: [] # machine consumer SA emails

kubernetes:                   # optional — Helm release on shared GKE (see Kubernetes)
  chart: deploy/helm/my-app   # chart path (default: deploy/helm/<app>)
  namespace: my-app           # base namespace (default: app name)
  values: {}                  # inline Helm value overrides
  images: []                  # images to build + push (name/dockerfile/context)

domain: my-app.yourdomain.com # optional custom domain

database: false               # false | postgres | mysql
migrate: false                # false | true (language default) | "custom command"

storage: false                # false | gcs | block form with named buckets`}</Code>

      <p>
        An app must declare at least one of <code>frontend</code>, <code>backend</code>,{' '}
        <code>mcp</code>, or <code>kubernetes</code>.
      </p>

      <h2>Top-level fields</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['name', 'string', '(required)', 'Lowercase slug used for service names'],
          ['domain', 'string', '(none)', 'Custom domain — omit for .web.app URL'],
          ['database', 'string', 'false', 'false, postgres, or mysql'],
          ['migrate', 'string | boolean', 'false', 'Migration command run via Cloud Run Job before deploy. true = language default.'],
          ['storage', 'string | object', 'false', 'false, gcs, or a buckets: block with named buckets'],
        ]}
      />

      <h2>Frontend fields</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['framework', 'string', '(none)', 'react, vue, next, static, or none'],
          ['dir', 'string', 'frontend', 'Source directory'],
          ['node_version', 'string', '(auto)', 'Node.js version — or use .nvmrc'],
          ['sso', 'boolean', 'false', 'Serve behind IAP'],
        ]}
      />

      <h2>Backend fields</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['language', 'string', '(none)', 'python, go, node, rust, or none'],
          ['dir', 'string', 'backend', 'Source directory'],
          ['port', 'number', '8080', 'Listen port'],
          ['memory', 'string', '512Mi', 'Cloud Run memory limit'],
          ['cpu', 'string', '1', 'Cloud Run vCPU count'],
          ['min_instances', 'number', '0', 'Minimum warm Cloud Run instances (0 = scale to zero)'],
          ['access', 'string', 'public (iap if sso: true)', 'v2 access posture: iap, machine, public, or internal'],
          ['allowed_service_accounts', 'list', '[]', 'For access: machine — SA emails allowed to call this backend'],
          ['sso', 'boolean', 'false', 'Deprecated sugar for access: iap'],
        ]}
      />

      <h2>backends[] fields</h2>
      <p>
        Extra services beyond the primary backend, each deployed as{' '}
        <code>{'{app}-{name}-{env}'}</code>. Entries sharing a <code>dir</code> build one image.
        See <a href="/docs/access-model">Backends &amp; Access Model</a>.
      </p>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['name', 'string', '(required)', 'Service name suffix'],
          ['language', 'string', 'go', 'go, python, node, or rust'],
          ['dir', 'string', 'backend', 'Source directory — shared dir ⇒ shared image'],
          ['port / memory / cpu / min_instances', '—', '8080 / 512Mi / 1 / 0', 'As per backend'],
          ['access', 'string', 'public (iap if sso: true)', 'iap, machine, public, or internal'],
          ['allowed_service_accounts', 'list', '[]', 'For access: machine'],
        ]}
      />

      <h2>MCP fields (deprecated block)</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['language', 'string', 'go', 'go, python, node, or rust'],
          ['dir', 'string', 'mcp', 'Source directory'],
          ['port', 'number', '8080', 'Listen port'],
          ['memory', 'string', '256Mi', 'Cloud Run memory limit'],
          ['cpu', 'string', '1', 'Cloud Run vCPU count'],
          ['public', 'boolean', 'false', 'Deploy with --no-invoker-iam-check for external OAuth clients'],
          ['allowed_service_accounts', 'list', '[]', 'Machine consumer SA emails allowed to call the server'],
        ]}
      />
      <p>See <a href="/docs/mcp">MCP Servers</a> for the full auth model.</p>

      <h2>Kubernetes fields</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['chart', 'string', 'deploy/helm/<app>', 'Path to the Helm chart in the repo'],
          ['namespace', 'string', '<app>', 'Base namespace — env suffix appended (my-app-dev, my-app-prod)'],
          ['values', 'object', '{}', 'Inline Helm value overrides'],
          ['images', 'list', '[]', 'Images to build + push before helm install (name, dockerfile, context)'],
        ]}
      />
      <p>See <a href="/docs/kubernetes">Kubernetes (GKE)</a> for the chart contract and networking.</p>
    </DocPage>
  )
}
