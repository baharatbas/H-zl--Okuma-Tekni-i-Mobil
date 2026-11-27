import { canUsePremium, loginOptions } from '../core/account';

describe('hesap kuralları', () => {
  it('Android: Google ve misafir; iPhone: Google, Apple ve misafir', () => {
    expect(loginOptions('android')).toEqual(['google', 'guest']);
    expect(loginOptions('ios')).toEqual(['google', 'apple', 'guest']);
  });
  it('misafir ve hesapsız kullanıcı premium alamaz', () => {
    expect(canUsePremium('guest', 'android')).toBe(false);
    expect(canUsePremium('guest', 'ios')).toBe(false);
    expect(canUsePremium('none', 'ios')).toBe(false);
  });
  it('Android premium yalnızca Google ile; iPhone Google ya da Apple ile', () => {
    expect(canUsePremium('google', 'android')).toBe(true);
    expect(canUsePremium('apple', 'android')).toBe(false);
    expect(canUsePremium('google', 'ios')).toBe(true);
    expect(canUsePremium('apple', 'ios')).toBe(true);
  });
});
