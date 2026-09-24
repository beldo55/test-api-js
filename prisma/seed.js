/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// ---------- Helpers ----------
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ---------- Dummy data ----------
const CATEGORY_DEFS = [
  { name: "Electronics", description: "Gadgets, devices, and everything with a plug." },
  { name: "Home & Kitchen", description: "Furniture, appliances, and kitchen essentials." },
  { name: "Books", description: "Fiction, non-fiction, and everything in between." },
  { name: "Clothing", description: "Apparel for every season and style." },
  { name: "Sports & Outdoors", description: "Gear for staying active and exploring outside." },
  { name: "Beauty & Personal Care", description: "Skincare, haircare, and grooming products." },
  { name: "Toys & Games", description: "Fun for kids and adults alike." },
  { name: "Office Supplies", description: "Everything you need for a productive workspace." },
  { name: "Pet Supplies", description: "Food, toys, and accessories for your pets." },
  { name: "Automotive", description: "Parts, tools, and accessories for your vehicle." },
];

const PRODUCT_TEMPLATES = {
  Electronics: [
    ["Wireless Bluetooth Headphones", 79.99],
    ["27-inch 4K Monitor", 329.0],
    ["Mechanical Keyboard", 109.5],
    ["USB-C Hub Adapter", 34.99],
    ["Portable Power Bank 20000mAh", 45.0],
    ["Smart Home Speaker", 59.99],
  ],
  "Home & Kitchen": [
    ["Stainless Steel Cookware Set", 189.99],
    ["Programmable Coffee Maker", 64.5],
    ["Memory Foam Pillow", 29.99],
    ["Air Fryer 5.5L", 89.99],
    ["Ceramic Dinnerware Set", 74.0],
  ],
  Books: [
    ["The Midnight Library", 14.99],
    ["Atomic Habits", 16.5],
    ["A Brief History of Time", 12.99],
    ["The Pragmatic Programmer", 39.99],
    ["Sapiens: A Brief History of Humankind", 18.0],
  ],
  Clothing: [
    ["Classic Fit Denim Jacket", 59.99],
    ["Merino Wool Sweater", 84.0],
    ["Running Sneakers", 99.99],
    ["Cotton Crewneck T-Shirt", 19.99],
    ["Waterproof Rain Jacket", 119.0],
  ],
  "Sports & Outdoors": [
    ["Yoga Mat with Carry Strap", 24.99],
    ["Adjustable Dumbbell Set", 149.99],
    ["4-Person Camping Tent", 179.0],
    ["Insulated Water Bottle 32oz", 22.5],
    ["Trail Running Backpack", 64.99],
  ],
  "Beauty & Personal Care": [
    ["Vitamin C Facial Serum", 27.99],
    ["Electric Toothbrush", 49.99],
    ["Ceramic Hair Straightener", 39.0],
    ["Moisturizing Body Lotion", 15.99],
  ],
  "Toys & Games": [
    ["1000-Piece Jigsaw Puzzle", 19.99],
    ["Remote Control Car", 42.5],
    ["Strategy Board Game", 34.99],
    ["Building Blocks Set 500pc", 29.99],
  ],
  "Office Supplies": [
    ["Ergonomic Office Chair", 219.0],
    ["Standing Desk Converter", 159.99],
    ["Wireless Mouse", 24.99],
    ["Notebook 3-Pack", 12.99],
  ],
  "Pet Supplies": [
    ["Orthopedic Dog Bed", 59.99],
    ["Automatic Cat Feeder", 44.99],
    ["Durable Chew Toy Bundle", 18.5],
    ["Cat Scratching Post Tower", 69.99],
  ],
  Automotive: [
    ["Portable Tire Inflator", 39.99],
    ["Microfiber Car Wash Kit", 27.99],
    ["Dash Cam 1080p", 54.99],
    ["All-Weather Floor Mats", 64.0],
  ],
};

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
];

function imageFor(seed) {
  const base = pick(IMAGE_URLS);
  return `${base}?auto=format&fit=crop&w=800&q=80&sig=${seed}`;
}

const USER_DEFS = [
  { name: "Ava Thompson", email: "ava@example.com" },
  { name: "Liam Carter", email: "liam@example.com" },
  { name: "Sophia Martinez", email: "sophia@example.com" },
  { name: "Noah Patel", email: "noah@example.com" },
  { name: "Emma Wilson", email: "emma@example.com" },
  { name: "Oliver Chen", email: "oliver@example.com" },
];

const POST_TITLES = [
  "10 Tips for Writing Cleaner JavaScript",
  "Why I Switched to TypeScript (and Why You Might Too)",
  "A Beginner's Guide to REST APIs",
  "Understanding JWT Authentication in 5 Minutes",
  "How I Organized My First Full-Stack Project",
  "The Case for Boring Technology",
  "Debugging Async Code Without Losing Your Mind",
  "What I Learned Building My First Express API",
  "CSS Grid vs Flexbox: When to Use Which",
  "Database Indexing Explained Simply",
  "My Favorite VS Code Extensions in 2026",
  "A Practical Guide to Error Handling in Node.js",
  "How to Design a Clean REST API Response Format",
  "Getting Started with Prisma ORM",
  "5 Mistakes I Made as a Junior Developer",
  "Why Pagination Matters for Frontend Performance",
];

const COMMENT_TEMPLATES = [
  "This was really helpful, thanks for sharing!",
  "I've been struggling with this exact problem, great timing.",
  "Nice write-up — do you have a follow-up on testing?",
  "Solid explanation, bookmarking this for later.",
  "I disagree a bit on point 3, but overall great post.",
  "Could you share the repo for this?",
  "Exactly what I needed today, thank you!",
  "Great breakdown for beginners.",
  "I tried this approach and it worked perfectly.",
  "Would love to see a deeper dive into this topic.",
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (order matters due to FK constraints).
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Users ----------
  const adminPassword = await bcrypt.hash("Admin123!", SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@example.com", password: adminPassword, role: "ADMIN" },
  });

  const userPassword = await bcrypt.hash("Password123!", SALT_ROUNDS);
  const users = [];
  for (const def of USER_DEFS) {
    const user = await prisma.user.create({
      data: { name: def.name, email: def.email, password: userPassword, role: "USER" },
    });
    users.push(user);
  }
  console.log(`  ✔ Created 1 admin + ${users.length} users`);

  // ---------- Categories ----------
  const categories = [];
  for (const def of CATEGORY_DEFS) {
    const category = await prisma.category.create({
      data: { name: def.name, slug: slugify(def.name), description: def.description },
    });
    categories.push(category);
  }
  console.log(`  ✔ Created ${categories.length} categories`);

  // ---------- Products (exactly 50) ----------
  const products = [];
  let imgSeed = 1;
  const categoryNames = Object.keys(PRODUCT_TEMPLATES);

  // First pass: use the curated templates (guarantees realistic names).
  for (const catName of categoryNames) {
    const category = categories.find((c) => c.name === catName);
    for (const [name, price] of PRODUCT_TEMPLATES[catName]) {
      products.push({
        name,
        description: `${name} — a customer favorite in our ${catName} collection, chosen for quality, durability, and value.`,
        price,
        stock: randomInt(0, 200),
        imageUrl: imageFor(imgSeed++),
        categoryId: category.id,
      });
    }
  }

  // Second pass: top up to exactly 50 with variant products.
  let variantIndex = 1;
  while (products.length < 50) {
    const catName = pick(categoryNames);
    const category = categories.find((c) => c.name === catName);
    const [baseName, basePrice] = pick(PRODUCT_TEMPLATES[catName]);
    products.push({
      name: `${baseName} (Variant ${variantIndex})`,
      description: `${baseName} — an alternate edition in our ${catName} collection, chosen for quality, durability, and value.`,
      price: Number((basePrice * (0.85 + Math.random() * 0.3)).toFixed(2)),
      stock: randomInt(0, 200),
      imageUrl: imageFor(imgSeed++),
      categoryId: category.id,
    });
    variantIndex++;
  }
  // Trim in case templates overshot.
  products.length = 50;

  const createdProducts = [];
  for (const p of products) {
    const created = await prisma.product.create({ data: p });
    createdProducts.push(created);
  }
  console.log(`  ✔ Created ${createdProducts.length} products`);

  // ---------- Posts (15+) ----------
  const posts = [];
  for (let i = 0; i < POST_TITLES.length; i++) {
    const author = pick(users);
    const post = await prisma.post.create({
      data: {
        title: POST_TITLES[i],
        content:
          `${POST_TITLES[i]}\n\nThis is a longer-form practice post used to populate the frontend fetch() ` +
          `exercises. It contains enough text to test truncation, line clamping, and detail views. ` +
          `Feel free to fetch, edit, or delete this post while practicing your REST API skills.`,
        published: true,
        authorId: author.id,
        createdAt: daysAgo(randomInt(1, 120)),
      },
    });
    posts.push(post);
  }
  console.log(`  ✔ Created ${posts.length} posts`);

  // ---------- Comments (30+) ----------
  let commentCount = 0;
  for (const post of posts) {
    const numComments = randomInt(1, 4);
    for (let i = 0; i < numComments; i++) {
      const author = pick(users);
      await prisma.comment.create({
        data: {
          content: pick(COMMENT_TEMPLATES),
          postId: post.id,
          authorId: author.id,
          createdAt: daysAgo(randomInt(0, 100)),
        },
      });
      commentCount++;
    }
  }
  console.log(`  ✔ Created ${commentCount} comments`);

  // ---------- Orders (10+) ----------
  const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  let orderCount = 0;
  for (let i = 0; i < 12; i++) {
    const user = pick(users);
    const itemCount = randomInt(1, 3);
    const chosenProducts = new Set();
    while (chosenProducts.size < itemCount) {
      chosenProducts.add(pick(createdProducts));
    }
    const items = Array.from(chosenProducts).map((product) => {
      const quantity = randomInt(1, 3);
      return { productId: product.id, quantity, price: product.price };
    });
    const total = items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);

    await prisma.order.create({
      data: {
        userId: user.id,
        status: pick(statuses),
        total,
        createdAt: daysAgo(randomInt(0, 90)),
        items: { create: items },
      },
    });
    orderCount++;
  }
  console.log(`  ✔ Created ${orderCount} orders`);

  // ---------- Favorites ----------
  let favoriteCount = 0;
  for (const user of users) {
    const numFavorites = randomInt(2, 6);
    const chosen = new Set();
    while (chosen.size < numFavorites) {
      chosen.add(pick(createdProducts));
    }
    for (const product of chosen) {
      try {
        await prisma.favorite.create({ data: { userId: user.id, productId: product.id } });
        favoriteCount++;
      } catch {
        // Ignore rare unique-constraint collisions from the random selection.
      }
    }
  }
  console.log(`  ✔ Created ${favoriteCount} favorites`);

  console.log("\n✅ Seeding complete!\n");
  console.log("Sample login credentials:");
  console.log(`  Admin: admin@example.com / Admin123!`);
  console.log(`  User:  ${USER_DEFS[0].email} / Password123!  (same password for all seeded users)\n`);
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
