/**
 * Hardcoded email -> role mapping.
 */
const LECTURER_EMAILS = [
  'grace.wanjiku@usiu.ac.ke',
  'kevin.otieno@usiu.ac.ke',
  'lydia.achieng@usiu.ac.ke',
  'brian.mwangi@usiu.ac.ke',
  'ruth.njeri@usiu.ac.ke',
  'dennis.kiptoo@usiu.ac.ke',
];

const INTERNSHIP_OFFICER_EMAILS = [
  'naomi.wanjiru@usiu.ac.ke',
  'samuel.kariuki@usiu.ac.ke',
];

function roleFromEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return 'student';

  if (INTERNSHIP_OFFICER_EMAILS.some((e) => String(e).toLowerCase() === normalized)) return 'admin';
  if (LECTURER_EMAILS.some((e) => String(e).toLowerCase() === normalized)) return 'lecturer';
  return 'student';
}

module.exports = { roleFromEmail };

