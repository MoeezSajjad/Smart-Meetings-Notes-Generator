import React, { useEffect } from "react";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AuthForm from "./components/Login";
import Dashboard from "./components/Dashboard";
import Upload from "./components/Upload";
import MeetingDetails, { SampleMeeting } from "./components/MeetingDetails";
import Profile from "./components/Profile";
import { SessionProvider, useSession } from "./lib/Session";
import { clearLegacyCache } from "./firebase";

function Private({ children }) {
  const { user, loading } = useSession();
  if (loading) return <p role="status">Checking your session…</p>;
  return user ? (
    <React.Fragment key={user.uid}>{children}</React.Fragment>
  ) : (
    <Navigate replace to="/login" />
  );
}

function Frame() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles = {
      "/": "Meeting documentation",
      "/sample": "Sample meeting",
      "/login": "Sign in",
      "/signup": "Create an account",
      "/dashboard": "My meetings",
      "/upload": "Upload a recording",
      "/profile": "Your profile",
    };
    document.title =
      (titles[pathname] ||
        (pathname.startsWith("/meeting/")
          ? "Meeting notes"
          : "Page unavailable")) + " | Smart Meeting Notes";
    window.scrollTo(0, 0);
    document.getElementById("content")?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Header />
      <main id="content" tabIndex="-1" className="shell">
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/sample" element={<SampleMeeting />} />
          <Route path="/signup" element={<AuthForm key="signup" signup />} />
          <Route path="/login" element={<AuthForm key="login" />} />
          <Route
            path="/dashboard"
            element={
              <Private>
                <Dashboard />
              </Private>
            }
          />
          <Route
            path="/upload"
            element={
              <Private>
                <Upload />
              </Private>
            }
          />
          <Route
            path="/meeting/:meetingId"
            element={
              <Private>
                <MeetingDetails key={pathname} />
              </Private>
            }
          />
          <Route
            path="/profile"
            element={
              <Private>
                <Profile />
              </Private>
            }
          />
          <Route path="/pricing" element={<Navigate to="/sample" replace />} />
          <Route
            path="*"
            element={
              <section className="sheet">
                <h1>Page unavailable</h1>
                <Link to="/">Return home</Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer className="shell">
        <span>Smart Meeting Notes Generator</span>
        <a href="https://github.com/MoeezSajjad/Smart-Meetings-Notes-Generator">
          Project on GitHub
        </a>
      </footer>
    </>
  );
}

export default function App() {
  useEffect(clearLegacyCache, []);
  const Router =
    import.meta.env.VITE_ROUTER_MODE === "hash" ? HashRouter : BrowserRouter;
  return (
    <Router>
      <SessionProvider>
        <Frame />
      </SessionProvider>
    </Router>
  );
}
