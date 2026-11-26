/**
 * Hazır metinlerin ders notları: her metnin öğrenme hedefi ve okuma stratejisi.
 * Anahtarlar builtinTexts/builtinTextsExtra içindeki metin anahtarlarıdır.
 */
export interface LessonNote {
  objective: string;
  strategy: string;
}

export const LESSON_NOTES: Record<string, LessonNote> = {
  'builtin-level-test': {
    objective: 'Okuma hızını ve anlama oranını ölçerek sana uygun seviyeyi belirleriz.',
    strategy: 'Normal hızında oku; sadece metni anlamaya odaklan. Hız değil, anlama önceliğindir.',
  },
  'builtin-sea': {
    objective: 'Açıklayıcı bir metinde ana fikri ve ayrıntıları ayırt etmeyi öğrenirsin.',
    strategy: 'Her paragrafın ilk cümlesine dikkat et; ana fikir genellikle orada yer alır.',
  },
  'builtin-city': {
    objective: 'Betimleyici bir metinde benzetmeleri ve görsel dili yakalamayı çalışırsın.',
    strategy: 'Bir cümleyi tek bakışta kavramaya çalış; küçük parçalar halinde oku.',
  },
  'builtin-garden': {
    objective: 'Uygulamalı bilgiyi (adım ve ipucu) hızlıca toplamayı pekiştirirsin.',
    strategy: 'Sayısal ya da sıralı bilgileri akılda tutmak için kısa bir zihinsel özet çıkar.',
  },
  'builtin-history': {
    objective: 'Tarihsel bir anlatımda neden-sonuç ilişkilerini okumayı öğrenirsin.',
    strategy: 'Tarihleri ve kişileri değil, olaylar arasındaki bağlantıları izle.',
  },
  'builtin-science': {
    objective: 'Bilimsel bir metinde kavramları ve ilişkileri hızlıca ayırt edersin.',
    strategy: 'Tanımlanan kavramları işaretle; geri kalan cümleleri onların etrafında oku.',
  },
  'builtin-travel': {
    objective: 'Bir yer tanıtımını okurken kronolojik ve mekânsal bilgiyi takip edersin.',
    strategy: 'Metindeki yön ve yer sözcüklerine (önce, sonra, en sonunda) dikkat et.',
  },
  'builtin-economy': {
    objective: 'Pratik, karar odaklı bir metinden anahtar öğütleri çıkarmayı çalışırsın.',
    strategy: 'Her öğütün "ne yapılmalı?" sorusunu cevapladığını kontrol ederek oku.',
  },
  'builtin-philosophy': {
    objective: 'Soyut bir tezi ve karşıt görüşleri ayırt ederek okumayı öğrenirsin.',
    strategy: 'Metnin ana iddiasını bul; sonra destekleyici ve karşıt cümleleri sırala.',
  },
  'builtin-space': {
    objective: 'Bilgi yoğun bir metinde sayıları ve karşılaştırmaları hızlı kavrarsın.',
    strategy: 'Karşılaştırma kelimelerini (daha, en, kadar) işaretleyerek oku.',
  },
  'builtin-coffee': {
    objective: 'Süreç anlatan bir metinde aşamaları sırayla takip etmeyi öğrenirsin.',
    strategy: 'Her aşamayı tek cümlelik bir başlıkla özetle; sonra metne dön.',
  },
  'builtin-bridges': {
    objective: 'Bir yapının işlevini ve nedenini anlatan metinleri hızlı kavrarsın.',
    strategy: 'Her özelliğin "neden" olduğunu sor; cevabı metinde yakala.',
  },
  'builtin-music': {
    objective: 'Kültürel bir konuyu duygusal ve tarihsel boyutlarıyla okumayı öğrenirsin.',
    strategy: 'Soyut kavramları somut örneklerle eşleştirerek oku.',
  },
  'builtin-recycling': {
    objective: 'Bir çevre konusunda öneri ve nedenleri birlikte kavrarsın.',
    strategy: 'Öneriyi ve gerekçesini ayrı ayrı işaretle; sonra ikisini birleştir.',
  },
  'builtin-bees': {
    objective: 'Doğa anlatımında sıralı davranışları ve ilişkileri takip edersin.',
    strategy: 'Canlının rolünü ve yaptığı işi cümle cümle eşleştirerek oku.',
  },
  'builtin-weather': {
    objective: 'Veri ve olasılık içeren bir metinde kesinlik düzeylerini ayırt edersin.',
    strategy: 'Yüzde, olasılık ve "muhtemelen" gibi ifadelere özellikle dikkat et.',
  },
  'builtin-language': {
    objective: 'Kelimelerin anlam farklarını ve bağlam etkisini kavrarsın.',
    strategy: 'Bilmediğin kelimeyi çevresindeki cümleden tahmin etmeye çalış.',
  },
  'builtin-chess': {
    objective: 'Kurallar ve stratejiler içeren bir metni hızlı ve doğru okursun.',
    strategy: 'Kuralları sırayla oku; her kuralın istisnasını ayrıca not et.',
  },
  'builtin-bread': {
    objective: 'Adım adım bir tarifi hatasız takip etmeyi öğrenirsin.',
    strategy: 'Malzemeleri ve adımları ayrı ayrı oku; her adımda ne değiştiğini düşün.',
  },
  'builtin-time': {
    objective: 'Öğütler ve planlama önerilerini bir sistem olarak kavrarsın.',
    strategy: 'Öğütleri "ne zaman?" ve "nasıl?" sorularına göre sınıflandır.',
  },
};

export function lessonNote(key: string | null | undefined): LessonNote | null {
  return key ? LESSON_NOTES[key] ?? null : null;
}
