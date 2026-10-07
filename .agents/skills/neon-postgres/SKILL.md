---
name: neon-postgres
description: >-
  Guides and best practices for working with Lakebase Postgres on Neon:
  connections, pooled vs direct, schema migrations, branching, autoscaling,
  scale-to-zero, instant restore, read replicas, IP allow lists, logical
  replication, and Lakebase Search. Use when the work is an existing
  DATABASE_URL, SQL, schema, inspect, or search. New backends, Auth, files,
  Functions, and LLM calls go to the parent `neon` skill. Also use for
  "@neondatabase/serverless", "@neondatabase/neon-js", "neon inspect db",
  "semantic search", "vector search", "full-text search", "BM25", or
  "hybrid search".
metadata:
  parent: neon
  source: https://github.com/neondatabase/agent-skills/tree/main/skills/neon-postgres
---

**FIRST**: Use the parent `neon` skill for a Neon overview, getting started with Neon, Neon development best practices, and more.

# Lakebase Postgres

Lakebase Postgres is the database at the core of Neon. It runs on the lakebase architecture — OLTP built directly on cloud object storage — which decouples storage from compute to offer autoscaling, branching, instant restore, and scale-to-zero. It's fully compatible with Postgres and works with any language, framework, or ORM that supports Postgres.

It is the same database whether you reach it through Neon or through Databricks; this skill covers the Neon access path.

Login, users, sessions, and `@neondatabase/auth` belong in `neon-auth`.

## Setup Flow

### 1. Select the organization and project

If a `DATABASE_URL` is already supplied (prompt, environment, or repo) or a `.neon` file points at a project, use it. Do not list organizations or create a second project for schema work.

Otherwise use the CLI (default) or MCP server to list organizations and projects. Let the user select an existing project or create a new one.

### 2. Get the connection string

If a `DATABASE_URL` is already supplied, use it. Do not fetch another through the CLI or MCP.

Otherwise use the CLI (default), `neon env pull`, or the MCP server to get the connection string. Store it in `.env` as `DATABASE_URL`. Read the file first before modifying it, to avoid overwriting existing values.

#### When to use pooled vs direct connections

| Use case | Connection type |
| --- | --- |
| Web applications, serverless functions | Pooled (-pooler) |
| Schema migrations | Direct |
| pg_dump / pg_restore | Direct |
| Logical replication | Direct |
| Long-running analytics with temp tables | Direct |
| Admin tasks needing SET or session state | Direct |
| LISTEN / NOTIFY | Direct |

### 3. Pick the connection method and driver

Preserve the existing ORM and driver. For new TypeScript schema work with no established choice, Drizzle is a suggestion: https://neon.com/docs/guides/drizzle.md. Refer to the connection methods guide to pick the correct driver based on how the runtime treats your code: https://neon.com/docs/connect/choose-connection.md.

Driver notes:

- On Vercel, use `node-postgres` (`npm install pg`) with Vercel Fluid compute and `import { attachDatabasePool } from "@vercel/functions";`
- On Cloudflare, use `node-postgres` with Cloudflare Hyperdrive
- On Neon Functions, use `node-postgres`, as the functions are long-running and reuse the pool across requests.
- Use the `@neondatabase/serverless` driver for serverless and edge environments (for example, when using Netlify) — HTTP transport for one-shot queries, WebSocket for transaction support. Link: https://neon.com/docs/serverless/serverless-driver.md

### 4. Set up the schema

Manage schemas and migrations as code. Avoid running ad hoc schema migrations against your database, since they're hard to manage.

If you're using an ORM, follow your ORM's best practices to manage schemas and migrations. For example, if using Drizzle, only use Drizzle for schema and migration management unless instructed otherwise.

## Branching

Use this when the user is planning isolated environments, schema migration testing, preview deployments, or branch lifecycle automation.

Key points:

- Branches are instant, copy-on-write clones (no full data copy).
- Each branch has its own compute endpoint.
- Use the neon CLI or MCP server to create, inspect, and compare branches.

Link: https://neon.com/docs/introduction/branching.md

## Migrations

Test a migration on a branch of production, against production-like data, before applying it to production.

Use a **direct (non-pooled)** connection string when you run the migration, not a pooled one. `neon connection-string` returns the direct string by default; make sure the hostname does not include the `-pooler` suffix.

## Troubleshooting and Neon-Specific Performance

Use Neon's predefined, read-only diagnostics before writing catalog queries by hand. The Neon CLI `neon inspect db` subcommands and the Neon MCP server's `inspect_database` tool run the same checks.

This section covers Neon-specific diagnostic tools, compute cache behavior, and platform signals. When the evidence points to generic Postgres work such as rewriting a query, choosing an index, changing a schema, or interpreting plan nodes, load the [`postgres-best-practices`](https://github.com/neondatabase/postgres-skills/tree/main/skills/postgres-best-practices) skill and carry the diagnostic evidence into that workflow.

Docs:

- CLI: https://neon.com/docs/cli/inspect.md
- Query performance: https://neon.com/docs/postgresql/query-performance.md
- `pg_stat_statements`: https://neon.com/docs/extensions/pg_stat_statements.md
