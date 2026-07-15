# GitHub and Hostinger Handoff

This document is the handoff guide for publishing the Gaoshuo Steel Wire Rope codebase to a private GitHub repository and deploying a protected staging site on Hostinger.

## 1. Repository Scope

- Project directory: `gaoshuo-steel-wire-rope`
- Recommended GitHub repository name: `gaoshuo-steel-wire-rope`
- Recommended visibility before launch: private
- Primary branch: `main`
- Do not create a GitHub README, `.gitignore`, or license when creating the remote repository, because the project already contains those files.
- Do not push `.env`, `.env.local`, `.next`, `node_modules`, uploads, logs, or build cache files.

## 2. GitHub Upload Steps

After the local commit is created, create an empty repository in GitHub, then run one of the following command sets from the project root.

HTTPS:

```bash
git remote add origin https://github.com/YOUR-ORG-OR-USER/gaoshuo-steel-wire-rope.git
git push -u origin main
```

SSH:

```bash
git remote add origin git@github.com:YOUR-ORG-OR-USER/gaoshuo-steel-wire-rope.git
git push -u origin main
```

## 3. GitHub Actions

The repository includes `.github/workflows/ci.yml`. After pushing to GitHub, confirm the CI workflow runs successfully on `main`.

Expected CI checks:

- dependency install
- lint
- TypeScript check
- product validation
- content validation
- duplicate product check
- brand migration check
- contact leak check
- link check
- SEO check
- tests
- production build

## 4. Hostinger Staging Setup

Use Hostinger Node.js Web App deployment from the GitHub repository.

Recommended settings:

| Setting | Value |
| --- | --- |
| Node.js version | `22.x` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Branch | `main` |
| App type | Node.js Web App |

## 5. Hostinger Environment Variables

Use real values only in Hostinger hPanel or another secure environment manager. Do not commit real secrets.

| Variable | Staging value | Production value | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | staging URL | final public domain | Used for canonical, sitemap, robots, and Open Graph URLs. |
| `STAGING_NOINDEX` | `true` | `false` | Must be `true` on temporary Hostinger domains. |
| `LEAD_PROVIDER` | blank or `development` | `email` after email is configured | Production without a configured provider returns a clear error. |
| `LEAD_NOTIFICATION_EMAIL` | blank | real receiving mailbox | Required for email provider. |
| `RESEND_API_KEY` | blank | real secret key | Required for email provider. Never expose publicly. |
| `NEXT_PUBLIC_GA_ID` | blank unless tracking is approved | GA4 measurement ID | Optional. Do not load unnecessary tracking before approval. |
| `MAX_UPLOAD_SIZE_MB` | optional | optional | Default is 5 MB. |
| `ALLOWED_UPLOAD_TYPES` | optional | optional | Defaults to PDF, JPG, JPEG, PNG. |

## 6. Staging Noindex Rule

For temporary Hostinger domains:

- set `STAGING_NOINDEX=true`
- confirm page metadata contains `noindex,nofollow`
- confirm `/robots.txt` disallows `/`
- keep `/sitemap.xml` available for manual testing
- keep canonical URLs generated from `NEXT_PUBLIC_SITE_URL`

For the final production domain:

- set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain
- set `STAGING_NOINDEX=false`
- redeploy
- confirm `/robots.txt` allows crawl except intentionally blocked paths
- confirm sitemap contains only approved published pages

## 7. RFQ Status

The RFQ form has frontend and server-side validation, honeypot protection, source tracking, UTM capture, and upload validation. Real email delivery is not enabled until `LEAD_PROVIDER=email`, `LEAD_NOTIFICATION_EMAIL`, and `RESEND_API_KEY` are configured in the server environment.

If email is not configured in production, the API must return a clear unavailable message and must not pretend the inquiry was sent.

## 8. Do Not Do During Staging

- Do not connect the final public domain until the staging checklist passes.
- Do not set `STAGING_NOINDEX=false` on a temporary domain.
- Do not add unverified product claims, certifications, test reports, customer logos, or delivery promises.
- Do not reuse source-site contact details or brand identity.
- Do not commit secrets.
