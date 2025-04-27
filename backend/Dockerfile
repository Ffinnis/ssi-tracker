# Use official Node.js LTS image
FROM node:23

# Install PostgreSQL client tools (psql, pg_isready)
RUN apt-get update && apt-get install -y postgresql-client

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Copy entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 4444

# Start with entrypoint script (auto-migrate then start server)
CMD ["./entrypoint.sh"]