# Express Neon Practice API

A complete, production-style **Express.js REST API** built for frontend developers who want to practice `fetch()` and working with real REST APIs. It includes authentication with HttpOnly JWT cookies, a realistic seeded database, full CRUD resources with pagination/search/filtering, Zod validation, Swagger docs, and a consistent JSON response format.

> This project is written in **plain JavaScript** (no TypeScript) using CommonJS modules (`require`/`module.exports`).

---

## 1. What this project is

A practice backend you run locally (or deploy) so you can build a frontend against a real API instead of mock data. It covers the situations you'll hit in real projects:

- Registering/logging in and staying logged in via cookies
- Paginating, searching, and filtering lists
- Creating, editing, and deleting your own content
- Handling validation errors and empty states
- Placing orders that adjust stock
- Toggling favorites

## 2. Technologies used

| Purpose            | Technology              |
| ------------------ | ------------------------ |
| Server framework   | Express.js               |
| Language            | JavaScript (Node.js, CommonJS) |
| ORM                | Prisma                   |
| Database            | Neon (serverless PostgreSQL) |
| Auth                | JWT in HttpOnly cookies  |
| Password hashing    | bcryptjs                 |
| Validation          | Zod                      |
| Email (password reset) | Resend               |
| API docs            | Swagger / OpenAPI (swagger-jsdoc + swagger-ui-express) |
| Security            | Helmet, CORS             |
| Logging             | Morgan                   |
| Env config           | dotenv                   |

## 3. Project structure

```text
express-neon-practice-api/
│
├── prisma/
│   ├── schema.prisma        # Data model (User, Product, Post, Order, etc.)
│   └── seed.js               # Seeds the database with realistic dummy data
│
├── src/
│   ├── config/
│   │   └── env.js            # Central place that reads/validates env vars
│   │
│   ├── controllers/          # Request handlers (one file per resource)
│   ├── middleware/            # auth, validation, error handling, 404
│   ├── routes/                # Express routers + Swagger JSDoc comments
│   ├── services/
│   │   └── email.service.js  # Resend integration
│   ├── utils/
│   │   ├── api-response.js   # sendSuccess() — the standard response shape
│   │   ├── http-error.js     # HttpError class used everywhere
│   │   └── tokens.js         # JWT + password-reset token helpers
│   ├── validators/            # Zod schemas
│   │
│   ├── db.js                  # Shared PrismaClient instance
│   ├── swagger.js             # Swagger/OpenAPI config
│   ├── swagger-docs.js        # Reusable OpenAPI component schemas
│   ├── app.js                 # Express app (middleware + routes)
│   └── server.js              # Boots the HTTP server
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── FRONTEND_FETCH_EXAMPLES.md
```

## 4. Install dependencies

```bash
npm install
```

## 5. Configure `.env`

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require"

PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:3000

JWT_SECRET=replace-this-with-a-long-random-string
JWT_EXPIRES_IN=1d
COOKIE_NAME=access_token

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=onboarding@resend.dev

RESET_PASSWORD_URL=http://localhost:3000/reset-password
```

Never commit a real `.env` file — it's already in `.gitignore`.

## 6. Connect Neon

1. Create a free project at [neon.tech](https://neon.tech).
2. In your Neon dashboard, open **Connection Details**.
3. Copy the **pooled** connection string (has `-pooler` in the hostname) into `DATABASE_URL`.
4. Copy the **direct** (non-pooled) connection string into `DIRECT_URL`.
   - `DATABASE_URL` (pooled) is what the running app uses for normal queries.
   - `DIRECT_URL` (direct) is what Prisma Migrate uses to run migrations — migrations need a direct connection, not a pooled one.

## 7. Run Prisma migrations

This creates the actual tables in your Neon database from `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name init
```

This also runs `prisma generate` automatically, which creates the Prisma Client used by `src/db.js`.

## 8. Seed the database

```bash
npm run seed
```

This wipes and repopulates the database with:

- 1 admin user
- 6 regular users
- 10 categories
- exactly 50 products (with real Unsplash image URLs)
- 16 posts
- 30+ comments
- 12 orders
- several favorites per user

## 9. Start the development server

```bash
npm run dev
```

The server restarts automatically on file changes (via `nodemon`). For a plain start without auto-reload:

```bash
npm start
```

You should see:

```text
🚀 Server running at http://localhost:5000
📚 Swagger docs at http://localhost:5000/api-docs
🌱 Environment: development
```

## 10. Open Swagger

Visit **http://localhost:5000/api-docs** to see every endpoint documented with request/response shapes, parameters, and auth requirements. A raw JSON version is available at `/api-docs.json`.

## 11. Test user credentials

All seeded users share the password `Password123!`, except the admin:

| Role  | Email               | Password       |
| ----- | -------------------- | -------------- |
| Admin | `admin@example.com`  | `Admin123!`    |
| User  | `ava@example.com`    | `Password123!` |
| User  | `liam@example.com`   | `Password123!` |
| User  | `sophia@example.com` | `Password123!` |
| User  | `noah@example.com`   | `Password123!` |
| User  | `emma@example.com`   | `Password123!` |
| User  | `oliver@example.com` | `Password123!` |

## 12. Authentication flow

1. **Register** (`POST /api/auth/register`) or **log in** (`POST /api/auth/login`).
2. The server signs a JWT containing `{ sub: userId, email, role }` and sets it as an **HttpOnly cookie** named `access_token` (configurable via `COOKIE_NAME`).
3. On every subsequent request, the browser automatically sends that cookie — you don't manually attach a token.
4. `GET /api/auth/me` returns the currently logged-in user based on the cookie.
5. `POST /api/auth/logout` clears the cookie.

Because the cookie is `HttpOnly`, JavaScript in the browser **cannot read or manually set it** — this is intentional and is what protects it from XSS token theft. It's also why the fetch flow below matters.

## 13. HttpOnly cookie behavior

- `httpOnly: true` — inaccessible to `document.cookie`.
- `secure: true` in production (requires HTTPS), `false` in local development so it works over plain `http://localhost`.
- `sameSite: "lax"` in development, `"none"` in production (needed for cross-site cookies over HTTPS, e.g. a frontend on Vercel calling an API on Render).
- Expires after 1 day by default (kept in sync with `JWT_EXPIRES_IN`).

## 14. How the frontend must call the API

**Every request that relies on authentication must include `credentials: "include"`**, or the browser will not send the cookie:

```javascript
fetch("http://localhost:5000/api/auth/me", {
  credentials: "include",
});
```

## Deploy to Vercel

This repository includes a Vercel serverless entry point at `api/index.js`. It imports the Express app but does not start a long-running HTTP listener; Vercel invokes it for every request. `vercel.json` rewrites all paths to that entry point, so API routes such as `/api/products`, `/health`, and `/api-docs` keep the same URLs after deployment.

1. Push the repository to GitHub and import it at [vercel.com/new](https://vercel.com/new), or run `vercel` from the project directory.
2. In **Project Settings → Environment Variables**, add the following values for Production (and Preview if needed):

   ```text
   DATABASE_URL=<Neon pooled connection URL>
   JWT_SECRET=<a long random secret>
   JWT_EXPIRES_IN=1d
   COOKIE_NAME=access_token
   CLIENT_URL=https://your-frontend-domain.vercel.app
   RESET_PASSWORD_URL=https://your-frontend-domain.vercel.app/reset-password
   RESEND_API_KEY=<optional Resend API key>
   RESEND_FROM=<a verified Resend sender>
   NODE_ENV=production
   ```

   `DATABASE_URL` must be Neon’s pooled URL (the hostname contains `-pooler`) and include `sslmode=require`. `DIRECT_URL` is not required by the deployed API; keep it locally or in Vercel only if a build/deployment workflow runs Prisma migrations.
3. Run database migrations from your computer or CI before deploying application code that needs them:

   ```bash
   npm run prisma:deploy
   ```

   Do not use `prisma migrate dev`, `prisma migrate reset`, or `npm run seed` as a Vercel build command: those are development/destructive operations. The `postinstall` script only runs `prisma generate`, which makes Prisma Client available to the function.
4. Deploy. Your API will be available at `https://your-project.vercel.app`, with Swagger at `/api-docs`. The deployed Swagger UI uses the current site as its API server, so **Try it out** sends requests to the Vercel URL instead of `localhost`.

For cookie-based browser authentication, `CLIENT_URL` must exactly match the frontend origin and frontend requests must use `credentials: "include"`. If the frontend is hosted on a different site, browsers may block third-party cookies; hosting it on the same domain/subdomain is the most reliable approach.

Also make sure `CLIENT_URL` in your `.env` matches your frontend's origin exactly — CORS is configured with `credentials: true` and a specific allowed origin (wildcard `*` origins do not work with credentialed requests).

## 15. How password reset (Resend) works

1. `POST /api/auth/forgot-password` with `{ "email": "..." }`.
2. The server always responds with the same generic message, regardless of whether that email exists (this is intentional — it prevents attackers from discovering which emails are registered).
3. If the user *does* exist, the server:
   - Generates a random 32-byte token.
   - Stores only its **SHA-256 hash** in the database (`PasswordResetToken.tokenHash`) — the raw token is never persisted.
   - Emails the raw token as part of a link (`RESET_PASSWORD_URL?token=...`) using **Resend**.
   - The token expires after **30 minutes** and is marked `used` after a single use (both prevent reuse).
4. `POST /api/auth/reset-password` with `{ "token": "...", "password": "..." }` verifies the token's hash, checks expiry/usage, updates the password, and invalidates the token.

If `RESEND_API_KEY` is left blank, the server logs the reset link to the console instead of sending an email, so you can still test the full flow locally without a Resend account.

## 16. All available API endpoints

### Auth
| Method | Endpoint                        | Auth required |
| ------ | -------------------------------- | -------------- |
| POST   | `/api/auth/register`             | No             |
| POST   | `/api/auth/login`                | No             |
| POST   | `/api/auth/logout`               | No             |
| GET    | `/api/auth/me`                   | Yes            |
| POST   | `/api/auth/forgot-password`      | No             |
| POST   | `/api/auth/reset-password`       | No             |

### Protected practice routes
| Method | Endpoint                     | Auth required |
| ------ | ------------------------------ | -------------- |
| GET    | `/api/protected/profile`       | Yes            |
| GET    | `/api/protected/dashboard`     | Yes            |

### Products
| Method | Endpoint               | Auth required | Notes |
| ------ | ------------------------ | -------------- | ----- |
| GET    | `/api/products`         | No             | `?page=&limit=&search=&category=&minPrice=&maxPrice=&sort=` |
| GET    | `/api/products/:id`     | No             | |
| POST   | `/api/products`         | Yes            | |
| PATCH  | `/api/products/:id`     | Yes            | |
| DELETE | `/api/products/:id`     | Yes            | |

### Categories
| Method | Endpoint               | Auth required |
| ------ | ------------------------ | -------------- |
| GET    | `/api/categories`       | No             |
| GET    | `/api/categories/:id`   | No             |

### Posts
| Method | Endpoint          | Auth required | Notes |
| ------ | ------------------- | -------------- | ----- |
| GET    | `/api/posts`        | No             | `?page=&limit=&search=&authorId=` |
| GET    | `/api/posts/:id`    | No             | |
| POST   | `/api/posts`        | Yes            | |
| PATCH  | `/api/posts/:id`    | Yes            | author or admin only |
| DELETE | `/api/posts/:id`    | Yes            | author or admin only |

### Comments
| Method | Endpoint                         | Auth required |
| ------ | ---------------------------------- | -------------- |
| GET    | `/api/comments/post/:postId`      | No             |
| POST   | `/api/comments/post/:postId`      | Yes            |

### Orders
| Method | Endpoint        | Auth required |
| ------ | ----------------- | -------------- |
| GET    | `/api/orders`    | Yes            |
| POST   | `/api/orders`    | Yes            |

### Favorites
| Method | Endpoint                             | Auth required |
| ------ | --------------------------------------- | -------------- |
| GET    | `/api/favorites`                       | Yes            |
| POST   | `/api/favorites/:productId/toggle`     | Yes            |

## 17. Example `fetch()` requests

See **[FRONTEND_FETCH_EXAMPLES.md](./FRONTEND_FETCH_EXAMPLES.md)** for copy-paste examples of every endpoint, including error handling.

Quick taste:

```javascript
// Login
const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email: "ava@example.com", password: "Password123!" }),
});
const json = await res.json();
```

## 18. How to reset the database

To wipe all data and re-seed from scratch:

```bash
npx prisma migrate reset
```

This drops and recreates the database, reapplies all migrations, and automatically runs the seed script (configured via `package.json#prisma.seed`).

If you only want to re-run the seed without touching migrations:

```bash
npm run seed
```

## API response format

**Success:**

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 50 }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Product not found",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "details": null
  }
}
```

## Notes on `prisma.config.ts`

This project intentionally does **not** include a `prisma.config.ts` file. Prisma 6.1's package.json-based config (`"prisma": { "seed": "node prisma/seed.js" }` in `package.json`) is fully supported and simpler for a JavaScript project — `prisma.config.ts` is a TypeScript-first, still-evolving feature and would add unnecessary complexity here.

## Windows PowerShell quick start

```powershell
npm install
Copy-Item .env.example .env
# then edit .env with your Neon connection strings in Notepad or VS Code
notepad .env

npx prisma migrate dev --name init
npm run seed
npm run dev
```

Then open http://localhost:5000/api-docs in your browser.
#   t e s t - a p i - j s  
 
