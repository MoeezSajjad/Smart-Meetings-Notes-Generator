import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { useSession } from "../lib/Session";
import { api } from "../lib/api";
import { checkAudio } from "../lib/meetings";

export default function Upload() {
  const { user } = useSession();
  const navigate = useNavigate(),
    pending = useRef(null);
  const [file, setFile] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => () => pending.current?.abort(), []);
  async function submit(e) {
    e.preventDefault();
    const problem = checkAudio(file);
    if (problem) {
      setError(problem);
      return;
    }
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("audio", file);
      const data = await api(user, "/api/audio/upload", {
        body,
        signal: controller.signal,
      });
      if (!controller.signal.aborted)
        navigate("/meeting/" + encodeURIComponent(data.data.meetingId));
    } catch (e) {
      if (!controller.signal.aborted) setError(e.message);
    } finally {
      pending.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <section className="sheet">
      <span className="label">
        <UploadCloud size={17} /> Restricted workspace
      </span>
      <h1>Upload a recording</h1>
      <p>
        Use synthetic or non-confidential audio you have permission to share.
        Groq processes the recording and transcript.
      </p>
      <form onSubmit={submit}>
        <label>
          Audio recording
          <input
            type="file"
            accept=".mp3,.wav,.m4a"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files[0];
              setFile(f);
              setError(f ? checkAudio(f) : "");
            }}
          />
        </label>
        <small>MP3, WAV or M4A · Up to 25 MB</small>
        {error && <p role="alert">{error}</p>}
        {busy && <p role="status">Sending your recording…</p>}
        <button
          className="primary"
          disabled={busy || !file || !!checkAudio(file)}
        >
          Upload and process
        </button>
      </form>
      <Link to="/dashboard">Return to dashboard</Link>
    </section>
  );
}
