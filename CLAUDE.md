# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the server via nodemon (auto-restart on file changes), reading `PORT` from `.env` (defaults to 4000).
- No test suite is configured (`npm test` is a placeholder that exits with an error).
- No lint/build step is configured.

## Environment

Requires a `.env` file (not committed) with MySQL connection settings consumed by `config/database.js`:
`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and optionally `PORT`.

The Google Sheets integration (`services/googleSheetsService.js`) additionally needs `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`; the target spreadsheet ID is hardcoded in that file.

## Architecture

Express 5 + Sequelize (MySQL via `mysql2`) REST API, structured as classic MVC:

- `app.js` — entry point. Sets up Express middleware (`cors`, JSON/urlencoded body parsing), calls `sequelize.sync({ alter: false })` on boot, and mounts feature routers under `/faparca/api/<resource>`.
- `config/database.js` — creates and exports the single shared `Sequelize` instance; also self-tests the DB connection on import via `authenticate()`.
- `models/` — Sequelize model classes (one file per resource, e.g. `Windmill.js`), each calling `Model.init(...)` against the shared `sequelize` instance.
- `controllers/` — plain async functions implementing CRUD handlers for a resource, exported as an object and required directly by the router (no service/repository layer — controllers talk to Sequelize models directly).
- `routes/` — one `express.Router()` per resource mapping HTTP verbs/paths to controller functions; routers are mounted in `app.js`.
- `services/` — one-off integrations that don't fit the model/controller pattern, e.g. `googleSheetsService.js` (writes rows to a Google Sheet via a service-account JWT, called from `routes/googleSheets.js` directly — no controller layer for this route).

To add a new resource, follow the existing `windmill` trio: define a model in `models/`, a controller in `controllers/` with `create/get/getById/update/delete` handlers, a router in `routes/`, and mount it in `app.js` under `/faparca/api/<resource>`.

### Notable conventions

- JSON/array-like data (e.g. silo readings) is stored as `DataTypes.JSON` columns rather than normalized tables.
- Controllers respond with `{ msg, ... }` on success and `{ ok: false, message }` on error — this pattern is inconsistent (some success responses omit `ok: true`); match the existing style per-controller rather than "fixing" it project-wide.
- User-facing messages (error/success) are written in Spanish; keep new ones consistent with that.
- `sequelize.sync({ alter: false })` runs once at startup; individual controllers (e.g. `createWindmill`) also call `Model.sync()` defensively before writes.
