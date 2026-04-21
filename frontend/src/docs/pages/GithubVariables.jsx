import DocPage, { Table, Callout } from '../DocPage.jsx'

export default function GithubVariables() {
  return (
    <DocPage slug="github-variables">
      <p>
        These are set at the GitHub organisation level so all repos inherit them.
        They are <strong>Variables</strong> (not Secrets) — set via Settings → Secrets and
        variables → Actions → Variables.
      </p>

      <h2>Required</h2>
      <Table
        headers={['Variable', 'Example', 'Description']}
        rows={[
          ['STACKRAMP_PROJECT', 'my-platform-dev', 'GCP project ID'],
          ['STACKRAMP_REGION', 'europe-west1', 'GCP region for all resources'],
          ['STACKRAMP_WIF_PROVIDER', 'projects/123/locations/global/...', 'Full Workload Identity provider resource name'],
          ['STACKRAMP_SA_EMAIL', 'stackramp-cicd-sa@proj.iam.gserviceaccount.com', 'Platform CI/CD service account email'],
        ]}
      />

      <h2>Optional</h2>
      <Table
        headers={['Variable', 'When needed', 'Description']}
        rows={[
          ['STACKRAMP_DNS_ZONE', 'Custom domains', 'Cloud DNS zone name (e.g. yourdomain-com)'],
          ['STACKRAMP_BASE_DOMAIN', 'Custom domains', 'Base domain for dev subdomains (e.g. stackramp.io)'],
          ['STACKRAMP_IAP_DOMAIN', 'SSO apps', 'Google Workspace domain allowed through IAP'],
          ['STACKRAMP_CLOUDSQL_CONNECTION', 'Database apps', 'Cloud SQL connection name (project:region:instance)'],
          ['STACKRAMP_VPC_CONNECTOR', 'SSO on restrictive orgs', 'Serverless VPC connector name — routes frontend traffic to internal backend via VPC'],
          ['STACKRAMP_FRONTEND_SA', 'SSO on restrictive orgs', 'Custom service account email for SSO frontend Cloud Run services'],
        ]}
      />

      <Callout type="info">
        All required variables are printed by <code>terraform output</code> after running the bootstrap.
      </Callout>

      <Callout type="info">
        <strong>Restrictive orgs:</strong> If your GCP org blocks <code>allUsers</code> IAM bindings
        (via <code>iam.allowedPolicyMemberDomains</code>), set <code>STACKRAMP_VPC_CONNECTOR</code>{' '}
        and <code>STACKRAMP_FRONTEND_SA</code> for SSO apps. The VPC connector routes frontend-to-backend
        traffic internally, and the frontend SA is granted <code>roles/run.invoker</code> on the backend.
      </Callout>
    </DocPage>
  )
}
