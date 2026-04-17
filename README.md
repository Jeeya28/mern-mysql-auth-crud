# MERN Stack Authentication & CRUD App (MySQL)

A full-stack web application with user authentication, JWT-based authorization, and a complete dashboard with CRUD operations. Built with React.js, Node.js/Express.js, and MySQL.

## Features
- User registration and login with JWT authentication
- Password reset via email (Nodemailer + Gmail)
- Dashboard with item management (Create, Read, Update, Delete)
- Search and filter items by title/description/status
- Pagination for item lists
- Export items to CSV
- Profile management (update name, email, phone, change password)
- Statistics cards (total, active, pending, completed counts)
- Protected routes (redirect to login if unauthenticated)
- Fully responsive design with Tailwind CSS

## Tech Stack
**Frontend:** React.js, React Router v7, Axios, Tailwind CSS, Vite  
**Backend:** Node.js, Express.js v5, MySQL2, bcryptjs, jsonwebtoken, Nodemailer  
**Database:** MySQL

## Prerequisites
- Node.js v20+
- MySQL Server running locally (or XAMPP/WAMP)
- Gmail account with App Password enabled (for email features)

## Database Setup

1. Start your MySQL server
2. Open MySQL Workbench or run MySQL in terminal
3. Execute the SQL schema:

```bash
mysql -u root -p < database.sql
```

Or manually run the contents of `database.sql` in MySQL Workbench.

4. Verify tables were created:
```sql
USE mern_auth_db;
SHOW TABLES;
-- Should show: items, users
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App passwords. Generate one for "Mail".

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login and get JWT token | No |
| POST | `/forgot-password` | Send password reset email | No |
| POST | `/reset-password` | Reset password with token | No |
| GET | `/me` | Get current user info | Yes |
| PUT | `/profile` | Update profile (name, email, phone) | Yes |
| PUT | `/change-password` | Change password | Yes |

### Item Routes (`/api/items`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all items (supports ?search=&status=&page=&limit=) | Yes |
| GET | `/stats` | Get item statistics | Yes |
| GET | `/:id` | Get single item | Yes |
| POST | `/` | Create new item | Yes |
| PUT | `/:id` | Update item | Yes |
| DELETE | `/:id` | Delete item | Yes |

## Screenshots

See the `screenshots/` folder for:
- Login page
- Registration page
- Dashboard with items
- Search and filter
- Add/Edit item
- Delete confirmation
- MySQL database tables

## Security Notes
- All passwords are hashed with bcryptjs (salt rounds: 10)
- JWT tokens expire after 7 days
- All SQL queries use parameterized statements (prevents SQL injection)
- CORS enabled for frontend origin
- `.env` file is never committed to Git