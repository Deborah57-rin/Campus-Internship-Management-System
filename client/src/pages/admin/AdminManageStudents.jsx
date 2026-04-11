import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function AdminManageStudents() {
  const { show } = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const [classDetails, setClassDetails] = useState(null);

  const [studentsRes, setStudentsRes] = useState({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/admin/classes?page=1&limit=50&search=');
      setClasses(res.data.data?.items || []);
      if (!selectedClassId && res.data.data?.items?.length) {
        setSelectedClassId(res.data.data.items[0]._id);
      }
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load classes', 'error');
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      const res = await api.get(`/admin/classes/${classId}`);
      setClassDetails(res.data.data);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load class details', 'error');
    }
  };

  const fetchStudents = async (override = {}) => {
    try {
      const page = override.page ?? studentsRes.page;
      const limit = override.limit ?? studentsRes.limit;
      const res = await api.get(
        `/admin/students?page=${page}&limit=${limit}&search=${encodeURIComponent(studentSearch || '')}`
      );
      setStudentsRes({
        items: res.data.data?.items || [],
        page: res.data.data?.page || page,
        limit: res.data.data?.limit || limit,
        total: res.data.data?.total || 0,
        totalPages: res.data.data?.totalPages || 1,
      });
    } catch (err) {
      show(err.response?.data?.message || 'Failed to load students', 'error');
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassDetails(selectedClassId);
      fetchStudents({ page: 1 });
      setSelectedEmails([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  const toggleEmail = (email) => {
    setSelectedEmails((prev) => {
      if (prev.includes(email)) return prev.filter((e) => e !== email);
      return [...prev, email];
    });
  };

  const enrollSelected = async () => {
    if (!selectedClassId) {
      show('Select a class first', 'error');
      return;
    }
    if (!selectedEmails.length) {
      show('Select at least one student', 'error');
      return;
    }
    try {
      await api.patch(`/admin/classes/${selectedClassId}/enroll`, {
        studentEmails: selectedEmails,
      });
      show('Students enrolled successfully');
      fetchClassDetails(selectedClassId);
      setSelectedEmails([]);
    } catch (err) {
      show(err.response?.data?.message || 'Failed to enroll students', 'error');
    }
  };

  const pageButtons = useMemo(() => {
    const current = studentsRes.page;
    const totalPages = studentsRes.totalPages || 1;
    const buttons = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= current - 2 && p <= current + 2)) buttons.push(p);
    }
    return [...new Set(buttons)];
  }, [studentsRes.page, studentsRes.totalPages]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Enroll Students into a Class</h2>
        <p className="mt-1 text-xs text-slate-500">Search students, select them, and enroll into the selected class.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium text-slate-500">Current Students</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{classDetails?.students?.length || 0}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {classDetails?.beginningTime || 'N/A'} - {classDetails?.endingTime || 'N/A'} • {classDetails?.venue || 'No venue set'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:w-80">
            <label className="block text-xs font-medium text-slate-700">Search Students</label>
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by name or email"
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-usiu-navy focus:ring-2 focus:ring-usiu-navy/20"
            />
            <button
              type="button"
              onClick={() => fetchStudents({ page: 1 })}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>

          <div className="w-full sm:text-right">
            <p className="text-xs font-medium text-slate-500">Selected</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedEmails.length}</p>
            <button
              type="button"
              onClick={enrollSelected}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-usiu-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-usiu-red/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedEmails.length}
            >
              Enroll Selected
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Select</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {studentsRes.items.length ? (
                studentsRes.items.map((s) => (
                  <tr key={s._id}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(s.email)}
                        onChange={() => toggleEmail(s.email)}
                        className="h-4 w-4 rounded border-slate-300 text-usiu-navy focus:ring-usiu-navy/20"
                      />
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-3 py-3 text-slate-600">{s.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Page <span className="font-semibold">{studentsRes.page}</span> of{' '}
            <span className="font-semibold">{studentsRes.totalPages}</span> • Total{' '}
            <span className="font-semibold">{studentsRes.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={studentsRes.page <= 1}
              onClick={() => fetchStudents({ page: studentsRes.page - 1 })}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
            >
              Prev
            </button>
            {pageButtons.map((p) => (
              <button
                key={p}
                type="button"
                disabled={p === studentsRes.page}
                onClick={() => fetchStudents({ page: p })}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
                  p === studentsRes.page
                    ? 'bg-usiu-navy text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                } disabled:opacity-60`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={studentsRes.page >= studentsRes.totalPages}
              onClick={() => fetchStudents({ page: studentsRes.page + 1 })}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

