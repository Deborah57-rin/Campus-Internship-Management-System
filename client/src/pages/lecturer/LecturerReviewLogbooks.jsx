import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';

export default function LecturerReviewLogbooks() {
  const { show } = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const fetchLogbooks = async (override = {}) => {
    setLoading(true);
    try {
      const classId = override.selectedClassId ?? selectedClassId;
      const status = override.statusFilter ?? statusFilter;

      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (classId) params.set('classId', classId);

      const res = await api.get(`/lecturer/logbooks?${params.toString()}`);
      setLogbooks(res.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load logbooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, statusFilter]);

  const openReview = (l) => {
    setSelected(l);
    setComment(l.lecturerComment || '');
    setModalOpen(true);
  };

  const pendingOnly = useMemo(() => statusFilter === 'Pending', [statusFilter]);

  const submitDecision = async (nextStatus) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.patch(`/lecturer/logbooks/${selected._id}`, {
        status: nextStatus,
        lecturerComment: comment,
      });
      show(`Logbook ${nextStatus.toLowerCase()} successfully`);

      setModalOpen(false);
      setSelected(null);
      setComment('');

      // Refresh current list
      fetchLogbooks();
    } catch (err) {
      show(err.response?.data?.message || 'Failed to update logbook', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
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
          <div>
            <label className="block text-xs font-medium text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {pendingOnly ? 'Review students daily submissions waiting for approval.' : 'Showing logbooks by selected status.'}
        </p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Pending Logbooks</h2>
          <p className="mt-1 text-xs text-slate-500">Clean, filterable table with status badges.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Student</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Class</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Date</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Time</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Hours</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : logbooks.length ? (
                logbooks.map((l) => (
                  <tr key={l._id}>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{l.student?.name}</div>
                      <div className="text-[11px] text-slate-500">{l.student?.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{l.class?.name}</div>
                      <div className="text-[11px] text-slate-500">{l.class?.code}</div>
                    </td>
                    <td className="px-3 py-2 text-slate-800 font-semibold">{new Date(l.logDate).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-slate-600">{l.timeIn} - {l.timeOut}</td>
                    <td className="px-3 py-2 text-slate-600">{l.hoursWorked}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => openReview(l)}
                        className="rounded-lg bg-usiu-navy px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-usiu-navy/10"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                    No logbooks found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Logbook Review</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.student?.name} • {selected.class?.code} • {new Date(selected.logDate).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-auto">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.status} />
                {selected.reviewedAt ? (
                  <span className="text-[11px] text-slate-500">
                    Reviewed: {new Date(selected.reviewedAt).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">Not reviewed yet</span>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-xs font-semibold text-slate-800">Tasks description</p>
                <p className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                  {selected.activities}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Work time</p>
                  <p className="mt-1 text-xs text-slate-700">
                    {selected.timeIn} - {selected.timeOut} ({selected.hoursWorked} hours)
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Student</p>
                  <p className="mt-1 text-xs text-slate-700">{selected.student?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">Feedback / comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-usiu-navy focus:ring-4 focus:ring-usiu-navy/10"
                  placeholder="Write feedback for the student..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => submitDecision('Approved')}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => submitDecision('Rejected')}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

