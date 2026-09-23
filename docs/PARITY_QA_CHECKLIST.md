# EMDAD NEXUS — Legacy Parity QA Checklist

Reference: live Google Sheets + Apps Script CRM. The legacy system must remain unchanged during validation.

## Core
- [ ] Authentication / Magic Link
- [ ] Admin / Manager / Sales permissions
- [ ] Dashboard KPIs
- [ ] Sales Performance
- [ ] Projects CRUD
- [ ] Pipeline stages
- [ ] Focus Projects
- [ ] Follow-ups
- [ ] Follow-up completion + next action
- [ ] Activity Center
- [ ] Meetings / Calendar
- [ ] Contracts
- [ ] Collections / remaining balance
- [ ] Clients
- [ ] Contacts
- [ ] Reports
- [ ] Settings
- [ ] Audit Log
- [ ] Data Management
- [ ] Manual archive / restore
- [ ] Attachments / private storage
- [ ] Notifications

## Reporting
- [ ] Projects Report
- [ ] Pipeline Report
- [ ] Focus Projects Report
- [ ] Follow-Up Report
- [ ] Contracts & Collections Report
- [ ] Client Report
- [ ] Date filters
- [ ] CSV export
- [ ] PDF export

## UX
- [ ] Arabic
- [ ] English
- [ ] Dark mode
- [ ] Light mode
- [ ] Desktop
- [ ] Mobile
- [ ] Search
- [ ] Project detail drawer
- [ ] Error / empty / loading states

## Workflow integrity
- [ ] Stable project identity
- [ ] No duplicate project creation during edit
- [ ] Lost reason required for Lost
- [ ] Contract only after Won
- [ ] Collection only after Won
- [ ] Collections cannot exceed contract value
- [ ] Manual restore only
- [ ] Audit entries generated
- [ ] Sales scope enforced by DB/RLS
- [ ] Technical scope enforced by DB/RLS

## Cutover gate
No production cutover until every applicable item above is tested against the legacy CRM with matching records, calculations, permissions and workflow outcomes. The legacy CRM remains live throughout migration and validation.
