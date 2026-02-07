# Project Context

This repository implements a simple app that calls external APIs, as specified in PRD.md.

# AI Development Workflow

- Always start from PRD.md when planning.
- Do not write code until an implementation plan exists in `docs/plan.md`.

## Model Strategy

- High-cost model: used only for planning and high-level architecture (plan.md).
- Mid-cost model: used for feature implementation, refactors, and tests.
- Low-cost model: used for boilerplate, schemas, and repetitive code.

When editing, follow the existing plan in docs/plan.md or update it first.
