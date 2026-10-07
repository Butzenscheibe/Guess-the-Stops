# Bounded Docker logs — Guess-the-Stops

## Scope and policy

Only `guess-the-stops` stdout/stderr changes: keep `json-file`, rotate at `10m`,
retain at most `5` files (current file included). Nominal budget: 50 MiB, not a
filesystem quota; record boundaries/metadata can add overhead. Oldest files are
deleted as new files rotate. No guaranteed number of days is implied.

This first-service budget exceeds the observed 35.3 MiB current log file. Review
growth and incident-history needs after deployment before adopting it elsewhere.
It does not bound SQLite data, writable-layer files, or other services. It does
not add central forwarding, modify log content, or fix application IP logging.
Logs must remain access-restricted; do not attach raw logs to issues.

Docker documentation: [JSON File logging driver](https://docs.docker.com/engine/logging/drivers/json-file/).
Existing containers need **recreation**, not merely restart, to adopt new options.
Never truncate or externally rotate Docker's private log files. No Docker-daemon
restart or global default change is required for this per-service setting.

## Read-only production preflight — 2026-10-07, 07:25 UTC

- Docker01: `/mus/Guess-the-Stops`, owner `melchior`.
- Host checkout: `38fef0f9fdf405e797364b39ef665ec483d3c596`.
- PR base/main: `68f31da211dc5e2dc9cca16156def34d7cceae07`.
- Compose SHA-256 on both before this patch:
  `7cf64e69383d21e6fdf18a57aecd65e5ff42c634e4e23c6268bf8c66b681173f`.
- App trees differ substantially (34 files); the host additionally has a modified
  `.gitignore` and untracked `frontend-shadcn/`. Preserve all of these.
- Container `e73a0b50a7397730e21d4379dc4f7905d893ea5b27e5aba9c6e6d9e5359abc7f`:
  running, zero restarts, `json-file` with empty options, no configured healthcheck.
- Image ID: `sha256:76aa86cf762df42acf0f5c1e2b10704d4b6aba3ef520a6322f6082b109709d98`.
- Writable bind `/mus/Guess-the-Stops/database` -> `/app/database`;
  published TCP port 3000. Current log file: 37,033,701 bytes. This is a size
  snapshot, **not** a bytes/day measurement or proof of application health.

No production configuration, container, database, or log was modified for this PR.
This repository currently has no deployment workflow. Source merge alone is not
runtime acceptance and must not trigger a rebuild from `main` on this host.

## Later rollout gate (not executed by this PR)

1. Agree a short service interruption. Recheck checkout/status, Compose labels,
   active image ID/tag, mounts, logging and compose version. Stop if anything
   differs from the reviewed plan. Run Git metadata checks as `melchior`; do not
   bypass ownership checks with a global `safe.directory` rule.
2. Verify a recoverable, SQLite-consistent backup of the database directory and
   required logs. Ordinary copying of a live SQLite DB can be inconsistent; use
   its backup API or a controlled stop including WAL/SHM files. Confirm whether
   any state exists outside `/app/database` before discarding the old container.
   Recreating removes its old Docker log history unless separately preserved via
   the Docker logs API. Agree what to retain, with restricted access and expiry.
3. Save the exact old Compose configuration and runtime metadata privately.
   Apply **only the reviewed logging stanza** to the host Compose file, preserving
   local work. Do not `git pull`, reset, checkout the whole tree, build, or pull an
   image as part of this rotation change. Verify the logging stanza is the only
   semantic difference in resolved Compose; never publish interpolated secrets.
4. Pin the *currently running local image ID* in a temporary service override and
   verify it resolves to the same image before recreation. Recreate only
   `guess-the-stops` with `--no-deps --no-build --pull never` after checking these
   flags against the host Compose version. No stack-wide `down`, `down -v`, image
   prune, database removal, or Docker restart. Do not persist the host-specific
   image ID into the shared Compose file.
5. Inspect the new container: same image ID, same bind path and ports; logging
   must be `json-file`, `max-size=10m`, `max-file=5`. Compare restart count over a
   short observation period. Check HTTP `/` and `/training/countries` against
   pre-change results locally and through the existing public route; perform a
   controlled test game and verify existing archive data. Running alone is not
   application acceptance. Do not force production rotation with synthetic spam.
6. Record actual date, old/new IDs, configuration diff, functional outcomes,
   errors and rollback decision in the tracking issue. Observe retained growth
   over normal use and reconsider the budget if useful diagnostic history is too
   short. Log forwarding remains a separate project/gate.

### Rollback

Restore only the saved logging configuration (or remove this new stanza), retain
the exact same application image and database bind, then recreate just this
service again using the same safeguards. This returns to unlimited Docker logs;
it is a temporary fallback, not a completed hardening result. Already removed
logs cannot be recovered by reverting configuration. Do not restore a database
backup merely to roll back logging: that would discard newer application data.

## Validation

Run `python3 -m unittest discover -s tests -v` with Docker Compose v2+ installed.
These tests render Compose without a project `.env`, build, or running services;
they verify the bounded policy and unchanged service topology. They are not an
application test or evidence that production rotation is active.

Local validation on 2026-10-07: all three render tests passed. Comparing rendered
Compose against the PR base after removing only `logging` gave identical results.
A separate local, network-isolated Docker container using exactly `10m`/`5`
emitted 64 MiB of synthetic 8 KiB lines between two unique markers. Via
`docker logs`, the initial marker was gone, the final marker remained, and
47,267,863 stdout bytes were retained. This confirms eviction and recent-log
availability for that bounded synthetic case, not production retention duration
or an exact on-disk quota. The test used a cached Python image pinned to digest
`sha256:392307d22300de8b5986851a12d9176dfc0fc073e65bf6523ebd7dcbeb23564e`,
UID 10001, no network/mounts/capabilities, read-only root, 128 MiB RAM, one CPU and
32 PIDs. Its exact-name/ownership-label-checked container was removed afterwards.
No application image was built and no production log content was read.

The `Compose policy` GitHub Actions workflow repeats the render tests on affected
PRs and main pushes with read-only repository permissions. It does not deploy.

Tracking: [homelab-ops #5](https://github.com/Eggiwu/homelab-ops/issues/5)
(bounded Docker hardening), [infra-gitops #41](https://github.com/Eggiwu/infra-gitops/issues/41)
(separate central logging project).
