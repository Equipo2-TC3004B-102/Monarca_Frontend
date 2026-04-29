## **Proyecto Monarca - Frontend**

This repository forms part of the “Proyecto Monarca”, a strategic initiative designed to revolutionize the management of corporate flights thought a comprehensive platform, which is secure and highly adaptable 

## General Vision

This projects FrontEnd was built using React + Vite (Typescript), and uses an API which runs through NestJS

Main Objectives:

- Interface with different roles (applicant, approver, cost controller, travel agent)
  
- Authentication and authorization based in JWT
  
- Status management for remote data and forms
  
- Protected routes depending on the role
  
- Reusability and modularity of components
  
- Integration and unitary tests (components, hooks and services)


## Structure

```md
src/
tests → Integration and unitary tests (Jest, React Testing Library)
assets → Images, sources, icons, and static files imported to the components
components → Reusable components (UI atoms, molecules/organisms)
config → Global configuration (API endpoints, constants and contexts for config
hooks → Custom hooks (useAuth, use Fetch, use Form, etc)
pages → Pages or views (every main route) (LoginPage, DashboardPage, etc)
public → Static files exposed directly through Vite (favicon, index.html)
types → Types of TypeScript shared (data interface, enums, types of API responses)
utils → Auxiliary functions (formats, date helpers, generic validations)
app.css → Basic global styles (minimal usage o resets)
index.css → root styles, imported in main.tsx
main.tsx → Entry point, <App /> is rendered and providers are configured (Router, Contexts, etc)
vite-env.d.ts → Types of declarations for Vite

```


## Requirements

- Volta (official Node manager)
- npm
- Optional: direnv for local env variables
- Docker Desktop (required for backend database when running full stack locally)


## How to Install

Install Volta:

Windows (PowerShell):

```powershell
winget install Volta.Volta
```

macOS:

```bash
curl https://get.volta.sh | bash
```

Pin and verify versions:

```bash
volta install node@22.14.0 npm@10.9.2
node -v
npm -v
```

## Installing the Project
In your shell, run:
```
npm install
npm run setup
```

After that we want to activate a local host by doing the following:
```
npm run dev
```

## Recommended Full Local Flow (Windows/macOS)

1. Start PostgreSQL from backend repository root:

```bash
cd ../Monarca_Backend
docker compose up -d
```

2. Start backend:

```bash
cd monarca
npm install
npm run setup
npm run dev
```

3. Start frontend:

```bash
cd ../../Monarca_Frontend
npm install
npm run setup
npm run dev
```

4. Open the app:

```text
http://localhost:5173
```

## Environment Variables
Create an “.env” file with the content specified in the “.env.example” file
```
VITE_API_URL=http://localhost:3000
```

Or generate it automatically:

```bash
npm run setup:env
```

## Optional compatibility tools

- `.nvmrc` is kept for compatibility.
- `.envrc` is optional for users that already rely on direnv.

## Build and Test

```bash
npm run build
npm run test
```

Note:

- If build/test fails with existing test-suite or typing issues from the base branch, treat those as pre-existing and document them in the PR.

