import express from "express";
import cors from "cors";
import { audioRoutes } from "./routes/audioRoutes.js";

export function createApp(options) {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    next();
  });
  app.use(
    cors({
      origin: (origin, cb) =>
        cb(null, !origin || options.origins.includes(origin)),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
    }),
  );
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/audio", audioRoutes(options));
  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
  app.use((_err, _req, res, _next) =>
    res.status(500).json({ error: "Request failed" }),
  );
  return app;
}
