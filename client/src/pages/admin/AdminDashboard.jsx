import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboard() {
  const { show } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/reports/internship-progress');
        setReport(res.data.data);
      } catch (err) {
        show(err.response?.data?.message || 'Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  if (!report) return <p className="text-sm text-slate-500">No dashboard data.</p>;

  const ls = report.summary.logbookStats;
  const completion = report.summary.completion;
  const classCount = report.classSummaries?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Classes</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{classCount}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Total Students</p>
          <p className="mt-3 text-2xl font-semibold text-amber-900">{completion.totalStudents}</p>
          <p className="mt-1 text-xs text-amber-800/80">Unique students enrolled in at least one class</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Completion rate</p>
          <p className="mt-3 text-2xl font-semibold text-usiu-navy">{completion.completionRate}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {completion.completedStudents}/{completion.totalStudents} submitted a final report
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Decision overview</h2>
        <p className="mt-1 text-xs text-slate-500">Logbook decisions across all classes (counts of entries).</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status="Approved" />
          <span className="text-sm font-semibold text-emerald-900">{ls.Approved}</span>
          <StatusBadge status="Rejected" />
          <span className="text-sm font-semibold text-red-900">{ls.Rejected}</span>
          <StatusBadge status="Pending" />
          <span className="text-sm font-semibold text-amber-900">{ls.Pending}</span>
        </div>
      </div>
    </div>
  );
}

