import React from 'react';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import Signup from '@/components/Signup';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import Upload from '@/components/Upload';
import MeetingDetails from '@/components/MeetingDetails';
import Profile from '@/components/Profile';
import Pricing from '@/components/Pricing';

function App() {
  const Landing = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 transition-colors duration-300">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Benefits />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Smart Meeting Notes Generator - AI-Powered Meeting Documentation</title>
        <meta name="description" content="Transform your meetings into actionable insights with our AI-powered Smart Meeting Notes Generator." />
      </Helmet>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/meeting/:meetingId" element={<MeetingDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;