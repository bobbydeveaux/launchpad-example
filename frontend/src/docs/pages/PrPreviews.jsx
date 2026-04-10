import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function PrPreviews() {
  return (
    <DocPage slug="pr-previews">
      <p>
        Every pull request gets its own isolated preview environment with a unique URL.
        Backend, frontend, and API routing all work — previews are fully functional.
      </p>

      <h2>What happens on a PR</h2>
      <ul>
        <li>Backend deploys as a Cloud Run service named <code>{'<app>-pr-<number>'}</code></li>
        <li>Frontend deploys to a Firebase preview channel scoped to <code>pr-{'<number>'}</code></li>
        <li>Firebase wires <code>/api/**</code> rewrites to the PR-scoped Cloud Run service</li>
        <li>A comment is posted on the PR with the preview URL</li>
      </ul>

      <h2>Multiple PRs</h2>
      <p>
        Each PR gets its own independent environment. PR #21 deploys to <code>my-app-pr-21</code>,
        PR #22 to <code>my-app-pr-22</code>, and so on. No collisions.
      </p>

      <h2>Cleanup</h2>
      <p>
        When a PR is closed or merged, StackRamp automatically deletes the Cloud Run preview
        service and the Firebase preview channel. Preview channels also auto-expire after 7 days
        as a safety net.
      </p>

      <Callout type="info">
        <strong>Required:</strong> Your deploy workflow must include{' '}
        <code>pull_request: types: [opened, synchronize, reopened, closed]</code> for
        cleanup to trigger on PR close.
      </Callout>

      <h2>Deploy workflow</h2>
      <Code>{`# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, closed]
  workflow_dispatch:`}</Code>
    </DocPage>
  )
}
