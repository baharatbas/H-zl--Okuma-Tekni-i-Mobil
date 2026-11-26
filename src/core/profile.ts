/** Profil için saf yardımcılar. */

/** Avatar yedeği: adın baş harfleri (en çok iki), Türkçe büyük harfle. Ad yoksa boş. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('');
}
