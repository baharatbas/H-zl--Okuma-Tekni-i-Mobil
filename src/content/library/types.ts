/**
 * Kütüphanenin ek metinleri için kısa yazım biçimi. Sorularda ilk şık doğru cevaptır;
 * şıkların yeri `toLibraryTexts` içinde dağıtılır.
 */
import type { BuiltinText } from '../builtinTexts';
import type { CategoryKey } from '../textCategories';

export type RawQuestion = [question: string, correct: string, wrong1: string, wrong2: string, wrong3: string];
export type RawText = [slug: string, title: string, body: string, objective: string, strategy: string, questions: RawQuestion[]];

export interface LibraryEntry extends BuiltinText {
  category: Exclude<CategoryKey, 'mine'>;
  objective: string;
  strategy: string;
}

export function toLibraryTexts(category: LibraryEntry['category'], raw: RawText[]): LibraryEntry[] {
  return raw.map(([slug, title, body, objective, strategy, questions], textIndex) => ({
    key: `builtin-${slug}`,
    title,
    body,
    category,
    objective,
    strategy,
    questions: questions.map(([question, correct, ...wrong], i) => {
      const correctIndex = (textIndex + i * 3) % 4;
      const options: string[] = [...wrong];
      options.splice(correctIndex, 0, correct);
      return { question, options, correctIndex };
    }),
  }));
}
