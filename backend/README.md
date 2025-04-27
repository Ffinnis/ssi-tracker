# Backend Service

## Description

This backend service provides API endpoints for managing Social Selling Index (SSI) scores. It allows clients to create new SSI score records and retrieve existing ones.

## Technologies Used

- **Runtime:** Node.js
- **Framework:** Fastify
- **Database:** PostgreSQL
- **Environment Variables:** dotenv
- **Containerization:** Docker

## Setup and Running

There are two primary ways to set up and run this backend service:

### 1. Using Docker (Recommended)

The service is containerized using Docker. The provided `Dockerfile` and `entrypoint.sh` handle dependency installation, database migrations, and application startup.

**Prerequisites:**

- Docker installed.
- A running PostgreSQL instance accessible to the container.

**Steps:**

1.  **Build the Docker image:** Navigate to the `backend` directory in your terminal and run:
    ```bash
    docker build -t backend-ssi-service .
    ```
2.  **Run the Docker container:** You need to provide the necessary PostgreSQL connection details as environment variables.
    ```bash
    docker run -p 4444:4444 \
      -e PGHOST=<your_db_host> \
      -e PGUSER=<your_db_user> \
      -e PGPASSWORD=<your_db_password> \
      -e PGDATABASE=<your_db_name> \
      -e PGPORT=<your_db_port> \
      backend-ssi-service
    ```
    Replace the placeholders (`<...>`) with your actual database credentials. The container will automatically wait for the database, apply migrations from the `migrations/` directory, and start the Fastify server on port 4444.

_(Note: If using the root `docker-compose.yml`, it might simplify this process by managing the database and backend services together.)_

### 2. Native Setup (Node.js)

You can also run the service directly using Node.js.

**Prerequisites:**

- Node.js (Version specified in `Dockerfile`, currently Node 23) installed.
- npm installed.
- A running PostgreSQL instance.
- `psql` command-line tool installed and in your PATH (for migrations).

**Steps:**

1.  **Install Dependencies:** Navigate to the `backend` directory and run:
    ```bash
    npm install
    ```
2.  **Set Environment Variables:** Create a `.env` file in the `backend` directory by copying `.env.example` and filling in your database credentials.
    ```bash
    cp .env.example .env
    # Edit .env with your details
    ```
3.  **Apply Database Migrations:** Manually apply the SQL migrations using `psql`. Ensure your environment variables (`PGHOST`, `PGUSER`, etc.) are set or provide connection details directly.

    ```bash
    # Example using environment variables (ensure they are exported)
    for f in ./migrations/*.sql; do if [ -f "$f" ]; then psql -f "$f"; fi; done

    # Or provide details directly (replace <...>)
    # for f in ./migrations/*.sql; do if [ -f "$f" ]; then psql -h <host> -U <user> -d <db> -f "$f"; fi; done
    ```

4.  **Start the Server:**
    ```bash
    node index.js
    ```
    The server will start and listen on `http://localhost:4444`.

## Environment Variables

The backend service requires the following environment variables for database connection. Refer to `.env.example` for a template:

- `PGHOST`: Hostname of the PostgreSQL server.
- `PGUSER`: Username for the PostgreSQL database.
- `PGPASSWORD`: Password for the PostgreSQL database.
- `PGDATABASE`: Name of the PostgreSQL database.
- `PGPORT`: Port number for the PostgreSQL server (defaults to 5432 if not set).

## API Documentation

Detailed API documentation, including endpoint specifications, request/response formats, and examples, can be found in the OpenAPI specification file:

- [`openapi.yaml`](./openapi.yaml)
