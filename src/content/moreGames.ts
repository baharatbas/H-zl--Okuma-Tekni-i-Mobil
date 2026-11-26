/** Ek egzersizlerin özgün içeriği. */
export const INKS = [
  { name: 'Kırmızı', hex: '#C0392B' },
  { name: 'Mavi', hex: '#2563C9' },
  { name: 'Yeşil', hex: '#1E8449' },
  { name: 'Turuncu', hex: '#C96A00' },
  { name: 'Mor', hex: '#7D3C98' },
];

export const ANIMALS = ['kedi', 'köpek', 'balık', 'kuş', 'at', 'koyun', 'tavşan', 'aslan', 'fil', 'arı', 'kaplumbağa', 'sincap'];
export const OBJECTS = ['masa', 'kalem', 'pencere', 'bulut', 'taş', 'defter', 'lamba', 'köprü', 'çanta', 'fincan', 'harita', 'ekmek', 'sandalye', 'anahtar', 'halı', 'tren'];

/** Birbirine benzeyen karakter çiftleri (farklıyı bul). */
export const LOOKALIKES: [string, string][] = [['b', 'd'], ['p', 'q'], ['m', 'n'], ['ı', 'i'], ['o', 'ö'], ['u', 'ü'], ['s', 'ş'], ['c', 'ç'], ['E', 'F'], ['6', '9']];

export const ANTONYMS: [string, string][] = [
  ['sıcak', 'soğuk'], ['uzun', 'kısa'], ['geniş', 'dar'], ['ağır', 'hafif'], ['eski', 'yeni'], ['açık', 'kapalı'], ['hızlı', 'yavaş'], ['dolu', 'boş'],
  ['kolay', 'zor'], ['yüksek', 'alçak'], ['temiz', 'kirli'], ['cömert', 'cimri'], ['cesur', 'korkak'], ['artmak', 'azalmak'], ['başlamak', 'bitirmek'], ['sevinç', 'üzüntü'],
  ['ileri', 'geri'], ['kalın', 'ince'], ['derin', 'sığ'], ['barış', 'savaş'],
];

/** İlk üç sözcük aynı gruptandır, dördüncüsü uymaz. */
export const ODD_CATEGORY: [string, string, string, string][] = [
  ['elma', 'armut', 'kiraz', 'ıspanak'], ['kalem', 'silgi', 'defter', 'tencere'], ['serçe', 'karga', 'martı', 'sincap'], ['masa', 'sandalye', 'dolap', 'yağmur'],
  ['pazartesi', 'salı', 'cuma', 'ocak'], ['kırmızı', 'mavi', 'sarı', 'üçgen'], ['gitar', 'keman', 'davul', 'fırça'], ['doktor', 'öğretmen', 'aşçı', 'hastane'],
  ['otobüs', 'tren', 'vapur', 'köprü'], ['roman', 'şiir', 'masal', 'kütüphane'], ['göl', 'nehir', 'deniz', 'dağ'], ['mont', 'kazak', 'atkı', 'yastık'],
  ['kaşık', 'çatal', 'bıçak', 'havlu'], ['gül', 'papatya', 'lale', 'çam'], ['sevinç', 'öfke', 'korku', 'ayna'], ['metre', 'litre', 'gram', 'cetvel'],
];

/** [boşluklu metin, doğru bağlaç, yanlış, yanlış] */
export const CONNECTORS: [string, string, string, string][] = [
  ['Hava çok soğuktu, ___ kalın giyindik.', 'bu yüzden', 'oysa', 'örneğin'],
  ['Erken yola çıktık, ___ yine de geç kaldık.', 'ama', 'çünkü', 'örneğin'],
  ['Şemsiyemi aldım ___ gökyüzü kapalıydı.', 'çünkü', 'oysa', 'bu yüzden'],
  ['Bazı meyveler kışın olgunlaşır; ___ portakal.', 'örneğin', 'çünkü', 'ancak'],
  ['Herkes filmin uzun olduğunu söylüyordu, ___ bir saatte bitti.', 'oysa', 'bu yüzden', 'çünkü'],
  ['Düzenli çalıştı, ___ sınavda rahat etti.', 'böylece', 'ancak', 'örneğin'],
  ['Önce malzemeleri yıkadık, ___ doğramaya başladık.', 'ardından', 'oysa', 'çünkü'],
  ['Toplantı kısa sürdü, ___ önemli kararlar alındı.', 'yine de', 'çünkü', 'örneğin'],
  ['Yol kapalı olduğu ___ başka sokaktan geçtik.', 'için', 'halde', 'gibi'],
  ['Yağmur yağdığı ___ maç devam etti.', 'halde', 'için', 'kadar'],
  ['Kitabı çok sevdim; ___ ikinci kez okuyacağım.', 'hatta', 'oysa', 'çünkü'],
  ['Spor sağlığa iyi gelir; ___ aşırısı yorabilir.', 'ancak', 'bu nedenle', 'örneğin'],
];
