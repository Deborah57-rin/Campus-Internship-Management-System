import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/student/dashboard');
        setData(res.data.data);
      } catch (err) {
        show(err.response?.data?.message || 'Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  const s = data?.submissions || { total: 0, approved: 0, pending: 0 };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Logbooks</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{s.total}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Approved</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-900">{s.approved}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Pending</p>
          <p className="mt-3 text-2xl font-semibold text-amber-900">{s.pending}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">My Classes</h2>
          <p className="mt-1 text-xs text-slate-500">
            Classes you are enrolled in, including lecturer, time, and venue.
          </p>
          <div className="mt-4 space-y-3">
            {data?.classes?.length ? (
              data.classes.map((c) => (
                <div key={c._id} className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Lecturer: {c.lecturer?.name || 'Not assigned'} ({c.lecturer?.email || 'N/A'})
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {c.code} • {c.semester} • {c.academicYear}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {c.beginningTime || 'N/A'} - {c.endingTime || 'N/A'} • {c.venue || 'No venue set'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">You are not enrolled in any class yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent Logbooks</h2>
          <p className="mt-1 text-xs text-slate-500">Latest submissions and their review status.</p>
          <div className="mt-4 space-y-3">
            {data?.recentLogbooks?.length ? (
              data.recentLogbooks.map((l) => (
                <div key={l._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(l.logDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {l.timeIn} - {l.timeOut} • {l.hoursWorked} hours
                    </p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize
                    ring-1
                    {l.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                      : l.status === 'Rejected'
                      ? 'bg-red-50 text-red-800 ring-red-200'
                      : 'bg-amber-50 text-amber-800 ring-amber-200'}">
                    {l.status.toLowerCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No logbooks submitted yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent Feedback</h2>
          <p className="mt-1 text-xs text-slate-500">Latest comments from your lecturer.</p>
          <div className="mt-4 space-y-3">
            {data?.recentFeedback?.length ? (
              data.recentFeedback.map((f) => (
                <div key={f.id} className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {new Date(f.logDate).toLocaleDateString()}{' '}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                      {f.status}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{f.lecturerComment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No feedback yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

