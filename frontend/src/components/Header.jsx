import React, { useEffect, useState } from "react";
import { AudioLines, Moon, Sun } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useSession } from "../lib/Session";

export default function Header() {
  const { user } = useSession();
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("darkMode") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("darkMode", String(dark));
    } catch {}
  }, [dark]);
  return (
    <header>
      <div className="shell bar">
        <Link className="brand" to="/">
          <span className="mark">
            <AudioLines />
          </span>
          Smart Meeting Notes
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/sample">Sample meeting</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Account</NavLink>
            </>
          ) : (
            <NavLink to="/login">Sign in</NavLink>
          )}
          <button
            className="theme"
            aria-label={dark ? "Use light theme" : "Use dark theme"}
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
