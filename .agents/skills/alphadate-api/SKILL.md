---
name: alphadate-api
description: >-
  Manages the AlphaDate backend API integration, endpoints, mock generation, and backend requirement tracking. Use this skill whenever interacting with the AlphaDate API, adding or updating API endpoints/properties, working with mocks for missing features, or tracking required backend enhancements.
---

# AlphaDate API Management Skill

This skill governs API communication, data contracts, mock creation, and backend feature tracking for the **AlphaDate** service.

## 1. Authoritative API Documentation (Always Live)

The API specification is dynamic and is maintained centrally in the backend repository. **Do not store or rely on local copies of the specification.** Always consult the live remote document:

- **Live Documentation**: [GitHub: api-me AlphaDate Docs](https://github.com/SergiiVdovareize/api-me/blob/main/docs/api/alphadate.md)
- **Raw Fetch URL**: `https://raw.githubusercontent.com/SergiiVdovareize/api-me/main/docs/api/alphadate.md`
- When verifying endpoints, types, or business rules, fetch the raw markdown directly using `read_url_content` or `curl`.

### Base URLs
- **Local Development**: `http://localhost:3000`
- **Production**: `https://api.vdovareize.me`

---

## 2. Operating Workflow: Handling API Gaps & Missing Features

Whenever a requested feature requires an API method, parameter, or property that the backend does not yet support:

### Step 1: Check Live Backend Specification
Fetch and read the latest specification from:
`https://raw.githubusercontent.com/SergiiVdovareize/api-me/main/docs/api/alphadate.md`

If the requested property, endpoint, or behavior is **missing or incomplete**:
1. **Do not block frontend development**.
2. Proceed to implement client-side mocks and log the backend requirement.

### Step 2: Implement Client Mock & Fallback
Follow [mock-strategy.md](./references/mock-strategy.md):
1. **For missing properties on existing endpoints** (e.g. new letter metadata, custom tags, date ratings):
   - Add optional field to TypeScript interface (`LetterState`, `BoardMetadata`).
   - Provide a safe client fallback or `localStorage` cache in `src/composables/useAlphabetState.ts` or `src/services/api.ts`.
2. **For missing endpoints or operations** (e.g. history filtering, board cloning, sharing):
   - Add the method signature to `src/services/api.ts`.
   - Implement mock logic returning expected mock data or simulating state transitions locally.
   - Prefix or flag mock logic clearly with `// [MOCK - Pending BE: AP-XXX]`.

### Step 3: Record Backend Requirement in Backlog
Record the required API task in [docs/api-backlog.md](file:///Users/s.vdovareize/work/alphadate/docs/api-backlog.md).
Include:
- **Title & ID** (e.g., `AP-001: Add letter ideas/notes endpoint`)
- **Status**: `🟡 Proposed`
- **Target Endpoint & HTTP Method**
- **Frontend Need & Motivation**
- **Proposed Request / Response DTO Schema**
- **Mock Details**: File and line where mock is running in frontend
- **Acceptance Criteria for Backend**

### Step 4: Verification
- Verify that frontend builds cleanly with `npm run build`.
- Verify that user flows work with the mock seamlessly without unhandled runtime rejections.

---

## 3. Transitioning from Mock to Live Backend

Once the backend (`api-me`) deploys the required changes:
1. Confirm the new contract in the live remote documentation ([api-me Docs](https://github.com/SergiiVdovareize/api-me/blob/main/docs/api/alphadate.md)).
2. Update `src/services/api.ts` to route requests to the live backend.
3. Remove temporary mock/fallback handlers.
4. Mark the task as `🟢 Completed` in [docs/api-backlog.md](file:///Users/s.vdovareize/work/alphadate/docs/api-backlog.md).
5. Run `npm run build` to confirm contract integrity.
