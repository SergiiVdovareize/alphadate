# Mocking Strategy & Backend Feature Gap Protocol

When developing frontend features in AlphaDate that require endpoints, properties, or behavior not yet supported by the backend API:

## 1. Principle: Non-blocking Frontend Progress
The frontend must **never be blocked** waiting for backend deployments. Whenever an API requirement arises:
1. Implement a **graceful mock / fallback layer** in the client code.
2. Log the required backend modification in `docs/api-backlog.md`.
3. Design mock types and structures so the transition to the live API requires zero or minimal UI code changes (only toggling the mock or removing the fallback).

---

## 2. Mocking Patterns in AlphaDate

### A. Missing Property on an Existing Endpoint
If the backend returns an object that lacks a new field (e.g. `partnerAvatar`, `reactions`, etc.):
- Extend TypeScript interfaces with optional fields:
  ```typescript
  export interface LetterState {
    letter: string;
    status: 'available' | 'used' | 'skipped' | 'excluded';
    note?: string;
    // [MOCK / PENDING BE] Proposed field
    reactions?: string[];
  }
  ```
- Use a safe client fallback or localStorage cache in the service/composable:
  ```typescript
  const letterReactions = letter.reactions ?? getLocalMockReactions(letter.letter);
  ```

### B. Missing Endpoint or Method
If an entirely new endpoint is needed (e.g. `POST /alphadate/:key/notes` or `GET /alphadate/:key/history`):
- Implement the method in `src/services/api.ts` with a mock toggle or local storage fallback:
  ```typescript
  async getNotes(key: string): Promise<Note[]> {
    // Check if live API is ready or use mock
    const USE_MOCK = true;
    if (USE_MOCK) {
      return getMockNotes(key);
    }
    const response = await fetch(`${BASE_URL}/alphadate/${key}/notes`);
    ...
  }
  ```
- Store mock data in `src/services/mocks/` or `localStorage` to simulate real persistence during UX testing.

---

## 3. Transitioning from Mock to Live API

When the backend implements the feature:
1. Update `src/services/api.ts` to call the live endpoint directly.
2. Remove temporary mock adapters and fallback helpers.
3. Update `docs/api-backlog.md` status to `Implemented` / `Closed`.
4. Run `npm run build` to verify contract type safety.
