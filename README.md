# Smashed Burger

A modern, responsive burger ordering web application built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

Smashed Burger provides an interactive food-ordering experience with a dynamic menu, animated product displays, authentication, cart management, and Supabase-powered data and image storage.

---

## Features

### Interactive Menu

* Browse burgers, fries, and drinks
* Menu items are loaded dynamically from Supabase
* Product information includes:

  * Name
  * Description
  * Price
  * Product image
* Only currently available menu items are displayed
* Products can be ordered using their configured display order

### Animated Product Carousel

The menu uses an interactive **3D coverflow-style carousel**.

Users can:

* Drag between products
* Navigate using arrow buttons
* Use keyboard arrow keys
* View the selected item's details
* Add the selected item directly to the cart

### Shopping Cart

Authenticated users can maintain their own cart.

Cart functionality includes:

* Add items to cart
* Increase item quantity
* Decrease item quantity
* Remove items
* Automatically remove items when quantity reaches zero
* Calculate subtotal dynamically
* Display the current cart item count in the navigation bar
* Continue to the checkout flow

Cart information is stored using Supabase.

### Authentication

Authentication is powered by **Supabase Auth**.

The application currently supports:

* User registration
* Email and password login
* Logout
* Authentication state tracking
* Email confirmation support
* Protected cart functionality
* Account navigation for logged-in users

Users who attempt to order without being logged in are prompted to sign in first.

### Supabase Storage

Product images are stored and loaded using **Supabase Storage**.

The homepage can dynamically load burger and fries images from storage and randomly select products for the animated hero section.

Menu items can also reference their respective Supabase storage bucket and image file.

### Animated Landing Page

The homepage includes:

* Animated hero content
* Dynamic product imagery
* Motion-based interactions
* Burger and fries imagery loaded from Supabase
* Links to the menu and burger-building experience
* Responsive desktop and mobile layouts

### 📱 Responsive Design

The interface is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

Navigation automatically adapts between desktop and mobile layouts.

---

## Tech Stack

| Technology         | Purpose                               |
| ------------------ | ------------------------------------- |
| **Next.js 16**     | Application framework                 |
| **React 19**       | User interface                        |
| **TypeScript**     | Type-safe development                 |
| **Tailwind CSS 4** | Styling and responsive design         |
| **Supabase**       | Authentication, database, and storage |
| **Motion**         | UI animations and transitions         |
| **Lucide React**   | Interface icons                       |
| **React Icons**    | Additional icons                      |
| **OGL**            | WebGL/visual effects support          |
| **ESLint**         | Code quality and linting              |

---

## Project Structure

```text
smashed-burger/
│
├── app/
│   ├── auth/
│   │   └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── menu/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── footer/
│   ├── hero/
│   ├── navbar/
│   └── ui/
│
├── lib/
│   └── supabase.ts
│
├── public/
│   └── images/
│
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

---
<h1 align="center">Welcome to smashed-burger 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
</p>

## Install

### Prerequisites

Before running the project, make sure you have:

* Node.js installed
* npm installed
* A Supabase project configured

---

## 1. Clone the Repository

```bash
git clone https://github.com/asamad252/smashed-burger.git
```

Move into the project directory:

```bash
cd smashed-burger
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```text
.env.local
```

Add your Supabase project configuration:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The application reads these variables from:

```text
lib/supabase.ts
```

---

## 4. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

in your browser.

---

## Supabase Setup

The application expects a Supabase backend for authentication, menu data, cart data, and image storage.

### Authentication

Enable **Email/Password authentication** from your Supabase project.

The application uses Supabase Auth for:

```text
Login
Registration
Session management
Logout
```

---

## Menu Data

The application reads products from a table named:

```text
menu_items
```

The frontend currently expects fields similar to:

```text
id
name
category
price
description
storage_bucket
image_name
available
sort_order
```

Supported product categories are:

```text
burger
fries
drink
```

The `available` field determines whether an item should appear on the menu.

The `sort_order` field controls the order in which products are returned.

---

## Cart Data

User carts are stored in:

```text
cart_items
```

The application works with information including:

```text
id
user_id
menu_item_id
quantity
created_at
updated_at
```

Each cart item is connected to a menu item.

This allows the application to retrieve the product:

* Name
* Price
* Image
* Storage location

when displaying the cart.

---

## Add-to-Cart Function

The menu uses a Supabase database function/RPC named:

```text
add_to_cart
```

It is called with:

```text
p_menu_item_id
```

This allows cart updates to be handled through the database while the frontend receives the updated cart count.

---

## Storage

Supabase Storage is used for product media.

The homepage currently retrieves imagery from storage buckets such as:

```text
burger
fries
```

Menu items can specify their image location using:

```text
storage_bucket
image_name
```

The application then generates the corresponding public storage URL automatically.

---

## Ordering Flow

The current ordering flow is designed around:

```text
Homepage
   ↓
Menu
   ↓
Select Product
   ↓
Login / Register
   ↓
Add to Cart
   ↓
Manage Quantities
   ↓
Cart
   ↓
Checkout
```

Users can still browse the menu without authentication, but authentication is required before adding products to a user cart.

---

## Navigation

The main navigation includes links for:

```text
Home
Menu
Build
About
Cart
Authentication / Account
```

The navigation bar also tracks authentication state and displays the user's current cart count.

---

## Design System

The project uses a distinctive burger-brand-inspired color palette.

Primary colors include:

```text
Maroon:  #8B2626
Orange:  #EF6905
Cream:   #F1E5A1
Green:   #486C2F
```

The UI combines:

* Rounded components
* Strong typography
* Product-focused layouts
* Animated transitions
* Hover interactions
* Responsive navigation
* 3D product presentation

---

## Available Scripts

### Development

```bash
npm run dev
```

Runs the Next.js development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build.

### Start Production Server

```bash
npm run start
```

Runs the production build.

### Lint

```bash
npm run lint
```

Runs ESLint to check the project for code-quality issues.

---

## Security Notes

When working with Supabase:

* Keep privileged database keys private
* Never expose a Supabase service-role key in frontend code
* Keep sensitive credentials inside environment variables
* Do not commit `.env.local`
* Configure appropriate Supabase Row Level Security policies
* Restrict cart records so users can only access their own data
* Validate database operations on the backend/database layer

Only values intentionally designed for browser use should use the `NEXT_PUBLIC_` prefix.

---

## Deployment

The project can be deployed to platforms that support Next.js applications, such as **Vercel**.

Before deployment, configure the following environment variables on the hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Then create the production build with:

```bash
npm run build
```

---

## Project Highlights

Smashed Burger demonstrates practical implementation of:

* Modern React development
* Next.js App Router
* TypeScript
* Responsive UI development
* Supabase authentication
* Database-driven interfaces
* Supabase Storage
* User-specific shopping carts
* Database RPC calls
* Animated interfaces
* Custom interactive carousels
* Component-based architecture

---

## Project Status

The application is actively structured as a full burger-ordering experience, with the core menu, authentication, product storage, navigation, and shopping-cart functionality integrated with Supabase.

Additional ordering and burger-customization functionality can continue to be expanded as the project develops.
```sh
npm install
```

## Usage

```sh
npm run start
```

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
