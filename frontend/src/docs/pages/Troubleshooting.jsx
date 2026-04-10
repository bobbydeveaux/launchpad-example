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
    </DocPage>
  )
}
