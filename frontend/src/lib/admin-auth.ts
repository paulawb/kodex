const KEY = "kodex_admin_pass";

/** La sesión del admin vive en sessionStorage:
 *  al cerrar la pestaña/navegador se borra y vuelve a pedir contraseña. */
export function getAdminPass(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(KEY) || null;
}

export function setAdminPass(password: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, password);
  // Limpiamos cualquier contraseña vieja guardada de forma permanente.
  localStorage.removeItem(KEY);
}

export function clearAdminPass(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(KEY);
}
