# EMDAD NEXUS — Phase 1 Baseline

Date: 2026-09-23

## Isolation

The rebuild is isolated on Git branch:

- `emdad-nexus-rebuild`

The current Google Apps Script / Google Sheets CRM is not modified by this rebuild.

## Existing Repository

Repository: `Walid-Mahmoudi/EMDAD-CRM-V2`

Current stack already present in the repository:

- Next.js
- React
- Supabase JS client
- Vercel deployment configuration
- Existing API routes for sales inbox analysis
- Existing CRM V3 route
- Existing n8n workflow definitions

## Supabase Baseline

Project: `quprtdxhjfmiodbjvrsq`

Existing public tables:

- profiles
- companies
- contacts
- projects
- technical_requests
- quotations
- follow_ups
- meetings
- project_updates
- project_documents
- collections

All listed public tables currently have RLS enabled.

Current row counts checked on 2026-09-23:

- profiles: 6
- companies: 0
- contacts: 0
- projects: 0
- technical_requests: 0
- quotations: 0
- follow_ups: 0
- meetings: 0
- project_updates: 0
- project_documents: 0
- collections: 0

## Consequence

The existing Supabase business tables are currently empty, so the rebuild can proceed without touching or overwriting live CRM business data in Supabase.

The live Google Sheets CRM remains the source system for the eventual controlled migration.

## Immediate Build Order

1. Complete functional parity inventory from the live CRM.
2. Map every live CRM entity/process to the PostgreSQL model.
3. Harden authentication/RLS before production use.
4. Build the application shell and navigation.
5. Implement Projects + Companies + Contacts.
6. Implement Pipeline + Focus.
7. Implement Follow Ups + Calendar/reminders.
8. Implement Quotations / Technical workflow.
9. Implement Contracts + Collections.
10. Implement Reports / PDF / CSV.
11. Implement Audit / Data Management / Delete & Restore.
12. Build migration and reconciliation tooling.
13. Run the new CRM in parallel with the current CRM.
14. Cut over only after validation.

## Cutover Rule

No production cutover until the new CRM matches the current CRM's business behavior and reconciles its data and reports.
