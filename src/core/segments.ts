/**
 * Dört kullanıcı grubu. Her grubun ihtiyacına göre kursu, günlük antrenman havuzu, metin konuları
 * ve öne çıkan ölçüsü farklıdır. Kayıtlı eski değerler korunur: 'exam' öğrenci, 'self' genel kullanıcıdır.
 */
import type { ExerciseKey } from './exercises/types';

export type Segment = 'exam' | 'work' | 'books' | 'self';

export const SEGMENT_KEYS: Segment[] = ['exam', 'work', 'books', 'self'];

export interface SegmentInfo {
  label: string;
  audience: string;
  need: string;
  icon: string;
  /** Sonuç ekranında öne çıkan ölçü. */
  focus: 'comprehension' | 'effective';
  /** Egzersiz sayfasında "Senin için" listesi. */
  recommended: ExerciseKey[];
  attention: ExerciseKey[];
  recognition: ExerciseKey[];
  /** Günlük antrenmanda öncelikli metin konuları; boşsa hepsi. */
  categories: string[];
  /** İlk açılıştaki üç özellik. */
  features: [string, string][];
}

export const SEGMENTS: Record<Segment, SegmentInfo> = {
  exam: {
    label: 'Öğrenci',
    audience: 'LGS, YKS, KPSS ve üniversite',
    need: 'Paragraf okuma, ana fikir bulma ve süre yönetimi.',
    icon: 'school-outline',
    focus: 'comprehension',
    recommended: ['main_idea', 'sentence_order', 'connector', 'scan_answer'],
    attention: ['scan_search', 'odd_one', 'schulte', 'line_scan', 'column_flow'],
    recognition: ['main_idea', 'sentence_order', 'connector', 'scan_answer', 'sentence_finish', 'true_false'],
    categories: ['science', 'thought', 'culture'],
    features: [],
  },
  work: {
    label: 'Çalışan',
    audience: 'Rapor, e-posta ve uzun dokümanlar',
    need: 'Bilgiyi hızlı bulma ve önemli noktaları anlama.',
    icon: 'briefcase-outline',
    focus: 'comprehension',
    recommended: ['scan_answer', 'skim_read', 'main_idea', 'connector'],
    attention: ['scan_search', 'line_scan', 'odd_one', 'stroop', 'schulte'],
    recognition: ['scan_answer', 'main_idea', 'connector', 'sentence_order', 'true_false'],
    categories: ['work', 'science', 'life', 'thought'],
    features: [
      ['Bilgiyi hızlı bul', 'Tarama ve göz gezdirme çalışmaları.'],
      ['Ana noktayı yakala', 'Başlık, bağlaç ve özet çalışmaları.'],
      ['Gelişimini ölç', 'Anlama oranı ve okuma hızı birlikte izlenir.'],
    ],
  },
  books: {
    label: 'Kitap okuru',
    audience: 'Roman, hikâye ve kurgu dışı',
    need: 'Okuma akıcılığı ve sürdürülebilir okuma alışkanlığı.',
    icon: 'book-outline',
    focus: 'effective',
    recommended: ['pacer_read', 'maze_read', 'phrase_group', 'sentence_finish'],
    attention: ['tracking', 'zigzag_horizontal', 'column_flow', 'diagonal_jump', 'corsi'],
    recognition: ['pacer_read', 'maze_read', 'phrase_group', 'rsvp_repeat', 'sentence_finish', 'missing_word'],
    categories: ['story', 'culture', 'thought', 'nature'],
    features: [
      ['Akıcı oku', 'Rehberli satır ve anlam grubu çalışmaları.'],
      ['Alışkanlık kur', 'Her gün kısa bir antrenman ve seri takibi.'],
      ['Gelişimini ölç', 'Hız ve anlama birlikte izlenir.'],
    ],
  },
  self: {
    label: 'Genel',
    audience: 'Günlük okuma ve dikkat',
    need: 'Kısa, eğlenceli ve düzenli egzersizler.',
    icon: 'happy-outline',
    focus: 'effective',
    recommended: ['word_hunt', 'schulte', 'word_memory', 'stroop'],
    attention: ['star_hunter', 'schulte', 'tracking', 'zigzag_horizontal', 'zigzag_vertical', 'peripheral_letters', 'scan_search', 'word_hunt', 'typo_find', 'diagonal_jump', 'column_flow', 'stroop', 'odd_one', 'corsi'],
    recognition: ['word_blocks', 'flash_numbers', 'synonym_match', 'line_scan', 'rsvp_repeat', 'word_find', 'phrase_group', 'word_memory', 'missing_word', 'real_or_fake', 'true_false', 'maze_read', 'word_chain', 'antonym', 'category_odd', 'connector'],
    categories: [],
    features: [],
  },
};

export const segmentOf = (purpose: Segment | null | undefined): Segment => purpose ?? 'self';
