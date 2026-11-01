# Contributing

Thanks for helping improve Storefront. Begin with the [root README](README.md)
and [local setup guide](docs/LOCAL_DEVELOPMENT.md), then read the
[architecture](docs/ARCHITECTURE.md), [ERD](docs/DATABASE.md), and
[API reference](docs/API.md) for the area you will change.

## Recommended workflow

1. Pull the latest `main` and create a focused branch:

   ```bash
   git switch main
   git pull
   git switch -c feat/short-description
   ```

2. Make one related change at a time. Keep controllers thin, put business
   logic in services, and update the relevant documentation alongside code.
3. Run checks appropriate to the change (see below), inspect `git diff`,
   and verify that no secrets or build output are staged.
4. Commit with a descriptive message, for example
   `feat: add order history` or `fix: reject duplicate order lines`.
5. Push the branch with `git push -u origin feat/short-description`. If
   you do not have write access, fork the repository on GitHub and push to
   your fork instead.
6. Open a pull request describing what changed, why it changed, how you
   verified it, and any database or compatibility impact.

## Code conventions

- The backend uses TypeScript with ESM/NodeNext. Local TypeScript imports in
  backend source use a `.js` extension. In decorated Nest method
  signatures, import types with `import type` when required by the compiler.
- Nest feature modules live under `backend/src/auth`,
  `backend/src/products`, or `backend/src/orders`. A controller handles
  HTTP; a service performs business operations; a DTO validates client input;
  an entity describes the database table.
- The global validation pipe rejects unknown request fields. Add DTO rules
  for new client input and database constraints for rules that must also
  hold outside the API.
- Authorization belongs on the backend. Frontend role checks improve the
  interface but never replace guards on a route.
- Keep money as **integer cents** in the database and API. The current UI
  uses US dollars and converts at the boundary; do not calculate persisted
  money with floating-point dollars.
- Checkout changes must use the transaction's supplied manager for all
  reads and writes. Keep stock checks under a row lock and consider
  concurrency when changing order logic.
- Avoid adding a public route that can grant `admin` access.
- Angular backend types and requests belong in `frontend/src/app/core/api/`.
  Protected request headers are attached by `core/auth/auth.interceptor.ts`.
  Put page-specific behavior and markup in `features/`, shared state in feature
  stores, and reusable layout or formatting in `shared/`. Register pages in
  `app.routes.ts`; keep the root `app.ts` as a layout shell.

## Database changes

The current local setup uses TypeORM `synchronize: true`; it has **no
migration history**. Do not point it at shared or production data. If you
add or change a table, update [DATABASE.md](docs/DATABASE.md) and its ERD.
Before any production use, add versioned migrations and disable automatic
synchronization.

Foreign keys preserve purchase history. In particular, deleting a product
that appears in `order_items` is not a normal cleanup operation. Prefer
setting its stock to zero until a deliberate archival design exists.

## Checks before a pull request

From `backend/`:

```bash
npm ci
npm run build
npm run lint
npm test
```

From `frontend/`:

```bash
npm ci
npm run build
```

For behavior changes, manually exercise the relevant flow in the browser
or Postman and add focused automated tests when they test a meaningful
rule. The existing backend tests only check the scaffolded root route;
they are not coverage for registration, authorization, or checkout.
Backend e2e runs need a working local PostgreSQL connection.

Update the [API reference](docs/API.md) for request, response, status or
permission changes; update [ARCHITECTURE.md](docs/ARCHITECTURE.md) when a
flow or module boundary changes; and update setup docs for any new
configuration or service.

## Secrets and local data

`backend/.env`, dependency directories, build output and Angular cache
are ignored by Git. Use `backend/.env.example` only as a template.
Never commit passwords, JWT secrets, bearer tokens or real customer data.
Before a commit, `git status --short` and `git diff --cached` show what
will be published.

The local database volume is not part of Git. Give new developers schema
changes through reviewed migrations rather than relying on your personal
Docker volume.
