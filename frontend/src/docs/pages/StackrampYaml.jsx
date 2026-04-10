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
  language: python            # python | go | node | none
  dir: backend                # source directory (default: backend)
  port: 8080                  # listen port (default: 8080)
  memory: 512Mi               # Cloud Run memory (default: 512Mi)
  cpu: "1"                    # Cloud Run CPU (default: 1)
  sso: false                  # put behind Google IAP

domain: my-app.yourdomain.com # optional custom domain

database: false               # false | postgres | mysql

storage: false                # false | gcs`}</Code>

      <h2>Top-level fields</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['name', 'string', '(required)', 'Lowercase slug used for service names'],
          ['domain', 'string', '(none)', 'Custom domain — omit for .web.app URL'],
          ['database', 'string', 'false', 'false, postgres, or mysql'],
          ['storage', 'string', 'false', 'false or gcs'],
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
          ['language', 'string', '(none)', 'python, go, node, or none'],
          ['dir', 'string', 'backend', 'Source directory'],
          ['port', 'number', '8080', 'Listen port'],
          ['memory', 'string', '512Mi', 'Cloud Run memory limit'],
          ['cpu', 'string', '1', 'Cloud Run vCPU count'],
          ['sso', 'boolean', 'false', 'Put behind IAP'],
        ]}
      />
    </DocPage>
  )
}
