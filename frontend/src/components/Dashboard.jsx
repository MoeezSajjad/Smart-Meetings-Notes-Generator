import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/Session";

export default function Dashboard() {
  const { user } = useSession();
  const [list, setList] = useState(null),
    [error, setError] = useState(""),
    [revision, refresh] = useState(0);
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setList(null);
    api(user, "/api/audio/meetings", { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setList(data.meetings);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [user, revision]);
  const filtered = list?.filter(
    (m) =>
      (!filter || m.status === filter) &&
      m.originalFileName.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="sheet wide">
      <div className="title-row">
        <div>
          <span className="label">Workspace</span>
          <h1>My meetings</h1>
        </div>
        <Link className="primary" to="/upload">
          Upload a recording
        </Link>
      </div>
      <p>
        Recordings are processed temporarily. Download finished notes before
        they expire.
      </p>
      {error ? (
        <p role="alert">{error}</p>
      ) : !list ? (
        <p role="status">Loading meetings…</p>
      ) : list.length === 0 ? (
        <p>
          You have no saved meetings. Upload a recording or{" "}
          <Link to="/sample">explore the sample</Link>.
        </p>
      ) : (
        <>
          <div className="filters">
            <label>
              Search recordings
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label>
              Status
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {[
                  "uploaded",
                  "processing",
                  "transcribed",
                  "ready",
                  "error",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <ul className="meeting-list">
            {filtered.map((m) => (
              <li key={m.meetingId}>
                <Link to={"/meeting/" + encodeURIComponent(m.meetingId)}>
                  {m.originalFileName}
                </Link>
                <small>
                  {m.status} · {new Date(m.uploadedAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
          {!filtered.length && <p>No meetings match this search.</p>}
        </>
      )}
      <button className="secondary" onClick={() => refresh((n) => n + 1)}>
        Refresh meetings
      </button>
    </section>
  );
}
