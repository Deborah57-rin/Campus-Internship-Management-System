import {
  LayoutDashboard,
  BookOpenCheck,
  FileUp,
  MessageSquareText,
  Users,
  ClipboardList,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

export const DASHBOARD_MENUS = {
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Submit Logbook', to: '/student/logbook/submit', icon: BookOpenCheck },
    { label: 'Final Report', to: '/student/report', icon: FileUp },
    { label: 'View Feedback', to: '/student/feedback', icon: MessageSquareText },
  ],
  lecturer: [
    { label: 'Dashboard', to: '/lecturer/dashboard', icon: LayoutDashboard },
    { label: 'My Classes', to: '/lecturer/classes', icon: Users },
    { label: 'Review Logbooks', to: '/lecturer/logbooks', icon: ClipboardList },
    { label: 'Reports', to: '/lecturer/reports', icon: BarChart3 },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Classes', to: '/admin/classes', icon: GraduationCap },
    { label: 'Manage Students', to: '/admin/students', icon: Users },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  ],
};

