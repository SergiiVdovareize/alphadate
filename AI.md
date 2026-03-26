# AlphaDate

## Overview
A lightweight web app that helps couples track alphabet-based themed dates.
Users select letters (manually or randomly) from the Ukrainian alphabet,
and used letters are permanently marked as unavailable. The app handles
only letter selection and state tracking — date ideas are out of scope.

## Core Functionality
- Display full Ukrainian alphabet (А–Я, including Ґ, Є, І, Ї) in standard order
- Two selection modes: manual pick or random (roulette)
- Letter states: Available / Used (permanent, no reuse)
- Shared session per couple with persistent state (backend API, TBD)
- Each couple has independent alphabet state

## Non-Goals
The app must NOT:
- Suggest or generate date ideas
- Use AI for any content
- Include recommendations or gamification

## Future Scope (do not implement now)
- Progress tracking, achievements, streaks
- Budget/time filters
- Multiple alphabet support
- Enhanced user accounts

## Tech Stack
- Node version: lts/krypton
- Vue
- TypeScript
- [oat.ink](https://oat.ink/) as UI library
- deploy on github pages
- eslint and prettier
- Backend: Existing API (integration TBD)

## Rules
- Do not do Visual verification, I'll do it by my own
- Do not pull and push anything without permission
- Add short comment about what you do when ask for permission for anything
- Do not add any tests until it's asked
- Use code and formatting style according to .eslintrc.cjs and .prettierrc files