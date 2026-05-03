import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

export interface Attachment {
  id: string;
  file: string;
  file_name: string;
  file_size?: number;
  content_type?: string | number;
  object_id?: string;
  uploaded_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  created_at?: string;
}

interface AttachmentParams {
  model: string;       // e.g. 'property', 'tenant', 'lease', 'property-manager'
  record_id: string;
}

// Get attachments for a specific record
export const getAttachments = async ({ model, record_id }: AttachmentParams) => {
  const response = await api.get(`${API_BASE}/attachments/`, {
    params: { object_id: record_id },
  });
  const data = response.data.data || response.data;
  const items = Array.isArray(data) ? data : (data.results || data.items || []);
  // Derive file_name from URL if not provided
  return items.map((item: any) => ({
    ...item,
    file_name: item.file_name || decodeURIComponent(item.file?.split('/').pop()?.split('?')[0] || 'file'),
  }));
};

// Upload attachment for a specific record
export const uploadAttachment = async ({ model, record_id, file, attachment_type }: AttachmentParams & { file: File; attachment_type?: string }) => {
  const formData = new FormData();
  formData.append('model', model);
  formData.append('object_id', record_id);
  formData.append('file', file);
  if (attachment_type) formData.append('attachment_type', attachment_type);

  const response = await api.post(
    `${API_BASE}/attachments/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data.data || response.data;
};

// Delete an attachment
export const deleteAttachment = async ({ model, record_id, attachmentId }: AttachmentParams & { attachmentId: string }) => {
  await api.delete(`${API_BASE}/attachments/${model}/${record_id}/${attachmentId}/`);
  return { success: true };
};
