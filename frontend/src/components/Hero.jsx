import React from "react";
import { AudioLines, CheckCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useSession } from "../lib/Session";

export default function Hero() {
  const { user } = useSession();
  return (
    <section className="landing">
      <div>
        <span className="label">
          <AudioLines size={18} /> Meeting documentation
        </span>
        <h1>
          From a recording to <span>meeting notes.</span>
        </h1>
        <p className="lead">
          Read what was said, find the decisions and see who agreed to follow
          up. Explore the workflow with a fictional support handover.
        </p>
        <div className="buttons">
          <Link className="primary" to="/sample">
            <FileText size={18} />
            Explore sample meeting
          </Link>
          <Link className="secondary" to={user ? "/upload" : "/login"}>
            {user ? "Upload a recording" : "Sign in to upload"}
          </Link>
        </div>
      </div>
      <aside className="cover">
        <div className="cover-title">
          <AudioLines size={24} /> Sample meeting
        </div>
        <div className="cover-inner">
          <small>SUPPORT OPERATIONS</small>
          <h2>Support handover</h2>
          <div className="wave" aria-hidden="true">
            {Array.from({ length: 58 }, (_, i) => (
              <i
                key={i}
                style={{
                  height:
                    12 +
                    72 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.14)) +
                    "%",
                }}
              />
            ))}
          </div>
          <div className="excerpt">
            <CheckCheck />
            <div>
              <b>Action item</b>
              <p>Compare the reported order times with the checkout logs.</p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
