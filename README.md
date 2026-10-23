# PTA Playbook

Next.js App Router site for ptaplaybook.com. Content lives in content/site.json. Part of Agentic Business (StorenTech).

Placeholders: newsletter (Resend not connected), Stripe/sponsor CTAs (no keys), forms disabled.

## Analytics

`NEXT_PUBLIC_GA_ID` is the GA4 measurement ID (`G-` plus at least four letters or numbers). The Google tag is added only when that variable is a valid ID. If it is missing or invalid, the tag is not loaded and event calls do nothing, so this can merge before the ID exists.

Next.js inlines `NEXT_PUBLIC_*` values at build time. Set the variable in the host environment and rebuild for the tag to appear. Do not commit the ID.

Events never include names, email addresses, phone numbers, message text, or page query strings:

| Event | When | Parameters |
| --- | --- | --- |
| `generate_lead` | Newsletter or ad-order form submits successfully | `form_id`: `newsletter` or `ad_order` |
| `cta_click` | A primary CTA or button is clicked | `cta_label`, `cta_location` |

`cta_location` is one of `hero`, `cta_band`, `newsletter`, `ad_order`, `ad_slot`, `ad_policy`.
