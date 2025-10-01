export function getCurrentUser() {
  const stored = localStorage.getItem('aavana_user');
  if (stored) { try { return JSON.parse(stored); } catch {} }
  return { id: 'local-user', role: 'EMPLOYEE', permissions: ['leads:view','tasks:view','ai:view'] };
}

export function setCurrentUser(user) {
  localStorage.setItem('aavana_user', JSON.stringify(user));
}

export function hasPermission(user, required = []) {
  if (!required || required.length === 0) return true;
  const set = new Set((user?.permissions) || []);
  return required.every((p) => set.has(p));
}