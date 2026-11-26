const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const configured =
  Object.values(config).every(Boolean) &&
  (/^https:\/\//.test(apiBase) ||
    (import.meta.env.DEV &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(apiBase)));
let client;

export function getClient() {
  if (!configured) throw new Error("Live workspace is unavailable.");
  client ??= Promise.all([
    import("@firebase/app"),
    import("@firebase/auth"),
  ]).then(async ([appSdk, sdk]) => {
    const auth = sdk.getAuth(appSdk.initializeApp(config));
    await sdk.setPersistence(auth, sdk.browserSessionPersistence);
    return { auth, sdk };
  });
  return client;
}

export function clearLegacyCache() {
  try {
    const keys = Object.keys(window.localStorage);
    for (const key of keys) {
      if (
        key === "smng_user" ||
        key === "userMeetings" ||
        key.startsWith("userMeetings:")
      ) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    /* Storage can be disabled in private browsing. */
  }
}

export function authMessage(code) {
  const messages = {
    "auth/invalid-credential": "Check your email address and password.",
    "auth/email-already-in-use":
      "This email already has an account. Try signing in.",
    "auth/weak-password": "Choose a longer password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed":
      "Could not connect to authentication. Check your connection.",
  };
  return (
    messages[code] || "Authentication could not be completed. Try again later."
  );
}
