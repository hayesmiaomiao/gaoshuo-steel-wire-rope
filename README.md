# Gaoshuo Steel Wire Rope

Stable Next.js website for Zhongshan Gaoshuo Technology Co., Ltd., focused on custom wire rope assemblies and cable solutions for international B2B sourcing.

## Runtime

- Node.js 22.x
- Next.js App Router
- React Server Components by default
- TypeScript strict mode
- CSS Modules and one global stylesheet
- JSON business data validated with Zod

## Commands

```text
npm ci
npm run dev
npm run lint
npm run typecheck
npm run validate
npm run test
npm run build
npm run verify
npm run start
```

## Environment

- `NEXT_PUBLIC_SITE_URL`: canonical site origin.
- `STAGING_NOINDEX=true`: blocks indexing on the Hostinger temporary domain.

The RFQ form is currently a UI-only workflow. It does not send email, write to a database, upload files or connect to a CRM.
