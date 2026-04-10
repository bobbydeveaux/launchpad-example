import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function Bootstrap() {
  return (
    <DocPage slug="bootstrap">
      <p>
        The bootstrap provisions all shared GCP infrastructure: APIs, Artifact Registry,
        Firebase project, Workload Identity Federation, and optionally a Cloud DNS zone.
        This is run <strong>once</strong> by a platform operator.
      </p>

      <h2>Run the bootstrap</h2>
      <p>
        Copy the example tfvars, fill in your values, then run the bootstrap script:
      </p>
      <Code>{`cd providers/gcp/terraform/bootstrap

cp terraform.tfvars.example dev.tfvars
# Edit dev.tfvars with your project ID, region, etc.

./bootstrap.sh dev`}</Code>
      <p>
        The script handles everything: GCP auth checks, state bucket creation, Terraform init,
        plan, and apply. It prints the GitHub Variables to set at the end.
      </p>

      <h2>Single platform (current)</h2>
      <Callout type="info">
        Currently, StackRamp uses a single GCP project for both <code>dev</code> and <code>prod</code> app
        environments. One <code>bootstrap.sh dev</code> run, one set of GitHub Variables. Both{' '}
        <code>my-app-dev</code> and <code>my-app-prod</code> Cloud Run services live in the same
        project, isolated by naming convention. A future version will support separate platform
        projects per environment for billing separation and stricter IAM boundaries.
      </Callout>

      <h2>Set GitHub Variables</h2>
      <p>
        The bootstrap output prints all GitHub Variables to set.
        Set these at the <strong>organisation level</strong>: Settings → Secrets and variables → Actions → Variables.
      </p>

      <Table
        headers={['Variable', 'Description']}
        rows={[
          ['STACKRAMP_PROJECT', 'GCP project ID'],
          ['STACKRAMP_REGION', 'GCP region (e.g. europe-west1)'],
          ['STACKRAMP_WIF_PROVIDER', 'Full Workload Identity provider resource name'],
          ['STACKRAMP_SA_EMAIL', 'Platform CI/CD service account email'],
          ['STACKRAMP_DNS_ZONE', 'Cloud DNS zone name — only if base_domain was set'],
          ['STACKRAMP_BASE_DOMAIN', 'Base domain (e.g. yourdomain.com)'],
          ['STACKRAMP_CLOUDSQL_CONNECTION', 'Cloud SQL connection name — only if enable_postgres was set'],
          ['STACKRAMP_IAP_DOMAIN', 'Google Workspace domain — only if iap_allowed_domain was set'],
        ]}
      />

      <Callout type="info">
        <strong>DNS note:</strong> if <code>base_domain</code> is set, the bootstrap creates a Cloud DNS
        managed zone. Point your domain's nameservers at the outputted nameservers at your registrar
        before deploying any apps with custom domains.
      </Callout>
    </DocPage>
  )
}
