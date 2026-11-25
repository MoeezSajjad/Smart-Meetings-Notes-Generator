import { createRemoteJWKSet, jwtVerify } from "jose";

// Google rotates these public signing keys. jose caches them in memory.
const keys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
  { timeoutDuration: 8000 },
);

export async function verifyFirebaseToken(token, project, keySet = keys) {
  const { payload } = await jwtVerify(token, keySet, {
    algorithms: ["RS256"],
    audience: project,
    issuer: "https://securetoken.google.com/" + project,
    requiredClaims: ["sub", "iat", "exp", "auth_time"],
  });
  const now = Date.now() / 1000;
  if (
    typeof payload.sub !== "string" ||
    !payload.sub ||
    payload.sub.length > 128 ||
    payload.iat > now ||
    typeof payload.auth_time !== "number" ||
    payload.auth_time > now
  ) {
    throw new Error("Invalid identity");
  }
  return payload;
}

export function authenticate(project, allowed, verify = verifyFirebaseToken) {
  return async (req, res, next) => {
    const token = req
      .get("Authorization")
      ?.match(/^Bearer ([^\s]{1,8192})$/i)?.[1];
    if (!token) return res.status(401).json({ error: "Sign in to continue" });
    try {
      const claims = await verify(token, project);
      if (
        allowed.size &&
        (claims.email_verified !== true ||
          !allowed.has(String(claims.email).toLowerCase()))
      ) {
        return res
          .status(403)
          .json({
            error: "Live processing is restricted to verified demo accounts",
          });
      }
      req.user = { uid: claims.sub };
      next();
    } catch (error) {
      const unavailable =
        error.code === "ERR_JWKS_TIMEOUT" ||
        (error instanceof TypeError && !error.code) ||
        error.message?.includes("200 OK");
      res
        .status(unavailable ? 503 : 401)
        .json({
          error: unavailable
            ? "Authentication temporarily unavailable"
            : "Invalid or expired session",
        });
    }
  };
}

export function uploadQuota() {
  let reset = 0,
    total = 0;
  const counts = new Map();
  return (req, res, next) => {
    if (Date.now() >= reset) {
      reset = Date.now() + 3600000;
      total = 0;
      counts.clear();
    }
    const count = counts.get(req.user.uid) || 0;
    if (count >= 3 || total >= 12) {
      res.set("Retry-After", String(Math.ceil((reset - Date.now()) / 1000)));
      return res
        .status(429)
        .json({ error: "Hourly demo upload limit reached" });
    }
    counts.set(req.user.uid, count + 1);
    total++;
    next();
  };
}
