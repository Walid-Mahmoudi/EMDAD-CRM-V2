# Source Sheet Sync Setup

This is a separate bridge for the new EMDAD NEXUS CRM. The legacy Google Apps Script CRM is not changed.

## Source
The bridge reads the same source spreadsheet and sheet used by the legacy CRM.

## Deploy the bridge
1. Create a **new** Google Apps Script project. Do not edit the legacy CRM project.
2. Copy `source-sync-bridge/Code.gs`.
3. In **Project Settings → Script properties**, add:
   - `EMDAD_SOURCE_SYNC_TOKEN` = a long random secret.
4. Deploy → New deployment → Web app.
   - Execute as: **Me**
   - Who has access: **Anyone with the link**
5. Copy the Web App URL.

## Supabase secrets
Configure these secrets for the `sync-source-projects` Edge Function:
- `CRM_SOURCE_SYNC_URL` = Web App URL
- `CRM_SOURCE_SYNC_TOKEN` = exactly the same token

The Supabase service-role key is already used only server-side by the Edge Function; it must never be placed in the frontend.

## Behavior
The sync:
- Uses Project ID as identity.
- Creates missing companies from the source Client value.
- Adds new source projects.
- Updates source-owned project fields.
- Preserves archived/deleted projects instead of silently restoring them.
- Stores source metadata and sync timestamps.
- Records every run in `source_sync_runs`.
- Is restricted to Admin/Management when invoked through the authenticated Edge Function.

## Important
No change is made to the old CRM. The first live sync should be treated as a reconciliation run. Do not cut over until the Project IDs, counts, Sales Person scope, stages, and financial/operational data have been checked against the legacy CRM.
