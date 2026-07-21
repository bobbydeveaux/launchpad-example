import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function Kubernetes() {
  return (
    <DocPage slug="kubernetes">
      <p>
        For apps that need a real Kubernetes cluster — dispatching k8s Jobs, running a Helm chart —
        add a <code>kubernetes</code> block to <code>stackramp.yaml</code>. The app is Helm-installed
        into its own namespace on the platform's shared GKE cluster instead of Cloud Run.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The platform operator must enable GKE in the bootstrap <code>tfvars</code>:
      </p>
      <Code>{`# providers/gcp/terraform/bootstrap/dev.tfvars
enable_gke       = true
gke_zone         = "europe-west1-b"   # zonal, not regional
gke_machine_type = "e2-standard-8"`}</Code>
      <p>
        This provisions a zonal GKE Standard cluster (<code>{'stackramp-<env>'}</code>), the External
        Secrets Operator, a shared L7 Gateway with Certificate Manager wildcard certs, and a shared
        Cloud SQL client identity. Because the <code>helm</code>/<code>kubectl</code> providers need
        the cluster endpoint to exist, <code>bootstrap.sh</code> automatically runs a two-phase apply
        on a cold start (cluster first, then in-cluster resources).
      </p>

      <h2>Configuration</h2>
      <Code>{`name: my-app

domain: my-app.yourdomain.com

kubernetes:
  chart: deploy/helm/my-app   # Helm chart path (default: deploy/helm/<app>)
  namespace: my-app           # base namespace (default: app name)
  values:                     # inline Helm value overrides
    replicaCount: 2
  images:                     # images StackRamp builds + pushes before helm install
    - name: my-app-api
      dockerfile: Dockerfile.api
      context: .              # build context (default: repo root)
    - name: my-app-worker
      dockerfile: Dockerfile.worker

database: postgres`}</Code>

      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['chart', 'string', 'deploy/helm/<app>', 'Path to the Helm chart in the repo'],
          ['namespace', 'string', '<app>', 'Base namespace — the environment is appended (my-app-dev, my-app-prod)'],
          ['values', 'object', '{}', 'Inline Helm value overrides, merged with platform-injected values'],
          ['images', 'list', '[]', 'Images built and pushed to Artifact Registry, tagged with the git SHA'],
        ]}
      />
      <Callout type="info">
        Images <strong>not</strong> listed under <code>images</code> (e.g. a cross-repo dependency)
        must be pre-published and pinned in the chart's <code>values.yaml</code>. A k8s-only app
        (no <code>frontend</code> or <code>backend</code>) is valid.
      </Callout>

      <h2>Deploy flow</h2>
      <p>On each deploy, StackRamp:</p>
      <ol>
        <li>Builds and pushes every image in <code>images</code>, tagged with the commit SHA</li>
        <li>Runs <code>helm upgrade --install</code> into <code>{'<namespace>-<env>'}</code> with{' '}
          <code>--wait --timeout 10m</code></li>
      </ol>
      <p>Your chart receives these platform-injected values:</p>
      <Table
        headers={['Helm value', 'Description']}
        rows={[
          ['image.registry', 'Artifact Registry URL (<region>-docker.pkg.dev/<project>/stackramp-images)'],
          ['image.tag', 'Git commit SHA'],
          ['environment', 'dev, prod, or pr-<number>'],
          ['route.enabled / route.domain', 'Set when the app has a public host — wire these into an HTTPRoute'],
          ['route.gatewayName / route.gatewayNamespace', 'The shared Gateway (stackramp in stackramp-gateway)'],
          ['cloudsqlProxy.serviceAccount.gcpServiceAccount', 'Shared gke-cloudsql-client GSA for the Cloud SQL Auth Proxy'],
          ['externalSecrets.remotePrefix', 'Secret Manager prefix (<app>-<env>) for ExternalSecret refs'],
        ]}
      />

      <h2>Domains and ingress</h2>
      <p>
        k8s apps skip Firebase Hosting entirely. Instead, one shared global L7 Gateway fronts all
        k8s apps, with DNS-authorised Certificate Manager wildcard certs
        (<code>{'*.dev.<base_domain>'}</code> and <code>{'*.<base_domain>'}</code>) — so new apps get
        HTTPS with no per-app cert wait. Domain derivation matches Cloud Run apps:{' '}
        <code>{'<app>.dev.<base_domain>'}</code> in dev, <code>{'<app>.<base_domain>'}</code> (or your
        explicit <code>domain</code>) in prod. The platform creates an A-record pointing the host at
        the Gateway IP, and your chart attaches an <code>HTTPRoute</code> to the shared Gateway:
      </p>
      <Code>{`apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: {{ .Release.Name }}
spec:
  parentRefs:
    - name: {{ .Values.route.gatewayName }}
      namespace: {{ .Values.route.gatewayNamespace }}
      sectionName: https
  hostnames:
    - {{ .Values.route.domain }}
  rules:
    - backendRefs:
        - name: my-app-service
          port: 8080`}</Code>

      <h2>Secrets</h2>
      <p>
        Secrets flow through the External Secrets Operator — no plaintext in CI, no deploy-time sync.
        Platform-generated secrets live in Secret Manager as <code>{'<app>-<env>-<key>'}</code>, and
        your chart references them with an <code>ExternalSecret</code> against the cluster-wide{' '}
        <code>gcp-secret-manager</code> ClusterSecretStore:
      </p>
      <Code>{`apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: app-secrets
spec:
  secretStoreRef:
    name: gcp-secret-manager
    kind: ClusterSecretStore
  target:
    name: app-config
  data:
    - secretKey: JWT_SECRET
      remoteRef:
        key: "{{ .Values.externalSecrets.remotePrefix }}-jwt-secret"`}</Code>

      <h2>Database</h2>
      <p>
        <code>database: postgres</code> works the same as for Cloud Run apps — a database in the
        shared Cloud SQL instance, credentials in Secret Manager. The differences: the{' '}
        <code>DATABASE_URL</code> is in TCP form (<code>{'postgresql://user:pass@cloudsql-proxy:5432/db'}</code>),
        and your chart runs a Cloud SQL Auth Proxy whose <code>cloudsql-proxy</code> KSA is
        Workload-Identity-bound to the shared <code>gke-cloudsql-client</code> GSA. Keyless — no SA
        key files.
      </p>

      <h2>Limitations</h2>
      <Callout type="warning">
        <strong>The cluster is deliberately single-node.</strong> Apps that share node-local{' '}
        <code>hostPath</code> volumes require every pod on the same node, so{' '}
        <code>gke_node_count</code> must stay at <code>1</code> and the cluster is zonal. Scale{' '}
        <strong>vertically</strong> (bigger <code>gke_machine_type</code>), not horizontally. Moving
        past one node requires switching charts to RWX storage (e.g. Filestore) first.
      </Callout>
      <ul>
        <li>No IAP/SSO for k8s apps — implement auth in-app if needed</li>
        <li>Dev and prod share the cluster, separated by namespace (<code>my-app-dev</code>, <code>my-app-prod</code>)</li>
        <li>PR previews install into their own namespace (<code>{'<namespace>-pr-<number>'}</code>) and are removed on close</li>
      </ul>

      <h2>Operator gotcha: replacing the cluster</h2>
      <p>
        Changing a force-new attribute (like <code>gke_zone</code>) replaces the cluster, and{' '}
        <code>terraform plan</code> fails with "Kubernetes cluster unreachable" because the helm and
        kubectl providers can't reach the old endpoint. Remove the in-cluster resources from state
        first — they're recreated on the new cluster:
      </p>
      <Code>{`terraform state rm 'helm_release.external_secrets[0]' \\
  'kubectl_manifest.cluster_secret_store[0]'
./bootstrap.sh dev`}</Code>
    </DocPage>
  )
}
