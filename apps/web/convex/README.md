# Convex SME Specs

This Convex setup stores the SME catalog and per-app product specs used by the `/sme-apps` page.
It also includes an optional control-plane ingestion endpoint for mirrored orchestration events
from the local T3 server runtime.

## Data model

Table: `smeAppSpecs`

- `sourceId` (number): stable ID from the local catalog.
- `slug` (string): unique slug for lookup.
- `name`, `category`, `idealFor`, `value` (string): high-level app metadata.
- `complexity` (`low | medium | high`): indexed complexity field.
- `spec` (object): detailed product spec:
  - `problem`
  - `targetUsers[]`
  - `mvpFeatures[]`
  - `coreEntities[]`
  - `integrations[]`
  - `automationOpportunities[]`
  - `kpis[]`
  - `complexity`
  - `estimatedBuildWeeks`
  - `pricingModel`
  - `launchMotion`
- `createdAt`, `updatedAt` (epoch ms).

Table: `controlPlaneEvents`

- `eventId` (string): unique orchestration event id from the local server.
- `sequence` (number): event sequence in the local orchestration stream.
- `eventType` (string): orchestration event type.
- `aggregateKind`, `aggregateId` (string): aggregate routing metadata.
- `occurredAt` (string): event timestamp from the local server.
- `commandId`, `causationEventId`, `correlationId` (nullable string).
- `source` (string): source label from the ingestion payload.
- `sentAt` (optional string): sender timestamp from the ingestion payload.
- `receivedAt` (epoch ms): ingest timestamp in Convex.
- `event` (any): full raw orchestration event envelope for replay/debugging.

## Functions

- `smeApps:list` query
- `smeApps:getBySlug` query
- `smeApps:upsert` mutation
- `smeApps:seedDefaults` mutation
- `controlPlaneSync:getLatestSequence` query
- `controlPlaneSync:listRecent` query
- `controlPlaneSync:ingestEventInternal` internal mutation

HTTP routes (from `convex/http.ts`):

- `POST /api/control-plane/orchestration-event`
- `GET /api/control-plane/health`

## Local setup

Run from `apps/web`:

```bash
bun install
bun run convex:dev
```

Set a Convex-side bearer token (recommended):

```bash
convex env set T3CODE_CONVEX_SYNC_AUTH_TOKEN "<shared-secret>"
```

In a separate terminal, seed the 50 app specs:

```bash
bun run convex:seed
```

## Wiring from T3 server

After Convex is deployed, set these environment variables where `apps/server` runs:

```bash
T3CODE_CONVEX_SYNC_URL="https://<your-convex-deployment>.convex.site/api/control-plane/orchestration-event"
T3CODE_CONVEX_SYNC_AUTH_TOKEN="<shared-secret>"
```

Optional tuning:

```bash
T3CODE_CONVEX_SYNC_TIMEOUT_MS=5000
T3CODE_CONVEX_SYNC_QUEUE_CAPACITY=2000
```
