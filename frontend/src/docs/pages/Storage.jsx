import DocPage, { Code, Table, Callout } from '../DocPage.jsx'

export default function Storage() {
  return (
    <DocPage slug="storage">
      <p>
        StackRamp provisions private GCS buckets per environment. There are two forms: the legacy
        single-bucket scalar, and the block form for one or more named buckets.
      </p>

      <h2>Named buckets (block form)</h2>
      <Code>{`name: my-app

backend:
  language: python

storage:
  buckets:
    - name: downloads         # env var BUCKET_DOWNLOADS
      signed_urls: true       # keyless V4 signed URLs (signBlob, no key file)
      lifecycle_days: 30      # delete objects after 30 days (0 = keep forever)
    - name: uploads           # env var BUCKET_UPLOADS`}</Code>

      <Table
        headers={['Field', 'Type', 'Default', 'Description']}
        rows={[
          ['name', 'string', '(required)', 'Logical name — bucket is {project}-{app}-{env}-{name}, injected as BUCKET_<NAME>'],
          ['access', 'string', 'private', 'Only private is supported — public access prevention is enforced'],
          ['signed_urls', 'boolean', 'false', 'Grant the runtime SA token-creator on itself so the backend can mint keyless V4 signed URLs'],
          ['lifecycle_days', 'number', '0', 'Age-based delete rule in days (0 = no rule)'],
        ]}
      />

      <h2>Legacy single bucket</h2>
      <Code>{`storage: gcs`}</Code>
      <p>
        Provisions one bucket named <code>{'<project>-<app>-<env>'}</code> and injects it as{' '}
        <code>GCS_BUCKET</code>.
      </p>

      <h2>Accessing a bucket</h2>
      <p>Read the injected env var — no bucket names hardcoded:</p>
      <Code>{`import os
from google.cloud import storage

bucket_name = os.environ["BUCKET_DOWNLOADS"]  # or GCS_BUCKET (legacy form)
client = storage.Client()
bucket = client.bucket(bucket_name)`}</Code>

      <Callout type="info">
        The Cloud Run service account has read/write access to each bucket automatically.
        No additional IAM configuration is needed.
      </Callout>
    </DocPage>
  )
}
