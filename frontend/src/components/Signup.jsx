import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupWithEmail } from '../firebase';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupWithEmail(form.email, form.password);
      navigate('/');
    } catch (err) {
      window.alert(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Start generating smart meeting notes in minutes.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
          </div>

          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link></p>
      </div>
    </div>
  );
};

export default Signup;
