import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function FinalReportPage() {
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/student/report');
        setExisting(res.data.data);
      } catch {
        // ignore first load errors
      }
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== 'application/pdf') {
      show('Please upload a PDF file only', 'error');
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId || !title || !file) {
      show('Class, title and PDF file are required', 'error');
      return;
    }

    setLoading(true);
    try {
      // For now we fake the file upload and store a local object URL / filename.
      // In Phase 2, replace this with a real file upload endpoint or cloud storage.
      const fileUrl = file.name;

      const res = await api.post('/student/report', {
        classId,
        title,
        fileUrl,
      });
      setExisting(res.data.data);
      show('Final report submitted successfully');
      setTitle('');
      setFile(null);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to submit final report', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Class
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            >
              <option value="">Select your internship class</option>
              {/* Placeholder until real classes endpoint is implemented */}
              <option value="TODO_CLASS_ID">Sample Internship Class</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Report title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              placeholder="e.g. Internship Report – XYZ Company"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Upload PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-usiu-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-usiu-navy/90"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              PDF files only. Max size and storage will be enforced in the next phase.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-usiu-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-usiu-red/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit Final Report'}
        </button>
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Submission status</h2>
        <p className="mt-1 text-xs text-slate-500">Your current final report submission.</p>
        {existing ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">{existing.title}</p>
            <p className="mt-1">
              Status:{' '}
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${
                existing.status === 'Approved'
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                  : existing.status === 'Rejected'
                  ? 'bg-red-50 text-red-800 ring-red-200'
                  : 'bg-amber-50 text-amber-800 ring-amber-200'
              }`}>
                {existing.status}
              </span>
            </p>
            {existing.remarks && (
              <p className="mt-2 text-slate-600">
                Lecturer remarks: {existing.remarks}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-xs text-slate-500">You have not submitted a final report yet.</p>
        )}
      </div>
    </div>
  );
}

