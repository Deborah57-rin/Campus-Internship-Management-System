import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';

export default function WeeklyReportsPage() {
  const { show } = useToast();
  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [classId, setClassId] = useState('');
  const [weekStartDate, setWeekStartDate] = useState('');
  const [weekEndDate, setWeekEndDate] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, reportsRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/weekly-reports'),
      ]);
      const cls = dashboardRes.data.data?.classes || [];
      setClasses(cls);
      setReports(reportsRes.data.data || []);
      if (!classId && cls.length) {
        setClassId(cls[0]._id);
      }
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load weekly reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    if (!classId || !weekStartDate || !weekEndDate || !summary.trim()) {
      show('Class, week range, and summary are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/student/weekly-reports', {
        classId,
        weekStartDate,
        weekEndDate,
        summary: summary.trim(),
      });
      show('Weekly report submitted successfully');
      setWeekStartDate('');
      setWeekEndDate('');
      setSummary('');
      const reportsRes = await api.get('/student/weekly-reports');
      setReports(reportsRes.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to submit weekly report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading weekly reports...</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submitReport} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Submit Weekly Report</h2>
        <p className="text-xs text-slate-500">
          Summarize your week based on daily logbooks for the selected date range.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700">Class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              required
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Week start</label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Week end</label>
            <input
              type="date"
              value={weekEndDate}
              onChange={(e) => setWeekEndDate(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              required
            />
          </div>
          <div className="flex items-end">
            <p className="text-[11px] text-slate-500">
              Tip: include the same date range as your weekly daily log entries.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">Weekly summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
            required
            placeholder="Summarize your weekly tasks, progress, learning outcomes, and blockers..."
            className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Weekly Report'}
        </button>
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Weekly Report History</h2>
        <p className="mt-1 text-xs text-slate-500">Your submitted weekly reports and lecturer feedback.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Class</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Week</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Daily logs</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reports.length ? (
                reports.map((r) => (
                  <tr key={r._id}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{r.class?.name || '—'}</div>
                      <div className="text-[11px] text-slate-500">{r.class?.code || ''}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {new Date(r.weekStartDate).toLocaleDateString()} - {new Date(r.weekEndDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {r.dailyLogCount || 0} logs • {r.totalHours || 0} hrs
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {r.lecturerFeedback || 'No feedback yet'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                    No weekly reports submitted yet.
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
