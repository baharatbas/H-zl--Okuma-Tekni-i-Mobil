/** Kelime oyunlarının özgün içeriği. Doğru cevap her listede ilk sıradadır; ekranda karıştırılır. */

/** Birbirine benzeyen sözcük aileleri (hızlı kelime tanıma). */
export const WORD_FAMILIES: string[][] = [
  ['kitap', 'kitaplık', 'kitapçı', 'kâtip', 'kitabe'],
  ['kalem', 'kalemlik', 'kale', 'kelam', 'kalın'],
  ['masa', 'maaş', 'masal', 'mesai', 'maça'],
  ['deniz', 'denizci', 'dengiz', 'denge', 'deney'],
  ['bahar', 'baharat', 'buhar', 'bahçe', 'bahis'],
  ['sabah', 'sabır', 'sabun', 'saban', 'sahan'],
  ['yazar', 'yazı', 'pazar', 'yarar', 'yazıcı'],
  ['okul', 'okur', 'oluk', 'okuma', 'kul'],
  ['çanta', 'çamur', 'çatal', 'çanak', 'çarşı'],
  ['güneş', 'güney', 'gümüş', 'güreş', 'güneşli'],
  ['orman', 'ortam', 'roman', 'onarım', 'ormancı'],
  ['köprü', 'körpe', 'köpük', 'köşe', 'köprücük'],
  ['sokak', 'solak', 'soğuk', 'sokma', 'sosyal'],
  ['harita', 'harika', 'hatıra', 'hareket', 'haritacı'],
];

/** Anlam öbeklerine ayrılmış cümleler. */
export const PHRASE_SENTENCES: string[][] = [
  ['Bugün üniversiteye', 'gitmek için', 'erken kalktım'],
  ['Kardeşim bahçede', 'küçük bir fidan', 'dikmeye başladı'],
  ['Akşam yemeğinden sonra', 'ailece parkta', 'uzun bir yürüyüş yaptık'],
  ['Yağmurlu bir sabahta', 'otobüs durağında', 'sabırla bekledik'],
  ['Öğretmenimiz sınıfa', 'yeni bir harita', 'getirip astı'],
  ['Mahalle fırınından', 'sıcak ekmek alıp', 'eve döndüm'],
  ['Hafta sonu', 'kütüphaneye uğrayıp', 'iki roman seçtim'],
  ['Deniz kenarında', 'rengârenk taşlar', 'toplamak çok keyifliydi'],
  ['Komşumuz her sabah', 'balkondaki çiçeklerini', 'özenle sular'],
  ['Toplantı başlamadan önce', 'notlarımı gözden geçirdim', 've sorularımı yazdım'],
  ['Uzun yolculuk boyunca', 'pencereden dağları', 've köyleri izledik'],
  ['Küçük kedi', 'koltuğun altına saklanıp', 'bizi dikkatle süzdü'],
  ['Sınava hazırlanırken', 'her gün düzenli olarak', 'kısa molalar verdim'],
  ['Pazarda taze sebzeleri', 'seçtikten sonra', 'bez çantama yerleştirdim'],
];

/** [boşluklu cümle, doğru, yanlış, yanlış, yanlış] */
export const MISSING_WORD: [string, string, string, string, string][] = [
  ['Başarılı olmak için düzenli ___ gerekir.', 'çalışma', 'uyku', 'tatil', 'eğlence'],
  ['Susayan çiçekleri akşam üzeri ___.', 'suladım', 'okudum', 'boyadım', 'saydım'],
  ['Hava çok soğuk olduğu için kalın bir ___ giydim.', 'mont', 'şapka kutusu', 'terlik', 'gözlük'],
  ['Kütüphanede herkes ___ konuşuyordu.', 'fısıltıyla', 'bağırarak', 'şarkıyla', 'gürültüyle'],
  ['Trene yetişmek için evden erken ___.', 'çıktık', 'uyuduk', 'oturduk', 'döndük'],
  ['Bilmediği kelimenin anlamını ___ baktı.', 'sözlükten', 'takvimden', 'aynadan', 'pencereden'],
  ['Yağmur başlayınca şemsiyemi ___.', 'açtım', 'katladım', 'sakladım', 'sattım'],
  ['Sorunu çözmek için önce onu iyice ___ gerekir.', 'anlamak', 'saklamak', 'büyütmek', 'ertelemek'],
  ['Gece lambayı söndürünce oda ___ oldu.', 'karanlık', 'aydınlık', 'kalabalık', 'sıcak'],
  ['Arkadaşının yardımına ___ etti.', 'teşekkür', 'şikâyet', 'itiraz', 'alay'],
  ['Düzenli yürüyüş sağlığımıza ___ sağlar.', 'katkı', 'engel', 'zarar', 'gürültü'],
  ['Haritaya bakmadan yola çıkınca yolumuzu ___.', 'kaybettik', 'bulduk', 'kısalttık', 'boyadık'],
  ['Tohum, uygun nem ve sıcaklıkta ___.', 'filizlenir', 'erir', 'donar', 'paslanır'],
  ['Toplantıya geç kalacağını önceden ___.', 'haber verdi', 'gizledi', 'unuttu', 'yasakladı'],
  ['Okuduğunu hatırlamak için kısa bir ___ çıkardı.', 'özet', 'bilet', 'fatura', 'davetiye'],
  ['Acele karar vermeden önce seçenekleri ___.', 'karşılaştırdı', 'yırttı', 'sakladı', 'karaladı'],
];

/** [son cümlesi eksik paragraf, doğru devam, yanlış, yanlış] */
export const SENTENCE_FINISH: [string, string, string, string][] = [
  ['Elif her akşam on sayfa okumaya karar verdi. İlk günlerde zorlandı ama vazgeçmedi.', 'Bir ay sonra okumak onun için alışkanlığa dönüşmüştü.', 'Bu yüzden kitaplarını hemen sattı.', 'Oysa hiç kitap okumaya başlamamıştı.'],
  ['Sokaktaki ağaçlar yaz boyunca geniş gölge yapar. İnsanlar öğle sıcağında onların altında dinlenir.', 'Bu nedenle ağaçlar mahallenin serin köşelerini oluşturur.', 'Bu yüzden herkes güneşin altında kalmayı seçer.', 'Kışın ise kimse dışarı çıkmaz diye ağaç yoktur.'],
  ['Aşçı tarife yeni bir baharat eklemek istedi. Ancak tadın nasıl değişeceğinden emin değildi.', 'Önce küçük bir porsiyonda denemeye karar verdi.', 'Bu yüzden bütün baharatı tencereye boşalttı.', 'Çünkü sonucu zaten kesin olarak biliyordu.'],
  ['Telefonun bildirimleri çalışırken sürekli ses çıkarıyordu. Mert aynı satırı defalarca okuduğunu fark etti.', 'Sonunda telefonu başka odaya bırakıp işine döndü.', 'Bunun üzerine bildirim sayısını artırdı.', 'Çünkü dikkati hiç bu kadar toplanmamıştı.'],
  ['Köprü onarım nedeniyle bir hafta kapalı kalacaktı. Sürücüler her gün o yolu kullanıyordu.', 'Belediye bu yüzden başka bir güzergâh duyurdu.', 'Böylece köprüden geçen araç sayısı arttı.', 'Bu nedenle kimsenin yol bilgisine ihtiyacı kalmadı.'],
  ['Zeynep sunumunu birkaç kez ayna karşısında prova etti. Her denemede takıldığı yerleri not aldı.', 'Sunum günü bu hazırlık sayesinde daha rahat konuştu.', 'Bu yüzden konusunu tamamen unuttu.', 'Oysa hiç prova yapmayı düşünmemişti.'],
  ['Bahçedeki toprak günlerdir yağmur almamıştı. Yapraklar sararmaya başlamıştı.', 'Dede, bitkileri akşam serinliğinde sulamaya koyuldu.', 'Bu yüzden bahçeye bir daha su verilmemesini istedi.', 'Çünkü toprak fazla sudan çamur olmuştu.'],
  ['Yeni bir dil öğrenen Can, kelimeleri yalnızca listeden ezberliyordu. Birkaç gün sonra çoğunu unutuyordu.', 'Kelimeleri cümle içinde kullanınca daha iyi hatırlamaya başladı.', 'Bu yüzden listeyi uzattıkça hiçbirini unutmadı.', 'Sonuçta dil öğrenmek için kelimeye gerek olmadığını gördü.'],
  ['Müze ziyareti için yalnızca bir saatleri vardı. Bütün salonları gezmek mümkün görünmüyordu.', 'Bu yüzden en çok merak ettikleri iki bölümü seçtiler.', 'Böylece her eserin önünde yarım saat durdular.', 'Çünkü müzede görülecek hiçbir şey yoktu.'],
  ['Apartmanın merdiven ışığı gece yanmıyordu. Yaşlı komşu basamakları görmekte zorlanıyordu.', 'Sakinler lambayı hemen değiştirmeye karar verdi.', 'Bu yüzden diğer lambaları da söktüler.', 'Çünkü karanlık merdiven daha güvenliydi.'],
];

/** Kelime hafızası havuzu. */
export const MEMORY_WORDS = [
  'elma', 'bulut', 'anahtar', 'pencere', 'kalem', 'köprü', 'yıldız', 'defter', 'nehir', 'lamba', 'bisiklet', 'şemsiye', 'çanta', 'harita', 'balık', 'ceviz', 'kayık', 'mektup', 'tarak', 'fidan', 'kumsal', 'davul', 'pusula', 'terazi', 'yaprak', 'merdiven', 'fincan', 'kuyu', 'vagon', 'zeytin',
];

/** Kelime avı sözcükleri. */
export const HUNT_WORDS = ['KİTAP', 'DENİZ', 'ORMAN', 'KALEM', 'BULUT', 'NEHİR', 'GÜNEŞ', 'ÇİÇEK', 'KÖPRÜ', 'ELMA', 'YOL', 'KUŞ', 'MASA', 'OKUL', 'ŞEHİR', 'BAHÇE', 'RÜZGÂR', 'TOPRAK', 'YILDIZ', 'PENCERE'];

/** Gerçek mi uydurma mı: Türkçe sözcük kurallarına benzeyen ama anlamı olmayan uydurmalar. */
export const REAL_WORDS = ['kitap', 'deniz', 'sabah', 'pencere', 'orman', 'kalem', 'yıldız', 'nehir', 'bahçe', 'köprü', 'sokak', 'bulut', 'defter', 'güneş', 'toprak', 'rüzgâr', 'çiçek', 'ekmek', 'masal', 'harita', 'yaprak', 'fincan', 'merdiven', 'şemsiye', 'anahtar', 'mektup', 'kumsal', 'pusula', 'zeytin', 'terazi'];
export const FAKE_WORDS = ['kitef', 'denaz', 'sabuk', 'pencire', 'ormul', 'kalip', 'yıldaz', 'nehur', 'bahçık', 'köpre', 'sokuk', 'bulat', 'defker', 'güneç', 'toprek', 'rüzger', 'çiçok', 'ekmik', 'masel', 'haripa', 'yaprık', 'finkan', 'merdaven', 'şemsüle', 'anahrat', 'mektip', 'kumsil', 'pusala', 'zeytun', 'tarezi'];

/** [cümle, doğru mu] — herkesin bildiği, tartışmasız yargılar. */
export const TRUE_FALSE: [string, boolean][] = [
  ['Balıklar suda yaşar.', true], ['Kışın hava genellikle yazdan soğuktur.', true], ['Bir haftada yedi gün vardır.', true], ['Güneş sabahları doğar.', true],
  ['Kitap okumak için harfleri tanımak gerekir.', true], ['Buz ısıtılınca erir.', true], ['Arılar çiçeklerden besin toplar.', true], ['Bir üçgenin üç kenarı vardır.', true],
  ['Ağaçların kökleri topraktan su alır.', true], ['Gece gökyüzünde yıldızlar görülebilir.', true], ['Kediler miyavlayarak ses çıkarır.', true], ['On sayısı beşten büyüktür.', true],
  ['Taşlar suyun üstünde yaprak gibi yüzer.', false], ['Bir yılda yirmi ay vardır.', false], ['Ateş dokunulduğunda buz gibi soğuktur.', false], ['İnekler ağaç dallarına yuva yapar.', false],
  ['Karınca bir filden daha büyüktür.', false], ['Yağmur yerden gökyüzüne doğru yağar.', false], ['Bir karenin beş kenarı vardır.', false], ['Balıklar uzun yolları yürüyerek gider.', false],
  ['Gündüz hava her yerde zifiri karanlıktır.', false], ['Limon şeker kadar tatlıdır.', false], ['Kalem yazı yazmak için yenir.', false], ['İki kere iki dokuz eder.', false],
];
