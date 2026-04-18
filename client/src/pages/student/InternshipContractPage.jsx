import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';

const INITIAL_FORM = {
  firmName: '',
  location: '',
  contactPerson: '',
  firmPhoneNumber: '',
  workingDaysPerWeek: '',
  workingHoursPerDay: '',
  beginningDate: '',
  endDate: '',
  academicSemester: '',
  internDuties: '',
  supervisorName: '',
  supervisorEmail: '',
  title: '',
  supervisorMobileNumber: '',
  studentId: '',
  studentMajor: '',
  studentMinor: '',
  studentEmailAddress: '',
  studentMobileNumber: '',
};

const FIELD_CONFIG = [
  { key: 'firmName', label: "Firm's Name", type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'contactPerson', label: 'Contact Person', type: 'text' },
  { key: 'firmPhoneNumber', label: "Firm's Phone No.", type: 'tel' },
  { key: 'workingDaysPerWeek', label: 'Working days of the week', type: 'text' },
  { key: 'workingHoursPerDay', label: 'Working Hours per Day', type: 'text' },
  { key: 'beginningDate', label: 'Beginning date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
  { key: 'academicSemester', label: 'Academic semester', type: 'text' },
  { key: 'supervisorName', label: "Supervisor's Name", type: 'text' },
  { key: 'supervisorEmail', label: "Supervisor's email", type: 'email' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'supervisorMobileNumber', label: "Supervisor's mobile number", type: 'tel' },
  { key: 'studentId', label: "Student's ID", type: 'text' },
  { key: 'studentMajor', label: "Student's Major", type: 'text' },
  { key: 'studentMinor', label: 'Minor', type: 'text' },
  { key: 'studentEmailAddress', label: "Student's email address", type: 'email' },
  { key: 'studentMobileNumber', label: "Student's Mobile Number", type: 'tel' },
];

function mapContractToForm(d) {
  if (!d) return INITIAL_FORM;
  return {
    firmName: d.firmName || '',
    location: d.location || '',
    contactPerson: d.contactPerson || '',
    firmPhoneNumber: d.firmPhoneNumber || '',
    workingDaysPerWeek: d.workingDaysPerWeek || '',
    workingHoursPerDay: d.workingHoursPerDay || '',
    beginningDate: d.beginningDate || '',
    endDate: d.endDate || '',
    academicSemester: d.academicSemester || '',
    internDuties: d.internDuties || '',
    supervisorName: d.supervisorName || '',
    supervisorEmail: d.supervisorEmail || '',
    title: d.supervisorTitle || '',
    supervisorMobileNumber: d.supervisorMobileNumber || '',
    studentId: d.studentId || '',
    studentMajor: d.studentMajor || '',
    studentMinor: d.studentMinor || '',
    studentEmailAddress: d.studentEmailAddress || '',
    studentMobileNumber: d.studentMobileNumber || '',
  };
}

export default function InternshipContractPage() {
  const { show } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/student/internship-contract');
        setForm(mapContractToForm(res.data.data));
      } catch {
        // first visit or offline
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/student/internship-contract', form);
      show('Internship contract details saved successfully');
    } catch (err) {
      show(err.response?.data?.message || 'Failed to save internship contract details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading internship contract...</p>;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 space-y-4"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Internship Contract</h2>
          <p className="mt-1 text-xs text-slate-500">
            Fill in your internship placement details and keep them updated.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FIELD_CONFIG.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-700">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                required
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Intern Duties/Job Description
            </label>
            <textarea
              value={form.internDuties}
              onChange={(e) => handleChange('internDuties', e.target.value)}
              required
              rows={5}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              placeholder="Describe your key internship duties..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Internship Contract'}
        </button>
      </form>
    </div>
  );
}
