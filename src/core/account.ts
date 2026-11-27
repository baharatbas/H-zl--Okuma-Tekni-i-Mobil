/**
 * Hesap kuralları. Misafir veriler yalnızca bu cihazda, uygulama silinmediği sürece saklanır.
 * Premium yalnızca hesapla giriş yapmış kullanıcılar içindir; misafirler premium alamaz.
 */
export type AccountKind = 'none' | 'guest' | 'google' | 'apple';
export type OS = 'ios' | 'android';

/** Giriş ekranındaki seçenekler: Android'de Google ve misafir, iPhone'da Google, Apple ve misafir. */
export function loginOptions(os: OS): AccountKind[] {
  return os === 'ios' ? ['google', 'apple', 'guest'] : ['google', 'guest'];
}

/** Premium yalnızca hesapla giriş yapmış kullanıcıya açılır; Android'de Google, iPhone'da Google ya da Apple. */
export function canUsePremium(account: AccountKind, os: OS): boolean {
  if (account === 'google') return true;
  if (account === 'apple') return os === 'ios';
  return false;
}
