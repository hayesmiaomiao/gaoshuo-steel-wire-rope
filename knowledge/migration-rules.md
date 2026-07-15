# Migration Rules for Approved Source Websites

The user has confirmed that product and service content from approved public source websites may be used for Gaoshuo Steel Wire Rope migration. The exact source domains are stored only in internal files under `research/`.

## Allowed Content

Allowed product and service content includes product categories, product names, models, specifications, parameters, materials, wire rope constructions, coatings, terminal types, applications, customization options, product features, product body content, FAQ, product tables, service items, service workflows, custom capability descriptions, RFQ technical fields, page information architecture, related product relationships, and technical selection content.

Imported products no longer need to stay `unverified`, `publishable=false`, or `reference-only` by default. A migrated product may become:

- `verification_status=source-approved`
- `publishable=true`
- `status=published`

Only publish after validation, deduplication, brand replacement, contact cleanup, SEO rewriting, and build checks pass.

## Never Migrate

Do not migrate or display source-site company identity or contact information:

- Source company name
- Source brand name
- Source logo
- Source domain as front-end copy
- Source email, phone, WhatsApp, WeChat, fax, address, maps, social links
- Contact person names
- QR codes
- Copyright text
- Privacy-policy company information
- Form recipient email
- Source Schema company information
- Footer company details
- Images containing contact-detail watermarks

Replace all formal brand references with `Gaoshuo Steel Wire Rope`. Rewrite context instead of mechanical find-and-replace when needed.

## Company-Level Claims Still Prohibited

Do not migrate company-level claims unless the user confirms them separately:

- Company founding year
- Years in production
- Employee count
- Factory area
- Production capacity
- Monthly or annual output
- Equipment quantity
- Export country count
- Customer count or names
- Customer logos
- Engineering cases
- Revenue
- ISO, CE, RoHS, REACH, API certifications
- Patents, awards
- Laboratory capability
- Third-party testing qualification
- Source company news
- Source team members

If such content appears inside product or service copy, remove the company-level claim and preserve only valid product or process information.

## Image Rules

- Record source image URLs only in `research/image-migration.csv`.
- Do not hotlink source images.
- Do not bulk download and publish source images by default.
- Do not use source logos or images containing source contact details.
- Use project placeholders until the user confirms usable images.

## Link Rules

- Do not retain internal links pointing to approved source domains.
- Map product links to Gaoshuo product pages.
- Map service links to Gaoshuo service or capability pages.
- Replace contact links with `/request-a-quote`.
- Record source downloads internally, but do not publish them until file usage rights and content are confirmed.

## Deduplication Rules

Merge pages when the only differences are name wording, color, single diameter, length, terminal wording, source website, or identical procurement intent.

Example: `Wire Rope with Hook`, `Steel Cable with Carabiner`, and `Wire Rope Cable with Snap Hook` should become one product such as `Wire Rope Assembly with Hook`, with hook types represented as options.

## SEO Rewrite Rules

Keep facts and technical selection value, but rewrite:

- URL slug
- SEO title
- Meta description
- H1
- Opening summary
- Category copy
- CTA
- FAQ wording
- Internal-link anchor text
- Related product logic
- Image alt
- Open Graph copy
- Schema description
- Breadcrumb names

Never keep source title templates, source meta templates, source brand keywords, source canonical URLs, or source Schema company details.
