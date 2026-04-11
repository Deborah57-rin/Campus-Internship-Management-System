export default function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();

  const className =
    s === 'approved'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
      : s === 'rejected'
      ? 'bg-red-50 text-red-800 ring-red-200'
      : s === 'pending'
      ? 'bg-amber-50 text-amber-800 ring-amber-200'
      : s === 'active'
      ? 'bg-usiu-navy/5 text-usiu-navy ring-usiu-navy/15'
      : s === 'completed'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
      : s === 'archived'
      ? 'bg-slate-100 text-slate-700 ring-slate-200'
      : 'bg-slate-100 text-slate-700 ring-slate-200';

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${className}`}>
      {status || 'Unknown'}
    </span>
  );
}

