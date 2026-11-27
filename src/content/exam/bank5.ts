/** Soru bankasının 5. partisi (özgün). */
import { buildBatch, Choice } from './bankBuilder';

const MAIN: Choice[] = [
  ['Pusulası olan kişi yine de yürümek zorundadır. Bir plan yönü gösterir, yolu ise atılan adımlar alır.', 'Plan tek başına yetmez; uygulamak gerekir.', 'Pusula her yolu kısaltır.', 'Yürümek plansız yapılmalıdır.', 'Planlar her zaman yanlış çıkar.', 'Yön bulmak imkânsızdır.', 'Benzetme, planın eylemle tamamlandığını anlatıyor.'],
  ['Bir sözü öfkeyle söylemek saniyeler sürer. O sözün kırdığını onarmak bazen yıllar alır.', 'Öfkeyle konuşmanın kalıcı zararı olabileceği için düşünülmelidir.', 'Öfke hiç hissedilmemelidir.', 'Sözler kısa olmalıdır.', 'Kırgınlıklar hemen geçer.', 'Susmak her sorunu çözer.', 'Süre karşılaştırması zararın kalıcılığını vurguluyor.'],
  ['Aynı manzarayı çizen iki ressam farklı resimler yapar. Biri ışığı, öteki insanı öne çıkarır; çünkü göz neye önem verirse onu seçer.', 'Sanatçının bakışı eserin neyi öne çıkaracağını belirler.', 'Manzara resmi kolaydır.', 'Ressamlar birbirini kopyalar.', 'Işık resimde önemsizdir.', 'Her resim aynı olmalıdır.', '"Çünkü" ile farkın nedeni veriliyor.'],
  ['Kullanılmayan alet paslanır, kullanılmayan bilgi de soluklaşır. Öğrendiğini ara sıra işe koşmak onu canlı tutar.', 'Bilgi kullanıldıkça kalıcı olur.', 'Aletler yağlanmalıdır.', 'Yeni bilgi öğrenilmemelidir.', 'Bilgi hiç unutulmaz.', 'Paslanma önlenemez.', 'Son cümle ana düşünceyi veriyor.'],
  ['İyi bir ev sahibi misafirin ne istediğini sormadan da sezmeye çalışır. Konukseverlik yalnız ikram değil, dikkattir.', 'Konukseverliğin özü misafire gösterilen dikkattir.', 'Misafire hiçbir şey sorulmamalıdır.', 'İkram gereksizdir.', 'Ev sahibi her şeyi bilir.', 'Misafir az gelmelidir.', 'Son cümle kavramı tanımlıyor.'],
  ['Merdivenin ilk basamağını küçümseyen üst kata çıkamaz. Büyük işler de önemsiz görünen başlangıçlara dayanır.', 'Büyük işler küçük adımlar atlanmadan başarılır.', 'Merdivenler tehlikelidir.', 'Başlangıçlar hep kolaydır.', 'Üst katlar gereksizdir.', 'Küçük işler yapılmamalıdır.', 'Benzetme küçük adımların gerekliliğini anlatıyor.'],
  ['Herkesi memnun etmeye çalışan bir yazı çoğu zaman kimseye bir şey söylemez. Yazar kime ve ne diyeceğini seçmelidir.', 'Etkili yazı belirli bir amaç ve okur seçmeyi gerektirir.', 'Yazılar çok uzun olmalıdır.', 'Okurlar memnun edilmemelidir.', 'Yazar susmalıdır.', 'Her yazı herkese aynı seslenir.', 'İkinci cümle ana yargıdır.'],
  ['Sorun büyüdüğünde "keşke zamanında baksaydım" deriz. Damlayan musluğu bugün onarmak yarınki tesisat derdini önler.', 'Küçük sorunlar zamanında çözülmelidir.', 'Musluklar sık değiştirilmelidir.', 'Büyük sorunlar kendiliğinden geçer.', 'Tesisat işi pahalı değildir.', 'Pişmanlık yararlıdır.', 'Örnek erken müdahaleyi savunuyor.'],
  ['Doğada hiçbir şey büsbütün boşa gitmez. Dökülen yaprak toprağa, toprak da yeni filize besin olur.', 'Doğada maddeler dönüşerek yeniden kullanılır.', 'Yapraklar süpürülmelidir.', 'Toprak zamanla tükenir.', 'Filizler besine ihtiyaç duymaz.', 'Doğa atık üretir ve saklar.', 'İkinci cümle ilk yargıyı örnekliyor.'],
];
const TOPIC: Choice[] = [
  ['Salyangoz arkasında parlak bir iz bırakır. Bu salgı, pürüzlü yüzeylerde incinmeden kaymasını sağlar.', 'Salyangozun Koruyucu Salgısı', 'Bahçe Çitleri', 'Deniz Kabukları', 'Yağmur Mevsimi', 'Böcek İlaçları', 'Salgının işlevi anlatılıyor.'],
  ['Kâğıt para ortaya çıkmadan önce insanlar mal değiş tokuşu yapardı. Zamanla değerli madenler ve sikkeler kullanıldı.', 'Paranın Öncesi ve Gelişimi', 'Banka Mimarisi', 'Maden İşçiliği', 'Pazar Kurma Günleri', 'Tasarruf Yolları', 'Paranın gelişim süreci veriliyor.'],
  ['Ayçiçeği genç dönemde gün boyu Güneş’in yönünü izler. Bu hareket büyümesine yardım eder.', 'Ayçiçeğinin Güneşi İzlemesi', 'Yağ Üretimi', 'Gece Çiçekleri', 'Tohum Satışı', 'Güneş Gözlüğü', 'Yönelme davranışı anlatılıyor.'],
  ['Eskiden evlerde buzdolabı yoktu. Yiyecekler kurutularak, tuzlanarak ya da serin kilerlerde saklanırdı.', 'Eski Saklama Yöntemleri', 'Buzdolabı Markaları', 'Yemek Tarifleri', 'Kış Sporları', 'Kiler Boyama', 'Saklama yolları sayılıyor.'],
  ['Origami, kâğıdı kesmeden katlayarak biçim verme sanatıdır. Sabır ve dikkat ister.', 'Kâğıt Katlama Sanatı', 'Kâğıt Fabrikaları', 'Makas Çeşitleri', 'Resim Boyaları', 'Kitap Ciltleme', 'Parça kâğıt katlama sanatı origamiyi tanıtıyor.'],
  ['Denizatının yavrularını baba taşır. Dişinin bıraktığı yumurtalar erkeğin kesesinde gelişir.', 'Denizatında Babanın Rolü', 'Mercan Renkleri', 'Balık Pazarı', 'Yumurta Saklama', 'Akvaryum Temizliği', 'Babanın taşıması konu ediliyor.'],
  ['Gökkuşağı, Güneş ışığının yağmur damlalarında kırılıp renklerine ayrılmasıyla oluşur.', 'Gökkuşağı Nasıl Oluşur?', 'Yağmur Duası', 'Boya Karışımları', 'Bulut Fotoğrafçılığı', 'Şemsiye Yapımı', 'Parçada gökkuşağının nasıl oluştuğu açıklanıyor.'],
  ['Kervansaraylar uzun yolculuk yapanlara geceleyecek yer sağlardı. Hayvanlar da burada dinlenirdi.', 'Yolcuların Konağı Kervansaraylar', 'Çöl İklimi', 'Saray Hayatı', 'At Yarışları', 'Modern Oteller', 'Kervansarayın işlevi anlatılıyor.'],
  ['Bal arıları yönünü bulurken Güneş’ten yararlanır. Bulutlu havada da ışığın izlerinden ipucu alabilir.', 'Arıların Yön Bulma Yetisi', 'Bal Kavanozları', 'Bulut Türleri', 'Çiçek Satışı', 'Güneş Enerjisi', 'Yön bulma konu ediliyor.'],
];
const DETAIL: Choice[] = [
  ['Mahalle spor sahası yenilendi. Zemine yumuşak kaplama yapıldı. Gece için aydınlatma takıldı. Kullanım randevuyla olacak.', 'Yenilemenin ne kadar sürdüğüne', 'Yenilenen yere', 'Zemin kaplamasına', 'Aydınlatmaya', 'Kullanım koşuluna', 'Parçada çalışmanın süresi verilmiyor.'],
  ['Fotoğraf yarışmasının konusu "sabah"tır. Her katılımcı iki eser gönderebilir. Gönderim internetten yapılır. Kazananlar sergilenecek.', 'Yarışmanın ödül miktarına', 'Yarışmanın konusuna', 'Eser sayısı sınırına', 'Gönderim yoluna', 'Kazananlara sağlanacak olana', 'Parçada ödül miktarından söz edilmiyor.'],
  ['Yeni vapur seferi cuma günü başlıyor. Yolculuk yirmi beş dakika sürüyor. Bisikletle binilebiliyor. Hava sertse sefer iptal ediliyor.', 'Vapurun yolcu kapasitesine', 'Başlangıç gününe', 'Yolculuk süresine', 'Bisiklet durumuna', 'İptal koşuluna', 'Parçada kaç yolcu alacağı belirtilmiyor.'],
  ['Kan bağışı çadırı meydanda kuruldu. Bağışçılara ikram veriliyor. Başvuru için kimlik gerekiyor. Çadır akşam yedide kapanıyor.', 'Toplanan kan miktarına', 'Çadırın yerine', 'İkrama', 'Gerekli belgeye', 'Kapanış saatine', 'Parçada toplanan miktar verilmiyor.'],
  ['Kuklacılık kursunda katılımcılar kendi kuklalarını yapıyor. Dersleri emekli bir sanatçı veriyor. Kurs ücretsiz. Sonunda gösteri düzenlenecek.', 'Kursun kaç hafta süreceğine', 'Yapılan etkinliğe', 'Dersi verene', 'Ücret durumuna', 'Kurs sonundaki gösteriye', 'Parçada hafta sayısı belirtilmiyor.'],
  ['Orman yürüyüş parkuru işaretlerle belirlendi. Yol boyunca bilgi levhaları var. Ateş yakmak yasak. Çöpler geri götürülmeli.', 'Parkurun zorluk derecesine', 'İşaretlemeye', 'Bilgi levhalarına', 'Ateş yasağına', 'Çöp kuralına', 'Parçada yolun zorluğundan söz edilmiyor.'],
  ['Üniversitenin yaz kampı lise öğrencilerine açık. Konaklama yurtta yapılacak. Laboratuvar çalışmaları var. Başvurular mayısta kapanıyor.', 'Kampın ücretli olup olmadığına', 'Kimlerin katılabileceğine', 'Konaklama yerine', 'Yapılacak çalışmalara', 'Son başvuru zamanına', 'Parçada ücretle ilgili bilgi yok.'],
  ['Tarım kursunda budama ve aşılama öğretiliyor. Uygulamalar bahçede yapılıyor. Eldiven ve makas veriliyor. Katılanlara belge düzenleniyor.', 'Kursun hangi gün yapıldığına', 'Öğretilen konulara', 'Uygulama yerine', 'Sağlanan araçlara', 'Verilen belgeye', 'Parçada gün bilgisi bulunmuyor.'],
  ['Çocuk tiyatrosu yeni oyununu sahneliyor. Oyun orman hayvanlarını anlatıyor. Süresi kırk dakika. Beş yaş üstü için uygun.', 'Oyunun yazarının adına', 'Oyunun konusuna', 'Oyunun süresine', 'Yaş uygunluğuna', 'Sahneleyen topluluğa', 'Parçada yazarın adı geçmiyor.'],
];
const INFERENCE: Choice[] = [
  ['Gül, haritayı üç kez çevirip yoldan geçen birine bir şeyler sordu.', 'Yolunu bulmakta zorlanıyor olabilir.', 'Haritayı ezbere biliyor.', 'Evine varmıştır.', 'Kimseyle konuşmamıştır.', 'Harita satmaktadır.', 'Haritayı çevirip soru sormak zorlanmayı gösterir.'],
  ['Apartmanın girişinde koliler, bir de sarılmış halılar duruyordu.', 'Birisi taşınıyor olabilir.', 'Apartman yıkılmıştır.', 'Halılar yeni dokunmaktadır.', 'Kimse evde yaşamamaktadır.', 'Girişte pazar kurulmuştur.', 'Koli ve sarılı halı taşınmayı düşündürür.'],
  ['Öğretmen sınav kâğıtlarını dağıtırken sınıfta çıt çıkmıyordu.', 'Öğrenciler sınava dikkat kesilmiştir.', 'Ders çoktan bitmiştir.', 'Sınıfta kimse yoktur.', 'Öğrenciler oyun oynamaktadır.', 'Sınav iptal edilmiştir.', 'Sessizlik sınav dikkatiyle uyumludur.'],
  ['Kedi mutfak dolabının önünde durmadan miyavlıyor; mama kabı ise boş.', 'Kedi acıkmış olabilir.', 'Kedi yeni yemek yemiştir.', 'Dolapta hiçbir şey saklanmaz.', 'Kedi uyumaktadır.', 'Mama kabı doludur.', 'Boş kap ve miyavlama açlığı düşündürür.'],
  ['Yazar, son bölümü yazdığı defteri kapatıp uzun süre pencereden dışarı baktı.', 'Uzun bir çalışmayı tamamlamanın etkisinde olabilir.', 'Yazmaya yeni başlamıştır.', 'Defter boştur.', 'Pencere kapalıdır ve camsızdır.', 'Yazar hiç yazmamıştır.', 'Son bölüm ve dalıp gitme tamamlanmayı gösterir.'],
  ['Marketin dondurulmuş gıda reyonunda bütün kapakların üzerine "arızalı" yazısı asılmıştı.', 'Soğutma sisteminde sorun vardır.', 'Reyon yeni açılmıştır.', 'Ürünler indirime girmiştir.', 'Market dondurma üretmektedir.', 'Kapaklar boyanmıştır.', 'Arıza yazısı soğutma sorununu gösterir.'],
  ['Hande koşu ayakkabılarını kapının önüne akşamdan koydu ve saatini erkene kurdu.', 'Sabah koşuya çıkmayı planlıyor.', 'Ayakkabılarını atacaktır.', 'Geç uyanmak istiyor.', 'Koşmayı bırakmıştır.', 'Saati bozulmuştur.', 'Hazırlık sabah planını gösterir.'],
  ['Bahçıvan don uyarısını duyunca limon ağacının üstünü örtüyle sardı.', 'Ağacı soğuktan korumak istiyor.', 'Ağacı kesecektir.', 'Hava çok ısınacaktır.', 'Limonlar satılmıştır.', 'Örtü süs içindir.', 'Don uyarısı sonrası örtme koruma amaçlıdır.'],
  ['Kütüphanedeki masaların hepsi doluydu; sınav haftası afişi de kapıda asılıydı.', 'Öğrenciler sınavlara hazırlanıyor olabilir.', 'Kütüphane kapalıdır.', 'Sınavlar bitmiştir.', 'Masalar satılıktır.', 'Kimse ders çalışmamaktadır.', 'Doluluk ile sınav haftası ilişkilidir.'],
];
const COMPLETION: Choice[] = [
  ['Yeni bir şehre alışmak zaman ister. ____ Sonunda yabancı sokaklar tanıdık gelmeye başlar.', 'İnsan her gün biraz daha çok yeri öğrenir.', 'Bu yüzden hemen geri dönülmelidir.', 'Sokaklar her gece değişir.', 'Şehirler birbirinin aynıdır.', 'Kimse yol sormaz.', 'Tanıdıklık aşamalı öğrenmeyle oluşur.'],
  ['Bir takvimde her işi aynı güne yığmak kolaydır. ____ Dağıtılmış bir plan ise nefes aldırır.', 'Ama o gün geldiğinde hiçbirine yetişilemez.', 'Üstelik bu her zaman en verimli yoldur.', 'Takvimler renkli basılır.', 'Hiç plan yapılmamalıdır.', 'İşler kendiliğinden biter.', 'Karşıtlık için yığmanın sakıncası gerekir.'],
  ['Pencereyi kısa süre ardına kadar açmak odayı hızla havalandırır. ____ Böylece hem temiz hava girer hem ısı korunur.', 'Duvarlar soğumaya fırsat bulmadan pencere kapatılır.', 'Pencere bütün gün aralık bırakılır.', 'Isıtıcı söndürülüp atılır.', 'Oda boyanır.', 'Perdeler yıkanır.', 'Isının korunması kısa süreyi gerektirir.'],
  ['Yabancı bir sözcüğü yalnız listeden ezberlemek kalıcı olmayabilir. ____ Sözcük o zaman bir anlam bağı kazanır.', 'Onu bir cümle içinde kullanmak gerekir.', 'Listeyi daha uzun yapmak yeter.', 'Sözcüğü hiç söylememek gerekir.', 'Defteri değiştirmek gerekir.', 'Ezber her zaman yeterlidir.', 'Anlam bağı bağlam içinde kullanımdan doğar.'],
  ['Eski köprü ağır araçlara dayanacak biçimde yapılmamıştı. ____ Bu karar yapının ömrünü uzattı.', 'Bu nedenle kamyonların geçişi yasaklandı.', 'Üzerine yeni bir kat eklendi ve yük artırıldı.', 'Köprü her gün boyandı.', 'Nehir kurutuldu.', 'Yayalar uzaklaştırıldı ve kamyonlar çağrıldı.', 'Ömrü uzatan karar yükü azaltmalıdır.'],
  ['Çocuklar büyüklerin söylediğinden çok yaptığını örnek alır. ____ Kitap okuyan bir ebeveyn uzun öğütten etkilidir.', 'Bu yüzden davranışla göstermek sözden güçlüdür.', 'Oysa yalnız öğüt işe yarar.', 'Çocuklar hiç gözlem yapmaz.', 'Kitaplar saklanmalıdır.', 'Büyükler susmalıdır ve okumamalıdır.', 'Sonraki cümle davranışın gücünü örnekliyor.'],
  ['Alışveriş listesi kısa bir not gibi görünür. ____ Hem unutmayı hem gereksiz alımı azaltır.', 'Oysa bütçeyi korumada önemli bir araçtır.', 'Bu yüzden hiç yazılmamalıdır.', 'Marketler liste dağıtır.', 'Listeler pahalıdır.', 'Not tutmak zaman kaybıdır.', '"Oysa" ile küçümsenen aracın önemi verilmeli.'],
  ['Gökyüzüne teleskopla bakan, çıplak gözle seçemediği ayrıntıları görür. ____ Bilimde yeni araçlar böyle yeni sorular doğurur.', 'Gördükleri de aklına başka merakları getirir.', 'Bu yüzden bakmayı bırakır.', 'Teleskoplar yalnız süs içindir.', 'Yıldızlar kaybolur.', 'Sorular tamamen biter.', 'Yeni sorular yeni gözlemlerden doğar.'],
  ['Bir işi devretmek, ondan tümüyle el çekmek demek değildir. ____ Aksaklık böylece erkenden fark edilir.', 'Belirli aralıklarla sonucu sormak gerekir.', 'İşi unutmak en doğrusudur.', 'Her ayrıntıya karışıp işi geri almak şarttır.', 'Devredilen iş yapılmaz.', 'Kimseye bilgi verilmemelidir.', 'Erken fark etme aralıklı kontrolü gerektirir.'],
];
const FLOW: [string, string, string, string, string][] = [
  ['Meyve ağaçları kışın sonunda budanır.', 'Kuru ve hastalıklı dallar kesilir.', 'Böylece ağacın içine ışık girer.', 'Işık alan dallar daha iyi meyve verir.', 'Meyve tabakları porselenden de yapılır.'],
  ['Satranç oyuncusu hamleden önce düşünür.', 'Rakibin olası karşılığını hesaplar.', 'Acele hamle taş kaybına yol açabilir.', 'Süreyi iyi kullanmak da önemlidir.', 'Satranç tahtası satan dükkânlar pazar günü kapalıdır.'],
  ['Nehir kıyısındaki söğütler toprağı tutar.', 'Kökleri taşkında aşınmayı azaltır.', 'Gölgeleri suyu serin tutar.', 'Serin su bazı balıklar için uygundur.', 'Sepet örgüsü farklı desenlerle yapılır.'],
  ['Müze rehberi gruba eserleri tanıtır.', 'Her eserin hangi döneme ait olduğunu söyler.', 'Ziyaretçilerin sorularını yanıtlar.', 'Anlatım sonunda serbest dolaşım için süre verir.', 'Müzenin otopark çizgileri sarıya boyanmıştır.'],
  ['Süt çabuk bozulan bir besindir.', 'Bu yüzden soğukta saklanır.', 'Açılan şişe birkaç gün içinde tüketilmelidir.', 'Kokusu değişen süt kullanılmamalıdır.', 'İnek figürlü magnetler turistlere satılır.'],
  ['Yangın tatbikatı ne yapılacağını öğretir.', 'Çıkış yolları önceden gösterilir.', 'Toplanma yeri herkesçe bilinir.', 'Tatbikat sonunda aksaklıklar konuşulur.', 'Kırmızı renk moda dergilerinde sık görülür.'],
  ['Kaplumbağalar yavaş hareket eder.', 'Sert kabukları onları korur.', 'Tehlikede başlarını içeri çekerler.', 'Bazı türler çok uzun yaşar.', 'Yarış ayakkabıları hafif malzemeden yapılır.'],
  ['Rüzgâr türbinleri elektrik üretir.', 'Kanatlar rüzgârla döner.', 'Dönme hareketi jeneratörü çalıştırır.', 'Bu nedenle rüzgârlı tepeler tercih edilir.', 'Uçurtma şenlikleri ilkbaharda yapılır.'],
  ['Mektup arkadaşlığı sabır öğretir.', 'Yanıtın gelmesi günler alabilir.', 'Bu sürede kişi yazacaklarını düşünür.', 'Gelen zarf bu yüzden heyecanla açılır.', 'Posta pulu koleksiyonu albümde saklanır.'],
];
const STRUCTURE: [passage: string, answer: string][] = [
  ['Köy kahvesinin önünde asma çardağı, altında tahta iskemleler ve mavi boyası dökülmüş bir masa vardı.', 'Betimleme'],
  ['Kardeşim balonu elinden kaçırdı. Peşinden koştu, ağacın altında durdu ve dallara takılan balona uzandı.', 'Öyküleme'],
  ['Yankı, ses dalgalarının bir engele çarpıp geri dönmesiyle aynı sesin yeniden duyulmasıdır.', 'Açıklama'],
  ['El işinin devrinin kapandığını söylüyorlar. Oysa seri üretim çoğaldıkça elde yapılanın değeri daha iyi anlaşılıyor.', 'Tartışma'],
  ['Gün batımında liman turuncuya boyanmış, direkler uzun gölgeler salmış, ağların üstünde martılar tünemişti.', 'Betimleme'],
  ['Zeynep zarfı buldu, adresi okudu, bir an duraksadı ve sonra komşunun kapısına doğru yürüdü.', 'Öyküleme'],
  ['Özet, bir metnin ana düşüncesinin ve önemli noktalarının kısaca yeniden anlatılmasıdır.', 'Açıklama'],
  ['Oyun oynamanın vakit kaybı olduğu iddia ediliyor. Bence ölçülü oyun, dinlenmenin ve öğrenmenin doğal yoludur.', 'Tartışma'],
  ['Eski saatçinin tezgâhında minik vidalar, büyüteç, yarısı açık bir cep saati ve yağdanlık diziliydi.', 'Betimleme'],
];
const ORDER_SETS: [string, string, string, string][] = [
  ['Önce balkondaki boş kutular toplandı.', 'Toplanan kutular boyanıp saksıya dönüştürüldü.', 'Hazırlanan saksılara toprak dolduruldu.', 'Toprağa ise maydanoz tohumu serpildi.'],
  ['Öğrenci ödev konusunu öğretmeninden aldı.', 'Aldığı konuyla ilgili kaynak taradı.', 'Taradığı kaynaklardan bir taslak çıkardı.', 'Taslağı düzenleyip ödevini teslim etti.'],
  ['Fırtına kıyıya yaklaşınca balıkçılar uyarıldı.', 'Uyarıyı alan tekneler limana döndü.', 'Limana dönen tekneler halatlarla bağlandı.', 'Bağlı tekneler geceyi hasarsız atlattı.'],
  ['Köyde ilk kez bir tiyatro gösterisi yapılacaktı.', 'Bunun için meydana tahta bir sahne kuruldu.', 'Kurulan sahnenin önüne sandalyeler dizildi.', 'Akşam olunca o sandalyeler seyirciyle doldu.'],
  ['Aşçı önce soğanları ince ince doğradı.', 'Doğradığı soğanları yağda kavurdu.', 'Kavrulan soğanlara salça ekledi.', 'Son olarak karışımın üzerine sıcak su döktü.'],
  ['Mimar önce arsayı gezip ölçüm yaptı.', 'Ölçümlere göre bir plan çizdi.', 'Çizilen plan belediyeye onaya sunuldu.', 'Onay gelince inşaata başlandı.'],
  ['Küçük bir tohum nemli toprağa düştü.', 'Nem sayesinde kabuğu çatladı.', 'Çatlayan kabuktan ince bir kök uzandı.', 'Kök tutunduktan sonra yeşil filiz yüzeye çıktı.'],
  ['Dernek bir yardım kampanyası başlattı.', 'Kampanya mahallede duyuruldu.', 'Duyuruyu gören halk giysi getirdi.', 'Getirilen giysiler ayrılıp ihtiyaç sahiplerine ulaştırıldı.'],
  ['Sporcu sakatlandıktan sonra doktora gitti.', 'Doktor dinlenme ve egzersiz programı verdi.', 'Program haftalarca düzenli uygulandı.', 'Sonunda sporcu yeniden sahaya döndü.'],
];

export const BANK_5 = buildBatch(
  { main: MAIN, topic: TOPIC, detail: DETAIL, inference: INFERENCE, completion: COMPLETION, flow: FLOW, structure: STRUCTURE, order: ORDER_SETS },
  32,
);
