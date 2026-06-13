# 🌙 Hayaa - Multi-Vendor Islamic Ecommerce API

<div align="center">
  <h3>A Sharia-Compliant Ecommerce Platform Backend</h3>
  <p>Built with Node.js, Express, MySQL & Sequelize ORM</p>

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
- [Database Models Overview](#-database-models-overview)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MySQL** v8+ (running locally or on VPS)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd hayaa-ecommerce-backend-node

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env file with your MySQL credentials

# 4. Create the database (MySQL must be running)
# The app can auto-create it, or do it manually:
# mysql -u root -p -e "CREATE DATABASE hayaa_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Run migrations to create all tables
npm run migrate

# 6. Start the server
npm run dev    # Development (with auto-restart via nodemon)
# OR
npm start      # Production
```

The server will start at `http://localhost:5000`.

### Quick Test

```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"08012345678"}'
```

---

## 🗄️ MySQL Setup Guide

### 💻 Local Setup (Windows)

#### Option 1: Install MySQL Installer (Recommended)

```bash
# 1. Download MySQL Installer from:
#    https://dev.mysql.com/downloads/installer/

# 2. Run the installer, choose "Developer Default"

# 3. During setup:
#    - Set root password (save it!)
#    - MySQL runs as a Windows service automatically
#    - Default port: 3306

# 4. Verify installation:
mysql --version
```

#### Option 2: Use XAMPP (Easiest for Beginners)

```bash
# 1. Download XAMPP from: https://www.apachefriends.org/

# 2. Install and open XAMPP Control Panel

# 3. Click "Start" on MySQL

# 4. MySQL runs on port 3306 with default user: root, no password
```

### 🐧 Linux VPS Setup (Ubuntu/Debian)

```bash
# SSH into your VPS
ssh your_user@your_vps_ip

# Install MySQL
sudo apt update
sudo apt install mysql-server -y

# Secure MySQL
sudo mysql_secure_installation

# Check status
sudo systemctl status mysql
```

### Creating the Database & User

```sql
-- Connect to MySQL
sudo mysql

-- Create database
CREATE DATABASE hayaa_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create user (change password!)
CREATE USER 'hayaa_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON hayaa_ecommerce.* TO 'hayaa_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### Your `.env` file should look like:

```env
PORT=5000
NODE_ENV=development

# For local XAMPP (no password):
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=hayaa_ecommerce
# DB_USER=root
# DB_PASSWORD=

# For MySQL with password:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hayaa_ecommerce
DB_USER=hayaa_user
DB_PASSWORD=your_strong_password

# JWT
JWT_SECRET=hayaa_super_secret_jwt_key_2026
JWT_EXPIRE=7d
```

---

## 📋 Migration System (Like Laravel's Artisan Migrate)

This project uses **Sequelize CLI** for database migrations - similar to Laravel's `php artisan migrate`.

### Available Commands

| Command                          | Purpose                     | Laravel Equivalent             |
| -------------------------------- | --------------------------- | ------------------------------ |
| `npm run migrate`                | Run all pending migrations  | `php artisan migrate`          |
| `npm run migrate:undo`           | Undo the last migration     | `php artisan migrate:rollback` |
| `npm run migrate:undo:all`       | Undo all migrations         | `php artisan migrate:reset`    |
| `npm run migrate:create -- name` | Create a new migration file | `php artisan make:migration`   |
| `npm run seed:all`               | Run database seeders        | `php artisan db:seed`          |
| `npm run seed:create -- name`    | Create a seeder file        | `php artisan make:seeder`      |

### Example: Adding a New Column

**1. Create a migration:**

```bash
npm run migrate:create -- add_loyalty_points_to_users
```

**2. Edit the generated file in `migrations/`:**

```javascript
// migrations/20260613123456-add_loyalty_points_to_users.js
"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "loyaltyPoints", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "loyaltyPoints");
  },
};
```

**3. Run the migration:**

```bash
npm run migrate
```

**4. Update the model** in `models/User.js`:

```javascript
loyaltyPoints: {
  type: DataTypes.INTEGER,
  defaultValue: 0
}
```

---

## 🔐 Authentication Guide

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
    "id": 1,                         # Note: integer, not ObjectId!
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

```
1. Register as customer → 2. Apply as vendor → 3. Admin approves → 4. Start selling!
```

---

## 📖 API Reference

---

### 🧑‍💻 Auth Endpoints

**Base:** `/api/auth`

#### `POST /api/auth/register`

Register a new user account.

```json
// Request Body
{
  "name": "Aisha Muhammad",
  "email": "aisha@example.com",
  "password": "password123",
  "phone": "08012345678"
}

// Response (201 Created)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
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
    "id": 1,
    "name": "Aisha Muhammad",
    "email": "aisha@example.com",
    "role": "vendor",
    "avatar": "",
    "vendor": {
      "id": 1,
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

#### `DELETE /api/auth/addresses/:index` 🔒

Delete a shipping address by its array index (0, 1, 2, etc.).

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
    "complianceStatus": "pending"
  }
}
```

#### `GET /api/vendors/profile` 🔒 (Vendor only)

Get your vendor profile with stats.

#### `PUT /api/vendors/profile` 🔒 (Vendor only)

Update your store details.

#### `GET /api/vendors/dashboard` 🔒 (Vendor only)

Get dashboard with: total/published/pending products, low stock alerts, recent orders, revenue.

#### `GET /api/vendors/orders` 🔒 (Vendor only)

Get orders containing your products.

| Query Param | Values                                                          | Description           |
| ----------- | --------------------------------------------------------------- | --------------------- |
| `status`    | `pending, confirmed, processing, shipped, delivered, cancelled` | Filter by item status |
| `page`      | `1, 2, 3...` (default: 1)                                       | Pagination            |
| `limit`     | `10, 20, 50...` (default: 20)                                   | Items per page        |

#### `PUT /api/vendors/orders/:orderId/items/:itemIndex` 🔒 (Vendor only)

Update the status of a specific item (by array index).

```json
// Request Body
{
  "status": "shipped"
}
```

#### `GET /api/vendors/store/:slug` 🌍 (Public)

View a public vendor store page with all their published products.

| Query Param | Values                                            | Description    |
| ----------- | ------------------------------------------------- | -------------- |
| `page`      | default: 1                                        | Pagination     |
| `limit`     | default: 20                                       | Items per page |
| `sort`      | `-createdAt`, `price`, `-price`, `-averageRating` | Sort order     |

---

### 📦 Product Endpoints

**Base:** `/api/products`

#### `GET /api/products` 🌍 (Public)

Get all published products with powerful filtering.

| Query Param  | Example                                           | Description                   |
| ------------ | ------------------------------------------------- | ----------------------------- |
| `page`       | `1`                                               | Page number                   |
| `limit`      | `20`                                              | Items per page                |
| `sort`       | `-createdAt`, `price`, `-price`, `-averageRating` | Sort order                    |
| `category`   | `1`                                               | Filter by category ID         |
| `minPrice`   | `500`                                             | Minimum price                 |
| `maxPrice`   | `5000`                                            | Maximum price                 |
| `search`     | `hijab`                                           | Search by name & description  |
| `isHalal`    | `true`                                            | Filter by Halal certification |
| `islamicTag` | `Eid`, `Ramadan`, `Modest`                        | Filter by Islamic tag         |
| `vendor`     | `1`                                               | Filter by vendor ID           |

```json
// Response (200 OK)
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "name": "Premium Silk Hijab",
      "slug": "premium-silk-hijab",
      "price": 2500,
      "comparePrice": 3000,
      "discount": 17,
      "images": [{ "url": "...", "isPrimary": true }],
      "isHalal": true,
      "islamicTags": ["Modest", "Eid"],
      "averageRating": 4.5,
      "category": { "id": 1, "name": "Hijabs", "slug": "hijabs" },
      "vendor": {
        "id": 1,
        "storeName": "Aisha's Hijab Store",
        "storeSlug": "aishas-hijab-store"
      }
    }
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
  "category": 1,
  "images": [
    { "url": "/uploads/products/abc.jpg", "alt": "Hijab front view", "isPrimary": true }
  ],
  "isHalal": true,
  "islamicTags": ["Modest", "Eid", "Ramadan"],
  "weight": 0.2,
  "isFreeShipping": false,
  "shippingPrice": 500
}

// Response (201 Created)
{
  "success": true,
  "message": "Product created successfully. Awaiting admin approval.",
  "data": {
    "status": "pending",
    ...
  }
}
```

> **⚠️ Important:** New products are created with `status: "pending"` and must be approved by an admin.

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

#### `GET /api/categories` 🌍 (Public)

Get all active categories with subcategories.

| Query Param   | Values                                                | Description              |
| ------------- | ----------------------------------------------------- | ------------------------ |
| `islamicType` | `Clothing_&_Modest_Fashion`, `Prayer_&_Worship`, etc. | Filter by Islamic type   |
| `isFeatured`  | `true`, `false`                                       | Featured categories only |

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
  "parent": null,
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
    "id": 1,
    "userId": 1,
    "items": [
      {
        "product": 1,
        "quantity": 2,
        "price": 2500,
        "total": 5000,
        "productDetails": {
          "id": 1,
          "name": "Premium Silk Hijab",
          "slug": "premium-silk-hijab",
          "price": 2500,
          "images": [{ "url": "...", "isPrimary": true }],
          "vendor": { "storeName": "Aisha's Hijab Store" }
        }
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

Add an item to your cart.

```json
// Request Body
{
  "productId": 1,
  "quantity": 2,
  "variant": {
    "name": "Color",
    "value": "Black"
  }
}
```

#### `PUT /api/cart/:itemIndex`

Update the quantity of a cart item by array index.

```json
// Request Body
{
  "quantity": 3
}
```

#### `DELETE /api/cart/:itemIndex`

Remove a specific item from cart by array index.

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
  "paymentMethod": "pay_on_delivery",
  "notes": "Please deliver between 2-5pm"
}
```

#### `GET /api/orders`

Get your orders with pagination.

| Query Param | Values                                                          | Description    |
| ----------- | --------------------------------------------------------------- | -------------- |
| `status`    | `pending, confirmed, processing, shipped, delivered, cancelled` | Filter         |
| `page`      | default: 1                                                      | Pagination     |
| `limit`     | default: 20                                                     | Items per page |

#### `GET /api/orders/:id`

Get a single order by ID.

#### `GET /api/orders/number/:orderNumber`

Get an order by its order number (e.g., `HAY-K3M2XZ7`).

#### `PUT /api/orders/:id/cancel`

Cancel your order (only if status is `pending` or `confirmed`).

```json
// Request Body
{
  "reason": "Changed my mind"
}
```

---

### ⭐ Review Endpoints

**Base:** `/api/reviews`

#### `POST /api/reviews` 🔒

Submit a review for a product you've purchased.

```json
// Request Body
{
  "product": 1,
  "rating": 4,
  "title": "Great quality",
  "comment": "The hijab material is very soft and comfortable."
}
```

#### `GET /api/reviews/product/:productId` 🌍 (Public)

Get approved reviews for a product with rating distribution.

---

### 👑 Admin Endpoints

**Base:** `/api/admin` (All routes require admin role 🔒)

#### `GET /api/admin/dashboard`

Get platform statistics.

#### Vendor Management

| Method | Endpoint                          | Description                                         |
| ------ | --------------------------------- | --------------------------------------------------- |
| `GET`  | `/api/admin/vendors`              | List all vendors (filter: `status`, `verification`) |
| `PUT`  | `/api/admin/vendors/:id/verify`   | Approve/reject vendor                               |
| `PUT`  | `/api/admin/vendors/:id/status`   | Suspend/activate vendor                             |
| `PUT`  | `/api/admin/vendors/:id/featured` | Toggle featured vendor                              |

#### Product Management

| Method | Endpoint                           | Description                          |
| ------ | ---------------------------------- | ------------------------------------ |
| `GET`  | `/api/admin/products`              | List all products (filter: `status`) |
| `PUT`  | `/api/admin/products/:id/status`   | Approve/reject product               |
| `PUT`  | `/api/admin/products/:id/featured` | Toggle featured product              |

#### Order Management

| Method | Endpoint                       | Description                        |
| ------ | ------------------------------ | ---------------------------------- |
| `GET`  | `/api/admin/orders`            | List all orders (filter: `status`) |
| `PUT`  | `/api/admin/orders/:id/status` | Update order status + tracking     |

#### User Management

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| `GET`  | `/api/admin/users`            | List all users (filter: `role`) |
| `PUT`  | `/api/admin/users/:id/status` | Activate/deactivate user        |

#### Review Management

| Method | Endpoint                        | Description                             |
| ------ | ------------------------------- | --------------------------------------- |
| `GET`  | `/api/admin/reviews`            | List all reviews (filter: `isApproved`) |
| `PUT`  | `/api/admin/reviews/:id/status` | Approve/reject review + admin reply     |

---

## ⚠️ Error Handling

```json
// Validation Error (400)
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email must be valid" }
  ]
}

// Not Found (404)
{
  "success": false,
  "message": "Product not found"
}

// Unauthorized (401)
{
  "success": false,
  "message": "Not authorized to access this route"
}

// Forbidden (403)
{
  "success": false,
  "message": "Role 'customer' is not authorized to access this route"
}

// Server Error (500) - Only shows stack in development
{
  "success": false,
  "message": "Something went wrong",
  "stack": "Error: ..." // Only in NODE_ENV=development
}
```

---

## 📊 Database Models Overview

### Entity Relationship Diagram (ERD)

```
Users ──┬── Vendors  (1-to-1: user has one vendor)
        ├── Carts    (1-to-1: user has one cart)
        ├── Orders   (1-to-many: user has many orders)
        └── Reviews  (1-to-many: user writes many reviews)

Vendors ── Products (1-to-many: vendor sells many products)
        └── Reviews  (vendor receives many reviews)

Categories ─┬── Products (parent category has many products)
             └── Categories (self-referencing: category has subcategories)
```

### 7 Database Tables

| Table          | Key Fields                                                             | Description                       |
| -------------- | ---------------------------------------------------------------------- | --------------------------------- |
| **Users**      | id, name, email, password, role, isActive                              | Customers, vendors & admins       |
| **Vendors**    | id, userId, storeName, storeSlug, complianceStatus, verificationStatus | Store profiles                    |
| **Categories** | id, name, slug, parentId, islamicType                                  | Product categories with hierarchy |
| **Products**   | id, vendorId, name, slug, price, stock, categoryId, status             | Products for sale                 |
| **Carts**      | id, userId, items (JSON), subtotal, total                              | Shopping carts                    |
| **Orders**     | id, userId, orderNumber, items (JSON), status, total                   | Customer orders                   |
| **Reviews**    | id, userId, productId, rating, isApproved                              | Product reviews                   |

---

## 🚀 VPS Deployment

```bash
# 1. SSH into your VPS
ssh your_user@your_vps_ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install nodejs -y

# 3. Install MySQL
sudo apt install mysql-server -y

# 4. Clone & setup project
git clone <repo-url>
cd hayaa-ecommerce-backend-node
npm install
cp .env.example .env
nano .env   # Set your DB credentials & JWT secret

# 5. Create database & run migrations
# Create DB in MySQL first, then:
npm run migrate

# 6. Install PM2 to keep app running
sudo npm install -g pm2
pm2 start server.js --name hayaa-api
pm2 save
pm2 startup   # Auto-start on reboot

# 7. (Optional) Set up Nginx reverse proxy
# See the guide in your .env.example notes
```

---

## 📝 Common Commands Cheatsheet

```bash
npm install          # Install dependencies
npm start            # Start production server
npm run dev          # Start dev server (auto-reload)
npm run migrate      # Run database migrations
npm run migrate:undo # Rollback last migration
npm run migrate:create -- add_coupons_table  # Create new migration
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8+
- **ORM:** Sequelize 6
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer
- **Password Hashing:** bcryptjs
- **Migrations:** Sequelize CLI
