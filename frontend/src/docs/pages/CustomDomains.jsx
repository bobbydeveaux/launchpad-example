import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function CustomDomains() {
  return (
    <DocPage slug="custom-domains">
      <p>Set <code>domain:</code> in <code>stackramp.yaml</code>. StackRamp handles the rest automatically.</p>

      <h2>How it works</h2>
      <ul>
        <li><strong>Subdomain</strong> (<code>app.yourdomain.com</code>): CNAME → Firebase site, SSL auto-provisioned</li>
        <li><strong>Apex domain</strong> (<code>yourdomain.com</code>): A records → Firebase's load balancer IPs</li>
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

      <Callout type="info">
        <strong>Requirement:</strong> <code>STACKRAMP_DNS_ZONE</code> must be set as a GitHub Variable
        and the Cloud DNS zone must be authoritative for the domain (nameservers pointing to GCP).
      </Callout>

      <p>If you don't set <code>domain:</code>, your app gets a <code>{'<app-name>-<random>'}.web.app</code> Firebase URL.</p>
    </DocPage>
  )
}
