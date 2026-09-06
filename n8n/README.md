# EMDAD AI Sales Assistant — n8n

This folder contains the automation layer for EMDAD CRM V2.

## Architecture

- **Supabase**: system of record (`EMDAD-CRM-V2`)
- **n8n**: orchestration, triggers, automation and AI agents
- **OpenAI**: extraction, classification, summarization and next-action reasoning
- **Outlook/Gmail**: email ingestion
- **WhatsApp Business Cloud**: WhatsApp ingestion
- **Google Sheets**: legacy data import/reporting

## Core flow

`Source -> n8n -> AI extraction -> duplicate/entity matching -> Supabase -> AI task/insight -> daily brief`

## Important

Credentials are intentionally not stored in GitHub. After importing the workflow into n8n, connect your own credentials for OpenAI, Microsoft/Google, WhatsApp Business Cloud and Supabase.

The database already contains the AI tables needed by this layer: `sales_inbox`, `interactions`, `ai_tasks`, `ai_insights`, and `ai_commands`.

## First production workflows

1. `01_inbox_intake.json` — accepts normalized email/WhatsApp/Sheet events through a webhook, classifies/extracts the event with AI, and prepares it for Supabase persistence.
2. `02_daily_sales_brief.json` — scheduled daily briefing workflow that reads open work from Supabase and sends a concise management brief.

## Recommended rollout

Start with email + Google Sheets. Add WhatsApp Business Cloud after the ingestion format is validated. Keep outbound customer messages in **draft/approval mode** until the system has been tested with real data.
