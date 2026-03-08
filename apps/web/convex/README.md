# Convex SME Specs

This Convex setup stores the SME catalog and per-app product specs used by the `/sme-apps` page.

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

## Functions

- `smeApps:list` query
- `smeApps:getBySlug` query
- `smeApps:upsert` mutation
- `smeApps:seedDefaults` mutation

## Local setup

Run from `apps/web`:

```bash
bun install
bun run convex:dev
```

In a separate terminal, seed the 50 app specs:

```bash
bun run convex:seed
```

