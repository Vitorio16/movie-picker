# Movie Picker

Docker Compose app with Postgres. On first launch you create a user; settings are stored in the database (not browser cache).

## Portainer

1. Add a new **Stack** from this repo (Git) or paste `docker-compose.yml`.
2. Set these environment variables:

| Variable | Required | Notes |
|----------|----------|--------|
| `POSTGRES_PASSWORD` | yes | Database password |
| `JWT_SECRET` | yes | Long random string for login tokens |
| `POSTGRES_USER` | no | Default `movie` |
| `POSTGRES_DB` | no | Default `movie_picker` |
| `APP_PORT` | no | Host port, default `8080` |

3. Deploy the stack.
4. Open `http://YOUR_SERVER:8080` → create the first user → sign in.

Settings persist in the `pgdata` volume across restarts.

## Local Docker

```bash
cp .env.example .env
# edit POSTGRES_PASSWORD and JWT_SECRET
docker compose up --build -d
```

Then open http://localhost:8080

## Local frontend development

Run Postgres + API (Docker or local Node), then:

```bash
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:3000`. For the API, set `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `JWT_SECRET`, and `PORT=3000` (see `server/`).
