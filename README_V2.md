# EMDAD CRM V2

## Production workflow

Customer / Market → New Project → Project Type → BOQ/RFQ → Technical Support → Pricing & Technical Study → Estimated Value → Quotation → Follow-up / Meetings / Revisions → Negotiation → Won/Lost → Contract Value → Collections.

### Project types
- Tender in Market
- In Hand
- Official Tender

### Financial rules
- Estimated Value is entered after Technical pricing is completed.
- Contract Value is entered only for Won projects.
- Remaining = Contract Value - Total Collected.

### Core modules
- Dashboard
- Projects
- Companies & Contacts
- Technical Requests
- Quotations and revisions
- Follow-ups
- Meetings
- Updates / revisions
- Documents
- Collections

### Security
Supabase Auth + RLS + private `crm-documents` storage. Never place a service-role key in frontend code.
