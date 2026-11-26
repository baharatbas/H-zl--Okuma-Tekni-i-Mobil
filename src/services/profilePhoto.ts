import * as ImagePicker from 'expo-image-picker';

export interface PickedPhoto {
  uri: string;
  mime: string;
  base64: string;
}

/**
 * Galeriden kare bir fotoğraf seçtirir. Veri base64 olarak alınır ve yalnızca cihazdaki
 * SQLite veritabanında saklanır. İptal edilirse null döner.
 */
export async function pickPhoto(): Promise<PickedPhoto | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.4, base64: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset.base64) throw new Error('Fotoğraf verisi alınamadı');
  return { uri: asset.uri, mime: asset.mimeType ?? 'image/jpeg', base64: asset.base64 };
}
