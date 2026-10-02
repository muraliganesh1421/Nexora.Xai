# Nexora.Xai

> **AI Lead Intelligence & Outreach System**
> Precision lead discovery and AI qualification for modern automation agencies.

---

## 1. Product Vision

Nexora.Xai is built around a single non-negotiable principle:

```
FIND → AI SCORE → REVIEW → CONTACT
```

- **Human-in-the-Loop:** This is **not** an autonomous spam machine. No lead is ever contacted simply because it was discovered.
- **Strict 1-to-1 Approval:** One explicit founder action equals at most one channel send. Bulk messaging and "Send All" patterns are architecturally excluded.
- **Deduplicated CRM Storage:** Discovered businesses are scored and stored directly into an existing 34-column Google Sheets CRM.

---

## 2. System Architecture

```
[ Browser / Next.js Client ]
             │
             ▼  POST /api/nexora/discover (Internal Server Proxy)
[ Next.js Server Route (Node.js) ]
             │
             ▼  N8N_DISCOVERY_WEBHOOK_URL (Private Server Environment)
[ n8n Automation Engine ]
     ├── 1. OpenStreetMap / Nominatim (Geo-targeted business search)
     ├── 2. Google Sheets Deduplication (Matches existing CRM records)
     ├── 3. AI Qualification (Digital presence scoring & opportunity rationale)
     └── 4. Google Sheets CRM (Appends qualified leads across 34 columns)
```

### Security Architecture

- **No Direct Webhook Access:** The browser client NEVER communicates directly with n8n or any third-party webhook URL.
- **Zero Client Secrets:** Private webhook URLs, Meta access tokens, and LLM keys exist solely on the server or within n8n credentials.
- **Controlled Outreach Testing:** Workflow 02 endpoints remain protected and deactivated until explicitly published.

---

## 3. CRM Schema (34 Columns)

The platform integrates directly with the standard Google Sheets CRM schema:

1. `Lead ID`
2. `Business Name`
3. `Category`
4. `Address`
5. `City`
6. `Phone`
7. `Email`
8. `Website`
9. `Google Maps URL`
10. `Rating`
11. `Review Count`
12. `Lead Score`
13. `Lead Status`
14. `Score Reason`
15. `Contact Method`
16. `Outreach Status`
17. `Approval Status`
18. `Proposed Subject`
19. `Proposed Message`
20. `Last Contacted`
21. `Follow-up Date`
22. `Call Status`
23. `Call Duration`
24. `AI Call Summary`
25. `Interest Level`
26. `Response`
27. `Notes`
28. `WhatsApp Consent`
29. `Voice Consent`
30. `Consent Evidence`
31. `Do Not Contact`
32. `Voice Call ID`
33. `Created At`
34. `Updated At`

---

## 4. Local Development Setup

### Prerequisites

- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
```

### Environment Configuration

In `.env.local` configure:

```bash
# Private production webhook URL (Server-side only)
N8N_DISCOVERY_WEBHOOK_URL=<your-private-n8n-webhook-url>
```

> **IMPORTANT:** Never commit `.env.local`. Keep the webhook URL private.

### Run Local Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Nexora dashboard.

---

## 5. Production Build & Verification

```bash
# Run production TypeScript and Next.js Turbopack build
npm run build

# Start production server
npm run start
```

---

## 6. Vercel Deployment Requirements

When deploying to Vercel:

1. Connect repository root.
2. In **Settings → Environment Variables**, add:
   - `N8N_DISCOVERY_WEBHOOK_URL` = `<your-private-n8n-webhook-url>`
3. Set Node.js version to 20+.
4. Build command: `npm run build`
5. Output directory: `.next`

---

## 7. Operational Status & Guardrails

| Module | Status | Security Guard |
| :--- | :--- | :--- |
| **Discovery (WF 01)** | Active | Server proxy validation, 90s timeout |
| **CRM Write** | Active | Appends to Google Sheets via n8n |
| **CRM Read** | Pending | Awaiting confirmed read API endpoint |
| **Outreach (WF 02)** | Inactive / Testing | Dispatches blocked; human approval gate enforced |
| **Email Channel** | Testing | Direct 1-to-1 only; protected mode |
| **WhatsApp Channel** | Testing | Credentials strictly in n8n; no Meta tokens in frontend |
