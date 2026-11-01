# HTTP API

Local base URL: `http://localhost:3000`. The Angular development server
forwards the same paths from `http://localhost:4200`.
Requests and responses use JSON unless noted. Protected routes require:

```http
Authorization: Bearer <accessToken>
```

The token comes from `POST /auth/login` and expires after one hour. Never
commit or share a real token. `priceCents` and `unitPriceCents` are integer
USD cents in the API; the Angular UI converts them to dollars for display.

## Routes and permissions

| Method   | Path             | Access             | Success | Purpose                                 |
| -------- | ---------------- | ------------------ | ------- | --------------------------------------- |
| `GET`    | `/`              | Public             | 200     | Starter smoke response: `Hello World!`. |
| `POST`   | `/auth/register` | Public             | 201     | Create a customer.                      |
| `POST`   | `/auth/login`    | Public             | 200     | Get a JWT and public user.              |
| `GET`    | `/products`      | Any signed-in user | 200     | List products, ID ascending.            |
| `GET`    | `/products/:id`  | Any signed-in user | 200     | Get one product.                        |
| `POST`   | `/products`      | Admin              | 201     | Create a product.                       |
| `PUT`    | `/products/:id`  | Admin              | 200     | Replace all editable product fields.    |
| `DELETE` | `/products/:id`  | Admin              | 204     | Delete a product; no response body.     |
| `POST`   | `/orders`        | Any signed-in user | 201     | Place an order.                         |

There is currently no order-history or order-read endpoint. An admin can
also call `POST /orders`; that route checks authentication, not role.

## Authentication

### Register

```http
POST /auth/register
Content-Type: application/json

{"email":"customer@example.com","password":"example-password"}
```

Response:

```json
{ "id": 1, "email": "customer@example.com", "role": "customer" }
```

Email must be valid and at most 255 characters. Password must be 8–72
characters and no more than 72 UTF-8 bytes (bcrypt's input limit). Emails
are lowercased before storage. Duplicate email returns 409. Registration
never accepts an admin role from the request body.

### Log in

```http
POST /auth/login
Content-Type: application/json

{"email":"customer@example.com","password":"example-password"}
```

Response shape:

```json
{
  "accessToken": "<JWT>",
  "user": { "id": 1, "email": "customer@example.com", "role": "customer" }
}
```

Wrong credentials return 401 with a generic message. The stored hash is
never included. A changed database role only appears in a **new** token
after another login.

## Products

The product shape is:

```json
{ "id": 1, "name": "Blue Book", "priceCents": 1500, "stock": 8 }
```

In the UI, `1500` cents is displayed as `$15.00`. Product creation and
update require this body:

```json
{ "name": "Blue Book", "priceCents": 1500, "stock": 8 }
```

`name` must be a nonempty string of at most 120 characters. Both numeric
fields must be whole numbers at least zero. `PUT` uses the same full body;
it is not a partial patch. An unknown ID returns 404. A non-integer path
ID is rejected by `ParseIntPipe` with 400.

The database also has nonnegative checks on price and stock. A product
already referenced by an order item normally cannot be deleted because of
the foreign key; the current API does not map that database error to a
special 409 response. Set its stock to zero to stop new purchases.

## Checkout

```http
POST /orders
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "items": [
    {"productId":1,"quantity":2},
    {"productId":3,"quantity":1}
  ]
}
```

Response shape:

```json
{
  "id": 1,
  "customerId": 1,
  "createdAt": "2026-10-31T14:58:46.238Z",
  "items": [
    { "productId": 1, "quantity": 2, "unitPriceCents": 1500 },
    { "productId": 3, "quantity": 1, "unitPriceCents": 1800 }
  ]
}
```

The items array must contain at least one entry. Each product ID and
quantity must be a positive integer. The API obtains `customerId` from
the bearer token; it does not accept a customer ID or price from the body.
The backend locks products, checks stock, saves the order and items, and
decrements stock in one transaction. If any product is missing, it returns
404; if stock is insufficient, it returns 400 and rolls everything back.

Repeated product IDs are currently allowed as separate lines. Avoid sending
duplicates unless that behavior is intended.

## Errors and validation

The global `ValidationPipe` transforms request bodies, keeps only DTO
fields, and rejects unknown fields. Typical error shape:

```json
{
  "message": ["priceCents must not be less than 0"],
  "error": "Bad Request",
  "statusCode": 400
}
```

| Status | Common cause                                                       |
| ------ | ------------------------------------------------------------------ |
| 400    | Invalid body, path ID or insufficient stock.                       |
| 401    | Missing, invalid or expired bearer token; wrong login credentials. |
| 403    | A signed-in customer tried an admin-only product write.            |
| 404    | Requested product does not exist.                                  |
| 409    | Email is already registered.                                       |
| 500    | Unexpected server/database error; check the Nest log.              |

## Manual API smoke flow

Use Postman or another HTTP client:

1. Register and log in as a customer. Save the token only locally.
2. Verify `GET /products` without a token returns 401.
3. Verify `GET /products` with the customer token returns 200.
4. Verify the customer token cannot `POST /products` (403).
5. After creating a local admin as described in
   [Local development](LOCAL_DEVELOPMENT.md#creating-a-local-admin), use its
   fresh token to create a product (201).
6. Place an order as the customer (201), then check reduced stock.
7. Request more than the remaining stock (400), then check that stock did
   not change. This demonstrates rollback.

These requests create and alter **local** database data. Use a disposable
development database for the smoke flow.
