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

### 🟡 AP-002: Date completion photo support in board state
- **Requested Date**: 2026-10-03
- **Target Endpoints**: `PUT /alphadate/:key`, `GET /alphadate/:key`
- **Frontend Need**: Users can attach 1 photo from their date when completing a letter. The client resizes & compresses the image into a WebP data URL (with JPEG fallback) and includes `photo` in `LetterState` and `LetterHistoryItem`.
- **Proposed Request / Response Addition**:
  ```json
  // In LetterState (PUT payload & GET response):
  {
    "letter": "К",
    "status": "used",
    "note": "Каяки на заході сонця",
    "photo": "data:image/webp;base64,..."
  }

  // In LetterHistoryItem (GET response):
  {
    "letter": "К",
    "partnerName": "Олена",
    "status": "used",
    "note": "Каяки на заході сонця",
    "photo": "data:image/webp;base64,...",
    "completedAt": "2026-10-03T18:00:00.000Z"
  }
  ```
- **Client Mock Status**: Client compresses image to max 1200px WebP quality 0.8 (~60-100KB, fallback JPEG ~100-160KB), stores in localStorage, and sends via existing `updateBoard` payload.
- **Backend Acceptance Criteria**:
  - [ ] Persist `photo` (string / data URL) in letter objects in `letters` array on `PUT /alphadate/:key`.
  - [ ] Return `photo` field in `letters` and `history` on `GET /alphadate/:key`.
  - [ ] (Future enhancement) Dedicated photo upload endpoint `POST /alphadate/:key/photo` if payload sizes grow.

