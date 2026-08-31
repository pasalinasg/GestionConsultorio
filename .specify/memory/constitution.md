<!--
Sync Impact Report
- Version change: initial constitution.
- Added principles: privacy, explicit data control, modularity, safe evolution, Spanish domain language.
-->

# Gestion de consultorio Constitution

## Core Principles

### I. Privacy, Confidentiality, and Access Control (NON-NEGOTIABLE)

Patient, professional, appointment, and administrative data are sensitive. Every read, write,
export, and report MUST have explicit authorization. Credentials and personal data MUST never be
logged or exposed to unauthorized clients. Client-side filtering is never access control.

### II. Explicit and User-Controlled Database Evolution (NON-NEGOTIABLE)

Every schema change MUST be a focused, readable, versioned SQL migration. Tables, columns,
relations, constraints, indexes, RLS policies, seed data, views, functions, triggers, and jobs
MUST be declared explicitly. Agents MUST not apply database changes remotely. Functions, triggers,
RPCs, materialized views, and scheduled jobs require a prior explanation and explicit user
approval for the named change; application services and direct queries are the default.

### III. Traceable Operational Records

Changes that affect appointments, patient records, attendance, billing, or availability MUST
retain sufficient date, actor, and reason context to be understood and safely corrected. Existing
records MUST be preserved by migrations unless an explicitly approved retention or correction rule
says otherwise.

### IV. Modular Domain Boundaries

Business rules MUST remain separate from UI and persistence frameworks. New capabilities MUST have
clear domain ownership, validation, permissions, and responsibilities, extending reusable modules
before duplicating behavior.

### V. Safe, Tested Evolution

Plans for data-affecting features MUST describe ownership, validation, data migration impact,
failure handling, verification, and rollback. Inputs are validated server-side. Changes to
permissions, patient history, schedules, or billing require relevant automated tests before
delivery.

### VI. Spanish Domain Language

Product concepts, modules, routes, tables, columns, contracts, variables, and functions MUST use
clear, consistent Spanish without accents in technical identifiers. English is only permitted at
framework, library, protocol, or third-party API boundaries.

## Development Workflow & Quality Gates

- Every meaningful feature begins with a Spec Kit specification and a plan.
- Before proposing a database migration, document the entities, data sensitivity, ownership,
  relationships, integrity rules, query needs, impact on existing data, and manual rollback.
- Before delivery, provide the exact SQL migration and verification commands; applying it is the
  user's decision.
- Reviews verify authorization, confidentiality, explicit schema control, traceability, and
  responsive UI states where relevant.

## Governance

This constitution governs specifications, plans, tasks, implementation, and reviews. Changes to
these rules must be documented here with an updated Sync Impact Report and a semantic version
bump.

**Version**: 1.0.0 | **Ratified**: 2026-08-29 | **Last Amended**: 2026-08-29
