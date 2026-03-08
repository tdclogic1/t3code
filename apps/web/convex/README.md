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

- `tenantId` (string): required tenant identifier for backend isolation.
- `orgId` (nullable string): optional organization identifier within the tenant.
- `workspaceId` (string): required workspace identifier for scoped replay/queries.
- `eventId` (string): unique orchestration event id from the local server.
- `sequence` (number): event sequence in the local orchestration stream.
- `eventType` (string): orchestration event type.
- `aggregateKind`, `aggregateId` (string): aggregate routing metadata.
- `occurredAt` (string): event timestamp from the local server.
- `commandId`, `causationEventId`, `correlationId` (nullable string).
- `source` (string): source label from the ingestion payload.
- `sentAt` (optional string): sender timestamp from the ingestion payload.
- `receivedAt` (epoch ms): ingest timestamp in Convex.
- `eventStorageMode` (`raw | redacted`): persisted payload mode.
- `eventProjection` (optional object): minimized metadata-only projection:
  - `payloadKind` + optional `payloadSize`
  - `metadataKind` + optional `metadataSize`
- `event` (optional any): full raw event payload, stored only when raw mode is explicitly enabled.

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

`DR_BIOMASS_SYNC_AUTH_TOKEN` is also accepted by the Convex ingress auth check.

Auth is required by default in non-development runtimes. For local-only development,
you can explicitly disable that behavior:

```bash
convex env set T3CODE_CONVEX_SYNC_REQUIRE_AUTH "0"
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
T3CODE_CONTROL_PLANE_TENANT_ID="<tenant-id>"
T3CODE_CONTROL_PLANE_WORKSPACE_ID="<workspace-id>"
T3CODE_CONTROL_PLANE_ORG_ID="<org-id-optional>"
```

Optional tuning:

```bash
T3CODE_CONVEX_SYNC_TIMEOUT_MS=5000
T3CODE_CONVEX_SYNC_QUEUE_CAPACITY=2000
T3CODE_CONVEX_SYNC_REQUIRE_AUTH=1
T3CODE_CONVEX_SYNC_ALLOW_INSECURE_NO_AUTH=0
T3CODE_CONVEX_STORE_RAW_EVENT=0
```

`dr_biomass` aliases are supported for server-side sync envs:

- `DR_BIOMASS_SYNC_URL`
- `DR_BIOMASS_SYNC_AUTH_TOKEN`
- `DR_BIOMASS_SYNC_TIMEOUT_MS`
- `DR_BIOMASS_SYNC_QUEUE_CAPACITY`
- `DR_BIOMASS_SYNC_REQUIRE_AUTH`
- `DR_BIOMASS_SYNC_ALLOW_INSECURE_NO_AUTH`
- `DR_BIOMASS_TENANT_ID`
- `DR_BIOMASS_WORKSPACE_ID`
- `DR_BIOMASS_ORG_ID`
- `DR_BIOMASS_STORE_RAW_EVENT`
