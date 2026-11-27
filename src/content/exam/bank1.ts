/** Soru bankasının 1. partisi (özgün). */
import { buildBatch, Choice } from './bankBuilder';

const MAIN: Choice[] = [
  ['Bir sözlükte aradığımız kelimeyi bulmak kolaydır. Zor olan, o kelimenin hangi cümlede nasıl duracağını sezmektir. Bu sezgi ancak çok okuyup çok yazanda oluşur.', 'Sözcükleri yerinde kullanmak okuma ve yazma deneyimiyle gelişir.', 'Sözlükler artık gereksizdir.', 'Her kelimenin tek anlamı vardır.', 'Yazı yazmak okumaktan kolaydır.', 'Kelime bulmak çok zaman alır.', 'Son cümle sezginin deneyimle oluştuğunu söyler.'],
  ['Bahçıvan fidanı her gün çekip köklerine bakmaz. Bakarsa fidan tutunamaz. Yeni başlanan bir alışkanlığı da her gün sonuçla sınamak benzer bir zarar verir.', 'Yeni alışkanlıklar sonuç için sabır ister.', 'Fidanlar her gün sulanmalıdır.', 'Bahçe işleri alışkanlık kazandırır.', 'Sonuçlar hiç ölçülmemelidir.', 'Kökler bitkinin en güzel yeridir.', 'Fidan benzetmesi acele sınamanın zarar verdiğini anlatır.'],
  ['Şehri ilk kez gezen biri her şeyi fark eder. Aynı sokaktan yıllardır geçen ise çoğunu görmez. Alışmak, bakmayı sürdürürken görmeyi bırakmaktır.', 'Alışkanlık, çevreyi fark etmeyi zayıflatabilir.', 'Şehirler gezmek için uygun değildir.', 'Yeni gelenler yolunu kaybeder.', 'Sokaklar yıllar içinde değişmez.', 'Görmek için uzağa gitmek gerekir.', 'Son cümle asıl yargıyı verir.'],
  ['İyi bir öğretmen her soruyu hemen yanıtlamaz. Bazen soruyu öğrenciye geri verir ve düşünmesini bekler. Böylece öğrenci yanıtı değil, yanıta giden yolu öğrenir.', 'Düşünmeye alan açmak öğrenmeyi derinleştirir.', 'Öğretmenler soru yanıtlamamalıdır.', 'Öğrenciler soru sormaktan kaçınmalıdır.', 'Hızlı yanıt en iyi yöntemdir.', 'Dersler sessiz geçmelidir.', '"Böylece" ile sonuca bağlanıyor.'],
];
const TOPIC: Choice[] = [
  ['Arılar bir çiçekten diğerine konarken polen taşır. Bu sayede pek çok meyve ve sebze oluşur. Arı sayısı azalırsa sofralarımız da yoksullaşır.', 'Arıların Soframıza Katkısı', 'Bal Çeşitleri', 'Çiçeklerin Renkleri', 'Meyve Saklama Yolları', 'Kovan Yapımı', 'Her cümle arıların besinle ilişkisini anlatır.'],
  ['Ay, kendi ışığını üretmez. Gördüğümüz parlaklık Güneş ışığının yansımasıdır. Dünya çevresinde dolandıkça aydınlık yüzünün farklı bölümlerini görürüz.', 'Ay Işığının Kaynağı ve Evreleri', 'Güneşin Yapısı', 'Uzay Yolculukları', 'Dünyanın Dönüş Hızı', 'Yıldız Kümeleri', 'Işık yansıması ve evreler anlatılıyor.'],
  ['Eskiden mahalle aralarında seyyar satıcılar dolaşırdı. Her birinin kendine özgü bir seslenişi vardı. Evdekiler kimin geldiğini sesten anlardı.', 'Seyyar Satıcıların Sesleri', 'Eski Evlerin Yapısı', 'Pazar Fiyatları', 'Mahalle Parkları', 'Posta Dağıtımı', 'Konu satıcıların kendine özgü seslenişidir.'],
  ['Kâğıt yapımında ağaç lifleri suyla hamur haline getirilir. Hamur ince bir tabaka olarak serilir ve kurutulur. Kullanılmış kâğıtlar da aynı yolla yeniden işlenebilir.', 'Kâğıdın Üretimi ve Geri Dönüşümü', 'Ormanların Büyümesi', 'Matbaanın Tarihi', 'Su Tasarrufu', 'Defter Tasarımı', 'Üretim ve yeniden işleme anlatılıyor.'],
];
const DETAIL: Choice[] = [
  ['Okul kütüphanesi hafta içi açıktır. Her öğrenci aynı anda üç kitap alabilir. Süre iki haftadır. Geciken kitaplar için yeni kitap verilmez.', 'Kitapların ücretine', 'Açık olduğu günlere', 'Alınabilecek kitap sayısına', 'Ödünç süresine', 'Gecikmenin sonucuna', 'Ücretten söz edilmiyor.'],
  ['Gönüllüler sahili cumartesi sabahı temizledi. Toplanan atıklar türlerine göre ayrıldı. En çok plastik şişe çıktı. Belediye torba ve eldiven sağladı.', 'Katılan kişi sayısına', 'Temizliğin zamanına', 'Atıkların ayrılmasına', 'En çok bulunan atığa', 'Belediyenin desteğine', 'Kaç kişinin katıldığı verilmiyor.'],
  ['Yeni otobüs hattı merkezle üniversiteyi bağlıyor. Seferler yirmi dakikada bir yapılıyor. Araçlarda tekerlekli sandalye rampası var. İlk hafta yolculuk ücretsiz olacak.', 'Güzergâhın uzunluğuna', 'Bağladığı yerlere', 'Sefer sıklığına', 'Erişilebilirlik özelliğine', 'İlk haftaki ücrete', 'Kilometre bilgisi yok.'],
  ['Müze pazartesi günleri kapalıdır. Öğrencilere giriş indirimlidir. Salonlarda flaşsız fotoğraf çekilebilir. Rehberli turlar saat on birde başlar.', 'Kafeterya hizmetine', 'Kapalı güne', 'Öğrenci indirimine', 'Fotoğraf kuralına', 'Tur saatine', 'Kafeteryadan söz edilmiyor.'],
];
const INFERENCE: Choice[] = [
  ['Selin sabah pencereden baktığında sokağın ıslak, insanların şemsiyelerinin kapalı olduğunu gördü.', 'Yağmur büyük olasılıkla dinmiştir.', 'Yağmur şiddetle sürmektedir.', 'Hiç yağmur yağmamıştır.', 'Kar yağmaktadır.', 'Selin dışarı çıkmayacaktır.', 'Islak sokak ve kapalı şemsiyeler yağışın bittiğini gösterir.'],
  ['Lokantanın önünde her öğle uzun bir kuyruk oluşuyor; birkaç adım ötedeki diğer lokanta ise boş kalıyor.', 'İnsanlar ilk lokantayı beklemeye değer buluyor.', 'İkinci lokanta kapalıdır.', 'İlk lokanta ücretsiz yemek veriyor.', 'Sokakta yalnız bir lokanta var.', 'Herkes aynı yemeği seviyor.', 'Boş seçenek varken beklemek tercih edildiğini gösterir.'],
  ['Kerem kitabın sayfa kenarlarına notlar almış, bazı cümlelerin yanına soru işareti koymuştu.', 'Kerem metni sorgulayarak okumuştur.', 'Kerem kitabı hiç açmamıştır.', 'Kitap Kerem’e sıkıcı gelmiştir.', 'Kerem metni ezberlemiştir.', 'Kitap kütüphaneden alınmıştır.', 'Notlar ve soru işaretleri etkin okumayı gösterir.'],
  ['Fırıncı bugün her zamankinden iki kat fazla ekmek hamuru yoğurdu; yarın bayramın ilk günü.', 'Bayramda talebin artmasını bekliyor.', 'Fırını kapatmayı düşünüyor.', 'Un fiyatı düşmüştür.', 'Yarın hiç satış yapmayacaktır.', 'Yeni bir fırın açmıştır.', 'Fazla hazırlık beklenen talebe işaret eder.'],
];
const COMPLETION: Choice[] = [
  ['Bir dili yalnızca kurallarını ezberleyerek öğrenmek güçtür. ____ Böylece kurallar anlam kazanır.', 'O dilde dinlemek ve konuşmak gerekir.', 'Bu yüzden sözlük kullanılmamalıdır.', 'Kurallar her dilde aynıdır.', 'Ezber hiçbir işe yaramaz ve bırakılmalıdır.', 'Dil sınavları çok zordur.', '"Böylece" kuralları anlamlandıran bir eylem ister.'],
  ['Spor yaparken terlemek vücudun serinleme yoludur. ____ Bu yüzden egzersizde su içmek önemlidir.', 'Ancak terle birlikte su da kaybedilir.', 'Ter kışın hiç oluşmaz.', 'Serinlemek için hareketsiz kalınır.', 'Spor ayakkabıları rahat olmalıdır.', 'Egzersiz uyku getirir.', 'Sonraki "bu yüzden su" cümlesi kaybı gerektirir.'],
  ['Eski bir sandığı onarırken marangoz acele etmedi. ____ Çünkü yanlış bir darbe ahşabı çatlatabilirdi.', 'Her parçayı dikkatle söküp numaraladı.', 'Sandığı hemen boyayıp teslim etti.', 'Aletlerini evde unuttu.', 'Yeni bir sandık satın aldı.', 'Ahşabın rengini beğenmedi.', '"Çünkü" dikkatli davranışı açıklıyor.'],
  ['Haber okurken ilk gördüğümüze inanmak kolaydır. ____ Ancak o zaman bilginin güvenilirliği anlaşılır.', 'Oysa aynı olayı farklı kaynaklardan da incelemek gerekir.', 'Bu yüzden haber okumamak gerekir.', 'Başlıklar her şeyi anlatır.', 'İlk haber her zaman doğrudur.', 'Gazeteler sabah çıkar.', '"Ancak o zaman" karşılaştırmayı gerektirir.'],
];
const FLOW: [string, string, string, string, string][] = [
  ['Zeytin ağacı uzun ömürlü bir ağaçtır.', 'Kurak toprakta bile ürün verebilir.', 'Meyvesinden hem sofralık zeytin hem yağ elde edilir.', 'Bu özellikleri onu yöre halkı için değerli kılar.', 'Zeytinlik yolundaki köprü geçen yıl boyandı.'],
  ['Sabah koşusu güne canlı başlamayı sağlar.', 'Kısa bir ısınma sakatlık riskini azaltır.', 'Tempoyu yavaş yavaş artırmak bedeni alıştırır.', 'Koşu sonrası esneme kasları rahatlatır.', 'Spor mağazalarının vitrinleri genellikle aydınlıktır.'],
  ['Göl çevresinde pek çok kuş türü yaşar.', 'Sazlıklar yuva yapmak için uygun yerlerdir.', 'Sığ sular kuşlara besin sağlar.', 'Bu nedenle gölün korunması kuşlar için hayatidir.', 'Dürbün üretimi ince cam işçiliği ister.'],
  ['Not tutmak dinlenenleri düzenlemeye yardım eder.', 'Ana başlıkları ayrı yazmak yapıyı gösterir.', 'Kısaltmalar yazma süresini azaltır.', 'Ders sonunda notları gözden geçirmek eksikleri belli eder.', 'Sınıfın duvar rengi geçen yaz değiştirildi.'],
];
const STRUCTURE: [passage: string, answer: string][] = [
  ['Dar sokağın iki yanında sarı badanalı evler sıralanıyordu. Pencere önlerinde kırmızı sardunyalar, kapı eşiğinde uyuyan tekir bir kedi vardı.', 'Betimleme'],
  ['Zil çalınca Deniz çantasını kaptı. Koşarak durağa vardı, otobüsün kapısı kapanmadan içeri atladı ve derin bir soluk aldı.', 'Öyküleme'],
  ['Fotosentez, bitkilerin ışık enerjisini kullanarak besin üretmesidir. Bu süreçte karbondioksit ve su kullanılır, oksijen açığa çıkar.', 'Açıklama'],
  ['Kimileri ödevin yararsız olduğunu söylüyor. Oysa ölçülü verilen ödev, öğrenileni pekiştirir; sorun ödevde değil, ölçüsüzlüktedir.', 'Tartışma'],
];
const ORDER_SETS: [string, string, string, string][] = [
  ['Önce saksının dibine birkaç küçük taş koydu.', 'Ardından taşların üzerini toprakla doldurdu.', 'Sonra fideyi toprağa yerleştirip köklerini örttü.', 'Son olarak can suyunu verip saksıyı pencereye koydu.'],
  ['Araştırmacı ilk olarak merak ettiği soruyu belirledi.', 'Bu soruya olası bir yanıt öne sürdü.', 'Öne sürdüğü yanıtı sınamak için bir deney yaptı.', 'Deneyin sonucuna bakarak yanıtını yeniden değerlendirdi.'],
  ['Kasabaya ilk kez bir kütüphane açılacağı duyuruldu.', 'Duyurunun ardından halk evlerindeki kitapları bağışlamaya başladı.', 'Bağışlanan bu kitaplar gönüllülerce raflara dizildi.', 'Böylece açılış günü raflar dolu karşıladı ziyaretçileri.'],
  ['Yağmur damlaları önce dağların yamacına düşer.', 'Bu sular birleşerek küçük dereleri oluşturur.', 'Dereler de aşağıda büyük bir nehre katılır.', 'Nehir ise uzun yolculuğunu sonunda denizde bitirir.'],
];

export const BANK_1 = buildBatch(
  { main: MAIN, topic: TOPIC, detail: DETAIL, inference: INFERENCE, completion: COMPLETION, flow: FLOW, structure: STRUCTURE, order: ORDER_SETS },
  4,
);
