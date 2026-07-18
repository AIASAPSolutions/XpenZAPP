import { request } from './client';

/**
 * Uploads a receipt image for OCR parsing.
 * uri must be a local file:// URI (from expo-image-picker / camera).
 */
export const uploadReceipt = async (uri, projectId = null) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: 'receipt.jpg',
    type: 'image/jpeg',
  });
  if (projectId) {
    formData.append('project_id', String(projectId));
  }

  const res = await request('post', '/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { data: res.data };
};
