import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';
import StudentPlacementRecordsModal from '../../components/StudentPlacementRecordsModal';

export default function LecturerReports() {
  const { show } = useToast();
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [placementRecord, setPlacementRecord] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/lecturer/classes');
        setClasses(res.data.data || []);
      } catch (err) {
        show(err.response?.data?.message || 'Failed to load classes', 'error');
      }
    };
    load();
  }, [show]);

  const fetchReports = async (overrideClassId = classId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (overrideClassId) params.set('classId', overrideClassId);
      const res = await api.get(`/lecturer/reports?${params.toString()}`);
      // controller returns data directly as array in data field
      setData(res.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const aggregated = useMemo(() => {
    const allRows = data.flatMap((c) => c.studentsProgress || []);
    const uniqueIds = [...new Set(allRows.map((s) => String(s.student?._id)))];
    const studentsWithReport = new Set(
      allRows.filter((s) => s.finalReport).map((s) => String(s.student?._id))
    );

    const totalLogbooks = allRows.reduce((acc, s) => acc + (s.logbookStats?.total || 0), 0);
    const approvedLogbooks = allRows.reduce((acc, s) => acc + (s.logbookStats?.approved || 0), 0);
    const pendingLogbooks = allRows.reduce((acc, s) => acc + (s.logbookStats?.pending || 0), 0);
    const rejectedLogbooks = allRows.reduce((acc, s) => acc + (s.logbookStats?.rejected || 0), 0);

    return {
      totalStudents: uniqueIds.length,
      completed: studentsWithReport.size,
      totalLogbooks,
      approvedLogbooks,
      pendingLogbooks,
      rejectedLogbooks,
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <StudentPlacementRecordsModal
        open={Boolean(placementRecord)}
        onClose={() => setPlacementRecord(null)}
        record={placementRecord}
      />
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">Filter by class</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            >
              <option value="">All assigned classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-slate-500">Completion</p>
            <p className="text-2xl font-semibold text-usiu-navy">
              {aggregated.totalStudents ? Math.round((aggregated.completed / aggregated.totalStudents) * 100) : 0}%
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {aggregated.completed}/{aggregated.totalStudents} students with a final report
            </p>
          </div>
        </div>
      </div>

      {/* Analytics cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Students</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{aggregated.totalStudents}</p>
          
        </div>
        <div className="rounded-2xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Final Report Submitted</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-900">{aggregated.completed}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Logbooks</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{aggregated.totalLogbooks}</p>
        </div>
      </div>

      {/* Student progress per class */}
      {loading ? (
        <p className="text-sm text-slate-500">Loading reports...</p>
      ) : data.length ? (
        <div className="space-y-5">
          {data.map((c) => (
            <div key={c.class._id} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{c.class.name}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {c.class.code} • {c.class.semester} • {c.class.academicYear}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status="pending" />
                  <span className="text-xs text-slate-500">Pending</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {c.studentsProgress.reduce((acc, s) => acc + (s.logbookStats.pending || 0), 0)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Student</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Logbooks</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Final Report</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Contract & docs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {c.studentsProgress.map((s) => (
                      <tr key={s.student._id}>
                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-900">{s.student.name}</div>
                          <div className="text-[11px] text-slate-500">{s.student.email}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status="approved" />
                            <span className="text-xs font-semibold text-emerald-800">
                              {s.logbookStats.approved}
                            </span>
                            <StatusBadge status="pending" />
                            <span className="text-xs font-semibold text-amber-800">
                              {s.logbookStats.pending}
                            </span>
                            <StatusBadge status="rejected" />
                            <span className="text-xs font-semibold text-red-800">
                              {s.logbookStats.rejected}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {s.finalReport ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={s.finalReport.status} />
                                <span className="text-xs font-semibold text-slate-700">Submitted</span>
                              </div>
                              <div className="mt-1 text-[11px] text-slate-500">
                                {s.finalReport.title}
                              </div>
                            </div>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                              Not submitted
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setPlacementRecord({
                                student: s.student,
                                internshipContract: s.internshipContract,
                                studentDocuments: s.studentDocuments,
                                finalReport: s.finalReport,
                              })
                            }
                            className="rounded-lg bg-usiu-navy px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-usiu-navy/90"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No reports available.</p>
      )}
    </div>
  );
}

