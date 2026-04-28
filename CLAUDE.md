# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MX Money is a personal finance application with a Spring Boot backend (Java 25) and a React/TypeScript frontend. The backend serves the frontend as static assets in production; in development they run separately with a Vite proxy.

## Commands

### Backend (from `backend/`)

```bash
# Build & run (also compiles frontend via frontend-maven-plugin)
mvn clean install
mvn spring-boot:run

# Run tests
mvn test

# Run a single test class
mvn test -Dtest=TransactionServiceTest

# Run a single test method
mvn test -Dtest=TransactionServiceTest#methodName
```

### Frontend (from `frontend/`)

```bash
npm install
npm run dev        # Dev server on :5173, proxies /api → :8080
npm run build      # TypeScript check + Vite build (output: dist/)
npm run lint       # ESLint
```

### Full production build

Run `mvn clean install` from `backend/` — it installs Node, runs `npm install` and `npm run build` in `../frontend`, then copies `frontend/dist` into `backend/target/.../static`.

## Architecture

### Backend (`backend/src/main/java/com/mx/money/`)

Standard Spring Boot layered architecture:

- **`entity/`** — JPA entities: `Transaction`, `Category`, `CategorizationRule`. `Transaction` stores `amount` always positive; `getSignedAmount()` applies sign by `TransactionType` (INCOME/EXPENSE). Recurring transactions use a template pattern: the template has `recurrence != NONE`, generated copies have `recurrence = NONE` and `parentRecurringId` pointing back.
- **`repository/`** — Spring Data JPA repositories on SQLite (`./data/mxmoney.db`).
- **`service/`** — Business logic. `RecurringTransactionService` runs a `@Scheduled` daily job that walks all recurring templates and generates missing occurrences using `lastGeneratedDate` as a cursor. `CsvCategorizationService` uses Spring AI (Ollama/llama3.2) with a two-stage pipeline: first applies `CategorizationRule` regex rules, then sends only unmatched items to the LLM with `categories.md` as a RAG knowledge base and recent user transaction history as few-shot examples.
- **`controller/`** — REST controllers under `/api/*`.
- **`dto/`** — Request/Response DTOs.
- **`mapper/`** — MapStruct mappers (`TransactionMapper`, `CategoryMapper`).
- **`config/`** — `CorsConfig` (allows all origins in dev), `CategoryInitializer` (seeds default categories on first run), `ObjectMapperConfig`.

Backend runs on port **8066** (set in `application.properties`; README says 8080 — trust the properties file).

### Frontend (`frontend/src/`)

- **`api/index.ts`** — All HTTP calls via axios, baseURL `/api`. Covers transactions, categories, balance, backup, reports (AI), and CSV import.
- **`types/index.ts`** — Shared TypeScript types mirroring backend DTOs.
- **`hooks/useApi.ts`** — TanStack Query hooks wrapping the API layer. Mutations invalidate related query keys on success.
- **`i18n/`** — Language context (PT-BR / EN) with a `useLanguage()` hook and `translations.ts` for all UI strings.
- **`pages/`** — One file per page: Dashboard, Transactions, Calendar, Search, Projection, Simulator, Recurring, Reports (AI), Import (CSV), Settings.
- **`components/`** — Shared UI components (BalanceCard, BudgetOverview, CategoryManager, ProjectionChart, SpendingByCategory, TransactionForm, TransactionList).
- Navigation is purely client-side state in `App.tsx` (no React Router); page is a `useState<Page>` union.
- Theme (dark/light) is stored in `localStorage` and applied as `data-theme` attribute on `<html>`.
- Styles use vanilla CSS with CSS custom properties defined in `index.css`.

### AI Integration

`ReportService` and `CsvCategorizationService` use Spring AI `ChatClient` pointed at Ollama (`http://localhost:11434`, model `llama3.2`). The knowledge base for CSV categorization lives in `backend/src/main/resources/categories.md`. AI features degrade gracefully when Ollama is unavailable.

### Data & Backup

The SQLite database is at `backend/data/mxmoney.db`. `BackupService` handles file-based backups and a JSON export/import format (`BackupJsonData` DTO). Backup settings are persisted in `backend/data/backup-settings.properties`.

## Key Conventions

- MapStruct + Lombok: always list Lombok before MapStruct in `annotationProcessorPaths` (enforced by `lombok-mapstruct-binding`).
- `spring.jpa.hibernate.ddl-auto=update` — schema is auto-migrated; there are no migration scripts.
- Tests use H2 in-memory instead of SQLite (see `pom.xml` test scope dependency).
- The frontend dev proxy (`vite.config.ts`) points to `:8080`, but the backend property sets port `8066` — update `vite.config.ts` if you change `server.port`.
