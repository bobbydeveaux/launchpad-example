import DocPage, { Code, Callout } from '../DocPage.jsx'

export default function Storage() {
  return (
    <DocPage slug="storage">
      <p>
        Set <code>storage: gcs</code> in <code>stackramp.yaml</code> to provision a GCS bucket
        per environment.
      </p>

      <h2>Configuration</h2>
      <Code>{`name: my-app

backend:
  language: python
  dir: backend

storage: gcs`}</Code>

      <h2>Bucket naming</h2>
      <p>
        Buckets follow the convention <code>{'<project>-<app>-<env>'}</code>.
        For example: <code>my-project-my-app-dev</code>.
      </p>

      <h2>Accessing the bucket</h2>
      <p>
        The <code>STORAGE_BUCKET</code> env var is injected into Cloud Run at deploy time.
        Use it in your backend code:
      </p>
      <Code>{`import os
from google.cloud import storage

bucket_name = os.environ["STORAGE_BUCKET"]
client = storage.Client()
bucket = client.bucket(bucket_name)`}</Code>

      <Callout type="info">
        The Cloud Run service account has read/write access to the bucket automatically.
        No additional IAM configuration is needed.
      </Callout>
    </DocPage>
  )
}
