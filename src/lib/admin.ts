// Email do administrador do sistema
export const ADMIN_EMAIL = 'admin@carcheckpro.com.br'
export const ADMIN_SECRET = '329264'

export function isAdminEmail(email: string | undefined | null): boolean {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
