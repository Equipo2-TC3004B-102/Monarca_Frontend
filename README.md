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

- Node.js (we use NVM to manage versions)
- npm (Node Package Manager)
- direnv
- When you enter the repository, run “direnv allow” if it’s the first time


## How to Install
In MacOS: brew install direnv


Add the following hook to your shell/terminal
If in Bash:
# Bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

If in Zsh:
# Zsh
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc


Enable direnv in this repository by using:
```
direnv allow
```

## Installing nvm and node.js
For NVM:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

source ~/.bashrc # or ~/.zshrc (depending on your shell)

nvm install
```

## Installing the Project
In your shell, run:
```
npm install
```

After that we want to activate a local host by doing the following:
```
npm run dev
```

## Environment Variables
Create an “.env” file with the content specified in the “.env.example” file
```
VITE_API_URL=
```

