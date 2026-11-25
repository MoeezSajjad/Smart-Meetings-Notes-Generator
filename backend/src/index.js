import dotenv from "dotenv";
import { createApp } from "./app.js";
import { sweepUploads } from "./middlewares/uploadMiddleware.js";
dotenv.config({ quiet: true });
const project = process.env.FIREBASE_PROJECT_ID;
if (!project || !process.env.GROQ_API_KEY)
  throw new Error("Set FIREBASE_PROJECT_ID and GROQ_API_KEY");
const split = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const allowed = new Set(
  split(process.env.DEMO_ALLOWED_EMAILS).map((s) => s.toLowerCase()),
);
const origins = split(process.env.CORS_ORIGIN || "http://localhost:3000");
if (
  process.env.NODE_ENV === "production" &&
  (!allowed.size ||
    !process.env.CORS_ORIGIN ||
    !origins.length ||
    origins.some((s) => new URL(s).origin !== s || !s.startsWith("https://")))
) {
  throw new Error(
    "Production requires exact HTTPS CORS origins and verified demo email allowlist",
  );
}
const app = createApp({ project, allowed, origins });
await sweepUploads();
setInterval(
  () => sweepUploads().catch(() => console.warn("Cleanup will retry")),
  600000,
).unref();
const server = app.listen(Number(process.env.PORT || 5000), "0.0.0.0", () =>
  console.log("Meeting API listening"),
);
server.headersTimeout = 30000;
server.requestTimeout = 180000;
