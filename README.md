# Storefront

A small e-commerce application with an Angular frontend, NestJS API, TypeORM,
and PostgreSQL. Customers can register, sign in, browse products, and place
orders. Admins can manage products. Orders save their items and stock changes
in one database transaction.

## At a glance

| Part     | Technology                     | Local address         |
| -------- | ------------------------------ | --------------------- |
| Frontend | Angular 22, TypeScript         | http://localhost:4200 |
| API      | NestJS 12, TypeScript, TypeORM | http://localhost:3000 |
| Database | PostgreSQL 17 in Docker        | 127.0.0.1:5432        |

The frontend development server proxies API paths to NestJS. The database
stores prices as integer cents; the UI displays and accepts US dollars.

## Quick start

These commands use a macOS/Linux shell. On Windows, use equivalent commands in
PowerShell. Docker Desktop, Node.js, and npm must be installed. The project was
developed with Node 24 and npm 11.

1. Clone the repository:

   ```bash
   git clone https://github.com/rrprodhan/storefront.git
   cd storefront
   ```

2. Start a local PostgreSQL container **once**:

   ```bash
   docker run --name store-postgres -e POSTGRES_PASSWORD=local_dev_password -e POSTGRES_DB=store_db -p 127.0.0.1:5432:5432 -v store_pgdata:/var/lib/postgresql/data -d postgres:17
   ```

   On later days, use `docker start store-postgres`. The named volume
   `store_pgdata` keeps data when the container stops.

3. Create the backend's local environment file:

   ```bash
   cp backend/.env.example backend/.env
   openssl rand -hex 32
   ```

   Paste the generated random value into `JWT_SECRET` in `backend/.env`.
   Set `DB_PASSWORD` to the password used in step 2. Do not commit
   `backend/.env`. A new database volume uses the example password above;
   an existing volume keeps its original PostgreSQL password.

4. Install and start the API in one terminal:

   ```bash
   cd backend
   npm ci
   npm run start:dev
   ```

   NestJS connects to PostgreSQL and, in this local configuration, TypeORM
   creates the tables from the entities. `GET http://localhost:3000/`
   returns `Hello World!` as a basic smoke check.

5. Install and start the frontend in a **second** terminal:

   ```bash
   cd frontend
   npm ci
   npm start
   ```

   Open [http://localhost:4200](http://localhost:4200). Register a customer
   account to use the store.

For a local admin account, register normally, then follow
[Admin setup](docs/LOCAL_DEVELOPMENT.md#creating-a-local-admin). There is no
default admin password or public admin registration route.

## Project map

```text
storefront/
├── backend/
│   ├── src/auth/       # registration, login, JWT and admin guards
│   ├── src/products/   # product CRUD and low-stock monitor
│   ├── src/orders/     # order transaction and order-item entities
│   └── .env.example    # local configuration template
├── frontend/
│   ├── src/app/        # API client, session, bag and screen
│   └── proxy.conf.json # local API proxy
├── docs/               # architecture, database, API and local setup
└── CONTRIBUTING.md
```

## Documentation

- [Local development and troubleshooting](docs/LOCAL_DEVELOPMENT.md)
- [Architecture and request flows](docs/ARCHITECTURE.md)
- [Database ERD and table reference](docs/DATABASE.md)
- [HTTP API reference](docs/API.md)
- [Contribution guide](CONTRIBUTING.md)

## Current scope

The app supports customer registration/login, authenticated product browsing,
admin-only product CRUD, customer checkout, a customer-order index, and a
once-per-minute low-stock log. It does **not** have payments, shipping, an
order-history endpoint, password reset, database migrations, or production
deployment configuration. The Angular bag is kept in memory; the order
confirmation is shown after checkout, while the completed order remains in
PostgreSQL.

The API currently uses `synchronize: true` to simplify local development.
**Do not use that setting against production data.** Add reviewed database
migrations before a production deployment.
