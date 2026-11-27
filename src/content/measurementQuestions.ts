/**
 * Ölçüm metinlerine eklenen ikinci iki soru (her ölçüm metninde toplam 5 soru olsun diye).
 * Sorular yalnızca metnin kendisinden yanıtlanır; metin dışı bilgi gerektirmez.
 */
import type { BuiltinQuestion } from './builtinTexts';

export const MEASUREMENT_QUESTIONS: Record<string, BuiltinQuestion[]> = {
  'builtin-sea': [
    { question: 'Metnin asıl anlatmak istediği nedir?', options: ['Balıkçılığın tarihçesi', 'Dalgaların farklılıkları ve deniz kenarındaki gözlemler', 'Kumlu sahillerin temizliği', 'Açık denizde yüzme teknikleri'], correctIndex: 1 },
    { question: 'Metne göre deniz kenarında yaşayanlar dalga sesini neden uyku ilacı gibi bulur?', options: ['Ses çok yüksek olduğu için', 'Dalgalar hiç ses çıkarmadığı için', 'Beyin tekrarlayan sesleri zamanla arka plan olarak kabul ettiği için', 'Kulakları zor duyduğu için'], correctIndex: 2 },
  ],
  'builtin-garden': [
    { question: 'Bu parçanın ana konusu nedir?', options: ['Balkonda sebze yetiştirmenin mümkün olduğu ve nasıl yapılacağı', 'Büyük bahçelerin bakım masrafları', 'Sıcak iklim meyvelerinin tarihi', 'Saksı üretiminin ekonomisi'], correctIndex: 0 },
    { question: 'Metne göre domatesler ilk meyvelerini nasıl verir?', options: ['Gölgede ve hiç su vermeden', 'Yalnızca kışın', 'Güneş alan bir köşede, yeterli su ve düzenli gübreleme ile birkaç ay içinde', 'Hiç gübre almadan bir yılda'], correctIndex: 2 },
  ],
  'builtin-history': [
    { question: 'Metnin ana fikri hangisidir?', options: ['Ticaret yollarının yalnızca mal taşıyan araçlar olduğu', 'Eski ticaret yollarının mal, fikir ve kültürü taşıdığı ve modern yollara izler bıraktığı', 'Kervanların hızının artırıldığı', 'Köprülerin tarihte hiç onarılmadığı'], correctIndex: 1 },
    { question: 'Yolların bakımından kimler sorumluydu?', options: ['Yalnızca askerler', 'Yolcuların her biri tek başına', 'Hiç kimse sorumlu değildi', 'Yerel yönetimler ve tüccar birlikleri'], correctIndex: 3 },
  ],
  'builtin-music': [
    { question: 'Metnin ana düşüncesi hangisidir?', options: ['Halk müziğinin çalgı yapımı', 'Halk müziğinin nesiller arası taşınan ve ortak hafıza oluşturan bir miras olduğu', 'Düğünlerin tarihi', 'Notaların keşfi'], correctIndex: 1 },
    { question: 'Metinde hangi çalgılar anılıyor?', options: ['Piyano ve keman', 'Flüt ve gitar', 'Org ve trompet', 'Bağlama, kaval ve davul'], correctIndex: 3 },
  ],
  'builtin-chess': [
    { question: 'Metnin ana fikri nedir?', options: ['Satrancın spor olarak tarihi', 'Satrancın temel kuralları ile eğitsel değerinin birlikte anlatılması', 'Tahtanın nasıl yapıldığı', 'Ülkeler arası turnuvalar'], correctIndex: 1 },
    { question: 'Açılış hamlelerinin genel odağı nedir?', options: ['Taşları kenara çekmek', 'Rakibi beklemek', 'Şahı hemen tehdit etmek', 'Merkezi kontrol etmek'], correctIndex: 3 },
  ],
  'builtin-bread': [
    { question: 'Metnin ana düşüncesi nedir?', options: ['Ekmek fabrikalarının çalışma düzeni', 'Basit malzemelerle yapılan ekmeğin sabır ve emek gerektirdiği', 'Hamurun satış fiyatları', 'Fırın ısısının ölçümü'], correctIndex: 1 },
    { question: 'Hamur fırına verilmeden önce ne yapılır?', options: ['Hemen pişirilir', 'Dondurulur', 'Bir süre yeniden dinlendirilir', 'Tuzu eklenir'], correctIndex: 2 },
  ],
};
