import {
  LayoutDashboard,
  BookOpenCheck,
  FileText,
  FileUp,
  Users,
  ClipboardList,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

export const DASHBOARD_MENUS = {
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Submit Logbook', to: '/student/logbook/submit', icon: BookOpenCheck },
    { label: 'Weekly Reports', to: '/student/weekly-reports', icon: FileText },
    { label: 'Documents Upload', to: '/student/documents-upload', icon: FileUp },
  ],
  lecturer: [
    { label: 'Dashboard', to: '/lecturer/dashboard', icon: LayoutDashboard },
    { label: 'Review Weekly Reports', to: '/lecturer/weekly-reports', icon: ClipboardList },
    { label: 'Reports', to: '/lecturer/reports', icon: BarChart3 },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Classes', to: '/admin/classes', icon: GraduationCap },
    { label: 'Manage Students', to: '/admin/students', icon: Users },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  ],
};

