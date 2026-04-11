import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/ToastProvider';
import StatusBadge from '../../components/StatusBadge';

export default function LecturerMyClasses() {
  const { show } = useToast();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openClassId, setOpenClassId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/lecturer/classes');
        setClasses(res.data.data || []);
      } catch (err) {
        show(err.response?.data?.message || 'Failed to load classes', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [show]);

  const totalStudents = useMemo(
    () => classes.reduce((acc, c) => acc + (c.students?.length || 0), 0),
    [classes]
  );

  if (loading) return <p className="text-sm text-slate-500">Loading classes...</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">My Classes</h2>
            <p className="mt-1 text-xs text-slate-500">View assigned classes and the students enrolled.</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500">Total Students</p>
            <p className="text-2xl font-semibold text-slate-900">{totalStudents}</p>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">No classes are assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c) => {
            const isOpen = String(openClassId) === String(c._id);
            return (
              <div key={c._id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setOpenClassId(isOpen ? null : c._id)}
                  aria-expanded={isOpen}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {c.code} • {c.semester} • {c.academicYear}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {c.beginningTime || 'N/A'} - {c.endingTime || 'N/A'} • {c.venue || 'No venue set'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        {c.students?.length || 0} students
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Student</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {c.students?.length ? (
                          c.students.map((s) => (
                            <tr key={s._id}>
                              <td className="px-3 py-2 text-slate-800 font-medium">{s.name}</td>
                              <td className="px-3 py-2 text-slate-600">{s.email}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2} className="px-3 py-4 text-center text-slate-500">
                              No students enrolled.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

