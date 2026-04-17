import StatusBadge from './StatusBadge';

export default function LecturerWeeklyReportsTable({
  reports,
  loading,
  onReview,
  title = 'Weekly Reports',
  description,
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
      {(title || description) && (
        <div className="p-5 border-b border-slate-200">
          {title ? <h2 className="text-sm font-semibold text-slate-900">{title}</h2> : null}
          {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Student</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Class</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Week</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Status</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : reports.length ? (
              reports.map((r) => (
                <tr key={r._id}>
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-900">{r.student?.name || '—'}</div>
                    <div className="text-[11px] text-slate-500">{r.student?.email || ''}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-slate-900">{r.class?.name || '—'}</div>
                    <div className="text-[11px] text-slate-500">{r.class?.code || ''}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {new Date(r.weekStartDate).toLocaleDateString()} - {new Date(r.weekEndDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onReview(r)}
                      className="rounded-lg bg-usiu-navy px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-usiu-navy/10"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                  No weekly reports found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
