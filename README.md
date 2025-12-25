# ERP System 💻

1. Overview   
2. Application Technologies 
3. Project Structure 
4. Database and Row Level Security (RLS)
5. Supabase Functions and Triggers
6. Authorization and Permission Rules
7. Deployment and Environments
8. Core Application Flows
9. Contribution Guidelines and Best Practices
10. Roadmap / Future Improvements
11. Local Development
12. Scripts

## 1. Overview 

This ERP system was designed to centralize all company data and operational workflows in a single platform.  
The project originated from a real business need to automate processes that were previously handled manually.

The system allows users to:
- Create and manage sales;
- Manage customer orders;
- Control product inventory;
- Track production status;
- Monitor sales metrics and operational indicators in real time.

The architecture prioritizes scalability, security, and clear separation of responsibilities between user roles.

## 2. Application Technologies

**Languages**
- TypeScript (frontend, server actions, and utilities)
- SQL (PostgreSQL via Supabase)

**Frontend**
- Next.js (App Router) for routing, server components, and server actions
- React for UI composition
- TailwindCSS + clsx for styling
- Recharts for data visualization

**Backend**
- Supabase Auth for authentication
- Supabase Postgres for persistent storage
- Row Level Security (RLS) for authorization at the database level
- Supabase Edge Functions (when server-side workflows are required)

**Infrastructure**
- Vercel for the web app
- Supabase for database and auth services

## 3. Project Structure
```
/app
├─ /(private)             → Authenticated routes
├ ├─ /customers           → Customer management
├ ├─ /dashboard           → KPIs, charts, and rankings
├ ├─ /orders              → Order workflow and details
├ ├─ /products            → Product catalog and inventory
├ ├─ /profile             → User profile
├ ├─ /sales               → Sales workflow
├ └─ /users               → User administration
├─ /actions               → Server actions (data mutations)
├─ /components            → Reusable UI components
├─ /login                 → Public authentication page
├─ /types                 → Global TypeScript types
├─ /utils                 → Utility functions and Supabase clients
├─ /public                → Static assets
```

## 4. Database and Row Level Security (RLS)

This project uses Supabase with PostgreSQL, authentication, and RLS. The database is the system of record, and access rules are enforced directly in SQL policies rather than in ad-hoc API logic. This keeps data access consistent across server actions, client reads, and any future integrations.

## 5. Supabase Functions and Triggers

Supabase acts as the backend runtime for server-side business logic that should not live in the client. In this project, its responsibilities fall into two categories:

**Functions (Edge Functions)**
- Encapsulate server-side workflows that require trusted execution (e.g., validations, integrations, background jobs).
- Provide stable HTTP endpoints for automation (webhooks, scheduled tasks, or internal services).
- Keep sensitive logic and credentials out of the frontend while remaining close to the data.

**Database Functions and Triggers**
- Enforce data integrity rules that must always run (even outside the app).
- Automate cross-table updates (e.g., derived metrics, stock movements, audit trails).
- Normalize or enrich data at write time to keep queries simple and consistent.

Together, these ensure the database remains the source of truth, while critical workflows are executed safely and consistently.

## 6. Authorization and Permission Rules

Access control is enforced primarily through Supabase Auth and RLS. The frontend never bypasses these policies, and every request must satisfy the database rules for its role.

**Authentication**
- Supabase Auth manages user sessions and identity.
- Logged-out users only access public routes (e.g., `/login`).

**Authorization**
- RLS policies define which rows each role can read or write.
- Server actions and client queries rely on Supabase policies instead of custom ACLs.
- Sensitive operations are restricted to privileged roles (e.g., admin/manager).

## 7. Deployment and Environments

**Environments**
- Local development uses the same Supabase project configuration via environment variables.
- Preview and production are typically deployed on Vercel with Supabase as the backend.

**Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, admin workflows)

## 8. Core Application Flows

- **Authentication**: Users sign in on `/login` and receive a Supabase session stored in cookies.
- **Sales**: Create sales records, associate items, and track results in dashboards.
- **Orders**: View and update order status, items, and customer details.
- **Products & Inventory**: Maintain product catalog and stock-related data.
- **Customers**: Create, edit, and manage customer profiles.
- **Users & Roles**: Admin views for managing user accounts and permissions.
- **Dashboards**: KPIs and charts for operational insights.

## 9. Contribution Guidelines and Best Practices

- Keep all data access within Supabase clients and respect RLS policies.
- Prefer server actions for mutations and keep UI components focused on presentation.
- Use TypeScript types in `types` to keep payloads consistent.
- Run linting before opening a PR: `npm run lint`.

## 10. Roadmap / Future Improvements

- Expand coverage of Edge Functions for background workflows and automation.
- Add more granular audit trails for critical operations.
- Improve testing coverage for server actions and UI components.
- Extend dashboards with additional operational metrics.

## 11. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env.local`.
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 12. Scripts

- `npm run dev` → Start Next.js in development mode.
- `npm run build` → Build for production.
- `npm run start` → Run the production server.
- `npm run lint` → Lint the codebase.
