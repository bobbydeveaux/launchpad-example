import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function AccessModel() {
  return (
    <DocPage slug="access-model">
      <p>
        StackRamp v2 replaces the scattered <code>sso</code> / <code>mcp</code> /{' '}
        <code>public</code> booleans with one first-class field: <code>access</code>. Every backend
        has an access posture, and an app can declare <strong>more than one backend</strong> — the
        same code exposed under different postures, built once.
      </p>

      <h2>The four postures</h2>
      <Table
        headers={['access', 'Who calls it', 'How auth works', 'Replaces (v1)']}
        rows={[
          ['iap', 'Humans (staff)', 'Google IAP — the SSO proxy forwards X-Stackramp-User-Email / -Id', 'sso: true'],
          ['machine', 'Service accounts', 'Google-signed ID tokens verified in-app against allowed_service_accounts', 'mcp + allowed_service_accounts'],
          ['public', 'Anyone reachable', 'The app\'s own OAuth (e.g. MCP discovery) or none — deployed with --no-invoker-iam-check', 'mcp.public / backend without sso'],
          ['internal', 'Other services', 'Cloud Run invoker IAM, --ingress=internal (VPC only)', '(new — was implicit)'],
        ]}
      />
      <Callout type="info">
        <code>machine</code> and <code>public</code> share the same deploy flags —{' '}
        <code>--no-invoker-iam-check</code>, not <code>--allow-unauthenticated</code> — so neither
        adds an <code>allUsers</code> IAM binding and both work on orgs with Domain Restricted
        Sharing. They differ only in whether the platform injects the SA allow-list and what your
        app enforces.
      </Callout>

      <h2>Multiple backends</h2>
      <p>
        Declare extra services with a <code>backends:</code> array. Each entry needs a{' '}
        <code>name</code> and deploys as <code>{'{app}-{name}-{env}'}</code>. This is the real-world
        shape (from qbot — a trading dashboard whose bot posts telemetry):
      </p>
      <Code>{`name: qbot
domain: qbot.stackramp.io

frontend:
  framework: vite
  dir: frontend
  sso: true

backend:                 # dashboard READ API — humans via IAP
  language: go
  dir: backend
  sso: true              # ≡ access: iap

backends:
  - name: ingest         # bot telemetry — machines
    language: go
    dir: backend         # ← SAME dir ⇒ built once, deployed twice
    access: machine
    allowed_service_accounts:
      - qbot-ingest@bj-platform-dev.iam.gserviceaccount.com

database: postgres`}</Code>

      <h3>Build once, expose many</h3>
      <p>
        Backends that share a <code>dir</code> produce <strong>one</strong> image (tagged with the
        git SHA); each backend is a separate Cloud Run deploy of that same image with its own
        access flags, name, and URL. Above, <code>qbot-backend-prod</code> (IAP) and{' '}
        <code>qbot-ingest-prod</code> (machine) run the same binary. Both deployments carry all
        routes, so enforcement happens twice: at the front door (ingress/IAP) and in-app — a human
        hitting the ingest service has no valid ID token, a bot hitting the dashboard service has
        no IAP identity.
      </p>
      <p>
        If two backends have genuinely different code, give them different <code>dir</code>s and
        they build independently.
      </p>

      <h2>backends[] fields</h2>
      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['name', 'string', '(required)', 'Service name suffix — deploys as {app}-{name}-{env}'],
          ['language', 'string', 'go', 'go, python, node, or rust'],
          ['dir', 'string', 'backend', 'Source dir — shared dir means shared image'],
          ['port', 'number', '8080', 'Listen port'],
          ['memory / cpu', 'string', '512Mi / 1', 'Cloud Run resources'],
          ['min_instances', 'number', '0', 'Minimum warm instances'],
          ['access', 'string', 'public (iap if sso: true)', 'iap, machine, public, or internal'],
          ['allowed_service_accounts', 'list', '[]', 'For access: machine — SA emails allowed to call this service'],
        ]}
      />

      <h2>What the machine backend receives</h2>
      <p>
        For <code>access: machine</code>, the platform injects the allow-list semicolon-joined as{' '}
        <code>STACKRAMP_SERVICE_ACCOUNTS</code> (and as the deprecated v1 alias{' '}
        <code>MCP_SERVICE_ACCOUNTS</code> for a grace period). Verify callers with any Google
        ID-token library: check the signature against Google's JWKS, check <code>aud</code> matches
        your service URL, and check the token's <code>email</code> is in the allow-list.
      </p>
      <Callout type="info">
        The allow-list strings are passed through <strong>verbatim</strong>, so apps can layer
        conventions on top — e.g. FlowOS encodes per-identity capability as{' '}
        <code>sa-email=read</code> / <code>sa-email=write</code> and enforces the scope in its own
        write handlers. To the platform it's still just the injected string.
      </Callout>

      <h2>Deploy behaviour today</h2>
      <ul>
        <li>The singular <code>backend:</code> (with <code>sso</code>/<code>access: iap</code>) keeps
          the existing provisioned path — Terraform, custom domains, IAP.</li>
        <li><code>backends:</code> entries with <code>access: machine</code> or{' '}
          <code>public</code> self-deploy via a matrixed job — one lean Cloud Run deploy per entry,
          no Terraform provisioning, no custom domain (clients use the Cloud Run URL).</li>
        <li><code>mcp:</code> and <code>sso:</code> still work as deprecated sugar — <code>mcp:</code>{' '}
          normalises to a machine backend on dir <code>mcp</code>. Prefer saying what you mean with{' '}
          <code>backends:</code> + <code>access:</code>.</li>
      </ul>

      <Callout type="warning">
        <strong>Version pinning:</strong> v2 lands as the <code>v2.0.0</code> tag of the platform
        workflow. If your deploy workflow tracks <code>@main</code> and you're not ready to
        migrate, pin to the final v1 release instead:{' '}
        <code>uses: bobbydeveaux/stackramp/.github/workflows/platform.yml@v1.2.0</code>. The{' '}
        <code>backends:</code> array and <code>access</code> field are already available on{' '}
        <code>@main</code> as an additive change.
      </Callout>
    </DocPage>
  )
}
