# Operating STRIDE privately

## Local start

Node.js 24+ is required (26.5 verified). Run `npm ci`, then `npm start` in this
package. Open http://127.0.0.1:4318. Node binds to loopback only. First start creates
`.stride-data/owner-key.txt`, `master-key.txt` and SQLite storage. Read the owner
key locally to unlock; never paste it into logs/source. `npm run dev` watches code.
Stop with Ctrl+C.

`STRIDE_DATA_DIR` selects a private persistent directory; `PORT` changes the port.
`STRIDE_ORIGIN` is only for an approved HTTPS reverse proxy and controls allowed
origin, Secure cookies and HSTS. There is no wildcard CORS. The app does not load
`.env` automatically; use your process environment/service manager.

## Backups and recovery

Keep SQLite on a persistent local disk, not a shared network drive. Use OS account
isolation and disk encryption. Sessions last 30 days. Data & privacy → Lock revokes
the current session and clears the browser view after pending work is resolved.

Use **Export encrypted backup**, choose a passphrase of at least 12 characters,
keep it separately and copy the `.stride` file to a second private location. Test
Restore in an isolated installation. Restore previews counts, requires RESTORE,
and saves a checkpoint before atomically replacing records.

Automatic checkpoints in `.stride-data/backups/` are encrypted with the local
master key. They occur at startup and before imports, sync and restore. Preserve
`master-key.txt` with a full private server-directory backup; losing it makes
credentials/checkpoints unreadable. For a checkpoint's Restore passphrase, use
that local master key. Do not upload either file to an untrusted service.

There is no automatic checkpoint retention deletion. Review disk usage and retain
an independently tested portable backup before removing old checkpoints. For a
filesystem copy, stop Node and copy the entire data directory, including any
SQLite WAL/SHM files. Do not copy only the active `.sqlite` file during writes.

Portable backups omit credentials. Fresh installations create a new owner key;
configure Garmin again after restore. Same-server restores leave current login
and connector credentials intact.

## Imports

Preview before committing. Stable source IDs update records. Originals and user
corrections stay separate. Review ambiguous duplicates in Data & privacy; they
remain out of totals. Both-check-in conflicts need reconciliation before merging.
Undo refuses to erase subsequent edits.

`npm run import:local` reads only the two named private references. MASS remains
the normal weight-entry interface; reimport exports as needed. Individual uploads
are limited to 32 MB; ZIP expansion to 256 MB/30,000 entries/32 MB per entry. Split
large archives locally and import supported files separately. GPX does not invent
moving duration from elapsed timestamps.

## Private HTTPS deployment (not performed)

A suitable arrangement is one Node process on a private host with persistent disk,
behind a valid HTTPS reverse proxy accessible only through your private network
or VPN. Approve host, domain, recurring cost, access arrangement and backup
destination before transferring live records.

Keep Node on `127.0.0.1:4318`. Preserve the original Host header through the proxy;
set `STRIDE_ORIGIN=https://your-private-host` without trailing slash. Use a valid
certificate and a 50 MB request limit. Avoid body/cookie logs. Do not expose the
old unauthenticated design-review server.

Use a process supervisor and dedicated OS account. On updates, run `npm ci`,
`npm test` and an isolated restore drill. `/health` provides nonpersonal liveness.

On a real iPhone verify login, Safari text sizing, all four run answers, voice
keyboard, Save above keyboard, appearance, orientation/safe areas, VoiceOver,
reload durability, airplane-mode recovery, conflict handling, lock cleanup and
backup download/restore. Time real check-in use; viewport emulation does not
prove the 45-second target.

## Garmin first-live check

Create a key in Garmin's official Personal API portal. Enter it in Data & privacy,
including expiry if known. First sync a short range with a known run and night.
Compare source payload units, UTC/local dates, duration, missing fields, stages
and naps against Garmin Connect. Re-sync and confirm stable identities/notes,
then widen to at most 31 days per request. Successful sync verifies that account's
response, not every optional watch field or clinical accuracy.

There is no refresh token. The server recreates access tokens, caps their cache
lifetime at 24 hours and retries a rejected token once. Replace expired/rejected
keys. Rate limits stop a sync; wait before retrying. There is no background polling
or account mutation.
