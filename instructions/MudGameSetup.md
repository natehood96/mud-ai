# Monorepo Architecture Guide and Setup Instructions

This document provides a detailed explanation of the monorepo architecture used in the `daily-revenue-tracker` project and a step-by-step guide to replicate this setup for a new project, such as a MUD game.

## Part 1: Architecture Overview

This project uses a monorepo approach to manage the frontend, backend, and database components in a single repository. This simplifies development and deployment.

### Key Components:

*   **Frontend:** A React single-page application (SPA) located in the `client/` directory. It is built using Vite, which provides a fast development server with hot-reloading and an optimized build process.
*   **Backend:** A Node.js server using the Express.js framework, located in the `server/` directory. It's written in TypeScript and is responsible for handling API requests, business logic, and database interactions.
*   **Database:** A PostgreSQL database managed by Drizzle ORM. Database schema and migrations are located in the `server/db/` and `migrations/` directories.
*   **Shared Code:** The `shared/` directory contains code that is used by both the frontend and backend, such as type definitions. This helps to ensure consistency between the client and server.
*   **Containerization:** The entire application is containerized using Docker and Docker Compose. This provides a consistent and reproducible development environment and simplifies deployment.

### Development Environment

There are two ways to run the application in development:

1.  **Local (without Docker):**
    *   Running `npm run dev` starts the Express server.
    *   The Express server, in turn, programmatically starts a Vite dev server as middleware.
    *   This setup provides a tightly integrated development experience with a single command to start both the client and server. API requests from the client are seamlessly handled by the Express server without the need for proxying.

2.  **Docker Compose:**
    *   Running `docker-compose up` starts two services: `api` and `client`.
    *   The `client` service runs the Vite dev server on port `5173`. It is configured to proxy any API requests (`/api/...`) to the `api` service.
    *   The `api` service runs the Express server on port `8080`.
    *   This setup provides a more isolated environment, which can be beneficial for mimicking a production-like setup.

### Production Environment

In production, the frontend and backend are deployed as separate entities:

*   The **frontend** is built into a set of static files (HTML, CSS, JavaScript) using `npm run build`. These files are then deployed to a static hosting service like AWS S3 and served via a CDN like AWS CloudFront for optimal performance.
*   The **backend** is built into a single JavaScript file using `esbuild`. This optimized build is then run in a Node.js environment (e.g., in a Docker container on a service like AWS Elastic Beanstalk), serving as a standalone API server.

---

## Part 2: Step-by-Step Setup Guide for a New Project

Here’s how a mid-level engineer can set up a similar project from scratch.

### Step 1: Initialize Project and Directory Structure

1.  **Create the project directory:**
    ```bash
    mkdir my-mud-game
    cd my-mud-game
    ```

2.  **Initialize a Node.js project:**
    ```bash
    npm init -y
    ```

3.  **Create the directory structure:**
    ```bash
    mkdir client server shared
    mkdir server/routes server/db
    touch client/index.html
    touch client/src
    touch client/src/main.tsx
    touch server/index.ts
    touch server/db/schema.ts
    touch shared/types.ts
    ```

### Step 2: Install Dependencies

1.  **Install server dependencies:**
    ```bash
    npm install express cors dotenv pg drizzle-orm
    npm install -D @types/express @types/cors @types/node tsx typescript esbuild
    ```

2.  **Install client dependencies:**
    ```bash
    npm install react react-dom
    npm install -D @types/react @types/react-dom @vitejs/plugin-react vite
    ```

3.  **Install Drizzle Kit for database migrations:**
    ```bash
    npm install -D drizzle-kit
    ```

### Step 3: Configure TypeScript and Vite

1.  **Create `tsconfig.json`:**
    ```json
    {
      "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "jsx": "react-jsx",
        "baseUrl": ".",
        "paths": {
          "@shared/*": ["shared/*"]
        }
      },
      "include": ["server", "client", "shared"]
    }
    ```

2.  **Create `vite.config.ts` in the root directory:**
    ```typescript
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import path from 'path';

    export default defineConfig({
      plugins: [react()],
      root: path.resolve(__dirname, 'client'),
      build: {
        outDir: path.resolve(__dirname, 'dist/public'),
      },
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
      resolve: {
        alias: {
          '@shared': path.resolve(__dirname, 'shared'),
        },
      },
    });
    ```

### Step 4: Set Up the Server

1.  **Create a basic Express server in `server/index.ts`:**
    ```typescript
    // server/index.ts
    import express from 'express';
    import cors from 'cors';
    import path from 'path';
    import { fileURLToPath } from 'url';

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const app = express();
    app.use(cors());
    app.use(express.json());

    // API routes
    app.get('/api/hello', (req, res) => {
      res.json({ message: 'Hello from the server!' });
    });

    if (process.env.NODE_ENV === 'production') {
      // Serve static files from the 'dist/public' directory
      app.use(express.static(path.resolve(__dirname, '..', 'dist/public')));
      
      // Handle all other routes by serving the index.html
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'dist/public', 'index.html'));
      });
    }


    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
    ```

### Step 5: Set Up the Client

1.  **Create `client/index.html`:**
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MUD Game</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
    </body>
    </html>
    ```

2.  **Create `client/src/main.tsx`:**
    ```tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';

    const App = () => {
      const [message, setMessage] = React.useState('');

      React.useEffect(() => {
        fetch('/api/hello')
          .then((res) => res.json())
          .then((data) => setMessage(data.message));
      }, []);

      return <h1>{message}</h1>;
    };

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    ```

### Step 6: Configure `package.json` Scripts

1.  **Add the following scripts to your `package.json`:**
    ```json
    "scripts": {
      "dev:client": "vite",
      "dev:server": "tsx --watch server/index.ts",
      "build": "vite build && esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist",
      "start": "node dist/index.js"
    }
    ```

### Step 7: Set Up Docker and Drizzle

This section covers setting up Drizzle for database management. While Docker is used for production deployment, for local development, you can run a PostgreSQL database directly on your machine.

**Option 1: Local PostgreSQL Installation (No Docker)**

1.  **Install PostgreSQL:** If you don't have it already, download and install PostgreSQL for your operating system.
2.  **Create a Database:** Create a new database for your project (e.g., `mud_game_dev`).
3.  **Create `.env.development` file:** In the root of your project, create a file named `.env.development`.
4.  **Add Database URL:** Add your database connection string to the `.env.development` file. It should look something like this:
    ```
    DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/mud_game_dev"
    ```

**Option 2: Using Docker for the Database**

If you prefer to use Docker for managing your database, you can add a PostgreSQL service to a `docker-compose.yml` file.

1.  **Create `docker-compose.yml`:**
    ```yaml
    version: '3.8'
    services:
      api:
        image: node:20-slim
        ports:
          - "8080:8080"
        volumes:
          - ./server:/app
        environment:
          - NODE_ENV=production
          - PORT=8080
          - DATABASE_URL=postgresql://postgres:postgres@db:5432/mud_game_dev
        depends_on:
          - db
        command: npm start
      client:
        image: nginx:alpine
        ports:
          - "5173:5173"
        volumes:
          - ./dist/public:/usr/share/nginx/html
        depends_on:
          - api
        command: nginx -g "daemon off;"
      db:
        image: postgres:15-alpine
        ports:
          - "5432:5432"
        environment:
          - POSTGRES_USER=postgres
          - POSTGRES_PASSWORD=postgres
          - POSTGRES_DB=mud_game_dev
        volumes:
          - ./db:/var/lib/postgresql/data
    ```

2.  **Create `drizzle.config.ts`:**
    ```typescript
    import { defineConfig } from 'drizzle-kit';

    export default defineConfig({
      schema: './server/db/schema.ts',
      out: './migrations',
      dialect: 'postgresql',
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    });
    ```

3.  **Define your database schema in `server/db/schema.ts`:**
    ```typescript
    import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';

    export const users = pgTable('users', {
      id: serial('id').primaryKey(),
      fullName: text('full_name'),
      phone: varchar('phone', { length: 256 }),
    });
    ```

### Step 8: Running the Application

1.  **Development:**
    *   To run the client and server separately (recommended for development):
        *   In one terminal, run `npm run dev:server`.
        *   In another terminal, run `npm run dev:client`.
    *   The React app will be available at `http://localhost:5173` (or another port if 5173 is in use), and the server will be at `http://localhost:3000`.

2.  **Production:**
    *   Run `npm run build` to build both the client and server.
    *   Run `npm run start` to start the production server, which will also serve the client files.
    *   Alternatively, build and run the Docker container.

This guide provides a solid foundation for your MUD game project, mirroring the robust and scalable architecture of the `daily-revenue-tracker` application.
