# replit.md

## Overview

This is a university IT support portal application built with a modern full-stack architecture. The system allows students, faculty, and IT staff to manage support tickets efficiently through a web-based interface with role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit OIDC integration with session-based auth
- **Session Storage**: PostgreSQL with connect-pg-simple

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Centralized in `shared/schema.ts` for type safety
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Authentication System
- **Provider**: Replit OIDC for seamless integration
- **Session Management**: Express sessions stored in PostgreSQL
- **Authorization**: Role-based access (student, faculty, admin)
- **Session Security**: HTTP-only cookies with secure flags

### Database Schema
- **Users Table**: Stores user profiles with role-based permissions
- **Tickets Table**: Core ticket management with status tracking
- **Comments Table**: Threaded comments with internal/external visibility
- **Sessions Table**: Secure session storage for authentication

### API Structure
- **RESTful Design**: Express routes with proper HTTP methods
- **Input Validation**: Zod schemas for request validation
- **Error Handling**: Centralized error middleware
- **Type Safety**: Shared TypeScript interfaces between client/server

### UI Components
- **Design System**: shadcn/ui with Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA-compliant components
- **Theme Support**: CSS custom properties for light/dark modes

## Data Flow

1. **Authentication Flow**:
   - User accesses application → Replit OIDC redirect → Session creation → User profile lookup/creation

2. **Ticket Creation Flow**:
   - Form submission → Validation → Database insertion → Real-time UI update

3. **Ticket Management Flow**:
   - Role-based ticket filtering → Status updates → Comment system → Notification handling

4. **Admin Dashboard Flow**:
   - Aggregated statistics → Ticket assignment → IT staff management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with edge compatibility
- **drizzle-orm**: Type-safe database operations
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **express-session**: Session management middleware

### Development Dependencies
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundling for production

### Replit Integration
- **Replit Auth**: OIDC authentication provider
- **Development Tools**: Hot reload and debugging integration

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Full-stack development with file watching
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite build output to `dist/public`
- **Backend**: ESBuild compilation to `dist/index.js`
- **Static Assets**: Served through Express with proper caching

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Authentication**: Replit OIDC configuration
- **Sessions**: Secure session secret configuration

## Changelog
```
Changelog:
- July 17, 2025. Complete IT support ticket system built with:
  * User authentication via Replit OIDC
  * Role-based access control (student/faculty/admin)
  * Ticket submission with priority levels and categories
  * Admin dashboard for ticket management
  * Comment system with internal/external visibility
  * PostgreSQL database with complete schema
  * Responsive UI with shadcn/ui components
- July 04, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```