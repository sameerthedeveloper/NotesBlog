/**
 * Admin Security & Access Control Configuration
 * Centralized authorization rules for Super Admin permissions.
 */

// List of Super Admin email addresses authorized for full system administration
export const SUPER_ADMIN_EMAILS = [
  "mohamedsameer.s.2007@gmail.com"
];

/**
 * Validates whether the given authenticated user object has Super Admin privileges.
 * Performs trim & case-insensitive comparison against backend Auth identity.
 * Never trust client-side local storage or stored role flags.
 * 
 * @param {object|null} user - Firebase Auth user object (currentUser)
 * @returns {boolean} True if user email matches authorized super admin configuration
 */
export const isSuperAdmin = (user) => {
  if (!user || !user.email) return false;
  
  const userEmail = String(user.email).trim().toLowerCase();
  if (!userEmail) return false;

  return SUPER_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.trim().toLowerCase() === userEmail
  );
};
