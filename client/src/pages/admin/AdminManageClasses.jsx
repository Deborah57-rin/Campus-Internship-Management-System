import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function AdminManageClasses() {
  const { show } = useToast();

  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    semester: '',
    academicYear: '',
    beginningTime: '',
    endingTime: '',
    venue: '',
    lecturerId: '',
  });

  const [assignModal, setAssignModal] = useState({ open: false, classId: null, lecturerId: '' });

  const fetchLecturers = async () => {
    try {
      const res = await api.get('/admin/lecturers?page=1&limit=50');
      setLecturers(res.data.data?.items || []);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load lecturers', 'error');
    }
  };

  const fetchClasses = async (override = {}) => {
    setLoading(true);
    try {
      const page = override.page ?? pagination.page;
      const limit = override.limit ?? pagination.limit;
      const res = await api.get(
        `/admin/classes?page=${page}&limit=${limit}&search=${encodeURIComponent(search || '')}`
      );
      setClasses(res.data.data?.items || []);
      setPagination({
        page: res.data.data?.page || page,
        limit: res.data.data?.limit || limit,
        total: res.data.data?.total || 0,
        totalPages: res.data.data?.totalPages || 1,
      });
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
    fetchClasses({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createClass = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.code ||
      !form.semester ||
      !form.academicYear ||
      !form.beginningTime ||
      !form.endingTime ||
      !form.venue ||
      !form.lecturerId
    ) {
      show('Please fill all class fields including lecturer', 'error');
      return;
    }

    try {
      await api.post('/admin/classes', form);
      show('Class created successfully');
      setForm({
        name: '',
        code: '',
        semester: '',
        academicYear: '',
        beginningTime: '',
        endingTime: '',
        venue: '',
        lecturerId: '',
      });
      fetchClasses({ page: 1 });
    } catch (err) {
      show(err.response?.data?.message || 'Failed to create class', 'error');
    }
  };

  const openAssign = (classId) => {
    const defaultLecturer = lecturers[0]?._id || '';
    setAssignModal({ open: true, classId, lecturerId: defaultLecturer });
  };

  const assignLecturer = async () => {
    try {
      await api.patch(`/admin/classes/${assignModal.classId}/lecturer`, {
        lecturerId: assignModal.lecturerId,
      });
      show('Lecturer assigned successfully');
      setAssignModal({ open: false, classId: null, lecturerId: '' });
      fetchClasses();
    } catch (err) {
      show(err.response?.data?.message || 'Failed to assign lecturer', 'error');
    }
  };

  const deleteClass = async (classId) => {
    const ok = window.confirm('Delete this class? This will also delete related logbooks and reports.');
    if (!ok) return;
    try {
      await api.delete(`/admin/classes/${classId}`);
      show('Class deleted successfully');
      fetchClasses();
    } catch (err) {
      show(err.response?.data?.message || 'Failed to delete class', 'error');
    }
  };

  const pageButtons = useMemo(() => {
    const current = pagination.page;
    const totalPages = pagination.totalPages || 1;
    const buttons = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= current - 2 && p <= current + 2)) buttons.push(p);
    }
    return [...new Set(buttons)];
  }, [pagination.page, pagination.totalPages]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Create Class</h2>
        <p className="mt-1 text-xs text-slate-500">Create a new internship class and assign a lecturer.</p>

        <form onSubmit={createClass} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">Class Name</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. BSc Computer Science Internship"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Class Code</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. CSI-INTR-101"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Semester</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.semester}
              onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
              placeholder="e.g. Semester 1"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Academic Year</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.academicYear}
              onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
              placeholder="e.g. 2026"
              pattern="\d{4}"
              title="Academic year must be a 4-digit year (YYYY)"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">Assign Lecturer</label>
            <select
              value={form.lecturerId}
              onChange={(e) => setForm((p) => ({ ...p, lecturerId: e.target.value }))}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              required
            >
              <option value="">Select a lecturer</option>
              {lecturers.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} ({l.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Beginning Time</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.beginningTime}
              onChange={(e) => setForm((p) => ({ ...p, beginningTime: e.target.value }))}
              placeholder="e.g. 08:00 AM"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Ending Time</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.endingTime}
              onChange={(e) => setForm((p) => ({ ...p, endingTime: e.target.value }))}
              placeholder="e.g. 11:00 AM"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">Venue</label>
            <input
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
              value={form.venue}
              onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
              placeholder="e.g. Main Campus Hall A"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-usiu-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-usiu-navy/90 focus:outline-none focus:ring-4 focus:ring-usiu-gold/35 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Create Class
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Manage Classes</h2>
            <p className="mt-1 text-xs text-slate-500">Search and paginate through existing classes.</p>
          </div>
          <div className="w-full sm:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name/code/semester/year"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            />
            <button
              type="button"
              onClick={() => fetchClasses({ page: 1 })}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Class</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Lecturer</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Students</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : classes.length ? (
                classes.map((c) => (
                  <tr key={c._id}>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.code} • {c.semester}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.beginningTime} - {c.endingTime} • {c.venue}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{c.lecturer?.name}</div>
                      <div className="text-[11px] text-slate-500">{c.lecturer?.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        {c.students?.length || 0}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openAssign(c._id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Assign Lecturer
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteClass(c._id)}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Page <span className="font-semibold">{pagination.page}</span> of{' '}
            <span className="font-semibold">{pagination.totalPages}</span> • Total{' '}
            <span className="font-semibold">{pagination.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => fetchClasses({ page: pagination.page - 1 })}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            {pageButtons.map((p) => (
              <button
                key={p}
                type="button"
                disabled={p === pagination.page}
                onClick={() => fetchClasses({ page: p })}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
                  p === pagination.page
                    ? 'bg-usiu-navy text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                } disabled:opacity-60`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchClasses({ page: pagination.page + 1 })}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Assign lecturer modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900">Assign Lecturer</h3>
              <p className="mt-1 text-xs text-slate-500">Choose a lecturer for the selected class.</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700">Lecturer</label>
                <select
                  value={assignModal.lecturerId}
                  onChange={(e) => setAssignModal((p) => ({ ...p, lecturerId: e.target.value }))}
                  className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
                >
                  {lecturers.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setAssignModal({ open: false, classId: null, lecturerId: '' })}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={assignLecturer}
                className="rounded-xl bg-usiu-navy px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

