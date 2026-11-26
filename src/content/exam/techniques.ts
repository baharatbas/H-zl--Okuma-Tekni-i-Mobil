import type { QuestionType } from '../../core/exam/types';

export interface Technique {
  title: string;
  /** Soru tipinin ne istediği. */
  goal: string;
  steps: string[];
  trap: string;
  icon: string;
  color: string;
}

export const TECHNIQUES: Record<QuestionType, Technique> = {
  main: {
    title: 'Ana düşünce',
    goal: 'Yazarın bütün paragrafla anlatmak istediği yargıyı bulmak.',
    steps: ['Soru kökünü oku ve aradığının "asıl mesaj" olduğunu aklında tut.', 'İlk ve son cümleye dikkat et; "oysa, bu yüzden, kısacası" gibi geçişleri izle.', 'Şıkları ele: paragrafın yalnızca bir bölümünü söyleyen şık ana düşünce değildir.'],
    trap: 'Paragrafta geçen ama yalnızca örnek olan bir bilgiyi ana düşünce sanma.',
    icon: 'flag-outline',
    color: '#2F6FAE',
  },
  topic: {
    title: 'Konu ve başlık',
    goal: 'Paragrafın neden söz ettiğini ya da ona en uygun başlığı bulmak.',
    steps: ['"Bu paragraf kimden veya neden söz ediyor?" diye sor.', 'Tekrar eden kavramı işaretle.', 'Çok geniş ve çok dar başlıkları ele.'],
    trap: 'İlk cümlede geçen sözcüğü hemen başlık sanma; paragraf başka yöne dönebilir.',
    icon: 'pricetag-outline',
    color: '#2A8C8C',
  },
  detail: {
    title: 'Yardımcı düşünce',
    goal: 'Paragrafta söylenen ve söylenmeyen bilgileri ayırmak.',
    steps: ['Soru kökündeki olumsuzluğu ("değinilmemiştir", "çıkarılamaz") fark et.', 'Önce şıkları oku, sonra paragrafta tek tek ara.', 'Metinde karşılığını gösteremediğin şıkkı işaretle.'],
    trap: 'Günlük bilginle doğru olan bir şık, paragrafta yoksa yine "yok" sayılır.',
    icon: 'search-outline',
    color: '#B8703A',
  },
  inference: {
    title: 'Çıkarım',
    goal: 'Açıkça yazılmayan ama paragraftan zorunlu olarak çıkan yargıyı bulmak.',
    steps: ['Paragrafın tamamını oku; bu tipte atlayarak okumak yanıltır.', 'Her şık için "Metnin hangi cümlesi bunu destekliyor?" diye sor.', '"Her zaman, asla, yalnızca" gibi kesin sözcüklere şüpheyle bak.'],
    trap: 'Mantıklı görünen ama metinde dayanağı olmayan yorum.',
    icon: 'bulb-outline',
    color: '#7A5A9E',
  },
  completion: {
    title: 'Paragraf tamamlama',
    goal: 'Boşluğa anlam akışını sürdüren cümleyi yerleştirmek.',
    steps: ['Boşluktan önceki ve sonraki cümleyi dikkatle oku.', 'Bağlaçlara bak: "ancak" karşıtlık, "çünkü" neden ister.', 'Seçtiğin cümleyi yerine koyup paragrafı bir kez akıt.'],
    trap: 'Konuyla ilgili olup akışın yönünü tersine çeviren cümle.',
    icon: 'create-outline',
    color: '#2E8B7A',
  },
  flow: {
    title: 'Akışı bozan cümle',
    goal: 'Paragrafın konusundan ya da bakış açısından ayrılan cümleyi bulmak.',
    steps: ['İlk iki cümleyle konuyu ve yönü belirle.', 'Her cümleyi bir öncekine bağla: aynı şeyden mi söz ediyor?', 'Çıkardığında paragraf pürüzsüz akan cümleyi seç.'],
    trap: 'Aynı sözcükleri kullanıp başka bir konuya geçen cümle.',
    icon: 'git-branch-outline',
    color: '#A4557A',
  },
  structure: {
    title: 'Anlatım biçimi',
    goal: 'Yazarın açıklama, öyküleme, betimleme ya da tartışmadan hangisini kullandığını anlamak.',
    steps: ['Açıklama bilgi verir; öyküleme olay ve zaman akışı taşır.', 'Betimleme duyularla resim çizer; tartışma bir görüşü savunup karşıtını çürütür.', 'Paragrafta baskın olanı seç.'],
    trap: 'Tek bir cümleye bakıp bütün paragrafın biçimine karar verme.',
    icon: 'color-palette-outline',
    color: '#4A5BA8',
  },
  order: {
    title: 'Cümle sıralama',
    goal: 'Karışık cümleleri anlamlı bir paragraf hâline getirmek.',
    steps: ['Giriş cümlesi "bu, o, çünkü, ayrıca" ile başlamaz.', 'Birbirini gerektiren çiftleri bul.', 'Şıkları bu çiftlere göre ele.'],
    trap: 'İlk bulduğun mantıklı başlangıca takılıp diğer bağlantıları denememek.',
    icon: 'swap-vertical-outline',
    color: '#3D8B5A',
  },
};
