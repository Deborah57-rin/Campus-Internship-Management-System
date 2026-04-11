import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';

export default function AdminReports() {
  const { show } = useToast();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/admin/classes?page=1&limit=50&search=');
      setClasses(res.data.data?.items || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load classes', 'error');
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (classId) params.set('classId', classId);
      if (status) params.set('status', status);
      const res = await api.get(`/reports/internship-progress?${params.toString()}`);
      setReport(res.data.data);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, status]);

  const logbookStats = useMemo(() => {
    if (!report) return null;
    // When a status filter is applied, show the filtered stats in the class table,
    // but keep the global cards aligned to the overall dataset.
    return report.summary.logbookStats;
  }, [report]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">Filter by class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Filter by logbook status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="sm:text-right sm:pt-6">
            <p className="text-xs font-medium text-slate-500">Completion rate</p>
            <p className="text-2xl font-semibold text-usiu-navy">{report ? report.summary.completion.completionRate : 0}%</p>
          </div>
        </div>
      </div>

      {/* Analytics cards */}
      {!loading && report && logbookStats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Logbooks</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{logbookStats.total}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Pending</p>
            <p className="mt-3 text-2xl font-semibold text-amber-900">{logbookStats.Pending}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Approved / Rejected</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status="Approved" />
              <span className="text-sm font-semibold text-emerald-900">{logbookStats.Approved}</span>
              <StatusBadge status="Rejected" />
              <span className="text-sm font-semibold text-red-900">{logbookStats.Rejected}</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading reports...</p>
      ) : report?.classSummaries?.length ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">System-wide Reports</h2>
            <p className="mt-1 text-xs text-slate-500">
              Filtered tables (status) with completion tracking per class.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Class</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Logbooks</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Final Report Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {report.classSummaries.map((c) => {
                  const stats = status ? c.logbookStatsFiltered : c.logbookStats;
                  return (
                    <tr key={c.class._id}>
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-900">{c.class.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {c.class.code} • {c.class.semester}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status="Pending" />
                          <span className="text-xs font-semibold text-amber-800">{stats.Pending}</span>
                          <StatusBadge status="Approved" />
                          <span className="text-xs font-semibold text-emerald-800">{stats.Approved}</span>
                          <StatusBadge status="Rejected" />
                          <span className="text-xs font-semibold text-red-800">{stats.Rejected}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status="Approved" />
                          <span className="text-xs font-semibold text-emerald-900">
                            {c.finalReportStats.Approved}
                          </span>
                          <StatusBadge status="Rejected" />
                          <span className="text-xs font-semibold text-red-900">
                            {c.finalReportStats.Rejected}
                          </span>
                          <StatusBadge status="Pending" />
                          <span className="text-xs font-semibold text-amber-900">
                            {c.finalReportStats.Pending}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs">
                          <div className="font-semibold text-slate-900">{c.completion.completionRate}%</div>
                          <div className="text-[11px] text-slate-500">
                            {c.completion.completedStudents}/{c.completion.totalStudents} completed
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No report data found.</p>
      )}
    </div>
  );
}

