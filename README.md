# Supplier Quote Comparison Tool

A full-stack web application for procurement teams to create RFQs, collect supplier quotes, and compare them side by side. Built as a take-home assignment for Stozia.

## Features

- Create RFQs with item details, quantity, delivery expectations, and notes
- Add supplier quotes manually for any RFQ
- Compare quotes in a table with calculated total price (`unit price × quantity`)
- Highlight the best quote based on the lowest total price
- Import supplier quotes from CSV with row-level validation and error reporting
- Seed data for quick local exploration

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Backend | FastAPI + SQLAlchemy | Typed request/response models, automatic OpenAPI docs, clean Python service layer |
| Database | SQLite | Zero external dependencies, easy local setup, sufficient for this scope |
| Frontend | React + TypeScript + Vite | Component-based UI, strong typing, fast dev server |
| API style | REST JSON | Simple resource-oriented endpoints that map cleanly to the UI |

## Architecture

```text
frontend/ (React UI)
    │
    │  REST /api/*
    ▼
backend/app/
    ├── routers/      HTTP endpoints
    ├── services/     Business logic (comparison, CSV import)
    ├── models.py     SQLAlchemy ORM models
    └── schemas.py    Pydantic validation/DTOs
            │
            ▼
      SQLite (backend/data/rfq.db)
```

### Data Model

- **RFQ**: one procurement request (item, spec, quantity, delivery expectation, notes)
- **SupplierQuote**: many quotes per RFQ (supplier, unit price, currency, lead time, payment terms, remarks)

Total price is computed at read time from `unit_price × rfq.quantity`, not stored separately. That avoids stale totals if quantity changes later.

### API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/rfqs` | List RFQs |
| `POST` | `/api/rfqs` | Create RFQ |
| `GET` | `/api/rfqs/{id}` | RFQ details with quotes |
| `GET` | `/api/rfqs/{id}/comparison` | Comparison table with best quote flagged |
| `POST` | `/api/rfqs/{id}/quotes` | Add a quote |
| `POST` | `/api/rfqs/{id}/quotes/import` | Import quotes from CSV |

Interactive API docs: `http://127.0.0.1:8000/docs`

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://127.0.0.1:8000`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173` and proxies `/api` requests to the backend.

## Sample Data

Running `python seed.py` creates two RFQs with multiple supplier quotes so you can explore comparison immediately.

## CSV Import

Sample file: [`sample_quotes.csv`](./sample_quotes.csv)

### Expected format

```csv
supplier_name,unit_price,currency,lead_time,payment_terms,remarks
NorthStar Components,8.25,USD,4 weeks,Net 30,Includes freight to warehouse
```

### Validation rules

- Header row is required
- Required columns: `supplier_name`, `unit_price`, `currency`, `lead_time`, `payment_terms`
- Optional column: `remarks`
- `unit_price` must be a positive number
- `currency` must be a 3-letter code
- Empty rows are skipped
- Import is all-or-nothing: if any row fails validation, no rows are saved and all errors are returned

## Assumptions and Tradeoffs

1. **No authentication** — per assignment scope; all endpoints are open for local use.
2. **No currency conversion** — best quote is chosen by lowest numeric total price. Mixed currencies are allowed, but a production system would normalize to a base currency before comparing.
3. **Total price is derived, not stored** — keeps the schema simple and guarantees consistency with RFQ quantity.
4. **SQLite instead of PostgreSQL** — faster local onboarding; schema and service layer would transfer cleanly to Postgres.
5. **CSV import is atomic** — partial imports are avoided so users do not end up with incomplete quote sets.
6. **Single-user workflow** — no optimistic locking or concurrent edit handling.
7. **Minimal styling** — focused on clarity and functionality over visual polish.

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routers/
│   │   └── services/
│   ├── requirements.txt
│   └── seed.py
├── frontend/
│   └── src/
│       ├── api/
│       └── components/
├── sample_quotes.csv
└── README.md
```
