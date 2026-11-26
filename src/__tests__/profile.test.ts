import { initials } from '../core/profile';

describe('profil', () => {
  it('baş harfler Türkçe büyük harfe çevrilir', () => {
    expect(initials('irem ışık')).toBe('İI');
    expect(initials('  ali  ')).toBe('A');
    expect(initials('ayşe nur demir')).toBe('AN');
    expect(initials('   ')).toBe('');
  });
});
