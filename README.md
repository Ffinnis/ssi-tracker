# SSI Score Management

A project for managing and visualizing Self-Sovereign Identity (SSI) scores. It includes a backend service, a web frontend, and a browser extension.

## Components

- **`backend/`**: A Node.js service providing the core API for managing SSI scores.
- **`frontend/`**: A Next.js web application for visualizing and interacting with SSI scores.
- **`frontend-extension/`**: A browser extension for interacting with Linkedin.

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running the Project

1. Ensure Docker is running.
2. From the root directory, run the following command:

   ```bash
   docker-compose up -d
   ```

3. Install chrome extension in developer mode, also auth to your Linkedin account before using extension

This will build and start all the necessary services (backend, frontend, etc.).
