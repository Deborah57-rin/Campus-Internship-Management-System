import { API_ORIGIN } from '../services/api';

export function canOpenStoredFile(url) {
  return typeof url === 'string' && url.startsWith('student-documents/');
}

export function studentDocumentHref(studentId, docType) {
  return `${API_ORIGIN}/api/files/student/${studentId}/${docType}`;
}

const CONTRACT_ROWS = [
  ['firmName', "Firm's Name"],
  ['location', 'Location'],
  ['contactPerson', 'Contact Person'],
  ['firmPhoneNumber', "Firm's Phone No."],
  ['workingDaysPerWeek', 'Working days of the week'],
  ['workingHoursPerDay', 'Working Hours per Day'],
  ['beginningDate', 'Beginning date'],
  ['endDate', 'End Date'],
  ['academicSemester', 'Academic semester'],
  ['internDuties', 'Intern Duties/Job Description'],
  ['supervisorName', "Supervisor's Name"],
  ['supervisorEmail', "Supervisor's email"],
  ['supervisorTitle', 'Title'],
  ['supervisorMobileNumber', "Supervisor's mobile number"],
  ['studentId', "Student's ID"],
  ['studentMajor', "Student's Major"],
  ['studentMinor', 'Minor'],
  ['studentEmailAddress', "Student's email address"],
  ['studentMobileNumber', "Student's Mobile Number"],
];

export default function StudentPlacementRecordsModal({ open, onClose, record }) {
  if (!open || !record) return null;

  const { student, internshipContract, studentDocuments, finalReport } = record;
  const sid = student?._id;

  const docLink = (label, docType, url, displayName) => {
    const openable = canOpenStoredFile(url);
    const href = sid ? studentDocumentHref(sid, docType) : '#';
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span className="text-right text-xs text-slate-600">
          {displayName || url || '—'}
          {openable && sid ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex rounded-lg bg-usiu-navy px-2 py-1 text-[11px] font-semibold text-white hover:bg-usiu-navy/90"
            >
              Open PDF
            </a>
          ) : url && !openable ? (
            <span className="ml-2 text-[11px] text-amber-700">(Re-upload needed for download)</span>
          ) : null}
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-slate-900/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Student internship records"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Internship records</h2>
            <p className="mt-1 text-xs text-slate-500">
              {student?.name} <span className="text-slate-400">•</span> {student?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <section className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Internship contract</h3>
          {!internshipContract ? (
            <p className="mt-2 text-xs text-slate-500">No contract details submitted yet.</p>
          ) : (
            <dl className="mt-3 space-y-2 text-xs">
              {CONTRACT_ROWS.map(([key, label]) => {
                const val =
                  key === 'supervisorTitle'
                    ? internshipContract.supervisorTitle
                    : internshipContract[key];
                if (val === undefined || val === null || val === '') return null;
                return (
                  <div key={key} className="grid gap-1 sm:grid-cols-[140px_1fr] sm:gap-3">
                    <dt className="font-medium text-slate-600">{label}</dt>
                    <dd className="whitespace-pre-wrap text-slate-800">{String(val)}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </section>

        <section className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uploaded documents</h3>
          <div className="mt-2">
            {docLink(
              'Final report',
              'final-report',
              finalReport?.fileUrl,
              finalReport?.fileOriginalName || finalReport?.fileUrl
            )}
            {docLink(
              'Evaluation form',
              'evaluation',
              studentDocuments?.evaluationFormUrl,
              studentDocuments?.evaluationOriginalName || studentDocuments?.evaluationFormUrl
            )}
            {docLink(
              'Indemnity form',
              'indemnity',
              studentDocuments?.indemnityFormUrl,
              studentDocuments?.indemnityOriginalName || studentDocuments?.indemnityFormUrl
            )}
          </div>
          {finalReport ? (
            <div className="mt-3 space-y-1 text-[11px] text-slate-500">
              <p>
                Report status: <span className="font-semibold text-slate-700">{finalReport.status}</span>
                {finalReport.title ? ` — ${finalReport.title}` : ''}
              </p>
              {finalReport.remarks ? (
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Remarks: </span>
                  {finalReport.remarks}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
