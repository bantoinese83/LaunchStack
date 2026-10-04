export const LOCALES = ['en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

export const dictionaries = {
  en: {
    consentTitle: 'Cookies and privacy',
    consentBody:
      'We use necessary cookies to run the app. Analytics and marketing cookies are optional.',
    acceptAll: 'Accept all',
    rejectOptional: 'Necessary only',
    privacy: 'Privacy',
    security: 'Security',
    language: 'Language',
    overview: 'Overview',
    feedback: 'Feedback',
    settings: 'Settings',
    profile: 'Profile',
    signIn: 'Sign In',
    signOut: 'Sign out',
    welcomeBack: 'Welcome back',
    createAccount: 'Create an account',
    forgotPassword: 'Forgot password?',
    magicLink: 'Email me a magic link',
    passkey: 'Continue with a passkey',
    recoveryCode: 'Use a recovery code',
    inviteTeammate: 'Invite teammate',
    pendingInvites: 'Pending invites',
    exportData: 'Export my data',
    deleteAccount: 'Delete account',
    cookiePolicy: 'Cookie policy',
  },
  es: {
    consentTitle: 'Cookies y privacidad',
    consentBody:
      'Usamos cookies necesarias para operar la aplicación. Las cookies de analítica y marketing son opcionales.',
    acceptAll: 'Aceptar todo',
    rejectOptional: 'Solo necesarias',
    privacy: 'Privacidad',
    security: 'Seguridad',
    language: 'Idioma',
    overview: 'Resumen',
    feedback: 'Feedback',
    settings: 'Ajustes',
    profile: 'Perfil',
    signIn: 'Iniciar sesión',
    signOut: 'Cerrar sesión',
    welcomeBack: 'Bienvenido de nuevo',
    createAccount: 'Crear una cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    magicLink: 'Enviarme un enlace mágico',
    passkey: 'Continuar con passkey',
    recoveryCode: 'Usar un código de recuperación',
    inviteTeammate: 'Invitar compañero',
    pendingInvites: 'Invitaciones pendientes',
    exportData: 'Exportar mis datos',
    deleteAccount: 'Eliminar cuenta',
    cookiePolicy: 'Política de cookies',
  },
} as const;

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'en' || value === 'es';
}
