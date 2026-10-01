import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock, X, KeyRound, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AdminQuickAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminQuickAccessModal: React.FC<AdminQuickAccessModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const { pinLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setUnlocked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 10) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin === '753753') {
        submitPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const submitPin = async (codeToSubmit?: string) => {
    const finalCode = (codeToSubmit || pin).trim();
    if (!finalCode) {
      setErrorMsg('Please enter the 6-digit passcode');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await pinLogin(finalCode);
      setUnlocked(true);
      success('Admin Access Granted!');
      setTimeout(() => {
        onClose();
        navigate('/admin');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect PIN code. Try again.');
      error('Access Denied: Invalid PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-900 to-black text-white rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500 ${
              unlocked
                ? 'bg-emerald-500/20 text-emerald-400 scale-110 border border-emerald-500/40'
                : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
            }`}
          >
            {unlocked ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-stone-100">
            {unlocked ? 'Admin Unlocked' : 'Business Owner Access'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Enter your 6-digit access code to open the admin panel
          </p>
        </div>

        {/* PIN Display Dots */}
        <div className="flex flex-col items-center mb-5">
          <div className="flex justify-center gap-3 mb-2">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isFilled = idx < pin.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    unlocked
                      ? 'bg-emerald-400 ring-4 ring-emerald-500/30'
                      : isFilled
                      ? 'bg-orange-500 ring-4 ring-orange-500/30 scale-110'
                      : 'bg-stone-700 border border-stone-600'
                  }`}
                />
              );
            })}
          </div>

          {/* Enter 6-digit owner passcode */}
          <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
            <KeyRound className="w-3 h-3 text-orange-400/80" />
            <span>Enter authorized owner passcode</span>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium mt-2 animate-bounce">{errorMsg}</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={loading || unlocked}
              onClick={() => handleKeyPress(digit)}
              className="h-13 py-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-orange-500/30 active:scale-95 text-xl font-semibold text-stone-100 border border-white/5 transition-all focus:outline-none"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={loading || unlocked}
            onClick={handleClear}
            className="h-13 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-stone-400 border border-white/5 transition-all"
          >
            CLEAR
          </button>
          <button
            type="button"
            disabled={loading || unlocked}
            onClick={() => handleKeyPress('0')}
            className="h-13 py-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-orange-500/30 active:scale-95 text-xl font-semibold text-stone-100 border border-white/5 transition-all"
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || unlocked}
            onClick={handleBackspace}
            className="h-13 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-stone-400 border border-white/5 transition-all"
          >
            ⌫
          </button>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          disabled={loading || unlocked || pin.length === 0}
          onClick={() => submitPin()}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : unlocked ? (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Verified! Opening Dashboard...</span>
            </>
          ) : (
            <>
              <span>Unlock Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Email Password Option */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/admin/login');
            }}
            className="text-xs text-stone-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Login with Email & Password instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
