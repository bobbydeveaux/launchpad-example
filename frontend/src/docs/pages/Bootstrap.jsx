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

      <h2>Dev vs Prod bootstrap</h2>
      <p>
        The bootstrap supports <code>dev</code> and <code>prod</code> environments. App developers
        control their own dev/prod environments (e.g. <code>my-app-dev</code>, <code>my-app-prod</code>)
        within whichever platform you deploy — the platform environment is separate from app environments.
      </p>
      <p>
        Use <code>./bootstrap.sh dev</code> to test the platform setup and validate changes.
        Then run <code>./bootstrap.sh prod</code> for the real deployment. The GitHub Variables
        you set at the org level should be the outputs from <code>bootstrap.sh prod</code>.
      </p>
      <Code>{`# Test platform changes
./bootstrap.sh dev

# Deploy the real platform — use THESE outputs for GitHub Variables
./bootstrap.sh prod`}</Code>
      <Callout type="info">
        A future version will support fully separate platform projects per environment (different
        GCP projects for dev and prod platforms) for billing separation and stricter IAM boundaries.
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
          ['STACKRAMP_VPC_CONNECTOR', 'VPC connector name — only if postgres_private_ip was set'],
          ['STACKRAMP_FRONTEND_SA', 'Frontend SA email — only for restrictive orgs with SSO'],
        ]}
      />

      <Callout type="info">
        <strong>DNS note:</strong> if <code>base_domain</code> is set, the bootstrap creates a Cloud DNS
        managed zone. Point your domain's nameservers at the outputted nameservers at your registrar
        before deploying any apps with custom domains.
      </Callout>

      <h2>Bootstrap options</h2>
      <Table
        headers={['Variable', 'Type', 'Default', 'Description']}
        rows={[
          ['platform_project', 'string', '(required)', 'GCP project ID'],
          ['github_owner', 'string', 'bobbydeveaux', 'GitHub org or username'],
          ['environment', 'string', 'dev', 'dev or prod'],
          ['region', 'string', 'europe-west1', 'GCP region — must support domain mappings for SSO'],
          ['base_domain', 'string', '(none)', 'Domain for apps (e.g. stackramp.io)'],
          ['create_dns_zone', 'bool', 'true', 'Create Cloud DNS zone for base_domain'],
          ['enable_postgres', 'bool', 'false', 'Provision shared Cloud SQL Postgres instance'],
          ['postgres_private_ip', 'bool', 'false', 'Use private IP for Cloud SQL (requires VPC connector at ~£52/month). When false, uses public IP with Cloud SQL Auth Proxy — no VPC cost'],
          ['postgres_tier', 'string', 'db-f1-micro', 'Cloud SQL machine tier'],
          ['iap_allowed_domain', 'string', '(none)', 'Google Workspace domain for IAP access control'],
          ['platform_secrets', 'list(string)', '[]', 'Secret names to create in Secret Manager'],
        ]}
      />

      <Callout type="info">
        <strong>Cost tip:</strong> With <code>postgres_private_ip = false</code> (default), Cloud SQL uses
        public IP and connects via the Cloud SQL Auth Proxy — no VPC or connector needed. This saves ~£52/month.
        Only set <code>postgres_private_ip = true</code> if your org policy restricts public IPs on Cloud SQL.
      </Callout>

      <h2>Workload Identity Federation</h2>
      <p>
        The bootstrap creates a Workload Identity Federation (WIF) pool that trusts GitHub Actions
        OIDC tokens. The trust is scoped to the <code>github_owner</code> set in your tfvars —
        any repo owned by that org or user can authenticate to GCP automatically:
      </p>
      <Code>{`# attribute_condition in the WIF provider:
attribute.repository_owner == 'your-github-org'`}</Code>
      <p>
        This means any new repo in your org that adds the StackRamp deploy workflow will
        authenticate to GCP out of the box — no per-repo IAM configuration needed.
      </p>
    </DocPage>
  )
}
