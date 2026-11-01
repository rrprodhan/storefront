# Local development

Follow this guide from a fresh clone. It describes the local Docker setup
used by this repository; DBeaver and Postman are optional tools for
inspection, not runtime dependencies.

## Prerequisites

- Git
- Docker Desktop or another running Docker Engine
- Node.js and npm (developed with Node 24 and npm 11)
- Two terminal windows: one for the API and one for Angular

Check installations with `git --version`, `docker version`,
`node --version`, and `npm --version`. Keep Docker running while using
the application.

## First run

From the repository root, create the local database container:

```bash
docker run --name store-postgres -e POSTGRES_PASSWORD=local_dev_password -e POSTGRES_DB=store_db -p 127.0.0.1:5432:5432 -v store_pgdata:/var/lib/postgresql/data -d postgres:17
docker exec store-postgres pg_isready -U postgres -d store_db
```

`-e` sets PostgreSQL's initial database/password, `-p` exposes port
5432 only on your computer, `-v` persists data in a Docker volume, and
`-d` runs the container in the background. The database can take a few
seconds to start, so retry the readiness check if it does not yet say
`accepting connections`. For subsequent sessions, use
`docker start store-postgres` rather than running a second container.

Configure the backend:

```bash
cp backend/.env.example backend/.env
openssl rand -hex 32
```

Edit `backend/.env`: use your chosen PostgreSQL password for
`DB_PASSWORD` and paste the random output for `JWT_SECRET`. Keep this
file local. The required keys are:

| Key           | Local value / purpose                                                |
| ------------- | -------------------------------------------------------------------- |
| `DB_HOST`     | `127.0.0.1`                                                          |
| `DB_PORT`     | `5432`                                                               |
| `DB_USERNAME` | `postgres`                                                           |
| `DB_PASSWORD` | Password used to initialize your PostgreSQL volume.                  |
| `DB_NAME`     | `store_db`                                                           |
| `JWT_SECRET`  | Your own random signing secret.                                      |
| `PORT`        | Optional API port; default is 3000. The frontend proxy expects 3000. |

Start the backend from one terminal:

```bash
cd backend
npm ci
npm run start:dev
```

Start the frontend from another terminal, at the repository root:

```bash
cd frontend
npm ci
npm start
```

Open `http://localhost:4200`. The frontend proxy forwards API calls to
`http://localhost:3000`. The API's public `GET /` returns
`Hello World!` as a simple startup check. In DBeaver, the four tables
should appear under `store_db → Schemas → public → Tables` after Nest
connects for the first time.

## Creating a local admin

The first registered accounts are customers, so a fresh database cannot
create products through the UI until one local account is promoted.

1. Register a new account in the Angular app (for example,
   `admin@example.com`) using your own password.
2. Connect DBeaver to `store_db`, or use another PostgreSQL client.
3. Run this SQL, replacing the email with the one you registered:

   ```sql
   UPDATE public.users
   SET role = 'admin'
   WHERE email = 'admin@example.com'
   RETURNING id, email, role;
   ```

4. Confirm exactly one row was returned with role `admin`.
5. Sign out and log in again. The **new** JWT carries the admin role.

The `WHERE` clause limits the update to one account. Do this only in a
development database you control. There is intentionally no public
admin-registration API.

## First useful walkthrough

After admin login, open **Manage** and create a product with a dollar price
and stock. Sign in as a customer to browse it, add it to the bag, and place
an order. The UI displays a receipt, and PostgreSQL stores one `orders`
row plus its `order_items` rows. `GET /products` will show reduced stock.
See [API smoke flow](API.md#manual-api-smoke-flow) for the rollback check.

If a product reaches stock 4 or less, the running backend logs a low-stock
warning within one minute.

## Common problems

| Symptom                                                 | Check                                                                                                                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker: command not found`                             | Docker Desktop must be installed/running and its CLI available on your PATH.                                                                                                                 |
| Port 5432 is already in use                             | Another PostgreSQL service/container is listening. Stop the conflicting service or use a different host port and update `DB_PORT`.                                                           |
| Container name already exists                           | Run `docker start store-postgres`; do not create a second container with the same name.                                                                                                      |
| Nest cannot connect to PostgreSQL                       | Check `docker ps`, `docker logs store-postgres`, `pg_isready`, and the values in `backend/.env`.                                                                                             |
| Password still fails after changing `POSTGRES_PASSWORD` | Docker's PostgreSQL image uses that variable only when initializing an **empty** volume. Use the original volume password or change it inside PostgreSQL; do not delete the volume casually. |
| Angular says it cannot reach the backend                | Start Nest on port 3000. The proxy is configured for that port in `frontend/proxy.conf.json`. Restart `npm start` after editing proxy settings.                                              |
| 401 from a protected endpoint                           | Log in again and use the new bearer token. Tokens expire after one hour.                                                                                                                     |
| 403 on product create/update/delete                     | Log in with a newly promoted admin account; customer tokens cannot write products.                                                                                                           |
| Product cannot be deleted after it was ordered          | The order-item foreign key preserves purchase history. Set stock to zero instead.                                                                                                            |
| No products on a new install                            | There is no seed data. Create a local admin, then add products in **Manage**.                                                                                                                |

Stopping a terminal process with Ctrl+C stops that server. Stopping the
PostgreSQL container does not remove its volume or data.

## Build and checks

```bash
cd backend
npm run build
npm run lint
npm test
```

```bash
cd frontend
npm run build
```

The checked-in backend unit and e2e tests are still the Nest starter
`Hello World!` tests; they do not cover the store flows yet. The e2e
configuration imports `AppModule`, so it needs the local PostgreSQL
environment. Add meaningful tests when changing business behavior.
