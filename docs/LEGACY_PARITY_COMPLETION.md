# Legacy CRM Parity — Completion Record

The legacy Google Apps Script + Google Sheets CRM remains the reference implementation and is not modified.

## Implemented in Supabase

- Legacy six-stage pipeline state machine with canonical stage aliases.
- One-way stage progression and Closed Won / Closed Lost locking.
- Closed Lost lost-reason validation.
- Closed Won contract date/value validation.
- Transactional contract creation/update RPC.
- Transactional collection creation with remaining-balance protection.
- Manual archive/restore registry matching legacy deleted-project behavior.
- Follow-up completion lifecycle fields and next-action creation.
- Scoped child-data reads through project ownership.
- Notification de-duplication key.
- Automation log table.
- Legacy parity project fields: offer_sent, location, consultant, opportunity_date, last_follow_up_date.
- Source sync v14 preserves user-managed CRM fields during sync, matching the legacy source-owned-field behavior.
- Sales users remain scoped to their assigned project ownership.

## Source-sync rule

The source spreadsheet owns the legacy source fields:

- Project ID
- Project name
- Client
- Source case
- Offer sent
- Sales person

The sync does not overwrite user-managed pipeline stage, estimated value, location, consultant, follow-up dates, notes, or other CRM-managed fields on existing projects.

## Safety

The legacy Google Sheets / Apps Script CRM is untouched.
