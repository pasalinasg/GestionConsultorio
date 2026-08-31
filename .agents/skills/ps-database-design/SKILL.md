---
name: ps-database-design
description: Design or review reliable and maintainable database schemas for PS_Platform. Use when creating tables, entities, relationships, migrations, queries, indexes, constraints, historical records, or data models.
---

# Database design for Gestion de consultorio

Model the business domain, not screen layouts. Establish entities, ownership, relationships, lifecycle/history, access patterns, integrity rules, and data sensitivity before defining tables.

## Design rules

- Give entities clear singular names, stable primary keys, meaningful fields, correct types, and audit fields when warranted.
- Represent one-to-one, one-to-many, and many-to-many relations explicitly; use junction tables for many-to-many data.
- Normalize by default. Denormalize only for a measured purpose and document why.
- Enforce invariants using required fields, unique constraints, foreign keys, and checks; do not rely solely on application code.
- Use decimal/numeric values for money, parameterized queries, controlled permissions, and avoid storing unnecessary sensitive data.
- Preserve history where time matters; use soft deletion only when recovery/auditing has a real business need.
- Create indexes for genuine lookup, join, sorting, and uniqueness needs, balancing write cost.
- Make every schema change a versioned migration; do not make uncontrolled production changes.
- Before drafting a schema migration, identify the affected entities, data sensitivity, ownership, access patterns, integrity rules, and impact on existing data.
- Keep each migration focused, readable, and independently reviewable. Declare tables, columns, foreign keys, checks, unique constraints, indexes, RLS policies, seed data, views, functions, and triggers explicitly in versioned SQL.
- Do not create or change remote Supabase resources as part of implementation. Prepare the SQL and verification steps for user-controlled application.
- Do not use database functions, triggers, RPCs, materialized views, or scheduled jobs by default. If one is necessary, explain why application-level logic or a direct query is insufficient, obtain explicit user approval, document its behavior, and test it.
- Prefer explicit constraints and application services over hidden database behavior. Never make a destructive or data-rewriting migration without a reviewed preservation and rollback plan.
- For patient, practitioner, appointment, and administrative data, establish row ownership and RLS policies explicitly before exposing the table to an application client.

## Review before delivery

Verify the model reflects real rules, invalid states are constrained, common queries and pagination are practical, migrations are reversible where feasible, and access to sensitive data is appropriately controlled. Confirm that no unapproved function, trigger, RPC, remote schema action, or opaque automation has been introduced.
