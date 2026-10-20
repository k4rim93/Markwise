# Markwise Cloud Sync setup

This branch contains the database schema foundation only. Cloud sync is **not active** in the published app yet.

## Why the extra setup is required
Markwise is hosted on GitHub Pages, which has no private server/database. Each browser currently has its own local storage. A Supabase project provides shared storage, and Supabase Auth identifies the owner.

## Setup
1. Create a Supabase project in your own account.
2. Open SQL Editor and run `supabase/markwise-schema.sql`.
3. In Project Settings / API, copy the Project URL and publishable key (or legacy anon key).
4. Keep the service_role/secret key private; never add it to this repository or browser code.
5. In Authentication → URL Configuration, add `https://k4rim93.github.io/Markwise/` to the Redirect URLs allowlist (the app sends email magic links back to this URL).\n6. In Authentication → Sign In / Providers, ensure Email is enabled.\n7. The client integration is in `index.html`; it uses only the public publishable key. Test sign-in before merging the PR.

## Migration safety requirements
- Do not replace a local library with an empty cloud library automatically.
- On first sign-in, compare local and cloud counts and ask to merge/import if both contain data.
- Merge by stable item ID; keep distinct URLs/records and preserve collection metadata.
- Never auto-upload an empty local library over a non-empty cloud library.
- Keep current localStorage keys and JSON export/import.
- Show sync status and last successful sync time; retain local changes if offline.
- Resolve concurrent updates explicitly (at minimum, last-write-wins with a visible warning).

This schema stores one JSON document per authenticated user. Row-level security restricts each user to their own row.
