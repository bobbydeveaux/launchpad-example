import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function CustomDomains() {
  return (
    <DocPage slug="custom-domains">
      <p>Set <code>domain:</code> in <code>stackramp.yaml</code>. StackRamp handles the rest automatically.</p>

      <h2>How it works</h2>
      <ul>
        <li><strong>Standard apps:</strong> Subdomain CNAME → Firebase Hosting, apex A records → Firebase IPs</li>
        <li><strong>SSO apps:</strong> CNAME → <code>ghs.googlehosted.com</code> via Cloud Run domain mapping, automatic SSL</li>
      </ul>

      <h2>Dev vs Prod</h2>
      <p>
        For <code>dev</code>, the subdomain is prefixed: <code>app.dev.yourdomain.com</code>.
        For <code>prod</code>, it uses the domain as-is: <code>app.yourdomain.com</code>.
      </p>
      <Code>{`# stackramp.yaml
name: my-app
domain: my-app.stackramp.io

# Results in:
# prod → my-app.stackramp.io
# dev  → my-app.dev.stackramp.io`}</Code>

      <h2>Zone auto-detection</h2>
      <p>
        StackRamp finds the Cloud DNS managed zone authoritative for your domain automatically
        (longest suffix match across the platform project's zones). One platform can serve apps on
        multiple base domains — e.g. <code>my-app.stackramp.io</code> and{' '}
        <code>os.flowbydeveaux.co.uk</code> — each app's records land in the right zone. If no zone
        matches, the domain is treated as external: Terraform skips Cloud DNS and you add the
        records at your registrar instead.
      </p>

      <Callout type="info">
        <strong>Requirement:</strong> the matching Cloud DNS zone must be authoritative for the
        domain (nameservers pointing at GCP) — or, for external domains, the printed records must
        be added at the registrar.
      </Callout>

      <p>If you don't set <code>domain:</code>, your app gets a <code>{'<app-name>-<random>'}.web.app</code> Firebase URL.</p>
    </DocPage>
  )
}
