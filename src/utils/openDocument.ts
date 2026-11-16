import { Linking, Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

/**
 * `File.preview()` (Quick Look on iOS, a view intent on Android) ships with
 * expo-file-system 58 (Expo SDK 58). On older SDKs the method is missing, so it is
 * looked up at run time and the file is handed to the system by URL instead.
 */
type Previewable = File & {
  preview?: (options?: { title?: string; mimeType?: string }) => Promise<void>;
};

export type OpenStage = 'downloading' | 'opening';
/** `previewed`: shown by File.preview(). `external`: handed to the browser or another app. */
export type OpenResult = 'previewed' | 'external';

const safeName = (name: string) => name.replace(/[^\w.-]+/g, '_');

/**
 * Opens a PDF, Word document, text file or image. Downloads it to the cache once
 * (kept per content id), then shows it with the platform's file preview.
 */
export async function openDocument(
  doc: { id: string; url: string; fileName: string; title: string },
  onStage?: (stage: OpenStage) => void,
): Promise<OpenResult> {
  if (Platform.OS === 'web') {
    await Linking.openURL(doc.url);
    return 'external';
  }

  const folder = new Directory(Paths.cache, 'content');
  const file: Previewable = new File(folder, `${safeName(doc.id)}-${safeName(doc.fileName)}`);

  if (typeof file.preview !== 'function') {
    await Linking.openURL(doc.url);
    return 'external';
  }

  if (!file.exists) {
    onStage?.('downloading');
    folder.create({ intermediates: true, idempotent: true });
    try {
      await File.downloadFileAsync(doc.url, file);
    } catch (error) {
      // Do not leave a partial file behind to be "previewed" next time.
      if (file.exists) file.delete();
      throw error;
    }
  }

  onStage?.('opening');
  await file.preview({ title: doc.title });
  return 'previewed';
}
