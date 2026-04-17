import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import LecturerWeeklyReportsTable from '../../components/LecturerWeeklyReportsTable';
import LecturerWeeklyReportReviewModal from '../../components/LecturerWeeklyReportReviewModal';

export default function LecturerReviewLogbooks() {
  const { show } = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [dailyLogsLoading, setDailyLogsLoading] = useState(false);

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

  const fetchReports = async (override = {}) => {
    setLoading(true);
    try {
      const classId = override.selectedClassId ?? selectedClassId;
      const status = override.statusFilter ?? statusFilter;

      const params = new URLSearchParams();
      if (status && status !== 'all') params.set('status', status);
      if (classId) params.set('classId', classId);

      const res = await api.get(`/lecturer/weekly-reports?${params.toString()}`);
      setReports(res.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load weekly reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, statusFilter]);

  const openReview = (r) => {
    setSelected(r);
    setFeedback(r.lecturerFeedback || '');
    setDailyLogs([]);
    setModalOpen(true);
  };

  const pendingOnly = useMemo(() => statusFilter === 'Pending', [statusFilter]);

  const tableTitle = useMemo(() => {
    if (statusFilter === 'all') return 'All weekly reports';
    return `${statusFilter} weekly reports`;
  }, [statusFilter]);

  const loadDailyLogs = async () => {
    if (!selected?._id) return;
    setDailyLogsLoading(true);
    try {
      const res = await api.get(`/lecturer/weekly-reports/${selected._id}/daily-logs`);
      setDailyLogs(res.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load daily logs', 'error');
    } finally {
      setDailyLogsLoading(false);
    }
  };

  const submitDecision = async (nextStatus) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.patch(`/lecturer/weekly-reports/${selected._id}`, {
        status: nextStatus,
        lecturerFeedback: feedback,
      });
      show(`Weekly report ${nextStatus.toLowerCase()} successfully`);

      setModalOpen(false);
      setSelected(null);
      setFeedback('');
      setDailyLogs([]);

      // Refresh current list
      fetchReports();
    } catch (err) {
      show(err.response?.data?.message || 'Failed to update weekly report', 'error');
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
              <option value="all">All weekly reports</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {statusFilter === 'all'
            ? 'All weekly reports for the selected class filter. Open Review to read summary and view daily logs.'
            : pendingOnly
            ? 'Review weekly reports waiting for approval.'
            : 'Showing weekly reports matching the selected status.'}
        </p>
      </div>

      <LecturerWeeklyReportsTable
        reports={reports}
        loading={loading}
        onReview={openReview}
        title={tableTitle}
        description="Student, class, week range, status, and action. Open a row to review summary and provide feedback."
      />

      {/* Details modal */}
      {modalOpen && selected ? (
        <LecturerWeeklyReportReviewModal
          selected={selected}
          feedback={feedback}
          onFeedbackChange={setFeedback}
          onClose={() => setModalOpen(false)}
          onSubmitDecision={submitDecision}
          submitting={submitting}
          onViewDailyLogs={loadDailyLogs}
          dailyLogs={dailyLogs}
          dailyLogsLoading={dailyLogsLoading}
        />
      ) : null}
    </div>
  );
}

