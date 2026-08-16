# IT Support Ticket System

A full-stack ticket management platform that lets students, faculty, and IT staff submit, track, and resolve technical support issues through a role-based web portal.

## Overview

Users submit support tickets with a category, priority, and description. IT staff and admins get a dashboard to view, assign, and update tickets, with a threaded comment system for internal notes and user-facing updates. Access is role-based across three tiers: **student**, **faculty**, and **admin**.

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- TanStack Query for server state
- Wouter for routing
- React Hook Form + Zod for form validation

**Backend**
- Node.js + Express.js (TypeScript, ES modules)
- Drizzle ORM with PostgreSQL
- Session-based authentication (Passport.js)
- Zod schema validation on all API inputs

**Database**
- PostgreSQL (Neon-compatible serverless driver)
- Schema managed via Drizzle Kit migrations

## Features

- Role-based access control (student / faculty / admin)
- Ticket creation with issue type, priority, and location
- Admin dashboard with ticket assignment and status tracking (`new → in-progress → resolved → closed`)
- Threaded comments per ticket, with an internal-only visibility flag for IT staff notes
- Aggregated stats endpoint for dashboard analytics
- Demo mode for exploring the app without authentication

## Project Structure

```
client/          React frontend (components, pages, hooks)
server/          Express backend (routes, storage layer, auth)
shared/          Shared TypeScript types & Drizzle schema (used by both client and server)
```

## Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

### Setup

```bash
git clone https://github.com/Anushtha30/-IT-Support-Ticket-System-Full-Stack-Project.git
cd -IT-Support-Ticket-System-Full-Stack-Project
npm install
```

Push the schema to your database:

```bash
npm run db:push
```

### Run locally

```bash
npm run dev
```

The app runs on `http://localhost:5000`.

### Build for production

```bash
npm run build
npm run start
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/user` | Get current authenticated user |
| POST | `/api/tickets` | Create a new ticket |
| GET | `/api/tickets` | List tickets (own tickets, or all for admins) |
| GET | `/api/tickets/:id` | Get a single ticket |
| PATCH | `/api/tickets/:id` | Update ticket status/assignment (admin only) |
| POST | `/api/tickets/:id/comments` | Add a comment to a ticket |
| GET | `/api/tickets/:id/comments` | List a ticket's comments |
| GET | `/api/stats` | Get ticket statistics for the current user/role |
| GET | `/api/it-staff` | List IT staff (admin only) |

## Database Schema

Four core tables, defined in `shared/schema.ts`:
- **users** — profile data + role (`student`, `faculty`, `admin`)
- **tickets** — subject, description, issue type, priority, status, submitter/assignee
- **ticket_comments** — threaded comments, with an `isInternal` flag
- **sessions** — server-side session storage

## License

MIT
