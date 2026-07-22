import DocPage, { Code } from '../DocPage.jsx'

export default function Troubleshooting() {
  return (
    <DocPage slug="troubleshooting">
      <p>Common issues and how to fix them.</p>

      <h2>Deploy skipped — jobs not running</h2>
      <p>
        The paths-filter detected no changes in the watched directories. Push a real file change
        in <code>frontend/</code> or <code>backend/</code>, or trigger via <code>workflow_dispatch</code>.
      </p>

      <h2>Firebase domain stuck on "Needs setup"</h2>
      <p>
        The CNAME record needs to propagate before Firebase can verify ownership. This usually
        takes a few minutes. Check Cloud DNS has the correct CNAME pointing to{' '}
        <code>{'<site-id>'}.web.app</code>. Firebase will mint the SSL cert once DNS propagates.
      </p>

      <h2>Error 409: Resource already exists</h2>
      <p>A previous failed run partially created a Cloud Run service. Delete it manually and re-trigger:</p>
      <Code>{`gcloud run services delete <app>-<env> \\
  --region=<region> --project=<project>`}</Code>

      <h2>Firebase site ID globally reserved</h2>
      <p>
        Firebase site IDs are globally unique and held for 30 days after deletion.
        StackRamp appends a random suffix to all site IDs (e.g. <code>my-app-v9y8b-prod</code>)
        and uses <code>{'lifecycle { ignore_changes = [site_id] }'}</code> to prevent recreating
        existing sites. A fresh suffix is generated automatically.
      </p>

      <h2>PR preview URL missing from comment</h2>
      <p>
        Ensure both frontend and backend are deploying on PRs. The Firebase preview channel
        needs the Cloud Run service to exist for API rewrites. Check that your workflow includes{' '}
        <code>pull_request: types: [opened, synchronize, reopened, closed]</code>.
      </p>

      <h2>SSO returning 403</h2>
      <p>
        Check that <code>STACKRAMP_IAP_DOMAIN</code> is set correctly. If unset, any Google account
        is allowed. If set, only accounts from that domain can access the app.
      </p>

      <h2>SSO backend returning 401</h2>
      <p>
        If your SSO app's <code>/api/*</code> calls return 401, check these in order:
      </p>
      <ol>
        <li><strong>Identity token audience:</strong> The Go proxy fetches an identity token
          with the backend's Cloud Run URL as the audience. Check the <code>BACKEND_URL</code>{' '}
          env var on the frontend Cloud Run service matches the backend's URL exactly.</li>
        <li><strong>IAM binding:</strong> The frontend service account needs{' '}
          <code>roles/run.invoker</code> on the backend. Check with{' '}
          <Code>{`gcloud run services get-iam-policy <app>-<env> \\
  --region=<region> --project=<project>`}</Code></li>
        <li><strong>Restrictive org + no VPC connector:</strong> If your org blocks{' '}
          <code>allUsers</code> and you haven't set <code>STACKRAMP_VPC_CONNECTOR</code>,
          the backend's <code>--allow-unauthenticated</code> flag is silently ignored.
          Set <code>STACKRAMP_VPC_CONNECTOR</code> and <code>STACKRAMP_FRONTEND_SA</code> to
          use the VPC-based auth path.</li>
      </ol>

      <h2>Machine backend / MCP server returning 401/403</h2>
      <p>
        Check these in order: the caller's SA email is listed in{' '}
        <code>allowed_service_accounts</code> (and shows up in the service's{' '}
        <code>STACKRAMP_SERVICE_ACCOUNTS</code> env var — v1 apps read the deprecated{' '}
        <code>MCP_SERVICE_ACCOUNTS</code> alias); the ID token's audience is the service's exact
        Cloud Run URL; and for legacy private <code>mcp:</code> servers, the caller's identity is
        covered by the <code>roles/run.invoker</code> binding. If external OAuth clients (Claude
        Code, MCP Inspector) can't reach the endpoint at all, it needs{' '}
        <code>access: public</code> for OAuth discovery.
      </p>

      <h2>Bootstrap: "Kubernetes cluster unreachable"</h2>
      <p>
        You changed a force-new attribute on the GKE cluster (e.g. <code>gke_zone</code>), so
        Terraform wants to replace it, but the helm/kubectl providers can't reach the old endpoint.
        Remove the in-cluster resources from state and re-run — they're recreated on the new cluster:
      </p>
      <Code>{`terraform state rm 'helm_release.external_secrets[0]' \\
  'kubectl_manifest.cluster_secret_store[0]'
./bootstrap.sh dev`}</Code>

      <h2>Helm release fails with RBAC "attempting to grant permissions not currently held"</h2>
      <p>
        Kubernetes' RBAC escalation check resolves permissions from native RBAC only, not from GCP
        IAM. The bootstrap binds the CI/CD service account to the built-in <code>edit</code>{' '}
        ClusterRole for exactly this reason — if you see this error, the platform bootstrap is out of
        date. Re-run <code>./bootstrap.sh</code>. Charts also can't grant more than <code>edit</code>{' '}
        allows.
      </p>

      <h2>Terraform state lock error</h2>
      <p>
        If two deploys run simultaneously for the same app, one may fail with a state lock error.
        Re-trigger the failed deploy — the lock is released automatically when the other run finishes.
        If the lock is stuck, manually unlock:
      </p>
      <Code>{`terraform force-unlock <LOCK_ID>`}</Code>
    </DocPage>
  )
}
