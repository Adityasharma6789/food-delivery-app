# SwiftBite Database Configuration

This directory contains the data files and configurations for the SwiftBite application.

## Fallback JSON Database Mode
If the application is started without a local MongoDB instance running, the backend automatically transitions to a **Local JSON File Database** mode. This mode writes data directly to files in this directory:
- `users.json`: Holds registered user profiles, passwords (hashed), and shipping locations.
- `foods.json`: Houses the dynamic menu, dishes, prices, ratings, and classifications.
- `orders.json`: Stores all placed orders, cart list, receipt totals, and tracking states.

## Default Accounts
On startup, the system automatically checks and registers two default accounts for testing:

### Standard Customer Account
- **Email:** `user@example.com`
- **Password:** `password123`
- **Address:** `123 Main St, New York, NY`

### Administrative Account
- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Address:** `Headquarters, New York, NY`
- **Permissions:** Can manage food catalogs and update order delivery statuses.
