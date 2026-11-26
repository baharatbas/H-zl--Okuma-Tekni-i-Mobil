export type GreetingKey = 'morning' | 'day' | 'evening';

/** Saate göre selamlama: 05–11 sabah, 11–18 gündüz, diğer saatler akşam. */
export function greetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'day';
  return 'evening';
}
