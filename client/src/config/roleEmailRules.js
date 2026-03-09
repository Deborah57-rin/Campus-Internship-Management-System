export const LECTURER_EMAILS = [
  // TODO: replace with your 4 lecturer emails
  'lecturer1@usiu.ac.ke',
  'lecturer2@usiu.ac.ke',
  'lecturer3@usiu.ac.ke',
  'lecturer4@usiu.ac.ke',
];

export const INTERNSHIP_OFFICER_EMAILS = [
  // TODO: replace with your 2 internship officer (admin) emails
  'officer1@usiu.ac.ke',
  'officer2@usiu.ac.ke',
  'admin@usiu.ac.ke',
];

/**
 * Enforces hardcoded email-based roles:
 * - internship officer emails -> "admin"
 * - lecturer emails -> "lecturer"
 * - everyone else -> "student"
 */
export function roleFromEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return 'student';

  if (INTERNSHIP_OFFICER_EMAILS.some((e) => e.toLowerCase() === normalized)) return 'admin';
  if (LECTURER_EMAILS.some((e) => e.toLowerCase() === normalized)) return 'lecturer';
  return 'student';
}

