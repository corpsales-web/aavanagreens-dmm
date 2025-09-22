export function getCurrentUser() {
  // In production, fetch from backend session/JWT. For now, read from localStorage for quick control.
  const stored = localStorage.getItem('aavana_user');
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  // Default minimal user (employee)
  return {
    id: 'local-user',
    role: 'EMPLOYEE',
    permissions: ['leads:view', 'tasks:view', 'ai:view']
  };
}

export function setCurrentUser(user) {
  localStorage.setItem('aavana_user', JSON.stringify(user));
}

export function hasPermission(user, required = []) {
  if (!required || required.length === 0) return true;
  const set = new Set((user?.permissions) || []);
  return required.every((p) => set.has(p));
}