# Finvault Backend — Phase 2

FastAPI backend foundation: database, expense CRUD, CSV import, and a
spending analytics engine. No charts, no ML — that's later phases. This
covers everything needed for the React frontend to start reading real data
instead of mock data.

## Folder structure

```
finvault-backend/
├── requirements.txt
├── .env.example              # copy to .env if you want to override defaults
├── sample_data/
│   └── sample_expenses.csv   # test file for POST /upload-csv
└── app/
    ├── main.py                # FastAPI app, middleware, routers, error handlers
    ├── config.py               # Settings (env vars), CORS origins
    ├── database.py             # SQLAlchemy engine/session/Base + get_db dependency
    ├── models/                 # SQLAlchemy ORM tables
    │   ├── expense.py
    │   ├── goal.py
    │   ├── recommendation.py
    │   └── user_behavior.py
    ├── schemas/                 # Pydantic request/response shapes
    │   ├── expense.py
    │   ├── csv_upload.py
    │   ├── goal.py
    │   ├── recommendation.py
    │   ├── user_behavior.py
    │   └── analytics.py
    ├── routes/                  # Thin HTTP layer — no business logic here
    │   ├── expenses.py
    │   ├── upload.py
    │   └── analytics.py
    └── services/                # All business logic / DB queries
        ├── expense_service.py
        ├── csv_service.py
        └── analytics_service.py
```

**Why this split:** routes only parse the request and call a service; services
own all the SQLAlchemy querying and business rules. This means the CSV
upload can reuse `expense_service.create_expense` row-by-row instead of
duplicating insert logic, and the analytics calculations are unit-testable
without spinning up FastAPI at all.

## Database

SQLite, file-based, created automatically on first run at
`finvault-backend/finvault.db` (relative to wherever you launch uvicorn
from). No manual migration step needed for this phase — `Base.metadata.create_all()`
runs on startup and creates any missing tables.

| Table | Columns |
|---|---|
| `expenses` | id, amount, category, date, description, created_at |
| `goals` | id, name*, target_amount, target_date, current_amount*, created_at |
| `recommendations` | id, message, status, created_at |
| `user_behavior` | id, action, timestamp |

\* `name` and `current_amount` on `goals` are small additions beyond your
original spec — the frontend Goals page already expects a name and a
progress amount per goal. No routes use the `goals`, `recommendations`, or
`user_behavior` tables yet; they're created now so the schema is settled
ahead of later phases.

## Running locally

```bash
cd finvault-backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

The API is now running at `http://127.0.0.1:8000`. The CORS config in
`app/config.py` already allows `http://localhost:5173` (your Vite dev
server), so the existing React frontend can call it directly with no extra
setup — just point `services/api.js` at `http://127.0.0.1:8000`.

## Testing with Swagger UI

FastAPI generates interactive docs automatically — no Postman needed:

1. With the server running, open **http://127.0.0.1:8000/docs**
2. You'll see every endpoint grouped by tag (Expenses, CSV Upload, Analytics, Health)
3. Click any endpoint → **Try it out** → fill in the body/params → **Execute**
4. The response, status code, and curl equivalent all appear below

Suggested order to test in:

1. `POST /expense` a few times with different categories/dates — try an
   invalid one too (e.g. `"amount": -5`) and confirm you get a `422` with a
   clear validation message.
2. `GET /expenses` — confirm your records come back, try the `category`,
   `start_date`, `end_date` query params.
3. `PUT /expense/{id}` — update just the `amount` field and confirm the rest
   is unchanged.
4. `DELETE /expense/{id}` — confirm `204`, then try deleting the same id
   again and confirm `404`.
5. `POST /upload-csv` — click **Choose File**, upload
   `sample_data/sample_expenses.csv` (it includes 9 valid rows and 3
   deliberately broken ones — a negative amount, a missing category, and an
   unparseable date), and check that `imported_count`, `failed_count`, and
   `errors` match.
6. `GET /analytics/summary`, `/analytics/trends`, `/analytics/categories` —
   confirm the numbers match what you'd expect from the data you just
   imported.

An alternative raw-JSON view of the same spec is at
`http://127.0.0.1:8000/redoc`.

## Error handling

- Pydantic validation failures (bad types, amount ≤ 0, blank category) →
  `422` with a structured `errors` list, before any database call happens.
- Not-found on `PUT`/`DELETE` → `404` with a clear message.
- CSV upload: file-level problems (not a `.csv`, empty file, missing
  required columns) → `400`. Row-level problems → the row is skipped and
  reported in the response `errors` array; the rest of the file still
  imports.
- Unexpected database errors → caught by a global handler in `main.py` and
  returned as `500` with a consistent JSON shape, instead of a raw
  traceback leaking to the client.

## What's intentionally not here yet

- No `/goal`, `/recommendation`, or `/user-behavior` routes — only their
  tables, per your instructions to keep this phase to expenses + analytics.
- No authentication — this only runs on localhost for now.
- No charts or ML — `analytics_service.py` returns plain numbers; the
  frontend's existing Recharts components are what will render them.
