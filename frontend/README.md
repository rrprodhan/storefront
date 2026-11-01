# Storefront web

Angular frontend for the NestJS and PostgreSQL store in this repository.
Start with the [project README](../README.md) for full setup, the
[architecture guide](../docs/ARCHITECTURE.md) for the request flows, and
the [API reference](../docs/API.md) for backend contracts.

## Run locally

1. Start Docker Desktop and the existing PostgreSQL container if it is stopped:
   `docker start store-postgres`
2. In `backend/`, run `npm run start:dev`. The API listens on port 3000.
3. In `frontend/`, run `npm start`. Open `http://localhost:4200/`.

The Angular development server proxies `/auth`, `/products`, and `/orders` to
`http://localhost:3000` using `proxy.conf.json`. No browser CORS change is
needed for this local setup. Restart `npm start` after changing the proxy.

Run `npm run build` in `frontend/` for a production bundle. Deployment needs
equivalent reverse-proxy routes (or an API base URL and backend CORS setup).

## What the interface does

- Register or sign in with the backend's `/auth` routes.
- Browse authenticated products from `GET /products`.
- Put products in a local bag and place an order with `POST /orders`.
- Show the returned receipt and refresh stock after checkout.
- For an admin account, create, update, and delete products through the
  protected product routes.

Registration always creates a customer account. The backend decides whether a
user is an admin and enforces permissions; hiding admin controls in Angular is
only a user-interface choice. The login token is kept in this tab's
`sessionStorage` and removed at sign-out or when the API returns 401.

Prices are shown in US dollars. The backend still stores and receives integer
`priceCents` values: the frontend divides by 100 for display and converts the
admin's dollar input back to cents before saving. The checkout request sends
product IDs and quantities; the backend checks current stock and saves the
purchase prices inside its transaction.

The Angular app is one responsive screen with shop, bag, and admin views:

- `src/app/store-api.ts`: API types and HTTP calls.
- `src/app/app.ts`: session, bag, checkout, and admin state.
- `src/app/app.html`: accessible forms and views.
- `src/styles.css`: responsive visual design.
- `proxy.conf.json`: local API proxy.
