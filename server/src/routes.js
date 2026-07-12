import { Router } from "express";
import {
  authMiddleware,
  hashPassword,
  signToken,
  verifyPassword,
} from "./auth.js";
import {
  addExcludedCombination,
  createUserWithSettings,
  deleteExcludedCombination,
  findUserById,
  findUserByUsername,
  getSettings,
  listExcludedCombinations,
  upsertSettings,
  userCount,
} from "./db.js";

const router = Router();

const DEFAULT_SETTINGS = {
  yearMin: 1960,
  yearMax: 2026,
  genres: ["Horror", "Comedy"],
  extras: ["haunted house", "road trip", "mistaken identity"],
};

function normalizeSettings(body) {
  const yearMin = Number(body.yearMin);
  const yearMax = Number(body.yearMax);
  const genres = Array.isArray(body.genres)
    ? body.genres.filter((g) => typeof g === "string").map((g) => g.trim()).filter(Boolean)
    : null;
  const extras = Array.isArray(body.extras)
    ? body.extras.filter((e) => typeof e === "string").map((e) => e.trim()).filter(Boolean)
    : null;

  if (!Number.isFinite(yearMin) || !Number.isFinite(yearMax)) {
    return { error: "yearMin and yearMax must be numbers" };
  }
  if (genres === null || extras === null) {
    return { error: "genres and extras must be arrays of strings" };
  }

  return {
    settings: { yearMin, yearMax, genres, extras },
  };
}

router.get("/setup/status", async (_req, res) => {
  try {
    const count = await userCount();
    res.json({ needsSetup: count === 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to check setup status" });
  }
});

router.post("/setup", async (req, res) => {
  try {
    const count = await userCount();
    if (count > 0) {
      return res.status(409).json({ error: "Setup already completed" });
    }

    const username = String(req.body.username ?? "").trim();
    const password = String(req.body.password ?? "");
    const confirmPassword = String(req.body.confirmPassword ?? "");

    if (username.length < 2) {
      return res.status(400).json({ error: "Username must be at least 2 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUserWithSettings(username, passwordHash);
    const token = signToken(user);
    res.status(201).json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username ?? "").trim();
    const password = String(req.body.password ?? "");

    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = signToken(user);
    res.json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log in" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load user" });
  }
});

router.get("/settings", authMiddleware, async (req, res) => {
  try {
    const settings = await getSettings(req.user.id);
    res.json(settings ?? DEFAULT_SETTINGS);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

router.put("/settings", authMiddleware, async (req, res) => {
  try {
    const normalized = normalizeSettings(req.body);
    if (normalized.error) {
      return res.status(400).json({ error: normalized.error });
    }
    await upsertSettings(req.user.id, normalized.settings);
    res.json(normalized.settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

router.get("/excluded", authMiddleware, async (req, res) => {
  try {
    const items = await listExcludedCombinations(req.user.id);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load excluded combinations" });
  }
});

router.post("/excluded", authMiddleware, async (req, res) => {
  try {
    const year = Number(req.body.year);
    const genre = String(req.body.genre ?? "").trim();
    const extra = String(req.body.extra ?? "").trim();

    if (!Number.isFinite(year) || !genre || !extra) {
      return res.status(400).json({ error: "year, genre, and extra are required" });
    }

    const item = await addExcludedCombination(req.user.id, { year, genre, extra });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save excluded combination" });
  }
});

router.delete("/excluded/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const deleted = await deleteExcludedCombination(req.user.id, id);
    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete excluded combination" });
  }
});

export default router;
