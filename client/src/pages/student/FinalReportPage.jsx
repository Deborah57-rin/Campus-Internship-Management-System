import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { canOpenStoredFile, studentDocumentHref } from '../../components/StudentPlacementRecordsModal';

function buildSupportingState(finalReport, documents) {
  return {
    finalReportFileName:
      finalReport?.fileOriginalName || finalReport?.fileUrl || null,
    evaluationFormFileName:
      documents?.evaluationOriginalName || documents?.evaluationFormUrl || null,
    indemnityFormFileName:
      documents?.indemnityOriginalName || documents?.indemnityFormUrl || null,
    finalReportPath: finalReport?.fileUrl || null,
    evaluationPath: documents?.evaluationFormUrl || null,
    indemnityPath: documents?.indemnityFormUrl || null,
  };
}

export default function FinalReportPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [evaluationFormFile, setEvaluationFormFile] = useState(null);
  const [indemnityFormFile, setIndemnityFormFile] = useState(null);
  const [supportingDocs, setSupportingDocs] = useState({
    finalReportFileName: null,
    evaluationFormFileName: null,
    indemnityFormFileName: null,
    finalReportPath: null,
    evaluationPath: null,
    indemnityPath: null,
  });
  const [existing, setExisting] = useState(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [indemnityLoading, setIndemnityLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const { show } = useToast();

  const refreshFromServer = async () => {
    const res = await api.get('/student/report');
    const { finalReport, documents } = res.data.data || {};
    setExisting(finalReport || null);
    setSupportingDocs(buildSupportingState(finalReport, documents));
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshFromServer();
      } catch {
        // ignore first load errors
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  const readPdfFile = (e, setter) => {
    const f = e.target.files?.[0];
    if (!f) {
      setter(null);
      return;
    }
    if (f.type !== 'application/pdf') {
      show('Please upload a PDF file only', 'error');
      e.target.value = '';
      setter(null);
      return;
    }
    setter(f);
  };

  const handleDocumentsSubmit = async (e) => {
    e.preventDefault();
    if (!title || !finalReportFile || !evaluationFormFile) {
      show('Report title, final report PDF, and evaluation form PDF are required', 'error');
      return;
    }

    setDocumentsLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('finalReport', finalReportFile);
      fd.append('evaluationForm', evaluationFormFile);
      await api.post('/student/report', fd);
      await refreshFromServer();
      show('Documents uploaded successfully');
      setTitle('');
      setFinalReportFile(null);
      setEvaluationFormFile(null);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to upload documents', 'error');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleIndemnityUpload = async (e) => {
    e.preventDefault();
    if (!indemnityFormFile) {
      show('Please choose the Internship Counter Indemnity Form PDF first', 'error');
      return;
    }

    setIndemnityLoading(true);
    try {
      const fd = new FormData();
      fd.append('indemnity', indemnityFormFile);
      await api.post('/student/documents/indemnity', fd);
      await refreshFromServer();
      show('Internship Counter Indemnity Form uploaded successfully');
      setIndemnityFormFile(null);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to upload Internship Counter Indemnity Form', 'error');
    } finally {
      setIndemnityLoading(false);
    }
  };

  if (pageLoading) {
    return <p className="text-sm text-slate-500">Loading documents...</p>;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleIndemnityUpload}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Internship Counter Indemnity Form</h2>
          <p className="mt-1 text-xs text-slate-500">
            Upload this form separately at the beginning of your internship.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700">
            Internship Counter Indemnity Form upload (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => readPdfFile(e, setIndemnityFormFile)}
            className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-usiu-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-usiu-navy/90"
          />
        </div>

        <button
          type="submit"
          disabled={indemnityLoading}
          className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {indemnityLoading ? 'Uploading...' : 'Upload Indemnity Form'}
        </button>
      </form>

      <form onSubmit={handleDocumentsSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Documents Upload</h2>
          <p className="mt-1 text-xs text-slate-500">
            Upload your final report and evaluation form documents.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              Final report upload (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => readPdfFile(e, setFinalReportFile)}
              className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-usiu-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-usiu-navy/90"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Evaluation form upload (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => readPdfFile(e, setEvaluationFormFile)}
              className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-usiu-navy file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-usiu-navy/90"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              PDF only, max 15MB per file. Files are stored on the server for your lecturer and admins to open.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={documentsLoading}
          className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {documentsLoading ? 'Uploading...' : 'Upload Final Report Documents'}
        </button>
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">Uploaded document status</h2>
        <p className="mt-1 text-xs text-slate-500">Your current final report and supporting document uploads.</p>
        {existing ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">{existing.title}</p>
            <p className="mt-1">
              Final report status:{' '}
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
          <p className="mt-4 text-xs text-slate-500">You have not uploaded your final report yet.</p>
        )}

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700 ring-1 ring-slate-100">
          <p className="font-semibold text-slate-900">Supporting documents</p>
          {(() => {
            const sid = user?._id || user?.id;
            const openIf = (path, docType) =>
              sid && canOpenStoredFile(path) ? (
                <a
                  href={studentDocumentHref(sid, docType)}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-[11px] font-semibold text-usiu-navy hover:underline"
                >
                  Open PDF
                </a>
              ) : null;
            return (
              <>
                <p className="mt-1 flex flex-wrap items-center gap-x-1">
                  Final report file:{' '}
                  <span className="font-medium text-slate-800">
                    {supportingDocs?.finalReportFileName || 'Not uploaded'}
                  </span>
                  {openIf(supportingDocs?.finalReportPath, 'final-report')}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1">
                  Evaluation form:{' '}
                  <span className="font-medium text-slate-800">
                    {supportingDocs?.evaluationFormFileName || 'Not uploaded'}
                  </span>
                  {openIf(supportingDocs?.evaluationPath, 'evaluation')}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1">
                  Internship Counter Indemnity Form:{' '}
                  <span className="font-medium text-slate-800">
                    {supportingDocs?.indemnityFormFileName || 'Not uploaded'}
                  </span>
                  {openIf(supportingDocs?.indemnityPath, 'indemnity')}
                </p>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
