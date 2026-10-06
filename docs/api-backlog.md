# 📋 AlphaDate Backend API Requirements & Backlog

This document tracks required backend changes, missing API endpoints, property proposals, and contract improvements requested by the AlphaDate frontend application.

---

## 📌 Status Legend
- 🟡 `Proposed`: Identified frontend need, mock/fallback implemented in client.
- 🔵 `In Progress`: Backend task created / actively being developed in `api-me`.
- 🟢 `Completed`: Deployed to production (`https://api.vdovareize.me`), client mock transitioned to live API.
- ⚪ `Closed / Rejected`: Alternative solution adopted.

---

## 📝 Active Requirements & Tasks

### 🟡 AP-001: Board link recovery via email
- **Requested Date**: 2026-10-02
- **Target Endpoint**: `POST /alphadate/recover`
- **Frontend Need**: Users who lost or forgot their board URL can request the board link(s) to be sent to their email.
- **Proposed Request / Response**:
  ```json
  // Request (POST /alphadate/recover):
  {
    "email": "couple@example.com"
  }

  // Response (200 OK):
  {
    "success": true,
    "message": "Board recovery email sent if the address exists"
  }
  ```
- **Client Mock Status**: Implemented with graceful fallback mock in `src/services/api.ts` (`api.recoverBoard`).
- **Backend Acceptance Criteria**:
  - [ ] Lookup board keys associated with the provided email.
  - [ ] Send email with direct link(s) to the board(s).
  - [ ] Always return `{ "success": true }` to prevent email enumeration.
  - [ ] Document endpoint in `docs/api/alphadate.md`.

### 🟢 AP-002: Date completion photo support and update completed letter
- **Requested Date**: 2026-10-03
- **Completed Date**: 2026-10-06
- **Target Endpoints**: `PUT /alphadate/:key`, `GET /alphadate/:key`, `PATCH /alphadate/:key/letters/:letter`
- **Frontend Need**: Users can attach 1 photo when completing a letter, and edit/update the note or photo of completed letters directly from the memories page.
- **Implemented Contract**:
  - `PATCH /alphadate/:key/letters/:letter` with `{ note: string | null, photo: string | null }`
  - Headers: `x-board-pin` for protected boards.
- **Status**: Completed in backend (`api-me`) and integrated in frontend via `api.updateLetter`, `useAlphabetState.updateCompletedLetter`, and `InlineMemoryEditor.vue` in `Memories.vue`.

