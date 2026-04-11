import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';

export default function LecturerDashboard() {
  const { show } = useToast();
  const [classesReports, setClassesReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/lecturer/reports');
        setClassesReports(res.data.data || []);
      } catch (err) {
        show(err.response?.data?.message || 'Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const totals = useMemo(() => {
    const allStudents = classesReports.flatMap((c) => c.studentsProgress || []);
    const pendingLogbooks = allStudents.reduce((acc, s) => acc + (s.logbookStats?.pending || 0), 0);
    const pendingStudents = allStudents.filter((s) => (s.logbookStats?.pending || 0) > 0).length;
    const approvedLogbooks = allStudents.reduce((acc, s) => acc + (s.logbookStats?.approved || 0), 0);
    const rejectedLogbooks = allStudents.reduce((acc, s) => acc + (s.logbookStats?.rejected || 0), 0);

    return { pendingLogbooks, pendingStudents, approvedLogbooks, rejectedLogbooks, studentCount: allStudents.length };
  }, [classesReports]);

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Assigned Students</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{totals.studentCount}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Pending Logbooks</p>
          <p className="mt-3 text-2xl font-semibold text-amber-900">{totals.pendingLogbooks}</p>
          <p className="mt-1 text-xs text-amber-800/80">{totals.pendingStudents} students pending</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Decisions</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status="approved" />
            <span className="text-xs font-semibold text-emerald-800">{totals.approvedLogbooks}</span>
            <StatusBadge status="rejected" />
            <span className="text-xs font-semibold text-red-800">{totals.rejectedLogbooks}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Next actions</h2>
        <p className="mt-1 text-xs text-slate-500">Use the sidebar to review logbooks and update feedback.</p>
      </div>
    </div>
  );
}

