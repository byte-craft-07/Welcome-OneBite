import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, KeyRound, Sparkles, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLogin: React.FC = () => {
  const [tab, setTab] = useState<'pin' | 'password'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('admin@businesslinkhub.local');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);

  const { login, pinLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      error('Please enter the 6-digit access PIN');
      return;
    }
    setLoading(true);
    try {
      await pinLogin(pin.trim());
      success('Admin Access Granted!');
      navigate('/admin');
    } catch (err: any) {
      error(err.message || 'Incorrect PIN code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      success('Logged in successfully!');
      navigate('/admin');
    } catch (err: any) {
      error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Authentication</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your Business Link Hub control center
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setTab('pin')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'pin'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick PIN (753753)
          </button>
          <button
            type="button"
            onClick={() => setTab('password')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'password'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* PIN Form */}
        {tab === 'pin' ? (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Enter 6-Digit Passcode</span>
                <span className="text-[11px] text-orange-400 font-mono">Code: 753753</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="753753"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-xl tracking-[0.5em] focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify PIN & Open Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Email / Password Form */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus-within:border-orange-500">
                <Mail className="w-4 h-4 text-slate-500 mr-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus-within:border-orange-500">
                <KeyRound className="w-4 h-4 text-slate-500 mr-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Log In to Dashboard</span>
              )}
            </button>
          </form>
        )}

        {/* Back to Public Site */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <Link
            to="/onebite-bakery"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5 text-orange-400" />
            <span>Return to Public Business Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
