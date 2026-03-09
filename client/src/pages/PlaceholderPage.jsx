export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">This page will be implemented in the next phase.</p>
      )}
    </div>
  );
}

