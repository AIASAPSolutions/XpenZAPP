import * as FileSystem from 'expo-file-system/legacy';

const MAX_BASE64_LENGTH = 900_000;

/**
 * Reads a local image URI and returns a base64 string (no data-URI prefix).
 */
export const uriToBase64 = async (uri) => {
  if (!uri) return null;
  if (uri.startsWith('data:')) {
    const comma = uri.indexOf(',');
    return comma >= 0 ? uri.slice(comma + 1) : uri;
  }
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

/**
 * Prepares a receipt image for OCR upload: base64 payload with optional size guard.
 * Image picker/camera quality should be ≤ 0.8 for compression at capture time.
 */
export const prepareReceiptForUpload = async (uri) => {
  const base64 = await uriToBase64(uri);
  if (!base64) {
    throw new Error('Could not read receipt image.');
  }
  if (base64.length > MAX_BASE64_LENGTH) {
    throw new Error('Receipt image is too large. Try a closer crop or lower resolution.');
  }
  return base64;
};

export default { uriToBase64, prepareReceiptForUpload };
