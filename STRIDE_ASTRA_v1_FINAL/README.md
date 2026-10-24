# STRIDE Intelligence · Tempo

Run `npm ci`, then `npm start`. Open http://127.0.0.1:4318.
Node.js 24+ is required; verification used 26.5.

- Owner key: `.stride-data/owner-key.txt` (generated on first start).
- Private records and source files: `.stride-data/stride.sqlite`.
- Tests: `npm test`.
- Import supplied local references: `npm run import:local`.
- Synthetic browser test app: `node scripts/qa-server.mjs`, port 4319.
- Archived design comparison: `npm run design`, port 4317.

See [implementation and verification](docs/IMPLEMENTATION_HANDOVER.md) and
[operations and recovery](docs/OPERATIONS.md). Product authority remains
[PRODUCT_VISION_AND_REQUIREMENTS.md](docs/PRODUCT_VISION_AND_REQUIREMENTS.md).
