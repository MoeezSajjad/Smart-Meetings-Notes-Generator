import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getClient, authMessage } from "../firebase";
import { useSession } from "../lib/Session";

export default function Profile() {
  const { user } = useSession(),
    navigate = useNavigate(),
    location = useLocation();
  const [name, setName] = useState(user.displayName || ""),
    [message, setMessage] = useState(
      location.state?.sent ? "Verification email sent." : "",
    ),
    [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(user.emailVerified);
  async function run(action) {
    setBusy(true);
    setMessage("");
    try {
      const { auth, sdk } = await getClient();
      if (action === "logout") {
        await sdk.signOut(auth);
        navigate("/", { replace: true });
        return;
      }
      if (action === "save") {
        await sdk.updateProfile(user, { displayName: name.trim() });
        setMessage("Display name saved.");
      }
      if (action === "send") {
        await sdk.sendEmailVerification(user);
        setMessage("Verification email sent. Check your inbox.");
      }
      if (action === "refresh") {
        await user.reload();
        await user.getIdToken(true);
        setVerified(user.emailVerified);
        setMessage(
          user.emailVerified
            ? "Email verified."
            : "Verification has not been received yet.",
        );
      }
    } catch (e) {
      setMessage(authMessage(e.code));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="sheet">
      <span className="label">Account</span>
      <h1>Your profile</h1>
      <p>
        {user.email} · {verified ? "Verified" : "Email verification required"}
      </p>
      {!verified && (
        <div className="buttons">
          <button
            className="secondary"
            disabled={busy}
            onClick={() => run("send")}
          >
            Send verification email
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => run("refresh")}
          >
            Check verification
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run("save");
        }}
      >
        <label>
          Display name
          <input
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button className="primary" disabled={busy}>
          Save name
        </button>
      </form>
      <p role="status">{message}</p>
      <button
        className="secondary"
        disabled={busy}
        onClick={() => run("logout")}
      >
        Sign out
      </button>
    </section>
  );
}
