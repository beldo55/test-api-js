# Frontend Fetch Examples

Copy-paste `fetch()` examples for every endpoint in this API. All examples assume the API is running at `http://localhost:5000` and your frontend is running at the `CLIENT_URL` configured in `.env` (default `http://localhost:3000`).

> **Every authenticated request needs `credentials: "include"`.** Without it, the browser won't send the HttpOnly auth cookie and you'll get `401 Unauthorized`.

A small helper used throughout these examples:

```javascript
const API_URL = "http://localhost:5000";

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    // json.error.code / json.error.details give you machine-readable info
    throw new Error(json.message || "Something went wrong");
  }

  return json; // { success, message, data, meta? }
}
```

---

## Auth

### Register

```javascript
try {
  const { data } = await api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "John Doe",
      email: "john@example.com",
      password: "Password123!",
    }),
  });
  console.log("Registered:", data); // { id, name, email, role, createdAt }
} catch (err) {
  console.error("Registration failed:", err.message);
}
```

### Login

```javascript
try {
  const { data } = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "ava@example.com", password: "Password123!" }),
  });
  console.log("Logged in as:", data);
} catch (err) {
  console.error("Login failed:", err.message); // e.g. "Invalid email or password"
}
```

### Logout

```javascript
await api("/api/auth/logout", { method: "POST" });
```

### Check current user (`/me`)

Useful on app load to check whether the user is already logged in:

```javascript
async function getCurrentUser() {
  try {
    const { data } = await api("/api/auth/me");
    return data; // logged in
  } catch {
    return null; // not logged in / cookie expired
  }
}
```

### Forgot password

```javascript
await api("/api/auth/forgot-password", {
  method: "POST",
  body: JSON.stringify({ email: "ava@example.com" }),
});
// Always shows a generic "check your email" message, regardless of the result.
```

### Reset password

```javascript
// `token` comes from the query string of the reset link, e.g.
// http://localhost:3000/reset-password?token=abc123
const token = new URLSearchParams(window.location.search).get("token");

try {
  await api("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password: "NewPassword123!" }),
  });
  console.log("Password reset — redirect to login");
} catch (err) {
  console.error(err.message); // e.g. "This reset link is invalid or has expired"
}
```

---

## Protected practice routes

```javascript
// GET /api/protected/profile
const { data: profile } = await api("/api/protected/profile");

// GET /api/protected/dashboard
const { data: dashboard } = await api("/api/protected/dashboard");
console.log(dashboard.stats); // { posts, comments, orders, favorites, totalSpent }
```

---

## Products

### Get products (with loading/empty states)

```javascript
async function loadProducts(setState) {
  setState({ status: "loading" });
  try {
    const { data, meta } = await api("/api/products?page=1&limit=12");
    setState({ status: data.length ? "success" : "empty", products: data, meta });
  } catch (err) {
    setState({ status: "error", error: err.message });
  }
}
```

### Search products

```javascript
const { data } = await api(`/api/products?search=${encodeURIComponent("keyboard")}`);
```

### Filter by category + price range, with pagination

```javascript
const params = new URLSearchParams({
  category: "electronics",
  minPrice: "20",
  maxPrice: "150",
  sort: "price_asc",
  page: "2",
  limit: "10",
});
const { data, meta } = await api(`/api/products?${params}`);
console.log(meta); // { page, limit, total, totalPages, hasNextPage, hasPrevPage }
```

### Get a single product

```javascript
const { data: product } = await api(`/api/products/${productId}`);
```

### Create a product (requires auth)

```javascript
const { data: created } = await api("/api/products", {
  method: "POST",
  body: JSON.stringify({
    name: "Wireless Mouse",
    description: "A comfortable wireless mouse with a 2-year battery life.",
    price: 24.99,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
    categoryId: "clxxxx-some-category-id",
  }),
});
```

### Update a product

```javascript
const { data: updated } = await api(`/api/products/${productId}`, {
  method: "PATCH",
  body: JSON.stringify({ price: 19.99, stock: 40 }),
});
```

### Delete a product

```javascript
await api(`/api/products/${productId}`, { method: "DELETE" });
```

---

## Categories

```javascript
// GET /api/categories
const { data: categories } = await api("/api/categories");

// GET /api/categories/:id
const { data: category } = await api(`/api/categories/${categoryId}`);
```

---

## Posts

### Get posts (paginated + searchable)

```javascript
const { data: posts, meta } = await api("/api/posts?page=1&limit=10");

const { data: searchResults } = await api(`/api/posts?search=${encodeURIComponent("javascript")}`);
```

### Get a single post

```javascript
const { data: post } = await api(`/api/posts/${postId}`);
```

### Create a post (requires auth)

```javascript
const { data: created } = await api("/api/posts", {
  method: "POST",
  body: JSON.stringify({
    title: "My First Post",
    content: "This is the content of my very first post on this practice API.",
    published: true,
  }),
});
```

### Update a post (author or admin only)

```javascript
try {
  const { data: updated } = await api(`/api/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify({ title: "Updated Title" }),
  });
} catch (err) {
  console.error(err.message); // "You can only edit your own posts"
}
```

### Delete a post

```javascript
await api(`/api/posts/${postId}`, { method: "DELETE" });
```

---

## Comments

### Get comments for a post

```javascript
const { data: comments, message } = await api(`/api/comments/post/${postId}`);
if (comments.length === 0) console.log(message); // "No comments yet — be the first to comment"
```

### Add a comment (requires auth)

```javascript
const { data: comment } = await api(`/api/comments/post/${postId}`, {
  method: "POST",
  body: JSON.stringify({ content: "Great post, thanks for sharing!" }),
});
```

---

## Orders

### Get my orders

```javascript
const { data: orders } = await api("/api/orders");
```

### Place an order

```javascript
try {
  const { data: order } = await api("/api/orders", {
    method: "POST",
    body: JSON.stringify({
      items: [
        { productId: "clxxxx-product-1", quantity: 2 },
        { productId: "clxxxx-product-2", quantity: 1 },
      ],
    }),
  });
  console.log("Order placed:", order);
} catch (err) {
  console.error(err.message); // e.g. "Not enough stock for ..."
}
```

---

## Favorites

### Get my favorites

```javascript
const { data: favorites } = await api("/api/favorites");
```

### Toggle a favorite

```javascript
const { data, message } = await api(`/api/favorites/${productId}/toggle`, { method: "POST" });
console.log(message); // "Product added to favorites" or "Product removed from favorites"
console.log(data.favorited); // true / false
```

---

## Handling errors consistently

Every error response follows the same shape, so you can branch on `error.code`:

```javascript
try {
  await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "wrong@example.com", password: "wrong" }),
  });
} catch (err) {
  // err.message === "Invalid email or password"
}
```

If you need the machine-readable `code` (e.g. to show a specific UI state), fetch manually instead of throwing:

```javascript
const res = await fetch(`${API_URL}/api/auth/login`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const json = await res.json();

if (!json.success) {
  switch (json.error.code) {
    case "INVALID_CREDENTIALS":
      // show "wrong email or password"
      break;
    case "VALIDATION_ERROR":
      // json.error.details.fieldErrors.body is an array of messages
      break;
    default:
    // generic error message
  }
}
```
