import React, { useEffect, useState } from 'react';
import { Clock, Save, Globe, Info, Sparkles, Check } from 'lucide-react';
import { api } from '../../services/api';
import { BusinessHours, DaySchedule } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminHours: React.FC = () => {
  const [hours, setHours] = useState<BusinessHours>({
    timezone: 'Asia/Kolkata',
    days: [
      { day: 'monday', isOpen: true, openTime: '08:30', closeTime: '22:00' },
      { day: 'tuesday', isOpen: true, openTime: '08:30', closeTime: '22:00' },
      { day: 'wednesday', isOpen: true, openTime: '08:30', closeTime: '22:00' },
      { day: 'thursday', isOpen: true, openTime: '08:30', closeTime: '22:00' },
      { day: 'friday', isOpen: true, openTime: '08:30', closeTime: '22:30' },
      { day: 'saturday', isOpen: true, openTime: '08:30', closeTime: '22:30' },
      { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '21:00' },
    ],
    specialNotes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchHours = async () => {
      try {
        const res = await api.getHours();
        if (isMounted && res.hours) {
          setHours(res.hours);
        }
      } catch (err: any) {
        error(err.message || 'Failed to load hours');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHours();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleDay = (day: string) => {
    setHours((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.day === day ? { ...d, isOpen: !d.isOpen } : d)),
    }));
  };

  const handleTimeChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setHours((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.day === day ? { ...d, [field]: value } : d)),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateHours(hours);
      success('Business hours saved successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to update hours');
    } finally {
      setSaving(false);
    }
  };

  const timezones = [
    'Asia/Kolkata',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl pb-16 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-400" />
            <span>Business Hours & Timezone</span>
          </h1>
          <p className="text-xs text-slate-400">
            Automatically calculates live "Open Now" or "Closed" badge on your public page
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Schedule</span>
        </button>
      </div>

      {/* Timezone Selection Card */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" />
              <span>Business Timezone</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current times will be evaluated against this timezone
            </p>
          </div>
          <select
            value={hours.timezone}
            onChange={(e) => setHours({ ...hours, timezone: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-orange-500 focus:outline-none"
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Days Schedule Table */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 space-y-3">
        <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Weekly Operating Hours</span>
        </h2>

        <div className="divide-y divide-slate-800/80">
          {hours.days.map((dayItem) => (
            <div
              key={dayItem.day}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Day name & toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleDay(dayItem.day)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    dayItem.isOpen ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      dayItem.isOpen ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <div>
                  <span className="capitalize font-bold text-sm text-slate-200 block">
                    {dayItem.day}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {dayItem.isOpen ? 'Open for business' : 'Closed all day'}
                  </span>
                </div>
              </div>

              {/* Times input */}
              {dayItem.isOpen ? (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500">Opens</span>
                    <input
                      type="time"
                      value={dayItem.openTime}
                      onChange={(e) => handleTimeChange(dayItem.day, 'openTime', e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-500 font-bold">–</span>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-500">Closes</span>
                    <input
                      type="time"
                      value={dayItem.closeTime}
                      onChange={(e) => handleTimeChange(dayItem.day, 'closeTime', e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400">
                  Closed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special Notes */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-orange-400" />
          <span>Special Operating Notes (Displayed in hours popup)</span>
        </label>
        <input
          type="text"
          value={hours.specialNotes || ''}
          onChange={(e) => setHours({ ...hours, specialNotes: e.target.value })}
          placeholder="e.g. Fresh sourdough comes out of the stone oven daily at 9:00 AM & 4:00 PM."
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
        />
      </div>
    </form>
  );
};
