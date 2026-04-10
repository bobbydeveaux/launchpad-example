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
      <Code>{`cd providers/gcp/terraform/bootstrap

terraform init
terraform apply \\
  -var=platform_project=YOUR_GCP_PROJECT_ID \\
  -var=github_owner=YOUR_GITHUB_ORG_OR_USERNAME \\
  -var=region=europe-west1 \\
  -var=base_domain=yourdomain.com   # optional`}</Code>

      <h2>Set GitHub Variables</h2>
      <p>
        The <code>terraform output</code> after apply prints a summary of all GitHub Variables to set.
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
