import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function Mcp() {
  return (
    <DocPage slug="mcp">
      <p>
        Add an <code>mcp</code> block to <code>stackramp.yaml</code> to deploy a{' '}
        <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer">Model Context Protocol</a>{' '}
        server alongside your app. It runs as a separate Cloud Run service with its own auth model —
        no IAP, no <code>allUsers</code> bindings.
      </p>

      <Callout type="warning">
        <strong>v2:</strong> <code>mcp:</code> is now deprecated sugar. An MCP server was never a
        special kind of service — it's a backend with <code>access: machine</code> (SA callers) or{' '}
        <code>access: public</code> (OAuth discovery). Existing <code>mcp:</code> blocks keep
        working, but prefer declaring it in <a href="/docs/access-model">the backends array</a>{' '}
        going forward. The allow-list env var is now <code>STACKRAMP_SERVICE_ACCOUNTS</code>{' '}
        (<code>MCP_SERVICE_ACCOUNTS</code> is still injected as a deprecated alias).
      </Callout>

      <h2>Configuration</h2>
      <Code>{`name: my-app

backend:
  language: python

mcp:
  language: go                # go | python | node | rust (default: go)
  dir: mcp                    # source directory (default: mcp)
  port: 8080                  # listen port (default: 8080)
  memory: 256Mi               # Cloud Run memory (default: 256Mi)
  cpu: "1"                    # Cloud Run CPU (default: 1)
  public: false               # allow unauthenticated invocation (default: false)
  allowed_service_accounts:   # machine consumers allowed to call this server
    - agentops@my-project.iam.gserviceaccount.com`}</Code>

      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['language', 'string', 'go', 'go, python, node, or rust'],
          ['dir', 'string', 'mcp', 'Source directory — custom Dockerfile here overrides the platform one'],
          ['port', 'number', '8080', 'Listen port'],
          ['memory', 'string', '256Mi', 'Cloud Run memory limit'],
          ['cpu', 'string', '1', 'Cloud Run vCPU count'],
          ['public', 'boolean', 'false', 'Deploy with --no-invoker-iam-check for external OAuth clients'],
          ['allowed_service_accounts', 'list', '[]', 'Machine consumer SA emails, injected as MCP_SERVICE_ACCOUNTS'],
        ]}
      />

      <Callout type="info">
        An app can be <strong>MCP-only</strong> — <code>mcp</code> without <code>frontend</code> or{' '}
        <code>backend</code> is a valid <code>stackramp.yaml</code>.
      </Callout>

      <h2>What gets provisioned</h2>
      <ul>
        <li>A Cloud Run service named <code>{'<app>-mcp-<env>'}</code> (e.g. <code>my-app-mcp-dev</code>)</li>
        <li>Built from <code>{'<dir>'}/Dockerfile</code> if present, otherwise the platform Dockerfile for the language</li>
        <li>Platform secrets (labelled <code>platform-inject=true</code>) mounted like any other service</li>
        <li>If the platform uses private Cloud SQL, the VPC connector is attached with{' '}
          <code>--vpc-egress=all-traffic</code> so the MCP server can reach the database and internal backends</li>
        <li>The backend service gets an <code>MCP_URL</code> env var pointing at the MCP service's Cloud Run URL</li>
      </ul>
      <p>
        MCP services are not mapped to custom domains — clients use the Cloud Run URL directly,
        or reach the server through the backend that wraps it.
      </p>

      <h2>Auth model</h2>
      <p>There are two modes, controlled by <code>mcp.public</code>:</p>

      <h3>Private (default)</h3>
      <p>
        The service deploys with <code>--no-allow-unauthenticated</code>. Callers must present a
        Google-signed ID token, and <code>roles/run.invoker</code> is granted to your{' '}
        <code>iap_allowed_domain</code> (from the bootstrap). Machine consumers authenticate the same
        way — see below.
      </p>

      <h3>Public</h3>
      <p>
        <code>public: true</code> deploys with <code>--no-invoker-iam-check</code>. This makes the
        endpoint reachable by external OAuth clients (Claude Code, Claude web, MCP Inspector) — which
        is required for MCP OAuth discovery — while auth is enforced <strong>in-app</strong> by your
        MCP server's own OAuth flow.
      </p>
      <Callout type="info">
        <strong>Why not --allow-unauthenticated?</strong> That flag adds an <code>allUsers</code> IAM
        binding, which orgs with <code>iam.allowedPolicyMemberDomains</code> (Domain Restricted
        Sharing) reject. <code>--no-invoker-iam-check</code> opens the endpoint without any IAM
        binding, so it works on restrictive orgs too.
      </Callout>

      <h2>Machine consumers</h2>
      <p>
        Machine consumers are service accounts for <em>systems</em> (an agent runner, a background
        worker) that need to call MCP servers without user credentials. They're provisioned once at
        bootstrap and shared across all apps:
      </p>
      <Code>{`# providers/gcp/terraform/bootstrap/dev.tfvars
machine_consumers     = ["agentops"]  # -> agentops@<project>.iam.gserviceaccount.com
machine_consumer_keys = true          # optional: store a JSON key in Secret Manager`}</Code>
      <p>
        These SAs hold <strong>no project IAM roles</strong> — they exist purely as verifiable
        identities in Google-signed ID tokens. Each app then decides which consumers it trusts,
        reviewable in git:
      </p>
      <Code>{`# stackramp.yaml
mcp:
  allowed_service_accounts:
    - agentops@my-project.iam.gserviceaccount.com`}</Code>
      <p>
        The list is injected into the MCP service as <code>MCP_SERVICE_ACCOUNTS</code>{' '}
        (semicolon-separated). Your server should:
      </p>
      <ol>
        <li>Verify the <code>Authorization: Bearer</code> ID token against Google's public keys</li>
        <li>Check the token's <code>aud</code> matches the service's own URL</li>
        <li>Check the token's <code>email</code> is in the <code>MCP_SERVICE_ACCOUNTS</code> allow-list</li>
      </ol>

      <h3>Consumer-side authentication</h3>
      <p>
        With <code>machine_consumer_keys = true</code>, each consumer's JSON key is stored in Secret
        Manager as <code>{'machine-consumer-<name>-key'}</code>:
      </p>
      <Code>{`gcloud secrets versions access latest \\
  --secret=machine-consumer-agentops-key > agentops-sa.json`}</Code>
      <p>
        The consumer uses the key to mint an ID token with the MCP service URL as the audience, and
        sends it as a bearer token.
      </p>
      <Callout type="warning">
        With <code>machine_consumer_keys = true</code>, the private key passes through Terraform
        state once. Only use it on single-operator platforms with a locked-down state bucket —
        otherwise leave it <code>false</code> and mint keys manually with{' '}
        <code>gcloud iam service-accounts keys create</code>.
      </Callout>
    </DocPage>
  )
}
