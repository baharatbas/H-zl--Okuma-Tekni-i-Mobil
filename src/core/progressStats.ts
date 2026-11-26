/** İlerleme ekranı için saf hesaplar: grafik ölçeği ve değişim. */

export interface Scale {
  min: number;
  max: number;
  ticks: number[];
}

/** Verileri kapsayan, yuvarlak sayılı 3 çizgilik (alt, orta, üst) ölçek. */
export function niceScale(values: number[], step = 50): Scale {
  if (values.length === 0) return { min: 0, max: step * 2, ticks: [0, step, step * 2] };
  const min = Math.max(0, Math.floor(Math.min(...values) / step) * step - step);
  let max = Math.ceil(Math.max(...values) / step) * step + step;
  // Orta çizgi de tam sayı olsun diye aralık çift sayıda adım olur.
  if (((max - min) / step) % 2 !== 0) max += step;
  return { min, max, ticks: [min, (min + max) / 2, max] };
}

/** İlk ve son ölçüm arasındaki fark. İkiden az ölçüm varsa null. */
export function change(values: number[]): number | null {
  if (values.length < 2) return null;
  return Math.round(values[values.length - 1] - values[0]);
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
