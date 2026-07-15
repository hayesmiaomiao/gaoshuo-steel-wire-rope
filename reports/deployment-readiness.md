# Deployment Readiness Report

Generated for Phase 5: GitHub repository preparation and Hostinger staging handoff.

## 1. Current Scope

- Project: Gaoshuo Steel Wire Rope
- Runtime target: Node.js `22.x`
- Package manager: npm
- Framework: Next.js App Router
- Deployment target: Hostinger Node.js Web App through GitHub repository deployment
- Current Git branch target: `main`
- Current commit at report creation: blocked by local `.git` directory write permissions

## 2. Required Project Files

The following handoff-critical files are present:

- `package.json`
- `package-lock.json`
- `.nvmrc`
- `.env.example`
- `.gitignore`
- `README.md`
- `AGENTS.md`
- `HOSTINGER_DEPLOYMENT_CHECKLIST.md`
- `.github/workflows/ci.yml`
- `GITHUB_HOSTINGER_HANDOFF.md`
- `STAGING_ACCEPTANCE_CHECKLIST.md`

## 3. Runtime and Scripts

- `package.json` includes `engines.node = "22.x"`.
- Build script: `npm run build`
- Start script: `npm run start`
- Full verification script: `npm run verify`
- Hostinger install command: `npm ci`
- Hostinger build command: `npm run build`
- Hostinger start command: `npm run start`

## 4. Data Status

- Published products: 26
- Draft products: 1
- Published services: 6
- Draft products must remain excluded from product lists and sitemap output.
- Source-domain research records must stay inside `research/` and must not appear in production pages.

## 5. Staging Indexing Protection

Implemented environment variable:

```bash
STAGING_NOINDEX=true
```

When enabled:

- normal page metadata uses `index: false` and `follow: false`
- root metadata uses `index: false` and `follow: false`
- `/robots.txt` disallows all crawlers
- `/sitemap.xml` remains available for manual staging checks
- canonical URLs remain generated from `NEXT_PUBLIC_SITE_URL`

For production:

```bash
STAGING_NOINDEX=false
```

The `/thank-you` page remains noindex independently of staging mode.

## 6. RFQ Status

The RFQ system includes:

- frontend validation
- server validation
- honeypot protection
- upload type and size validation
- source page capture
- product SKU capture
- referrer and landing page capture
- UTM parameter capture
- adapter-based lead provider structure

Real email sending is not enabled until production environment variables are configured:

- `LEAD_PROVIDER=email`
- `LEAD_NOTIFICATION_EMAIL`
- `RESEND_API_KEY`

Production without a configured provider must return a clear unavailable message and must not pretend the inquiry was sent.

## 7. GitHub Handoff Status

- Local repository initialization: blocked in the current sandbox because `.git` is an empty directory with an explicit Windows DENY write ACL and the session was not granted `.git` write permission.
- Remote repository: intentionally not configured in this phase
- Push to GitHub: intentionally not performed in this phase
- Recommended repository visibility before launch: private

Run the Git commands in a normal local terminal after removing the stale/blocked `.git` directory or fixing its permissions.

## 8. Hostinger Handoff Status

Required Hostinger settings:

- Node.js version: `22.x`
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start`
- Staging environment: `STAGING_NOINDEX=true`
- Production environment: `STAGING_NOINDEX=false`

## 9. Remaining Business Inputs

The following information still requires user confirmation before final public launch:

- final production domain
- official business email
- official phone or WhatsApp
- official company address
- real product photos
- datasheets and drawings
- confirmed certifications, if any
- confirmed testing capabilities, if any
- confirmed manufacturing equipment and capacity, if any
- final RFQ notification mailbox
- GA4 measurement ID, if tracking is approved

## 10. Known Limits

- Product and service pages still use clear placeholder imagery unless real assets have been approved.
- The RFQ email provider is not connected to a real sending service by default.
- Staging must remain noindex until manual acceptance passes.
- The first GitHub push and Hostinger connection must be performed by the site owner or authorized operator.
