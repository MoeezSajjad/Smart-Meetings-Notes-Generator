import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getClient, authMessage } from "../firebase";
import { useSession } from "../lib/Session";

export default function AuthForm({ signup = false }) {
  const { unavailable, user, loading } = useSession();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { auth, sdk } = await getClient();
      if (signup) {
        const credential = await sdk.createUserWithEmailAndPassword(
          auth,
          form.get("email"),
          form.get("password"),
        );
        if (form.get("name")?.trim())
          await sdk.updateProfile(credential.user, {
            displayName: form.get("name").trim(),
          });
        await sdk.sendEmailVerification(credential.user);
        navigate("/profile", { replace: true, state: { sent: true } });
      } else {
        await sdk.signInWithEmailAndPassword(
          auth,
          form.get("email"),
          form.get("password"),
        );
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      setError(authMessage(e.code));
    } finally {
      setBusy(false);
    }
  }
  const title = signup ? "Create an account" : "Sign in";
  return (
    <section className="sheet">
      <span className="label">Private workspace</span>
      <h1>{title}</h1>
      {loading ? (
        <p role="status">Checking session…</p>
      ) : unavailable ? (
        <>
          <p>
            Live sign-in is unavailable on this deployment. The sample includes
            the transcript, notes and download.
          </p>
          <Link className="primary" to="/sample">
            Explore sample meeting
          </Link>
        </>
      ) : (
        <>
          {user && !busy && (
            <p>
              Signed in as {user.email}.{" "}
              <Link to="/profile">Manage account</Link>
            </p>
          )}
          <p>
            Live uploads require a verified, approved account. Anyone can{" "}
            <Link to="/sample">explore the sample meeting</Link>.
          </p>
          <form onSubmit={submit}>
            {signup && (
              <label>
                Name (optional)
                <input name="name" maxLength={80} autoComplete="name" />
              </label>
            )}
            <label>
              Email
              <input name="email" required type="email" autoComplete="email" />
            </label>
            <label>
              Password
              <input
                name="password"
                required
                type="password"
                minLength={signup ? 6 : undefined}
                autoComplete={signup ? "new-password" : "current-password"}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="primary" disabled={busy}>
              {busy ? "Please wait…" : title}
            </button>
          </form>
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Already have an account? Sign in" : "Create an account"}
          </Link>
        </>
      )}
    </section>
  );
}
