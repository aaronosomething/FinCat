# FinCat <img width="50" height="50" alt="FinCat_darkmode" src="https://github.com/user-attachments/assets/5d929dea-2702-43a2-985a-0eaad2f7af5a" />


> FinCat is a full-stack financial planning app (Django + React) with interactive charts, budgeting, investment projections, retirement readiness calculations, and goal tracking.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Python](https://img.shields.io/badge/python-3.10%2B-green.svg)]()
[![React](https://img.shields.io/badge/react-%5E18.0.0-blue.svg)]()

---

## Demo & Wireframe

- Video overview: https://www.youtube.com/watch?v=Hmw1CiPKZr4  
- UI Dashboard View: <img width="1687" height="947" alt="image" src="https://github.com/user-attachments/assets/bb9f77b4-dd7d-44a5-a798-5d81e789a51b" />
- Wireframe from the initial planning process: <img width="1458" height="809" alt="image" src="https://github.com/user-attachments/assets/d9f9fcd2-64e0-4fc3-9931-cd6b013b0b8e" />



---

## Features

- User accounts & secure authentication (Django backend)
- Create and manage budgets (income, expenses, deductions)
- Interactive investment-growth projections (future value visualizations)
- Retirement readiness calculator (target savings & projected shortfall)
- Track short-term and long-term financial goals
- Responsive UI styled with Material-UI
- All graphs and charts are interactive (hover details, zoom, filtering)

---

## Tech stack

- Backend: Django (Python)
- Frontend: React.js (Material-UI)
- Database: PostgreSQL
- Charts: interactive charting libraries (frontend)
- Dev tooling: `requirements.txt` for Python deps, `npm`/`package.json` for frontend

---

## Repository layout

```
/ (repo root)
├─ backend/                  # Django project + apps
├─ frontend/PersonalProject/ # React app (Material UI)
├─ requirements.txt
└─ README.md
```

> Adjust paths above if you rename the frontend folder to a simpler `frontend/` (recommended).

---

## Quickstart — local development

### Prerequisites
- Python 3.10+
- PostgreSQL
- Node.js + npm
- (optional) virtualenv / venv / pyenv

### 1) Clone
```bash
git clone https://github.com/aaronosomething/FinCat.git
cd FinCat
```

### 2) Backend (Django)
```bash
cd backend
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install -r ../requirements.txt
```

Create a Postgres DB and user, then set environment variables (example `.env` / export):
```
DJANGO_SECRET_KEY=your-secret-key
DATABASE_URL=postgres://fincat_user:password@localhost:5432/fincat_db
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```
Run migrations and create a superuser:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### 3) Frontend (React)
```bash
# from repo root
cd frontend/PersonalProject
npm install
npm start
# opens on http://localhost:3000 by default
```

If your frontend expects API calls at a specific base URL, update the API base (or set `"proxy"` in the frontend `package.json` to `http://localhost:8000` during development).

---

## API keys — requesting and configuring 3rd-party data providers

This project can optionally fetch market and macroeconomic data from two public providers that require free API keys:

- **FRED (Federal Reserve Economic Data API)** — docs & signup: https://fred.stlouisfed.org/docs/api/fred/  
- **Financial Modeling Prep (FMP)** — docs & signup: https://site.financialmodelingprep.com/developer/docs

Both services offer **free API keys** suitable for development and light usage. Below are quick steps to get your keys and how to configure them for local development.

### How to request API keys

**FRED (St. Louis Fed)**
1. Open: https://fred.stlouisfed.org/docs/api/fred/  
2. Follow the instructions to create an account (if required) and request an API key. The process is free and typically issues a key immediately or via email.

**Financial Modeling Prep (FMP)**
1. Open: https://site.financialmodelingprep.com/developer/docs  
2. Create an account and obtain your free API key from the dashboard.

> Save both keys securely — do not commit them into source control. Use environment variables or a `.env` file (which you add to `.gitignore`).

### Recommended environment variables

Add the following to your backend `.env` (or export them in your shell):

```
FRED_API_KEY=your_fred_api_key_here
FMP_API_KEY=your_fmp_api_key_here
```

For the React frontend, set the variables used at build-time (create `.env.local` in the frontend folder):

```
REACT_APP_FRED_API_KEY=your_fred_api_key_here
REACT_APP_FMP_API_KEY=your_fmp_api_key_here
```

### Example usage (backend)
In Django, you can read the keys with `os.environ` or `django-environ` / `dj-database-url`. Example snippet in `settings.py`:

```python
import os
FRED_API_KEY = os.environ.get("FRED_API_KEY")
FMP_API_KEY = os.environ.get("FMP_API_KEY")
```

Example helper using `requests` to call FRED (JSON response):

```python
import requests, os

FRED_API_KEY = os.environ.get("FRED_API_KEY")

def fred_series_observations(series_id, start_date=None, end_date=None):
    base = "https://api.stlouisfed.org/fred/series/observations"
    params = {
        "series_id": series_id,
        "api_key": FRED_API_KEY,
        "file_type": "json",
    }
    if start_date: params["observation_start"] = start_date
    if end_date: params["observation_end"] = end_date
    resp = requests.get(base, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()
```

Example helper to call Financial Modeling Prep (quote endpoint):

```python
import requests, os

FMP_API_KEY = os.environ.get("FMP_API_KEY")

def fmp_quote(symbol):
    # example endpoint (subject to vendor docs)
    url = f"https://financialmodelingprep.com/api/v3/quote/{symbol}"
    params = {"apikey": FMP_API_KEY}
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()
```

### Example usage (frontend)
If your frontend fetches data directly from these services (not recommended for secret keys), reference the env vars created above. Example in React:

```js
const FRED_KEY = process.env.REACT_APP_FRED_API_KEY;
const FMP_KEY = process.env.REACT_APP_FMP_API_KEY;

// Example fetch (CORS / vendor policy may apply):
fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${FRED_KEY}&file_type=json`)
  .then(r => r.json())
  .then(data => console.log(data));
```

> Note: It's usually better to proxy third-party calls through your backend so you can keep API keys secret and cache responses.

---

## Environment & deployment notes

- Use `dj-database-url` or a similar approach to read `DATABASE_URL` in Django settings for parity with production.
- Keep `DJANGO_SECRET_KEY` and 3rd-party API keys private.
- Consider adding `django-cors-headers` to allow the React frontend to call the API in dev.
- For production, use an application server (Gunicorn / Uvicorn) + Nginx and a managed PostgreSQL instance.

---

## Contribution guide

Thanks for your interest! Please:

1. Fork the repo.
2. Create a branch: `git checkout -b feature/short-description`
3. Implement your feature and add tests where appropriate.
4. Open a pull request — I will review before merging.

Small PRs with tests and a clear description are preferred. If your change is large, open an Issue first to discuss scope.

---

## Suggested next improvements (optional)

- Add a `LICENSE` (MIT recommended).
- Add an `.env.example` file to show required environment vars.
- Add `CONTRIBUTING.md` with code style and testing instructions.
- Add a `docker-compose.yml` to make local dev single-command (Postgres + backend + frontend).
- Rename `frontend/PersonalProject` → `frontend` to simplify paths.

---

## Troubleshooting

- **DB connection errors** — check `DATABASE_URL` and Postgres credentials.
- **CORS** — ensure `django-cors-headers` allows `http://localhost:3000` while developing.
- **Port conflicts** — ensure ports 8000 (Django) and 3000 (React) are free or change them.

---

## Author

Aaron O. — creator & maintainer  
(Repository: https://github.com/aaronosomething/FinCat)

---
