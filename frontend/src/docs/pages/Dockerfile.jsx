import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function Dockerfile() {
  return (
    <DocPage slug="dockerfile">
      <p>
        If your backend directory contains a <code>Dockerfile</code>, StackRamp uses it as-is.
        Otherwise, a platform-provided Dockerfile is used based on your language setting.
      </p>

      <h2>Platform Dockerfiles</h2>
      <p>Built-in support for:</p>
      <ul>
        <li><strong>Python</strong> — installs <code>requirements.txt</code>, runs with gunicorn</li>
        <li><strong>Go</strong> — multi-stage build, compiles a static binary</li>
        <li><strong>Node</strong> — installs <code>package.json</code>, runs with node</li>
      </ul>

      <h2>Custom Dockerfile</h2>
      <p>
        Place a <code>Dockerfile</code> in your backend directory to override the default.
        It must listen on the port specified in <code>stackramp.yaml</code> (default <code>8080</code>).
      </p>

      <Code>{`# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "main:app", "-b", "0.0.0.0:8080"]`}</Code>

      <Callout type="info">
        The <code>PORT</code> environment variable is also set by Cloud Run.
        For maximum compatibility, listen on <code>$PORT</code> or the port in your config.
      </Callout>

      <h2>Build context</h2>
      <p>
        The Docker build context is your backend directory (e.g. <code>backend/</code>).
        The image is pushed to Artifact Registry and deployed to Cloud Run automatically.
      </p>
    </DocPage>
  )
}
