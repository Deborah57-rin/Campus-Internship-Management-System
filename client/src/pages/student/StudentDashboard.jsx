import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { canOpenStoredFile, studentDocumentHref } from '../../components/StudentPlacementRecordsModal';

export default function StudentDashboard() {
  const { user } = useAuth();
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

  const classes = data?.classes || [];
  const stats = data?.logbookStats || { total: 0, approved: 0, pending: 0, rejected: 0 };
  const rate = data?.logbookCompletionRate;
  const report = data?.finalReport;
  const studentDocuments = data?.studentDocuments;
  const feedback = data?.recentFeedback || [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Class enrolled</h2>
        <p className="mt-1 text-xs text-slate-500">Your internship class and schedule details.</p>
        <div className="mt-4 space-y-3">
          {classes.length ? (
            classes.map((c) => (
              <div key={c._id} className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
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
            <p className="text-xs text-slate-500">You are not enrolled in a class yet. Contact your administrator.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Internship Contract</h2>
        <p className="mt-1 text-xs text-slate-500">
          Capture and update your internship placement and supervisor details.
        </p>
        <div className="mt-4">
          <Link
            to="/student/internship-contract"
            className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35"
          >
            Open Internship Contract Form
          </Link>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Internship documents</h2>
        <p className="mt-1 text-xs text-slate-500">
          Download official internship forms from the USIU website before uploading them.
        </p>
        <div className="mt-4">
          <a
            href="https://www.usiu.ac.ke/resource-downloads/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35"
          >
            Open USIU Resource Downloads
          </a>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Logbook completion rate</h2>
        <p className="mt-1 text-xs text-slate-500">
          Share of your submitted logbook entries that have been approved by your lecturer.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <p className="text-3xl font-semibold text-usiu-navy tabular-nums">
              {rate === null ? '—' : `${rate}%`}
            </p>
            {rate === null ? (
              <p className="mt-1 text-xs text-slate-500">Submit a logbook to see your rate.</p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">
                {stats.approved} approved of {stats.total} submitted
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            <span className="rounded-full bg-amber-50 px-2 py-1 font-medium text-amber-900 ring-1 ring-amber-100">
              Pending {stats.pending}
            </span>
            <span className="rounded-full bg-red-50 px-2 py-1 font-medium text-red-900 ring-1 ring-red-100">
              Rejected {stats.rejected}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Internship report status</h2>
        <p className="mt-1 text-xs text-slate-500">Final report submission and lecturer review.</p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          {report ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">{report.title}</p>
              {report.class?.name ? (
                <p className="text-xs text-slate-500">
                  Class: {report.class.name}
                  {report.class.code ? ` (${report.class.code})` : ''}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={report.status} />
                {report.reviewedAt ? (
                  <span className="text-[11px] text-slate-500">
                    Updated {new Date(report.reviewedAt).toLocaleString()}
                  </span>
                ) : null}
                {(() => {
                  const sid = user?._id || user?.id;
                  if (!sid || !canOpenStoredFile(report.fileUrl)) return null;
                  return (
                    <a
                      href={studentDocumentHref(sid, 'final-report')}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-usiu-navy hover:underline"
                    >
                      Open final report PDF
                    </a>
                  );
                })()}
              </div>
              {report.remarks ? (
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Lecturer remarks: </span>
                  {report.remarks}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-slate-600">You have not submitted your internship report yet.</p>
          )}
          <div className="mt-4 border-t border-slate-200 pt-3 space-y-1.5 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-700">Other uploaded forms</p>
            {(() => {
              const sid = user?._id || user?.id;
              const openIf = (path, docType) =>
                sid && canOpenStoredFile(path) ? (
                  <a
                    href={studentDocumentHref(sid, docType)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 font-semibold text-usiu-navy hover:underline"
                  >
                    Open
                  </a>
                ) : null;
              return (
                <>
                  <p className="flex flex-wrap items-center gap-x-1">
                    Indemnity form:{' '}
                    {studentDocuments?.indemnityFormUrl ? (
                      <span className="font-medium text-slate-800">
                        {studentDocuments.indemnityOriginalName || studentDocuments.indemnityFormUrl}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not uploaded</span>
                    )}
                    {openIf(studentDocuments?.indemnityFormUrl, 'indemnity')}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-1">
                    Evaluation form:{' '}
                    {studentDocuments?.evaluationFormUrl ? (
                      <span className="font-medium text-slate-800">
                        {studentDocuments.evaluationOriginalName || studentDocuments.evaluationFormUrl}
                      </span>
                    ) : (
                      <span className="text-slate-500">Not uploaded</span>
                    )}
                    {openIf(studentDocuments?.evaluationFormUrl, 'evaluation')}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Recent feedback</h2>
        <p className="mt-1 text-xs text-slate-500">Latest comments from your lecturer on logbook entries.</p>
        <div className="mt-4 space-y-3">
          {feedback.length ? (
            feedback.map((f) => (
              <div key={f.id} className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
                <p className="text-xs font-semibold text-slate-700">
                  {f.reviewedAt
                    ? new Date(f.reviewedAt).toLocaleString()
                    : new Date(f.logDate).toLocaleDateString()}
                  <span className="ml-2">
                    <StatusBadge status={f.status} />
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap">{f.lecturerComment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No feedback yet. Feedback appears after your lecturer reviews a logbook.</p>
          )}
        </div>
      </section>
    </div>
  );
}
