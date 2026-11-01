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

## Frontend structure

The app uses standalone components and lazy routes. Start with `src/app/app.routes.ts` to
see which page renders at each URL. The root `app.ts` and `app.html` only assemble the
header, feedback banner, current page, and footer.

| Folder | Responsibility |
| --- | --- |
| `src/app/core/api/` | Backend request and response types, HTTP methods, and error handling. |
| `src/app/core/auth/` | Browser session, route guards, and the HTTP interceptor that attaches bearer tokens. |
| `src/app/features/auth/` | Register and sign-in page. |
| `src/app/features/products/` | Shop page and shared product state. |
| `src/app/features/cart/` | Bag page and in-memory bag state. |
| `src/app/features/orders/` | Last order receipt state. |
| `src/app/features/admin/` | Admin product editor and inventory. |
| `src/app/shared/` | Header, feedback banner, and dollar formatting. |
| `src/styles/` | Design rules split by shared layout, page, and responsive behavior. |
| `src/styles.css` | Imports the style sections in cascade order. |
| `proxy.conf.json` | Local API proxy. |

Pages call `StoreApi`; they do not assemble URLs or authentication headers. The
functional interceptor is registered once in `app.config.ts`. `StoreApi` marks
protected calls with an HTTP context token; the interceptor attaches the
current bearer token to marked requests. Mark new protected API calls the same
way. The backend remains responsible for checking the token and role.

The product and bag stores share state across routes. The bag is intentionally
kept in memory, so reloading the tab clears it. Session data lives in
`sessionStorage`, so closing the tab clears the login. Route guards navigate
visitors to sign-in and non-admin users away from the admin page.
