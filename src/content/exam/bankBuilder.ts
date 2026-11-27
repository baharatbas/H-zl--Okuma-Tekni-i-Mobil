/**
 * Soru bankası partilerini sorulara dönüştürür. Çoktan seçmeli yazımda doğru cevap ilk sıradadır
 * (şıklar ekranda karıştırılır). Akış ve sıralama sorularında numaralama burada üretilir.
 */
import type { ParagraphQuestion, QuestionType } from '../../core/exam/types';

export type Choice = [passage: string, correct: string, w1: string, w2: string, w3: string, w4: string, why: string];

export interface Batch {
  main: Choice[];
  topic: Choice[];
  detail: Choice[];
  inference: Choice[];
  completion: Choice[];
  flow: [string, string, string, string, string][];
  structure: [passage: string, answer: string][];
  order: [string, string, string, string][];
}

const STEMS: Record<QuestionType, string> = {
  main: 'Bu parçada asıl anlatılmak istenen aşağıdakilerden hangisidir?',
  topic: 'Bu parçaya en uygun başlık aşağıdakilerden hangisidir?',
  detail: 'Bu parçada aşağıdakilerden hangisine değinilmemiştir?',
  inference: 'Bu parçadan aşağıdakilerin hangisi çıkarılabilir?',
  completion: 'Parçada boş bırakılan yere aşağıdakilerden hangisi getirilmelidir?',
  flow: 'Bu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
  structure: 'Bu parçada ağır basan anlatım biçimi aşağıdakilerden hangisidir?',
  order: 'Numaralanmış cümlelerle anlamlı bir paragraf oluşturulduğunda doğru sıralama hangisi olur?',
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const makeAt = (first: number) => (type: QuestionType, i: number, passage: string, options: string[], correct: number, explanation: string, fixedOrder?: boolean): ParagraphQuestion => ({
  id: `${type}-${first + i}`,
  type,
  passage,
  stem: STEMS[type],
  options,
  correct,
  explanation,
  fixedOrder,
});

const STYLES = ['Betimleme', 'Öyküleme', 'Açıklama', 'Tartışma', 'Tanık gösterme'];
const WHY: Record<string, string> = {
  Betimleme: 'Görünüş ayrıntılarıyla bir tablo çiziliyor.',
  Öyküleme: 'Olaylar zaman akışı içinde anlatılıyor.',
  Açıklama: 'Bir kavram hakkında bilgi veriliyor.',
  Tartışma: 'Bir görüşe karşı çıkılıp başka görüş savunuluyor.',
};
/** Karışık numaralama düzenleri: gösterilen i. sırada doğru paragrafın kaçıncı cümlesi var. */
const SHUFFLES = [[2, 0, 3, 1], [1, 3, 0, 2], [3, 2, 1, 0], [2, 1, 0, 3]];
const WRONG_ORDERS = [[0, 2, 1, 3], [1, 0, 3, 2], [3, 0, 2, 1], [2, 3, 1, 0]];

/** `first`: bu partinin her tipteki ilk soru numarası. */
export function buildBatch(batch: Batch, first: number): ParagraphQuestion[] {
  const make = makeAt(first);
  const choices = (type: QuestionType, list: Choice[]) => list.map(([passage, c, w1, w2, w3, w4, why], i) => make(type, i, passage, [c, w1, w2, w3, w4], 0, why));

  const flow = batch.flow.map(([a, b, c, d, intruder], i) => {
    const at = 1 + (i % 4);
    const sentences = [a, b, c, d];
    sentences.splice(at, 0, intruder);
    return make('flow', i, sentences.map((s, n) => `(${ROMAN[n]}) ${s}`).join(' '), [...ROMAN], at, `${ROMAN[at]}. cümle paragrafın konusundan ayrılıyor.`, true);
  });

  const structure = batch.structure.map(([passage, answer], i) => make('structure', i, passage, [...STYLES], STYLES.indexOf(answer), WHY[answer]));

  const order = batch.order.map((sentences, i) => {
    const mix = SHUFFLES[i % SHUFFLES.length];
    const passage = mix.map((s, n) => `(${ROMAN[n]}) ${sentences[s]}`).join(' ');
    const label = (seq: number[]) => seq.map((s) => ROMAN[mix.indexOf(s)]).join(' - ');
    const options = [label([0, 1, 2, 3]), ...WRONG_ORDERS.map(label)];
    const at = i % 5;
    [options[0], options[at]] = [options[at], options[0]];
    return make('order', i, passage, options, at, `Doğru akış ${label([0, 1, 2, 3])}; bağlayıcı sözler sırayı belli eder.`, true);
  });

  return [
    ...choices('main', batch.main),
    ...choices('topic', batch.topic),
    ...choices('detail', batch.detail),
    ...choices('inference', batch.inference),
    ...choices('completion', batch.completion),
    ...flow,
    ...structure,
    ...order,
  ];
}
