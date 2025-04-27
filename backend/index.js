// index.js
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const { Pool } = require("pg");
const cors = require("@fastify/cors");

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "postgres",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

// Enable CORS
fastify.register(cors, {
  origin: "*", // Allow all origins - adjust for production!
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
// Health check route
fastify.get("/", async (request, reply) => {
  return { status: "OK" };
});

// Test DB connection route
fastify.get("/db-check", async (request, reply) => {
  try {
    const result = await pool.query("SELECT NOW()");
    return { dbTime: result.rows[0].now };
  } catch (err) {
    reply.code(500);
    return { error: "Database connection failed", details: err.message };
  }
});

// POST /ssi - create new SSI score record
fastify.post("/ssi", async (request, reply) => {
  const {
    ssi_overall_score,
    establish_your_professional_brand,
    find_the_right_people,
    engage_with_insights,
    build_relationships,
  } = request.body;

  if (
    typeof ssi_overall_score !== "number" ||
    typeof establish_your_professional_brand !== "number" ||
    typeof find_the_right_people !== "number" ||
    typeof engage_with_insights !== "number" ||
    typeof build_relationships !== "number"
  ) {
    reply.code(400);
    return { error: "All SSI parameters must be numbers." };
  }

  try {
    const result = await pool.query(
      `INSERT INTO ssi_scores
        (ssi_overall_score, establish_your_professional_brand, find_the_right_people, engage_with_insights, build_relationships)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        ssi_overall_score,
        establish_your_professional_brand,
        find_the_right_people,
        engage_with_insights,
        build_relationships,
      ]
    );
    reply.code(201);
    return result.rows[0];
  } catch (err) {
    reply.code(500);
    return { error: "Failed to save SSI score", details: err.message };
  }
});

// GET /ssi - get all SSI score records
fastify.get("/ssi", async (request, reply) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ssi_scores ORDER BY date_created DESC"
    );
    return result.rows;
  } catch (err) {
    reply.code(500);
    return { error: "Failed to fetch SSI scores", details: err.message };
  }
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 4444, host: "0.0.0.0" });
    fastify.log.info(`Server listening on http://0.0.0.0:4444`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
