import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';
import { useExpenseStore } from '../store/expenseStore';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Downloads the active project's Excel export (/export/projects/{id}/export/excel)
 * to local cache and opens the native share sheet. Returns the local file URI.
 */
export const downloadAndShareExport = async (projectId = useExpenseStore.getState().activeProjectId) => {
  if (!projectId) {
    throw new Error('No project available to export');
  }

  const token = await SecureStore.getItemAsync('user_token');
  const destUri = `${FileSystem.cacheDirectory}xpenz-export-${Date.now()}.xlsx`;

  const result = await FileSystem.downloadAsync(
    `${CONFIG.BASE_URL}/export/projects/${projectId}/export/excel`,
    destUri,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Export request failed with status ${result.status}`);
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(result.uri, { mimeType: XLSX_MIME });
  }

  return result.uri;
};
