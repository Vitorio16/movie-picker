import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "./db.js";
import routes from "./routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const port = Number(process.env.PORT || 8080);

async function start() {
  const hasDiscreteDb =
    (process.env.PGHOST || process.env.POSTGRES_HOST) &&
    (process.env.PGUSER || process.env.POSTGRES_USER) &&
    (process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD) &&
    (process.env.PGDATABASE || process.env.POSTGRES_DB);

  if (!hasDiscreteDb && !process.env.DATABASE_URL) {
    throw new Error(
      "Database config required: set PGHOST/PGUSER/PGPASSWORD/PGDATABASE (or DATABASE_URL)",
    );
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  await migrate();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use("/api", routes);

  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(publicDir, "index.html"));
    }
    next();
  });

  app.listen(port, () => {
    console.log(`Movie Picker listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
