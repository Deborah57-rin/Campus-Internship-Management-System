import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';
import LecturerWeeklyReportsTable from '../../components/LecturerWeeklyReportsTable';
import LecturerWeeklyReportReviewModal from '../../components/LecturerWeeklyReportReviewModal';

export default function LecturerDashboard() {
  const { show } = useToast();
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [dailyLogsLoading, setDailyLogsLoading] = useState(false);

  const loadDashboard = async () => {
    setPageLoading(true);
    try {
      const [classesRes, reportsRes] = await Promise.all([
        api.get('/lecturer/classes'),
        api.get('/lecturer/weekly-reports'),
      ]);
      setAssignedClasses(classesRes.data.data || []);
      setReports(reportsRes.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load dashboard', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const refreshReports = async () => {
    setReportsLoading(true);
    try {
      const res = await api.get('/lecturer/weekly-reports');
      setReports(res.data.data || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load weekly reports', 'error');
    } finally {
      setReportsLoading(false);
    }
  };

  const openReview = (r) => {
    setSelected(r);
    setFeedback(r.lecturerFeedback || '');
    setDailyLogs([]);
    setModalOpen(true);
  };

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
      await refreshReports();
    } catch (err) {
      show(err.response?.data?.message || 'Failed to update weekly report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Assigned classes</h2>
        <p className="mt-1 text-xs text-slate-500">Classes currently assigned to you.</p>
        {assignedClasses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No classes are assigned to you yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignedClasses.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.code} • {c.semester} • {c.academicYear}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.beginningTime || 'N/A'} - {c.endingTime || 'N/A'} • {c.venue || 'No venue set'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                    {c.students?.length || 0} students
                  </span>
                  {c.status ? <StatusBadge status={c.status} /> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LecturerWeeklyReportsTable
        reports={reports}
        loading={reportsLoading}
        onReview={openReview}
        title="Weekly reports"
        description="All weekly reports from students in your assigned classes. Open Review weekly reports to filter by class or status."
      />

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
