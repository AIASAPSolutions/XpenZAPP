import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';

const EXTENSION = { csv: 'csv', pdf: 'pdf', json: 'json' };
const MIME_TYPE = {
  csv: 'text/csv',
  pdf: 'application/pdf',
  json: 'application/json',
};

/**
 * Downloads a /export/{format} file to local cache and opens the native
 * share sheet so the user can save or send it. Returns the local file URI.
 */
export const downloadAndShareExport = async (format) => {
  const extension = EXTENSION[format];
  if (!extension) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const token = await SecureStore.getItemAsync('user_token');
  const destUri = `${FileSystem.cacheDirectory}xpenz-export-${Date.now()}.${extension}`;

  const result = await FileSystem.downloadAsync(
    `${CONFIG.BASE_URL}/export/${format}`,
    destUri,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Export request failed with status ${result.status}`);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.uri, { mimeType: MIME_TYPE[format] });
  }

  return result.uri;
};
