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

      <h2>Configuration (v2)</h2>
      <p>
        An MCP server is a backend with an access posture — declare it in the{' '}
        <code>backends:</code> array. Use <code>access: machine</code> when it's called by service
        accounts (agents, workers), or <code>access: public</code> when human clients (Claude Code,
        Claude web) need MCP OAuth discovery and your app enforces auth itself. Declare both if you
        serve both kinds of caller — same <code>dir</code>, so it's still one build:
      </p>
      <Code>{`name: my-app

backend:
  language: python

backends:
  - name: mcp                 # deploys as my-app-mcp-{env}
    language: go
    dir: mcp                  # custom Dockerfile here overrides the platform one
    access: machine           # SA callers — or 'public' for OAuth discovery
    allowed_service_accounts:
      - agentops@my-project.iam.gserviceaccount.com`}</Code>
      <p>
        Fields (<code>name</code>, <code>language</code>, <code>dir</code>, <code>port</code>,{' '}
        <code>memory</code>, <code>cpu</code>, <code>access</code>,{' '}
        <code>allowed_service_accounts</code>) are documented in{' '}
        <a href="/docs/access-model">Backends &amp; Access Model</a>.
      </p>

      <h3>Legacy mcp: block (deprecated)</h3>
      <p>
        The v1 form still works — it normalises to a machine backend on dir <code>mcp</code>:
      </p>
      <Code>{`mcp:
  language: go                # go | python | node | rust (default: go)
  dir: mcp                    # source directory (default: mcp)
  port: 8080                  # listen port (default: 8080)
  memory: 256Mi               # Cloud Run memory (default: 256Mi)
  cpu: "1"                    # Cloud Run CPU (default: 1)
  public: false               # v2: access: public
  allowed_service_accounts:   # v2: access: machine + this list
    - agentops@my-project.iam.gserviceaccount.com`}</Code>
      <Callout type="warning">
        The legacy block conflates two consumers: <code>public: true</code> exists for human OAuth
        discovery, <code>allowed_service_accounts</code> for machine callers. In v2 those are
        distinct postures — pick the one your consumers actually use, or declare two backends.
      </Callout>

      <Callout type="info">
        An app can be <strong>MCP-only</strong> — an <code>mcp:</code> block without{' '}
        <code>frontend</code> or <code>backend</code> is a valid <code>stackramp.yaml</code>. Note
        the deployable guard doesn't count <code>backends:</code> alone yet — a backends-only app
        also needs one of <code>frontend</code>, <code>backend</code>, <code>mcp</code>, or{' '}
        <code>kubernetes</code>.
      </Callout>

      <h2>What gets provisioned</h2>
      <ul>
        <li>A Cloud Run service named <code>{'<app>-mcp-<env>'}</code> (e.g. <code>my-app-mcp-dev</code>)</li>
        <li>Built from <code>{'<dir>'}/Dockerfile</code> if present, otherwise the platform Dockerfile for the language</li>
        <li>Platform secrets (labelled <code>platform-inject=true</code>) mounted like any other service</li>
        <li>If the platform uses private Cloud SQL, the VPC connector is attached with{' '}
          <code>--vpc-egress=all-traffic</code> so the MCP server can reach the database and internal backends</li>
        <li>With the legacy <code>mcp:</code> block, the backend service gets an <code>MCP_URL</code>{' '}
          env var pointing at the MCP service's Cloud Run URL (not injected for <code>backends:</code> entries)</li>
      </ul>
      <p>
        MCP services are not mapped to custom domains — clients use the Cloud Run URL directly,
        or reach the server through the backend that wraps it.
      </p>

      <h2>Auth model</h2>
      <p>The access posture decides who can call the server and how they prove it:</p>

      <h3>access: machine</h3>
      <p>
        Deployed with <code>--no-invoker-iam-check</code> — network-reachable, with auth enforced{' '}
        <strong>in-app</strong>: your server verifies Google-signed ID tokens against the{' '}
        <code>STACKRAMP_SERVICE_ACCOUNTS</code> allow-list (see below). Stateless verification means
        agent access survives scale-to-zero.
      </p>

      <h3>access: public</h3>
      <p>
        Same deploy flags, but no allow-list — for endpoints external OAuth clients (Claude Code,
        Claude web, MCP Inspector) must reach for MCP OAuth discovery, with auth enforced by your
        MCP server's own OAuth flow.
      </p>

      <h3>Legacy mcp: private (default of the deprecated block)</h3>
      <p>
        The old <code>mcp:</code> block without <code>public: true</code> deploys with{' '}
        <code>--no-allow-unauthenticated</code> and grants <code>roles/run.invoker</code> to your{' '}
        <code>iap_allowed_domain</code> (from the bootstrap) — Cloud Run itself rejects callers
        without a Google-signed ID token. v2 machine backends don't use this IAM gate; they verify
        tokens in-app instead.
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
backends:
  - name: mcp
    dir: mcp
    access: machine
    allowed_service_accounts:
      - agentops@my-project.iam.gserviceaccount.com`}</Code>
      <p>
        The list is injected into the service as <code>STACKRAMP_SERVICE_ACCOUNTS</code>{' '}
        (semicolon-separated; also as the deprecated alias <code>MCP_SERVICE_ACCOUNTS</code>).
        Your server should:
      </p>
      <ol>
        <li>Verify the <code>Authorization: Bearer</code> ID token against Google's public keys</li>
        <li>Check the token's <code>aud</code> matches the service's own URL</li>
        <li>Check the token's <code>email</code> is in the <code>STACKRAMP_SERVICE_ACCOUNTS</code> allow-list</li>
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
