---
name: ps-backend-architecture
description: Design or review maintainable backend architecture for PS_Platform, including APIs, application services, domain rules, persistence, integrations, security, and performance. Use when implementing or reviewing backend features, data access, authentication, or service boundaries.
---

# Backend architecture

Inspect the existing project conventions before proposing changes. Extend consistent patterns; do not introduce an architecture style or unrelated refactor without a clear need.

## Design process

1. Identify the user outcome, inputs/outputs, entities, rules, permissions, failure modes, and external dependencies.
2. Define boundaries: API/presentation, application services, domain logic, repositories or persistence adapters, and external services.
3. Keep business decisions out of controllers and database queries. Give each module one clear responsibility.
4. Define request and response contracts, validation, error behavior, authorization, logging, and transactions.
5. Consider data integrity, query patterns, pagination/filtering/sorting, indexes, async work, and only measured performance bottlenecks.

## Standards

- Never trust client input; validate server-side and enforce integrity in the database.
- Use parameterized queries, least-privilege access, secure configuration, and do not expose internal error details to users.
- Return deliberate DTOs/contracts rather than persistence entities when boundaries differ.
- Use clear names, reusable queries, explicit transactions, and tests for business rules and important failure paths.
- Make APIs predictable, documented, versionable when needed, and use appropriate HTTP status codes.
- Treat Supabase schema changes as user-controlled deliverables: generate explicit, versioned migration SQL and verification steps, but do not apply remote changes unless the user explicitly authorizes the named migration.
- Keep domain rules in explicit application services by default. Do not introduce database functions, triggers, RPCs, or background jobs unless their need, behavior, data impact, and rollback approach have been reviewed and explicitly approved.

## Review before delivery

Confirm responsibilities are separated, duplication is controlled, permissions are checked, errors are safe and actionable, queries are not unnecessarily expensive, and the feature fits the project conventions.
