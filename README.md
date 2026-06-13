# 🌙 Hayaa - Multi-Vendor Islamic Ecommerce API

<div align="center">
  <h3>A Sharia-Compliant Ecommerce Platform Backend</h3>
  <p>Built with Node.js, Express, MongoDB & JWT Authentication</p>

  <p>
    <strong>Base URL:</strong> <code>http://localhost:5000/api</code>
    <br/>
    <strong>Health Check:</strong> <code>GET /api/health</code>
  </p>
</div>

---

## 📚 Table of Contents

- [Quick Start](#-quick-start)
- [Authentication Guide](#-authentication-guide)
- [Role System](#-role-system)
- [API Reference](#-api-reference)
- [Error Handling](#-error-handling)
- [Postman Collection](#-postman-collection)
- [Database Models Overview](#-database-models-overview)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16+
- **MongoDB** v5+ (running locally or via Atlas)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd hayaa-ecommerce-backend-node

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit .env file (already created with defaults):
#   PORT=5000
#   MONGO_URI=mongodb://localhost:27017/hayaa_ecommerce
#   JWT_SECRET=your_secret_here
#   JWT_EXPIRE=7d

# 4. Start the server
npm run dev    # Development (with auto-restart)
# OR
npm start      # Production
```

The server will start at `http://localhost:5000`.

---

## �️ MongoDB Setup Guide

This guide covers installing and configuring MongoDB both **locally on Windows** and on a **Linux VPS**.

---

### 💻 Local Setup (Windows)

#### Option 1: Install MongoDB Community Edition (Recommended)

```bash
# Step 1: Download MongoDB
# Go to: https://www.mongodb.com/try/download/community
# Download the MSI installer for Windows

# Step 2: Install MongoDB
# Run the installer, choose "Complete" setup
# Make sure to install "MongoDB Compass" (GUI tool) as well

# Step 3: MongoDB runs as a Windows service automatically
# After installation, MongoDB starts on every boot
# Default connection: mongodb://localhost:27017
```

**Verify installation:**

```bash
# Open Command Prompt or PowerShell
mongo --version
# OR (newer versions)
mongod --version

# Check if MongoDB service is running
net start MongoDB
```

#### Option 2: Use MongoDB Atlas (Cloud - No Installation)

MongoDB Atlas is a free cloud-hosted MongoDB service. Perfect if you don't want to install anything locally.

```bash
# Step 1: Create a free account
# Go to: https://www.mongodb.com/atlas

# Step 2: Create a cluster
# - Click "Build a Database"
# - Choose the FREE M0 cluster (512MB storage - plenty for development)
# - Choose a cloud provider (AWS) and region (choose one close to you)

# Step 3: Set up security
# - In "Database Access", create a database user (username + password)
# - In "Network Access", add your IP address or 0.0.0.0/0 (allows all IPs)

# Step 4: Get your connection string
# - Click "Connect" → "Connect your application"
# - Copy the connection string, it looks like:
#   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
```

**Update your `.env` file:**

```env
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/hayaa_ecommerce

# For MongoDB Atlas (cloud):
MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/hayaa_ecommerce?retryWrites=true&w=majority
```

#### 📊 Using MongoDB Compass (GUI)

MongoDB Compass is a visual tool that comes with the MongoDB installer:

```bash
# 1. Open MongoDB Compass
# 2. Paste your connection string:
#    mongodb://localhost:27017
# 3. Click "Connect"
# 4. You'll see the `hayaa_ecommerce` database once your server runs!
```

---

### 🐧 Linux VPS Setup (Ubuntu/Debian)

```bash
# ============================================
# STEP 1: SSH into your VPS
# ============================================
ssh your_user@your_vps_ip

# ============================================
# STEP 2: Import MongoDB GPG Key & Add Repository
# ============================================

# Import the public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Add MongoDB repository (Ubuntu 22.04 / 24.04)
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# ============================================
# STEP 3: Install MongoDB
# ============================================
sudo apt-get update
sudo apt-get install -y mongodb-org

# ============================================
# STEP 4: Start MongoDB
# ============================================
sudo systemctl start mongod
sudo systemctl enable mongod   # Auto-start on boot
sudo systemctl status mongod   # Check if running

# ============================================
# STEP 5: Verify Installation
# ============================================
mongosh --eval "db.version()"  # Should print version number

# ============================================
# STEP 6: SECURE MongoDB (CRITICAL for VPS!)
# ============================================

# 6a. Create an admin user
mongosh
```

```javascript
// Inside mongosh shell:
use admin
db.createUser({
  user: "admin",
  pwd: "YourStrongPassword123!",
  roles: [{ role: "root", db: "admin" }]
})
exit
```

```bash
# 6b. Enable authentication in MongoDB config
sudo nano /etc/mongod.conf
```

```yaml
# In the mongod.conf file, find the #security: section
# Change it to look like this:
security:
  authorization: enabled
```

```bash
# 6c. Also bind to your server's IP (or keep local only + use SSH tunnel)
# In /etc/mongod.conf, under net: section:
net:
  port: 27017
  bindIp: 127.0.0.1   # Local only - MOST SECURE

# 6d. Restart MongoDB
sudo systemctl restart mongod

# 6e. Test authentication
mongosh -u admin -p YourStrongPassword123! --authenticationDatabase admin
```

#### 🔐 Connecting from Your App to VPS MongoDB

**Option A: Local-only MongoDB + Local App (Simplest & Most Secure)**

```bash
# Run the app ON the same VPS
# Your .env stays as:
MONGO_URI=mongodb://localhost:27017/hayaa_ecommerce
```

**Option B: Remote MongoDB with SSH Tunnel (Recommended for Remote Access)**

```bash
# On your LOCAL machine, create an SSH tunnel:
ssh -L 27017:localhost:27017 your_user@your_vps_ip

# Keep this terminal open! The tunnel forwards:
# localhost:27017 (your PC) → VPS:27017 (MongoDB)

# Your .env stays the same:
MONGO_URI=mongodb://localhost:27017/hayaa_ecommerce
```

**Option C: Direct Remote Connection (Use with Authentication Only!)**

```bash
# Only do this if you REALLY need remote access
# MongoDB .env with credentials:
MONGO_URI=mongodb://admin:YourStrongPassword123!@your_vps_ip:27017/hayaa_ecommerce?authSource=admin
```

---

### 🛡️ MongoDB Security Checklist for VPS

| Security Measure         | Command                               | Why                          |
| ------------------------ | ------------------------------------- | ---------------------------- |
| ✅ Enable Authentication | `authorization: enabled` in config    | Prevents unauthorized access |
| ✅ Bind to localhost     | `bindIp: 127.0.0.1`                   | Blocks external connections  |
| ✅ Use SSH tunnel        | `ssh -L 27017:localhost:27017 ...`    | Encrypted connection         |
| ✅ Strong password       | Use 16+ chars with special chars      | Prevents brute force         |
| ✅ Firewall rule         | `sudo ufw allow ssh` only             | Blocks all except SSH        |
| ✅ Regular backups       | `mongodump` weekly                    | Data recovery                |
| ✅ Update regularly      | `sudo apt update && sudo apt upgrade` | Security patches             |

```bash
# Set up UFW firewall (if not already):
sudo ufw allow ssh
sudo ufw allow 5000       # If your API is public
sudo ufw enable
sudo ufw status
```

---

### 🔄 Common MongoDB Commands

```bash
# Check service status
sudo systemctl status mongod

# Start/Stop/Restart
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod

# View logs
sudo journalctl -u mongod -n 50
# OR
sudo cat /var/log/mongodb/mongod.log

# Backup database
mongodump --db hayaa_ecommerce --out ./backup-$(date +%Y%m%d)

# Restore database
mongorestore --db hayaa_ecommerce ./backup-20260610/hayaa_ecommerce

# Connect and explore
mongosh
> use hayaa_ecommerce
> show collections
> db.users.find().pretty()
> db.products.countDocuments()
```

---

### ⚠️ Troubleshooting

**Problem:** `ECONNREFUSED` when connecting

```
Solution: MongoDB isn't running. Start it:
- Windows: net start MongoDB
- Linux: sudo systemctl start mongod
```

**Problem:** `MongooseServerSelectionError`

```
Solution: Check your MONGO_URI in .env file.
Make sure MongoDB is running on the correct port (27017).
```

**Problem:** `Authentication failed`

```
Solution:
- Did you create a database user?
- Is `authorization: enabled` in mongod.conf?
- Are you using the correct credentials in MONGO_URI?
```

**Problem:** Can't connect from my app to VPS MongoDB

```
Solution:
- Use SSH tunnel (recommended) instead of opening MongoDB to the internet
- Or check firewall: sudo ufw status
- Or check bindIp in /etc/mongod.conf
```

---

### 📦 Quick MongoDB Install Cheat Sheet

```bash
# ===== WINDOWS =====
# Download installer from mongodb.com → Run MSI → Done!

# ===== LINUX (Ubuntu/Debian) =====
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod

# ===== MACOS =====
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## �🔐 Authentication Guide

### How Authentication Works

This API uses **JWT (JSON Web Tokens)** for authentication. Here's the flow:

1. **Register** → You get a token back
2. **Login** → You get a token back
3. **Use the token** → Include it in the `Authorization` header for protected routes

### Headers Required

For **protected routes**, you must send:

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Getting Your First Token

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aisha Muhammad",
    "email": "aisha@example.com",
    "password": "password123",
    "phone": "08012345678"
  }'

# Response (201 Created)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "664a...",
    "name": "Aisha Muhammad",
    "email": "aisha@example.com",
    "phone": "08012345678",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Save the `token` value - you'll use it for all subsequent requests!

---

## 👥 Role System

The platform has **three roles** with different permissions:

| Role           | Description      | Can Do                                                                 |
| -------------- | ---------------- | ---------------------------------------------------------------------- |
| **`customer`** | Regular buyer    | Browse products, manage cart, place orders, write reviews              |
| **`vendor`**   | Store owner      | Everything customers can + manage products, view sales, fulfill orders |
| **`admin`**    | Platform manager | Everything + approve vendors/products, manage users, view analytics    |

### Becoming a Vendor

```mermaid
sequenceDiagram
    Customer->>API: POST /api/vendors/apply
    API->>Database: Create vendor profile (status: pending)
    API->>Database: Update user role to 'vendor'
    Admin->>API: GET /api/admin/vendors
    Admin->>API: PUT /api/admin/vendors/:id/verify
    API->>Database: Update verificationStatus: 'verified'
    Vendor->>API: POST /api/products (start selling!)
```

---

## 📖 API Reference

---

### 🧑‍💻 Auth Endpoints

**Base:** `POST /api/auth`

#### `POST /api/auth/register`

Register a new user account.

```json
// Request Body
{
  "name": "Aisha Muhammad",        // required, min 2 chars
  "email": "aisha@example.com",    // required, valid email
  "password": "password123",       // required, min 6 chars
  "phone": "08012345678"           // optional
}

// Response (201 Created)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "664a...",
    "name": "Aisha Muhammad",
    "email": "aisha@example.com",
    "phone": "08012345678",
    "role": "customer",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### `POST /api/auth/login`

Login with email and password.

```json
// Request Body
{
  "email": "aisha@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "664a...",
    "name": "Aisha Muhammad",
    "email": "aisha@example.com",
    "role": "vendor",
    "avatar": "",
    "vendor": {                          // Only included if user is a vendor
      "_id": "665b...",
      "storeName": "Aisha's Hijab Store",
      "storeSlug": "aishas-hijab-store",
      "complianceStatus": "approved",
      "verificationStatus": "verified"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### `GET /api/auth/me` 🔒

Get the currently logged-in user's profile.

```
Authorization: Bearer <token>
```

#### `PUT /api/auth/profile` 🔒

Update your name and/or phone.

```json
// Request Body
{
  "name": "Aisha Updated",
  "phone": "08098765432"
}
```

#### `PUT /api/auth/password` 🔒

Change your password.

```json
// Request Body
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

#### `POST /api/auth/addresses` 🔒

Add a shipping address.

```json
// Request Body
{
  "fullName": "Aisha Muhammad",
  "phone": "08012345678",
  "street": "123 Islamic Street, Kano",
  "city": "Kano",
  "state": "Kano State",
  "zipCode": "700001",
  "isDefault": true
}
```

#### `DELETE /api/auth/addresses/:id` 🔒

Delete a shipping address.

---

### 🏪 Vendor Endpoints

**Base:** `/api/vendors`

#### `POST /api/vendors/apply` 🔒 (Any role)

Apply to become a vendor.

```json
// Request Body
{
  "storeName": "Aisha's Hijab Store",
  "storeDescription": "Premium Islamic wear for sisters",
  "contactPhone": "08012345678",
  "contactEmail": "store@example.com",
  "address": {
    "street": "Shopping Complex, Kano",
    "city": "Kano",
    "state": "Kano State"
  },
  "specialties": ["Islamic_Clothing", "Prayer_Items", "Gifts_&_Souvenirs"]
}

// Response (201 Created)
{
  "success": true,
  "message": "Vendor application submitted successfully. Awaiting admin approval.",
  "data": {
    "storeName": "Aisha's Hijab Store",
    "storeSlug": "aishas-hijab-store",
    "verificationStatus": "pending",
    "complianceStatus": "pending",
    ...
  }
}
```

#### `GET /api/vendors/profile` 🔒 (Vendor only)

Get your vendor profile with stats.

#### `PUT /api/vendors/profile` 🔒 (Vendor only)

Update your store details.

#### `GET /api/vendors/dashboard` 🔒 (Vendor only)

Get dashboard with:

- Total / published / pending products
- Low stock alerts
- Recent orders
- Total revenue

#### `GET /api/vendors/orders` 🔒 (Vendor only)

Get orders containing your products.

| Query Param | Values                                                          | Description           |
| ----------- | --------------------------------------------------------------- | --------------------- |
| `status`    | `pending, confirmed, processing, shipped, delivered, cancelled` | Filter by item status |
| `page`      | `1, 2, 3...` (default: 1)                                       | Pagination            |
| `limit`     | `10, 20, 50...` (default: 20)                                   | Items per page        |

#### `PUT /api/vendors/orders/:orderId/items/:itemId` 🔒 (Vendor only)

Update the status of a specific item in an order.

```json
// Request Body
{
  "status": "shipped"
}
```

#### `GET /api/vendors/store/:slug` 🌍 (Public)

View a public vendor store page with all their published products.

| Query Param | Values                                                     | Description    |
| ----------- | ---------------------------------------------------------- | -------------- |
| `page`      | default: 1                                                 | Pagination     |
| `limit`     | default: 20                                                | Items per page |
| `sort`      | `-createdAt` (newest), `price`, `-price`, `-averageRating` | Sort order     |

---

### 📦 Product Endpoints

**Base:** `/api/products`

#### `GET /api/products` 🌍 (Public)

Get all published products with powerful filtering.

| Query Param  | Example                                           | Description                      |
| ------------ | ------------------------------------------------- | -------------------------------- |
| `page`       | `1`                                               | Page number                      |
| `limit`      | `20`                                              | Items per page                   |
| `sort`       | `-createdAt`, `price`, `-price`, `-averageRating` | Sort order                       |
| `category`   | `665b...`                                         | Filter by category ID            |
| `minPrice`   | `500`                                             | Minimum price                    |
| `maxPrice`   | `5000`                                            | Maximum price                    |
| `search`     | `hijab`                                           | Text search (name & description) |
| `isHalal`    | `true`                                            | Filter by Halal certification    |
| `islamicTag` | `Eid`, `Ramadan`, `Modest`                        | Filter by Islamic tag            |
| `vendor`     | `665b...`                                         | Filter by vendor ID              |

```json
// Response (200 OK)
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "664a...",
      "name": "Premium Silk Hijab",
      "slug": "premium-silk-hijab",
      "price": 2500,
      "comparePrice": 3000,
      "discount": 17, // Auto-calculated
      "images": [{ "url": "...", "isPrimary": true }],
      "isHalal": true,
      "islamicTags": ["Modest", "Eid"],
      "averageRating": 4.5,
      "category": { "_id": "...", "name": "Hijabs", "slug": "hijabs" },
      "vendor": {
        "_id": "...",
        "storeName": "Aisha's Hijab Store",
        "storeSlug": "aishas-hijab-store"
      }
    }
    // ... more products
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### `GET /api/products/:slug` 🌍 (Public)

Get a single product by its URL-friendly slug. Includes:

- Full product details
- Vendor info
- Approved reviews with user details
- Related products (same category)

#### `POST /api/products` 🔒 (Vendor only)

Create a new product. Vendor must be **verified**.

```json
// Request Body
{
  "name": "Premium Silk Hijab",
  "description": "A beautiful premium silk hijab perfect for special occasions...",
  "shortDescription": "Elegant silk hijab for Eid and special events",
  "price": 2500,
  "comparePrice": 3000,
  "stock": 50,
  "category": "665b...",           // Category ObjectId
  "images": [
    { "url": "/uploads/products/abc.jpg", "alt": "Hijab front view", "isPrimary": true },
    { "url": "/uploads/products/def.jpg", "alt": "Hijab back view" }
  ],
  "isHalal": true,
  "islamicTags": ["Modest", "Eid", "Ramadan"],
  "attributes": [
    { "name": "Size", "value": "One Size", "price": 0, "stock": 50 },
    { "name": "Color", "value": "Black", "price": 0, "stock": 20 },
    { "name": "Color", "value": "White", "price": 0, "stock": 30 }
  ],
  "weight": 0.2,
  "isFreeShipping": false,
  "shippingPrice": 500
}

// Response (201 Created)
{
  "success": true,
  "message": "Product created successfully. Awaiting admin approval.",
  "data": {
    "status": "pending",   // Needs admin approval!
    ...
  }
}
```

> **⚠️ Important:** New products are created with `status: "pending"` and must be approved by an admin before they appear publicly.

#### `GET /api/products/mine/all` 🔒 (Vendor only)

Get all your own products with optional status filter.

| Query Param | Values                                | Description      |
| ----------- | ------------------------------------- | ---------------- |
| `status`    | `draft, pending, published, rejected` | Filter by status |
| `page`      | `1`                                   | Page number      |
| `limit`     | `20`                                  | Items per page   |

#### `PUT /api/products/:id` 🔒 (Vendor only)

Update your product.

#### `DELETE /api/products/:id` 🔒 (Vendor only)

Delete your product.

---

### 📂 Category Endpoints

**Base:** `/api/categories`

Categories support parent/child hierarchy (subcategories).

#### `GET /api/categories` 🌍 (Public)

Get all active categories.

| Query Param   | Values                                                | Description              |
| ------------- | ----------------------------------------------------- | ------------------------ |
| `islamicType` | `Clothing_&_Modest_Fashion`, `Prayer_&_Worship`, etc. | Filter by Islamic type   |
| `isFeatured`  | `true`, `false`                                       | Featured categories only |

```json
// Response (200 OK)
{
  "success": true,
  "count": 12,
  "data": {
    "all": [
      // All categories with subcategories populated
    ],
    "parents": [
      // Only top-level categories (no parent)
    ]
  }
}
```

**Available Islamic Types:**

- `Clothing_&_Modest_Fashion`
- `Prayer_&_Worship`
- `Quran_&_Islamic_Knowledge`
- `Halal_Food_&_Beverages`
- `Home_&_Lifestyle`
- `Personal_Care_&_Fragrance`
- `Gifts_&_Occasions`
- `Digital_&_Media`
- `Children_&_Family`
- `Hajj_&_Umrah`
- `Other`

#### `GET /api/categories/:slug` 🌍 (Public)

Get a single category with its subcategories.

#### `POST /api/categories` 🔒 (Admin only)

Create a category.

```json
// Request Body
{
  "name": "Hijabs & Headscarves",
  "description": "Beautiful Islamic head coverings",
  "icon": "🧕",
  "parent": null, // ObjectId of parent category, or null
  "islamicType": "Clothing_&_Modest_Fashion",
  "sortOrder": 1
}
```

#### `PUT /api/categories/:id` 🔒 (Admin only)

Update a category.

#### `DELETE /api/categories/:id` 🔒 (Admin only)

Delete a category (cannot delete if it has subcategories).

---

### 🛒 Cart Endpoints

**Base:** `/api/cart` (All routes require authentication 🔒)

The cart is automatically created when you first add an item.

#### `GET /api/cart`

Get your current cart with all items.

```json
// Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "665b...",
    "user": "664a...",
    "items": [
      {
        "_id": "item123",
        "product": {
          "_id": "664a...",
          "name": "Premium Silk Hijab",
          "slug": "premium-silk-hijab",
          "price": 2500,
          "images": [{ "url": "...", "isPrimary": true }],
          "stock": 50,
          "vendor": {
            "storeName": "Aisha's Hijab Store",
            "storeSlug": "aishas-hijab-store"
          }
        },
        "quantity": 2,
        "price": 2500,
        "total": 5000
      }
    ],
    "subtotal": 5000,
    "shippingCost": 0,
    "tax": 0,
    "total": 5000
  }
}
```

#### `POST /api/cart`

Add an item to your cart. If the item already exists, it increases the quantity.

```json
// Request Body
{
  "productId": "664a...",          // Required: Product ObjectId
  "quantity": 2,                   // Optional: Default 1
  "variant": {                     // Optional: For products with variants
    "name": "Color",
    "value": "Black"
  }
}

// Response (200 OK)
{
  "success": true,
  "message": "Item added to cart",
  "data": { /* full cart */ }
}
```

#### `PUT /api/cart/:itemId`

Update the quantity of a cart item. Set `quantity: 0` to remove.

```json
// Request Body
{
  "quantity": 3
}
```

#### `DELETE /api/cart/:itemId`

Remove a specific item from cart.

#### `DELETE /api/cart/clear`

Clear your entire cart.

---

### 📋 Order Endpoints

**Base:** `/api/orders` (All routes require authentication 🔒)

#### `POST /api/orders`

Create an order from your cart. This will:

1. ✅ Validate stock for all items
2. ✅ Reduce stock quantities
3. ✅ Update vendor sales
4. ✅ Clear your cart
5. ✅ Generate a unique order number (e.g., `HAY-K3M2XZ7`)

```json
// Request Body
{
  "shippingAddress": {
    "fullName": "Aisha Muhammad",
    "phone": "08012345678",
    "street": "123 Islamic Street, Kano",
    "city": "Kano",
    "state": "Kano State",
    "zipCode": "700001",
    "country": "Nigeria"
  },
  "paymentMethod": "pay_on_delivery",   // Options: pay_on_delivery, card, bank_transfer, paystack, flutterwave
  "notes": "Please deliver between 2-5pm"
}

// Response (201 Created)
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "666c...",
    "orderNumber": "HAY-K3M2XZ7",     // Save this for tracking!
    "user": { "_id": "664a...", "name": "Aisha Muhammad", "email": "aisha@example.com" },
    "items": [
      {
        "product": { "_id": "664a...", "name": "Premium Silk Hijab", "price": 2500 },
        "quantity": 2,
        "total": 5000,
        "status": "pending"
      }
    ],
    "subtotal": 5000,
    "total": 5000,
    "status": "pending",
    "paymentMethod": "pay_on_delivery",
    "paymentStatus": "pending",
    "createdAt": "2026-06-10T..."
  }
}
```

#### `GET /api/orders`

Get all your orders.

| Query Param | Values                                                          | Description    |
| ----------- | --------------------------------------------------------------- | -------------- |
| `status`    | `pending, confirmed, processing, shipped, delivered, cancelled` | Filter         |
| `page`      | `1`                                                             | Pagination     |
| `limit`     | `20`                                                            | Items per page |

#### `GET /api/orders/:id`

Get a single order by its ID.

#### `GET /api/orders/number/:orderNumber`

Get an order by its human-readable order number (e.g., `HAY-K3M2XZ7`).

#### `PUT /api/orders/:id/cancel`

Cancel an order (only if status is `pending` or `confirmed`). Stock will be restored.

```json
// Request Body (Optional)
{
  "reason": "Changed my mind"
}
```

---

### ⭐ Review Endpoints

**Base:** `/api/reviews`

#### `POST /api/reviews` 🔒

Create a review for a product you purchased.

```json
// Request Body
{
  "product": "664a...",        // Required: Product ObjectId
  "rating": 5,                 // Required: 1-5
  "title": "Beautiful quality", // Optional
  "comment": "The hijab is amazing, great material..."  // Optional
}

// Response (201 Created)
{
  "success": true,
  "message": "Review submitted. Awaiting approval.",
  "data": {
    "isVerifiedPurchase": true,   // Auto-detected if you bought the product
    "isApproved": false,           // Needs admin approval
    ...
  }
}
```

> ⚠️ You can only review a product **once**. One review per product per user.

#### `GET /api/reviews/product/:productId` 🌍 (Public)

Get all approved reviews for a product.

```json
// Response (200 OK)
{
  "success": true,
  "data": [
    {
      "_id": "667d...",
      "user": { "_id": "664a...", "name": "Fatima Umar", "avatar": "" },
      "rating": 5,
      "title": "Beautiful quality",
      "comment": "Amazing material...",
      "isVerifiedPurchase": true,
      "createdAt": "2026-06-10T..."
    }
  ],
  "ratingDistribution": [
    { "_id": 5, "count": 12 },
    { "_id": 4, "count": 3 },
    { "_id": 3, "count": 1 }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 16,
    "pages": 1
  }
}
```

---

### 🛡️ Admin Endpoints

**Base:** `/api/admin` (All routes require **admin role** 🔒🔒)

#### `GET /api/admin/dashboard`

Get full platform statistics:

- Total users, customers, vendors
- Total products, published, pending
- Total orders & revenue
- Pending vendor applications

#### 👥 Vendor Management

| Method | Endpoint                                                  | Description               |
| ------ | --------------------------------------------------------- | ------------------------- |
| `GET`  | `/api/admin/vendors?status=pending&verification=verified` | List vendors with filters |
| `PUT`  | `/api/admin/vendors/:id/verify`                           | Approve/reject vendor     |
| `PUT`  | `/api/admin/vendors/:id/status`                           | Suspend/activate vendor   |
| `PUT`  | `/api/admin/vendors/:id/featured`                         | Toggle featured status    |

**Verify a vendor:**

```json
// PUT /api/admin/vendors/:id/verify
{
  "verificationStatus": "verified", // verified | pending | rejected
  "complianceStatus": "approved", // approved | pending | rejected | suspended
  "commissionRate": 5 // Optional: Override commission %
}
```

#### 📦 Product Management

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| `GET`  | `/api/admin/products?status=pending` | List all products      |
| `PUT`  | `/api/admin/products/:id/status`     | Approve/reject product |
| `PUT`  | `/api/admin/products/:id/featured`   | Toggle featured        |

**Approve a product:**

```json
// PUT /api/admin/products/:id/status
{
  "status": "published", // published | rejected | archived
  "adminNotes": "Good quality product, approved"
}
```

#### 📋 Order Management

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| `GET`  | `/api/admin/orders`            | List all orders     |
| `PUT`  | `/api/admin/orders/:id/status` | Update order status |

**Update order:**

```json
// PUT /api/admin/orders/:id/status
{
  "status": "shipped",
  "trackingNumber": "TRACK123456",
  "adminNotes": "Shipped via DHL"
}
```

#### 👤 User Management

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| `GET`  | `/api/admin/users?role=vendor` | List users (filter by role) |
| `PUT`  | `/api/admin/users/:id/status`  | Activate/deactivate user    |

#### ⭐ Review Management

| Method | Endpoint                        | Description           |
| ------ | ------------------------------- | --------------------- |
| `GET`  | `/api/admin/reviews`            | List all reviews      |
| `PUT`  | `/api/admin/reviews/:id/status` | Approve/reject review |

**Approve a review:**

```json
// PUT /api/admin/reviews/:id/status
{
  "isApproved": true,
  "adminReply": "Thank you for your review!"
}
```

---

## ⚠️ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    // Only for validation errors
    { "field": "email", "message": "Please provide a valid email" }
  ],
  "stack": "..." // Only in development mode
}
```

### Common HTTP Status Codes

| Code  | Meaning         | When                                             |
| ----- | --------------- | ------------------------------------------------ |
| `200` | ✅ Success      | GET, PUT requests succeeded                      |
| `201` | ✅ Created      | POST request succeeded (resource created)        |
| `400` | ❌ Bad Request  | Invalid input, validation error, duplicate entry |
| `401` | ❌ Unauthorized | No token or invalid token                        |
| `403` | ❌ Forbidden    | Wrong role (e.g., customer trying vendor routes) |
| `404` | ❌ Not Found    | Resource doesn't exist                           |
| `500` | ❌ Server Error | Something went wrong on the server               |

### Common Error Messages

```json
// Missing authentication
{ "success": false, "message": "Not authorized to access this route. No token provided." }

// Wrong role
{ "success": false, "message": "Role 'customer' is not authorized to access this route." }

// Validation
{ "success": false, "message": "Validation failed", "errors": [{ "field": "name", "message": "Please provide a name" }] }

// Duplicate
{ "success": false, "message": "Duplicate value for email. This email already exists." }

// Not found
{ "success": false, "message": "Product not found" }
```

---

## 🔄 Typical User Flows

### 🛍️ Customer Flow

```
Register → Browse products → Add to cart → Place order → Track order → Review products
```

### 🏪 Vendor Flow

```
Register → Apply as vendor → Wait for admin approval
→ Create products → Wait for product approval
→ Fulfill orders → Get paid → Manage dashboard
```

### 🛡️ Admin Flow

```
Login → Dashboard → Approve/reject vendors → Approve products
→ Manage categories → Monitor orders → Manage users & reviews
```

---

## 🔧 Utility Information

### Pagination

All list endpoints support pagination with this response format:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "pages": 5
  }
}
```

### Islamic Tags Available

| Tag              | Usage                           |
| ---------------- | ------------------------------- |
| `Halal`          | Halal-certified products        |
| `Modest`         | Modest clothing and accessories |
| `Prayer_Related` | Prayer mats, tasbih, etc.       |
| `Quranic`        | Quran and Islamic books         |
| `Sunnah`         | Sunnah-recommended items        |
| `Islamic_Gift`   | Gifts for Islamic occasions     |
| `Eid`            | Eid-related products            |
| `Ramadan`        | Ramadan specials                |
| `Hajj`           | Hajj essentials                 |
| `Umrah`          | Umrah necessities               |
| `Charity`        | Charity/donation products       |
| `Family`         | Family-oriented items           |

### Vendor Specialties Available

| Specialty            | Description                       |
| -------------------- | --------------------------------- |
| `Islamic_Clothing`   | Hijabs, abayas, thobes, kufis     |
| `Prayer_Items`       | Prayer mats, tasbih, Quran stands |
| `Quran_&_Books`      | Quran copies, Islamic literature  |
| `Halal_Food`         | Halal groceries, snacks           |
| `Islamic_Home_Decor` | Islamic wall art, decor           |
| `Personal_Care`      | Halal perfumes, skincare          |
| `Gifts_&_Souvenirs`  | Islamic gifts                     |
| `Digital_Products`   | eBooks, courses                   |
| `Other`              | Other Islamic products            |

---

## 💡 Tips for Frontend Developers

1. **Always check `success`** - It's `true` or `false`
2. **Store the token** - In localStorage or secure httpOnly cookies
3. **Token expiry** - Default is 7 days. When you get a 401, redirect to login
4. **Pagination** - Use the `pagination` object for infinite scroll / page buttons
5. **Image URLs** - Product images are stored as relative paths like `/uploads/products/abc.jpg`. Prepend with the base URL `http://localhost:5000`
6. **Vendor verification** - Check `vendor.verificationStatus === 'verified'` before showing "Add Product" button
7. **Stock management** - Disable "Add to Cart" when `product.stock === 0`

---

<div align="center">
  <p>Built with ❤️ for the Muslim Ummah</p>
  <p>📍 Nigeria</p>
</div>
