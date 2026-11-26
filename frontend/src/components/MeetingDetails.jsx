import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { useSession } from "../lib/Session";
import { api } from "../lib/api";
import { downloadNotes, formatNotes, sample } from "../lib/meetings";

export function Notes({ meeting, isSample = false }) {
  const [tab, setTab] = useState("Summary");
  const [copyStatus, setCopyStatus] = useState("");
  const { notes, transcript } = meeting;
  async function copy() {
    try {
      await navigator.clipboard.writeText(formatNotes(meeting, isSample));
      setCopyStatus("Notes copied.");
    } catch {
      setCopyStatus("Clipboard unavailable. Use Download notes instead.");
    }
  }
  return (
    <section className="sheet wide">
      <div className="title-row">
        <div>
          <span className="label">
            <FileText size={16} />
            {isSample ? "Fictional sample meeting" : "Meeting notes"}
          </span>
          <h1>{meeting.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="secondary" onClick={copy}>
            Copy notes
          </button>
          <button
            className="secondary"
            onClick={() => downloadNotes(meeting, isSample)}
          >
            <Download size={17} />
            Download notes
          </button>
        </div>
      </div>
      <p role="status">{copyStatus}</p>
      {isSample && (
        <p>
          Explore this prepared example without an account or recording. All
          names, dialogue and notes are fictional.
        </p>
      )}
      <div className="tabs" role="group" aria-label="Meeting sections">
        {["Summary", "Key points", "Action items", "Transcript"].map((t) => (
          <button aria-pressed={tab === t} key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <article className="result">
        <h2>{tab}</h2>
        {tab === "Summary" && <p>{notes.summary}</p>}
        {tab === "Transcript" && <p className="transcript">{transcript}</p>}
        {tab === "Key points" &&
          (notes.keyPoints.length ? (
            <ul>
              {notes.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          ) : (
            <p>No key points recorded.</p>
          ))}
        {tab === "Action items" &&
          (notes.actionItems.length ? (
            <ol>
              {notes.actionItems.map((item, i) => (
                <li key={i}>
                  {item.task}
                  {item.owner && (
                    <span className="owner">Assigned to {item.owner}</span>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p>No action items recorded.</p>
          ))}
      </article>
    </section>
  );
}

export function SampleMeeting() {
  return <Notes meeting={sample} isSample />;
}

export default function MeetingDetails() {
  const { meetingId } = useParams();
  const { user } = useSession();
  const [state, setState] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let timer;
    const controller = new AbortController();
    const until = Date.now() + 15 * 60_000;
    async function poll() {
      try {
        const data = await api(
          user,
          "/api/audio/status/" + encodeURIComponent(meetingId),
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setState(data);
        if (!["ready", "error"].includes(data.status)) {
          if (Date.now() < until) timer = setTimeout(poll, 3000);
          else
            setState({
              message: "Polling paused. Refresh the status to continue.",
            });
        }
      } catch (error) {
        if (!controller.signal.aborted) setState({ message: error.message });
      }
    }
    setState(null);
    poll();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [user, meetingId, retry]);
  if (state?.status === "ready" && state.data?.notes)
    return (
      <Notes
        meeting={{
          title: state.originalFileName || "Meeting recording",
          ...state.data,
        }}
      />
    );
  return (
    <section className="sheet">
      <h1>Meeting status</h1>
      <p role="status">
        {state?.status === "error"
          ? "Processing failed. Open your dashboard to start again with a supported recording."
          : state?.message || "Checking your recording…"}
      </p>
      <div className="buttons">
        <Link className="secondary" to="/dashboard">
          Dashboard
        </Link>
        {state?.message && !state?.status && (
          <button className="primary" onClick={() => setRetry((n) => n + 1)}>
            Refresh status
          </button>
        )}
      </div>
    </section>
  );
}
