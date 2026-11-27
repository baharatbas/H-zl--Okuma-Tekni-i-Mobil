/** Soru bankasının 2. partisi (özgün). */
import { buildBatch, Choice } from './bankBuilder';

const MAIN: Choice[] = [
  ['Bir yemeğin tarifini bilmek onu iyi pişirmeye yetmez. Ateşin ayarını, malzemenin kıvamını insan ancak deneyerek öğrenir.', 'Bilgi, uygulamayla ustalığa dönüşür.', 'Tarif kitapları yanlıştır.', 'Yemek yapmak herkes için kolaydır.', 'Ateş her yemekte aynı olmalıdır.', 'Malzeme pahalı olmalıdır.', 'Tarifin yetmediği, denemenin gerektiği söyleniyor.'],
  ['Eleştiriyi kişiliğimize saldırı sayarsak kendimizi savunmaya geçeriz. Onu yaptığımız işe dair bir bilgi olarak görürsek işimizi geliştirebiliriz.', 'Eleştiriye bakış biçimi ondan yararlanmayı belirler.', 'Eleştiri her zaman haksızdır.', 'Savunma en doğru tepkidir.', 'İş yapan eleştirilmez.', 'Kişilik değişmez.', 'İki bakış karşılaştırılıp yararlı olan gösteriliyor.'],
  ['Küçük bir dükkân sahibi her müşterisini adıyla tanır, neyi sevdiğini bilir. Büyük mağazaların indirimleri bu yakınlığın yerini her zaman tutamaz.', 'Küçük esnafın kurduğu yakın ilişki ayrı bir değerdir.', 'Büyük mağazalar kapatılmalıdır.', 'İndirimler yararsızdır.', 'Esnaf her şeyi ucuz satar.', 'Müşteriler adlarını söylemelidir.', 'Asıl vurgu yakınlığın yeri doldurulamaz değeridir.'],
  ['Gece lambasız bir köyde gökyüzüne bakan kişi binlerce yıldız görür. Aynı kişi şehirde birkaçını zor seçer. Yıldızlar azalmamış, ışığımız onları örtmüştür.', 'Yapay ışık gökyüzünü görmemizi engelliyor.', 'Şehirde yıldız yoktur.', 'Köyler daha kalabalıktır.', 'Yıldızlar her yıl azalır.', 'Lambalar yıldızları söndürür.', 'Son cümle asıl düşünceyi verir.'],
  ['Bir kitabı ikinci kez okuyan, ilkinde gözden kaçırdıklarını bulur. Kitap aynıdır; değişen, okurun birikimi ve baktığı yerdir.', 'Okurun değişmesi metinden alınanı değiştirir.', 'Kitaplar zamanla yeniden yazılır.', 'İlk okuma gereksizdir.', 'Her kitap iki kez okunmalıdır.', 'Birikim okumayı zorlaştırır.', 'Değişenin okur olduğu vurgulanıyor.'],
  ['Takım oyununda yalnız gol atan anılır. Oysa topu ona ulaştıran, savunmada açık vermeyen oyuncular olmasa o gol de olmazdı.', 'Görünen başarının arkasında ortak emek vardır.', 'Gol atmak en kolay iştir.', 'Savunma oyuncusu gereksizdir.', 'Her oyuncu gol atmalıdır.', 'Takım oyunları adil değildir.', '"Oysa" sonrasında asıl yargı geliyor.'],
];
const TOPIC: Choice[] = [
  ['Pek çok kuş yuvasını çalı çırpıdan örer. Kimi ağaç kovuğuna, kimi çamurdan yaptığı çanağa yumurtlar. Yuvanın biçimi türden türe değişir.', 'Kuşların Yuva Çeşitliliği', 'Kuşların Göçü', 'Ağaçların Yaşı', 'Yumurtanın Besin Değeri', 'Çalıların Budanması', 'Yuva türleri anlatılıyor.'],
  ['Tuz bir zamanlar zor bulunurdu. Besinleri bozulmadan saklamaya yaradığı için ticareti büyük önem taşırdı. Bazı yollar tuz taşımak için kullanılırdı.', 'Tuzun Geçmişteki Önemi', 'Yemeklerde Lezzet', 'Deniz Canlıları', 'Yol Yapım Teknikleri', 'Sağlıklı Beslenme', 'Tuzun tarihsel değeri anlatılıyor.'],
  ['Bisiklet yakıt tüketmez, az yer kaplar. Kısa mesafelerde trafiğe takılmadan ilerler. Kullananın da hareket etmesini sağlar.', 'Bisikletle Ulaşımın Yararları', 'Bisiklet Tamiri', 'Trafik Kuralları', 'Yakıt Fiyatları', 'Spor Salonları', 'Yararlar sıralanıyor.'],
  ['Masallar çoğu zaman “bir varmış, bir yokmuş” diye başlar. Yer ve zaman belirsizdir. Kahramanlar olağanüstü güçlerle karşılaşır, sonunda iyilik kazanır.', 'Masalların Ortak Özellikleri', 'Romanın Doğuşu', 'Çocuk Oyunları', 'Tarih Yazıcılığı', 'Kahramanlık Madalyaları', 'Masal özellikleri anlatılıyor.'],
  ['Kaktüs, yapraklarını dikene dönüştürerek su kaybını azaltır. Kalın gövdesinde su depolar. Kökleri az yağışı bile hızla emer.', 'Kaktüsün Kuraklığa Uyumu', 'Çöl Hayvanları', 'Saksı Seçimi', 'Yağmur Oluşumu', 'Dikenli Çiçek Satışı', 'Kuraklığa uyum özellikleri veriliyor.'],
  ['Radyo, görüntü olmadan sesle bir dünya kurar. Dinleyen kişi yüzleri ve yerleri hayalinde canlandırır. Bu yüzden herkesin zihnindeki sahne farklıdır.', 'Radyonun Hayal Gücüne Etkisi', 'Televizyonun Tarihi', 'Ses Kayıt Aygıtları', 'Haber Saatleri', 'Tiyatro Dekoru', 'Radyo ve hayal ilişkisi anlatılıyor.'],
];
const DETAIL: Choice[] = [
  ['Yeni yüzme havuzu hafta sonu açıldı. Havuz yıl boyu ısıtılacak. Yedi yaş altı çocuklar yetişkinle girebilecek. Kayıtlar internetten yapılıyor.', 'Havuzun derinliğine', 'Açılış zamanına', 'Isıtılacağına', 'Küçük çocuk kuralına', 'Kayıt yöntemine', 'Derinlik belirtilmiyor.'],
  ['Fidan dikimi okul bahçesinde yapıldı. Her sınıf bir ağaçtan sorumlu olacak. Fidanlar orman müdürlüğünden geldi. Sulama çizelgesi panoya asıldı.', 'Dikilen ağaçların türüne', 'Dikimin yerine', 'Sorumluluk paylaşımına', 'Fidanların kaynağına', 'Sulama düzenine', 'Parçada ağaçların türü hiç belirtilmiyor.'],
  ['Sergide yüz yıllık fotoğraflar yer alıyor. Fotoğrafların çoğu ailelerden ödünç alındı. Her karenin altında kısa bir açıklama var. Sergi bir ay sürecek.', 'Sergiye girişin ücretine', 'Fotoğrafların eskiliğine', 'Nereden sağlandığına', 'Açıklamalara', 'Serginin süresine', 'Ücretten söz edilmiyor.'],
  ['Yürüyüş yolu göl kıyısı boyunca uzanıyor. Zemini ahşapla kaplı. Her beş yüz metrede bir bank var. Yola bisikletle girilmiyor.', 'Yolun aydınlatmasına', 'Güzergâha', 'Zemin malzemesine', 'Bankların aralığına', 'Bisiklet yasağına', 'Parçada yolun aydınlatmasından söz edilmiyor.'],
  ['Aşevi her akşam sıcak yemek dağıtıyor. Malzemelerin bir bölümü bağışla karşılanıyor. Gönüllüler dönüşümlü çalışıyor. Yaşlılara yemek eve götürülüyor.', 'Günlük kaç kişiye yemek verildiğine', 'Dağıtım zamanına', 'Malzemenin kaynağına', 'Çalışma düzenine', 'Yaşlılara sağlanan hizmete', 'Kişi sayısı belirtilmiyor.'],
  ['Kurs on hafta sürecek. Dersler cumartesi sabahları yapılacak. Katılımcılar kendi dikiş makinesini getirmeyecek. Sonunda küçük bir sergi açılacak.', 'Eğitmenin kim olduğuna', 'Kursun süresine', 'Ders gününe', 'Makine getirme durumuna', 'Kurs sonu etkinliğine', 'Eğitmenden söz edilmiyor.'],
];
const INFERENCE: Choice[] = [
  ['Sabah masanın üstünde boş bir mama kabı, yerde de küçük pati izleri vardı.', 'Bir hayvan büyük olasılıkla mamayı yemiştir.', 'Evde hiç hayvan yoktur.', 'Mama kabı hiç doldurulmamıştır.', 'Yağmur eve girmiştir.', 'Kap yeni satın alınmıştır.', 'Boş kap ve pati izleri birlikte bunu gösterir.'],
  ['Dükkânın camında “Yarından itibaren yeni adresimizdeyiz” yazıyordu.', 'Dükkân taşınmaktadır.', 'Dükkân yarın indirim yapacaktır.', 'Dükkân yeni açılmıştır.', 'Sahibi tatildedir.', 'Cam temizlenmemiştir.', '“Yeni adres” taşınmayı gösterir.'],
  ['Ece sunum sırasında notlarına hiç bakmadan her soruyu örneklerle yanıtladı.', 'Ece konusuna iyi hazırlanmıştır.', 'Ece notlarını kaybetmiştir.', 'Sorular çok kolaydır.', 'Sunum ertelenmiştir.', 'Ece konuyu hiç bilmemektedir.', 'Notsuz ve örnekli yanıt hazırlığı gösterir.'],
  ['Otoparkta yer bulamayan Murat, ertesi hafta toplantıya yarım saat erken gitti.', 'Önceki sorunu yaşamamak için önlem almıştır.', 'Toplantı saati değişmiştir.', 'Murat arabasını satmıştır.', 'Otopark kapanmıştır.', 'Murat geç kalmayı sever.', 'Erken gidiş yaşanan soruna karşı önlemdir.'],
  ['Kütüphanede aynı kitabın beş kopyası da aylardır sırayla ödünç veriliyor.', 'Kitaba ilgi yüksektir.', 'Kitap hiç okunmamaktadır.', 'Kütüphane tek kitap bulundurur.', 'Kopyalar yıpranmamıştır.', 'Kitap satıştan kalkmıştır.', 'Sürekli ödünç alınması ilgiyi gösterir.'],
  ['Çiçekçi, sipariş defterine mayısın ikinci haftası için fazladan çalışan notu düşmüş.', 'O hafta yoğunluk beklemektedir.', 'Dükkân o hafta kapalı olacaktır.', 'Çiçekler solmuştur.', 'Çalışanlar işten ayrılacaktır.', 'Sipariş alınmayacaktır.', 'Ek personel yoğunluk beklentisidir.'],
];
const COMPLETION: Choice[] = [
  ['Haritaya bakmadan yola çıkan biri yolunu uzatabilir. ____ Plansız çalışmak da benzer biçimde zaman kaybettirir.', 'Çünkü nereye nasıl gideceğini yolda aramak zorunda kalır.', 'Oysa harita her zaman yanlıştır.', 'Bu yüzden yola çıkmamak gerekir.', 'Yolculuk her zaman eğlencelidir.', 'Haritalar renkli basılır.', '“Çünkü” uzamanın nedenini açıklar.'],
  ['Eski binaları korumak yalnızca duvarları ayakta tutmak değildir. ____ Böylece geçmişle bağımız sürer.', 'İçlerinde yaşanmış hayatların izini de saklamaktır.', 'Onları yıkıp yenisini yapmaktır.', 'Boyalarını sık sık değiştirmektir.', 'Kapılarını kilitli tutmaktır.', 'Yanlarına otopark yapmaktır.', '“De” ve “geçmişle bağ” bu cümleyi gerektirir.'],
  ['Çocuk bisiklete binmeyi düşe kalka öğrenir. ____ Yeter ki yeniden denemesine izin verilsin.', 'Her düşüş ona dengeyi biraz daha öğretir.', 'Bu yüzden bisiklet tehlikelidir ve yasaklanmalıdır.', 'Bisikletin rengi önemlidir.', 'Yetişkinler bisiklete binmez.', 'Denge doğuştan eksiksizdir.', 'Son cümle yeniden denemenin yararını destekler.'],
  ['İnternette bir bilgiye saniyeler içinde ulaşıyoruz. ____ Bu nedenle aramak kadar elemek de bir beceridir.', 'Ancak karşımıza çıkan her sonuç güvenilir değil.', 'Çünkü kitaplar artık basılmıyor.', 'Üstelik bütün bilgiler doğrulanmıştır.', 'Bu yüzden hiç arama yapmamalıyız.', 'Telefonlar küçülmüştür.', '“Elemek” güvenilmez sonuç gerektirir.'],
  ['Ağaçlar yazın gölge verir, kışın yaprak döker. ____ Böylece evler mevsime göre güneşten yararlanır.', 'Bu özellik, onları ev önüne dikmeyi akıllıca kılar.', 'Ancak ağaçlar hiç su istemez.', 'Bu yüzden her ağaç kesilmelidir.', 'Yapraklar her zaman sarıdır.', 'Gölge yalnız geceleri oluşur.', '“Böylece evler” ev önüne dikmeyi gerektirir.'],
  ['İyi bir soru sormak için konuyu biraz bilmek gerekir. ____ Bu yüzden soru, öğrenmenin hem başı hem sonucudur.', 'Öğrendikçe de sorularımız derinleşir.', 'Soru sormak bilgisizliktir.', 'Sorular her zaman aynıdır.', 'Bilgi soruları ortadan kaldırır ve merakı bitirir.', 'Yanıtlar hiç aranmaz.', '“Sonucu” öğrendikçe derinleşmeyi gerektirir.'],
];
const FLOW: [string, string, string, string, string][] = [
  ['Çay bitkisi nemli ve ılık iklimi sever.', 'Bu nedenle bol yağış alan yamaçlarda yetiştirilir.', 'Taze sürgünler belirli dönemlerde toplanır.', 'Toplanan yapraklar fabrikada işlenir.', 'Porselen fincan koleksiyonu yapanlar da vardır.'],
  ['Tiyatroda ışık yalnızca sahneyi aydınlatmaz.', 'Seyircinin nereye bakacağını yönlendirir.', 'Renk değişimleri duyguyu güçlendirir.', 'Karartma ise sahneler arasındaki geçişi sağlar.', 'Bilet gişeleri hafta sonu erken açılır.'],
  ['Kompost, mutfak artıklarının toprağa dönüşmesidir.', 'Sebze kabukları ve kuru yapraklar bir kapta biriktirilir.', 'Karışım ara sıra havalandırılır.', 'Birkaç ay sonra koyu renkli verimli bir gübre elde edilir.', 'Mutfak dolaplarının kapakları genellikle ahşaptır.'],
  ['Kütüphaneler sessiz çalışma alanı sunar.', 'Ödünç sistemi kitaba erişimi kolaylaştırır.', 'Çocuklar için hikâye saatleri düzenlenir.', 'Böylece her yaştan insan buradan yararlanır.', 'Kâğıt fiyatları döviz kuruna bağlıdır.'],
  ['Deniz kaplumbağaları yumurtalarını kumsala bırakır.', 'Yavrular genellikle gece yumurtadan çıkar.', 'Denizin parıltısına doğru yürür.', 'Kıyıdaki güçlü lambalar ise yönlerini şaşırtabilir.', 'Plaj şemsiyeleri çeşitli renklerde satılır.'],
  ['El yazısı her insanda farklıdır.', 'Harflerin eğimi ve aralığı kişiden kişiye değişir.', 'Kalemi tutuş biçimi de yazıyı etkiler.', 'Bu yüzden imzalar kimlik belirlemede kullanılır.', 'Kırtasiyeler okul açılışında kalabalıklaşır.'],
];
const STRUCTURE: [passage: string, answer: string][] = [
  ['Göl sabah sisinin altında gri bir ayna gibiydi. Kıyıda yosunlu bir kayık, ötede eğik söğüt dalları suya değiyordu.', 'Betimleme'],
  ['Postacı kapıyı iki kez çaldı. Nine terliklerini sürüyerek geldi, zarfı aldı, mutfak masasına oturup titreyen elleriyle açtı.', 'Öyküleme'],
  ['Delta, bir akarsuyun denize döküldüğü yerde taşıdığı malzemeyi biriktirmesiyle oluşan düzlüktür.', 'Açıklama'],
  ['Teknolojinin bizi yalnızlaştırdığı söylenir. Ben buna katılmıyorum; yalnızlaştıran araç değil, onu kullanma biçimimizdir.', 'Tartışma'],
  ['Odanın köşesinde oymalı bir dolap, üstünde sarı yapraklı bir saksı, duvarda çerçevesi solmuş bir resim duruyordu.', 'Betimleme'],
  ['Yağmur başlayınca çocuklar sahadan kaçtı. Can topu almak için döndü, ayağı kaydı ve gülerek çamura oturdu.', 'Öyküleme'],
];
const ORDER_SETS: [string, string, string, string][] = [
  ['Önce kütüphaneden konuyla ilgili üç kitap aldı.', 'Ardından bu kitaplardan notlar çıkardı.', 'Sonra notlarını başlıklar altında düzenledi.', 'En sonunda düzenlediği başlıklara göre raporunu yazdı.'],
  ['İlkbaharda ağacın dalları çiçeklerle doldu.', 'Bu çiçekler arılar sayesinde tozlaştı.', 'Tozlaşan çiçeklerin yerinde küçük meyveler belirdi.', 'Yaz sonunda o meyveler olgunlaşıp toplandı.'],
  ['Mahalledeki parkın bakımsız olduğu fark edildi.', 'Bunun üzerine komşular bir toplantı yaptı.', 'Toplantıda herkesin üstleneceği iş belirlendi.', 'Bu iş bölümü sayesinde park bir ayda yenilendi.'],
  ['Telefonun şarjı yolculuk sırasında bitti.', 'Bu yüzden Aslı haritaya bakamadı.', 'Haritaya bakamayınca yoldan geçen birine adresi sordu.', 'Aldığı tarifle sonunda aradığı sokağı buldu.'],
  ['Hamur için önce un ve su karıştırıldı.', 'Karışıma maya eklenip iyice yoğruldu.', 'Yoğrulan hamur kabarması için bekletildi.', 'Kabaran hamur son olarak fırına verildi.'],
  ['Genç yazar ilk öyküsünü bir dergiye gönderdi.', 'Dergi öyküyü bazı düzeltme önerileriyle geri yolladı.', 'Yazar bu önerileri dikkate alıp metni yeniden yazdı.', 'Yenilenen öykü bir sonraki sayıda yayımlandı.'],
];

export const BANK_2 = buildBatch(
  { main: MAIN, topic: TOPIC, detail: DETAIL, inference: INFERENCE, completion: COMPLETION, flow: FLOW, structure: STRUCTURE, order: ORDER_SETS },
  8,
);
