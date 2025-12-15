# ERP System 💻

1. Overview 👀  
2. Application Technologies 👨🏻‍💻
3. Project Structure 🗼
4. Database and Row Level Security (RLS) 🔓
<!--
5. Supabase Functions and Triggers
6. Authorization and Permission Rules
7. Deployment and Environments
8. Core Application Flows
9. Contribution Guidelines and Best Practices
10. Roadmap / Future Improvements
-->

## 1. Overview 👀

This ERP system was designed to centralize all company data and operational workflows in a single platform.  
The project originated from a real business need to automate processes that were previously handled manually.

The system allows users to:
- Create and manage sales;
- Manage customer orders;
- Control product inventory;
- Track production status;
- Monitor sales metrics and operational indicators in real time.

The architecture prioritizes scalability, security, and clear separation of responsibilities between user roles.

## 2. Application Technologies 👨🏻‍💻

| Component | Technology | Responsibility |
|---------|------------|----------------|
| **Frontend** | Next.js + TypeScript | Server-side rendering, routing, and UI logic |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) | Database, authentication, and access control |
| **Data Access Layer** | Supabase Client (no Prisma) | Direct database interaction enforced by RLS |
| **Styling** | TailwindCSS + clsx | Utility-first styling and conditional class management |
| **Hosting** | Vercel (Frontend), Supabase (Backend) | Production-grade infrastructure |

## 3. Project Structure 🗼
```
/app
├ ├─ (auth)               → Authentication actions
├ ├─ (app)                → Application after authentication
├ ├ ├─ /customers         → Customers page
├ ├ ├─ /dashboard         → Main dashboard page
├ ├ ├─ /products          → Products page
├ ├ ├─ /orders            → Orders page
├ ├ ├─ /profile           → My profile page
├ ├ └─ /sales             → Sales page
├ ├─ /actions             → Server actions
├ ├─ /components          → Reusable components
├ └─ /login               → Login page
├─ /types                 → Global TypeScript types
├─ /utils                 → Utility functions
```

## 4. Database/Row Security Level (RLS) 🔓

I'm using Supabase with PostgreSQL, authentication, and RLS. This is my second project using Supabase and the first where I understand how it works. I've been using most of the features Supabase offers to developers (but there are many other features I haven't explored yet). It's very easy and simple to view all the data in the tables, the RLS policies, and the authentication.
