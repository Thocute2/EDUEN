# AGENTS.md

## Project Overview
This is a zero-cost MVP for a vocabulary learning application targeting professionals. Users can search for vocabulary, learn grammar/context, and practice with real-world work scenarios.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Shadcn UI (for minimal, clean components)
- **Icons**: Lucide React
- **Database/State (MVP)**: LocalStorage (moving to PostgreSQL later)

## Core Libraries to use
- **Dictionary API**: Free Dictionary API (https://api.dictionaryapi.dev/api/v2/entries/en/)
- **Spaced Repetition**: `ts-fsrs` (TypeScript implementation of FSRS-6)
- **Text-to-Speech**: Web Speech API (Browser native, zero cost)

## Coding Guidelines
- Write clean, modular, and reusable React components.
- Always use TypeScript interfaces/types for API responses.
- Do not use placeholder images or dead links.
- Implement error handling for all API requests.
- When executing terminal commands (like `npm install`), ask for permission or use auto-mode if configured.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
