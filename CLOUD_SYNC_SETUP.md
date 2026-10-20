# Markwise Cloud Sync setup

This branch includes the opt-in Supabase client integration in `index.html`; it is not live on GitHub Pages until PR #16 is merged and the Pages deployment completes. Do not treat sync as verified until sign-in and two-device tests pass.

## Why the extra setup is required
Markwise is hosted on GitHub Pages, which has no private server/database. Each browser currently has its own local storage. A Supabase project provides shared storage, and Supabase Auth identifies the owner.

## Setup
1. Create a Supabase project in your own account.
2. Open SQL Editor and run `supabase/markwise-schema.sql`.
3. In Project Settings / API, copy the Project URL and publishable key (or legacy anon key).
4. Keep the service_role/secret key private; never add it to this repository or browser code.
5. In Authentication → URL Configuration, add `https://k4rim93.github.io/Markwise/` to the Redirect URLs allowlist (the app sends email magic links back to this URL).
6. In Authentication → Sign In / Providers, ensure Email is enabled.
7. The client integration is in `index.html`; it uses only the public publishable key. The public key is intended for browser use; RLS is the security boundary. Test sign-in and data preservation before merging the PR.

## Migration safety requirements
- Do not replace a local library with an empty cloud library automatically.
- On first sign-in, this implementation merges local and cloud records by item ID/URL; verify counts before relying on it.
- Merge by stable item ID; keep distinct URLs/records and preserve collection metadata.
- Never auto-upload an empty local library over a non-empty cloud library.
- Keep current localStorage keys and JSON export/import.
- Show sync status and last successful sync time; retain local changes if offline. Current implementation reports a sync timestamp but has not been end-to-end tested.
- Resolve concurrent updates explicitly (at minimum, last-write-wins with a visible warning).

This schema stores one JSON document per authenticated user. Row-level security restricts each user to their own row.
