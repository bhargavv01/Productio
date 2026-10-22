# Productio — Personal Day Tracker

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, self-hosted personal day-tracking application. Log how your time is actually spent, plan your day in blocks ahead of time, set habit targets, and view reports modeled after Android and Apple Screen Time (time categorized by productivity labels).

---

## Features

- **Day View (Command Center)**:
  - **Screen Time Ring Chart**: Visual donut chart breaking down your day with a central "Accounted Time / 24h" indicator.
  - **Productivity Score**: Real-time ratio of productive vs. neutral vs. unproductive time.
  - **Planned Blocks**: Schedule your day in advance. Includes a **"Log This"** shortcut button that pre-fills actual logs directly from planned blocks.
  - **Activity Log Entries**: Chronological activity timeline with duration pills, notes preview, and inline edit mode.
  - **Quick Date Switcher**: Jump between *Yesterday*, *Today*, *Tomorrow*, or any custom date.

- **Week View**:
  - **7-Day Stacked Activity Chart**: Compare category distributions across the week with interactive tooltips.
  - **Summary Metrics**: Total weekly hours, daily average volume, productive share, and peak activity day.
  - **Daily Highlight Cards**: Quick-glance cards showing category distribution mini-bars for each day of the week.

- **Month View**:
  - **Daily Activity Heatmap/Bar Chart**: Daily totals color-coded by the dominant category of each day.
  - **Monthly Metrics**: Total hours logged, active days consistency percentage, and overall dominant category.

- **Goals Management**:
  - Set daily or weekly time targets per category (for example, *4 hours of Work per day*, *5 hours of Study per week*).
  - Quick duration presets (`30m`, `1h`, `2h`, `3h`, `4h`) for rapid goal configuration.

- **Pre-Seeded Default Categories**:
  - Idempotent seed on startup with sensible colors and productivity labels:
    - **Work** (`#3B82F6` — Productive)
    - **Study** (`#8B5CF6` — Productive)
    - **Health** (`#10B981` — Productive)
    - **Social** (`#F59E0B` — Neutral)
    - **Entertainment** (`#EF4444` — Unproductive)
    - **Chores** (`#6B7280` — Neutral)

---

## Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (sync execution, ASGI with Uvicorn)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (driver: `psycopg2-binary`)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Configuration & Validation**: [Pydantic v2](https://docs.pydantic.dev/) and [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## Project Structure

```text
Productio/
├── .env.example              # Full-stack environment configuration reference
├── .gitignore                # Production ignore rules (secrets, venv, build artifacts)
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── .env                  # Local backend secrets (git ignored)
│   ├── alembic.ini           # Alembic database migration config
│   ├── alembic/
│   │   ├── env.py            # Dynamic DB URL injection from app settings
│   │   └── versions/         # Migration revisions
│   ├── requirements.txt      # Python dependencies
│   └── app/
│       ├── main.py           # FastAPI entry point, CORS, lifespan seeder
│       ├── config.py         # Pydantic Settings configuration module
│       ├── database.py       # Engine & SessionLocal setup
│       ├── models.py         # SQLAlchemy models (Category, LogEntry, PlannedBlock, Goal)
│       ├── schemas.py        # Pydantic request/response & report schemas
│       ├── seed.py           # Idempotent category seeder
│       ├── crud/             # Database access layer
│       │   ├── categories.py
│       │   ├── log_entries.py
│       │   ├── planned_blocks.py
│       │   └── goals.py
│       └── routers/          # API route controllers
│           ├── categories.py
│           ├── log_entries.py
│           ├── planned_blocks.py
│           ├── goals.py
│           └── reports.py
│
├── frontend/
│   ├── .env.example          # Frontend environment template
│   ├── .env                  # Local frontend secrets (git ignored)
│   ├── index.html            # Main HTML template (Inter font)
│   ├── vite.config.js        # Vite config with Tailwind v4 & /api proxy
│   ├── package.json          # Node dependencies & scripts
│   └── src/
│       ├── main.jsx          # React DOM entry point & Router
│       ├── App.jsx           # Application routing layout
│       ├── index.css         # Tailwind v4 import & custom styling
│       ├── api/
│       │   └── client.js     # Axios client with normalized endpoints
│       └── components/
│           ├── Layout.jsx        # Responsive sidebar shell & navigation
│           ├── DayView.jsx       # Day command center (Donut, Plans, Logs)
│           ├── WeekView.jsx      # 7-day stacked bar analytics
│           ├── MonthView.jsx     # Monthly heatmap-style trends
│           ├── GoalsPage.jsx     # Habit target manager
│           ├── CategoryBadge.jsx # Reusable category badge with color dot
│           └── StatCard.jsx      # Reusable dashboard metric card
│
└── README.md
```

---

## Getting Started

### Prerequisites
- **Python** 3.10 or higher
- **Node.js** 18 or higher (with npm)
- **PostgreSQL** running locally (or via Docker)

---

### 1. Clone & Environment Setup

Clone the repository and inspect the configuration templates:

```bash
git clone https://github.com/your-username/productio.git
cd productio
```

---

### 2. Database Setup

Ensure PostgreSQL is running and create the `productio` database:

```sql
CREATE DATABASE productio;
```

---

### 3. Backend Setup

1. Create and activate a Python virtual environment:

   ```powershell
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install backend dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Configure the backend environment:

   ```bash
   # Copy the example configuration
   cp backend/.env.example backend/.env
   ```

   *Verify `backend/.env` has your PostgreSQL connection string:*
   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/productio
   ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   APP_NAME=Productio — Personal Day Tracker
   APP_VERSION=0.1.0
   DEBUG=False
   ```

4. Run database migrations:

   ```bash
   cd backend
   alembic upgrade head
   cd ..
   ```

5. Start the FastAPI backend server:

   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

   The backend will start at **`http://localhost:8000`** and auto-seed the 6 default categories.
   - Interactive Swagger API docs: **`http://localhost:8000/docs`**
   - ReDoc alternative: **`http://localhost:8000/redoc`**

---

### 4. Frontend Setup

1. In a new terminal, navigate to the `frontend` folder:

   ```bash
   cd frontend
   ```

2. Install npm dependencies:

   ```bash
   npm install
   ```

3. Configure the frontend environment:

   ```bash
   cp .env.example .env
   ```

   *Default `frontend/.env`:*
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   VITE_API_BASE_URL=/api
   ```

4. Start the Vite development server:

   ```bash
   npm run dev
   ```

5. Open your browser at **`http://localhost:5173`**.

---

## API Reference

All routes are prefixed under the backend server and proxied via Vite at `/api/*`.

### Categories (`/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories/` | List all categories |
| `POST` | `/categories/` | Create a new category |
| `GET` | `/categories/{id}` | Get category by ID |
| `PUT` | `/categories/{id}` | Update category |
| `DELETE` | `/categories/{id}` | Delete category and its planned blocks/goals. Refused (`409`) while it still has log entries |

### Activity Logs (`/log-entries`)
| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/log-entries/` | `date`, `start_date`, `end_date`, `skip`, `limit` | List activity log entries |
| `POST` | `/log-entries/` | — | Record a new activity entry (`409` if it overlaps another entry) |
| `GET` | `/log-entries/{id}` | — | Get entry details |
| `PUT` | `/log-entries/{id}` | — | Update an activity entry |
| `DELETE` | `/log-entries/{id}` | — | Delete an activity entry |

### Planned Blocks (`/planned-blocks`)
| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/planned-blocks/` | `date`, `skip`, `limit` | List planned blocks |
| `POST` | `/planned-blocks/` | — | Schedule a new planned block |
| `GET` | `/planned-blocks/{id}` | — | Get planned block details |
| `PUT` | `/planned-blocks/{id}` | — | Update a planned block |
| `DELETE` | `/planned-blocks/{id}` | — | Delete a planned block |

### Goals (`/goals`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/goals/` | List all daily/weekly time targets |
| `POST` | `/goals/` | Create a new time goal |
| `GET` | `/goals/{id}` | Get goal details |
| `PUT` | `/goals/{id}` | Update target minutes or period |
| `DELETE` | `/goals/{id}` | Delete a goal |

### Reports (`/reports`)
| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/reports/day` | `date` (`YYYY-MM-DD`) | Total minutes per category for the day + total accounted vs 1440 min (entries crossing midnight are split between days) |
| `GET` | `/reports/week` | `start` (`YYYY-MM-DD`) | 7-day daily category breakdowns from start date |
| `GET` | `/reports/month` | `year` (`YYYY`), `month` (`1-12`) | Day-by-day category summaries for the entire month |

---

### Data rules
- **Times are local wall-clock time.** Log entries are sent and stored as naive local datetimes (`2026-10-22T10:00:00`), so they don't shift if the Postgres server's timezone changes. Offset-aware values sent to the API are converted to the backend machine's local time.
- **No overlapping log entries.** Each minute of the day can only be logged once, so totals never exceed 24h.
- **Validation errors are returned as `422`/`409` with a readable `detail`**, which the UI shows next to the form.

---

## Running Tests

The backend tests create (and afterwards drop) a separate `productio_test` database on the same Postgres server as `DATABASE_URL`:

```bash
pip install -r backend/requirements-dev.txt
cd backend
pytest
```

---

## Security & Environment Configuration

- **No Hardcoded Credentials**: Database URLs and secrets are read strictly from `.env` files via `pydantic-settings` (backend) and `import.meta.env` (frontend).
- **Alembic Dynamic Configuration**: `alembic.ini` does not contain sensitive database connection strings; URLs are injected dynamically from `app.config.settings.DATABASE_URL` during runtime.
- **CORS Protection**: CORS allowed origins are configurable via `ALLOWED_ORIGINS` in `.env`.
- **Git Security**: Comprehensive `.gitignore` ignores virtual environments, `.env` files, build caches, and node_modules by default.

---

## Useful Commands

```bash
# Apply pending database migrations
alembic upgrade head

# Create a new migration after altering models
alembic revision --autogenerate -m "describe_changes"

# Rollback latest migration
alembic downgrade -1

# Build frontend for production
cd frontend && npm run build
```

---

## License

This project is open-source and available under the [MIT License](LICENSE).
