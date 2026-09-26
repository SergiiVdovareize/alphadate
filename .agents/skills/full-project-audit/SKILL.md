---
name: full-project-audit
description: >-
  Performs a rigorous, comprehensive project review across three core pillars: Code Quality, Software Architecture, and Application Security. Activate whenever the user asks for a code review, architecture evaluation, security audit, code smell inspection, or production-readiness assessment.
---

# 🛡️ Full Project Audit & Review Skill

This skill defines the authoritative review protocol for auditing codebases (with special emphasis on modern TypeScript, Vue 3 Composition API, Vite, and REST API integrations).

Whenever invoked, the agent evaluates the codebase against three core pillars and produces a structured, actionable audit report.

---

## 🏛️ The Three Audit Pillars

### Pillar 1: Code Quality & Clean Code (Якість коду)

1. **TypeScript Strictness & Type Safety**:
   - Zero tolerance for untyped `any`. Use `unknown` with narrowing type guards (`instanceof Error`, custom type predicates) where dynamic data is encountered.
   - Exhaustive interfaces/types for all API payloads, responses, models, component props, and event emissions.
   - Enums vs string literal unions: prefer union types (`'available' | 'used' | 'excluded'`) for better tree-shaking and interoperability.
   - Defensive typing: explicitly model nullable and optional fields (`note?: string`, `letter: string | null`).

2. **Vue 3 Composition API Best Practices**:
   - Modern `<script setup lang="ts">` syntax.
   - Computed properties must remain pure: no state mutations or side effects inside `computed()`.
   - Resource cleanup: verify all intervals, timeouts, and event listeners are properly cleared in `onUnmounted()`.
   - Prop & event declaration rigor: use type-based `defineProps<{...}>()` and `defineEmits<{...}>()`.

3. **Code Smells & Maintainability**:
   - Elimination of dead code, commented-out logic, unused variables, and leftover debugging artifacts (`console.log`).
   - Function complexity: functions should have a single responsibility, early returns for guards, and manageable cyclomatic complexity.
   - Adherence to project CSS tokens (colors, spacing, 3D shadows). No hardcoded rogue hex colors or ad-hoc style overrides.

---

### Pillar 2: Architecture & System Design (Архітектура системи)

1. **Layer Separation & Boundaries**:
   - **Presentation Layer** (`src/pages`, `src/components`): purely renders UI and captures user input. Must not execute direct `fetch()` or raw HTTP calls.
   - **Domain / State Layer** (`src/composables`): encapsulates business rules, reactivity, turn logic, and local state.
   - **Data / Transport Layer** (`src/services/api.ts`): sole gateway for backend communication. Manages URL composition, HTTP headers, serialization, and raw error handling.

2. **State Management & Synchronization**:
   - Single Source of Truth: distinguish clearly between persistent domain state (board state, letters) and ephemeral UI state (modals, dropdowns, loading spinners).
   - Unidirectional data flow: props down, events up. Avoid component two-way mutations of parent state.
   - Offline & Storage strategy: verify safe deserialization from `localStorage` with migration handling for legacy schemas and graceful fallbacks.

3. **Coupling & Cohesion**:
   - Components should remain cohesive and focused. Decompose oversized components into atomic units.
   - Decouple feature modules to allow independent testing and reusability.

4. **Error Boundaries & Resilience**:
   - Graceful degradation when network requests fail.
   - Meaningful error states and user retry triggers instead of unhandled promise rejections or blank screens.

---

### Pillar 3: Security & Trust (Безпека та захист)

1. **Input Sanitization & Injection Prevention**:
   - Safe rendering: ensure all user-generated and remote API strings are bound via text interpolation (`{{ text }}`). Never use `v-html` for dynamic user or API content without strict sanitization.
   - URL parameter encoding: ensure dynamic query and path segments (e.g. board keys, alphabet characters) are passed through `encodeURIComponent()`.

2. **Client-Side Storage & Sensitive Data**:
   - Verify that sensitive tokens, plain PINs, or confidential personal identifiable information (PII) are not stored unencrypted in `localStorage`.
   - Verify that sensitive keys or environment secrets are not exposed in client-side Vite bundles (`VITE_*` variables must be public by design).

3. **Network Security & API Boundary**:
   - Enforce HTTPS for production endpoints (`https://...`).
   - Validate API responses before assuming shape correctness. Guard against malformed JSON or unexpected nulls.
   - UI debouncing / request throttling: prevent duplicate submissions or race conditions on interactive buttons (e.g. completing a date, creating a board).

---

## 🔍 Audit Execution Workflow

When performing an audit on a repository or specific files:

1. **Static Analysis & Build Verification**:
   - Run linter: `npm run lint`
   - Run type checker & build: `npm run build`
   - Inspect build chunk sizes and warning outputs.

2. **File-by-File & Architectural Inspection**:
   - Review core services (`src/services/`), composables (`src/composables/`), and critical pages/components.
   - Cross-reference findings against the three pillars above.

3. **Report Generation**:
   Structure the audit report with actionable severity ratings:
   - 🔴 **Critical / High**: Security vulnerabilities, type-safety crashes, unhandled rejections, state desync.
   - 🟡 **Medium / Warning**: Architectural leakages, missing cleanups, performance bottlenecks, code smells.
   - 🟢 **Low / Improvement**: Style consistency, minor refactoring, optimization suggestions.
   - Include specific file links with line ranges (`[File.vue:10-25](...)`) and ready-to-use code snippets showing the recommended fix.
