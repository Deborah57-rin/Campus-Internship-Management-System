import StatusBadge from './StatusBadge';

export default function LecturerLogbookReviewModal({
  selected,
  comment,
  onCommentChange,
  onClose,
  onSubmitDecision,
  submitting,
}) {
  if (!selected) return null;

  return (
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
            onClick={onClose}
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
            <p className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{selected.activities}</p>
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
              onChange={(e) => onCommentChange(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-usiu-navy focus:ring-4 focus:ring-usiu-navy/10"
              placeholder="Write feedback for the student..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmitDecision('Approved')}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onSubmitDecision('Rejected')}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
