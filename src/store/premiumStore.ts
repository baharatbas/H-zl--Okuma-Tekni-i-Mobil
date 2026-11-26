import { create } from 'zustand';

/**
 * Premium üyelik durumu. Premium'a bağlı her şey (üstteki kart, kilitli alanlar) buradan okur.
 *
 * RevenueCat bağlanınca yapılacak tek şey: uygulama açılışında ve müşteri bilgisi her
 * değiştiğinde, ilgili yetki (entitlement) etkinse `setPremium(true)`, değilse `setPremium(false)`.
 * Değer burada saklanmaz; doğru kaynak mağaza / RevenueCat'tir.
 */
interface PremiumState {
  isPremium: boolean;
  setPremium: (value: boolean) => void;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  setPremium: (isPremium) => set({ isPremium }),
}));

export const useIsPremium = () => usePremiumStore((s) => s.isPremium);
