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
