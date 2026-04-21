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
