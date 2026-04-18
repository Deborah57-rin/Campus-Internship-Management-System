import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function SubmitLogbook() {
  const [logDate, setLogDate] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [activities, setActivities] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const { show } = useToast();

  useEffect(() => {
    // TODO: replace with real "my classes" endpoint when available
    const load = async () => {
      try {
        const [logRes] = await Promise.all([
          api.get('/student/logbooks'),
        ]);
        setHistory(logRes.data.data || []);
      } catch {
        // ignore initial history errors
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/student/logbooks', {
        logDate,
        timeIn,
        timeOut,
        hoursWorked: Number(hoursWorked),
        activities,
      });
      show('Logbook submitted successfully');
      setLogDate('');
      setTimeIn('');
      setTimeOut('');
      setHoursWorked('');
      setActivities('');

      const res = await api.get('/student/logbooks');
      setHistory(res.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to submit logbook', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Time In
            </label>
            <input
              type="time"
              value={timeIn}
              onChange={(e) => setTimeIn(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Time Out
            </label>
            <input
              type="time"
              value={timeOut}
              onChange={(e) => setTimeOut(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700">
              Hours Worked
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Tasks and activities (daily log)
          </label>
          <textarea
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            required
            rows={5}
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            placeholder="Describe the tasks and activities you performed today..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Logbook'}
        </button>
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Submission history</h2>
        <p className="mt-1 text-xs text-slate-500">Your previous logbook submissions.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Time</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Hours</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {history.length ? (
                history.map((l) => (
                  <tr key={l._id}>
                    <td className="px-3 py-2 text-slate-800">{new Date(l.logDate).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-slate-600">{l.timeIn} - {l.timeOut}</td>
                    <td className="px-3 py-2 text-slate-600">{l.hoursWorked}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${
                        l.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : l.status === 'Rejected'
                          ? 'bg-red-50 text-red-800 ring-red-200'
                          : 'bg-amber-50 text-amber-800 ring-amber-200'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-center text-slate-500">
                    No logbooks submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

