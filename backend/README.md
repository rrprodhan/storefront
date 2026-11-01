# Storefront API

NestJS/TypeORM API for the [Storefront project](../README.md). Read the
[local setup guide](../docs/LOCAL_DEVELOPMENT.md) before starting it.

## Local run

Start PostgreSQL as described in the root README, then from this directory:

```bash
cp .env.example .env
# Edit .env with your PostgreSQL password and a new JWT_SECRET.
npm ci
npm run start:dev
```

The API listens on port 3000 by default. `GET /` returns
`Hello World!` as a starter smoke route. Product and order routes need
a bearer token; product writes additionally need an admin token.

## Modules

| Module     | Responsibility                                                       |
| ---------- | -------------------------------------------------------------------- |
| `auth`     | Customer registration, login, user table, JWT and admin guards.      |
| `products` | Product table, authenticated browsing, admin CRUD and stock monitor. |
| `orders`   | Order tables and transactional checkout.                             |

See [architecture](../docs/ARCHITECTURE.md),
[database ERD](../docs/DATABASE.md), and
[API reference](../docs/API.md) for exact behavior.

## Commands

| Command             | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `npm run start:dev` | Run with file watching.                                 |
| `npm run build`     | Compile the backend.                                    |
| `npm run lint`      | Run the configured Oxlint checks.                       |
| `npm test`          | Run unit tests.                                         |
| `npm run test:e2e`  | Run e2e tests; requires local PostgreSQL configuration. |

The checked-in tests currently cover only the generated `Hello World!`
route. The local TypeORM configuration uses `synchronize: true`; it is
not suitable for a production database without migrations.
