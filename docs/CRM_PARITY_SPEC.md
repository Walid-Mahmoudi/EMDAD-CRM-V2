# EMDAD NEXUS — CRM Rebuild / Parity Specification

## Mission

Rebuild the current Google Sheets + Google Apps Script CRM as a production CRM backed by PostgreSQL/Supabase and deployed independently, while preserving the current CRM as the live system until the new system is fully validated.

## Non-Negotiable Rule

The current Google Sheets / Apps Script CRM is the live master system during the rebuild.

- Do not modify, migrate destructively, disable, or replace the current CRM.
- Do not change its workflows merely to accommodate the new system.
- Build the new CRM independently.
- Cut over only after feature parity, data reconciliation, permissions, reports, automation, and user acceptance are verified.

## Existing CRM Functional Scope

The new system must reproduce the existing business process and user-facing capabilities, including:

1. Authentication and user sessions
2. User roles and permissions
3. Dashboard
4. Sales Performance
5. Projects
6. Sales Pipeline
7. Focus Projects
8. Follow Ups
9. Activity Center
10. Contracts
11. Collections
12. Clients
13. Contacts
14. Reports
15. Settings
16. Audit Log
17. Data Management
18. Calendar integration
19. Notifications / reminders
20. Attachments / documents
21. Delete and manual restore workflow
22. Project and sales-person scope filtering
23. PDF / CSV reporting and export
24. Arabic / English UI
25. Light / Dark mode
26. Mobile-responsive UI

## Core Business Flow

Customer / Company
  -> Project
  -> Technical / RFQ work
  -> Pricing / Quotation
  -> Follow-up
  -> Negotiation
  -> Closed Won / Closed Lost
  -> Contract
  -> Collections

Follow-up flow:

Follow-up
  -> Result
  -> Next Action
  -> Next Action Date
  -> Next Follow-up
  -> Calendar Event / Reminder

## Data Model Direction

PostgreSQL is the system of record for the new CRM. Existing Supabase foundations include profiles, companies, contacts, projects, technical requests, quotations, follow-ups, meetings, project updates, project documents, and collections.

The schema may be normalized and strengthened internally, but the business behavior must remain compatible with the current CRM.

## Validation Strategy

The new CRM will be validated against the current CRM using the same data and date ranges.

For each major area, compare:

- Record counts
- Totals and monetary values
- Status/stage distribution
- Sales-person scope
- Follow-up counts and overdue counts
- Contract values
- Collection totals and remaining balances
- Report outputs
- Permissions

No production cutover is allowed while material discrepancies remain unexplained.

## Migration Strategy

Migration is staged:

1. Inventory current CRM behavior and data
2. Map Google Sheets entities to PostgreSQL entities
3. Build import / validation tooling
4. Load a non-production copy
5. Reconcile counts and totals
6. Test the application against migrated data
7. Repeat until stable
8. Freeze only at final cutover
9. Perform final delta migration
10. Switch users to the new CRM

The current CRM remains available throughout stages 1–9.

## Architecture

Frontend:
- Next.js / React

Backend:
- Server-side API / business logic

Database:
- Supabase PostgreSQL

Authentication:
- Supabase Auth

File storage:
- Supabase Storage / private document access

Hosting:
- Vercel

## Development Rule

All new work for the rebuild must be isolated from the current production CRM.

Current live CRM:
- Google Apps Script + Google Sheets

New CRM:
- This repository / branch + Supabase + Vercel

The two systems are not to be coupled in a way that can destabilize the live CRM.

## First Build Milestone

Before adding new features, complete the foundation:

- Production-safe project structure
- Database schema parity
- Auth and role model
- RLS
- Core project / company / contact relationships
- Audit trail
- API/service layer
- Environment configuration
- Migration mapping
- Automated reconciliation checks

## Branding

Product name: EMDAD NEXUS

Internal legacy identifiers in the old CRM do not need to be renamed during migration unless there is a specific compatibility reason. User-facing branding in the new system must use EMDAD NEXUS.
